import React, { useState, useEffect, useRef } from "react";
import WebSocketContext from "../util/WebsocketContext";
import { OpCodes } from "../types/Codes";
import { GatewayEvent, sendOp } from "../util/Gateway";
import {
    IdentifyPacket,
    DispatchType,
    MessageCreatePacket,
} from "../types/Gateway";
import mail from "../audio/YouGotMail.mp3";

const typeHandlers: { [K in DispatchType]?: (payload: any) => any } = {
    MESSAGE_CREATE: (payload: MessageCreatePacket) => {
        console.log(payload.mentions);
        if (
            payload.mentions.find(
                (mention) => mention.id === "1053012491006910504"
            )
        ) {
            const audio = new Audio(mail);
            audio.play();
            const iconUrl = `https://cdn.discordapp.com/avatars/${payload.author.id}/${payload.author.avatar}.png`;
            window.electronAPI.sendNotification({
                title: `You've Got Mail!`,
                body: `${payload.author.username}: ${payload.content}`,
                icon: iconUrl,
            });
        }
    },
};

const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const socket = useRef<WebSocket | null>(null);
    useEffect(() => {
        if (socket) {
            socket.current?.close(1000, "New websocket connection started");
        }
    }, [socket]);

    const startWebSocket = (token: string) => {
        if (socket.current)
            socket.current.close(1000, "New websocket connection started");
        const newSocket = new WebSocket(
            "wss://gateway.discord.gg/?v=9&encoding=json"
        );
        newSocket.onopen = () => {
            sendOp<IdentifyPacket>(
                newSocket,
                OpCodes.IDENTIFY,
                {
                    token,
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
        newSocket.onmessage = (event: MessageEvent<string>) => {
            const data: GatewayEvent<any> = JSON.parse(event.data);
            switch (data.op) {
                case OpCodes.DISPATCH: {
                    const handler = (typeHandlers as any)[data.t as any] as (
                        payload: any
                    ) => any | undefined;
                    if (handler) handler(data.d);
                    else {
                        console.error(`Unimplemented dispatch! ${data.t}`);
                        console.error(data);
                    }
                    break;
                }
                case OpCodes.HELLO: {
                    setInterval(() => {
                        sendOp(newSocket, OpCodes.HEARTBEAT, null, null, null);
                    }, data.d.heartbeat_interval);
                    break;
                }
                default: {
                    console.error(`Unimplemented op! ${data.op}`);
                    console.error(data);
                }
            }
        };
        socket.current = newSocket;
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
