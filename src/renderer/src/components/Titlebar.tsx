import { useContext } from "react";
import icon from "../img/icon.ico";
import { Context } from "../util/Context";
import {
    closeWindow,
    maximizeWindow,
    minimizeWindow,
} from "../../../../src/shared/util/Window";
const { ipcRenderer } = window.require("electron");

export default function Titlebar() {
    const context = useContext(Context);
    return (
        <div className="titlebar">
            <img src={icon} className="titlebar-icon" />
            <div className="titlebar-text">{context.state?.title}</div>
            <div className="titlebar-buttons">
                <div onClick={minimizeWindow} />
                <div onClick={maximizeWindow} />
                <div onClick={closeWindow} />
            </div>
        </div>
    );
}
