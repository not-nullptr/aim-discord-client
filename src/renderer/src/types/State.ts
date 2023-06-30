import { Guild, User } from "./Gateway";

export interface State {
    token: string;
    title: string;
    user: User;
    guilds: Guild[];
}

export interface IContext {
    state: State;
    setState: React.Dispatch<React.SetStateAction<State>>;
}
