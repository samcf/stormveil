import { allegiance } from "./allegiance";
import { IBoard, vec } from "./board";
import { moves } from "./moves";
import { Team } from "./team";
import { Vector } from "./types/vector";

export function moveable(s: IBoard, t: Team): Vector[] {
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
