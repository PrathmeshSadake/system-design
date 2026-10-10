import type { Topic } from "@/lib/types";

export const topic: Topic = {
  slug: "lld-money",
  kind: "lld",
  title: "Payments, wallets, and subscriptions",
  short: "A charge that means the same thing if you retry it, and a transfer that moves both balances or neither.",
  bigIdea:
    "Money objects are strict. A payment remembers a key so a retry does not charge twice, and a refund cannot exceed what was captured. A wallet moves cents from one balance to another as one story, and writes a line in a ledger. A subscription asks for the price each period and stops advancing if the payment fails.",
  sections: [
    {
      id: "payment",
      name: "Payment Gateway Integration",
      simple: "You hand the shop a note with a number. If you hand the same note again, they do not charge you twice",
      example: "payment",
      body: [
        "charge takes an idempotency key, a user, and cents. If the key was seen, it returns the same result and does not call the bank again. Otherwise it calls the bank once and stores captured or failed.",
        "The bank is injected. In the demo it always succeeds and counts calls. A second charge with k1 does not increment the count.",
        "This is the object model of a gateway, not the HTTP client. The client would send the key in a header. The class still owns the rule.",
      ],
      useWhen: ["A caller might retry a charge, and a double charge is the bug."],
      skipWhen: ["They want card networks and settlement files. The key, the capture, and the refund cap are the interview core."],
      questions: [
        "What is stored per key? The outcome, the amount, and how much has been refunded.",
        "Pitfall: keying only on the user, so two different purchases collapse into one.",
      ],
      remember: "Same key, same result, one bank call.",
    },
    {
      id: "payment-refunds",
      name: "Payment Refunds and Idempotency",
      simple: "You can give money back, but not more than you took, and not against a charge that never happened",
      body: [
        "refund adds cents to refunded if the charge is captured and the new total does not pass the original amount. When refunded equals the amount, the status becomes refunded. A partial refund stays captured.",
        "The demo refunds 200 then 300 of a 500 charge. A further refund would throw. A refund of a failed or unknown key throws.",
        "Idempotency of the refund itself wants its own key if the caller retries. This model trusts a single in-process call. Say that gap if they ask about a retry on the refund button.",
      ],
      useWhen: ["They ask about returns, voids, or paying twice by accident."],
      skipWhen: ["No money moves backward. Do not add refund until they ask, but leave the captured amount easy to see."],
      questions: [
        "Can you refund more than captured? No. The check is refunded + cents <= amount.",
        "Pitfall: calling the bank again on a charge retry and refunding the second ghost charge.",
      ],
      remember: "Refunds count up to the capture. A repeated charge key does not create a new capture.",
    },
    {
      id: "wallet",
      name: "Wallet and Ledger",
      simple: "Two jars of coins. Pouring from one jar to the other writes a line in the notebook",
      figure: "coin-purse",
      example: "wallet",
      body: [
        "open creates a balance. transfer checks both accounts exist, the amount is a positive integer, and the sender has enough. Then it subtracts, adds, and appends a ledger entry with from, to, cents, and a note.",
        "history filters the ledger for one id, either side. The demo moves 200 from Ada (500) to Bo (100), refuses 400 more, and checks both balances stayed at 300 and Ada has one line.",
        "The ledger is append-only in this model. You do not edit a line to undo. You add a reversing transfer.",
      ],
      useWhen: ["Balances and a history of how they changed."],
      skipWhen: ["A single counter with no audit. You can skip the list, but say a ledger is how you would explain a dispute."],
      questions: [
        "Why a ledger if you have balances? Balances are the now. The ledger is the why. You can rebuild balances from the ledger if you trust it.",
        "Pitfall: updating one balance and throwing before the other, so cents vanish.",
      ],
      remember: "Both balances move, then one ledger line is appended. A failure moves nothing.",
    },
    {
      id: "wallet-transfers",
      name: "Wallet Atomic Transfers and History",
      simple: "Either both jars change, or you put the coins back and pretend you never started",
      body: [
        "Atomic here means the checks happen before any write. There is no half-updated pair. In one process that is ordered statements. In a database it is a transaction. The shape of the method is the same: validate, then mutate, then record.",
        "History is the filter, not a second write. If you store a copy of history per user, the two copies can disagree. One list is the source.",
        "Insufficient funds throws before either put. The demo's 400 cent attempt leaves 300 and 300. That assertion is the atomicity test.",
      ],
      useWhen: ["They ask what a crash or a refusal should leave behind."],
      skipWhen: ["They are satisfied with the happy path. Still refuse overdraft. It is one if."],
      questions: [
        "How would you test atomicity? A transfer that must fail, then read both balances.",
        "Pitfall: catching the error after the first balance changed and returning a friendly message.",
      ],
      remember: "Check, then both writes, then the log. History reads the log.",
    },
    {
      id: "subscription",
      name: "Subscription Billing",
      simple: "Every thirty days the jar owes the price. If the jar cannot pay, the due date stays put",
      example: "subscription",
      body: [
        "A subscription has a price, a period, and a due time. bill looks while due is at or before now. It makes an invoice and asks a pay function. Paid invoices move due forward by the period. A failed invoice stops the loop so you do not skip ahead unpaid.",
        "The demo has 1500 cents, a 1000 cent plan, and a 30 day period. The first bill at time 0 succeeds and due becomes 30. The next bill fails, due stays 30, and the balance stays 500.",
        "Pay is injected so the subscription does not own the wallet. That is the seam between this lesson and the last one.",
      ],
      useWhen: ["A fee repeats, and a failure must not look like a renewal."],
      skipWhen: ["One-time checkout. An invoice with no period is just the payment lesson."],
      questions: [
        "Why stop the loop on failure? Otherwise one call at a far 'now' would record many failed periods and maybe advance past them.",
        "Pitfall: advancing due before pay returns, so a failure still skips a month.",
      ],
      remember: "Bill the due period. Move the due date only after pay succeeds.",
    },
  ],
  recap: [
    "A charge key returns the original result and does not call the bank again.",
    "Refunds cannot exceed the capture.",
    "Transfers update both balances or neither, and subscriptions renew only after a successful pay.",
  ],
  words: [
    { term: "Idempotency key", meaning: "A caller-supplied id that makes a repeated charge return the first result." },
    { term: "Ledger", meaning: "The append-only list of transfers that explains the balances." },
    { term: "Invoice", meaning: "One period's bill, marked paid or failed." },
  ],
};
