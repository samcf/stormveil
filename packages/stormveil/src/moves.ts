import { get, Board } from "./board";
import { Mask } from "./masks";
import { offsets } from "./offsets";
import { Tile } from "./tile";
import { Vector } from "./types/vector";

function allowed(t: Tile, u: Tile): boolean {
    if (u & Tile.Empt) {
        return true;
    }

    if ((t & Mask.KingLike) &&
        (u & (Tile.Thrn | Tile.Refu))) {
        return true;
    }

    return false;
}

export function moves(s: Board, [ax, ay]: Vector): Vector[] {
    const m = [];
    const t = get(s, ax, ay);

    for (let i = 0; i < 8; i += 2) {
        const ox = offsets[i];
        const oy = offsets[i + 1];
        for (let k = 1; k < Infinity; k += 1) {
            const bx = ax + (ox * k);
            const by = ay + (oy * k);
            if (bx < 0 || bx >= s.width) {
                break;
            }

            const n = get(s, bx, by);
            if (t & Tile.Defn && n & Tile.Thrn) {
                continue;
            }

            if (allowed(t, n)) {
                m.push([bx, by] as Vector);
                continue;
            }

            break;
        }
    }

    return m;
}
