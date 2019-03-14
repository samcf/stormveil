import test from "tape";
import { marshal, unmarshal } from "./serialization";
import { Team } from "./team";
import { victor } from "./victor";

test("Victory conditions.", assert => {
    const tests: Array<[string, Team | null]> = [
        [`C D D A A`, null],
        [`A A D D K`, null],
        [`A`, Team.Attackers],
        [`K`, Team.Defenders],
        [`K D`, Team.Defenders],
        [`A D`, Team.Attackers],
        [`A A A A A`, Team.Attackers],
        [`A A D D S`, Team.Defenders],
        [`A A D D R`, Team.Attackers],
    ];

    for (const [ board, expected ] of tests) {
        const actual = victor(unmarshal(board));
        assert.equals(
            actual,
            expected,
            "Expected victor of the following board: "
                + "\n" + marshal(unmarshal(board))
                + "\n to be "
                + expected,
        );
    }

    assert.end();
});
