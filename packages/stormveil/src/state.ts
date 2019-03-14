import { Board } from "./board";
import { KeySet } from "./keys";
import { Team } from "./team";
import { Vector } from "./vector";

// SimpleState a board value and current turn.
interface SimpleState {
    board: Board;
    turn: Team;
}

// State represents the total game state, containing the board object, the
// current turn, a history of moves, an immutable copy of the initial board
// object, and a KeySet to track persistent tile identities.
export interface State extends SimpleState {
    history: Array<[Vector, Vector]>;
    initial: SimpleState;
    keys: KeySet;
}
