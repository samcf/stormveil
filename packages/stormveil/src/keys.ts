import { key } from "./board";
import { State } from "./state";
import { Vector } from "./vector";

// Key represents a single identity.
export type Key = number;

// KeySet represents a set of unique identities and the last identity that was
// assigned. This is used to maintain a persistent set of identities for the
// tiles in a board object. These identities will follow pieces as they move
// around the board, which is useful for animating their transitions in the UI.
// The `last` field is used to derive a new identity for tiles that are moved
// "away" from or created when the original tile is captured.
export interface KeySet {
    last: number;
    values: number[];
}

// createNewKeySet returns a new KeySet given an initial length.
export function createNewKeySet(length: number): KeySet {
    return {
        last: length - 1,
        values: Array.from({ length: length }).map((_, i) => i),
    };
}

// deriveNextKeySet returns a new KeySet as a function of the given state and
// start and stop vectors. This maintains the identity of moving tiles and
// creates new identities for the tile that was moved from. All identities are
// guaranteed to be unique within the KeySet.
export function deriveNextKeySet(state: State, [ ax, ay ]: Vector, [ bx, by ]: Vector): KeySet {
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
