import { allegiance } from "./allegiance";
import { Mask } from "./masks";
import { offsets } from "./offsets";
import { Team } from "./team";
import { Tile } from "./tile";
import { Vector } from "./types/vector";

// The board is represented as a flat array of Tile and a width. This width is
// used to determine which indexes to partition the tiles array when performing
// lookups with a vector.
export interface Board {
    tiles: Tile[];
    width: number;
}

// clone returns a copy of the given board. Mutations to this board will not
// affect the passed board.
function clone(s: Board): Board {
    return { tiles: s.tiles.slice(), width: s.width };
}

// vec returns a Vector given a width and an index. This is useful to derive
// an [x, y] position when, for example, iterating over the tiles array.
export function vec(w: number, i: number): Vector {
    return [i % w, Math.floor(i / w)];
}

// key returns a number that represents the index into the tiles array given
// a width and [x, y] position.
export function key(w: number, x: number, y: number): number {
    return w * y + x;
}

// get returns the Tile found at the given [x, y] position or Tile.None if the
// position is out of bounds.
export function get(s: Board, x: number, y: number): Tile {
    const t = s.tiles[key(s.width, x, y)];
    if (t === undefined) {
        return Tile.None;
    }

    return t;
}

// set mutates the given board, setting the given [x, y] position to the given
// Tile. This function is mutative.
function set(s: Board, x: number, y: number, t: Tile): void {
    s.tiles[key(s.width, x, y)] = t;
}

// capture mutates the given board, replacing the given [x, y] position with
// the tile that is "underneath" the captured tile. This is usually the empty
// tile, but may be the throne if the captured piece was a king on top of the
// throne (a castle).
function capture(s: Board, x: number, y: number): void {
    set(s, x, y, away(get(s, x, y)));
}

// anvils returns true if a is an anvil to b, or vice-versa. To anvil a tile
// means to act as part of the capturing side. Anvils are typically opponent
// tiles, but may be certain neutral tiles as well.
function anvils(a: Tile, b: Tile): boolean {
    if (a === Tile.Thrn || b === Tile.Thrn) {
        return true;
    }

    if (a === Tile.Refu || b === Tile.Refu) {
        return true;
    }

    if (allegiance(a) === Team.None || allegiance(b) === Team.None) {
        return false;
    }

    return allegiance(a) !== allegiance(b);
}

// into returns the Tile that the given tile `a` becomes when moving into the
// tile `b`. For example, the king becomes the castle when moving into the
// throne.
function into(a: Tile, b: Tile): Tile {
    switch (b) {
        case Tile.Thrn:
            return Tile.Cast;
        case Tile.Refu:
            return Tile.Sanc;
        default:
            return a;
    }
}

// away returns the Tile that the given Tile becomes once it has been moved
// away from. For example, the castle becomes the throne once the king has
// moved away from it. This returns the given tile if there is no appropriate
// away tile.
function away(a: Tile): Tile {
    switch (a) {
        case Tile.Cast:
            return Tile.Thrn;
        case Tile.Sanc:
            return Tile.Refu;
        default:
            return Tile.Empt;
    }
}

// inside returns tile that is "occupying" the given tile. For example, the
// king is "inside" the castle. This returns the given tile if there is no
// appropriate inside tile.
function inside(a: Tile): Tile {
    switch (a) {
        case Tile.Cast:
        case Tile.Sanc:
            return Tile.King;
        default:
            return a;
    }
}

// resolve returns a new board that has been changed as a function of the
// given board and requested move. Note that this function does not perform
// any move validation.
export function resolve(s: Board, [ax, ay]: Vector, [bx, by]: Vector): Board {
    const state = clone(s);
    const tile = get(state, ax, ay);
    set(state, ax, ay, away(tile));
    set(state, bx, by, into(inside(tile), get(state, bx, by)));

    for (let i = 0; i < 8; i += 2) {
        const ox = offsets[i];
        const oy = offsets[i + 1];
        const cx = bx + ox;
        const cy = by + oy;
        const adjc = get(state, cx, cy);

        // Continue early when the adjacent tile is not a capturable tile.
        if (adjc & ~Mask.Capturable) {
            continue;
        }

        // Continue early when the adjacent tile does not anvil the playing
        // tile.
        if (!anvils(tile, adjc)) {
            continue;
        }

        // The adjacent tile is an enemy: determine if it is being captured
        // by checking the next tile across. When the "anvil" is either None
        // or on the same side as the moving tile, the center tile is
        // considered captured.
        const vx = bx + (ox * 2);
        const vy = by + (oy * 2);
        if (anvils(adjc, get(state, vx, vy)) && (adjc & ~Mask.KingLike)) {
            capture(state, cx, cy);
        }

        // Attackers may capture the king only when they have the king
        // surrounded on all four sides.
        if ((tile & Tile.Attk) && (adjc & Tile.King)
            && (get(state, cx, cy + 1) & Mask.KingAnvils)
            && (get(state, cx, cy - 1) & Mask.KingAnvils)
            && (get(state, cx + 1, cy) & Mask.KingAnvils)
            && (get(state, cx - 1, cy) & Mask.KingAnvils)) {
            capture(state, cx, cy);
        }
    }

    return state;
}
