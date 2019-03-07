import css from "classnames";
import React from "react";
import { best, createNew, IState, play, Team } from "stormveil";
import { hnefatafl } from "stormveil/lib/boards";
import appStyles from "./app.css";
import Board from "./board";
import buttonStyles from "./button.css";
import { Vector } from "./common";

interface IComponentState {
    game: IState;
    selected: Vector | null;
    started: boolean;
    team: Team;
}

function oppose<T>(a: T, b: T, v: T) {
    if (v === a) {
        return b;
    }

    return a;
}

function teamName(team: Team): string {
    switch (team) {
        case Team.Attackers:
            return "Attackers";
        case Team.Defenders:
            return "Defenders";
        default:
            return "";
    }
}

export default class App extends React.Component<{}, IComponentState> {
    public state = {
        game: createNew({ board: hnefatafl, start: Team.Attackers }),
        selected: null,
        started: false,
        team: Team.Attackers,
    };

    private onStartNew = () => {
        const { team } = this.state;
        this.setState({
            game: createNew({ board: hnefatafl, start: team }),
            started: true,
        });
    }

    private onSelectTeam = (team: Team) => {
        this.setState({ team: team });
    }

    private onSelectTile = (xy: Vector | null) => {
        this.setState({ selected: xy });
    }

    private onMove = (a: Vector, b: Vector) => {
        const { game, team } = this.state;
        const next = play(game, a, b);
        this.setState({ game: next, selected: null });
        window.setTimeout(() => {
            const opponent = oppose(Team.Attackers, Team.Defenders, team);
            const [ ba, bb ] = best(next.board, opponent, 3);
            this.setState({ game: play(next, ba, bb) });
        }, 750);
    }

    private renderBoard = () => {
        const {
            game,
            selected,
            started,
            team,
        } = this.state;

        return (
            <Board
                game={game}
                isStarted={started}
                onMove={this.onMove}
                onSelect={this.onSelectTile}
                selected={selected}
                team={team}
            />
        );
    }

    private renderTeamButton = (team: Team) => {
        switch (team) {
            case Team.Attackers:
                return (
                    <svg width={14} height={32} transform="scale(0.88) rotate(45)">
                        <use href="#sword" />
                    </svg>
                );
            case Team.Defenders:
                return (
                    <svg width={22} height={24}>
                        <use href="#shield" />
                    </svg>
                );
            default:
                return null;
        }
    }

    private renderMenu = () => {
        const { team, started } = this.state;
        return (
            <div className={appStyles.menu}>
                <div className={appStyles.options}>
                    {!started && (
                        <div className={appStyles.option}>
                            <div className={appStyles.heading}>New game</div>
                            <div className={appStyles.buttons}>
                                {[Team.Attackers, Team.Defenders].map(t => (
                                    <div
                                        key={t}
                                        className={css({
                                            [buttonStyles.button]: true,
                                            [buttonStyles.buttonTeam]: true,
                                            [buttonStyles.buttonSelected]: team === t,
                                        })}
                                        onClick={() => this.onSelectTeam(t)}
                                        title={teamName(t)}>
                                        {this.renderTeamButton(t)}
                                    </div>
                                ))}
                                <div
                                    className={css(buttonStyles.button, buttonStyles.buttonStart)}
                                    onClick={() => this.onStartNew()}>
                                    Start new game
                                </div>
                            </div>
                        </div>
                    )}
                    <div className={appStyles.option}>
                        <div className={appStyles.heading}>How to play?</div>
                        <div className={appStyles.content}>
                            The objective of the <em>Defenders</em> is to move
                            the <em>King</em> to one of the escape tiles,
                            marked by red flags.
                        </div>
                        <div className={appStyles.content}>
                            The objective of the <em>Attackers</em> is to capture
                            the <em>King</em> by surrounding it on all four sides with
                            attackers.
                        </div>
                        <div className={appStyles.content}>
                            All pieces may move in any of the four directions
                            (North, East, West, and South) any distance, but
                            may not move over other pieces.
                        </div>
                        <div className={appStyles.content}>
                            To capture an <em>Attacker</em> or <em>Defender</em>, it must
                            be sandwiched between two pieces of the opposing team.
                        </div>
                    </div>
                    <div className={appStyles.option}>
                        <div className={appStyles.heading}>About</div>
                        <div className={appStyles.content}>
                            Stormveil is an implementation of an old Nordic
                            board game called Tafl. Visit
                            the <a href="https://en.wikipedia.org/wiki/Tafl_games">Wikiepdia page</a> for
                            more information.
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    public render() {
        return (
            <div className={appStyles.appView}>
                <div className={appStyles.appViewPanel}>
                    <div className={appStyles.appViewContent}>
                        <div className={appStyles.appViewTitle}>Stormveil</div>
                        {this.renderMenu()}
                    </div>
                </div>
                <div className={appStyles.appViewBoard}>
                    <div className={appStyles.appViewContent}>
                        {this.renderBoard()}
                    </div>
                </div>
            </div>
        );
    }
}
