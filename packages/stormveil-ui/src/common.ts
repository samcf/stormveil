export type Vector = [number, number];

export function groupBy<T>(collection: T[], iteratee: (value: T) => string | number) {
    const result: { [key: string]: T[] } = {};
    for (let i = 0; i < collection.length; i += 1) {
        const key = iteratee(collection[i]);
        if (key in result) {
            result[key] = result[key].concat(collection[i]);
            continue;
        }

        result[key] = [collection[i]];
    }

    return result;
}
