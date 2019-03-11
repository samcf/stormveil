import css from "classnames";
import * as Color from "d3-color";
import * as Scale from "d3-scale";
import React from "react";
import { CSSTransition } from "react-transition-group";
import { candidates, IState, ITile, moves, Team, team, Tile, tiles, turn } from "stormveil";
import styles from "./board.css";
import { groupBy, Vector } from "./common";
import { noise } from "./noise";

interface IProps {
    game: IState;
    isStarted: boolean;
    onMove: (a: Vector, b: Vector) => void;
    onSelect: (a: Vector | null) => void;
    selected: Vector | null;
    team: Team;
    tileSize?: number;
    viewAngle?: number;
}

function Piece(props: { tile: ITile }) {
    switch (props.tile.t) {
        case Tile.Attk:
            return ( <use transform="translate(-16, -28)" href="#sword" /> );
        case Tile.Defn:
            return ( <use transform="translate(-18, -16)" href="#shield" style={{ fill: "white" }} /> );
        case Tile.Thrn:
            return ( <use transform="translate(-16, -16)" href="#throne" style={{ fill: "white" }} /> );
        case Tile.Refu:
            return ( <use transform="translate(-16, -16)" href="#flag" /> );
        case Tile.King:
        case Tile.Cast:
        case Tile.Sanc:
            return ( <use transform="translate(-18, -16)" href="#king" style={{ fill: "white" }} /> );
        default:
            return null;
    }
}

const enum Face {
    Overlay,
    Top,
    Left,
    Right,
}

function faceName(face: Face): string {
    switch (face) {
        case Face.Left:    return "Left";
        case Face.Overlay: return "Overlay";
        case Face.Right:   return "Right";
        case Face.Top:     return "Top";
    }
}

export default class Board extends React.Component<IProps, {}> {
    private camera: {
        a: number;
        s: number;
        z: number;
    };

    constructor(props: IProps) {
        super(props);

        const { viewAngle = 12, tileSize = 64 } = props;
        this.camera = { a: viewAngle, s: tileSize / 2, z: 16 };
    }

    private positionByVector = ([ x, y ]: Vector): Vector => {
        const { a, s, z } = this.camera;
        return [
            (x - y) * s,
            (x + y) * (s - a) - z,
        ];
    }

    private positionByTile = ({ x, y }: ITile): Vector => {
        return this.positionByVector([ x, y ]);
    }

    private tileColor = (tile: ITile): Color.HSLColor => {
        const { x, y } = tile;
        const n = noise(x, y, 5, 3, 0.035);
        const s = (range: [number, number]) =>
            Scale.scaleLinear().domain([0, 1]).range(range)(n);

        if (this.isStartingTile(tile)) {
            return Color.hsl(40, 0.15, s([0.40, 0.50]), 1);
        }

        return Color.hsl(120, 0.20, s([0.40, 0.45]), 1);
    }

    private facePath = (_: ITile) => (face: Face) => {
        const { a, s, z } = this.camera;
        switch (face) {
            case Face.Overlay:
            case Face.Top:      return [ 0, -s + a,  s, 0, 0,       s - a, -s,       0];
            case Face.Left:     return [-s,      0, -s, z, 0, (s - a) + z,  0, (s - a)];
            case Face.Right:    return [ s,      0,  s, z, 0, (s - a) + z,  0, (s - a)];
        }
    }

    private faceColor = (tile: ITile) => (face: Face): Color.Color => {
        const color = this.tileColor(tile);
        switch (face) {
            case Face.Overlay:  return Color.rgb(0, 0, 0, 0);
            case Face.Top:      return color;
            case Face.Left:     return color.darker(0.75);
            case Face.Right:    return color.darker(2);
        }
    }

    private onSelectTile = (tile: ITile): void => {
        const { x, y } = tile;
        if (!this.isSelectable(tile)) {
            return;
        }

        const { selected } = this.props;
        if (selected === null) {
            this.props.onSelect([x, y]);
            return;
        }

        if (this.isSelected(tile)) {
            this.props.onSelect(null);
            return;
        }

        this.props.onMove(selected, [x, y]);
    }

    private isStartingTile = (tile: ITile): boolean => tile.i !== Tile.Empt;

