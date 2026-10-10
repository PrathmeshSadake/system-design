export class TicTacToe {
  constructor(size = 3) {
    this.size = size;
    this.board = Array.from({ length: size }, () => Array(size).fill(null));
    this.turn = "X";
    this.winner = null;
  }
  play(row, col) {
    if (this.winner || this.board[row]?.[col] !== null) throw new Error("illegal");
    this.board[row][col] = this.turn;
    if (this.line(this.turn)) this.winner = this.turn;
    else if (this.board.every((line) => line.every(Boolean))) this.winner = "draw";
    else this.turn = this.turn === "X" ? "O" : "X";
    return this.winner;
  }
  line(mark) {
    const n = this.size;
    const row = this.board.some((line) => line.every((cell) => cell === mark));
    const col = Array.from({ length: n }, (_, c) => this.board.every((line) => line[c] === mark)).some(Boolean);
    const diag = this.board.every((line, i) => line[i] === mark);
    const anti = this.board.every((line, i) => line[n - 1 - i] === mark);
    return row || col || diag || anti;
  }
}

export function demo() {
  const game = new TicTacToe();
  game.play(0, 0);
  game.play(1, 0);
  game.play(0, 1);
  game.play(1, 1);
  if (game.play(0, 2) !== "X") throw new Error("X wins the row");
  let refused = false;
  try { game.play(2, 2); } catch { refused = true; }
  if (!refused) throw new Error("game over");
}

if (import.meta.main) demo();
