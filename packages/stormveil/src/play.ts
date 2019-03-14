import { resolve } from "./board";
import { deriveNextKeySet } from "./keys";
import { opponent } from "./opponent";
import { State } from "./state";
import { Vector } from "./vector";

// play returns a new game state object that is advanced by one turn given a
// pair of vectors.
export function play(s: State, a: Vector, b: Vector): State {
    return {
        board: resolve(s.board, a, b),
        history: s.history.concat([[a, b]]),
        turn: opponent(s.turn),
        keys: deriveNextKeySet(s, a, b),
        initial: s.initial,
    };
}
