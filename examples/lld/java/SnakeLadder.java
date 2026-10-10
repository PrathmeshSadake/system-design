import java.util.HashMap;
import java.util.Map;
import java.util.function.IntSupplier;

public class SnakeLadder {
  static class Player {
    final String name;
    int pos;
    Player(String name) { this.name = name; }
  }

  private final Map<Integer, Integer> jump = new HashMap<>();
  final Player[] players;
  private final IntSupplier roll;
  private int turn;
  String winner;

  SnakeLadder(int[][] snakes, int[][] ladders, String[] names, IntSupplier roll) {
    for (int[] pair : snakes) jump.put(pair[0], pair[1]);
    for (int[] pair : ladders) jump.put(pair[0], pair[1]);
    players = new Player[names.length];
    for (int i = 0; i < names.length; i++) players[i] = new Player(names[i]);
    this.roll = roll;
  }

  String step() {
    if (winner != null) return winner;
    Player player = players[turn % players.length];
    int next = player.pos + roll.getAsInt();
    if (next <= 100) player.pos = jump.getOrDefault(next, next);
    if (player.pos == 100) winner = player.name;
    else turn += 1;
    return winner;
  }

  public static void main(String[] args) {
    int[] rolls = {4};
    int[] cursor = {0};
    SnakeLadder game = new SnakeLadder(new int[][] {{14, 7}}, new int[][] {{3, 50}}, new String[] {"Ada"}, () -> rolls[cursor[0]++]);
    game.step();
    if (game.players[0].pos != 4) throw new RuntimeException("plain square");
    int[] jumps = {3, 48};
    int[] at = {0};
    SnakeLadder second = new SnakeLadder(new int[][] {{99, 10}}, new int[][] {{3, 51}}, new String[] {"Bo"}, () -> jumps[at[0]++]);
    second.step();
    if (second.players[0].pos != 51) throw new RuntimeException("ladder");
    second.step();
    if (second.players[0].pos != 10 || second.winner != null) throw new RuntimeException("snake");
    System.out.println("ok");
  }
}
