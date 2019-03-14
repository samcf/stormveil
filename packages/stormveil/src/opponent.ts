import { Team } from "./team";

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
