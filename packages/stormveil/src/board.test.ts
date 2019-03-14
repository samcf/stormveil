import test from "tape";
import { resolve } from "./board";
import { marshal, unmarshal } from "./serialization";
import { Vector } from "./vector";

test("Board captures and moves", (assert) => {
    const tests: Array<[string, string, string, Vector, Vector]> = [
        [
            "Move without capture one space to the east.",
            `A _`,
            `_ A`,
            [0, 0],
            [1, 0],
        ],
        [
            "Move without capture one space to the west.",
            `_ A`,
            `A _`,
            [1, 0],
            [0, 0],
        ],
        [
            "Move without capture one space to the north.",
            `_ _ _\n_ K _\n_ _ _`,
            `_ K _\n_ _ _\n_ _ _`,
            [1, 1],
            [1, 0],
        ],
        [
            "Defender captures an attacker.",
            `_ A D\nD _ _`,
            `D _ D\n_ _ _`,
            [0, 1],
            [0, 0],
        ],
        [
            "King moves away from a castle.",
            `C _ _`,
            `T K _`,
            [0, 0],
            [1, 0],
        ],
        [
            "King moves away from a sanctuary.",
            `S _`,
            `R K`,
            [0, 0],
            [1, 0],
        ],
        [
            "King moves into a refuge.",
            `R K`,
            `S _`,
            [1, 0],
            [0, 0],
        ],
        [
            "King moves into a throne.",
            `T K`,
            `C _`,
            [1, 0],
            [0, 0],
        ],
        [
            "Attacker must totally surround the king to capture it.",
            `
                _ K A
                A _ _
            `,
            `
                A K A
                _ _ _
            `,
            [0, 1],
            [0, 0],
        ],
        [
            "Attacker captures multiple defenders.",
            `
                A D _ D A
                _ _ A _ _
            `,
            `
                A _ A _ A
                _ _ _ _ _
            `,
            [2, 1],
            [2, 0],
        ],
        [
            "Defender captures multiple attackers.",
            `
                _ _ D _ _
                _ _ A _ _
                _ D _ A D
            `,
            `
                _ _ D _ _
                _ _ _ _ _
                _ _ D _ D
            `,
            [1, 2],
            [2, 2],
        ],
        [
            "Defender captures an attacker using the king as an anvil.",
            `
                K A _
                _ _ D
            `,
            `
                K _ D
                _ _ _
            `,
            [2, 1],
            [2, 0],
        ],
        [
            "Attackers capture the king.",
            `
                _ A _
                _ K A
                A A _
            `,
            `
                _ A _
                A _ A
                _ A _
            `,
            [0, 2],
            [0, 1],
        ],
        [
            "Attackers capture the king and a defender.",
            `
                _ A _ _
                _ D A _
                _ _ K A
                _ A A _
            `,
            `
                _ A _ _
                _ _ A _
                _ A _ A
                _ _ A _
            `,
            [1, 3],
            [1, 2],
        ],
        [
            "Attackers capture the king against the edge of the board.",
            `
                A K A
                _ _ A
            `,
            `
                A _ A
                _ A _
            `,
            [2, 1],
            [1, 1],
        ],
        [
            "Attackers capture the king against the edge of the board and a refuge.",
            `
                R K A
                A _ _
            `,
            `
                R _ A
                _ A _
            `,
            [0, 1],
            [1, 1],
        ],
        [
            "Defenders may use thrones as anvils.",
            `D _ A T`,
            `_ D _ T`,
            [0, 0],
            [1, 0],
        ],
        [
            "Attackers may use thrones as anvils.",
            `A _ D T`,
            `_ A _ T`,
            [0, 0],
            [1, 0],
        ],
        [
            "Defenders may use the castle as an anvil.",
            `D _ A C`,
            `_ D _ C`,
            [0, 0],
            [1, 0],
        ],
        [
            "Attackers may not use the castle as an anvil.",
            `A _ D C`,
            `_ A D C`,
            [0, 0],
            [1, 0],
        ],
        [
            "Attackers may use refuges as anvils.",
            `A _ D R`,
            `_ A _ R`,
            [0, 0],
            [1, 0],
        ],
        [
            "Defenders may use refuges as anvils.",
            `D _ A R`,
            `_ D _ R`,
            [0, 0],
            [1, 0],
        ],
        [
            "Kings may use refuges as anvils.",
            `K _ A R`,
            `_ K _ R`,
            [0, 0],
            [1, 0],
        ],
        [
            "Kings may use refuges as anvils when moving from a castle.",
            `C _ A R`,
            `T K _ R`,
            [0, 0],
            [1, 0],
        ],
    ];

    tests.forEach(([message, board, expected, a, b]) => {
        const actual = resolve(unmarshal(board), a, b);
        const unmarshaled = unmarshal(expected);
        assert.deepEquals(
            actual,
            unmarshaled,
            message
                + "\n" + "Expected:\n" + marshal(unmarshaled)
                + "\n\n" + "Actual:\n" + marshal(actual),
        );
    });

    assert.end();
});
