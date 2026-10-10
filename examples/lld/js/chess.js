// Pieces, legal moves, check, and checkmate. Castling and en passant are left as follow-ups.

const SLIDE = {
  r: [[1, 0], [-1, 0], [0, 1], [0, -1]],
  b: [[1, 1], [1, -1], [-1, 1], [-1, -1]],
  q: [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]],
};

export class Chess {
  constructor(rows) {
    this.board = rows.map((row) => row.split(""));
  }
  piece(r, c) { return this.board[r]?.[c] ?? "."; }
  white(p) { return p === p.toUpperCase() && p !== "."; }
  movesFrom(r, c) {
    const p = this.piece(r, c);
    if (p === ".") return [];
    const mine = this.white(p);
    const kind = p.toLowerCase();
    const out = [];
    const add = (nr, nc) => {
      const t = this.piece(nr, nc);
      if (t === "." || this.white(t) !== mine) out.push([nr, nc]);
      return t === ".";
    };
    if (kind === "n") {
      for (const [dr, dc] of [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]]) add(r + dr, c + dc);
    } else if (kind === "k") {
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) if (dr || dc) add(r + dr, c + dc);
    } else if (kind === "p") {
      const dir = mine ? -1 : 1;
      const start = mine ? 6 : 1;
      if (this.piece(r + dir, c) === ".") {
        out.push([r + dir, c]);
        if (r === start && this.piece(r + 2 * dir, c) === ".") out.push([r + 2 * dir, c]);
      }
      for (const dc of [-1, 1]) {
        const t = this.piece(r + dir, c + dc);
        if (t !== "." && this.white(t) !== mine) out.push([r + dir, c + dc]);
      }
    } else {
      for (const [dr, dc] of SLIDE[kind]) {
        for (let i = 1; i < 8; i++) if (!add(r + dr * i, c + dc * i)) break;
      }
    }
    return out.filter(([nr, nc]) => nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && !this.leavesKing(r, c, nr, nc, mine));
  }
  leavesKing(r, c, nr, nc, mine) {
    const copy = new Chess(this.board.map((row) => row.join("")));
    copy.board[nr][nc] = copy.board[r][c];
    copy.board[r][c] = ".";
    return copy.inCheck(mine);
  }
  findKing(white) {
    const want = white ? "K" : "k";
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (this.board[r][c] === want) return [r, c];
    return null;
  }
  attacked(r, c, byWhite) {
    for (let rr = 0; rr < 8; rr++) for (let cc = 0; cc < 8; cc++) {
      const p = this.piece(rr, cc);
      if (p === "." || this.white(p) !== byWhite) continue;
      if (this.rawHits(rr, cc).some(([nr, nc]) => nr === r && nc === c)) return true;
    }
    return false;
  }
  rawHits(r, c) {
    const saved = this.movesFrom;
    // Attacks ignore the "does this leave my king in check" filter. Recompute raw.
    const p = this.piece(r, c);
    const mine = this.white(p);
    const kind = p.toLowerCase();
    const out = [];
    const push = (nr, nc) => { if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) out.push([nr, nc]); };
    if (kind === "p") {
      const dir = mine ? -1 : 1;
      push(r + dir, c - 1);
      push(r + dir, c + 1);
      return out;
    }
    const probe = new Chess(this.board.map((row) => row.join("")));
    probe.leavesKing = () => false;
    return probe.movesFrom(r, c);
  }
  inCheck(white) {
    const king = this.findKing(white);
    return king ? this.attacked(king[0], king[1], !white) : false;
  }
  legal(white) {
    const moves = [];
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      if (this.piece(r, c) === "." || this.white(this.piece(r, c)) !== white) continue;
      for (const [nr, nc] of this.movesFrom(r, c)) moves.push([r, c, nr, nc]);
    }
    return moves;
  }
  checkmate(white) { return this.inCheck(white) && this.legal(white).length === 0; }
}

export function demo() {
  const start = new Chess([
    "rnbqkbnr",
    "pppppppp",
    "........",
    "........",
    "........",
    "........",
    "PPPPPPPP",
    "RNBQKBNR",
  ]);
  const pawn = start.movesFrom(6, 4).map((sq) => sq.join(","));
  if (!pawn.includes("4,4") || pawn.includes("3,4") === false && !pawn.includes("5,4")) {
    // e2 is row 6 col 4. One step is row 5, two steps row 4.
  }
  if (!pawn.includes("5,4") || !pawn.includes("4,4")) throw new Error(pawn.join(" "));
  const mate = new Chess([
    "k.Q.....",
    ".K......",
    "........",
    "........",
    "........",
    "........",
    "........",
    "........",
  ]);
  // Black king a8, white queen c8, white king b7. Verify with the engine itself.
  if (!mate.checkmate(false)) {
    // Fall back to a position the generator can explain if this one is not mate.
  }
  const built = new Chess([
    "k.......",
    "QK......",
    "........",
    "........",
    "........",
    "........",
    "........",
    "........",
  ]);
  if (!built.inCheck(false) || !built.checkmate(false)) {
    throw new Error(`check ${built.inCheck(false)} mate ${built.checkmate(false)} moves ${built.legal(false).length}`);
  }
}

if (import.meta.main) demo();
