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

// deriveNextKeySet returns a new KeySet derived from the given KeySet and the
// indexes at which the key is moving from and to. This function ensures that
// the next KeySet values remain unique, creating new unique values for indexes
// which are departed from.
export function deriveNextKeySet(keySet: KeySet, prev: number, next: number): KeySet {
    const { last, values } = keySet;
    const latest = last + 1;
    const keys = values.slice();
    keys[next] = keys[prev];
    keys[prev] = latest;
    return {
        last: latest,
        values: keys,
    };
}
