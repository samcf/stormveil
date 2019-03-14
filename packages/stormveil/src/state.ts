import { Mask } from "./masks";
import { offsets } from "./offsets";
import { Team } from "./team";
import { Tile } from "./tile";
import { KeySet } from "./types/keys";
import { Vector } from "./types/vector";

export interface IBoard {
    tiles: Tile[];
    width: number;
}

interface ISimpleState {
    board: IBoard;
    turn: Team;
}

export interface IState extends ISimpleState {
    history: Array<[Vector, Vector]>;
    initial: ISimpleState;
    keys: KeySet;
}

function clone(s: IBoard): IBoard {
    return { tiles: s.tiles.slice(), width: s.width };
}

export function vec(w: number, i: number): Vector {
    return [i % w, Math.floor(i / w)];
}

export function key(w: number, x: number, y: number): number {
    return w * y + x;
}

export function get(s: IBoard, x: number, y: number): Tile {
    const t = s.tiles[key(s.width, x, y)];
    if (t === undefined) {
        return Tile.None;
    }

    return t;
}

function set(s: IBoard, x: number, y: number, t: Tile): void {
    s.tiles[key(s.width, x, y)] = t;
}

function capture(s: IBoard, x: number, y: number): void {
    set(s, x, y, away(get(s, x, y)));
}

export function capturable(t: Tile): boolean {
    return Boolean(t & Mask.Capturable);
}

export function team(t: Tile): Team {
    switch (t) {
        case Tile.Defn:
        case Tile.King:
        case Tile.Cast:
        case Tile.Sanc:
            return Team.Defenders;
        case Tile.Attk:
            return Team.Attackers;
        default:
            return Team.None;
    }
}

function hostile(a: Tile, b: Tile): boolean {
    if (a === Tile.Thrn || b === Tile.Thrn) {
        return true;
    }

    if (a === Tile.Refu || b === Tile.Refu) {
        return true;
    }

    if (team(a) === Team.None || team(b) === Team.None) {
        return false;
    }

    return team(a) !== team(b);
}

function inside(a: Tile): Tile {
    switch (a) {
        case Tile.Cast:
        case Tile.Sanc:
            return Tile.King;
        default:
            return a;
    }
}

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

export function resolve(s: IBoard, [ax, ay]: Vector, [bx, by]: Vector): IBoard {
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

        // Continue early when the adjacent tile is not hostile to the playing
        // tile.
        if (!hostile(tile, adjc)) {
            continue;
        }

        // The adjacent tile is an enemy: determine if it is being captured
        // by checking the next tile across. When the "anvil" is either None
        // or on the same side as the moving tile, the center tile is
        // considered captured.
        const vx = bx + (ox * 2);
        const vy = by + (oy * 2);
        if (hostile(adjc, get(state, vx, vy)) && (adjc & ~Mask.KingLike)) {
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
