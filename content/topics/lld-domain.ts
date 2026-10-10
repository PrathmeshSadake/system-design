import type { Topic } from "@/lib/types";

export const topic: Topic = {
  slug: "lld-domain",
  kind: "lld",
  title: "The heart of the program",
  short: "Values that do not change, entities that do, and errors that say whose fault it was.",
  bigIdea:
    "The domain is the story's own rules, with the database and the buttons stripped off. Money, seats, and moves live here. Some of them are values you replace rather than edit. Some are entities with a life and an id. A rich model knows its own rules. An anemic one is a bag of fields with the rules scattered outside.",
  sections: [
    {
      id: "immutability-and-value-objects",
      name: "Immutability and Value Objects",
      simple: "A coin does not change into a different coin. You put another coin beside it",
      figure: "labeled-tins",
      body: [
        "A value object is defined by its contents, not by an identity. Two moneys of 100 cents are interchangeable. You do not change a money into 150. You make a new money that is the sum. Immutable means the fields are fixed after birth. Sharing the object is safe, because nobody can change it under you.",
        "Use values for money, ranges, coordinates, and small combinations that have rules, such as 'cents are a whole number.' Use an entity when the story tracks one particular thing over time: this account, this seat, this game. Entities have ids. Values do not need them. In interviews, money as an int of cents, not a float, belongs in this conversation.",
      ],
      useWhen: ["Two instances with the same contents should be treated as the same, and editing in place would be a surprise."],
      skipWhen: ["The thing has a life and an identity. Freezing an account so you must copy it on every withdrawal is awkward. Keep the account as an entity and return new values from queries."],
      questions: [
        "Why not a float for money? Binary fractions cannot hold most decimal cents exactly. Integer minor units, or a decimal type, keep the total honest.",
        "Pitfall: a value object with a setter, or a list inside it that callers can edit. Then it is not a value. Copy on the way in and do not hand out the live list.",
      ],
      example: "value-object",
      remember: "Values are equal by contents and are not edited. Entities are particular things with ids.",
    },
    {
      id: "domain-models-and-entities",
      name: "Domain Models and Entities",
      simple: "The game, not the scoreboard wires",
      body: [
        "A domain model is the set of types that speak the story's language: Ticket, Spot, Move, Invoice. An entity is a domain object with identity. This booking is still this booking after the name on it is corrected. You find it by id, not by comparing every field.",
        "Keep the model free of framework words. A spot does not know about HTTP. It knows it is free or taken. The model is what you draw first in an LLD round. Storage and handlers wrap it. If you cannot explain the model without saying 'table' or 'controller,' the domain has leaked.",
      ],
      useWhen: ["The interview problem has rules that would still exist on paper, with no computer."],
      skipWhen: ["The task is a pure algorithm on numbers. A domain model of one function is pretend."],
      questions: [
        "Entity or value for a seat? The seat in a hall is an entity if it has a stable label, A4, and a life across shows. A coordinate pair might be the value that names it.",
        "Pitfall: an id on everything, including money and dates, so nothing can be compared by value.",
      ],
      remember: "The domain speaks the story. Entities have identity. The wires stay outside.",
    },
    {
      id: "rich-vs-anemic",
      name: "Rich vs Anemic Domain Model",
      simple: "A bank that refuses, versus a form that lets anyone write the balance",
      body: [
        "A rich model puts behavior with the data. Account.withdraw checks the funds. A caller cannot set the balance to a negative number because there is no public set. An anemic model is a class of public fields, and all the rules live in services outside. The class is a table row with a name.",
        "Interviews that say 'design' almost always want the rich version, because the point is where the rules live. Services still exist: they coordinate several objects, or they talk to storage. They should not repeat a rule the entity already knows. Anemic models win only at the edge, as data transfer shapes that carry input into the domain and carry answers out.",
      ],
      useWhen: ["A rule must travel with the data so every caller is protected."],
      skipWhen: ["You are defining the request or response shape. That object is a carrier. Do not pretend it is the account."],
      questions: [
        "Where does a service still help? When a story touches several entities, or when the step is infrastructure: save, send, lock across objects.",
        "Pitfall: a rich model that also opens sockets and writes SQL. Rich means rules, not 'does every job.'",
      ],
      example: "rich-model",
      remember: "Rules live with the data. Services coordinate. Carriers carry.",
    },
    {
      id: "dependency-management",
      name: "Dependency Management",
      simple: "The list of helpers is visible at the door, not hidden in a drawer",
      body: [
        "Dependency management means you can see what an object needs, and you control who supplies it. A constructor that lists a clock and a store is honest. A constructor that reaches for a global is not. The edge of the program, main, is allowed to know the concrete types and to pass them in.",
        "Cycles are the smell to mention. If A constructs B and B constructs A, neither can be born. Break the cycle with an interface, or by passing one in after birth on purpose and saying why. In a whiteboard design, a short list of constructor arguments is a feature. A long list means the class is doing too much.",
      ],
      useWhen: ["You are wiring classes and you want tests to substitute a helper."],
      skipWhen: ["The dependency is a value created inside, such as an empty list. That is not a collaborator."],
      questions: [
        "What is a composition root? The place, usually main, that builds the object graph. Domain classes are not the composition root.",
        "Pitfall: a service locator global that looks like injection and hides every dependency.",
      ],
      example: "dependency-injection",
      remember: "Needs are constructor arguments. Main supplies them. Cycles get broken on purpose.",
    },
    {
      id: "error-handling",
      name: "Error Handling and Exception Design",
      simple: "Say whose fault it was, and do not swallow the note",
      body: [
        "Split errors by who can do something about them. A bad argument is the caller's fault: empty name, negative quantity. A broken rule is a true outcome of the story: seat taken, insufficient funds. A failure of the surroundings is infrastructure: disk full, network down. These should not share one Exception with a string you must parse.",
        "Use unchecked exceptions for rule breaks in ordinary Java business code, or a result type if you want the compiler to force a check. Do not catch an error and ignore it. Do not use exceptions for ordinary control, such as 'spot not found' in a tight loop, if a lookup that returns empty is clearer. The message should help a caller fix the call, not dump a novel.",
      ],
      useWhen: ["A method can refuse, and the caller must be able to tell a bad call from a full lot."],
      skipWhen: ["The case is normal and frequent. Return an empty result or a status the caller expects."],
      questions: [
        "Checked or unchecked in Java? Interview answers: rule breaks are often unchecked so signatures stay readable, and you document them. Use checked only when the caller truly must handle that case to be correct.",
        "Pitfall: catch (Exception) with an empty body, or a single AppException for every cause.",
      ],
      example: "exceptions",
      remember: "Bad call, broken rule, and broken surroundings are different errors. Do not swallow them.",
    },
    {
      id: "input-validation",
      name: "Input Validation",
      simple: "Check the form at the door, and check the rule again inside the room",
      body: [
        "Validation has two layers. At the door, check the shape: the quantity is a whole number, the string is not empty, the date parses. Inside the domain, check the business rule: there is enough stock, the seat is free, the move is legal. The door protects the domain from nonsense. The domain protects the rule even if another caller skips the door.",
        "Do not trust the door alone. A test, a second endpoint, or a future queue will call the domain directly. Fail with the bad-argument error at the door and the rule error inside. Validate early, and also validate where the decision is made.",
      ],
      useWhen: ["Input comes from a person, a file, or another system."],
      skipWhen: ["The value was just produced by your own constructor and is already a valid type. Do not re-check a Money that cannot be built invalid."],
      questions: [
        "Where does 'seat taken' belong? In the domain, not in the parser. The parser does not know the hall.",
        "Pitfall: checking the business rule only in the UI, so the service will do the illegal thing for any other client.",
      ],
      example: "validation",
      remember: "Shape at the door. Rule in the object. Both, because callers skip doors.",
    },
    {
      id: "clean-code-and-naming",
      name: "Clean Code and Naming",
      simple: "Call the box what is inside it",
      body: [
        "A name is a design decision. Spot, reserve, and fee tell the truth. Mgr, data, and process do not. A method name is a verb. A class name is a noun. A boolean reads as a question: free, not flag. If the name needs a comment to explain it, rename it.",
        "Small methods help when each one has a name you would say out loud. Comments should explain why, not repeat what the code says. In an interview, names are a large part of the grade, because the interviewer is reading over your shoulder and cannot pause to decode.",
      ],
      useWhen: ["Always, and especially when you are stuck. Renaming often reveals the missing object."],
      skipWhen: ["Never skip it. A short-lived local in a three-line block may be i. A field may not."],
      questions: [
        "What is a bad name you should refuse? Manager, Helper, Processor, data, info, temp, flag, without a second word that says the job.",
        "Pitfall: a comment that contradicts the code. Delete the lie or fix the code. Do not keep both.",
      ],
      remember: "Nouns for things, verbs for actions, and no class named Manager.",
    },
    {
      id: "refactoring-and-code-smells",
      name: "Refactoring and Code Smells",
      simple: "If the room smells, find the leftover lunch before you paint",
      body: [
        "A smell is a hint, not a proof. Long method, large class, long parameter list, duplicated rule, primitive obsession (a string that is really money), feature envy (a method that uses another object's data more than its own), and switch-on-type. Each has a usual fix: extract, introduce a value, move the method, replace the switch with polymorphism.",
        "Refactor only with a safety net: the behavior you care about still happens. In a live interview, a tiny example you rerun is the net. Do not refactor and change the feature in one silent step.",
      ],
      useWhen: ["A change feels risky because the code is hard to see."],
      skipWhen: ["You are out of time and the code works. Mention the smell and the fix. Do not start a rewrite in the last five minutes."],
      questions: [
        "What is primitive obsession in a parking lot? A string spotId passed everywhere, with the format checked in five places. A SpotId or a Spot object holds the format once.",
        "Pitfall: treating every smell as an emergency. Some duplication is two stories that have not diverged yet.",
      ],
      example: "solid-refactor",
      remember: "Smells are hints. Extract the rule, keep the behavior, then move on.",
    },
    {
      id: "extensible-and-testable",
      name: "Extensible and Testable Design",
      simple: "A stud for the next brick, and a way to check the toy without the whole playground",
      body: [
        "Extensible means a named new kind is a new class. Testable means you can check a rule without a database, a clock you do not control, or a network. Both come from the same habits: small objects, rules in the domain, helpers passed in, and no hidden globals.",
        "You do not need a test framework on the whiteboard. You need a design you could test. If the only way to see a fee is to start the whole program and read a printout, the fee is trapped. A method that takes a duration and returns cents is testable. Mention one test you would write: the boundary, the refusal, and the happy path.",
      ],
      useWhen: ["You are placing a rule and you want the next kind, and a test, to be cheap."],
      skipWhen: ["You are adding a seam that no test and no future kind will use."],
      questions: [
        "What makes a design hard to test? Constructors that start threads, read clocks, or call the network, and rules that live only in the UI.",
        "Pitfall: testable by making every method public and every field mutable. Test through the real latch.",
      ],
      remember: "A new kind is a new class. A rule is a method you can call in a test.",
    },
  ],
  recap: [
    "Value objects are immutable and equal by contents. Entities have identity.",
    "A rich model keeps rules with the data. An anemic model leaks the rules into services.",
    "Show dependencies in the constructor. Split bad calls, broken rules, and broken surroundings.",
    "Validate shape at the door and rules in the domain. Name things with nouns and verbs.",
    "Smells point at extracts. Extensible and testable are the same small-object habits.",
  ],
  words: [
    { term: "Value object", meaning: "An immutable object compared by its contents, not by identity." },
    { term: "Entity", meaning: "A domain object with an identity that stays while its fields change." },
    { term: "Rich model", meaning: "Behavior and rules live on the domain object." },
    { term: "Anemic model", meaning: "A data bag. The rules live outside, and every caller must remember them." },
    { term: "Smell", meaning: "A surface hint that the shape will be costly to change." },
  ],
};
