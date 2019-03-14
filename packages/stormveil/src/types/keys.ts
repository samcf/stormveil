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
