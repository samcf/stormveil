// partition returns a two dimensional array of the elements found in the given
// collection, broken up at the given size.
// ex. partition([1, 2, 3, 4], 2) => [[1, 2], [3, 4]]
export function partition<T>(coll: T[], size: number): T[][] {
    const result = [];
    for (let i = 0; i < coll.length; i += size) {
        result.push(coll.slice(i, i + size));
    }

    return result;
}
