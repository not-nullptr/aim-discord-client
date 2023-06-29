export interface State {
    token: string;
    title: string;
}

export interface IContext {
    state: State;
    setState: React.Dispatch<React.SetStateAction<State>>;
}
