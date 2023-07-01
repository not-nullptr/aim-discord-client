import { useContext, useEffect } from "react";
import { Context } from "../util/Context";
const { shell } = window.require("electron");

export default function About() {
    const { state, setState } = useContext(Context);

	useEffect(() => {
		setState({
            ...state,
            title: `About Us`,
        });
	}, []);

	return (
		<div style={{ margin: "5px" }}>
			<span style={{ fontSize: 14, fontWeight: "bold" }}>About Us<br /></span>
			Hello! Welcome to our own personal about us page where we can tell you all about ourselves and this project!<br /><br />
			We are a small, 4 person team working on a private server for Discord and while doing that, we learned a lot on how Discord's API and Gateway function, allowing us to create this fully custom experience. No tracking, full privacy.<br /><br />
			The project was started on 30th June, 2023 by <a href="." onClick={() => shell.openExternal("https://twitter.com/RobotPlaysTF2")}>@RobotPlaysTF2</a> and <a href="." onClick={() => shell.openExternal("https://twitter.com/McMistrzYT")}>@McMistrzYT<br /></a>
			<span>
				<br />
				<span style={{ fontWeight: "bold" }}>{"A(mazing) I(ncredible) M(ixed Client)"} </span>
				{"made with ❤️ by Madeline and Mc"}
			</span>
		</div>
	);
}