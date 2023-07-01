import Divider from "../components/Divider";
import splash from "../img/splash.png";
import { useContext, useEffect, useRef, useState } from "react";
import { Context } from "../util/Context";
import "../css/Login.css";
import { useNavigate } from "react-router-dom";
const { ipcRenderer } = window.require("electron");

export default function Login() {
    const { state, setState } = useContext(Context);
    const [error] = useState("");
    const initialRef = useRef<any | null>(null);
    ipcRenderer.on("go-to-route", (_, route: string) => {
        navigate(route);
    });
    useEffect(() => {
        setState({
            ...state,
            title: "Sign On",
        });
    }, []);
    useEffect(() => {
        initialRef.current = state?.initialReady;
    }, [state]);
    function waitForInitial(): Promise<any> {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (initialRef.current !== null) {
                    clearInterval(interval);
                    resolve(initialRef.current);
                }
            }, 100);
        });
    }
    const navigate = useNavigate();
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
            }}
        >
            <img
                src={splash}
                style={{
                    padding: "5px",
                    width: 190,
                    height: 150,
                    margin: "auto",
                }}
            />
            <Divider
                style={{
                    margin: "2px 5px 4px",
                    width: "calc(100% - 12px)",
                }}
            />
            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    ipcRenderer.send(
                        "start-gateway",
                        (e.target as any).token.value
                    );
                    setState({
                        ...state,
                        token: (e.target as any).token.value,
                    });
                    waitForInitial().then(() => {
                        navigate("/home");
                    });
                }}
                className="login-form"
            >
                <label htmlFor="token">
                    Token
                    <input
                        name="token"
                        placeholder="Discord Token"
                        type="text"
                        defaultValue={ipcRenderer.sendSync("get-debug-token")}
                    />
                </label>
                {/* <label htmlFor="login">
                    Screen Name
                    <input
                        name="login"
                        placeholder="xX_AW350M3_US3RN4M3_Xx"
                        type="text"
                    />
                    <a href="#">Get a Screen Name</a>
                </label>
                <label htmlFor="password">
                    Password
                    <input name="password" type="password" />
                    <a href="#">Forgot Password?</a>
                </label> */}
                {/* <div className="login-form-checks">
                    <label htmlFor="save-password">
                        <input
                            name="save-password"
                            type="checkbox"
                            defaultChecked
                        />
                        Save Password
                    </label>
                </div> */}
                <div className="login-form-error">{error}</div>
                <input
                    type="submit"
                    value="Sign On"
                    style={{
                        position: "absolute",
                        bottom: "10px",
                        width: "40%",
                        alignSelf: "flex-end",
                        fontWeight: "bold",
                    }}
                />
                {/* {requiresCaptcha && (
                    <HCaptcha
                        sitekey={captchaSitekey}
                        onVerify={(token) => {
                            console.log(token);
                        }}
                    />
                )} */}
            </form>
        </div>
    );
}
