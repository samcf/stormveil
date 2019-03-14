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

export function team(t: Tile): Team {
    switch (t) {
        case Tile.Defn:
        case Tile.King:
        case Tile.Cast:
        case Tile.Sanc:
            return Team.Defenders;
        case Tile.Attk:
            return Team.Attackers;
        default:
            return Team.None;
    }
}
