import React from 'react'
import './App.css';


const VIEWS = {
  WELCOME: 'WELCOME',
  GAME: 'GAME',
  SCORE: 'SCORE',
}

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

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: VIEWS.WELCOME,
    };
    this.beginGame = this.beginGame.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyPress, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyPress, false);
  }

  static generateWord() {
    return "peels";
  }

  beginGame() {
    this.word = App.generateWord().toUpperCase();
    this.word_freq = new DefaultDict(0);
    for (let c of this.word) this.word_freq[c]++;
    this.setState({
      view: VIEWS.GAME,
      current_guess: "",
      guess_was_correct: false,
      history: [],
      k_green: new Set(),
      k_yellow: new Set(),
      k_dark: new Set(),
    })
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
  handleKeyPress(evt) {
    const k = evt.key.toUpperCase();
    if (this.state.view === VIEWS.GAME) {
      if (k === "ENTER" && (this.state.guess_was_correct || this.state.history.length === 6))
        this.setState({view: VIEWS.SCORE});
      else if (k === "ENTER" && this.state.history.length < 6) this.submitGuess();
      else if (k === "BACKSPACE") this.delChar();
      else if (k.length === 1 && k >= "A" && k <= "Z") this.addChar(k);
    } else if (k === "ENTER") this.beginGame();
  }

  submitGuess() {
    if (this.state.current_guess.length !== 5) return;
    let h = [];
    let word_freq = {...this.word_freq};
    let k_green = this.state.k_green;
    let k_yellow = this.state.k_yellow;
    let k_dark = this.state.k_dark;

    for (let i = 0; i < 5; i++) {
      let c = this.state.current_guess[i];
      if (c === this.word[i]) {
        word_freq[c]--;
      }
    }
    for (let i = 0; i < 5; i++) {
      let c = this.state.current_guess[i];
      let color = CHARTYPES.ABSENT;
      k_dark.add(c);
      if (c === this.word[i]) {
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
    this.setState({
      history: [...this.state.history, h],
      current_guess: "",
      guess_was_correct: this.state.current_guess === this.word,
      k_green: k_green,
      k_yellow: k_yellow,
      k_dark: k_dark,
    });
  }

  render() {
    if (this.state.view === VIEWS.WELCOME) {
      return (
        <div className="App" onClick={() => this.beginGame()}>
          <div className="App-header">
            <h2>the daily <a href="https://www.powerlanguage.co.uk/wordle/" target="_blank">Wordle</a> without limits</h2>
            <i>DISCLAIMER</i>
            <small>The beauty of the daily Wordle is it doesn't take time out of your day.
              If you insist on playing this unlimited version, please continue to support the original daily Wordle
              and don't let this unlimited version take too much time out of your day.
            </small>
            <h4 className="click-to-continue">click to begin</h4>
          </div>
        </div>
      );
    }

    if (this.state.view === VIEWS.SCORE) {
      return (
        <div className="App" onClick={() => this.beginGame()}>
          <div className="App-header">
            <h2>the daily <a href="https://www.powerlanguage.co.uk/wordle/" target="_blank">Wordle</a> without limits</h2>
            <h6>click anywhere to play again</h6>
          </div>
        </div>
      );
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
          if (this.state.k_green.has(c)) {
            color = KEYTYPES.CORRECT;
          } else if (this.state.k_yellow.has(c)) {
            color = KEYTYPES.PRESENT;
          } else if (this.state.k_dark.has(c)) {
            color = KEYTYPES.ABSENT;
          } else {
            color = KEYTYPES.DEFAULT;
          }
          return <div className={color} onClick={() => this.addChar(c)} key={c}>{c}</div>;
        })
      );
      if (i === 1) {
        keyboard_row.unshift(<div className="space"></div>);
        keyboard_row.push(<div className="space"></div>);
      }
      if (i === 2) {
        keyboard_row.unshift(<div className="KEY_DEFAULT action" onClick={() => this.submitGuess()} key="ENTER">ENTER</div>);
        keyboard_row.push(<div className="KEY_DEFAULT action material-icons" onClick={() => this.delChar()} key="DEL">&#xe14a;</div>);
      }
      keyboard.push(<div className="keyboard-row">{keyboard_row}</div>);
    }

    if (this.state.history.length === 6 || this.state.guess_was_correct) {
      return (
        <div className="App" onClick={() => this.setState({view: VIEWS.SCORE})}>
          <div className="App-header2">
            <div className="grid">{grid}</div>
          </div>
          <div className="keyboard-x">
            <h2 className="uppercase">{this.word}</h2>
            <h6>click anywhere to continue</h6>
          </div>
        </div>
      );
    }

    return (
      <div className="App">
        <div className="App-header2">
          <div className="grid">{grid}</div>
        </div>
        <div className="keyboard">{keyboard}</div>
      </div>
    );
  }
}
