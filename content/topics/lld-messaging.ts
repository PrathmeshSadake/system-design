import type { Topic } from "@/lib/types";

export const topic: Topic = {
  slug: "lld-messaging",
  kind: "lld",
  title: "Event bus and pub-sub",
  short: "Notes passed across the classroom, either to every listener or to one kid in each group.",
  bigIdea:
    "An event bus is a teacher who says a sentence and every subscribed ear in that topic hears it. Pub-sub with consumer groups is stricter: each group hears the sentence once, and the kids inside the group take turns. The words look alike. The delivery rule is the whole design.",
  sections: [
    {
      id: "event-bus",
      name: "Event Bus",
      simple: "A paper plane that every subscribed friend is allowed to read",
      figure: "paper-planes",
      example: "event-bus",
      body: [
        "Someone publishes a topic and a payload. The bus looks up who subscribed to that topic and tells them. The publisher does not know their names. That is the point: the cashier does not grow a new method every time a new listener appears.",
        "Keep the handler list per topic. subscribe returns an unsubscribe function, or an id you can remove. If you cannot remove a handler, tests and real screens leak.",
        "The in-memory bus in the example is the interview object. A broker on another machine is the same idea with durability and retries added later. Say that zoom out loud.",
      ],
      useWhen: ["Parts of one program should react to facts without calling each other directly."],
      skipWhen: ["You need a durable queue, replay, or competing consumers. That is the pub-sub section, or a real broker."],
      questions: [
        "What happens if a handler throws? Decide: isolate it so other handlers still run, and record the error. Do not pretend you decided nothing.",
        "Pitfall: publishing while a handler subscribes to the same topic, and mutating the list you are walking.",
      ],
      remember: "Publish does not name the listeners. The topic list does.",
    },
    {
      id: "event-bus-sync-async",
      name: "Event Bus Sync/Async Subscribers",
      simple: "Some friends read the note before you sit down. Some read it on the next break",
      body: [
        "A sync handler runs before publish returns. The caller can assume the work is done. An async handler is placed on a queue inside the bus and runs when you flush, or on a later turn of the event loop.",
        "Interviews rarely want real threads here. They want the seam: mode is a property of the subscription, not a boolean buried in the publisher. flush is explicit so a test can see the async work happen.",
        "Do not mix the two by accident. If the handler updates a balance, sync means the next line sees it. Async means it might not.",
      ],
      useWhen: ["Some listeners must finish before the command returns, and some must not block it."],
      skipWhen: ["Every listener is the same kind. One path is easier to explain. Mention the other as a field you could add."],
      questions: [
        "Why is flush better than a hidden timer in a machine coding round? The test controls time and order.",
        "Pitfall: awaiting only the first async handler and dropping the rest.",
      ],
      remember: "Sync means before publish returns. Async means queued until flush.",
    },
    {
      id: "event-bus-topics",
      name: "Event Bus Topic-Based",
      simple: "The plane has a label, and you only catch planes with your label",
      body: [
        "A topic is a string name for a kind of fact: order.placed, seat.locked. Subscribers register on one topic. Publishing to another topic does not wake them.",
        "Start with exact names. Wildcards and hierarchies are extra. If you add them, define whether order.* matches order.placed only, or also order.placed.line.",
        "The payload can be a small object. Do not make the topic the only place data lives. 'order.placed' plus an order id is clearer than encoding the id into the topic string.",
      ],
      useWhen: ["Different facts should not share a single listener list."],
      skipWhen: ["There is one kind of event. A list of handlers is enough, and a topic map is ceremony."],
      questions: [
        "Who owns the topic names? The publisher and the subscribers must share constants, or you will miss by a typo.",
        "Pitfall: one giant 'events' topic and a switch inside every handler. That puts the routing back in the listeners.",
      ],
      remember: "A topic is a label. Only subscribers of that label run.",
    },
    {
      id: "pub-sub",
      name: "Pub-Sub",
      simple: "The notice goes on the board, and each club takes one copy",
      example: "pub-sub",
      body: [
        "Publish and subscribe still names the idea, but a broker with groups is a different contract from an event bus. On the bus, every handler runs. On this broker, each consumer group gets one delivery, so two email workers do not both send the same mail.",
        "The example keeps groups in memory, keyed by topic plus group name. There is no disk. Say that. Durability, acknowledgements, and replay are the next conversation, not the first class.",
        "Return the list of deliveries from publish so a test can see who ran. Hidden side effects are harder to grade.",
      ],
      useWhen: ["Work should be done once per interested group, not once per process."],
      skipWhen: ["Every listener must see every event, like a UI and an audit log that both record the same click. That is the bus."],
      questions: [
        "What is the difference between the bus and this broker in one sentence? Bus: all handlers. Broker group: one handler in the group.",
        "Pitfall: using the same class for both and surprising yourself when two listeners both fire.",
      ],
      remember: "Pub-sub here means one delivery per group. The bus means every subscriber.",
    },
    {
      id: "pub-sub-groups",
      name: "Pub-Sub Consumer Groups",
      simple: "Inside the email club, friends take turns carrying the note",
      body: [
        "A group has members and a cursor. Each publish picks members[cursor % size], then advances the cursor. Two groups on the same topic both receive the message. Two members in one group do not.",
        "Round-robin is the interview default. Sticky assignment by key is the variation: all messages for one order go to one member. Say you used round-robin unless they asked for order affinity.",
        "The demo subscribes two email workers and one audit worker. The seen list is a one, c one, b two, c two. If your map does not keep insertion order, the groups can swap and the assertion changes. LinkedHashMap in Java, Map insertion order in JavaScript.",
      ],
      useWhen: ["They say workers, competing consumers, or 'only one of these should handle it'."],
      skipWhen: ["There is one subscriber. A group of one is just a function call with extra words."],
      questions: [
        "What if a member is slow? This model does not wait or retry. A real broker would ack and redeliver. Name that gap.",
        "Pitfall: sharing one cursor across topics, so a busy topic starves another.",
      ],
      remember: "Group gets one copy. Cursor picks which member. Another group gets its own copy.",
    },
  ],
  recap: [
    "An event bus calls every subscriber on a topic.",
    "Sync runs now. Async waits for flush.",
    "A consumer group takes one delivery and rotates members.",
  ],
  words: [
    { term: "Topic", meaning: "The name of a kind of message. Subscribers choose topics, not publishers' internals." },
    { term: "Consumer group", meaning: "A set of workers that share one copy of each message." },
    { term: "Flush", meaning: "Run the async handlers that publish queued." },
  ],
};
