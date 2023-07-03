import { useContext, useEffect } from "react";
import { Context } from "../util/Context";
import "../css/Home.css";
import placeholder from "../img/placeholder.png";
import banner from "../img/banner.png";
import splashCropped from "../img/splash-cropped.png";
import { ChannelTypes } from "../../../../src/shared/types/Gateway";
import {
    createWindow,
    setWindowSize,
} from "../../../../src/shared/util/Window";
import IconButton from "@renderer/components/IconButton";
import ticker from "../img/ticker.png";
const { ipcRenderer } = window.require("electron");

const result = (a: any) =>
    a.length > 1
        ? `${a.slice(0, -1).join(", ")} and ${a.slice(-1)}`
        : { 0: "", 1: a[0] }[a.length];

function openDetail(id: string) {
    document.querySelectorAll("details").forEach((x) => {
        x.open = false;
    });
    const im = document.getElementById(id) as HTMLDetailsElement;
    if (!im.open) im.open = true;
}

export default function Home() {
    const { state, setState } = useContext(Context);
    useEffect(() => {
        setWindowSize(146, 453);
    }, []);
    useEffect(() => {
        console.log(state.initialReady?.private_channels);
        setState({
            ...state,
            title: `${state.initialReady?.user.username}'s Buddy List Window`,
        });
        ipcRenderer.on("play-sound", async (_, sound: string) => {
            const audioPath = await import(`../audio/${sound}.mp3`);
            const audio = new Audio(audioPath.default);
            audio.play();
        });
        return () => {
            ipcRenderer.removeAllListeners("play-sound");
        };
    }, [state.initialReady?.user.username]);
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                paddingLeft: 2,
                paddingRight: 2,
                overflow: "hidden",
                height: "calc(100vh - 28px)",
            }}
        >
            <div
                style={{
                    height: 14,
                    marginLeft: 8,
                    display: "flex",
                    alignItems: "center",
                    marginTop: 2,
                }}
            >
                <span className="toolbar-item">My AIM</span>
                <span className="toolbar-item">People</span>
                <span className="toolbar-item">Help</span>
            </div>
            <div
                style={{
                    marginTop: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    backgroundColor: "#fffbf0",
                    paddingTop: 6,
                    paddingBottom: 1,
                    gap: 8,
                }}
            >
                <img
                    src={banner}
                    onDoubleClick={() =>
                        console.log(window.screen.width, window.screen.height)
                    }
                    style={{ width: 143 }}
                />
                <img src={splashCropped} />
            </div>
            <div
                style={{
                    width: "100%",
                    display: "flex",
                    height: 14,
                    marginTop: 3,
                    alignItems: "center",
                }}
            >
                <div
                    className="text-inset"
                    style={{
                        width: "unset",
                        flexGrow: 1,
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        /* enable overflow, but hide scrollbar (so user can drag on text) */
                        overflow: "hidden",
                        overflowX: "hidden",
                        overflowY: "hidden",
                    }}
                >
                    {`${state.initialReady?.user.username}'s Buddy List:`}
                </div>
                <IconButton name="content-panel" style={{}} />
            </div>
            <div className="buddy-list-container">
                <ul className="buddy-list">
                    <li>
                        <details id="group-chats">
                            <summary>
                                Group Chats (
                                {
                                    state.initialReady?.private_channels.filter(
                                        (c) => c.type === ChannelTypes.GROUP_DM
                                    ).length
                                }
                                )
                            </summary>
                            <ul style={{ marginTop: 2 }}>
                                {state.initialReady?.private_channels
                                    .filter(
                                        (c) => c.type === ChannelTypes.GROUP_DM
                                    )
                                    .sort((a, b) => {
                                        var textA = (
                                            a.name ||
                                            result(
                                                a.recipient_ids
                                                    ?.map((r) =>
                                                        state.initialReady?.users.find(
                                                            (u) => u.id === r
                                                        )
                                                    )
                                                    .map((u) => u?.username)
                                            )
                                        ).toUpperCase();
                                        var textB = (
                                            b.name ||
                                            result(
                                                b.recipient_ids
                                                    ?.map((r) =>
                                                        state.initialReady?.users.find(
                                                            (u) => u.id === r
                                                        )
                                                    )
                                                    .map((u) => u?.username)
                                            )
                                        ).toUpperCase();
                                        return textA < textB
                                            ? -1
                                            : textA > textB
                                            ? 1
                                            : 0;
                                    })
                                    .map((gc) => (
                                        <li
                                            style={{
                                                marginTop: -2,
                                            }}
                                            onDoubleClick={() => {
                                                createWindow(
                                                    `/message?id=${gc.id}`,
                                                    611,
                                                    359
                                                );
                                            }}
                                            onMouseDown={(e) => {
                                                document
                                                    .querySelectorAll(
                                                        "li.selected"
                                                    )
                                                    .forEach((x) =>
                                                        x.classList.remove(
                                                            "selected"
                                                        )
                                                    );
                                                const target =
                                                    e.target as HTMLLIElement;
                                                target.classList.add(
                                                    "selected"
                                                );
                                            }}
                                            key={gc.id}
                                        >
                                            {gc.name ||
                                                result(
                                                    gc.recipient_ids
                                                        ?.map((r) =>
                                                            state.initialReady?.users.find(
                                                                (u) =>
                                                                    u.id === r
                                                            )
                                                        )
                                                        .map((u) => u?.username)
                                                )}
                                        </li>
                                    ))}
                            </ul>
                        </details>
                        <details id="buddies">
                            <summary>
                                Buddies ({state.initialReady?.users.length})
                            </summary>
                            <ul>
                                {state.initialReady?.users
                                    .sort((a, b) => {
                                        const textA = a.username.toUpperCase();
                                        const textB = b.username.toUpperCase();
                                        return textA < textB
                                            ? -1
                                            : textA > textB
                                            ? 1
                                            : 0;
                                    })
                                    .map((x) => (
                                        <li
                                            onDoubleClick={() => {
                                                createWindow(
                                                    `/message?id=${x.id}&type=dm`,
                                                    611,
                                                    359
                                                );
                                                console.log(x);
                                            }}
                                            onMouseDown={(e) => {
                                                document
                                                    .querySelectorAll(
                                                        "li.selected"
                                                    )
                                                    .forEach((x) =>
                                                        x.classList.remove(
                                                            "selected"
                                                        )
                                                    );
                                                const target =
                                                    e.target as HTMLLIElement;
                                                target.classList.add(
                                                    "selected"
                                                );
                                            }}
                                            key={x.id}
                                        >
                                            {x.global_name ||
                                                `${x.username}#${x.discriminator}`}
                                        </li>
                                    ))}
                            </ul>
                        </details>
                        <details id="servers">
                            <summary>
                                Servers ({state.initialReady?.guilds.length})
                            </summary>
                            <ul>
                                {state.initialReady?.guilds
                                    .sort((a, b) => {
                                        const textA =
                                            a.properties?.name.toUpperCase();
                                        const textB =
                                            b.properties?.name.toUpperCase();
                                        return textA < textB
                                            ? -1
                                            : textA > textB
                                            ? 1
                                            : 0;
                                    })
                                    .map((x) => (
                                        <details
                                            key={x.id}
                                            onMouseDown={(e) => {
                                                document
                                                    .querySelectorAll(
                                                        "li.selected"
                                                    )
                                                    .forEach((x) =>
                                                        x.classList.remove(
                                                            "selected"
                                                        )
                                                    );
                                                const target =
                                                    e.target as HTMLLIElement;
                                                target.classList.add(
                                                    "selected"
                                                );
                                            }}
                                        >
                                            <summary>
                                                {x.properties?.name}
                                            </summary>
                                            <ul>
                                                {x.channels
                                                    ?.filter(
                                                        (c) =>
                                                            c.type ===
                                                            ChannelTypes.GUILD_TEXT
                                                    )
                                                    .sort((a, b) => {
                                                        const textA = (
                                                            a.name || ""
                                                        ).toUpperCase();
                                                        const textB = (
                                                            b.name || ""
                                                        ).toUpperCase();
                                                        return textA < textB
                                                            ? -1
                                                            : textA > textB
                                                            ? 1
                                                            : 0;
                                                    })
                                                    .map((c) => (
                                                        <li
                                                            onDoubleClick={() => {
                                                                createWindow(
                                                                    `/message?id=${c.id}&type=guild`,
                                                                    611,
                                                                    359
                                                                );
                                                            }}
                                                            key={c.id}
                                                        >
                                                            {c.name}
                                                        </li>
                                                    ))}
                                            </ul>
                                        </details>
                                    ))}
                            </ul>
                        </details>
                    </li>
                </ul>
            </div>
            <div
                className="horizontal-button-container-container"
                style={{
                    borderBottom: "solid thin #716f64",
                }}
            >
                <div className="horizontal-button-container">
                    <IconButton
                        onClick={() => openDetail("buddies")}
                        name="im-home"
                    />
                    <IconButton
                        onClick={() => openDetail("group-chats")}
                        name="chat-home"
                    />
                    <IconButton name="write-home" />
                    <IconButton
                        onClick={() =>
                            createWindow(`/buddyinfo`, 307, 138, false)
                        }
                        name="info-home"
                    />
                    <IconButton name="setup-home" />
                </div>
            </div>
            <div
                className="horizontal-button-container-container bright-background"
                style={{
                    height: 47,
                }}
            >
                <div
                    className="horizontal-button-container"
                    style={{
                        width: 135,
                    }}
                >
                    <IconButton name="read-home" />
                    <IconButton name="today-home" />
                    <IconButton name="away-home" />
                    <IconButton name="prefs-home" />
                </div>
            </div>
            <div className="ticker">
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <img
                        src={ticker}
                        style={{
                            marginRight: 4,
                        }}
                    />
                    <div className="marquee">
                        <span>
                            Made by{" "}
                            <a
                                target="_blank"
                                href="https://twitter.com/RobotPlaysTF2"
                            >
                                Maddie
                            </a>
                            {" and"}{" "}
                            <a
                                target="_blank"
                                href="https://twitter.com/McMistrzYT"
                            >
                                mc
                            </a>
                        </span>
                    </div>
                </div>
                <div
                    style={{
                        position: "absolute",
                        bottom: 5,
                    }}
                >
                    Changelogs could go here?
                </div>
            </div>
        </div>
    );
}
