import { OpCodes } from "../types/Codes";

export function sendOp<T>(
    socket: WebSocket,
    op: OpCodes,
    data: T,
    s: number | null,
    t: string | null
) {
    socket.send(JSON.stringify({ op, d: data, s, t }));
}

export interface GatewayEvent<T> {
    d: T;
    op: OpCodes;
    s: number | null;
    t: string | null;
}
