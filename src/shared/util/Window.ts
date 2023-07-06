import { State } from "../types/State";

const { ipcRenderer } = require("electron");

export enum Icon {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
}

export function sendNotification(
    options: Electron.NotificationConstructorOptions
) {
    ipcRenderer.send("send-notification", options);
}

export function getDebugToken(): string {
    return ipcRenderer.sendSync("get-debug-token");
}

export function startGateway(token: string) {
    ipcRenderer.send("start-gateway", token);
}

export function setGatewayState(newState: State) {
    ipcRenderer.send("set-state", newState);
}

export function createWindow(
    url: string,
    width?: number,
    height?: number,
    resizable: boolean = true,
    checkForDupes: boolean = true
) {
    ipcRenderer.send(
        "create-window",
        url,
        width,
        height,
        resizable,
        checkForDupes
    );
}

export function getState(): State {
    return ipcRenderer.sendSync("get-state");
}

export function closeWindow() {
    ipcRenderer.send("close-window");
}

export function closeWindowsByPath(path: string) {
    ipcRenderer.send("close-windows-by-path", path);
}

export function redirectWindowsByPath(origPath: string, destPath: string) {
    ipcRenderer.send("redirect-windows-by-path", origPath, destPath);
}

export function maximizeWindow() {
    ipcRenderer.send("maximize-window");
}

export function minimizeWindow() {
    ipcRenderer.send("minimize-window");
}

export function setWindowSize(width: number, height: number) {
    ipcRenderer.send("set-window-size", width, height);
}
