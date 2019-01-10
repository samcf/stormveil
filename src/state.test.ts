import test from "tape";
import { play, createNew } from "./state";
import { unmarshal } from "./board";
import { Side } from "./side";

test("Shallow exercises for 'createNew' and 'play' state functions.", assert => {
    const start = Side.Attackers;
    const board = unmarshal`
        R _ A _ R
        _ _ D _ _
        A D K D A
        _ _ D _ _
        R _ A _ R
    `;

    let s = createNew({ board, start });
    assert.deepEquals(s.board, board, "Board state reflects board passed in options.");
    assert.deepEquals(s.initial.board, board, "Initial board state is persisted immutably.");
    assert.equals(s.initial.turn, Side.Attackers, "Initial turn state is persisted immutably.");
    assert.equals(s.turn, Side.Attackers, "Turn state reflects board passed in options.");

    s = play(s, [0, 2], [0, 1]);
    assert.deepEquals(s.initial.board, board, "Initial board state never changes.");
    assert.equals(s.initial.turn, Side.Attackers, "Initial turn state never changes.");
    assert.equals(s.turn, Side.Defenders, "Turn state cycles between attackers and defenders after plays.");

    assert.end();
});
