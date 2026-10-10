import type { Topic } from "@/lib/types";

export const topic: Topic = {
  slug: "lld-scores",
  kind: "lld",
  title: "Leaderboard and URL shortener",
  short: "Who is ahead when the scores match, and which long address a short code means.",
  bigIdea:
    "A leaderboard is a sort with the tie broken on purpose. A URL shortener, at object level, is a link owned by a user, a code that finds it, and a click that records when someone used it. Neither problem needs a distributed system to have a clear class model. The distributed version is the high level lesson. This is the objects inside one service.",
  sections: [
    {
      id: "leaderboard",
      name: "Leaderboard",
      simple: "Pegs on a board. Higher pegs sit above lower ones. If two pegs are equal, the one placed first stays ahead",
      figure: "score-pegs",
      example: "leaderboard",
      body: [
        "submit stores one row per name: score and the time they earned it. A later submit replaces the row only when the score is higher, or when the score is equal and the time is earlier. A worse score does not wipe a better one.",
        "top(n) sorts by score descending, then time ascending, then name. The demo gives Bo 10 at time 5, Ada 10 at time 1, Cy 8, and a later 9 for Bo that is ignored. The order is Ada, Bo, Cy.",
        "For a whiteboard, a list you sort on read is fine if you say it is O(n log n) per read. A heap or a balanced tree is the upgrade when updates and top-k are both hot. Do not start with a tree.",
      ],
      useWhen: ["Ranks, scores, and a top-n list."],
      skipWhen: ["They want a global live board across servers. Mention shards and a merge, then build the single-board sort."],
      questions: [
        "Do you keep every attempt or the best? This model keeps the best per name, with the earliest time on a tie.",
        "Pitfall: sorting only by score and letting hash order decide ties, so the rank flips between runs.",
      ],
      remember: "One best row per player. Sort by score, then by who got there first.",
    },
    {
      id: "leaderboard-ties",
      name: "Leaderboard Ranking and Tie-Breaking",
      simple: "Same height pegs: the one who climbed there earlier stands in front",
      body: [
        "Say the comparator in words before you write it: higher score wins, earlier timestamp wins a tie, then the name so the order is total and tests are stable.",
        "Rank can be the index in that list plus one. If they want dense rank (two people at rank 1, the next is 2) versus competition rank (the next is 3), pick dense unless they say otherwise, and apply it after the sort.",
        "The ignored lower score in the demo is part of the rule. If they want the latest attempt even when it is worse, that is a different submit. Do not mix them.",
      ],
      useWhen: ["They ask 'what if two players have the same score'."],
      skipWhen: ["Scores are unique by construction. Still include the time key so you are not surprised."],
      questions: [
        "Which comparison is stable? A total order: score, time, name. Stability of the sort algorithm is not a substitute for a missing key.",
        "Pitfall: breaking ties by insertion order in a set that rehashes.",
      ],
      remember: "Write the tie rule into the comparator. Do not hope the sort is stable.",
    },
    {
      id: "url-shortener",
      name: "URL Shortener object model",
      simple: "A short nickname for a long address, plus a tick mark every time someone uses the nickname",
      example: "url-shortener",
      body: [
        "A link has a code, a user, and the original url. shorten assigns the next code. resolve finds the link or throws. click appends a click record and returns the url.",
        "The code in the demo is a base-36 counter. A random code with a collision check is the other common choice. Say you used a counter so the test is obvious. Uniqueness matters more than the alphabet.",
        "This is not the high level design of a shortener: no cache, no redirect service, no analytics pipeline. The objects are Link, the code map, and Click. If the interview is HLD, zoom out. If it is machine coding, stay here.",
      ],
      useWhen: ["They ask how you would model the shortener in code, or to implement shorten and resolve."],
      skipWhen: ["They ask for QPS, key generation at scale, and cache. That is the system-design version. You can still name these three objects."],
      questions: [
        "What is a click? A fact with the code and a time, not a counter you cannot explain later. A counter is a fine extra if they only want a total.",
        "Pitfall: encoding the user id into the code and then being unable to change ownership.",
      ],
      remember: "Link maps code to url. Click records use. The counter only needs to be unique.",
    },
  ],
  recap: [
    "Keep the best score per player and sort with an explicit tie break.",
    "A shortener is a link plus clicks. The code is just a unique key.",
    "Name the zoom: objects here, capacity in the high level lesson.",
  ],
  words: [
    { term: "Tie break", meaning: "The next comparison used when the main scores are equal." },
    { term: "Code", meaning: "The short key that resolves to one link." },
    { term: "Click", meaning: "A recorded use of a code, separate from the link itself." },
  ],
};
