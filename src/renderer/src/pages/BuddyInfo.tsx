import { useContext, useEffect, useState } from "react";
import { Context } from "../util/Context";
import { UserProfile } from "src/shared/types/Gateway";
import { req } from "@renderer/util/Rest";
import Divider from "@renderer/components/Divider";
import { closeWindow } from "../../../../src/shared/util/Window";
import { setWindowSize } from "./../../../shared/util/Window";
const { ipcRenderer } = window.require("electron");

export default function BuddyInfo() {
    const { state, setState } = useContext(Context);
    const [foundBuddy, setFoundBuddy] = useState<UserProfile>();
    const [notFoundBuddy] = useState<UserProfile>({
        user: {
            id: "404",
            username: "-",
            discriminator: "0",
            avatar: null,
        },
        user_profile: {},
        badges: [],
        guild_badges: [],
        legacy_username: "-",
        mutual_guilds: [],
        connected_accounts: [],
        application_role_connections: [],
        premium_type: null,
        premium_since: null,
        premium_guild_since: null,
    });

    useEffect(() => {
        setState({
            ...state,
            title: "Buddy Info:",
        });
    }, []);

    function requestUserDetails() {
        const buddyName = (
            document.getElementById("requestedScreenName") as HTMLInputElement
        ).value;

        const userId = state.initialReady?.users.find((x) =>
            x.username.toLowerCase().includes(buddyName.toLowerCase())
        )?.id;
        if (!userId) {
            notFoundBuddy.user.username = buddyName;
            setFoundBuddy(notFoundBuddy);
            setWindowSize(489, 365);
            return;
        }

        req<UserProfile>(state?.token, `/users/${userId}/profile`, "GET")
            .then((res) => {
                console.log(res);
                setFoundBuddy(res);
                setWindowSize(489, 365);

                setState({
                    ...state,
                    title: `Buddy Info: ${res.user.username}`,
                });
            })
            .catch(() => {
                notFoundBuddy.user.username = buddyName;
                setFoundBuddy(notFoundBuddy);
                setWindowSize(489, 365);
            });
    }

    return (
        <div>
            <div
                style={{
                    marginTop: "10.5px",
                    marginLeft: "8px",
                    lineHeight: "130%",
                    letterSpacing: "0.25px",
                }}
            >
                <div
                    style={{
                        maxWidth: "100px",
                        maxHeight: "200px",
                        float: "right",
                        marginRight: "13px",
                    }}
                >
                    <div
                        className="button-frame"
                        style={{ width: "67px", height: "24px" }}
                    >
                        <button
                            type="submit"
                            style={{
                                minWidth: "63px",
                                minHeight: "20px",
                            }}
                            onClick={requestUserDetails}
                        >
                            OK
                        </button>
                    </div>
                    <div
                        className="button-frame"
                        style={{
                            width: "67px",
                            height: "24px",
                            marginTop: "5px",
                        }}
                    >
                        <button
                            type="reset"
                            style={{
                                minWidth: "63px",
                                minHeight: "20px",
                            }}
                            onClick={() => closeWindow()}
                        >
                            Close
                        </button>
                    </div>
                </div>

                <div style={{ width: "185px" }}>
                    Enter the screen name of the user you wish to get info
                    about:
                </div>
                <input
                    id="requestedScreenName"
                    type="text"
                    style={{
                        marginTop: "2px",
                        width: "200px",
                        height: "25px",
                        fontWeight: "bold",
                        letterSpacing: "1.2px",
                    }}
                    onKeyDown={(e) => {
                        if (e.code === "Enter") {
                            e.preventDefault();
                            requestUserDetails();
                        }
                    }}
                />
                {foundBuddy ? (
                    <div>
                        <Divider
                            style={{
                                marginTop: 7,
                                marginLeft: "-8px",
                                width: "calc(100% + 8px)",
                            }}
                        />
                        <div style={{ marginTop: 5, marginBottom: 20 }}>
                            <div style={{ marginBottom: 5 }}>
                                <b>Warning Level: </b>
                                0%
                                {/* would be really cool if this was 100% if that user is blocked and 0% if its not */}
                            </div>
                            <div>
                                <b>Online time: </b>
                                TBD
                            </div>
                        </div>
                        <Divider
                            style={{
                                marginLeft: "-8px",
                                width: "calc(100% + 8px)",
                            }}
                        />
                        <div style={{ marginTop: 3 }}>
                            <b>Personal Profile:</b>
                            <div
                                className="good-lookin-div"
                                style={{
                                    marginTop: "3px",
                                    width: "calc(100% - 20px)",
                                    height: "123px",
                                }}
                            >
                                {foundBuddy.user.id === "404" ? (
                                    <span>
                                        Buddy Info for{" "}
                                        <b>{foundBuddy.user.username}</b> is not
                                        available.
                                    </span>
                                ) : (
                                    foundBuddy.user_profile.bio
                                )}
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
