import { Routes, Route, HashRouter, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Titlebar from "./components/Titlebar";
import { Context } from "./util/Context";
import { State } from "../../shared/types/State";
import { useState } from "react";
import Home from "./pages/Home";
import Message from "./pages/Message";
import { IpcRenderer } from "electron";
const { ipcRenderer }: { ipcRenderer: IpcRenderer } =
    window.require("electron");

export default function App() {
    const initialState = ipcRenderer.sendSync("get-state");
    const [reactState, setReactState] = useState<State>(initialState as State);
    function setState(newState: State | ((prevState: State) => State)) {
        ipcRenderer.send("set-state", newState);
        setReactState(newState);
    }
    ipcRenderer.on("set-state", (_, state) => {
        console.log(state);
        setReactState((prevState) => ({
            ...state,
            title: prevState.title,
        }));
    });
    return (
        <Context.Provider value={{ state: reactState, setState }}>
            <HashRouter>
                <Titlebar />
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/message" element={<Message />} />
                </Routes>
            </HashRouter>
        </Context.Provider>
    );
}
