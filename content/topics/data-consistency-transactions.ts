import type { Topic } from "@/lib/types";

export const topic: Topic = {
  slug: "data-consistency-transactions",
  kind: "concept",
  title: "Data Consistency and Transactions",
  short: "Keeping data correct when a job has many steps: a diary, a class vote, undo plans, and an outbox.",
  bigIdea:
    "Think about trading lunch snacks. You give your friend a cookie and they give you an apple. The trade should happen fully or not at all. Nobody wants to hand over a cookie and get nothing back. Computers have the same worry, except their trades can be cut off by a crash at any moment, or spread across many computers that cannot see each other. This page shows four tricks that keep trades fair: write it in a diary first, take a vote before acting, keep an undo plan for every step, and put the message in the same box as the change.",
  sections: [
    {
      id: "write-ahead-log",
      name: "Write-ahead log (WAL)",
      simple: "Write it in the diary before you do it",
      body: [
        "A database keeps its data on disk in big blocks called pages. Changing a page in place is slow and risky: if the power goes out halfway, the page could be left half changed. So before touching any page, the database first writes down what it is about to do in a diary called the write-ahead log, and makes sure that diary line is safely saved on disk.",
        "The log is append-only, which means new lines only ever go at the end, like a diary you never erase. Adding to the end of a file is very fast for a disk, much faster than jumping around to update many pages. So the database can say done as soon as the log line, with its commit mark, is safe, and update the real pages a bit later, in batches.",
        "If the computer crashes, the database reads the diary when it starts again. Changes that were committed are replayed (redone), so nothing it promised is lost. Changes that never got a commit mark are undone or ignored, so no half-finished trade survives. The data ends up as if the crash happened neatly between two whole changes.",
        "The same diary helps with other jobs. Followers copy the log to stay in step with the leader, and other programs can read it to learn about every change as it happens, which is called change data capture. The costs: every change is written twice, once to the log and once to the page, and old parts of the log must be cleared after a checkpoint (a moment when all earlier changes are known to be on the pages) so the log does not grow forever.",
      ],
      figure: "diary-first",
      remember: "Save the plan in the log first, then change the real data, so a crash can always be cleaned up.",
    },
    {
      id: "two-phase-commit",
      name: "Two-phase commit (2PC)",
      simple: "Everyone says ready before anyone goes",
      body: [
        "Sometimes one change must happen in several databases at once, all or nothing. For example, take money from a wallet in one database and add a concert ticket in another. Two-phase commit makes them act together. It is like a class trip where the teacher checks that every permission slip is signed before the bus leaves.",
        "Phase one is prepare. A coordinator asks every participant: can you commit this? Each participant does the work, saves it to its own log so it will survive a crash, keeps the changed rows locked so nobody else can touch them, and votes yes. If something is wrong, it votes no. A yes vote is a promise: I will commit later if you tell me to, no matter what.",
        "Phase two is commit. If every participant voted yes, the coordinator writes down its decision and tells everyone to commit. If even one said no, or did not answer in time, it tells everyone to abort and undo. Either way, everyone ends up doing the same thing.",
        "The weak spot is the coordinator. If it crashes after the votes but before telling anyone the result, the participants that voted yes are stuck. They promised to obey, so they cannot decide alone, and they keep their rows locked, blocking other work, until the coordinator comes back. 2PC is also slow, because of the extra round trips and long-held locks, and it ties services tightly together. That is why it is usually avoided between microservices (many small, separate services that each own their data) and kept for databases built to support it.",
      ],
      figure: "permission-slips",
      remember: "In 2PC everyone votes, then all commit or all abort, but a crashed coordinator can leave everyone stuck and locked.",
    },
    {
      id: "saga-pattern",
      name: "Saga pattern",
      simple: "A trip planned in steps, each with an undo plan",
      body: [
        "A saga splits a long job into a chain of small steps. Each step is a normal local transaction inside one service, and it is saved right away. Planning a birthday trip: book the flight, then book the hotel, then rent a car. Each booking is done and saved on its own.",
        "Because every step saves at once, there is no single all or nothing switch. Instead, each step comes with a compensating action, an undo plan. Book flight is undone by cancel flight. Charge card is undone by refund card. If renting the car fails, the saga runs the undo plans for the steps already done, in reverse order: cancel the hotel, then cancel the flight.",
        "Compensation is not a time machine. A refund is a new event, not an erased charge, and the customer may see both on their statement. Some things cannot be undone at all, like an email already sent. And while the saga runs, other people can see the in-between state, like the hotel briefly booked. There is no isolation, meaning no hiding of half-done work, so the design must expect and tolerate those moments.",
      ],
      points: [
        "Undo steps must keep trying until they work, so make them safe to repeat.",
        "Put steps that cannot be undone, like sending an email, as late in the chain as possible.",
      ],
      figure: "domino-undo",
      remember: "A saga is a chain of small saved steps, each with an undo plan that runs backward if a later step fails.",
    },
    {
      id: "orchestration-vs-choreography",
      name: "Saga orchestration vs. choreography",
      simple: "A conductor, or dancers following the music",
      body: [
        "There are two ways to run a saga. With orchestration, one central helper, the orchestrator, works like the conductor of an orchestra. It tells the flight service to book a flight. When that is done, it tells the hotel service to book a hotel. It keeps track of which steps are finished and, if something fails, which undo plans to run.",
        "Orchestration makes the whole flow easy to see and to change, because it lives in one place. The risk is that the orchestrator becomes a know-it-all that holds too much of the logic, and every service depends on it.",
        "With choreography, there is no conductor. Each service listens for events and reacts, like dancers who know their own moves and follow the music. The flight service announces flight booked. The hotel service hears that, books a hotel, and announces hotel booked, which the car service hears. Failures are events too: car failed tells the earlier services to undo their own steps.",
        "Choreography keeps services loosely tied and makes it easy to add new listeners. But the flow is spread across many services, so nobody can see the whole dance in one place. It is harder to debug, and events can accidentally trigger each other in a loop. A common rule of thumb: choreography for short, simple flows, and orchestration for long or complicated ones.",
      ],
      figure: "conductor",
      remember: "Orchestration has a conductor that is easy to follow. Choreography has dancers that are loosely tied but harder to follow.",
    },
    {
      id: "transactional-outbox",
      name: "Transactional outbox pattern",
      simple: "Put the letter in the outbox in the same go as the change",
      body: [
        "A service often needs to do two things: save an order in its database, and send a message saying order placed so the warehouse can pack it. These are two different systems, so they cannot be saved together in one step. If the service saves the order and crashes before sending, the warehouse never hears about it. If it sends first and then fails to save, the warehouse packs an order that does not exist. This is called the dual write problem.",
        "The outbox fixes it with a simple trick. Inside the same database, next to the orders table, keep an outbox table. In one local transaction, the service saves the order row and an outbox row that holds the message. Because it is one transaction in one database, both are saved or neither is.",
        "A separate helper, the relay, then picks up new outbox rows, publishes them to the message broker, and marks them sent. It can find new rows by checking the table every so often, called polling, or by reading the database's change log as it happens, which is change data capture.",
        "One catch remains. If the relay sends a message and crashes before marking it sent, it will send it again after it restarts. So delivery is at least once, and receivers must spot and skip repeats, usually by the message ID.",
      ],
      figure: "outbox-tray",
      remember: "Save the change and its message in one transaction, and let a relay deliver the message later, at least once.",
    },
  ],
  recap: [
    "A write-ahead log saves the plan to disk before the data changes, so after a crash committed work is redone and unfinished work is undone.",
    "Two-phase commit asks everyone to vote, then all commit or all abort, but a crashed coordinator leaves participants stuck holding locks.",
    "A saga is a chain of local steps, each with a compensating undo step that runs in reverse on failure, and in-between states are visible.",
    "Orchestration uses a central conductor that is easy to follow. Choreography uses events that keep services loose but spread out the flow.",
    "The transactional outbox saves the data and the message in one transaction, and a relay publishes the message at least once.",
  ],
  words: [
    { term: "Transaction", meaning: "A group of changes that happen all together or not at all." },
    { term: "Commit", meaning: "The moment a transaction's changes become final." },
    { term: "Abort (rollback)", meaning: "Canceling a transaction so none of its changes stay." },
    { term: "Write-ahead log (WAL)", meaning: "An append-only diary of changes, saved before the real data changes." },
    { term: "Coordinator", meaning: "The computer that runs the vote in two-phase commit." },
    { term: "Lock", meaning: "A sign on a row that says busy, so others must wait." },
    { term: "Compensating action", meaning: "An undo step, like a refund, that reverses an earlier step's effect." },
    { term: "Message broker", meaning: "The post office that carries messages between services." },
    { term: "Change data capture (CDC)", meaning: "Reading a database's change log to learn about every change." },
    { term: "Idempotent", meaning: "Safe to repeat. Doing it twice gives the same result as doing it once." },
  ],
};
