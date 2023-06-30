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

let win: BrowserWindow | null;
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x

function createWindow() {
    console.log(path.join(__dirname, "/resources/favicon.ico"));
    win = new BrowserWindow({
        width: 216,
        height: 394,
        // width: 1000,
        // height: 800,
        frame: false,
        icon: path.join(__dirname, "/resources/favicon.ico"),
        // resizable: false,
        webPreferences: {
            preload: path.join(__dirname, "../preload/index.js"),
            nodeIntegration: true,
        },
    });
    win.webContents.openDevTools();
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
        async (event, options: Electron.NotificationConstructorOptions) => {
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
    ipcMain.handle(
        "convert-to-ico",
        async (event, icon: string): Promise<Electron.NativeImage> => {
            return await sharp(await (await fetch(icon)).arrayBuffer())
                .resize(256, 256)
                .png()
                .toBuffer()
                .then((data) => {
                    return nativeImage.createFromBuffer(data);
                });
        }
    );
    if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
        win.loadURL(process.env["ELECTRON_RENDERER_URL"]);
    } else {
        win.loadFile(join(__dirname, "../renderer/index.html"));
    }
}

app.on("window-all-closed", () => {
    win = null;
});

app.whenReady().then(createWindow);
