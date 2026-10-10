const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const SUITS = ["clubs", "diamonds", "hearts", "spades"];

export class Card {
  constructor(rank, suit) { this.rank = rank; this.suit = suit; }
  toString() { return `${this.rank} of ${this.suit}`; }
}

export class Deck {
  constructor(random = Math.random) {
    this.random = random;
    this.cards = [];
    for (const suit of SUITS) for (const rank of RANKS) this.cards.push(new Card(rank, suit));
  }
  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }
  deal(n) {
    if (n > this.cards.length) throw new Error("not enough cards");
    return this.cards.splice(0, n);
  }
}

export function demo() {
  let n = 0;
  const deck = new Deck(() => {
    n += 1;
    return n % 2 === 0 ? 0 : 0.999;
  });
  deck.shuffle();
  const hand = deck.deal(5);
  if (hand.length !== 5 || deck.cards.length !== 47) throw new Error("deal");
  const seen = new Set(hand.map(String));
  if (seen.size !== 5) throw new Error("unique");
}

if (import.meta.main) demo();
