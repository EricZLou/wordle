import React from 'react';

import Game from './Game';
import { WORDS } from './words';
import './App.css';


export const VIEWS = {
  GAME: 'GAME',
  ANSWER: 'ANSWER',
  SCORE: 'SCORE',
}

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: VIEWS.GAME,
      show_welcome: false,
      notification: null,
      word: this.getNewWord(),
    };
  }

  setDocHeight() {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight/100}px`);
  };
  componentDidMount() {
    window.addEventListener("resize", this.setDocHeight);
    window.addEventListener("orientationchange", this.setDocHeight);
    this.setDocHeight();
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.setDocHeight);
    window.removeEventListener("orientationchange", this.setDocHeight);
  }

  getNewWordIdx() {
    this.word_idx = Math.floor(Math.random()*WORDS.length);
    return this.word_idx;
  }
  getNewWord() {
    let word;
    this.word_idx = null;
    if (window.location.search) {
      const idx = new URLSearchParams(window.location.search).get("p");
      if (idx && idx > 0 && idx <= WORDS.length) {
        this.word_idx = idx-1;
        word = WORDS[this.word_idx];
        document.title = `Unlimited Wordle #${idx}`;
      } else {
        window.history.replaceState({}, "", "/wordle");
      }
    }
    word = word || WORDS[this.getNewWordIdx()];
    return word;
  }
  startNewGame() {
    if (window.location.search) {
      window.history.pushState({}, "", "/wordle");
      document.title = "Unlimited Wordle";
    }
    this.setState({
      view: VIEWS.GAME,
      word: this.getNewWord(),
    });
    window.removeEventListener("keydown", this.handleKeyPress.bind(this));
  }
  onGameOver() {
    this.setState({view: VIEWS.ANSWER});
    window.addEventListener("keydown", this.handleKeyPress.bind(this));
  }
  showScore() {
    this.setState({view: VIEWS.SCORE});
  }

  handleKeyPress(evt) {
    if (this.state.show_welcome || this.state.view === VIEWS.GAME) return;

    const k = evt.key.toUpperCase();
    if (k !== "ENTER") return;
    if (this.state.view === VIEWS.ANSWER) this.showScore();
    else if (this.state.view === VIEWS.SCORE) this.startNewGame();
  }

  notify(t) {
    this.setState({notification: t});
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.timeout = null;
      this.setState({notification: null});
    }, 1000);
  }

  copyToClipboard() {
    navigator.clipboard.writeText(`https://ericzlou.github.io/wordle?p=${this.word_idx+1}`);
    this.notify("Copied shareable link");
  }

  render() {
    return (
      <div>
        {!this.state.show_welcome && <div className="info-button" title="Info" onClick={() => this.setState({show_welcome: true})}>&#9432;</div>}
        {this.state.show_welcome && (
          <div className="Info-box" onClick={() => this.setState({show_welcome: false})}>
            <div className="Info">
              <h2>the daily <a href="https://www.powerlanguage.co.uk/wordle/" target="_blank">Wordle</a> without limits</h2>
              <i>DISCLAIMER</i>
              <small>The beauty of the daily Wordle is it doesn't take time out of your day.
                If you insist on playing this unlimited version, please continue to support the original daily Wordle
                and don't let this unlimited version take too much time out of your day.
              </small>
              <h6>click anywhere to close</h6>
            </div>
          </div>
        )}
        {!this.state.show_welcome && (
          <div className="copy-button" title="Share this puzzle" onClick={() => this.copyToClipboard()}>&#128279;</div>
        )}

        {this.state.notification && <div className="notification">{this.state.notification}</div>}

        {this.state.view === VIEWS.SCORE && (
          <div className="Game-box" onClick={() => this.startNewGame()}>
            <div className="Game">
              <h2>the daily <a href="https://www.powerlanguage.co.uk/wordle/" target="_blank">Wordle</a> without limits</h2>
              <h6>Game stats coming soon...</h6>
              <h6>click anywhere to play again</h6>
            </div>
          </div>
        )}

        {this.state.view !== VIEWS.SCORE && (
          <Game
            hidden={this.state.show_welcome}
            word={this.state.word}
            startNewGameTrigger={this.startNewGame.bind(this)}
            onGameOverTrigger={this.onGameOver.bind(this)}
            showScoreTrigger={this.showScore.bind(this)}
            notify={this.notify.bind(this)}
            view={this.state.view}
          />
        )}
      </div>
    );
  }
}
