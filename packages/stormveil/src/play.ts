import { opponent } from "./opponent";
import { IState, key, resolve } from "./state";
import { KeySet } from "./types/keys";
import { Vector } from "./types/vector";

function deriveNextKeys(state: IState, [ ax, ay ]: Vector, [ bx, by ]: Vector): KeySet {
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

export function play(s: IState, a: Vector, b: Vector): IState {
    return {
        board: resolve(s.board, a, b),
        history: s.history.concat([[a, b]]),
        turn: opponent(s.turn),
        keys: deriveNextKeys(s, a, b),
        initial: s.initial,
    };
}
