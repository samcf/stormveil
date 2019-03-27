import { Board } from "./board";
import { aleaevangelli, arddi, brandubh, hnefatafl, tablut, tawlbwrrd } from "./boards";
import { unmarshal } from "./serialization";

export const enum BoardVariant {
    AleaEvangelli,
    ArdRi,
    Brandubh,
    Hnefatafl,
    Tablut,
    TawlBwrrd,
}

export function getVariantName(variant: BoardVariant): string {
    switch (variant) {
        case BoardVariant.AleaEvangelli:    return "Alea Evangelli";
        case BoardVariant.ArdRi:            return "Ard Ri";
        case BoardVariant.Brandubh:         return "Brandubh";
        case BoardVariant.Hnefatafl:        return "Hnefatafl";
        case BoardVariant.Tablut:           return "Tablut";
        case BoardVariant.TawlBwrrd:        return "Tawl Bwrrd";
        default:                            return "";
    }
}

export function getBoardFromVariant(variant: BoardVariant): Board {
    switch (variant) {
        case BoardVariant.AleaEvangelli:    return unmarshal(aleaevangelli);
        case BoardVariant.ArdRi:            return unmarshal(arddi);
        case BoardVariant.Brandubh:         return unmarshal(brandubh);
        case BoardVariant.Hnefatafl:        return unmarshal(hnefatafl);
        case BoardVariant.Tablut:           return unmarshal(tablut);
        case BoardVariant.TawlBwrrd:        return unmarshal(tawlbwrrd);
        default:                            return unmarshal(hnefatafl);
    }
}
