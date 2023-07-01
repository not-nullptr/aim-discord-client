import { is } from "@electron-toolkit/utils";
import {
    app,
    BrowserWindow,
    ipcMain,
    nativeImage,
    Notification,
} from "electron";
import path, { join } from "node:path";
import sharp from "sharp";
import { WebSocket, MessageEvent } from "ws";
import { State } from "../shared/types/State";
import { OpCodes } from "../shared/types/Codes";
import {
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
let windows: {
    id: number;
    isMain: boolean;
}[] = [];

function setState(newState: any) {
    state = newState;
    // TODO: in future, we'll have an array of windows for popups and the like.
    // windows.forEach((window) => {
    //     BrowserWindow.fromId(window.id)!.webContents.send(
    //         "set-state",
    //         newState
    //     );
    // });
    BrowserWindow.getAllWindows().forEach((window) => {
        window.webContents.send("set-state", newState);
    });
}

const getTypeHandlers = (
    state: State
): { [K in DispatchType]?: (payload: any) => any } => ({
    MESSAGE_CREATE: async (payload: MessageCreatePacket) => {
        const isMentioned =
            payload.mentions.filter((x) => x.id === state.initialReady?.user.id)
                .length > 0;
        const dmOrGroupChat =
            state.initialReady?.private_channels.find(
                (c) => c.id === payload.channel_id
            ) !== undefined;
        // const focused =
        // win?.webContents.executeJavaScript(`document.hasFocus()`);
        // const ownMessage = payload.author.id === state.initialReady?.user.id;
        const mentionsEveryone = payload.mention_everyone;
        const isSelf = payload.author.id === state.initialReady?.user.id;
        if ((isMentioned || dmOrGroupChat || mentionsEveryone) && !isSelf) {
            const iconUrl = `https://cdn.discordapp.com/avatars/${payload.author.id}/${payload.author.avatar}.png`;
            new Notification({
                title: `${payload.author.username} says:`,
                body: `${
                    convertToMentionName(payload.content, state).cleanedMessage
                } ${
                    payload.attachments.length > 0
                        ? `<${payload.attachments.length} attachment${
                              payload.attachments.length === 1 ? "" : "s"
                          }>`
                        : ""
                }`,
                icon: nativeImage.createFromBuffer(
                    await sharp(
                        await (await fetch(iconUrl as string)).arrayBuffer()
                    )
                        .resize(256, 256)
                        .png()
                        .toBuffer()
                ),
                silent: true,
            }).show();
            win?.webContents.send("play-sound", "Receive");
        }
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

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x

const defaultOptions: Electron.BrowserWindowConstructorOptions = {
    width: 216,
    height: 394,
    // width: 1000,
    // height: 800,
    frame: false,
    icon: path.join(__dirname, "/resources/favicon.ico"),
    // resizable: false,
    webPreferences: {
        devTools: true,
        preload: path.join(__dirname, "../preload/index.js"),
        nodeIntegration: true,
        contextIsolation: false,
    },
};

function createWindow() {
    console.log(path.join(__dirname, "/resources/favicon.ico"));
    win = new BrowserWindow(defaultOptions);
    windows.push({
        id: win.id,
        isMain: true,
    });
    if (debug) {
        win.webContents.openDevTools();
    }
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
            resizable: boolean = true
        ) => {
            const newWindow = new BrowserWindow({
                ...defaultOptions,
                width: width || defaultOptions.width,
                height: height || defaultOptions.height,
                resizable: debug ? true : resizable,
            });
            if (debug) {
                newWindow.webContents.openDevTools();
            }
            // open on index.html
            if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
                newWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
            } else {
                newWindow.loadFile(join(__dirname, "../renderer/index.html"));
            }
            newWindow.webContents.on("did-finish-load", () => {
                newWindow.webContents.send("go-to-route", url);
            });
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
    // ipcMain.handle(
    //     "convert-to-ico",
    //     async (event, icon: string): Promise<Electron.NativeImage> => {
    //         return await sharp(await (await fetch(icon)).arrayBuffer())
    //             .resize(256, 256)
    //             .png()
    //             .toBuffer()
    //             .then((data) => {
    //                 return nativeImage.createFromBuffer(data);
    //             });
    //     }
    // );
    ipcMain.on("set-window-size", (_event, width: number, height: number) => {
        BrowserWindow.fromWebContents(_event.sender)?.setSize(width, height);
    });

    ipcMain.on("is-main-window", (_event) => {});

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
