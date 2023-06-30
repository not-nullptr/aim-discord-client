import React, { useState, useEffect, useRef, useContext } from "react";
import WebSocketContext from "../util/WebsocketContext";
import { OpCodes } from "../types/Codes";
import { GatewayEvent, convertToMentionName, sendOp } from "../util/Gateway";
import {
    IdentifyPacket,
    DispatchType,
    MessageCreatePacket,
    ReadyPacket,
} from "../types/Gateway";
import mail from "../audio/YouGotMail.mp3";
import { Context } from "@renderer/util/Context";
import { State } from "@renderer/types/State";

const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { state, setState } = useContext(Context);
    const getTypeHandlers = (
        state: State
    ): { [K in DispatchType]?: (payload: any) => any } => ({
        MESSAGE_CREATE: (payload: MessageCreatePacket) => {
            const isMentioned =
                payload.mentions.filter(
                    (x) => x.id === state.initialReady.user.id
                ).length > 0;
            const dmOrGroupChat =
                state.initialReady.private_channels.find(
                    (c) => c.id === payload.channel_id
                ) !== undefined;
            const focused = document.hasFocus();
            const ownMessage = payload.author.id === state.initialReady.user.id;
            const mentionsEveryone = payload.mention_everyone;
            if (
                (isMentioned || dmOrGroupChat || mentionsEveryone) &&
                !focused &&
                !ownMessage
            ) {
                const audio = new Audio(mail);
                audio.play();
                const iconUrl = `https://cdn.discordapp.com/avatars/${payload.author.id}/${payload.author.avatar}.png`;
                window.electronAPI.sendNotification({
                    title: `You've Got Mail!`,
                    body: `${payload.author.username}: ${
                        convertToMentionName(payload.content, state)
                            .cleanedMessage
                    } ${
                        payload.attachments.length > 0
                            ? `<${payload.attachments.length} attachment${
                                  payload.attachments.length === 1 ? "" : "s"
                              }>`
                            : ""
                    }`,
                    icon: iconUrl,
                });
            }
        },
        READY: (payload: ReadyPacket) => {
            setState({
                ...state,
                initialReady: payload,
            });
        },
    });
    const socket = useRef<WebSocket | null>(null);
    useEffect(() => {
        if (!socket.current || socket.current === null) return;
        socket.current.onopen = () => {
            sendOp<IdentifyPacket>(
                socket.current!,
                OpCodes.IDENTIFY,
                {
                    token: state.token,
                    capabilities: 16381,
                    properties: {
                        os: "Windows",
                        browser: "Firefox",
                        device: "",
                        system_locale: "en-GB",
                        browser_user_agent:
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/114.0",
                        browser_version: "114.0",
                        os_version: "10",
                        referrer: "",
                        referring_domain: "",
                        referrer_current: "",
                        referring_domain_current: "",
                        release_channel: "stable",
                        client_build_number: 209820,
                        client_event_source: null,
                    },
                    presence: {
                        status: "unknown",
                        since: 0,
                        activities: [],
                        afk: false,
                    },
                    compress: false,
                    client_state: {
                        guild_versions: {},
                        highest_last_message_id: "0",
                        read_state_version: 0,
                        user_guild_settings_version: -1,
                        user_settings_version: -1,
                        private_channels_version: "0",
                        api_code_version: 0,
                    },
                },
                null,
                null
            );
        };
        socket.current.onmessage = (event: MessageEvent<string>) => {
            const data: GatewayEvent<any> = JSON.parse(event.data);
            switch (data.op) {
                case OpCodes.DISPATCH: {
                    console.log(data);
                    const handler = (getTypeHandlers(state) as any)[
                        data.t as any
                    ] as (payload: any) => any | undefined;
                    if (handler) handler(data.d);
                    else {
                        console.warn(`Unimplemented dispatch: ${data.t}`);
                        console.warn(data);
                        console.warn(JSON.stringify(data.d));
                    }
                    break;
                }
                case OpCodes.HELLO: {
                    setInterval(() => {
                        sendOp(
                            socket.current!,
                            OpCodes.HEARTBEAT,
                            null,
                            null,
                            null
                        );
                    }, data.d.heartbeat_interval);
                    break;
                }
                default: {
                    console.warn(`Unimplemented op: ${data.op}`);
                    console.warn(data);
                    console.warn(JSON.stringify(data.d));
                }
            }
        };
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
