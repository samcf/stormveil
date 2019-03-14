import { Team } from "./team";
import { Tile } from "./tile";

export function allegiance(t: Tile): Team {
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
