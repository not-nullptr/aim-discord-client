import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
    sendNotification: (options) =>
        ipcRenderer.send("send-notification", options),
    convertToIco: (icon) => ipcRenderer.invoke("convert-to-ico", icon),
});
