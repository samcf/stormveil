import { key, resolve } from "./board";
import { opponent } from "./opponent";
import { State } from "./state";
import { KeySet } from "./types/keys";
import { Vector } from "./types/vector";

// deriveNextKeys returns a new KeySet as a function of the given state and
// start and stop vectors. This maintains the identity of moving tiles and
// creates new identities for the tile that was moved from. All identities are
// guaranteed to be unique within the KeySet.
function deriveNextKeys(state: State, [ ax, ay ]: Vector, [ bx, by ]: Vector): KeySet {
    const { board: { width }, keys: { last, values } } = state;
    const latest = last + 1;
    const prev = key(width, ax, ay);
    const next = key(width, bx, by);
    const keys = values.slice();
    keys[next] = keys[prev];
    keys[prev] = latest;
    return {
        last: latest,
        values: keys,
    };
}

// play returns a new game state object that is advanced by one turn given a
// pair of vectors.
export function play(s: State, a: Vector, b: Vector): State {
    return {
        board: resolve(s.board, a, b),
        history: s.history.concat([[a, b]]),
        turn: opponent(s.turn),
        keys: deriveNextKeys(s, a, b),
        initial: s.initial,
    };
}
