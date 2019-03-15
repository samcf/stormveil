import { key, resolve } from "./board";
import { deriveNextKeySet } from "./keys";
import { opponent } from "./opponent";
import { State } from "./state";
import { Vector } from "./vector";

// play returns a new game state object that is advanced by one turn given a
// pair of vectors.
export function play(s: State, a: Vector, b: Vector): State {
    const { board: { width } } = s;
    const [ ax, ay ] = a;
    const [ bx, by ] = b;
    return {
        board: resolve(s.board, a, b),
        history: s.history.concat([[a, b]]),
        turn: opponent(s.turn),
        keys: deriveNextKeySet(s.keys, key(width, ax, ay), key(width, bx, by)),
        initial: s.initial,
    };
}
