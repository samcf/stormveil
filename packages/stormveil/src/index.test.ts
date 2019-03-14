import test from "tape";
import { hnefatafl } from "./boards";
import { createNew, tiles } from "./index";
import { play } from "./play";
import { Team } from "./team";

function isUnique<T>(values: T[]): boolean {
    for (let i = 0; i < values.length; i += 1) {
        for (let j = 0; j < values.length; j += 1) {
            if (i === j) { continue; }
            if (values[i] === values[j]) {
                return false;
            }
        }
    }

    return true;
}

test("Unique keys are created for every playable tile.", assert => {
    const state = createNew({ board: hnefatafl, start: Team.Attackers });
    const board = tiles(state);
    const keys = board.map(tile => tile.k).filter(k => k !== null);
    if (!isUnique(keys)) {
        assert.fail("Keyset is not unique.");
    }

    assert.end();
});

test("Keys are maintained across plays.", assert => {
    const state = createNew({ board: hnefatafl, start: Team.Attackers });
    const expected = tiles(state).find(t => t.x === 3 && t.y === 0);
    if (expected === undefined) {
        assert.error(new Error("cannot find tile at [3, 0]."));
        return;
    }

    const next = play(state, [3, 0], [3, 3]);
    const actual = tiles(next).find(t => t.x === 3 && t.y === 3);
    if (actual === undefined) {
        assert.error(new Error("cannot find tile at [3, 3]."));
        return;
    }

    assert.equals(actual.k, expected.k);
    assert.end();
});
