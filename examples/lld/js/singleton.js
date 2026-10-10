// One trophy on the shelf. Asking again returns the same trophy.

export class TrophyCase {
  static #one;
  constructor() {
    this.created = Date.now();
  }
  static get() {
    if (!TrophyCase.#one) TrophyCase.#one = new TrophyCase();
    return TrophyCase.#one;
  }
}

export function demo() {
  const a = TrophyCase.get();
  const b = TrophyCase.get();
  if (a !== b) throw new Error("two callers must see one trophy");
}

if (import.meta.main) demo();
