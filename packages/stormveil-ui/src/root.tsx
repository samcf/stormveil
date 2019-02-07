import css from "classnames";
import * as Color from "d3-color";
import * as Scale from "d3-scale";
import React from "react";
import { createNew, State, Team, Tile } from "stormveil";
import { hnefatafl } from "stormveil/lib/boards";
import { noise } from "./noise";

interface IRootState {
    game: State;
    team: number;
    selected: [number, number] | false;
}

interface IRootProps {
    tileSize: number;
    viewAngle: number;
}

interface IBoardTile {
    x: number;
    y: number;
    t: Tile;
    i: Tile;
}

interface ICamera {
    a: number;
    s: number;
    z: number;
}

enum Face {
    Overlay,
    Top,
    Left,
    Right,
}

export default class Root extends React.Component<IRootProps, IRootState> {
    private camera: ICamera;

    constructor(props: IRootProps) {
        super(props);

        const { viewAngle, tileSize } = props;
        this.camera = { a: viewAngle, s: tileSize / 2, z: 16 };
        this.state = {
            game: createNew({
                board: hnefatafl,
                start: Team.Defenders,
            }),
            team: Team.Defenders,
            selected: false,
        };
    }

    public static defaultProps = {
        tileSize: 60,
        viewAngle: 12,
    };

    public render() {
        return (
            <div className="Layout_Content">
            <div className="Match_Participants Layout_Header">
                {this.renderParticipants()}
            </div>
                
                <svg className="Match_Board" width="660" height="440">
                    <g transform="translate(330, 48)">
                        {this.renderTiles()}
                    </g>
                </svg>
            </div>
        );
    }

    private renderParticipants = () => {
        const { game } = this.state;
        const isInitialState = game.history().length === 0;
        return (<>
            {[Team.Attackers, Team.Defenders].map(team => (
                <div key={team}
                    onClick={() => isInitialState && this.onStartNew(team)}
                    className={css({
                        "Match_Participant": true,
                        "Match_Participant--Playing": team === game.turn(),
                        "Match_Participant--Selectable": team !== game.turn() && isInitialState
                    })}>
                    <h1 className="Match_Participant_Title">
                        {this.getTeamName(team)}
                    </h1>
                </div>
            ))}
        </>);
    }

    private renderTiles = () =>
        this.state.game.board().map(this.renderTile)

    private renderTile = (tile: IBoardTile) => {
        const { x, y } = tile;
        const [ tx, ty ] = this.getTilePosition(tile);
        const color = this.getFaceColor(tile);
        const path = this.getFacePath(tile);
        return (
            <g
                key={[x, y].join(", ")}
                onClick={() => this.onSelectTile(tile)}
                style={{ transform: `translate(${tx}px, ${ty}px)` }}
                className={css({
                    "Board_Tile": true,
                    "Board_Tile--Selectable": this.isSelectable(x, y),
                    "Board_Tile--Selected": this.isSelected(x, y),
                })}>
                <g className="Board_Tile_Faces">
                    {[
                        Face.Top,
                        Face.Overlay,
                        Face.Left,
                        Face.Right,
                    ].map(face => (
                        <polygon
                            key={face}
                            points={path(face).join(", ")}
                            style={{ fill: color(face).toString() }}
                            className={css(
                                `Board_Tile_Face`,
                                `Board_Tile_Face--${Face[face]}`
                            )}>
                        </polygon>
                    ))}
                </g>
                <g className="Board_Tile_Content">
                    {this.renderTileContent(tile)}
                </g>
            </g>
        );
    }

