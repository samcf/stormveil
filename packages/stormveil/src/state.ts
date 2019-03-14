import { Board } from "./board";
import { Team } from "./team";
import { KeySet } from "./types/keys";
import { Vector } from "./types/vector";

interface SimpleState {
    board: Board;
    turn: Team;
}

export interface State extends SimpleState {
    history: Array<[Vector, Vector]>;
    initial: SimpleState;
    keys: KeySet;
}
