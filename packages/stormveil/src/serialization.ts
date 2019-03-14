import { Board } from "./board";
import { partition } from "./partition";
import { Tile } from "./tile";

// flat returns a flattened shallow copy of the given collection.
function flat<T>([first, ...rest]: T[][]): T[] {
    return rest.reduce((result, coll) => result.concat(coll), first);
}

// encode returns a string representing the serialized version of the given
// tile.
function encode(t: Tile): string {
    switch (t) {
        case Tile.Attk: return "A";
        case Tile.Cast: return "C";
        case Tile.Defn: return "D";
        case Tile.Empt: return "_";
        case Tile.King: return "K";
        case Tile.None: return "N";
        case Tile.Refu: return "R";
        case Tile.Sanc: return "S";
        case Tile.Thrn: return "T";
        default:        return " ";
    }
}

// decode returns a Tile representing the unserialized representation of the
// given string, Tile.None if no appropriate tile is found.
function decode(s: string): Tile {
    switch (s) {
        case "A": return Tile.Attk;
        case "C": return Tile.Cast;
        case "D": return Tile.Defn;
        case "_": return Tile.Empt;
        case "K": return Tile.King;
        case "N": return Tile.None;
        case "R": return Tile.Refu;
        case "S": return Tile.Sanc;
        case "T": return Tile.Thrn;
        default:  return Tile.None;
    }
}

// marshal returns a human-readable representation of the given board object.
export function marshal(s: Board): string {
    const tiles = s.tiles.map(n => encode(n));
    return partition(tiles, s.width)
        .map(r => r.join(" "))
        .join("\n");
}

// unmarshal returns a new board from the given marshaled board string.
export function unmarshal(s: string): Board {
    const tiles = s
        .trim()
        .replace(/ /g, "")
        .split(/\n/g)
        .map(v => v.split(""))
        .map(v => v.map(decode));

    const [ sample ] = tiles;
    return { tiles: flat(tiles), width: sample.length };
}
