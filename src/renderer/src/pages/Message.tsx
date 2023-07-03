import Divider from "@renderer/components/Divider";
import { Context } from "@renderer/util/Context";
import { useContext, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../css/Message.css";
import { Message } from "src/shared/types/Gateway";
import { req } from "@renderer/util/Rest";
import { GatewayEvent } from "src/shared/util/Gateway";
const { ipcRenderer } = window.require("electron");
import send from "../audio/Send.mp3";
import parse from "html-react-parser";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { createWindow } from "../../../../src/shared/util/Window";
import IconButton from "@renderer/components/IconButton";

// function convertToMentionName(
//     message: string,
//     state: State,
//     generic: string,
//     mention: string
// ) {
//     const mentionRegex = /<@(\d{1,20})>/g;
//     let startIndex = 0;
//     let cleanedMessage: React.ReactNode[] = [];
//     const headerRegex = /^#{1,3}\s/g;
//     const isHeader = headerRegex.test(message); // hacky, will un-hardcode later
//     const headerStyle = isHeader
//         ? { fontSize: 45 - (message.match(/^#{1,3}/g) ?? [""])[0].length * 8 }
//         : {};
//     if (isHeader) message = message.replace(headerRegex, "");

//     while (true) {
//         const match = mentionRegex.exec(message);
//         if (match === null) {
//             cleanedMessage.push(
//                 <span key={startIndex} style={headerStyle}>
//                     {message.substring(startIndex)}
//                 </span>
//             );
//             break;
//         }

//         const mentionId = match[1];
//         const user = state.initialReady.users.find(
//             (user) => user.id === mentionId
//         );
//         const endIndex = match.index;

//         if (user) {
//             cleanedMessage.push(
//                 <span key={startIndex} style={headerStyle} className={generic}>
//                     {message.substring(startIndex, endIndex)}
//                     <span className={mention} style={headerStyle}>
//                         @{user.username}
//                     </span>
//                 </span>
//             );
//         } else {
//             cleanedMessage.push(
//                 <span className={generic} key={startIndex} style={headerStyle}>
//                     {message.substring(startIndex, endIndex)}
//                     <span className={mention} style={headerStyle}>
//                         &lt;@{mentionId}&gt;
//                     </span>
//                 </span>
//             );
//         }

//         startIndex = mentionRegex.lastIndex;
//     }

//     return { mentionId: null, cleanedMessage };
// }

export default function DMs() {
    const result = (a: any) =>
        a?.length > 1
            ? `${a?.slice(0, -1).join(", ")} and ${a?.slice(-1)}`
            : { 0: "", 1: a?.[0] }[a?.length];
    const { state, setState } = useContext(Context);
    const [params] = useSearchParams();
    const [dm, setDm] = useState(
        state.initialReady?.private_channels.find((c) => {
            if (params.get("type") === "dm") {
                return (
                    c.recipient_ids?.length === 1 &&
                    c.recipient_ids?.[0] === params.get("id")
                );
            } else {
                return c.id === params.get("id");
            }
        })
    );
    const dmMut = useRef(
        state.initialReady?.private_channels.find((c) =>
            // params.get("type") === "dm"
            //     ? c.recipient_ids?.length === 1 &&
            //       c.recipient_ids?.[0] === params.get("id")
            //     : c.id === params.get("id")
            {
                if (params.get("type") === "dm") {
                    return (
                        c.recipient_ids?.length === 1 &&
                        c.recipient_ids?.[0] === params.get("id")
                    );
                } else {
                    return c.id === params.get("id");
                }
            }
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
        setDm(dmMut.current);
    }, [dmMut.current]);
    useEffect(() => {
        if (params.get("type") === "dm" && !dmMut.current) {
            req<any>(state?.token, `/users/@me/channels`, "POST", {
                recipients: [params.get("id")],
            }).then((res) => {
                setDm(res);
                setMessages([]);
            });
        }
        ipcRenderer.on("gateway-dispatch", (_, data) => {
            console.log(data);
            const { t, d } = data as GatewayEvent<any>;
            switch (t) {
                case "MESSAGE_CREATE":
                    if (d.channel_id === dm?.id) {
                        setMessages((prev) => [d, ...prev]);
                        if (d.author.id === state.initialReady?.user.id) {
                            new Audio(send).play();
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
    }, [state, dmMut.current?.id, dm]);
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
        let title = "";
        switch (params.get("type")) {
            case "dm":
                title = `${
                    dmMut.current?.name ||
                    result(users?.map((u) => u?.username))
                } - Instant Message`;
                break;
            case "guild":
                dmMut.current = state.initialReady?.guilds
                    .find((g) =>
                        g.channels.find((c) => c.id === params.get("id"))
                    )
                    ?.channels.find((c) => c.id === params.get("id"));
                title = `#${dmMut.current?.name} - Instant Message`;
                break;
        }
        req<Message[]>(
            state?.token,
            `/channels/${dmMut.current?.id}/messages?limit=50`,
            "GET"
        ).then((res) => {
            setMessages(res);
        });
        setState({
            ...state,
            title: title,
        });
    }, []);
    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);
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
                        <div key={m.id}>
                            <div className="message-container">
                                <span
                                    onClick={() =>
                                        createWindow(
                                            "/message?id=" +
                                                state.initialReady?.private_channels.find(
                                                    (p) =>
                                                        p.recipient_ids?.[0] ===
                                                            m.author.id &&
                                                        p.recipient_ids
                                                            ?.length === 1
                                                )?.id,
                                            611,
                                            359
                                        )
                                    }
                                    className={`message-author ${
                                        m.author.id ===
                                        state.initialReady?.user.id
                                            ? "self"
                                            : "other"
                                    }`}
                                >
                                    {m.author.username}
                                </span>
                                <span className="message-content">
                                    {": "}
                                    {
                                        // convertToMentionName(
                                        //     m.content,
                                        //     state,
                                        //     "message-content",
                                        //     "message-mention"
                                        // ).cleanedMessage

                                        // TODO: parse mentions AND markdown
                                        parse(
                                            DOMPurify.sanitize(
                                                marked.parse(m.content, {
                                                    headerIds: false,
                                                })
                                            ).replace(
                                                "<a",
                                                "<a target='_blank'"
                                            )
                                        )
                                    }
                                </span>
                                {m.referenced_message?.content ? (
                                    <i>{` (in reply to ${m.referenced_message.author.username}'s message: "${m.referenced_message.content}")`}</i>
                                ) : null}
                            </div>
                            {m.attachments?.length > 0 ? (
                                <div className="attachments">
                                    {m.attachments?.map((a) => (
                                        // TODO: attachment type (a.content_type?)
                                        <a
                                            key={a.id}
                                            href={a.url}
                                            target="_blank"
                                        >
                                            <img
                                                className="attachment-image"
                                                src={a.url}
                                            />
                                        </a>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    ))}
                </div>
                <div className="in-between-container">
                    <div className="typing"></div>
                </div>
                <textarea
                    onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            const textarea = document.querySelector(
                                ".input-container"
                            ) as HTMLTextAreaElement;
                            const content = textarea?.value;
                            textarea.value = "";
                            req<Message>(
                                state?.token,
                                `/channels/${dm?.id}/messages`,
                                "POST",
                                {
                                    content,
                                }
                            );
                        }
                    }}
                    className="input-container"
                />
                <button
                    style={{
                        position: "absolute",
                        bottom: 8,
                        left: 8,
                        minWidth: 120,
                    }}
                    onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.onchange = (_) => {
                            const files = Array.from(input.files!);
                            const file = files[0];
                            // if (!file.type.startsWith("image/")) {
                            //     return;
                            // }
                            const reader = new FileReader();
                            reader.addEventListener("load", async (event) => {
                                const data = event.target?.result as
                                    | string
                                    | undefined;
                                // if (!data) return;
                                const dataBuf = Buffer.from(
                                    await (await fetch(data || "")).text(),
                                    "utf-8"
                                );
                                console.log(dataBuf);
                            });
                            reader.readAsDataURL(file);
                        };
                        input.click();
                    }}
                    // onClick={() => {
                    //     let input = document.createElement("input");
                    //     input.type = "file";
                    //     input.onchange = (_) => {
                    //         let files = Array.from(input.files!);
                    //         let attachments: any[] = [];
                    //         files.map((file) => {
                    //             if (
                    //                 file.type &&
                    //                 !file.type.startsWith("image/")
                    //             ) {
                    //                 return;
                    //             }

                    //             const reader = new FileReader();

                    //             reader.addEventListener("load", (event) => {
                    //                 const data = event.target?.result as
                    //                     | string
                    //                     | undefined;
                    //                 if (!data) return;
                    //                 const dataBuf = Buffer.from(
                    //                     data.replace(
                    //                         /^data:image\/\w+;base64,/,
                    //                         ""
                    //                     ),
                    //                     "base64"
                    //                 );
                    //                 console.log(dataBuf);
                    //                 attachments.push({
                    //                     file_size: dataBuf.byteLength,
                    //                     filename: file.name,
                    //                     // random number between 1 and 1000
                    //                     id: String(
                    //                         Math.floor(Math.random() * 1000)
                    //                     ),
                    //                     is_clip: false,
                    //                 });
                    //                 req<any>(
                    //                     state?.token,
                    //                     `/channels/${dm?.id}/attachments`,
                    //                     "POST",
                    //                     {
                    //                         files: attachments,
                    //                     }
                    //                 ).then((res) => {
                    //                     res.attachments.map((a: any) => {
                    //                         fetch(
                    //                             `http://localhost:59813${
                    //                                 new URL(a.upload_url)
                    //                                     .pathname
                    //                             }`,
                    //                             {
                    //                                 method: "PUT",
                    //                                 body: dataBuf.toString(
                    //                                     "utf-8"
                    //                                 ),
                    //                                 headers: {
                    //                                     Origin: "https://discord.com",
                    //                                     Referrer:
                    //                                         "https://discord.com",
                    //                                 },
                    //                             }
                    //                         ).then(() => {
                    //                             req<Message>(
                    //                                 state?.token,
                    //                                 "/channels/" +
                    //                                     dm?.id +
                    //                                     "/messages",
                    //                                 "POST",
                    //                                 {
                    //                                     content: "",
                    //                                     attachments: [
                    //                                         {
                    //                                             id: "0",
                    //                                             filename:
                    //                                                 file.name,
                    //                                             uploaded_filename:
                    //                                                 a.upload_filename,
                    //                                         },
                    //                                     ],
                    //                                 }
                    //                             );
                    //                         });
                    //                     });
                    //                 });
                    //             });

                    //             reader.readAsDataURL(file);
                    //         });
                    //     };
                    //     input.click();
                    // }}
                >
                    Upload image
                </button>
                <IconButton
                    style={{
                        position: "absolute",
                        bottom: 8,
                        right: 8,
                    }}
                    onClick={() => {
                        const textarea = document.querySelector(
                            ".input-container"
                        ) as HTMLTextAreaElement;
                        const content = textarea?.value;
                        textarea.value = "";
                        req<Message>(
                            state?.token,
                            `/channels/${dm?.id}/messages`,
                            "POST",
                            {
                                content,
                            }
                        );
                    }}
                    name="send"
                />
            </div>
        </div>
    );
}
