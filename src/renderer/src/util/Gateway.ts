import { State } from "@renderer/types/State";
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

export function convertToMentionName(message: string, state: State) {
    const mentionRegex = /<@(\d{19})>/;
    const match = message.match(mentionRegex);

    if (match && match.length >= 2) {
        const mentionId = match[1];
        const user = state.initialReady.users.find(
            (user) => user.id === mentionId
        );
        if (user) {
            const cleanedMessage = message.replace(
                match[0],
                `@${user.username}`
            );
            return { mentionId, cleanedMessage };
        } else {
            const cleanedMessage = message.replace(match[0], `@${mentionId}`);
            return { mentionId, cleanedMessage };
        }
    } else {
        return { mentionId: null, cleanedMessage: message };
    }
}
