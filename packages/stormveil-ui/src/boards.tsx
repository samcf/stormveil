import css from "classnames";
import React from "react";
import { Board, Tile } from "stormveil";
import { BoardVariant, getBoardFromVariant } from "stormveil/lib/variants";
import styles from "./boards.css";

interface Props {
    onSelect: (variant: BoardVariant) => void;
    selected: BoardVariant;
}

const BOARD_VARIANTS = [
    BoardVariant.ArdRi,
    BoardVariant.Brandubh,
    BoardVariant.Hnefatafl,
    BoardVariant.Tablut,
    BoardVariant.TawlBwrrd,
];

function SimpleBoard(props: { board: Board; }) {
    const { board } = props;
    const style = {
        gridTemplateRows: `repeat(${board.width}, auto)`,
        gridTemplateColumns: `repeat(${board.width}, auto)`,
    };

    const classNames = (tile: Tile) => {
        switch (tile) {
            case Tile.Defn:
            case Tile.King:
            case Tile.Cast:
            case Tile.Sanc:
            case Tile.Thrn:
                return css(styles.piece, styles.defender);
            case Tile.Attk:
                return css(styles.piece, styles.attacker);
            default:
                return "";
        }
    };

    return (
        <div className={styles.board} style={style}>
            {board.tiles.map((tile, i) => (
                <div key={i} className={styles.tile}>
                    <div className={classNames(tile)} />
                </div>
            ))}
        </div>
    );
}

export default function(props: Props) {
    return (
        <div className={styles.boards}>
            {BOARD_VARIANTS.map(variant => (
                <div
                    key={variant}
                    className={styles.boardVariant}
                    onClick={() => props.onSelect(variant)}>
                    <SimpleBoard board={getBoardFromVariant(variant)} />
                </div>
            ))}
        </div>
    );
}
