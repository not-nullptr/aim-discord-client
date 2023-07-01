import { createContext } from "react";
import { IContext } from "../../../shared/types/State";

export const Context = createContext<IContext>({} as IContext);
