import type { Topic } from "@/lib/types";

export const topic: Topic = {
  slug: "lld-clarify",
  kind: "lld",
  title: "Before you draw a box",
  short: "Ask who it is for, what done means, and which rules would embarrass you if they broke.",
  bigIdea:
    "A machine coding round is not a race to type. The first minutes are a conversation that shrinks the world until it fits on a board. You leave with nouns, rules, and an honest list of what you will not build. Everything after that is easier because the story is small enough to finish.",
  sections: [
    {
      id: "requirement-clarification",
      name: "Requirement Clarification and Scope",
      simple: "Ask what game we are playing before you take the pieces out",
      figure: "question-cards",
      body: [
        "The prompt is a sketch. 'Design a parking lot' does not say how many floors, whether bikes exist, or whether the fee depends on the hour. You ask a few sharp questions, then you repeat the scope back: 'I will do one lot, cars and bikes, an hourly fee, and no payments.' The interviewer will correct you or nod. That nod is the contract.",
        "Write the out of scope list where you can see it. Payments, persistence, and a user interface are usual cuts unless they are the point of the problem. Cutting them is not laziness if you say so. Building them in silence and missing the fee rule is the failure.",
      ],
      useWhen: ["The first minutes of any machine coding or LLD round."],
      skipWhen: ["The interviewer says the requirements are fixed and hands you a written list. Read it, confirm it, and start."],
      questions: [
        "What do you ask first? Who uses it, what the one success story is, which kinds exist, and what you may skip.",
        "Pitfall: twenty questions. Ask the ones that change the classes, then move.",
      ],
      remember: "Shrink the story, say it back, and write down what you are not building.",
    },
    {
      id: "functional-vs-nonfunctional",
      name: "Functional vs Non-Functional Requirements",
      simple: "What it does, and how well it has to do it",
      body: [
        "Functional requirements are the stories: a driver can park, a member can borrow, a move that leaves your king in check is refused. Non-functional requirements are qualities: the lot must be safe for two threads, the lock expires, the fee is an integer number of cents, lookup is fast enough for a whiteboard full of spots.",
        "In LLD, non-functional often means concurrency, idempotency, and complexity of the collections, not global traffic. Say which ones you are taking on. 'Single threaded unless we have time' is a fair choice if you say it. Pretending a HashMap is a distributed system is not.",
      ],
      useWhen: ["You are separating the user's stories from the qualities the code must have."],
      skipWhen: ["You start estimating QPS for a tic-tac-toe board. That is an HLD reflex in the wrong room."],
      questions: [
        "Give one functional and one non-functional requirement for a cache. Get and put are functional. A capacity limit and thread safety are non-functional.",
        "Pitfall: writing only happy paths. Refusals are functional requirements too.",
      ],
      remember: "Stories are functional. Safety, speed, and expiry are qualities. Pick the ones in scope.",
    },
    {
      id: "core-entities",
      name: "Core Entities and Value Objects",
      simple: "The things with names, and the amounts that are only their contents",
      body: [
        "From the scope, list entities: the things you would point at and say 'that one.' A spot, a ticket, a player. Then list values: money, a time range, a position on a board. Entities get ids and change. Values are replaced and compared by contents.",
        "This split decides the fields. A ticket holds a spot id, a vehicle, and an entry time. The fee is not stored as the source of truth if it can be computed, unless you must freeze it at exit. Say which. Interviewers listen for 'computed' versus 'stored.'",
      ],
      useWhen: ["You have the nouns and you are about to draw boxes."],
      skipWhen: ["The problem is a single algorithm with no lasting things. Do not invent entities to look thorough."],
      questions: [
        "Is a reservation an entity? Yes if it has a life: held, confirmed, expired. The time range on it can be a value.",
        "Pitfall: storing a value that can drift from the facts, such as a cached total you forget to update.",
      ],
      example: "value-object",
      remember: "Entities are particular things. Values are amounts. Do not give a coin an id unless the coin is that coin.",
    },
    {
      id: "class-responsibilities",
      name: "Class Responsibilities",
      simple: "One sentence each, with no 'and' in the middle",
      body: [
        "For each class, write one sentence: 'Ticket remembers entry and the spot, and can be closed once.' If you need a second unrelated sentence, you have two classes. The sentence is the responsibility. Methods should be verbs inside that sentence.",
        "Say the sentence out loud before you code the class. It keeps Manager out of the design. A ParkingLot finds a spot and issues a ticket. It does not format a receipt and send a text. Those sentences belong to someone else, or to later.",
      ],
      useWhen: ["Each box is about to gain methods."],
      skipWhen: ["You already said the sentence and the methods match it. Do not restate it every line."],
      questions: [
        "Who computes the fee? A pricing object, if the rule will vary. The ticket, if the rule is fixed and only needs the ticket's times. Pick one owner.",
        "Pitfall: a lot class that parks, prices, prints, and saves. The sentence does not fit in one breath.",
      ],
      remember: "One sentence per class. Methods are verbs inside that sentence.",
    },
    {
      id: "interfaces-and-abstract-classes",
      name: "Interfaces and Abstract Classes",
      simple: "A list of buttons, or a half-built toy the child must finish",
      body: [
        "An interface is a list of methods with no fields, in the usual interview telling. Anyone who implements it can stand in. An abstract class is a half-built parent: some methods are real, some are hooks the child must fill. Use an interface for a swappable rule. Use an abstract class for a template recipe you want to lock.",
        "Java has default methods, so the line is blurrier than the textbook. The design question stays: do callers need a face, or a shared recipe? If you need neither, use a concrete class. Do not introduce an abstract type to look formal.",
      ],
      useWhen: ["A second body is real, or a recipe must be shared by children who fill a hook."],
      skipWhen: ["There is one body and no hook. A concrete class is the honest type."],
      questions: [
        "Interface or abstract class for pricing? An interface. There is no shared recipe beyond one method. For a sandwich, an abstract class locks the bread around the filling.",
        "Pitfall: an abstract class with only abstract methods. That is an interface wearing a heavier coat.",
      ],
      example: "template-method",
      remember: "Interface for a face. Abstract class for a locked recipe. Concrete when there is only one.",
    },
    {
      id: "relationships-between-classes",
      name: "Relationships Between Classes",
      simple: "Who holds whom, and how many",
      body: [
        "Draw the lines you already named in the fundamentals: a lot has many spots, a spot has zero or one vehicle, a ticket points at one spot. Decide ownership. The lot owns the spots if they do not exist without it. The vehicle is associated: it arrives from outside.",
        "In code, 'many' becomes a map from id to object if you look up by id, or a list if you only scan. Say why you picked the collection when you get there. The relationship is the reason. The collection is the tool.",
      ],
      useWhen: ["The class list exists and you are about to choose fields."],
      skipWhen: ["Two classes do not talk. Do not draw a line to look complete."],
      questions: [
        "Who owns the ticket? Usually the lot or a ticket booth creates it, and the caller holds the id. The spot does not own the ticket's life if the ticket outlives the parking.",
        "Pitfall: both the spot and a global list think they own the vehicle, and they disagree.",
      ],
      example: "relationships",
      remember: "Counts and ownership first. The collection type follows the lookup you need.",
    },
    {
      id: "solid-in-practice",
      name: "SOLID in Practice",
      simple: "Use the letters when a change would hurt, not as a chant",
      body: [
        "In a round, SOLID shows up as decisions, not as a slide. You split printing from pricing because they change for different reasons. You add a vehicle by adding a class. You do not let a bike override park and throw. You do not put scan on a printer interface. You pass the clock in.",
        "Mention the letter when it explains a choice you made. Do not label every class with an initial. One clear example beats five names. If you are short on time, private fields and a strategy for the one varying rule are the two moves that pay rent.",
      ],
      useWhen: ["You are justifying a split or a face you introduced."],
      skipWhen: ["The design is already a handful of classes with obvious jobs. Forcing a pattern to demonstrate a letter wastes the clock."],
      questions: [
        "Which SOLID move is most useful in machine coding? Open/closed for the varying rule, and single responsibility so the rule has a home.",
        "Pitfall: a lecture on all five letters with no code.",
      ],
      example: "ocp",
      remember: "Show one letter in the code. Do not recite the alphabet.",
    },
    {
      id: "selecting-design-patterns",
      name: "Selecting Design Patterns",
      simple: "Name the pain, then open the box that matches",
      body: [
        "Select a pattern from the pain. Kinds that grow: strategy or state. A face that does not fit: adapter. A sequence callers repeat: facade. Undo: command. A mood diagram: state. One instance you can defend: singleton, and usually you will not defend it. If there is no pain, there is no pattern.",
        "Say the sentence, then the name. 'Fees vary, so pricing is a strategy.' If you cannot say the sentence, you picked the name first. Put it back.",
      ],
      useWhen: ["A variation, a wrap, or a conversation shape is already in the requirements."],
      skipWhen: ["You want the design to look fuller. Empty patterns cost reading time."],
      questions: [
        "Which patterns appear most often in machine coding? Strategy, state, observer, factory, and singleton as a topic to discuss carefully.",
        "Pitfall: stacking factory plus abstract factory plus builder around one constructor with two arguments.",
      ],
      remember: "Pain, then pattern. The sentence comes before the name.",
    },
    {
      id: "extensible-apis",
      name: "Extensible APIs",
      simple: "A small set of verbs that a new kind can still obey",
      body: [
        "The API of your design is the public methods: park, unpark, fee. Keep them in the story's words. Prefer a new type behind an existing verb to a new verb for every kind. park(vehicle) stays. The vehicle carries its type. Callers do not gain parkBike, parkCar, and parkTruck unless the stories truly differ.",
        "Extensible does not mean vague. Parameters that are maps of strings feel open and are brittle. A typed argument, or a small interface, grows more safely. Hide methods that are steps inside a story. Publish the story.",
      ],
      useWhen: ["You are choosing the methods other classes may call."],
      skipWhen: ["An internal helper. It does not need to be stable or cute. It needs to be clear."],
      questions: [
        "How do you add a truck without a new public method? Truck implements Vehicle, spots know which types they allow, and park stays the door.",
        "Pitfall: a do(String action, Map params) method. It looks extensible and is a second language inside the method.",
      ],
      remember: "Few verbs in the story's words. New kinds go behind the verb, not beside it.",
    },
    {
      id: "in-memory-data-modelling",
      name: "In-Memory Data Modelling",
      simple: "The boxes live in maps on the desk, not in a database down the hall",
      body: [
        "Machine coding stores data in memory unless the prompt says otherwise. A HashMap from id to object is your table. A second map is your index: spot id to ticket, user id to balance. You maintain the index in the same method that changes the data, so they cannot drift.",
        "Say what is the source of truth. If the spot's vehicle field and a lot-level map both say who is parked, one of them is extra and will lie. Keep one. Derive the other, or update both in one method and treat that method as the only door.",
      ],
      useWhen: ["You are placing objects into fields and collections."],
      skipWhen: ["The interviewer explicitly wants a database schema. Then talk tables and keys, and still say which invariants the code enforces."],
      questions: [
        "How do you find a free spot quickly? A map from type to a set of free spot ids, updated when you park and leave. Scanning is fine if you say the lot is small.",
        "Pitfall: two maps updated in different methods, so a crash or a missed call leaves a spot free in one and taken in the other.",
      ],
      remember: "Maps are your tables. One source of truth. Update indexes in the same door.",
    },
  ],
  recap: [
    "Clarify scope and say what you will not build.",
    "Separate stories from qualities, entities from values, and give each class one sentence.",
    "Use an interface for a face and an abstract class for a locked recipe.",
    "Apply SOLID and patterns only where a change would hurt.",
    "Keep public verbs few, and keep in-memory indexes in agreement with the source of truth.",
  ],
  words: [
    { term: "Scope", meaning: "What you will build, and what you have agreed to leave out." },
    { term: "Functional requirement", meaning: "A story the system must do, including refusals." },
    { term: "Non-functional requirement", meaning: "A quality such as safety, speed, or expiry." },
    { term: "API", meaning: "The methods others are allowed to call." },
  ],
};
