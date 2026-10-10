public class TicTacToe {
  final int size;
  final String[][] board;
  String turn = "X";
  String winner;

  TicTacToe(int size) {
    this.size = size;
    board = new String[size][size];
  }

  String play(int row, int col) {
    if (winner != null || board[row][col] != null) throw new IllegalStateException("illegal");
    board[row][col] = turn;
    if (line(turn)) winner = turn;
    else if (full()) winner = "draw";
    else turn = turn.equals("X") ? "O" : "X";
    return winner;
  }

  private boolean full() {
    for (String[] line : board) for (String cell : line) if (cell == null) return false;
    return true;
  }

  private boolean line(String mark) {
    for (int r = 0; r < size; r++) {
      boolean row = true;
      for (int c = 0; c < size; c++) row &= mark.equals(board[r][c]);
      if (row) return true;
    }
    for (int c = 0; c < size; c++) {
      boolean col = true;
      for (int r = 0; r < size; r++) col &= mark.equals(board[r][c]);
      if (col) return true;
    }
    boolean diag = true;
    boolean anti = true;
    for (int i = 0; i < size; i++) {
      diag &= mark.equals(board[i][i]);
      anti &= mark.equals(board[i][size - 1 - i]);
    }
    return diag || anti;
  }

  public static void main(String[] args) {
    TicTacToe game = new TicTacToe(3);
    game.play(0, 0);
    game.play(1, 0);
    game.play(0, 1);
    game.play(1, 1);
    if (!"X".equals(game.play(0, 2))) throw new RuntimeException("X wins the row");
    boolean refused = false;
    try { game.play(2, 2); } catch (IllegalStateException ex) { refused = true; }
    if (!refused) throw new RuntimeException("game over");
    System.out.println("ok");
  }
}
