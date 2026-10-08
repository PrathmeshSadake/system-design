import type { Topic } from "@/lib/types";

export const topic: Topic = {
  slug: "cross-system-architecture",
  kind: "concept",
  title: "Cross-System Architecture",
  short: "Drawing the borders between the parts of a big system, so each part speaks its own clear language.",
  bigIdea:
    "A pizza shop has a kitchen, a front counter and delivery drivers. They all talk about orders, but each means something different. The cook cares about toppings, the cashier cares about money, and the driver cares about the address. If everyone shared one giant order form with every box on it, it would be a mess, and a change for the drivers could confuse the cooks. Big software has the same problem. Domain-driven design helps us find the natural rooms of a business, give each room its own words and its own data, and agree on a few simple doors between the rooms.",
  sections: [
    {
      id: "domain-driven-design",
      name: "Domain-driven design (DDD)",
      simple: "Build the software around the real business, using the business's own words",
      body: [
        "The domain is the real-world business that the software serves: running a pizza shop, a library or a bank. Domain-driven design says that before drawing boxes and databases, you should sit with the people who do the work, the domain experts, and learn how the business really works.",
        "Together, programmers and experts agree on one shared vocabulary, called the ubiquitous language (a fancy way of saying words that everyone uses the same way, everywhere). If the cooks say a pizza is fired when it goes into the oven, the code should also say fired, not something like status 3. When the words match, misunderstandings shrink and the code reads like the business.",
        "Not every part of the business deserves the same care. The core subdomain is what makes you special, like your secret dough recipe and your super fast ordering. Supporting subdomains are needed and fairly specific to you, like the kitchen schedule. Generic subdomains are the same for everyone, like taking card payments or sending email, so you usually buy them or reuse them. Spend your best people and time on the core.",
        "The trade-off is time. DDD takes a lot of talking and careful thinking, and for a small, simple app it can be more ceremony than it is worth.",
      ],
      remember: "Learn the business first, speak its language in the code, and put the most care into the core.",
    },
    {
      id: "bounded-contexts",
      name: "Bounded contexts",
      simple: "Rooms where every word has one clear meaning",
      body: [
        "A bounded context is a boundary, like the walls of a room, inside which a model and its words have exactly one meaning. A model is the simplified picture of the business that the code keeps: its things, its rules and its data.",
        "The same word can mean different things in different rooms. In the kitchen, an order is pizzas to bake and when they must be ready. At the register, an order is money to collect: the total, the tax and the payment. For delivery, an order is an address and a time to arrive. Trying to build one giant Order that serves everyone creates a huge, fragile model where every change risks breaking somebody else.",
        "So each context owns its own model and its own data, and the rooms connect through shared IDs, like the order number. Usually one team owns one context, so that team can change its own room without asking everyone else for permission.",
        "The trade-off is some repetition. The same customer might be stored in two contexts with different details, and those copies have to be kept up to date through messages. That is a fair price for rooms that can change on their own.",
      ],
      figure: "three-rooms",
      remember: "One room, one meaning. Let each context own its own words and its own data.",
    },
    {
      id: "context-map",
      name: "Context maps",
      simple: "A map of the rooms and the doors between them",
      body: [
        "Once you have rooms, you need to know how they talk to each other. A context map is a drawing of all the contexts and the relationships between them, like a school floor plan that shows which doors connect which rooms.",
        "There are a few common kinds of doors. A published API is a clear, documented window where other contexts can ask questions, like the library's lending desk. Shared events are news a context announces, such as an order was placed, so others can react later without waiting. In a customer and supplier relationship, one team depends on another, and the supplier plans its changes with that customer's needs in mind. A conformist simply accepts the other side's model as it is, often because the other side is much bigger and will not change for you.",
        "The anti-corruption layer is a translator at the border. When you must talk to a messy old system or an outside company that uses different words, you put a small layer in between that turns their words into yours, and yours into theirs. That way their model does not leak into your room and muddle your clean language.",
        "The trade-off is extra pieces to build and run. Every translator and every event is more code to look after, so use the simplest door that still keeps the rooms independent.",
      ],
      figure: "room-doors",
      remember: "Draw the doors on purpose: APIs to ask, events to announce, and a translator wherever outside words would leak in.",
    },
    {
      id: "api-boundaries",
      name: "API boundary identification",
      simple: "Deciding where one service ends and the next one begins",
      body: [
        "An API is the door that one part of the system offers to the others. The best place for those doors is usually along the bounded contexts. Think of a school: the library and the cafeteria are separate because they do different jobs, not because one is upstairs and one is downstairs.",
        "Two rules guide the cut. High cohesion: things that change together stay together, like keeping all the cake supplies in one cupboard. Low coupling: calls across the border are few and simple, like one short note passed between rooms instead of a constant shouted conversation. Split by business capability (ordering, kitchen, delivery), not by technical layer (all screens here, all databases there). A split by layer means every new feature needs every team.",
        "Do not share a database between contexts. If two services read and write the same tables, neither can change those tables without breaking the other, and the wall between them is only pretend. Share data through APIs and events instead.",
        "Watch for signs of a bad border: chatty calls, where one action needs a long string of back and forth requests; transactions that must cover several services again and again; and two teams who always have to change their code at the same time. These usually mean the line is in the wrong place, and the pieces belong in one context.",
      ],
      figure: "cut-wall",
      remember: "Cut along business jobs, keep what changes together inside, and let only a few simple messages cross.",
    },
    {
      id: "aggregates",
      name: "Aggregates",
      simple: "A small bundle of things that must always be correct together",
      body: [
        "Inside one context, some things must always agree with each other. An aggregate is a small cluster of data that is changed as one unit, through one front door called the root. For example, an order and its order lines: you never add a line directly, you ask the order, and the order checks its rules, like no more than 10 pizzas per order, and the total always equals the sum of the lines.",
        "Think of a lunchbox. You can swap the sandwich or add an apple, but you do it by opening that one box, and the box is packed correctly every time you close it. Each save changes one aggregate in one step, so the rules inside it are never broken.",
        "Rules that stretch across different aggregates are kept a little later, through events. This keeps aggregates small, which keeps saves fast and stops many people from waiting on the same lock. The trade-off: make aggregates too small and rules between them can be out of step for a moment, make them too big and everyone waits on everyone else.",
      ],
      remember: "An aggregate is the smallest bundle that must always be correct together, changed only through its front door.",
    },
  ],
  recap: [
    "DDD shapes software around the real business and uses the experts' own words in the code.",
    "Spend most of your care on the core subdomain, and buy or reuse the generic parts.",
    "A bounded context is a room where every word has one meaning, with its own model, its own data and usually one team.",
    "A context map shows the doors: published APIs, shared events, and anti-corruption translators at messy borders.",
    "Draw API boundaries along business capabilities, with high cohesion, low coupling and no shared databases.",
    "Chatty calls, constant cross-service transactions and teams that always change together are signs of a boundary in the wrong place.",
  ],
  words: [
    { term: "Domain", meaning: "The real business that the software serves." },
    { term: "Ubiquitous language", meaning: "The shared words that experts and programmers both use, the same way." },
    { term: "Core subdomain", meaning: "The part of the business that makes it special." },
    { term: "Bounded context", meaning: "A boundary inside which a model and its words have one meaning." },
    { term: "Context map", meaning: "A picture of the contexts and how they connect." },
    { term: "Anti-corruption layer", meaning: "A translator at the border that keeps outside words out of your model." },
    { term: "Cohesion", meaning: "How well the things inside one part belong together." },
    { term: "Coupling", meaning: "How much one part depends on another." },
    { term: "Aggregate", meaning: "A small bundle of data that is always changed as one unit." },
  ],
};
