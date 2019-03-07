import css from "classnames";
import * as Color from "d3-color";
import * as Scale from "d3-scale";
import React from "react";
import { CSSTransition } from "react-transition-group";
import { candidates, IState, ITile, moves, Team, team, Tile, tiles, turn } from "stormveil";
import { Vector } from "./common";
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

const enum Face {
    Overlay,
    Top,
    Left,
    Right,
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

    private faceName = (face: Face): string => {
        switch (face) {
            case Face.Left:    return "Left";
            case Face.Overlay: return "Overlay";
            case Face.Right:   return "Right";
            case Face.Top:     return "Top";
        }
    }

    private facePath = (_: ITile) => (face: Face) => {
        const { a, s, z } = this.camera;
        switch (face) {
            case Face.Overlay:
            case Face.Top:
                return [0, -s + a, s, 0, 0, s - a, -s, 0];
            case Face.Left:
                return [-s, 0, -s, z, 0, (s - a) + z, 0, (s - a)];
            case Face.Right:
                return [s, 0, s, z, 0, (s - a) + z, 0, (s - a)];
        }
    }

    private faceColor = (tile: ITile) => (face: Face): Color.Color => {
        const color = this.tileColor(tile);
        switch (face) {
            case Face.Overlay:
                return Color.rgb(0, 0, 0, 0);
            case Face.Top:
                return color;
            case Face.Left:
                return color.darker(0.75);
            case Face.Right:
                return color.darker(2);
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

    private renderTiles = () => {
        return tiles(this.props.game).map(tile => {
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
                            "Board_Tile": true,
                            "Board_Tile--Selectable": this.isSelectable(tile),
                            "Board_Tile--Selected": this.isSelected(tile),
                        })}>
                        {[Face.Top, Face.Overlay, Face.Left, Face.Right].map(face => (
                            <polygon
                                key={face}
                                points={path(face).join(", ")}
                                style={{ fill: color(face).toString() }}
                                className={css(
                                    `Board_Tile_Face`,
                                    `Board_Tile_Face--${this.faceName(face)}`,
                                )} />
                        ))}
                    </g>
                </g>
            );
        });
    }

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
                className="Board_Marker_Move"
                x1={ax}
                y1={ay}
                x2={bx}
                y2={by}
                markerEnd="url(#moveMarkerHead)" />
        );
    }

    private renderTileContent = (tile: ITile) => {
        switch (tile.t) {
            case Tile.Attk:
                return ( <use href="#sword" transform="translate(-8, -24)" /> );
            case Tile.Defn:
                return ( <use href="#shield" transform="translate(-12, -12)" style={{ fill: "white" }} /> );
            case Tile.Thrn:
                return ( <use href="#throne" transform="translate(-12, -16)" style={{ fill: "white" }} /> );
            case Tile.Refu:
                return ( <use href="#flag" transform="translate(-6, -20)" /> );
            case Tile.King:
            case Tile.Cast:
            case Tile.Sanc:
                return ( <use href="#king" transform="translate(-15, -20)" style={{ fill: "white" }} /> );
            default:
                return null;
        }
    }

    private renderTileContents = () => {
        const { game, isStarted } = this.props;
        return (
            <CSSTransition in appear classNames="Dropdown" timeout={250}>
                <g className="Board_Pieces Dropdown">
                    {tiles(game).slice().sort((a, b) => a.k - b.k).map(tile => {
                        if (tile.t & (Tile.Empt | Tile.None)) {
                            return null;
                        }

                        const [ tx, ty ] = this.positionByTile(tile);
                        return (
                            <g
                                key={tile.k}
                                style={{ transform: `translate(${tx}px, ${ty}px)` }}
                                className={css({
                                    "Board_Tile_Container": true,
                                    "Board_Tile_Container--Content": true,
                                })}>
                                <g className={css({
                                    "Board_Tile_Content": true,
                                    "Board_Tile_Content--Ready": !isStarted && team(tile.t) === this.props.team,
                                })}>
                                    {this.renderTileContent(tile)}
                                </g>
                            </g>
                        );
                    })}
                </g>
            </CSSTransition>
        );
    }

    public render() {
        return (
            <svg className="Match_Board" width="704" height="456">
                <defs>
                    <marker id="moveMarkerHead" orient="auto" markerWidth="2" markerHeight="4" refX="0.1" refY="2">
                        <path d="M0,0 V4 L2,2 Z" style={{ fill: "rgba(255, 0, 0, 0.4)" }} />
                    </marker>
                </defs>
                <g transform="translate(352, 37)">
                    <g className="Board_Tiles">
                        {this.renderTiles()}
                    </g>
                    {this.renderLastMove()}
                    {this.renderTileContents()}
                </g>
            </svg>
        );
    }
}
