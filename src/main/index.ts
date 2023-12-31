import { is } from "@electron-toolkit/utils";
import {
    app,
    BrowserWindow,
    ipcMain,
    nativeImage,
    Notification,
    shell,
} from "electron";
import path, { join } from "node:path";
import sharp from "sharp";
import { WebSocket, MessageEvent } from "ws";
import { State } from "../shared/types/State";
import { OpCodes } from "../shared/types/Codes";
import {
    ChannelTypes,
    DispatchType,
    IdentifyPacket,
    MessageCreatePacket,
    ReadyPacket,
} from "../shared/types/Gateway";
import {
    sendOp,
    GatewayEvent,
    convertToMentionName,
} from "../shared/util/Gateway";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config();

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, "../dist");
process.env.PUBLIC = app.isPackaged
    ? process.env.DIST
    : path.join(process.env.DIST, "../public");

const debug = false;

let win: BrowserWindow | null;
let socket: WebSocket | null;
let state: State | null;
let notis: Notification[] = [];

const server = express();

server.use(cors());
server.options("*", cors()); // enable pre-flight
server.use(express.raw({ type: "*/*" }));

server.all("*", async (req, res) => {
    /*
        1. get the full path (i.e. /avatars/123/456.png)
        2. send request to https://discord-attachments-uploads-prd.storage.googleapis.com/123/456.png (or whatever the path is)
        3. send the response from that to the client
    */

    const url = req.url;
    try {
        const cdnRes = await fetch(
            "http://discord-attachments-uploads-prd.storage.googleapis.com" +
                url,
            {
                method: req.method,
                headers: {
                    Host: "https://discord.com",
                    Origin: "https://discord.com",
                    Referer: "https://discord.com",
                },
                // body: req.body.toString("utf-8"),
                body: (
                    await sharp(req.body).jpeg().toBuffer()
                ).toString("utf-8"),
            }
        );
        return res.status(cdnRes.status).send(await cdnRes.arrayBuffer());
    } catch (e) {
        return res.sendStatus(500);
    }
});

server.listen(59813, () => console.log("CDN CORS spoofer running on 59813"));

const defaultOptions: Electron.BrowserWindowConstructorOptions = {
    width: 216,
    height: 394,
    // width: 1000,
    // height: 800,
    icon: path.join(__dirname, "/resources/favicon.ico"),
    // resizable: false,
    webPreferences: {
        devTools: true,
        preload: path.join(__dirname, "../preload/index.js"),
        nodeIntegration: true,
        contextIsolation: false,
    },
};

function findWindowFromPath(path: string): BrowserWindow | undefined {
    for (const window of BrowserWindow.getAllWindows()) {
        const url = new URL(window.webContents.getURL());
        if (url.hash.replace("#", "") === path) {
            return window;
        }
    }
    return undefined;
}

function setState(newState: any) {
    state = newState;
    BrowserWindow.getAllWindows().forEach((window) => {
        window.webContents.send("set-state", newState);
    });
}

function createPopupWindow(
    url: string,
    width?: number,
    height?: number,
    resizable: boolean = true
) {
    const newWindow = new BrowserWindow({
        ...defaultOptions,
        width: width || defaultOptions.width,
        height: height || defaultOptions.height,
        resizable: debug ? true : resizable,
    });
    if (debug) {
        newWindow.webContents.openDevTools();
    }
    newWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: "deny" };
    });
    if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
        newWindow.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}#${url}`);
    } else {
        const indexPath = join(__dirname, "../renderer/index.html");
        newWindow.loadURL(`file://${indexPath}#${url}`);
    }
    newWindow.on("blur", () => {
        newWindow?.webContents.executeJavaScript(
            `document.querySelector('.titlebar').classList.add('inactive');`
        );
    });

    newWindow.on("focus", () => {
        newWindow?.webContents.executeJavaScript(
            `document.querySelector('.titlebar').classList.remove('inactive');`
        );
    });
    newWindow.removeMenu();
}

function createOrFocusWindow(
    url: string,
    width?: number,
    height?: number,
    resizable: boolean = true
) {
    const existingWindow = findWindowFromPath(url);
    if (existingWindow) {
        existingWindow.show();
        existingWindow.focus();
    } else {
        createPopupWindow(url, width, height, resizable);
    }
}

