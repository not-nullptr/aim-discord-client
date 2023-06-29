import React from "react";

const WebSocketContext = React.createContext<{
    socket: WebSocket | null;
    startWebSocket: (token: string) => void;
} | null>(null);

export default WebSocketContext;
