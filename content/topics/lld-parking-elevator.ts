import type { Topic } from "@/lib/types";

export const topic: Topic = {
  slug: "lld-parking-elevator",
  kind: "lld",
  title: "Parking lot and elevator",
  short: "A painted spot that fits the vehicle, and a car that only stops where someone asked.",
  bigIdea:
    "A parking lot is a set of spots with sizes, a ticket, and a fee that can change when the lot is crowded. An elevator bank is a set of cars, a list of stops, and a rule for which car should answer a hall call. Both are state plus a rule. Neither needs a database to be a real interview design.",
  sections: [
    {
      id: "parking-lot",
      name: "Parking Lot",
      simple: "Painted rectangles. A big truck does not fit in a bicycle square",
      figure: "painted-spots",
      example: "parking-lot",
      body: [
        "The lot has spots. Each spot has a size: bike 1, car 2, truck 3. A vehicle fits a free spot whose size is greater than or equal to its own. The ticket remembers the spot, the vehicle type, and the time in. Leaving computes a fee and clears the spot.",
        "Look for a spot in a deterministic order so tests do not depend on hash order. Refuse to park when nothing fits. Two vehicles must not share a spot, which means the spot's vehicle field is the lock, not a boolean you forget to set.",
        "Fees use integer cents or an integer rate. Hours are at least one, and a partial hour rounds up: max(1, ceil(minutes / 60)). Say that before you code, because 'what about 61 minutes' is the first follow-up.",
      ],
      useWhen: ["The prompt is park, leave, fee, and more than one kind of space."],
      skipWhen: ["They want a city-wide system with gates and license-plate cameras across sites. Model one lot. Name the gate as a caller of park and leave."],
      questions: [
        "What are the nouns? Spot, vehicle, ticket, lot. A ParkingSpotManager that only forwards calls is optional. Do not add it until a second lot appears.",
        "Pitfall: freeing the spot before you compute occupancy, so a full lot charges the cheap rate.",
      ],
      remember: "A spot has a size and at most one vehicle. A ticket remembers when it came in.",
    },
    {
      id: "parking-types",
      name: "Parking Lot Multiple Vehicle/Spot Types",
      simple: "Bikes, cars, and trucks, and squares painted for each",
      body: [
        "Size is the rule, not a ladder of if statements that only allow an exact match. A car may use a truck spot. A truck may not use a car spot. If the interviewer wants exact match only, change one comparison and say so.",
        "Put the size on the type, in one function, so a new type is a new number. Do not copy the fit check into park and into the display board.",
        "The demo fills a lot that has one of each spot, then refuses a second bike. That is the test that the fit rule and the free flag both work.",
      ],
      useWhen: ["They list more than one vehicle or spot."],
      skipWhen: ["One vehicle, one spot. A boolean 'free' is the whole model. Mention sizes as the extension."],
      questions: [
        "Can a motorcycle take a car spot? In this model, yes, because 1 fits in 2. If the business says no, the fit function changes, not the ticket.",
        "Pitfall: searching spots with a HashMap and parking in a different spot every run.",
      ],
      remember: "One size number. Fit means spot size is at least vehicle size.",
    },
    {
      id: "parking-pricing",
      name: "Parking Lot Dynamic Pricing",
      simple: "When the lot is almost full, the sign says the price went up",
      body: [
        "The fee is hours times rate times size. The rate is the surge rate when occupancy, measured before the spot is cleared, is at least 80 percent. Otherwise it is the base rate. The example uses 20 and 10.",
        "Measure occupancy first, then clear. If you clear first, a lot that was full looks empty and the person who left during the rush gets the quiet price.",
        "Keep the thresholds in one place. In JavaScript they are a small config. In the Java demo they are the same numbers, written next to the fee. A strategy object is the next step if they ask for weekend rates.",
      ],
      useWhen: ["They mention surge, peak, or a price that depends on how full the lot is."],
      skipWhen: ["They want a flat fee. Compute hours times a constant and move on."],
      questions: [
        "When is occupancy read? Before the leaving car gives the spot back.",
        "Pitfall: charging surge based on how full the lot is after they leave, which hides the crowd they were part of.",
      ],
      remember: "Read how full the lot is, then free the spot, then multiply.",
    },
    {
      id: "elevator",
      name: "Elevator",
      simple: "A box that moves one floor at a time and only opens where someone pressed a button",
      example: "elevator",
      body: [
        "Each car has a floor, a direction, and a set of stops. step moves every car at most one floor toward a stop that is ahead, then clears the stop if the car has landed on it. Direction becomes zero when the set is empty.",
        "A hall request picks a car. The score is distance, plus a big penalty if the car is moving the other way. An idle car has no penalty. The closest sensible car takes the stop.",
        "This is not a full SCAN/LOOK textbook scheduler. It is a rule you can simulate by hand. Say the name of the idea (prefer a car already heading your way) and the limit (one floor per step, no door timer).",
      ],
      useWhen: ["The prompt is one or more elevators and people requesting floors."],
      skipWhen: ["They want capacity of a building, wait-time percentiles, and dispatch across a city. That is a system design sketch, then this model if they say 'now the classes'."],
      questions: [
        "What is in the car object? Floor, direction, stops. Destination buttons and hall calls can share the stop set until they ask to separate them.",
        "Pitfall: clearing the stop before you move, so after three steps the car is on the floor but the stop is still set. Move, then clear.",
      ],
      remember: "Move one floor, then drop the stop you landed on. Idle means no direction and no stops.",
    },
    {
      id: "elevator-scheduling",
      name: "Elevator Multiple Elevators and Scheduling",
      simple: "Do not drag the car that is already going the other way past everyone",
      body: [
        "With two cars, a request at floor 3 from the lobby goes to the idle car at 0, not to a car you have not created. After that car arrives, a later request should not steal a car that is busy in the other direction if an idle or aligned car is closer.",
        "The penalty of 100 is a stand-in for 'wrong direction'. Any number larger than the building's height works, because distance is at most the floor count. Say that, so it does not look like a magic constant you cannot explain.",
        "Follow-ups you can name without coding: a direction button in the hall (up versus down), a max load, and a door that stays open for a tick. Each is a field, not a new project.",
      ],
      useWhen: ["They say 'more than one elevator' or 'which one should come'."],
      skipWhen: ["One car. The scheduler is 'add the floor to the only set'. Mention the score as the next step."],
      questions: [
        "Why not always pick the nearest car? A near car going the wrong way makes riders wait longer than a slightly farther car already on the way.",
        "Pitfall: assigning the request to every car, so they all arrive and the simulation looks busy and wrong.",
      ],
      remember: "Score is distance, plus a penalty for a car heading away. One car owns the stop.",
    },
  ],
  recap: [
    "Spots have sizes. A vehicle fits an equal or larger free spot.",
    "Price reads occupancy before the spot is freed.",
    "Elevator steps move one floor and clear a stop only after landing. The scheduler avoids cars going the other way.",
  ],
  words: [
    { term: "Ticket", meaning: "The record of one stay: which spot, what vehicle, when it entered." },
    { term: "Occupancy", meaning: "Filled spots divided by all spots, used before a car leaves." },
    { term: "Hall call", meaning: "A request from a floor, assigned to one car's stop set." },
  ],
};
