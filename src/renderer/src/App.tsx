import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import Login from "./pages/Login";
import Titlebar from "./components/Titlebar";
import { Context } from "./util/Context";
import { State } from "./types/State";
import { useState } from "react";
import WebSocketProvider from "./components/WebsocketProvider";
import Home from "./pages/Home";

export default function App() {
    const [state, setState] = useState<State>({} as State);
    return (
        <Context.Provider value={{ state, setState }}>
            <WebSocketProvider>
                <HashRouter>
                    <Titlebar />
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route path="/home" element={<Home />} />
                    </Routes>
                </HashRouter>
            </WebSocketProvider>
        </Context.Provider>
    );
}
