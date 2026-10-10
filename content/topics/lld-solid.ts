import type { Topic } from "@/lib/types";

export const topic: Topic = {
  slug: "lld-solid",
  kind: "lld",
  title: "SOLID, one job at a time",
  short: "Five rules that keep a class easy to change without surprising its callers.",
  bigIdea:
    "SOLID is five sentences about change. Each letter is a way a class rots when the story grows: it does too much, it must be edited for every new kind, a child breaks a parent's promise, a small thing is forced to wear a huge coat, or a high level class is glued to a low level detail. Learn the smell and the fix, not just the initials.",
  sections: [
    {
      id: "intro-to-solid",
      name: "Intro to SOLID",
      simple: "Five house rules for classes that will have to change",
      figure: "chore-cards",
      body: [
        "Imagine chores on cards. If one card says 'wash, sweep, and cook,' nobody knows who failed when the floor is dirty. If the chore list is glued inside the kitchen wall, you cannot add 'feed the cat' without a hammer. SOLID is the set of rules that keeps each card small and lets you add a card without rebuilding the wall.",
        "The letters are SRP, OCP, LSP, ISP, and DIP. They overlap on purpose. A class that does one job (SRP) is easier to extend without editing (OCP). A child that keeps the parent's promises (LSP) is safe to pass where the parent was expected. Small faces (ISP) and depending on faces instead of brands (DIP) are how you plug the new card in. In an interview, name the letter, the smell, and the fix. A recital of the five names with no example does not count.",
      ],
      useWhen: [
        "You are explaining why you split a class or introduced an interface.",
      ],
      skipWhen: [
        "The code is ten lines and will not change. Quoting SOLID there is costume.",
      ],
      questions: [
        "Do the letters ever fight? Yes. A tiny private method might look like an SRP split and also like needless indirection. Prefer the split that matches a reason to change you can name.",
        "Pitfall: adding an interface for every class 'because of DIP' when nothing else implements it and nothing tests against it.",
      ],
      remember: "SOLID is five ways to keep change local. Name the smell, then the fix.",
    },
    {
      id: "srp",
      name: "Single Responsibility Principle (SRP)",
      simple: "One card, one chore",
      body: [
        "The single responsibility principle says a class should have one reason to change. A reason is a person or a rule who might ask for a different behavior: the accountant changes how tax is rounded, the designer changes how a receipt looks. If both live in one class, either request risks the other.",
        "It does not mean one method, and it does not mean the class may only do one tiny step. A Bill that can add its lines has one reason to change: the meaning of a total. A ReceiptPrinter that turns a bill into text has another. In a machine coding round, if your class name needs 'and,' ask whether those are two reasons.",
      ],
      useWhen: [
        "Two kinds of change would edit the same class and could break each other.",
      ],
      skipWhen: [
        "Splitting would leave two classes that always change together and are meaningless apart.",
      ],
      questions: [
        "What is a reason to change? A single source of requirements, not a single line of code.",
        "Pitfall: a class per function, with no idea of its own. That is SRP used as a shredder.",
      ],
      example: "srp",
      remember: "One reason to change per class. 'And' in the name is a clue.",
    },
    {
      id: "ocp",
      name: "Open Closed Principle (OCP)",
      simple: "Add a new coat hook without rebuilding the rack",
      body: [
        "The open closed principle says a module should be open for extension and closed for modification. Open means a new behavior can arrive. Closed means the old code that callers already trust does not have to be edited, and so does not have to be retested for that arrival.",
        "The usual shape is a small interface at the point that varies. Checkout calls pricing.apply. Full price and percent off are two classes. A third price is a new class, not a new branch inside Checkout. You still modify something: you register the new class at the edge, where the program is wired. The core stays shut. OCP is not 'never edit old files.' It is 'do not edit the stable middle for every new kind.'",
      ],
      useWhen: [
        "The problem already lists kinds that will grow: vehicle types, channels, pricing rules.",
      ],
      skipWhen: [
        "There is one kind. A strategy interface for a single formula is harder to read than the formula.",
      ],
      questions: [
        "How is OCP different from 'just use a switch'? A switch in the core must be edited, and every caller of that method is at risk. A new class is not.",
        "Pitfall: so open that behavior is loaded from five config files nobody can follow. Closed must still be understandable.",
      ],
      example: "ocp",
      remember: "New kind, new class. Leave the trusted middle alone.",
    },
    {
      id: "lsp",
      name: "Liskov Substitution Principle (LSP)",
      simple: "If you promised a flying bird, a penguin cannot take its place",
      body: [
        "The Liskov substitution principle says a child must be usable anywhere the parent was promised, without surprises. Callers of FlyingBird call fly and expect a flight. A Penguin that extends FlyingBird and throws on fly breaks those callers. The fix is to move fly down onto only the birds that fly. Penguin and Sparrow can still share Bird for the promises they both keep, such as a name.",
        "The classic rectangle and square story is the same trap. A square that extends rectangle and forces width and height to stay equal breaks a caller who set width and expected height to stay put. If keeping the child's rule means breaking the parent's promise, the inheritance is a lie. Use a sibling class, or composition.",
      ],
      useWhen: [
        "You are about to write extends, or you are reviewing a child that overrides a method with a refusal.",
      ],
      skipWhen: [
        "There is no parent type. LSP is about substitution, not about every class.",
      ],
      questions: [
        "What counts as a surprise? A stronger precondition (the child accepts fewer inputs), a weaker postcondition (it promises less), or a new exception the parent never threw.",
        "Pitfall: empty overrides that do nothing so the code compiles. The caller still thinks the job happened.",
      ],
      example: "lsp",
      remember: "A child may only stand in for the parent if every parent promise still holds.",
    },
    {
      id: "isp",
      name: "Interface Segregation Principle (ISP)",
      simple: "A small menu for each guest, not one giant menu everyone must order from",
      body: [
        "The interface segregation principle says callers should not depend on methods they do not use. A fat Machine interface with print and scan forces a plain printer to pretend it can scan, usually by throwing or returning nothing. Split the faces: Printer and Scanner. A copier implements both. A plain printer implements one.",
        "The test is a method you implement only because the interface demanded it, not because the object can do it. That method is a smell. Small interfaces also make tests smaller: a caller that only prints can be given a fake that only prints.",
      ],
      useWhen: [
        "Different callers use different slices of a fat type, or a new kind cannot honestly implement every method.",
      ],
      skipWhen: [
        "Every implementer truly does every method, and every caller uses them. Splitting for fashion creates a handful of one-method interfaces that travel as a clump anyway.",
      ],
      questions: [
        "How small is too small? If two methods are always used together and always implemented together, keep them on one face.",
        "Pitfall: an interface that mirrors one concrete class method for method, including methods only the concrete class should see.",
      ],
      example: "isp",
      remember: "Do not make a plain printer pretend it can scan. Split the menu.",
    },
    {
      id: "dip",
      name: "Dependency Inversion Principle (DIP)",
      simple: "The lamp asks for power, not for one brand of battery",
      body: [
        "The dependency inversion principle says high level code should not depend on low level details. Both should depend on an abstraction. A Lamp that constructs a particular Battery is stuck: tests need the real battery, and a wall socket cannot be used. A Lamp that receives a Power face can glow from a battery, a socket, or a fake in a test.",
        "Inversion means the detail depends on the face the high level named, instead of the high level reaching down into the detail. The face usually lives next to the high level policy, not next to the brand. DIP is the idea. Dependency injection, in the next lesson, is one way to hand the detail in.",
      ],
      useWhen: [
        "A policy class is glued to a clock, a database, a payment brand, or a logger you will want to replace in tests.",
      ],
      skipWhen: [
        "The detail is stable and trivial, such as constructing a list. Do not invert the language.",
      ],
      questions: [
        "What is the difference between DIP and dependency injection? DIP is the direction of the dependency: policy names the face. Injection is the act of passing the object in from outside.",
        "Pitfall: the interface lives in the low level package and exposes the brand's vocabulary. Then the high level still speaks the brand's language.",
      ],
      example: "dip",
      remember: "The lamp names power. The battery plugs into that name.",
    },
  ],
  recap: [
    "SRP: one reason to change per class.",
    "OCP: add a new kind as a new class, and leave the stable middle closed.",
    "LSP: a child must keep every promise the parent made.",
    "ISP: split faces so nobody implements a method they do not have.",
    "DIP: policy depends on a face, and the detail plugs into that face.",
  ],
  words: [
    { term: "SRP", meaning: "Single responsibility. One reason for the class to change." },
    { term: "OCP", meaning: "Open for a new kind, closed so the trusted middle stays unedited." },
    { term: "LSP", meaning: "Liskov substitution. A child can stand where the parent was promised." },
    { term: "ISP", meaning: "Interface segregation. Callers do not depend on methods they do not use." },
    { term: "DIP", meaning: "Dependency inversion. Both sides depend on a face the policy named." },
  ],
};