    private renderTileContent = (tile: IBoardTile) => {
        switch (tile.t) {
            case Tile.Attk:
                return (
                    <g transform="translate(-7, -7)">
                        <line x1="0" y1="0" x2="14" y2="14" stroke="black" strokeWidth="2" />
                        <line x1="0" y1="14" x2="14" y2="0" stroke="black" strokeWidth="2" />
                    </g>
                );
            case Tile.Defn:
                return ( <circle r="7" stroke="white" fill="none" strokeWidth="2" /> );
            case Tile.Refu:
                return (
                    <g className="Element--crispEdges" transform="translate(-8, -26) scale(0.45)">
                        <rect style={{ fill: "#871B1B" }} x="16.5" y="31" width="10" height="6"/>
                        <path style={{ fill: "#424A60" }} d="M3.5,0c-0.552,0-1,0.447-1,1v3v55c0,0.553,0.448,1,1,1s1-0.447,1-1V4V1C4.5,0.447,4.052,0,3.5,0z"/>
                        <rect style={{ fill: "#DD352E" }} x="4.5" y="4" width="22" height="29"/>
                        <path style={{ fill: "#C03A2B" }} d="M26.5,9v24h-6c-2.209,0-4,1.791-4,4c0,2.209,1.791,4,4,4h4h33l-11-16l11-16H26.5z"/>
                        <path style={{ fill: "#B02721" }} d="M16.5,37c0,2.209,1.791,4,4,4h4h2v-8h-6C18.291,33,16.5,34.791,16.5,37z"/>
                    </g>
                );
            case Tile.Cast:
            case Tile.King:
            case Tile.Sanc:
            case Tile.Thrn:
                return ( <circle r="8" stroke="white" fill="none" strokeWidth="4" /> );
            default:
                return null;
        }
    }

    private getTeamName = (team: Team): string => {
        switch (team) {
            case Team.Attackers: return "Attackers";
            case Team.Defenders: return "Defenders";
            case Team.None: return "None";
        }
    }

    private getTileColor = (tile: IBoardTile): Color.HSLColor => {
        const { x, y } = tile;
        const n = noise(x, y, 5, 3, 0.035);
        const s = (range: [number, number]) =>
            Scale.scaleLinear().domain([0, 1]).range(range)(n);

        if (this.isStartingTile(tile)) {
            return Color.hsl(40, 0.22, s([0.40, 0.50]), 1);
        }

        return Color.hsl(120, 0.20, s([0.40, 0.45]), 1);
    }

    private getFaceColor = (tile: IBoardTile) => (face: Face): Color.Color => {
        const color = this.getTileColor(tile);
        switch (face) {
            case Face.Overlay:
                return color.brighter(1);
            case Face.Top:
                return color;
            case Face.Left:
                return color.darker(0.75);
            case Face.Right:
                return color.darker(2);
        }
    }

    private getFacePath = (tile: IBoardTile) => (face: Face) => {
        const { a, s, z } = this.camera;
        const h = this.isStartingTile(tile) ? z + 4 : z;
        switch (face) {
            case Face.Overlay:
            case Face.Top:
                return [0, -s + a, s, 0, 0, s - a, -s, 0];
            case Face.Left:
                return [-s, 0, -s, h, 0, (s - a) + h, 0, (s - a)];
            case Face.Right:
                return [s, 0, s, h, 0, (s - a) + h, 0, (s - a)];
        }
    }

    private getTilePosition = (tile: IBoardTile): [number, number] => {
        const { a, s, z } = this.camera;
        const h = this.isStartingTile(tile) ? z + 4 : z;
        return [
            (tile.x - tile.y) * s,
            (tile.x + tile.y) * (s - a) - h
        ];
    };

    private onStartNew = (team: Team): void => {
        this.setState({
            game: createNew({
                board: hnefatafl,
                start: team,
            }),
            team: team
        });
    }

    private onSelectTile = (tile: IBoardTile): void => {
        const { x, y } = tile;
        const { game, selected } = this.state;
        if (this.isSelected(x, y)) {
            this.setState({ selected: false });
        }

        if (!this.isSelectable(x, y)) {
            return;
        }

        if (selected === false) {
            this.setState({ selected: [x, y] });
            return;
        }

        this.setState({ game: game.play(selected, [x, y]), selected: false });
        if (game.victor() !== null) {
            return;
        }

        window.setTimeout(() => {
            const move = game.best(game.turn(), 3);
            const [ a, b ] = move;
            this.setState({ game: game.play(a, b) });
        }, 500);
    }

    private isStartingTile = (tile: IBoardTile): boolean =>
        tile.i !== Tile.Empt

    private isSelectable = (x: number, y: number): boolean => {
        const { game, selected, team } = this.state;
        if (game.turn() !== team) {
            return false;
        }

        if (selected === false) {
            return game.candidates(team)
                .some(([ vx, vy ]) =>
                    vx === x && vy === y);
        }

        const [ sx, sy ] = selected;
        return game.moves([sx, sy])
            .some(([ vx, vy ]) => vx === x && vy === y);
    }

    private isSelected = (x: number, y: number): boolean => {
        const { selected } = this.state;
        if (selected === false) {
            return false;
        }

        const [ sx, sy ] = selected;
        return sx === x && sy === y;
    }
}
