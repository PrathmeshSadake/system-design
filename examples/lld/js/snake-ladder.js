export class SnakeLadder {
  constructor(snakes, ladders, players, roll) {
    this.jump = new Map([...snakes, ...ladders]);
    this.players = players.map((name) => ({ name, pos: 0 }));
    this.roll = roll;
    this.turn = 0;
    this.winner = null;
  }
  step() {
    if (this.winner) return this.winner;
    const player = this.players[this.turn % this.players.length];
    const next = player.pos + this.roll();
    if (next <= 100) player.pos = this.jump.get(next) ?? next;
    if (player.pos === 100) this.winner = player.name;
    else this.turn += 1;
    return this.winner;
  }
}

export function demo() {
  const rolls = [4];
  const game = new SnakeLadder([[14, 7]], [[3, 50]], ["Ada"], () => rolls.shift() ?? 1);
  game.step();
  if (game.players[0].pos !== 4) throw new Error("a roll that would pass 100 stays put, and 4 is plain");
  const jumps = [3, 48];
  const second = new SnakeLadder([[99, 10]], [[3, 51]], ["Bo"], () => jumps.shift());
  second.step();
  if (second.players[0].pos !== 51) throw new Error("ladder");
  second.step();
  if (second.players[0].pos !== 10 || second.winner) throw new Error("snake");
}

if (import.meta.main) demo();
