import { Tile } from "./tile";

export const enum Mask {
    Capturable = Tile.Attk | Tile.Defn | Tile.King | Tile.Cast,
    KingAnvils = Tile.Attk | Tile.Refu | Tile.None,
    KingLike   = Tile.King | Tile.Cast | Tile.Sanc,
}
