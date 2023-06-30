import { useContext, useEffect } from "react";
import { Context } from "../util/Context";
import "../css/Login.css";
import WebSocketContext from "../util/WebsocketContext";

export default function Home() {
    const { state, setState } = useContext(Context);
    const ws = useContext(WebSocketContext);
    useEffect(() => {
        setState({
            ...state,
            title: "Sign On",
        });
    }, []);
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
            }}
        ></div>
    );
}
