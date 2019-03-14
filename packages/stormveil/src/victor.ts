import { IBoard } from "./state";
import { Team } from "./team";
import { Tile } from "./tile";

export function victor(s: IBoard): Team | null {
    let kf = false;
    let af = false;
    for (let i = 0; i < s.tiles.length; i += 1) {
        const t = s.tiles[i];
        if (t === Tile.Sanc) {
            return Team.Defenders;
        }

        if (t & (Tile.King | Tile.Cast)) {
            kf = true;
        }

        if (t === Tile.Attk) {
            af = true;
        }
    }

    if (!kf) {
        return Team.Attackers;
    }

    if (!af) {
        return Team.Defenders;
    }

    return null;
}
