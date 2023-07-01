import { useContext, useEffect } from "react";
import { Context } from "../util/Context";
import "../css/Home.css";
import placeholder from "../img/placeholder.png";
import banner from "../img/banner.png";
import splashCropped from "../img/splash-cropped.png";
const { ipcRenderer } = window.require("electron");

const result = (a: any) =>
    a.length > 1
        ? `${a.slice(0, -1).join(", ")} and ${a.slice(-1)}`
        : { 0: "", 1: a[0] }[a.length];

ipcRenderer.on("play-sound", async (_, sound: string) => {
    const audioPath = await import(`../audio/${sound}.mp3`);
    const audio = new Audio(audioPath.default);
    audio.play();
});

export default function Home() {
    const { state, setState } = useContext(Context);
    useEffect(() => {
        console.log(state.initialReady?.private_channels);
        setState({
            ...state,
            title: `${state.initialReady?.user.username}'s Buddy List Window`,
        });
    }, [state.initialReady?.user.username]);
    useEffect(() => {
        ipcRenderer.send("set-window-size", 152, 460);
    }, []);
    // hack
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
                <span className="toolbar-item">
					My AIM
				</span>
				<span className="toolbar-item">
					People
				</span>
				<span className="toolbar-item">
					Help
				</span>
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
                <img src={banner} style={{ width: 143 }} />
                <img src={splashCropped} />
            </div>
            <div
                className="text-inset"
                style={{
                    width: "unset",
                }}
            >
                {`${state.initialReady?.user.username}'s Buddy List:`}
            </div>
            <div className="buddy-list-container">
                <ul className="buddy-list">
                    <li>
                        <details>
                            <summary>
                                Group Chats (
                                {
                                    state.initialReady?.private_channels.filter(
                                        (c) => c.type === 3
                                    ).length
                                }
                                )
                            </summary>
                            <ul style={{ marginTop: 2 }}>
                                {state.initialReady?.private_channels
                                    .filter((c) => c.type === 3)
                                    .map((gc) => (
                                        <li
                                            style={{
                                                marginTop: -2,
                                            }}
                                            onDoubleClick={() => {
                                                ipcRenderer.send(
                                                    "create-window",
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
                        <details>
                            <summary>
                                Buddies ({state.initialReady?.users.length})
                            </summary>
                            <ul>
                                {state.initialReady?.users
                                    .sort((a, b) => {
                                        var textA = a.username.toUpperCase();
                                        var textB = b.username.toUpperCase();
                                        return textA < textB
                                            ? -1
                                            : textA > textB
                                            ? 1
                                            : 0;
                                    })
                                    .map((x) => (
                                        <li
                                            onDoubleClick={() => {
                                                ipcRenderer.send(
                                                    "create-window",
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
                        <details>
                            <summary>
                                Servers ({state.initialReady?.guilds.length})
                            </summary>
                            <ul>
                                {state.initialReady?.guilds.map((x) => (
                                    <li
                                        key={x.id}
                                        onMouseDown={(e) => {
                                            document
                                                .querySelectorAll("li.selected")
                                                .forEach((x) =>
                                                    x.classList.remove(
                                                        "selected"
                                                    )
                                                );
                                            const target =
                                                e.target as HTMLLIElement;
                                            target.classList.add("selected");
                                        }}
                                    >
                                        {x.properties.name}
                                    </li>
                                ))}
                            </ul>
                        </details>
                    </li>
                </ul>
            </div>
			<div className="horizontal-button-container">
				<div>
					<img src={placeholder}/>
					IM
				</div>
				<div>
					<img src={placeholder}/>
					Chat
				</div>
				<div>
					<img src={placeholder}/>
					Write
				</div>
				<div onClick={() =>
					ipcRenderer.send(
						"create-window",
						`/buddyinfo`,
						307,
						138,
						//false
					)
				}>
					<img src={placeholder}/>
					Info
				</div>
				<div>
					<img src={placeholder}/>
					Setup
				</div>
			</div>
        </div>
    );
}
