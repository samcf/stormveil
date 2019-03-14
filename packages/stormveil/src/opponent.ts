import { Team } from "./team";

// opponent returns the team that is opposing the given team. This may throw
// an exception if the given team is Team.None since there is no sensible
// opponent for it.
export function opponent(t: Team): Team {
    switch (t) {
        case Team.Attackers:
            return Team.Defenders;
        case Team.Defenders:
            return Team.Attackers;
        case Team.None:
            throw new Error();
    }
}
