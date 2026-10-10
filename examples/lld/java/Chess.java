import java.util.ArrayList;
import java.util.List;

public class Chess {
  private static final int[][] KNIGHT = {{2, 1}, {2, -1}, {-2, 1}, {-2, -1}, {1, 2}, {1, -2}, {-1, 2}, {-1, -2}};
  private static final int[][] ROOK = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
  private static final int[][] BISHOP = {{1, 1}, {1, -1}, {-1, 1}, {-1, -1}};
  private static final int[][] QUEEN = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}, {1, 1}, {1, -1}, {-1, 1}, {-1, -1}};

  final char[][] board;
  private boolean filterChecks = true;

  Chess(String[] rows) {
    board = new char[8][8];
    for (int r = 0; r < 8; r++) board[r] = rows[r].toCharArray();
  }

  char piece(int r, int c) {
    if (r < 0 || c < 0 || r >= 8 || c >= 8) return '.';
    return board[r][c];
  }

  static boolean white(char p) { return p != '.' && p == Character.toUpperCase(p); }

  List<int[]> movesFrom(int r, int c) {
    char p = piece(r, c);
    List<int[]> out = new ArrayList<>();
    if (p == '.') return out;
    boolean mine = white(p);
    char kind = Character.toLowerCase(p);
    if (kind == 'n') {
      for (int[] d : KNIGHT) push(out, r + d[0], c + d[1], mine);
    } else if (kind == 'k') {
      for (int dr = -1; dr <= 1; dr++) for (int dc = -1; dc <= 1; dc++) if (dr != 0 || dc != 0) push(out, r + dr, c + dc, mine);
    } else if (kind == 'p') {
      int dir = mine ? -1 : 1;
      int start = mine ? 6 : 1;
      if (piece(r + dir, c) == '.') {
        out.add(new int[] {r + dir, c});
        if (r == start && piece(r + 2 * dir, c) == '.') out.add(new int[] {r + 2 * dir, c});
      }
      for (int dc : new int[] {-1, 1}) {
        char t = piece(r + dir, c + dc);
        if (t != '.' && white(t) != mine) out.add(new int[] {r + dir, c + dc});
      }
    } else {
      int[][] rays = kind == 'r' ? ROOK : kind == 'b' ? BISHOP : QUEEN;
      for (int[] d : rays) {
        for (int i = 1; i < 8; i++) if (!slide(out, r + d[0] * i, c + d[1] * i, mine)) break;
      }
    }
    if (!filterChecks) return onBoard(out);
    List<int[]> legal = new ArrayList<>();
    for (int[] sq : onBoard(out)) if (!leavesKing(r, c, sq[0], sq[1], mine)) legal.add(sq);
    return legal;
  }

  private boolean push(List<int[]> out, int r, int c, boolean mine) {
    char t = piece(r, c);
    if (t == '.' || white(t) != mine) out.add(new int[] {r, c});
    return t == '.';
  }

  private boolean slide(List<int[]> out, int r, int c, boolean mine) {
    if (r < 0 || c < 0 || r >= 8 || c >= 8) return false;
    return push(out, r, c, mine);
  }

  private List<int[]> onBoard(List<int[]> raw) {
    List<int[]> out = new ArrayList<>();
    for (int[] sq : raw) if (sq[0] >= 0 && sq[1] >= 0 && sq[0] < 8 && sq[1] < 8) out.add(sq);
    return out;
  }

  boolean leavesKing(int r, int c, int nr, int nc, boolean mine) {
    Chess copy = copy();
    copy.board[nr][nc] = copy.board[r][c];
    copy.board[r][c] = '.';
    return copy.inCheck(mine);
  }

  private Chess copy() {
    String[] rows = new String[8];
    for (int r = 0; r < 8; r++) rows[r] = new String(board[r]);
    return new Chess(rows);
  }

  int[] findKing(boolean whiteSide) {
    char want = whiteSide ? 'K' : 'k';
    for (int r = 0; r < 8; r++) for (int c = 0; c < 8; c++) if (board[r][c] == want) return new int[] {r, c};
    return null;
  }

  boolean attacked(int r, int c, boolean byWhite) {
    for (int rr = 0; rr < 8; rr++) for (int cc = 0; cc < 8; cc++) {
      char p = piece(rr, cc);
      if (p == '.' || white(p) != byWhite) continue;
      for (int[] hit : rawHits(rr, cc)) if (hit[0] == r && hit[1] == c) return true;
    }
    return false;
  }

  List<int[]> rawHits(int r, int c) {
    char p = piece(r, c);
    if (Character.toLowerCase(p) == 'p') {
      int dir = white(p) ? -1 : 1;
      List<int[]> out = new ArrayList<>();
      if (r + dir >= 0 && r + dir < 8 && c - 1 >= 0) out.add(new int[] {r + dir, c - 1});
      if (r + dir >= 0 && r + dir < 8 && c + 1 < 8) out.add(new int[] {r + dir, c + 1});
      return out;
    }
    Chess probe = copy();
    probe.filterChecks = false;
    return probe.movesFrom(r, c);
  }

  boolean inCheck(boolean whiteSide) {
    int[] king = findKing(whiteSide);
    return king != null && attacked(king[0], king[1], !whiteSide);
  }

  List<int[]> legal(boolean whiteSide) {
    List<int[]> moves = new ArrayList<>();
    for (int r = 0; r < 8; r++) for (int c = 0; c < 8; c++) {
      char p = piece(r, c);
      if (p == '.' || white(p) != whiteSide) continue;
      for (int[] sq : movesFrom(r, c)) moves.add(new int[] {r, c, sq[0], sq[1]});
    }
    return moves;
  }

  boolean checkmate(boolean whiteSide) { return inCheck(whiteSide) && legal(whiteSide).isEmpty(); }

  public static void main(String[] args) {
    Chess start = new Chess(new String[] {
        "rnbqkbnr", "pppppppp", "........", "........", "........", "........", "PPPPPPPP", "RNBQKBNR"
    });
    boolean one = false;
    boolean two = false;
    for (int[] sq : start.movesFrom(6, 4)) {
      if (sq[0] == 5 && sq[1] == 4) one = true;
      if (sq[0] == 4 && sq[1] == 4) two = true;
    }
    if (!one || !two) throw new RuntimeException("pawn steps");
    Chess mate = new Chess(new String[] {
        "k.......", "QK......", "........", "........", "........", "........", "........", "........"
    });
    if (!mate.inCheck(false) || !mate.checkmate(false)) throw new RuntimeException("mate");
    System.out.println("ok");
  }
}
