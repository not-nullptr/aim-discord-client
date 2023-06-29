import { useContext } from "react";
import icon from "../img/icon.ico";
import { Context } from "../util/Context";

export default function Titlebar() {
    const context = useContext(Context);
    return (
        <div className="titlebar">
            <img src={icon} className="titlebar-icon" />
            <div className="titlebar-text">{context.state.title}</div>
            <div className="titlebar-buttons">
                <div />
                <div />
                <div />
            </div>
        </div>
    );
}
