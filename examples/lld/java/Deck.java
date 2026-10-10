import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.function.DoubleSupplier;

public class Deck {
  static class Card {
    final String rank;
    final String suit;
    Card(String rank, String suit) { this.rank = rank; this.suit = suit; }
    public String toString() { return rank + " of " + suit; }
  }

  private final DoubleSupplier random;
  final List<Card> cards = new ArrayList<>();

  Deck(DoubleSupplier random) {
    this.random = random;
    String[] ranks = {"A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"};
    String[] suits = {"clubs", "diamonds", "hearts", "spades"};
    for (String suit : suits) for (String rank : ranks) cards.add(new Card(rank, suit));
  }

  void shuffle() {
    for (int i = cards.size() - 1; i > 0; i--) {
      int j = (int) Math.floor(random.getAsDouble() * (i + 1));
      Card tmp = cards.get(i);
      cards.set(i, cards.get(j));
      cards.set(j, tmp);
    }
  }

  List<Card> deal(int n) {
    if (n > cards.size()) throw new IllegalStateException("not enough cards");
    List<Card> hand = new ArrayList<>(cards.subList(0, n));
    cards.subList(0, n).clear();
    return hand;
  }

  public static void main(String[] args) {
    int[] n = {0};
    Deck deck = new Deck(() -> {
      n[0] += 1;
      return n[0] % 2 == 0 ? 0 : 0.999;
    });
    deck.shuffle();
    List<Card> hand = deck.deal(5);
    if (hand.size() != 5 || deck.cards.size() != 47) throw new RuntimeException("deal");
    Set<String> seen = new HashSet<>();
    for (Card card : hand) seen.add(card.toString());
    if (seen.size() != 5) throw new RuntimeException("unique");
    System.out.println("ok");
  }
}
