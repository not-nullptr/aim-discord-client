import splash from "../img/splash.png";
import "../css/Loading.css";
import Divider from "@renderer/components/Divider";
import { useEffect } from "react";
import { useContext } from "react";
import { Context } from "@renderer/util/Context";
import {
    closeWindow,
    redirectWindowsByPath,
} from "../../../../src/shared/util/Window";

export default function Loading() {
    const { state, setState } = useContext(Context);
    useEffect(() => {
        setState({
            ...state,
            title: `Sign On`,
        });
    }, []);
    useEffect(() => {
        if (state.initialReady) {
            setState({
                ...state,
                title: `Welcome, ${state.initialReady.user.username}`,
            });
            redirectWindowsByPath("", "/home");
            closeWindow();
        }
    }, [state.initialReady]);
    return (
        <div>
            <div className="splash">
                <img src={splash} />
            </div>
            <Divider
                style={{
                    marginTop: 3,
                    marginBottom: 3,
                    width: "calc(100% - 12px)",
                    margin: "auto",
                }}
            />
            <div className="loading-content">
                <div>
                    {Buffer.from(state.token?.split(".")[0], "base64").toString(
                        "utf-8"
                    )}
                </div>
                <div>
                    {!state.initialReady?.user.username
                        ? "Connecting to gateway..."
                        : `Connected to gateway! Welcome, ${state.initialReady?.user.username}.`}
                </div>
            </div>
        </div>
    );
}
