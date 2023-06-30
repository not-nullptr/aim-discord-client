import { createContext } from "react";
import { IContext } from "../../../shared/types/State";
import { IpcRenderer } from "electron";
const { ipcRenderer }: { ipcRenderer: IpcRenderer } =
    window.require("electron");

export const Context = createContext<IContext>({} as IContext);