    private isSelectable = (tile: ITile): boolean => {
        const { isStarted } = this.props;
        if (!isStarted) {
            return false;
        }

        const { game, team } = this.props;
        if (turn(game) !== team) {
            return false;
        }

        const { x, y } = tile;
        const { selected } = this.props;
        if (selected === null) {
            return candidates(game, team)
                .some(([ vx, vy ]) => vx === x && vy === y);
        }

        if (this.isSelected(tile)) {
            return true;
        }

        const [ sx, sy ] = selected;
        return moves(game, [sx, sy])
            .some(([ vx, vy ]) => vx === x && vy === y);
    }

    private isSelected = (tile: ITile): boolean => {
        const { x, y } = tile;
        const { selected } = this.props;
        if (selected === null) {
            return false;
        }

        const [ sx, sy ] = selected;
        return sx === x && sy === y;
    }

    private renderTiles = () =>
        tiles(this.props.game).map(tile => {
            const [ tx, ty ] = this.positionByTile(tile);
            const color = this.faceColor(tile);
            const path = this.facePath(tile);
            return (
                <g
                    key={[tile.x, tile.y].join(", ")}
                    style={{ transform: `translate(${tx}px, ${ty}px)` }}>
                    <g
                        onClick={() => this.onSelectTile(tile)}
                        className={css({
                            [styles.tileSelectable]: this.isSelectable(tile),
                        })}>
                        {[Face.Top, Face.Overlay, Face.Left, Face.Right].map(face => (
                            <polygon
                                key={face}
                                points={path(face).join(", ")}
                                style={{ fill: color(face).toString() }}
                                className={css({
                                    [styles.tileFace]: true,
                                    [styles["tileFace" + faceName(face)]]: true,
                                })} />
                        ))}
                    </g>
                </g>
            );
        })

    private renderLastMove = () => {
        const { game, team } = this.props;
        const last = game.history[game.history.length - 1];
        if (last === undefined || turn(game) !== team) {
            return null;
        }

        const [ a, b ] = last;
        const [ ax, ay ] = this.positionByVector(a);
        const [ bx, by ] = this.positionByVector(b);
        return (
            <line
                className={styles.moveMarker}
                x1={ax}
                y1={ay}
                x2={bx}
                y2={by}
                markerEnd="url(#moveMarkerHead)" />
        );
    }

    private renderTileContents = () => {
        const { game, isStarted, team: playing } = this.props;
        const groups = groupBy(tiles(game), tile => team(tile.t));
        return Object.keys(groups).map(type => (
            <g key={type} className={css({ [styles.bounce]: !isStarted && Number(type) === playing })}>
                {groups[type].slice().sort((a, b) => a.k - b.k).map(tile => {
                    if (tile.t & (Tile.Empt | Tile.None)) {
                        return null;
                    }

                    const [ tx, ty ] = this.positionByTile(tile);
                    return (
                        <g
                            key={tile.k}
                            style={{ transform: `translate(${tx}px, ${ty}px)` }}
                            className={styles.pieceGroup}>
                            <svg viewBox="0 0 32 32" width="28" height="28" style={{ overflow: "visible" }}>
                                <Piece tile={tile} />
                            </svg>
                        </g>
                    );
                })}
            </g>
        ));
    }

    public render() {
        return (
            <svg width="704" height="456">
                <defs>
                    <marker id="moveMarkerHead" orient="auto" markerWidth="2" markerHeight="4" refX="0.1" refY="2">
                        <path d="M0,0 V4 L2,2 Z" style={{ fill: "rgba(255, 0, 0, 0.4)" }} />
                    </marker>
                </defs>
                <g transform="translate(352, 37)">
                    <g>
                        {this.renderTiles()}
                    </g>
                    {this.renderLastMove()}
                    <CSSTransition
                        in
                        appear
                        timeout={250}
                        classNames={{
                            appear: styles.piecesGroupAppear,
                            appearActive: styles.piecesGroupAppearActive,
                            enterDone: styles.piecesGroupEnterDone,
                        }}>
                        <g className={styles.piecesGroup}>
                            {this.renderTileContents()}
                        </g>
                    </CSSTransition>
                </g>
            </svg>
        );
    }
}
