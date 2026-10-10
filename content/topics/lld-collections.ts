import type { Topic } from "@/lib/types";

export const topic: Topic = {
  slug: "lld-collections",
  kind: "lld",
  title: "Data, state, and the awkward cases",
  short: "Pick the box that makes the lookup cheap, and write down the moods and the refusals.",
  bigIdea:
    "Once the nouns exist, the design becomes concrete: which collection answers the question you actually ask, which mood the object is in, and which weird inputs you refuse. Interviewers forgive a missing feature you declared out of scope. They do not forgive a list where you needed a map, or two booleans that can both be true.",
  sections: [
    {
      id: "choosing-collections",
      name: "Choosing Collections and Data Structures",
      simple: "A cubby for lookup, a line for turns, a heap for 'who is next'",
      figure: "cubby-bins",
      body: [
        "Pick a collection from the question you ask, not from habit. If you ask 'who has this id,' you want a map. If you ask 'have I seen this,' you want a set. If you walk in order, you want a list. If you always take the next soonest or the highest priority, you want a priority queue. If you need both fast lookup and an order, you often need two structures kept in one method, which is how an LRU cache is built.",
        "Say the cost in words. A map get is expected constant time. A scan of a list is linear. For a whiteboard lot of a hundred spots, a scan can be the simple and correct choice. Say 'the lot is small, so I scan' or 'I keep a set of free ids.' Both are designs. Silence is not.",
      ],
      useWhen: ["A field is about to become a list by default."],
      skipWhen: ["You need one optional value. That is a field, not a collection."],
      questions: [
        "When do you use two structures? When you ask two questions, such as 'does this key exist' and 'which key is least recently used.'",
        "Pitfall: a list of pairs used as a map. Lookup becomes a loop, and duplicates creep in.",
      ],
      example: "collections",
      remember: "The question picks the collection. Say the cost, even if you choose the simple scan.",
    },
    {
      id: "hashmaps-sets-lists-queues",
      name: "HashMaps, Sets, Lists, Queues, Priority Queues",
      simple: "Cubby holes, a bag of uniques, a row, a line, and a 'next most important'",
      body: [
        "A HashMap stores values by key and expects unique keys. It does not keep a useful order, except in languages whose map remembers insertion. A set stores unique items and answers 'is it in here.' A list keeps order and allows duplicates. A queue is first in, first out: jobs, arrivals. A stack is last in, first out: undo. A priority queue pops the best item according to a rank: the soonest job, the shortest elevator trip.",
        "Keys must not change while they sit in a map or a set. If the key is an object, its hash and equality must agree, and the fields they use must be fixed. Mutable keys are a classic bug: you change the field, and the map cannot find the entry. Prefer an id string or a value object as the key.",
      ],
      useWhen: ["You are choosing among these five for a field."],
      skipWhen: ["A library collection hides the structure you must explain, such as an LRU. Then build the map and the list yourself so you can talk about them."],
      questions: [
        "HashMap or TreeMap? HashMap for equality lookup. A tree map when you need keys in order or a range, and you accept log time.",
        "Pitfall: relying on HashMap order. If order matters, keep a list or use a structure that promises order.",
      ],
      example: "collections",
      remember: "Map by key, set for uniques, list for order, queue for fairness, heap for priority.",
    },
    {
      id: "state-management",
      name: "State Management and Transitions",
      simple: "One mood at a time, and a list of the arrows you allow",
      body: [
        "Write the moods and the arrows before the code. Placed may become paid or cancelled. Paid may become shipped. Shipped does not become placed. In code, one field holds the mood. The method checks the arrow and then changes the field. A missing arrow throws the rule error.",
        "Two booleans are not a mood. isPaid and isCancelled can both be true. One enum cannot. If a mood carries behavior, a state object can replace the enum. Either way, the arrows are the design. Tests should try an illegal arrow and expect a refusal.",
      ],
      useWhen: ["The same action is sometimes illegal."],
      skipWhen: ["The object has no phase. A calculator does not have a mood."],
      questions: [
        "Where do you put the table of arrows? Beside the enum, or in the state objects. A central table is easy to read. State objects are better when each mood has real code.",
        "Pitfall: setting the status from several methods with no shared check, so one path skips a step.",
      ],
      example: "state",
      remember: "One mood field. A method may move only along an arrow you listed.",
    },
    {
      id: "business-rule-validation",
      name: "Business Rule Validation",
      simple: "The room itself says no, not only the person at the door",
      body: [
        "A business rule is a truth in the story: you cannot reserve an overlapping room, you cannot withdraw more than you hold, a knight moves in an L. The object that owns the data checks the rule in the method that changes the data. Returning a boolean is fine when both answers are normal. Throwing is fine when the caller broke a contract. Pick one style and use it consistently.",
        "Combine rules with care. A coupon that needs three conditions can be a specification or a plain method that reads clearly. Do not scatter half of the rule in the caller and half in the object. The next caller will copy only half.",
      ],
      useWhen: ["A change would make the story false if nobody checked."],
      skipWhen: ["The check is only the shape of the input, such as 'string is not empty.' That can live at the door."],
      questions: [
        "Boolean or exception? If the caller must branch on a normal outcome, a result or a boolean can be clearer. If continuing would corrupt state, throw before you change anything.",
        "Pitfall: checking after you mutate. Validate, then change, so a refusal leaves the old state.",
      ],
      example: "rich-model",
      remember: "Check the rule in the owning method, before you change anything.",
    },
    {
      id: "edge-cases",
      name: "Edge Cases",
      simple: "The empty box, the last cookie, and the second child who asks",
      body: [
        "Edge cases are the stories at the boundary. Empty collection, one item, full capacity, zero, the maximum, the same request twice, a clock that says the lock just expired, a tie in a ranking. You will not list fifty. List the ones that change behavior.",
        "Say them when you outline the class, and code the ones in scope. A test or a demo line for empty, full, and duplicate is worth more than a comment that says 'handle errors.' If you run out of time, name the remaining edges so the interviewer knows you saw them.",
      ],
      useWhen: ["You think the happy path is done."],
      skipWhen: ["An edge is outside the scope you agreed. Mention it and move."],
      questions: [
        "What edges matter for a cache? Missing key, full cache, capacity one, expiry exactly now, and two gets of the same key.",
        "Pitfall: only testing the path you just wrote, which never takes the refusal branch.",
      ],
      remember: "Empty, full, duplicate, and exactly-on-the-boundary. Name them, then code the ones in scope.",
    },
  ],
  recap: [
    "Choose maps, sets, lists, queues, and heaps from the question you ask.",
    "Do not mutate a key that already sits in a map.",
    "One mood field, and only the arrows you listed.",
    "Validate business rules before you mutate.",
    "Edge cases worth naming: empty, full, duplicate, and the exact boundary.",
  ],
  words: [
    { term: "Hash map", meaning: "Key to value, expected constant-time lookup, unique keys." },
    { term: "Set", meaning: "Unique items, with a fast 'is it here' question." },
    { term: "Priority queue", meaning: "A heap that pops the best-ranked item." },
    { term: "Transition", meaning: "An allowed arrow from one mood to another." },
    { term: "Edge case", meaning: "A boundary input: empty, full, zero, duplicate, or exactly the limit." },
  ],
};
