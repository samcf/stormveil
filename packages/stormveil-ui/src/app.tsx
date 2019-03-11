import css from "classnames";
import React from "react";
import { best, captured, createNew, IState, play, Team } from "stormveil";
import { hnefatafl } from "stormveil/lib/boards";
import { opponent } from "stormveil/lib/state";
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
        const { started } = this.state;
        if (started) {
            return;
        }

        const { team } = this.state;
        this.setState({
            game: createNew({ board: hnefatafl, start: team }),
            started: true,
        });
    }

    private onSelectTeam = (team: Team) => {
        if (this.state.started) {
            return;
        }

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
            const enemy = opponent(team);
            const [ ba, bb ] = best(next.board, enemy, 3);
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

    private renderScoreIcon = (team: Team) => {
        switch (team) {
            case Team.Attackers:
                return <use href="#sword" transform="rotate(45) translate(8, -16)" />;
            case Team.Defenders:
                return <use href="#shield" />;
            default:
                return null;
        }
    }

    private renderScore = (team: Team) => {
        const { game } = this.state;
        const captures = captured(game, opponent(team));
        if (captures === 0) {
            return (
                <div className={appStyles.scoreNone}>None</div>
            );
        }

        return Array.from({ length:  captures }).map((_, i) => (
            <svg key={i}
                className={appStyles.scoreIcon}
                viewBox="4 0 32 32"
                width="28"
                height="28">
                {this.renderScoreIcon(opponent(team))}
            </svg>
        ));
    }

    private renderScoreBoard = () => (
        <div className={appStyles.score}>
            {[Team.Attackers, Team.Defenders].map(team => (
                <div key={team} className={appStyles.scoreTeam}>
                    <div>{teamName(team)}</div>
                    <div className={appStyles.scoreIcons}>
                        {this.renderScore(team)}
                    </div>
                </div>
            ))}
        </div>
    )

    private renderTeamButton = (team: Team) => {
        switch (team) {
            case Team.Attackers:
                return (
                    <svg viewBox="0 0 32 32" width="24" height="24">
                        <use href="#sword" transform="rotate(45) translate(8, -16)" />
                    </svg>
                );
            case Team.Defenders:
                return (
                    <svg viewBox="2 0 32 32" width="24" height="24">
                        <use href="#shield" />
                    </svg>
                );
            default:
                return null;
        }
    }

    private renderMenu = () => {
        const { started, team } = this.state;
        return (
            <div className={appStyles.menu}>
                <div className={appStyles.options}>
                    <div className={appStyles.title}>Stormveil</div>
                    <div className={appStyles.option}>
                        <div className={appStyles.heading}>New game</div>
                        <div className={appStyles.buttons}>
                            {[Team.Attackers, Team.Defenders].map(t => (
                                <div
                                    key={t}
                                    className={css({
                                        [buttonStyles.button]: true,
                                        [buttonStyles.team]: true,
                                        [buttonStyles.disabled]: started,
                                        [buttonStyles.selected]: team === t,
                                    })}
                                    onClick={() => this.onSelectTeam(t)}
                                    title={teamName(t)}>
                                    {this.renderTeamButton(t)}
                                </div>
                            ))}
                            <div
                                className={css({
                                    [buttonStyles.button]: true,
                                    [buttonStyles.start]: true,
                                    [buttonStyles.disabled]: started,
                                })}
                                onClick={() => this.onStartNew()}>
                                Start new game
                            </div>
                        </div>
                    </div>
                    <div className={css(appStyles.option)}>
                        <div className={appStyles.heading}>Captures</div>
                        <div className={appStyles.content}>
                            {this.renderScoreBoard()}
                        </div>
                    </div>
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
                    {this.renderMenu()}
                </div>
                <div className={appStyles.appViewBoard}>
                    {this.renderBoard()}
                </div>
            </div>
        );
    }
}
