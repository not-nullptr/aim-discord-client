import Divider from "@renderer/components/Divider";
import { Context } from "@renderer/util/Context";
import { useContext, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../css/Message.css";
import { Message } from "src/shared/types/Gateway";
import { req } from "@renderer/util/Rest";
import { GatewayEvent } from "src/shared/util/Gateway";
const { ipcRenderer } = window.require("electron");
import send from "../audio/Send.wav";
import receive from "../audio/Receive.wav";
import { State } from "src/shared/types/State";

export function convertToMentionName(
    message: string,
    state: State,
    generic: string,
    mention: string
) {
    const mentionRegex = /<@(\d{19})>/g;
    let startIndex = 0;
    let cleanedMessage: React.ReactNode[] = [];

    while (true) {
        const match = mentionRegex.exec(message);
        if (match === null) {
            cleanedMessage.push(
                <span key={startIndex}>{message.substring(startIndex)}</span>
            );
            break;
        }

        const mentionId = match[1];
        const user = state.initialReady.users.find(
            (user) => user.id === mentionId
        );
        const endIndex = match.index;

        if (user) {
            cleanedMessage.push(
                <span key={startIndex} className={generic}>
                    {message.substring(startIndex, endIndex)}
                    <span className={mention}>@{user.username}</span>
                </span>
            );
        } else {
            cleanedMessage.push(
                <span className={generic} key={startIndex}>
                    {message.substring(startIndex, endIndex)}
                    <span className={mention}>@{mentionId}</span>
                </span>
            );
        }

        startIndex = mentionRegex.lastIndex;
    }

    return { mentionId: null, cleanedMessage };
}

export default function DMs() {
    const result = (a: any) =>
        a?.length > 1
            ? `${a?.slice(0, -1).join(", ")} and ${a?.slice(-1)}`
            : { 0: "", 1: a?.[0] }[a?.length];
    const { state, setState } = useContext(Context);
    const [params] = useSearchParams();
    const dmMut = useRef(
        state.initialReady?.private_channels.find((c) =>
            params.get("type") === "dm"
                ? c.recipient_ids?.length === 1 &&
                  c.recipient_ids?.[0] === params.get("id")
                : c.id === params.get("id")
        )
    );
    const chatRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [users, setUsers] = useState(
        dmMut.current?.recipient_ids?.map((id) =>
            state.initialReady.users.find((u) => u.id === id)
        )
    );
    useEffect(() => {
        ipcRenderer.on("gateway-dispatch", (_, data) => {
            console.log(data);
            const { t, d } = data as GatewayEvent<any>;
            switch (t) {
                case "MESSAGE_CREATE":
                    if (d.channel_id === dmMut.current?.id) {
                        setMessages((prev) => [d, ...prev]);
                        if (d.author.id === state.initialReady?.user.id) {
                            new Audio(send).play();
                        } else {
                            new Audio(receive).play();
                        }
                    }
                    break;
                default:
                    break;
            }
        });
        return () => {
            ipcRenderer.removeAllListeners("gateway-dispatch");
        };
    }, [state, dmMut.current]);
    useEffect(() => {
        if (state.initialReady) {
            dmMut.current = state.initialReady?.private_channels.find((c) =>
                params.get("type") === "dm"
                    ? c.recipient_ids?.length === 1 &&
                      c.recipient_ids?.[0] === params.get("id")
                    : c.id === params.get("id")
            );
            setUsers(
                dmMut.current?.recipient_ids?.map((id) =>
                    state.initialReady.users.find((u) => u.id === id)
                )
            );
        }
    }, [state.initialReady]);
    useEffect(() => {
        if (!dmMut.current) return;
        setState({
            ...state,
            title: `${
                dmMut.current?.name || result(users?.map((u) => u?.username))
            } - Insant Message`,
        });

        req<Message[]>(
            state?.token,
            `/channels/${dmMut.current?.id}/messages?limit=50`,
            "GET"
        ).then((res) => {
            setMessages(res);
        });
    }, []);
    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);
    function onSubmit() {
        {
            const textarea = document.querySelector(
                ".input-container"
            ) as HTMLTextAreaElement;
            const content = textarea?.value;
            textarea.value = "";
            req<Message>(
                state?.token,
                `/channels/${dmMut.current?.id}/messages`,
                "POST",
                {
                    content,
                }
            );
        }
    }
    return (
        <div>
            <Divider
                style={{
                    marginTop: 20,
                }}
            />
            <div
                style={{
                    padding: 6,
                    height: "calc(100vh - 28px - 20px - 12px - 8px)",
                }}
            >
                <div className="chat-container" ref={chatRef}>
                    {messages.map((m) => (
                        <div key={m.id} className="message-container">
                            <span
                                className={`message-author ${
                                    m.author.id === state.initialReady?.user.id
                                        ? "self"
                                        : "other"
                                }`}
                            >
                                {m.author.username}
                            </span>
                            {": "}
                            {
                                convertToMentionName(
                                    m.content,
                                    state,
                                    "message-content",
                                    "message-mention"
                                ).cleanedMessage
                            }
                        </div>
                    ))}
                </div>
                <textarea
                    onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault(); // Prevent the default behavior of adding a new line
                            onSubmit(); // Call your onSubmit function
                        }
                    }}
                    className="input-container"
                />
                <button
                    style={{
                        position: "absolute",
                        bottom: 8,
                        right: 8,
                        minWidth: 80,
                    }}
                    onClick={onSubmit}
                >
                    Send
                </button>
            </div>
        </div>
    );
}