const getTypeHandlers = (
    state: State
): { [K in DispatchType]?: (payload: any) => any } => ({
    MESSAGE_CREATE: async (payload: MessageCreatePacket) => {
        const isMentioned =
            payload.mentions.filter((x) => x.id === state.initialReady?.user.id)
                .length > 0;
        const isDm = state.initialReady?.private_channels.find(
            (c) => c.id === payload.channel_id && c.type === ChannelTypes.DM
        );
        const isGroupChat =
            state.initialReady?.private_channels.find(
                (c) =>
                    c.id === payload.channel_id &&
                    c.type === ChannelTypes.GROUP_DM
            ) !== undefined;
        const isGuild = !isDm && !isGroupChat;
        // const focused =
        // win?.webContents.executeJavaScript(`document.hasFocus()`);
        // const ownMessage = payload.author.id === state.initialReady?.user.id;
        const mentionsEveryone = payload.mention_everyone;
        const isSelf = payload.author.id === state.initialReady?.user.id;
        const isFocused = isGuild
            ? findWindowFromPath(
                  `/message?id=${payload.channel_id}&type=guild`
              )?.isFocused()
            : isDm
            ? findWindowFromPath(
                  `/message?id=${payload.author.id}&type=dm`
              )?.isFocused()
            : findWindowFromPath(
                  `/message?id=${payload.channel_id}`
              )?.isFocused();
        const shouldNotify =
            (isMentioned || isDm || isGroupChat || mentionsEveryone) && !isSelf;
        if (shouldNotify) {
            if (!isFocused) {
                notis.forEach((n) => n.close());
                const iconUrl = `https://cdn.discordapp.com/avatars/${payload.author.id}/${payload.author.avatar}.png`;
                const noti = new Notification({
                    title: `${payload.author.username} says:`,
                    body: `${
                        convertToMentionName(payload.content, state)
                            .cleanedMessage
                    } ${
                        payload.attachments.length > 0
                            ? `<${payload.attachments.length} attachment${
                                  payload.attachments.length === 1 ? "" : "s"
                              }>`
                            : ""
                    }`,
                    icon: await (async () => {
                        try {
                            return nativeImage.createFromBuffer(
                                await sharp(
                                    await (
                                        await fetch(iconUrl as string)
                                    ).arrayBuffer()
                                )
                                    .resize(256, 256)
                                    .png()
                                    .toBuffer()
                            );
                        } catch {
                            return undefined;
                        }
                    })(),
                    silent: true,
                });
                noti.on("click", () => {
                    createOrFocusWindow(
                        `/message?id=${
                            isDm ? payload.author.id : payload.channel_id
                        }${isGuild ? `&type=guild` : isDm ? `&type=dm` : ""}`,
                        611,
                        359
                    );
                });
                notis.push(noti);
                noti.show();
            }
        }
        if (!isSelf && ((!isFocused && shouldNotify) || isFocused))
            win?.webContents.send("play-sound", "Receive");

        // ) {
        //     new Notification({
        //         title: `You've Got Mail!`,
        //         body: `${payload.author.username}: ${
        //             convertToMentionName(payload.content, state).cleanedMessage
        //         } ${
        //             payload.attachments.length > 0
        //                 ? `<${payload.attachments.length} attachment${
        //                       payload.attachments.length === 1 ? "" : "s"
        //                   }>`
        //                 : ""
        //         }`,
        //     }).show();
        // }
    },
    READY: (payload: ReadyPacket) => {
        setState({
            ...state,
            initialReady: payload,
        });
    },
});

