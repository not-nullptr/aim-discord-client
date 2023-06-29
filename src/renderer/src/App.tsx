import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Titlebar from "./components/Titlebar";
import { Context } from "./util/Context";
import { State } from "./types/State";
import { useState } from "react";
import WebSocketProvider from "./components/WebsocketProvider";

export default function App() {
    const [state, setState] = useState<State>({} as State);
    return (
        <Context.Provider value={{ state, setState }}>
            <WebSocketProvider>
                <BrowserRouter>
                    <Titlebar />
                    <Routes>
                        <Route path="/" element={<Login />} />
                    </Routes>
                </BrowserRouter>
            </WebSocketProvider>
        </Context.Provider>
    );
}
