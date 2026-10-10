import type { Topic } from "@/lib/types";

export const topic: Topic = {
  slug: "lld-splitwise",
  kind: "lld",
  title: "Splitwise",
  short: "Who paid, who shares, and the shortest list of who owes whom.",
  bigIdea:
    "A lunch bill is a pile of coins and a list of friends. Splitwise is that lunch, written as objects. Money is an integer number of cents. The group remembers one net number per person. Settling is a second step that turns those nets into a short list of payments.",
  sections: [
    {
      id: "splitwise",
      name: "Splitwise",
      simple: "One friend pays the pizza, and the pile of coins remembers who still owes",
      figure: "coin-piles",
      example: "splitwise",
      body: [
        "Ada pays for pizza. Bo and Cy ate too. Instead of three messy IOUs on napkins, the group keeps one number per friend: positive means the group owes you, negative means you owe the group. Adding a bill only changes those numbers. Nobody stores every pairwise debt unless you ask for a settlement list.",
        "The core objects are the group (a map from user to net cents), an expense (who paid, how many cents, and a split rule), and a transfer (from, to, cents) produced later. Amounts are integers. A float will eventually say someone owes half a cent, and interviews fail there.",
        "addExpense checks that the shares add up to the amount, then for each person adds what they paid and subtracts their share. If the payer is not in the share map, they still receive the full credit. That is the 'I paid, but I did not eat' case.",
      ],
      useWhen: [
        "The problem is shared expenses, balances, and settling up.",
        "You want an in-memory model you can explain before you mention a database.",
      ],
      skipWhen: [
        "The question is a payment network between banks. That is a ledger with idempotency keys, not a friend group.",
      ],
      questions: [
        "Why store nets instead of every pair? Nets stay small and every new expense is O(people in that expense). Pairwise graphs explode and go stale.",
        "Pitfall: using floating point, or forgetting that the payer's share and the payer's credit are different numbers.",
      ],
      remember: "One integer balance per person. An expense moves those balances. Settlement is a later question.",
    },
    {
      id: "splitwise-splits",
      name: "Splitwise with Equal/Exact/Percentage splits",
      simple: "Cut the pizza in equal slices, named slices, or slices by percent",
      body: [
        "Equal means each listed person owes the same number of cents, and the leftover cents go to the earliest people, one each. Ten cents among three people is 4, 3, 3, not 3.33.",
        "Exact means the caller already named each share. You only check that the shares are positive and add up to the amount.",
        "Percent means the percents add to 100. Each person except the last gets floor(amount * percent / 100). The last person gets whatever is left, so the shares still add up. The order of the map matters for who gets the remainder, so keep insertion order.",
      ],
      useWhen: ["The interviewer names more than one way to divide a bill."],
      skipWhen: ["They said equal only. Do not build percent until they ask. Mention it as the next split rule."],
      questions: [
        "Where does the remainder go? Say it out loud: earliest users for equal, last user for percent.",
        "Pitfall: computing every percent with round, then discovering the shares sum to amount plus one.",
      ],
      remember: "Three split rules, one check: the shares are integers and they add up to the bill.",
    },
    {
      id: "splitwise-simplify",
      name: "Splitwise with Debt Simplification",
      simple: "Instead of everyone paying everyone, match people who owe with people who are owed",
      body: [
        "After many bills, Ada is up 500 cents and Bo is down 500. They do not need a chain of tiny debts. Simplification walks debtors and creditors and emits the fewest transfers that clear the nets: the minimum of what this debtor still owes and what this creditor is still owed.",
        "This greedy pass is not the only minimal graph, but it is the one you can code in an interview and explain. It preserves every net. Sum of transfers into a person equals that person's positive balance.",
        "Do the simplify step only when someone asks 'who should pay whom now'. The balances stay the source of truth. If you store the transfers and then add another expense, you must either rebuild the transfers or stop trusting them.",
      ],
      useWhen: ["The prompt says settle, simplify, or minimize transactions."],
      skipWhen: ["They only want balances. A settlement list you do not recompute will lie after the next bill."],
      questions: [
        "Is the greedy list always the fewest transfers? It is a correct clearing. A true minimum set of edges is a harder graph problem. Say which one you built.",
        "Pitfall: mutating the net map while you emit transfers, then losing the ability to show the original balances.",
      ],
      remember: "Balances first. A settlement list is a view you can throw away and build again.",
    },
  ],
  recap: [
    "Store one integer net per person, in cents.",
    "Equal, exact, and percent are strategies that must sum to the bill.",
    "Debt simplification matches debtors to creditors and does not replace the nets.",
  ],
  words: [
    { term: "Net balance", meaning: "Cents the group owes a person. Negative means that person owes the group." },
    { term: "Share", meaning: "The cents of one expense assigned to one person." },
    { term: "Settlement", meaning: "A list of payments that would bring every net back to zero." },
  ],
};
