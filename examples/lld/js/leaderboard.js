export class Leaderboard {
  constructor() {
    this.rows = new Map();
  }
  submit(name, score, at) {
    const prev = this.rows.get(name);
    if (!prev || score > prev.score || (score === prev.score && at < prev.at)) {
      this.rows.set(name, { name, score, at });
    }
  }
  top(n) {
    return [...this.rows.values()]
      .sort((a, b) => b.score - a.score || a.at - b.at || a.name.localeCompare(b.name))
      .slice(0, n);
  }
}

export function demo() {
  const board = new Leaderboard();
  board.submit("bo", 10, 5);
  board.submit("ada", 10, 1);
  board.submit("cy", 8, 0);
  board.submit("bo", 9, 2);
  const names = board.top(3).map((row) => row.name).join(",");
  if (names !== "ada,bo,cy") throw new Error(names);
}

if (import.meta.main) demo();
