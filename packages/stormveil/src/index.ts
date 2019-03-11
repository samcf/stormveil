import { unmarshal } from "./serialization";
import { IBoard, IState, moveable, moves as movesfoo, team, vec } from "./state";
import { Team } from "./team";
import { Tile } from "./tile";
import { Key } from "./types/keys";
import { Vector } from "./types/vector";

export { best } from "./ai";
export { IState, play, team } from "./state";
export { Team } from "./team";
export { Tile } from "./tile";

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

export function createNew(options: IOptions): IState {
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

export function tiles(state: IState): ITile[] {
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

export function turn(state: IState) {
    return state.turn;
}

export function candidates(state: IState, team: Team) {
    return moveable(state.board, team);
}

export function moves(state: IState, xy: Vector) {
    return movesfoo(state.board, xy);
}

export function captured(state: IState, t: Team): number {
    const count = (board: IBoard) => board.tiles.filter((tile: Tile) => team(tile) === t).length;
    return count(state.initial.board) - count(state.board);
}
