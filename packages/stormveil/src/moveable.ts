import { allegiance } from "./allegiance";
import { Board, vec } from "./board";
import { moves } from "./moves";
import { Team } from "./team";
import { Vector } from "./vector";

// moveable returns a list of tile positions for the given team that have
// available legal moves.
// ex. moveable(state, Team.Attackers) => [[3, 0], [4, 0], [5, 0], [5, 1], ...]
export function moveable(s: Board, t: Team): Vector[] {
    const result = [];
    for (let i = 0; i < s.tiles.length; i += 1) {
        if (allegiance(s.tiles[i]) !== t) {
            continue;
        }

        const v = vec(s.width, i);
        const vs = moves(s, v);
        if (vs.length === 0) {
            continue;
        }

        result.push(v);
    }

    return result;
}
