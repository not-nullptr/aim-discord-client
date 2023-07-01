import { useContext, useEffect, useState } from "react";
import { Context } from "../util/Context";
import { User, UserProfile } from "src/shared/types/Gateway";
import { req } from "@renderer/util/Rest";
import Divider from "@renderer/components/Divider";
const { ipcRenderer } = window.require("electron");

export default function BuddyInfo() {
    const { state, setState } = useContext(Context);
	const [ foundBuddy, setFoundBuddy ] = useState<UserProfile>();
	const [ notFoundBuddy ] = useState<UserProfile>({
		user: {
			id: "404",
			username: "-",
			discriminator: "0",
			avatar: null
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
		premium_guild_since: null
	});

	useEffect(() => {
		setState({
            ...state,
            title: "Buddy Info:"
        });
	}, []);

	function requestUserDetails() {
		const buddyName = (document.getElementById("requestedScreenName") as HTMLInputElement).value;
		setState({
            ...state,
            title: `Buddy Info: ${buddyName}`
        });

		const userId = state.initialReady?.users.find(x => x.username.toLowerCase().includes(buddyName.toLowerCase()))?.id;
		if (!userId) {
			setFoundBuddy(notFoundBuddy);
			ipcRenderer.send("set-window-size", 489, 365);
			return;
		}

		req<UserProfile>(
            state?.token,
            `/users/${userId}/profile`,
            "GET"
        ).then((res) => {
			console.log(res);
            setFoundBuddy(res);
			ipcRenderer.send("set-window-size", 489, 365);
        }).catch(() => {
			setFoundBuddy(notFoundBuddy);
			ipcRenderer.send("set-window-size", 489, 365);
		});
	}

	return (
		<div>
			<div style={{
				marginTop: "10.5px",
				marginLeft: "8px",
				lineHeight: "130%",
				letterSpacing: "0.25px"
			}}>
				<div style={{
					maxWidth: "100px",
					maxHeight: "200px",
					float: "right",
					marginRight: "13px"
				}}>
					<div className="button-frame" style={{ width: "67px", height: "24px" }}>
						<button
							type="submit"
							style={{
								minWidth: "63px",
								minHeight: "20px"
							}}
							onClick={requestUserDetails}
						>OK</button>
					</div>
					<div className="button-frame" style={{ width: "67px", height: "24px", marginTop: "5px" }}>
						<button
							type="reset"
							style={{
								minWidth: "63px",
								minHeight: "20px"
							}}
							onClick={() => ipcRenderer.send("close-window")}
						>Close</button>
					</div>
				</div>

				<div style={{ width: "185px" }}>Enter the screen name of the user you wish to get info about:</div>
				<input
					id="requestedScreenName"
					type="text"
					style={{
						marginTop: "2px",
						width: "200px",
						height: "25px",
						fontWeight: "bold",
						letterSpacing: "1.2px"
					}}
					onKeyDown={(e) => {
						if (e.code === "Enter") {
							e.preventDefault();
							requestUserDetails();
						}
					}}
				/>
				{foundBuddy ? (
					<Divider
						style={{
							marginTop: 20,
							marginLeft: "-8px",
							width: "100%"
						}}
					/>
				) : null}
			</div>
		</div>
	);
}