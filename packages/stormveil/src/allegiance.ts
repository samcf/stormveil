import { Team } from "./team";
import { Tile } from "./tile";

// allegiance returns the Team of the given Tile, Team.None for tiles that have
// no specific team (such as Tile.Empty).
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
