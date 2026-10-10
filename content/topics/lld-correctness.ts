import type { Topic } from "@/lib/types";

export const topic: Topic = {
  slug: "lld-correctness",
  kind: "lld",
  title: "Keeping the rules true",
  short: "Errors with a cause, locks when two people reach at once, and one charge that stays one charge.",
  bigIdea:
    "Correctness is the promise that the rules stay true even when the input is rude or two callers overlap. You name the error, you decide what is atomic, and you make a repeated request boring instead of dangerous. None of this requires a distributed system. It requires a door that only your method walks through.",
  sections: [
    {
      id: "custom-exceptions",
      name: "Custom Exceptions and Error Responses",
      simple: "A note that says 'bad form' or 'already taken,' not just 'no'",
      figure: "bolt-latch",
      body: [
        "A custom exception, or a small error type, carries the cause. BadRequest means the caller sent nonsense. RuleBroken means the story refused. The handler at the edge turns those into responses a person can read. The domain does not build HTTP. It throws or returns the typed error.",
        "Put the useful facts on the error: which seat, which key. Do not put a secret, and do not make the caller parse a sentence. A code or a type is enough. If you return a result object instead of throwing, it still has the same split: ok with a value, or a typed reason.",
      ],
      useWhen: ["Callers must tell failures apart."],
      skipWhen: ["The method cannot fail, or the only failure is a programmer mistake you want to crash on."],
      questions: [
        "What does the edge return? For a bad call, a 400-style response. For a taken seat, a conflict. For a missing id, not found. The domain's error type maps to those. The domain does not import the web framework.",
        "Pitfall: one error class with a string. Callers write if (message.contains('taken')), which breaks when you edit the sentence.",
      ],
      example: "exceptions",
      remember: "Typed causes. The edge translates them. Callers do not parse sentences.",
    },
    {
      id: "concurrency",
      name: "Concurrency and Thread Safety",
      simple: "Two hands in one toy box need a rule, or a toy gets torn",
      body: [
        "Thread safety means the rules stay true when two executions overlap. In Java, two threads can run park at once and give one spot to two cars. You prevent that with a lock around the check-and-change, or with a structure made for concurrency. In JavaScript's main thread, your function runs to the end unless you await. Overlaps return when work yields, or when you share state with workers.",
        "In an interview, say which world you are in. 'I will synchronize the lot' is a Java answer. 'This runs on one thread, and the await happens only after the seat is reserved' is a JavaScript answer. Both are designs. Assuming a HashMap is safe because it usually works is not.",
      ],
      useWhen: ["Two callers can touch the same fields at once, or you are writing Java and did not rule threads out."],
      skipWhen: ["You agreed the program is single-threaded and no call yields in the middle of a rule."],
      questions: [
        "Is a HashMap thread-safe? No. ConcurrentHashMap is safer for single operations, and it still does not make a check-then-act story atomic.",
        "Pitfall: locking one spot while the decision needs the whole lot. The lock must cover the invariant, not a convenient field.",
      ],
      remember: "Say the threading model. Check-and-change is one critical section, or it is a bug.",
    },
    {
      id: "synchronization",
      name: "Synchronization and Race Conditions",
      simple: "The last cookie: both children saw it, and both took it",
      body: [
        "A race is a story whose ending depends on timing. Both threads read 'one cookie left,' both take it, and the jar goes negative. The fix is to make the read and the write one indivisible step. In Java, synchronized on the owner, or a ReentrantLock, around the whole step. Do not lock, release, and then write.",
        "Deadlock is the next trap: A waits for B's lock while B waits for A's. Take locks in one global order, or hold only one lock. On a whiteboard, one lock on the aggregate (the lot, the board, the ledger) is often the right simple answer. Mention it is coarse, and that you could narrow it if the program were big.",
      ],
      useWhen: ["A rule is check-then-act on shared fields."],
      skipWhen: ["The data is immutable. There is nothing to race on, only safe publication of the reference."],
      questions: [
        "What is a race in a balance transfer? Two transfers read the same balance and both write, and one deposit disappears. The debit and the credit of one transfer must be one locked step.",
        "Pitfall: locking inside each account in opposite orders, so two transfers deadlock.",
      ],
      remember: "Read and write of a rule are one locked step. Take locks in one order.",
    },
    {
      id: "idempotency",
      name: "Idempotency and Duplicate Requests",
      simple: "The same note twice does not charge them twice",
      body: [
        "Idempotency means doing the request once and doing it again have the same effect as doing it once. A client retries because the answer was lost. Without a key, the second try charges again. With a key, the cashier remembers the first receipt and returns it.",
        "Store the key with the result, and store it in the same step as the change. If you change the balance and then crash before saving the key, the retry will apply the change twice. The key is not a comment. It is data. Expire keys only if a late retry should be a new request, and say so.",
      ],
      useWhen: ["A client may retry a create, a payment, or a booking."],
      skipWhen: ["The action is naturally idempotent, such as 'set the name to Ada.' Doing it twice is already safe. A key is optional."],
      questions: [
        "What do you return on a duplicate? The original result, not an error, unless the payload disagrees with the first one. A mismatch is a conflict, not a silent overwrite.",
        "Pitfall: remembering the key only in memory while the charge is in a database, or the reverse. They must commit together.",
      ],
      example: "idempotency",
      remember: "Remember the key with the result, in the same step as the change.",
    },
    {
      id: "transactions",
      name: "Transaction Boundaries and Atomic Operations",
      simple: "Both coins move, or neither coin moves",
      body: [
        "A transaction is a boundary around steps that must all happen or all not happen. A transfer debits one wallet and credits another. If you debit and then fail, the money vanished. Atomic means outsiders never see the middle. In memory, a lock around both changes is the transaction. In a database, a real transaction is.",
        "Draw the boundary where the rule lives. Reserving stock and creating the order are one boundary if you must not sell what you cannot keep. Sending the email is outside: a failed email should not roll back a paid order. Say what is inside. That sentence is the design.",
      ],
      useWhen: ["Two updates would leave a lie if only one of them stuck."],
      skipWhen: ["A single field write is already atomic on its own, and no other field must agree."],
      questions: [
        "What is the boundary of a seat booking? Lock the seats and record the booking together. Sending the ticket mail is after the commit.",
        "Pitfall: a lock that covers the database call and a slow email, so everyone waits on the mail server.",
      ],
      remember: "All of the rule, or none of it. Leave slow side effects outside the lock.",
    },
    {
      id: "separating-logic-and-infrastructure",
      name: "Separating Business Logic and Infrastructure",
      simple: "The rules of the game stay off the scoreboard's wires",
      body: [
        "Business logic is the story: a knight moves in an L, a wallet cannot go negative. Infrastructure is how the story touches the world: files, HTTP, clocks, databases, random number generators. If the knight class opens a socket, you cannot test a move without a network.",
        "Pass ports in: a Clock, a Store, a Gateway, as interfaces. The domain calls them. Main constructs the real ones. In a short round you may keep a HashMap inside the service and still keep the rule methods pure. The split is a direction, not a framework.",
      ],
      useWhen: ["A domain method is about to call the network, the disk, or the system clock directly."],
      skipWhen: ["A main method or a driver that exists only to show the story. That is the edge. It may wire infrastructure."],
      questions: [
        "Where does 'now' come from? A clock interface, so a test can expire a lock without sleeping.",
        "Pitfall: a domain package that imports the web framework 'just for the status code.'",
      ],
      example: "dependency-injection",
      remember: "Rules in the domain. Wires behind ports. Main connects them.",
    },
    {
      id: "configuration-driven",
      name: "Configuration-Driven Design",
      simple: "The numbers live on a card, not buried in the recipe",
      body: [
        "Configuration is the numbers and flags that change without a new algorithm: lot capacity, fee per hour, max retries, timeout. Put them in one object that is passed in, with defaults that make a demo work. The code reads the card. It does not scatter 15 and 500 through the methods.",
        "Do not put rules that are really behavior into config strings you must interpret. A fee formula is a strategy. A fee amount is config. If the config is invalid, fail at startup, not on the first customer.",
      ],
      useWhen: ["A number might change between environments or interview follow-ups."],
      skipWhen: ["The number is a true constant of the domain, such as a chessboard's 8. Naming it once is enough. A config file is extra."],
      questions: [
        "What belongs in config for a rate limiter? Capacity and refill rate. Not the algorithm. Token bucket versus sliding window is a strategy.",
        "Pitfall: a map of untyped strings as config, so a typo becomes a runtime surprise deep in a request.",
      ],
      remember: "Numbers and flags in one card, checked at the start. Behavior stays code.",
    },
    {
      id: "logging-and-observability",
      name: "Logging and Observability",
      simple: "A diary of what happened, so you can see it without guessing",
      body: [
        "Observability means you can tell what the program did after the fact. In LLD, that starts as a log with levels: debug for the noisy trail, info for the business facts, error for failures. Log the decision and the ids. Do not log secrets or full card numbers. A logger interface lets you use a quiet logger in tests and a printing one in the demo.",
        "Metrics and traces are the HLD cousins: counts, timings, and a request walking across services. In a machine coding round, mention one line you would log at info, such as 'parked ticket t1 in spot s3,' and keep going. A logging framework problem, later in these notes, is where appenders and levels become the whole design.",
      ],
      useWhen: ["A refusal or a state change would be invisible without a print."],
      skipWhen: ["You are about to log every line of a tight loop. That hides the signal."],
      questions: [
        "What must a log line have? A level, a fact, and the ids a person would search for. Not a dump of every field.",
        "Pitfall: logging and then throwing, and also logging at every caller, so one failure becomes five lines that look like five failures.",
      ],
      example: "null-object",
      remember: "Log facts and ids at a level. Keep secrets out. Tests can use the quiet logger.",
    },
  ],
  recap: [
    "Typed errors beat sentences. The edge maps them to responses.",
    "Check-then-act on shared state is one critical section.",
    "Idempotency keys remember the first result and must be stored with the change.",
    "A transaction covers the whole rule and excludes slow side effects.",
    "Domain rules stay off the wires. Config holds numbers. Logs hold facts and ids.",
  ],
  words: [
    { term: "Race condition", meaning: "An outcome that depends on timing because a check and a change were not one step." },
    { term: "Critical section", meaning: "The lines that must not interleave with another caller." },
    { term: "Idempotency key", meaning: "A caller-supplied id that makes a retry return the original result." },
    { term: "Atomic", meaning: "Outsiders see all of the update, or none of it." },
    { term: "Port", meaning: "A face the domain uses for a clock, a store, or a gateway." },
  ],
};
