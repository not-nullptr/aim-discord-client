import { Guild, ReadyPacket, User } from "./Gateway";

export interface State {
    token: string;
    title: string;
    initialReady: ReadyPacket;
}

export interface IContext {
    state: State;
    setState: React.Dispatch<React.SetStateAction<State>>;
}
