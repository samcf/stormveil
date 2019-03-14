import { IBoard } from "./board";
import { Team } from "./team";
import { Tile } from "./tile";
import { KeySet } from "./types/keys";
import { Vector } from "./types/vector";

interface ISimpleState {
    board: IBoard;
    turn: Team;
}

export interface IState extends ISimpleState {
    history: Array<[Vector, Vector]>;
    initial: ISimpleState;
    keys: KeySet;
}
