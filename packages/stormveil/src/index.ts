import { allegiance } from "./allegiance";
import { Board, vec } from "./board";
import { unmarshal } from "./serialization";
import { State } from "./state";
import { Team } from "./team";
import { Tile } from "./tile";
import { Key } from "./keys";

export { best } from "./ai";
export { allegiance } from "./allegiance";
export { moveable } from "./moveable";
export { moves } from "./moves";
export { opponent } from "./opponent";
export { play } from "./play";
export { State } from "./state";
export { Team } from "./team";
export { Tile } from "./tile";
export { victor } from "./victor";

interface IOptions {
    board: string;
    start: Team;
}

export interface ITile {
    x: number;
    y: number;
    t: Tile;
    i: Tile;
    k: Key;
}

// createNew returns a new State object from the given options configuration.
export function createNew(options: IOptions): State {
    const board = unmarshal(options.board);
    return {
        board: board,
        history: [],
        initial: { board: board, turn: options.start },
        keys: {
            last: board.tiles.length,
            values: board.tiles.map((_, i) => i),
        },
        turn: options.start,
    };
}

// tiles returns an array of rich tile descriptions which includes their type,
// position, unique idendity, and initial type.
export function tiles(state: State): ITile[] {
    const { board, initial, keys } = state;
    return board.tiles.map((tile, i) => {
        const [ x, y ] = vec(board.width, i);
        return {
            x: x,
            y: y,
            t: tile,
            i: initial.board.tiles[i],
            k: keys.values[i],
        };
    });
}

// captured returns the number of pieces that have been captured as the given
// team.
export function captured(state: State, t: Team): number {
    const count = (board: Board) => board.tiles.filter((tile: Tile) => allegiance(tile) === t).length;
    return count(state.initial.board) - count(state.board);
}
