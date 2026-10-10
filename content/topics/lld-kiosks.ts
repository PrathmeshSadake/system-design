import type { Topic } from "@/lib/types";

export const topic: Topic = {
  slug: "lld-kiosks",
  kind: "lld",
  title: "Vending machine, ATM, and traffic light",
  short: "A machine that takes coins, a machine that takes a PIN, and a light that takes turns.",
  bigIdea:
    "Kiosks look different and share a habit: they refuse to do the thing unless the money, the stock, or the clock says yes. A vending machine must be able to make change or give the coins back. An ATM must not hand out bills it does not have. A traffic light must know which color it is, and an emergency holds it on red.",
  sections: [
    {
      id: "vending",
      name: "Vending Machine",
      simple: "Put coins in the slot. If the jar can make change, the soda falls out",
      figure: "coin-slot",
      example: "vending",
      body: [
        "Items have a price and a stock. The machine holds a coin box (how many of each denomination) and a list of coins the shopper has inserted but not yet spent. buy checks stock and credit, then tries to make change from the box plus the coins just inserted.",
        "Denominations are 25, 10, 5, and 1. Change is greedy: use as many of the largest coin as you can. If the remainder is not zero, the plan fails.",
        "The demo loads dimes, inserts three quarters for a 65 cent soda, and expects a dime back. A second machine with no nickels refunds 35 cents instead of selling a 30 cent soda.",
      ],
      useWhen: ["The prompt is insert coin, select item, dispense or refund."],
      skipWhen: ["They want a network of machines and inventory trucks. One machine's coin box is the class design."],
      questions: [
        "What do you store, a single credit integer or the actual coins? Coins, if change can fail. An integer hides the nickel problem.",
        "Pitfall: taking the item out of stock before you know you can make change.",
      ],
      remember: "Plan the change first. Only then take the coins and decrement stock.",
    },
    {
      id: "vending-change",
      name: "Vending Machine Change and Refunds",
      simple: "If you cannot hand back the right coins, give the shopper their coins back and keep the soda",
      body: [
        "A successful sale moves the inserted coins into the box, removes the planned change from the box, clears the slot, and decrements stock. A failed change plan returns the inserted coins and leaves stock and the box alone.",
        "refund does the same return when the shopper presses the button. It does not require a selected item.",
        "Greedy change works for US-style denominations. If they invent a coin set where greedy fails, say you would search. Do not pretend greedy is always optimal.",
      ],
      useWhen: ["They ask 'what if the machine cannot make change'."],
      skipWhen: ["The machine is card-only. There is no change. A price check and a stock decrement are the sale."],
      questions: [
        "Which coins can pay the change? The coins already in the box and the ones just inserted.",
        "Pitfall: refunding from the box instead of from the slot, and giving the shopper the machine's dimes.",
      ],
      remember: "Cannot make change means a full refund and no sale.",
    },
    {
      id: "atm",
      name: "ATM",
      simple: "The right PIN, enough money in the account, and enough bills in the machine",
      example: "atm",
      body: [
        "An account has a PIN and a balance. The ATM has its own cash. withdraw checks the PIN, then the account, then the machine. It subtracts from both only after all three succeed. deposit adds to both.",
        "The demo starts with 40 in the machine and 100 in the account. A 30 withdrawal works. A 90 withdrawal fails for funds and leaves the machine at 10. A 20 withdrawal then fails because the machine is short, even though the account could cover it.",
        "A real ATM would also count denominations and a daily limit. Name them. The invariant you must show is: a failed withdrawal changes nothing.",
      ],
      useWhen: ["Cash leaves a machine only when both the account and the drawer allow it."],
      skipWhen: ["They want a bank core with transfers between customers. That is the wallet lesson. The ATM is a client of an account."],
      questions: [
        "What are the two balances? The customer's, and the machine's. They are not the same number.",
        "Pitfall: debiting the account and then noticing the drawer is empty.",
      ],
      remember: "Authorize, then check both piles of money, then move them together.",
    },
    {
      id: "traffic-signal",
      name: "Traffic Signal",
      simple: "Green, then yellow, then red, unless a fire truck is coming",
      example: "traffic-signal",
      body: [
        "The signal has a phase index and how many ticks are left in that phase. Green lasts 4, yellow 1, red 4. tick counts down. At zero it advances and reloads the span. color reports the name.",
        "emergencyStop forces red and makes tick a no-op, so the phase does not secretly advance while the override is on. resume returns to the phase you were in.",
        "A real intersection has several approaches that are not all green together. Say the example is one direction. The next class is a set of signals with a table of legal combinations.",
      ],
      useWhen: ["They want a timed cycle and an override."],
      skipWhen: ["They want traffic flow for a city. The light's state machine is still the object. The city is a scheduler of phases."],
      questions: [
        "Does the emergency burn the green time? In this model, no. The remaining ticks stay until resume.",
        "Pitfall: a string you set from anywhere, so the light can be green and 'emergency' at once.",
      ],
      remember: "A phase, a countdown, and an override that pins the color without moving the phase.",
    },
  ],
  recap: [
    "Make change from real coins, or refund and do not vend.",
    "An ATM moves money only when the account and the drawer both allow it.",
    "A signal is a timed cycle plus an override that holds red.",
  ],
  words: [
    { term: "Denomination", meaning: "A coin value the machine can count, such as 25 or 10." },
    { term: "Drawer", meaning: "The cash inside the ATM, separate from any customer's balance." },
    { term: "Phase", meaning: "One color and how long it lasts before the next color." },
  ],
};
