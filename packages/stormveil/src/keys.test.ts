import test from "tape";
import { createNewKeySet, deriveNextKeySet } from "./keys";

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

test("KeySet values are unique.", assert => {
    const keySet = createNewKeySet(64);
    if (!isUnique(keySet.values)) {
        assert.fail("KeySet contains duplicate values.");
        return;
    }

    assert.end();
});

test("KeySet values remain unique after deriving new keys.", assert => {
    const prevKeySet = createNewKeySet(64);
    const nextKeySet = deriveNextKeySet(prevKeySet, 12, 17);
    if (!isUnique(nextKeySet.values)) {
        assert.fail("KeySet contains duplicate values.");
        return;
    }

    assert.end();
});

test("KeySet values are persistent after being moved.", assert => {
    const prevKeySet = createNewKeySet(64);
    const prevKey = prevKeySet.values[3];

    const nextKeySet = deriveNextKeySet(prevKeySet, 3, 42);
    const nextKey = nextKeySet.values[42];

    assert.equals(nextKey, prevKey);
    assert.end();
});
