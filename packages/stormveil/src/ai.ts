import { allegiance } from "./allegiance";
import { Board, resolve, vec } from "./board";
import { Mask } from "./masks";
import { moves } from "./moves";
import { opponent } from "./opponent";
import { Team } from "./team";
import { Vector } from "./types/vector";

type Move = [Vector, Vector];

// evaluate returns a score of the given board relative to the given team. This
// score should reflect the relative strength of the board -- the higher the
// score, the stronger the position of the given team.
function evaluate(board: Board, turn: Team): number {
    let sum = 0;
    for (let i = 0; i < board.tiles.length; i += 1) {
        const t = board.tiles[i];
        const s = allegiance(t);
        if (t & ~Mask.Capturable) {
            continue;
        }

        if (turn === s) {
            sum = sum + 1;
            continue;
        }

        sum = sum - 1;
    }

    return sum;
}

// iterate is a utility to iterate over the possible moves that the given team
// can make in the given board. It invokes the given function for each move
// with the start and stop vectors and returns nothing.
function iterate(board: Board, turn: Team, fn: (a: Vector, b: Vector) => void): void {
    for (let i = 0; i < board.tiles.length; i += 1) {
        const t = board.tiles[i];
        if (allegiance(t) !== turn) {
            continue;
        }

        const a = vec(board.width, i);
        const bs = moves(board, a);
        if (bs.length === 0) {
            continue;
        }

        for (let j = 0; j < bs.length; j += 1) {
            fn(a, bs[j]);
        }
    }
}

// minimax returns the score of either the strongest or weakest board position
// from the tree of all possible board positions up to `depth`.
function minimax(board: Board, turn: Team, depth: number, maximizing: boolean): number {
    const adversary = opponent(turn);
    if (depth === 0) {
        return evaluate(board, adversary);
    }

    const compare = maximizing ? Math.max : Math.min;
    let result = maximizing ? -Infinity : Infinity;
    iterate(board, turn, (a, b) => {
        result = compare(result, minimax(resolve(board, a, b), adversary, depth - 1, !maximizing));
    });

    return result;
}

// best returns the strongest move that the given team should perform to
// increase their chances of winning the game. This searches only a subset of
// all possible move trees, up to `depth`.
export function best(board: Board, turn: Team, depth: number): Move {
    let result: Move | null = null;
    let r = -Infinity;
    iterate(board, turn, (a, b) => {
        const v = minimax(resolve(board, a, b), opponent(turn), depth - 1, false);
        if (v > r) {
            r = v;
            result = [a, b];
        }
    });

    if (result == null) {
        throw new Error();
    }

    return result;
}
