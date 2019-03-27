import { allegiance } from "./allegiance";
import { Board, vec } from "./board";
import { createNewKeySet, Key } from "./keys";
import { unmarshal } from "./serialization";
import { State } from "./state";
import { Team } from "./team";
import { Tile } from "./tile";

export { best } from "./ai";
export { allegiance } from "./allegiance";
export { Board } from "./board";
export { moveable } from "./moveable";
export { moves } from "./moves";
export { opponent } from "./opponent";
export { play } from "./play";
export { State } from "./state";
export { Team } from "./team";
export { Tile } from "./tile";
export { victor } from "./victor";

interface IOptions {
    board: Board | string;
    start: Team;
}

interface StrictOptions {
    board: Board;
    start: Team;
}

export interface ITile {
    x: number;
    y: number;
    t: Tile;
    i: Tile;
    k: Key;
}

function unwrap(options: IOptions): StrictOptions {
    return Object.keys(options).reduce((result, option) => {
        switch (option) {
            case "board": {
                const value = options[option];
                if (typeof value === "string") {
                    return { ...result, board: unmarshal(value) };
                }

                return { ...result, board: value };
            }

            case "start":
                return { ...result, start: options[option]};

            default:
                return result;
        }
    }, {} as StrictOptions);
}

// createNew returns a new State object from the given options configuration.
export function createNew(options: IOptions): State {
    const { board, start } = unwrap(options);
    return {
        board: board,
        history: [],
        initial: { board: board, turn: start },
        keys: createNewKeySet(board.tiles.length),
        turn: start,
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