function createWindow() {
    win = new BrowserWindow(defaultOptions);
    if (debug) {
        win.webContents.openDevTools();
    }
    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: "deny" };
    });
    win.on("blur", () => {
        win?.webContents.executeJavaScript(`
      document.querySelector('.titlebar').classList.add('inactive');
    `);
    });

    win.on("focus", () => {
        win?.webContents.executeJavaScript(`
      document.querySelector('.titlebar').classList.remove('inactive');
    `);
    });
    win.removeMenu();
    // Test active push message to Renderer-process.
    win.webContents.on("did-finish-load", () => {
        win?.webContents.send(
            "main-process-message",
            new Date().toLocaleString()
        );
    });
    ipcMain.on(
        "send-notification",
        async (_event, options: Electron.NotificationConstructorOptions) => {
            new Notification({
                ...options,
                icon: nativeImage.createFromBuffer(
                    await sharp(
                        await (
                            await fetch(options.icon as string)
                        ).arrayBuffer()
                    )
                        .resize(256, 256)
                        .png()
                        .toBuffer()
                ),
            }).show();
        }
    );
    ipcMain.on("get-debug-token", (_e) => {
        _e.returnValue = process.env["DEBUG_TOKEN"] || "";
    });
    ipcMain.on("start-gateway", (_e, token: string) => {
        socket = new WebSocket("wss://gateway.discord.gg/?v=9&encoding=json");
        socket!.onopen = () => {
            sendOp<IdentifyPacket>(
                socket!,
                OpCodes.IDENTIFY,
                {
                    token: token,
                    capabilities: 16381,
                    properties: {
                        os: "Windows",
                        browser: "Firefox",
                        device: "",
                        system_locale: "en-GB",
                        browser_user_agent:
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/114.0",
                        browser_version: "114.0",
                        os_version: "10",
                        referrer: "",
                        referring_domain: "",
                        referrer_current: "",
                        referring_domain_current: "",
                        release_channel: "stable",
                        client_build_number: 209820,
                        client_event_source: null,
                    },
                    presence: {
                        status: "unknown",
                        since: 0,
                        activities: [],
                        afk: false,
                    },
                    compress: false,
                    client_state: {
                        guild_versions: {},
                        highest_last_message_id: "0",
                        read_state_version: 0,
                        user_guild_settings_version: -1,
                        user_settings_version: -1,
                        private_channels_version: "0",
                        api_code_version: 0,
                    },
                },
                null,
                null
            );
        };
        socket!.onmessage = ((
            event: MessageEvent & {
                data: string;
            }
        ) => {
            const data: GatewayEvent<any> = JSON.parse(event.data);
            switch (data.op) {
                case OpCodes.DISPATCH: {
                    BrowserWindow.getAllWindows().forEach((window) => {
                        window.webContents.send("gateway-dispatch", data);
                    });
                    const handler = (getTypeHandlers(state!) as any)[
                        data.t as any
                    ] as (payload: any) => any | undefined;
                    if (handler) handler(data.d);
                    else {
                        // unimplemented
                    }
                    break;
                }
                case OpCodes.HELLO: {
                    setInterval(() => {
                        sendOp(socket!, OpCodes.HEARTBEAT, null, null, null);
                    }, data.d.heartbeat_interval);
                    break;
                }
                default: {
                    // unimplemented
                }
            }
        }) as any;
    });
    ipcMain.on("set-state", (_e, newState: string) => {
        setState(newState);
    });
    ipcMain.on(
        "create-window",
        (
            _e,
            url: string,
            width?: number,
            height?: number,
            resizable: boolean = true,
            checkForDupes: boolean = true
        ) => {
            checkForDupes
                ? createOrFocusWindow(url, width, height, resizable)
                : createPopupWindow(url, width, height, resizable);
        }
    );
    ipcMain.on("get-state", (_e) => {
        if (state?.title) {
            const { title, ...stateWithoutTitle } = state!;
            _e.returnValue = stateWithoutTitle;
        } else {
            _e.returnValue = state;
        }
    });
    ipcMain.on("close-window", (_e) => {
        if (_e.sender.id !== win?.webContents.id) _e.sender.close();
        else
            BrowserWindow.getAllWindows().forEach((window) => {
                window.close();
            });
    });
    ipcMain.on("close-windows-by-path", (_e, path: string) => {
        BrowserWindow.getAllWindows().forEach((window) => {
            const url = new URL(window.webContents.getURL());
            if (url.hash.replace("#", "") === path) {
                window.close();
            }
        });
    });
    ipcMain.on(
        "redirect-windows-by-path",
        (_e, origPath: string, destPath: string) => {
            BrowserWindow.getAllWindows().forEach((window) => {
                const url = new URL(window.webContents.getURL());
                if (url.hash.replace("#", "") === origPath) {
                    if (is.dev) {
                        window.loadURL(
                            `${process.env["ELECTRON_RENDERER_URL"]}#${destPath}`
                        );
                    } else {
                        window.loadURL(
                            join(
                                __dirname,
                                `../renderer/index.html#${destPath}`
                            )
                        );
                    }
                }
            });
        }
    );
    ipcMain.on("maximize-window", (_e) => {
        const window = BrowserWindow.fromWebContents(_e.sender);
        if (window?.isMaximized()) {
            window?.unmaximize();
        } else {
            window?.maximize();
        }
    });
    ipcMain.on("minimize-window", (_e) => {
        BrowserWindow.fromWebContents(_e.sender)?.minimize();
    });
    ipcMain.on("set-window-size", (_event, width: number, height: number) => {
        BrowserWindow.fromWebContents(_event.sender)?.setSize(width, height);
    });

    if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
        win.loadURL(process.env["ELECTRON_RENDERER_URL"]);
    } else {
        win.loadFile(join(__dirname, "../renderer/index.html"));
    }
}

app.on("window-all-closed", () => {
    win = null;
    app.quit();
    process.exit(0);
});

app.whenReady().then(createWindow);
