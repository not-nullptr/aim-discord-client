import { ReadyPacket } from "./Gateway";

export interface State {
    token: string;
    title: string;
    initialReady: ReadyPacket;
}

export interface IContext {
    state: State;
    setState: (newState: State) => void;
}
