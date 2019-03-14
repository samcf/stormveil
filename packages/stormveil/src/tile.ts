// Tile is an enum of all possible Tiles. Note the values: increasing powers of
// 2 make these tiles useful within bitmasks.
export const enum Tile {
    None =   1,
    Empt =   2,
    Attk =   4,
    Defn =   8,
    King =  16,
    Thrn =  32,
    Refu =  64,
    Cast = 128,
    Sanc = 256,
}
