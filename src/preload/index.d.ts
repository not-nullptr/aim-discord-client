import { ElectronAPI } from "@electron-toolkit/preload";

declare global {
    interface Window {
        electronAPI: ElectronAPI & {
            sendNotification: (
                options: Electron.NotificationConstructorOptions
            ) => void;
            setWindowSize: (width: number, height: number) => void;
        };
    }
}
