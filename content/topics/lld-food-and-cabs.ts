import type { Topic } from "@/lib/types";

export const topic: Topic = {
  slug: "lld-food-and-cabs",
  kind: "lld",
  title: "Food orders and cabs",
  short: "An order that may only step forward, and a driver who is either free or on a trip.",
  bigIdea:
    "A food order is a state machine with a short list of legal next steps. A cab stand is a matcher: among free drivers, pick the nearest, then walk the trip from matched to started to completed. Both interviews are about illegal jumps, not about a map of the city.",
  sections: [
    {
      id: "food-ordering",
      name: "Food Ordering",
      simple: "The ticket on the kitchen rail moves one peg at a time",
      figure: "dinner-bell",
      example: "food-order",
      body: [
        "The order starts at placed. The kitchen confirms it, prepares it, sends it out, and delivers it. Cancel is allowed early and forbidden once the food has left, or once it is already delivered.",
        "Put the allowed next states in one map. advance looks up the current state and throws if the requested state is not in the list. There is no method called setStatus that anything can call.",
        "Items, prices, and a restaurant id can hang on the order later. The interview usually probes the transitions first. Get those boring and correct.",
      ],
      useWhen: ["A thing moves through named stages and some jumps are illegal."],
      skipWhen: ["They want a marketplace of restaurants, menus, and drivers. Start with one order's states, then add the menu as data."],
      questions: [
        "Where do the arrows live? In one table, not in scattered if statements named differently in three classes.",
        "Pitfall: a boolean delivered and a boolean cancelled that can both be true.",
      ],
      remember: "One status string. One table of legal next steps. Everything else is data on the order.",
    },
    {
      id: "food-states",
      name: "Food Ordering State Transitions",
      simple: "You cannot un-deliver a meal, and you cannot cancel it after it arrives",
      body: [
        "placed may become confirmed or cancelled. confirmed may become preparing or cancelled. preparing may become out. out may become delivered. delivered and cancelled have no next state.",
        "The demo walks the happy path and then tries to cancel a delivered order. The throw is the test. If cancel succeeded, the table is wrong.",
        "If they want a restaurant to cancel during preparing, add cancelled to that row and only that row. Do not add a special case in the caller.",
      ],
      useWhen: ["They ask 'can the user cancel now?' at more than one moment."],
      skipWhen: ["The order is only placed and done. Two states do not need a speech. Still use the table so the third state is cheap."],
      questions: [
        "What is idempotency here? advance to the same state should fail in this model, because the table does not list a self-loop. A kinder API would no-op if you are already there. Pick one.",
        "Pitfall: drawing the arrows and then coding a different set.",
      ],
      remember: "If it is not in the row, it cannot happen. Delivered stays delivered.",
    },
    {
      id: "cab-booking",
      name: "Cab Booking",
      simple: "The nearest free car gets the rider. A busy car is invisible",
      example: "cab-booking",
      body: [
        "Drivers have a point and a free flag. request scans free drivers, picks the smallest Manhattan distance (|dx| + |dy|), marks that driver busy, and stores a trip in the matched state.",
        "start moves matched to started. complete moves started to completed and frees the driver. Any other jump throws. The demo puts a near driver at (1,1) and a far one at (9,9), requests from (0,0), and checks the near driver is free again after complete.",
        "Manhattan distance is the honest city-block metric and it needs no square root. If they want road routing, say the distance function is the seam and keep the matcher.",
      ],
      useWhen: ["Match a rider to one of several drivers, then track the trip."],
      skipWhen: ["They want surge maps and a dispatch service across cities. The class model is still driver, trip, and a distance function."],
      questions: [
        "What if no driver is free? Throw, or return a waiting trip. The example throws. A queue of riders is the follow-up.",
        "Pitfall: freeing the driver on start, so two trips share one car.",
      ],
      remember: "Nearest free driver. The trip has states. The driver is free only after complete.",
    },
  ],
  recap: [
    "Food status changes only along a table of arrows.",
    "Cancel is an arrow that disappears once the food is out.",
    "A cab trip binds one free driver, then gives them back at the end.",
  ],
  words: [
    { term: "State machine", meaning: "A status plus a table of which statuses may come next." },
    { term: "Manhattan distance", meaning: "Blocks east plus blocks north, with no diagonal shortcut." },
    { term: "Match", meaning: "Choosing one free driver and attaching them to a new trip." },
  ],
};
