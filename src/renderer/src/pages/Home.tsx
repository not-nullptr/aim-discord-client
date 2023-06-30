import { useContext, useEffect } from "react";
import { Context } from "../util/Context";
import "../css/Home.css";
import banner from "../img/banner.png";
import splashCropped from "../img/splash-cropped.png";
const { ipcRenderer } = window.require("electron");

export default function Home() {
    const { state, setState } = useContext(Context);
    useEffect(() => {
        setState({
            ...state,
            title: `${state.initialReady?.user.username}'s Buddy List Window`,
        });
    }, [state.initialReady?.user.username]);
    useEffect(() => {
        ipcRenderer.send("set-window-size", 152, 460);
    }, []);
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
            {/* <div
                style={{
                    height: 14,
                    marginLeft: 8,
                    display: "flex",
                    alignItems: "center",
                    marginTop: 2,
                }}
            >
                My AIM
            </div> */}
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
                                Buddies{" "}
                                {`(${state.initialReady?.users.length})`}
                            </summary>
                            <ul>
                                {state.initialReady?.users.map((x) => (
                                    <li
                                        onDoubleClick={() =>
                                            ipcRenderer.send(
                                                "create-window",
                                                "/message",
                                                611,
                                                359
                                            )
                                        }
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
                                        key={x.id}
                                    >
                                        {x.username}
                                    </li>
                                ))}
                            </ul>
                        </details>
                    </li>
                </ul>
            </div>
        </div>
    );
}
