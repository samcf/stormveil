import css from "classnames";
import React from "react";
import { best, captured, createNew, opponent, play, victor, State, Team } from "stormveil";
import { hnefatafl } from "stormveil/lib/boards";
import styles from "./app.css";
import Board from "./board";
import buttonStyles from "./button.css";
import { Vector } from "./common";

interface IComponentState {
    game: State;
    selected: Vector | null;
    started: boolean;
    team: Team;
}

function teamName(team: Team): string {
    switch (team) {
        case Team.Attackers: return "Attackers";
        case Team.Defenders: return "Defenders";
        default: return "";
    }
}

export default class App extends React.Component<{}, IComponentState> {
    private static defaultState = createNew({ board: hnefatafl, start: Team.Attackers });

    public state = {
        game: App.defaultState,
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

    private onRestart = () => {
        this.setState({ game: App.defaultState, started: false });
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

        if (victor(next.board) != null) {
            return;
        }

        window.setTimeout(() => {
            const enemy = opponent(team);
            const [ ba, bb ] = best(next.board, enemy, 3);
            this.setState({ game: play(next, ba, bb) });
        }, 750);
    }

    private renderTeamIcon = (team: Team) => {
        switch (team) {
            case Team.Attackers:
                return <use href="#sword" transform="rotate(45) translate(8, -16)" />;
            case Team.Defenders:
                return <use href="#shield" transform="translate(-2, 0)" />;
            default:
                return null;
        }
    }

    private renderScore = (team: Team) => {
        const { game } = this.state;
        const captures = captured(game, opponent(team));
        if (captures === 0) {
            return (
                <div className={styles.scoreNone}>None</div>
            );
        }

        return Array.from({ length:  captures }).map((_, i) => (
            <svg key={i}
                className={styles.scoreIcon}
                viewBox="4 0 32 32"
                width="28"
                height="28">
                {this.renderTeamIcon(opponent(team))}
            </svg>
        ));
    }

    public render() {
        const { game, selected, started, team } = this.state;
        const winner = victor(game.board);
        return (
            <div className={styles.app}>
                <div className={styles.container}>
                    <div className={styles.interface}>
                        <div className={styles.controls}>
                            <div className={css({
                                [styles.buttons]: true,
                                [styles.active]: !started && winner == null,
                            })}>
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
                                        <svg viewBox="0 0 32 32" width={24} height={24}>
                                            {this.renderTeamIcon(t)}
                                        </svg>
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
                            <div className={css({
                                [styles.buttons]: true,
                                [styles.active]: started && winner == null,
                            })}>
                                <div
                                    onClick={this.onRestart}
                                    className={css({
                                        [buttonStyles.button]: true,
                                        [buttonStyles.start]: true,
                                    })}>
                                    Forfeit?
                                </div>
                            </div>
                            <div className={css({
                                [styles.buttons]: true,
                                [styles.active]: started && winner !== null,
                            })}>
                                <div style={{ alignSelf: "center" }}>
                                    {winner !== null && teamName(winner)} are victorious!
                                </div>
                                <div onClick={this.onRestart}
                                    className={css({
                                        [buttonStyles.button]: true,
                                        [buttonStyles.start]: true,
                                    })}>
                                    New game
                                </div>
                            </div>
                        </div>
                        <div className={styles.score}>
                            <div className={css({
                                [styles.scoreBoard]: true,
                                [styles.active]: started,
                            })}>
                                {[Team.Attackers, Team.Defenders].map(team => (
                                    <div key={team} className={styles.scoreTeam}>
                                        <div>{teamName(team)}</div>
                                        <div className={styles.scoreIcons}>
                                            {this.renderScore(team)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={styles.rules}>

                        </div>
                        <div className={styles.about}>
                            <div>
                                <div>
                                    <a href="https://github.com/samcf/stormveil">View source on GitHub</a>
                                </div>
                                <div>
                                    Stormveil is an implementation of an old Nordic board game called Tafl.<br />
                                    Visit the <a href="https://en.wikipedia.org/wiki/Tafl_games">Wikiepdia page</a>
                                    <span> for more information.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Board
                    className={styles.board}
                    game={game}
                    isStarted={started}
                    onMove={this.onMove}
                    onSelect={this.onSelectTile}
                    selected={selected}
                    team={team}
                />
            </div>
        );
    }
}
