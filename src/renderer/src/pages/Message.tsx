import { Context } from "@renderer/util/Context";
import { useContext } from "react";

export default function Message() {
    const { state } = useContext(Context);
    return (
        <div>
            <h1>{state.initialReady?.user.username}</h1>
        </div>
    );
}
