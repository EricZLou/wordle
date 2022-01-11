import React from 'react';

import { VIEWS } from './App';
import { WORDS } from './words';
import './App.css';
import './Game.css';


const KEYBOARD = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"]

const CHARTYPES = {
  CORRECT: 'CHAR_CORRECT',
  PRESENT: 'CHAR_PRESENT',
  ABSENT: 'CHAR_ABSENT',
  DEFAULT: 'CHAR_DEFAULT',
}
const KEYTYPES = {
  CORRECT: 'KEY_CORRECT',
  PRESENT: 'KEY_PRESENT',
  ABSENT: 'KEY_ABSENT',
  DEFAULT: 'KEY_DEFAULT',
}


class DefaultDict {
  constructor(defaultVal) {
    return new Proxy({}, {
      get: (target, name) => name in target ? target[name] : defaultVal
    })
  }
}

export default class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current_guess: "",
      guess_was_correct: false,
      history: [],
      k_green: new Set(),
      k_yellow: new Set(),
      k_dark: new Set(),
    };
    this.word_freq = this.getWordFreq(this.props.word);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  componentDidMount() {
    window.addEventListener("keydown", this.handleKeyPress, false);
  }
  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyPress, false);
  }
  handleKeyPress(evt) {
    if (this.props.hidden || this.props.view !== VIEWS.GAME) return;


    const k = evt.key.toUpperCase();
    if (k === "ENTER") this.submitGuess();
    else if (k === "BACKSPACE") this.delChar();
    else if (k.length === 1 && k >= "A" && k <= "Z") this.addChar(k);
  }

  getWordFreq(word) {
    let word_freq = new DefaultDict(0);
    for (let c of word) word_freq[c]++;
    return word_freq;
  }

  getGridItem(i, j) {
    let c = "";
    let color = CHARTYPES.DEFAULT;
    if (i === this.state.history.length && j < this.state.current_guess.length) {
      c = this.state.current_guess[j];
    }
    else if (i < this.state.history.length) {
      c = this.state.history[i][j].char;
      color = this.state.history[i][j].color;
    }
    return <div key={j} className={color}>{c}</div>
  }
  getGridRow(i) {
    let grid_row = [];
    for (let j = 0; j < 5; j++) grid_row.push(this.getGridItem(i, j));
    return grid_row;
  }

  addChar(c) {
    if (this.state.current_guess.length === 5) return;
    this.setState({current_guess: this.state.current_guess.concat(c)});
  }
  delChar() {
    if (this.state.current_guess.length === 0) return;
    this.setState({current_guess: this.state.current_guess.slice(0, -1)});
  }

  submitGuess() {
    if (this.state.current_guess.length !== 5) {
      this.props.notify("Not enough letters");
      return;
    } else if (!WORDS.includes(this.state.current_guess)) {
      this.props.notify("Not in word list");
      return;
    }
    let h = [];
    let word_freq = {...this.word_freq};
    let k_green = this.state.k_green;
    let k_yellow = this.state.k_yellow;
    let k_dark = this.state.k_dark;

    for (let i = 0; i < 5; i++) {
      let c = this.state.current_guess[i];
      if (c === this.props.word[i]) {
        word_freq[c]--;
      }
    }
    for (let i = 0; i < 5; i++) {
      let c = this.state.current_guess[i];
      let color = CHARTYPES.ABSENT;
      k_dark.add(c);
      if (c === this.props.word[i]) {
        color = CHARTYPES.CORRECT;
        k_green.add(c);
      } else if (word_freq[c]) {
        color = CHARTYPES.PRESENT;
        word_freq[c]--;
        k_yellow.add(c);
      }
      h.push({
        char: c,
        color: color,
      });
    }

    const new_history = [...this.state.history, h];

    if (this.state.current_guess === this.props.word || new_history.length === 6) {
      this.props.onGameOverTrigger();
    }

    this.setState({
      history: new_history,
      current_guess: "",
      k_green: k_green,
      k_yellow: k_yellow,
      k_dark: k_dark,
    });
  }

  render() {
    if (this.props.hidden) {
      return <div/>;
    }

    let grid = [];
    for (let i = 0; i < 6; i++) {
      let grid_row = this.getGridRow(i);
      grid.push(
        <div className="grid-row" key={i}>{grid_row}</div>
      );
    }

    let keyboard = [];
    for (let i = 0; i < 3; i++) {
      let keyboard_row = (
        Array.from(KEYBOARD[i]).map((c) => {
          let color;
          if (this.state.k_green.has(c)) color = KEYTYPES.CORRECT;
          else if (this.state.k_yellow.has(c)) color = KEYTYPES.PRESENT;
          else if (this.state.k_dark.has(c)) color = KEYTYPES.ABSENT;
          else color = KEYTYPES.DEFAULT;
          return <div className={color} onClick={() => this.addChar(c)} key={c}>{c}</div>;
        })
      );
      if (i === 1) {
        keyboard_row.unshift(<div className="space" key="SPACE1"></div>);
        keyboard_row.push(<div className="space" key="SPACE2"></div>);
      }
      if (i === 2) {
        keyboard_row.unshift(<div className="KEY_DEFAULT action" onClick={() => this.submitGuess()} key="ENTER">ENTER</div>);
        keyboard_row.push(<div className="KEY_DEFAULT action material-icons" onClick={() => this.delChar()} key="DEL">&#xe14a;</div>);
      }
      keyboard.push(<div className="keyboard-row" key={i}>{keyboard_row}</div>);
    }

    if (this.props.view === VIEWS.ANSWER) {
      return (
        <div className="Game-box" onClick={() => this.props.showScoreTrigger()}>
          <div className="Game">
            <div className="grid">{grid}</div>
          </div>
          <div className="keyboard">
            <h2>{this.props.word}</h2>
            <h6>click anywhere to continue</h6>
          </div>
        </div>
      );
    }

    return (
      <div className="Game-box">
        <div className="Game">
          <div className="grid">{grid}</div>
        </div>
        <div className="keyboard">{keyboard}</div>
      </div>
    );
  }
}
