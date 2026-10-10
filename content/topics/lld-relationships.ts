import type { Topic } from "@/lib/types";

export const topic: Topic = {
  slug: "lld-relationships",
  kind: "lld",
  title: "How objects hold each other",
  short: "Snapped bricks, shared pencils, and classes that do one job tightly.",
  bigIdea:
    "Once you have objects, the next question is how they hold each other. A house owns its rooms. A classroom uses a teacher who also exists outside it. A pencil can move to another room and still be a pencil. Getting these links wrong is how designs become either a knot or a pile of strangers.",
  sections: [
    {
      id: "composition-vs-inheritance",
      name: "Composition vs Inheritance",
      simple: "Snap a brick on, instead of saying the truck is a kind of engine",
      figure: "snap-bricks",
      body: [
        "You can glue an engine drawing onto a truck drawing and say the truck is a kind of engine. Then every engine promise applies to the truck, including ones that make no sense. Or you can snap an engine brick onto the truck. The truck has an engine. It starts the engine when you drive. That snap is composition.",
        "Composition means an object holds other objects and delegates work to them. Inheritance means a child class is a parent class. Prefer composition when you are reusing a behavior, when the part can be swapped, or when the link is 'has a.' Keep inheritance for a true 'is a' that will still be true in a year. This is the same advice as 'favor composition over inheritance' in the principles lesson. Interviewers ask it often because deep class trees are a common mess.",
      ],
      useWhen: [
        "A behavior might be swapped: a pricing rule, a notifier, an eviction policy.",
        "The relationship in the story is 'has a' or 'uses a.'",
      ],
      skipWhen: [
        "The child really is the parent in every promise, and callers should treat it as the parent. A SavingsAccount that is an Account can be inheritance if every Account promise still holds.",
      ],
      questions: [
        "Why do design pattern books prefer composition? Because you can change the part at runtime, test it alone, and you do not inherit methods you do not want.",
        "Pitfall: inheriting from a utility class to call its methods. Hold the utility, or just call a function.",
      ],
      example: "composition",
      remember: "Has-a is a snap. Is-a is a family name. Snap first.",
    },
    {
      id: "association-aggregation-composition",
      name: "Association, Aggregation and Composition",
      simple: "Using a teacher, sharing pencils, owning the rooms",
      body: [
        "Three words describe how long two objects stay tied. Association is the weakest: a classroom uses a teacher, and the teacher exists with or without that room. Aggregation is a shared whole: the room holds pencils, but the pencils can leave and join another room. Composition is ownership: the house creates its rooms, and if the house is torn down the rooms are gone too.",
        "In code, association is a field or a method argument that you do not control the lifetime of. Aggregation is a collection of things that outlive the collection. Composition is a field created by the owner, not handed in from outside, and not used after the owner is gone. UML draws association as a plain line, aggregation as a hollow diamond, and composition as a filled diamond, on the side of the whole.",
      ],
      points: [
        "Association: uses. Both objects live their own lives.",
        "Aggregation: has, but the parts are shared and can leave.",
        "Composition: owns. The part's life is inside the owner's life.",
      ],
      useWhen: [
        "You are drawing a class diagram and the interviewer asks what the diamond means.",
      ],
      skipWhen: [
        "The distinction does not change the code. Do not spend the whole round debating hollow versus filled diamonds if the methods are still unnamed.",
      ],
      questions: [
        "A university and its departments: composition or aggregation? Usually composition if a department has no meaning outside that university. Professors are association or aggregation, because they can move.",
        "Pitfall: treating every field as composition. A field that was passed into the constructor is usually association. The caller still owns it.",
      ],
      example: "relationships",
      remember: "Uses, shares, or owns. Say which, because the lifetimes differ.",
    },
    {
      id: "coupling-and-cohesion",
      name: "Coupling and Cohesion",
      simple: "Friends who need each other for everything, versus a toy that is finished by itself",
      body: [
        "Coupling is how much one object has to know about another. If the classroom reaches into the teacher's bag, reads a private notebook, and calls three helpers in order, the two are tightly coupled. A small change in the bag breaks the room. Cohesion is how much the inside of one object belongs together. A class named School that enrolls students, prints invoices, and resets passwords has low cohesion. It is three toys taped into one.",
        "The aim is high cohesion and loose coupling. Each class has one reason to change. Classes talk through small methods, not through each other's fields. You loosen coupling with interfaces, with events, and by passing in the helper instead of constructing a concrete class inside. You do not loosen it by making everything global. Global data is the tightest coupling there is, because everyone can see it.",
      ],
      useWhen: [
        "A change in one class forces edits in many unrelated classes. The coupling is too tight.",
        "A class description needs the word 'and' twice. The cohesion is too low.",
      ],
      skipWhen: [
        "Two classes that truly change together, such as a tiny pair used only by each other. Forcing an interface between them is ceremony.",
      ],
      questions: [
        "Which is worse, low cohesion or tight coupling? Both rot a design. Low cohesion makes a class hard to name. Tight coupling makes a change spread. Interview answers should mention both directions: split the class, and talk through a face.",
        "Pitfall: 'loose coupling' used as a reason to hide every call behind three interfaces. Indirection you cannot explain is not loose. It is lost.",
      ],
      remember: "One class, one job, held tightly. Between classes, a small door.",
    },
    {
      id: "identifying-classes",
      name: "Identifying Classes, Objects and Responsibilities",
      simple: "Underline the nouns, then ask who is in charge of the rule",
      body: [
        "Read the story and underline the nouns: car, spot, ticket, board. Those are candidate classes. Underline the verbs: park, leave, compute fee. Those are candidate methods. Then ask, for each rule, which noun would be embarrassed if the rule broke. That noun owns the method. A spot knows whether it is free. A lot knows how to find a free spot of the right size. A ticket remembers entry time. Pricing might be its own object if the rule changes for holidays.",
        "Throw out nouns that are just actors from outside (the driver is often only an id), nouns that are pure data with no behavior (sometimes a name is a string, not a class), and nouns that are the whole system ('system,' 'manager'). If you cannot name a responsibility in one sentence without 'and,' split it or drop it. Write the sentence on the board: 'Ticket remembers who parked and when, and nothing else.'",
      ],
      points: [
        "Nouns become candidates. Verbs become methods. Rules pick the owner.",
        "A class with no methods and no invariants is a value or a map key, not a service.",
        "A class named Manager, Processor, or Handler is a warning. Ask what it manages.",
      ],
      useWhen: [
        "The first five minutes of a machine coding round, before you draw boxes.",
      ],
      skipWhen: [
        "You already have a stable vocabulary from the interviewer. Do not rename their words to sound clever.",
      ],
      questions: [
        "Walk a parking lot out loud. Vehicle, Spot, Ticket, ParkingLot, PricingStrategy. Say one responsibility each.",
        "Pitfall: one God class that every method hangs off. If every sentence starts with 'the system,' you skipped this step.",
      ],
      remember: "Nouns, verbs, then the one object that would be ashamed if the rule failed.",
    },
    {
      id: "multiplicity",
      name: "Object Relationships and Multiplicity",
      simple: "How many friends each toy is allowed to hold",
      body: [
        "Multiplicity is the count on a link. A floor has many spots. A spot has zero or one vehicle. A ticket points at exactly one spot. You write it near the end of the line: 1, 0..1, or 1..*. Getting the count wrong shows up as bugs: two cars in one spot, or a ticket that forgot its spot.",
        "In code, 'many' is a list, a set, or a map. 'Zero or one' is an empty slot or a null you handle on purpose. 'Exactly one' is a field that the constructor requires. Say the counts out loud when you draw. Interviewers listen for 0..1 versus 1, because that is where the edge cases hide: the empty spot, the missing driver, the show with no seats left.",
      ],
      useWhen: [
        "A link can be empty, or can hold many, and the code has to say what happens then.",
      ],
      skipWhen: [
        "The count is obviously one and will stay one. Do not draw a star on every line.",
      ],
      questions: [
        "How do you stop two vehicles taking one spot? The spot's park method checks the 0..1 rule and refuses the second. The rule lives on the spot, or in the lot if the lot is the only door in.",
        "Pitfall: a list where the story says zero or one. Callers then have to remember that the list's real size is at most one, which they will forget.",
      ],
      remember: "Write the counts. Exactly one, zero or one, or many. The bugs live in the gaps.",
    },
    {
      id: "extensibility",
      name: "Designing for Extensibility and Maintainability",
      simple: "Leave a stud on the brick so a new piece can snap on later",
      body: [
        "A toy that is glued shut cannot grow a new wing. A toy with a stud can. Extensibility means a likely new kind (a new vehicle, a new notifier, a new pricing rule) can be added by adding a class, not by editing a long conditional in the middle of the old class. Maintainability means a person who did not write it can find the rule, change it, and know what might break.",
        "You get both from small classes, private fields, interfaces at the seams that you expect to vary, and tests on the rules. You do not get them from predicting every future feature. Design the seams you can already name from the problem statement. If the interviewer says 'what if we add trucks,' that seam is real. If nobody has mentioned a second kind, a plain class is easier to maintain than a framework.",
      ],
      useWhen: [
        "The problem statement, or the interviewer, names a second kind that should arrive without a rewrite.",
      ],
      skipWhen: [
        "You are building a plugin system for a variation nobody asked for. That is harder to read, which hurts maintenance.",
      ],
      questions: [
        "How would you add a new vehicle type? A new class that fits the Vehicle face, a new spot type if sizes differ, and no edit to the park method's branches.",
        "Pitfall: extensible in every direction, so the happy path is six interfaces deep. Extend along the axis the story already has.",
      ],
      remember: "Leave a stud where a new kind is already likely. Do not build a universal joint.",
    },
  ],
  recap: [
    "Prefer composition when the link is 'has a' or the part should be swappable.",
    "Association uses, aggregation shares, composition owns.",
    "Aim for high cohesion inside a class and loose coupling between classes.",
    "Find classes from nouns, methods from verbs, and owners from rules.",
    "Write multiplicity: 1, 0..1, or many.",
    "Extend along seams the story already named.",
  ],
  words: [
    { term: "Composition", meaning: "An object owns another. The part's life stays inside the owner's life." },
    { term: "Aggregation", meaning: "A whole holds parts that can leave and be shared." },
    { term: "Association", meaning: "One object uses another, and neither owns the other's life." },
    { term: "Coupling", meaning: "How much one object must know about another." },
    { term: "Cohesion", meaning: "How strongly the pieces inside one class belong together." },
    { term: "Multiplicity", meaning: "How many objects may sit on one end of a link." },
  ],
};
