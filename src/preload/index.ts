import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
    sendNotification: (options) =>
        ipcRenderer.send("send-notification", options),
    setWindowSize: (width: number, height: number) =>
        ipcRenderer.send("set-window-size", width, height),
});
