import React, { useEffect, useRef, useContext } from "react";
import WebSocketContext from "../util/WebsocketContext";
import { Context } from "@renderer/util/Context";

const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { state, setState } = useContext(Context);
    const socket = useRef<WebSocket | null>(null);
    useEffect(() => {
        if (!socket.current || socket.current === null) return;
    }, [socket, state]);

    const startWebSocket = (token: string) => {
        if (socket.current)
            socket.current.close(1000, "New websocket connection started");
        const newSocket = new WebSocket(
            "wss://gateway.discord.gg/?v=9&encoding=json"
        );
        socket.current = newSocket;
        setState({
            ...state,
            token,
        });
    };

    return (
        <WebSocketContext.Provider
            value={{ socket: socket.current, startWebSocket }}
        >
            {children}
        </WebSocketContext.Provider>
    );
};

export default WebSocketProvider;
