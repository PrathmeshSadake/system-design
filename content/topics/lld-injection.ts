import type { Topic } from "@/lib/types";

export const topic: Topic = {
  slug: "lld-injection",
  kind: "lld",
  title: "Handing the helper in",
  short: "Pass the clock, the gateway, and the strategy through the door, instead of building them inside.",
  bigIdea:
    "A class that builds its own helpers is stuck with those helpers. A class that receives them can be tested with fakes and reused with new brands. This lesson is the practical half of dependency inversion: where the object comes from, constructor versus setter, and how you repair a class that already violates SOLID.",
  sections: [
    {
      id: "dependency-injection",
      name: "Dependency Injection",
      simple: "Someone else packs your pencil case and hands it to you",
      figure: "lamp-plug",
      body: [
        "If you build your own pencil case every morning, you always get the same pencils, and a test cannot hand you a short pencil. If a parent packs the case and hands it to you, the rest of the day only uses what is in the case. Dependency injection means an object receives the helpers it needs, instead of constructing the concrete helpers itself.",
        "The receiver names the face it needs (a clock, a gateway, a store). The composer, which is main or a factory at the edge of the program, picks the real helper and passes it in. Business classes stay free of brands. Tests pass fakes. This is wiring, not a framework. You can do it by hand with constructors. A framework is only worth it when the graph is large.",
      ],
      useWhen: [
        "A class needs a clock, random source, store, or any service you might fake or replace.",
      ],
      skipWhen: [
        "The helper is a pure value or a language collection. Newing a list inside the class is fine.",
      ],
      questions: [
        "Who creates the objects? The composer at the edge. Domain classes receive ready helpers.",
        "Pitfall: a service locator, a global bag everyone reaches into. That hides the dependency instead of injecting it, and tests cannot see what the class needs.",
      ],
      example: "dependency-injection",
      remember: "Receive the helper. Do not construct the brand inside the policy.",
    },
    {
      id: "constructor-vs-setter",
      name: "Constructor vs Setter Injection",
      simple: "Pack the bag before school starts, or drop a snack in later",
      body: [
        "Constructor injection passes every required helper into the constructor. The object is never half ready. If a helper is missing, the program fails at birth, not halfway through a request. This is the default you should defend in an interview.",
        "Setter injection adds a helper after birth, through a method. Use it for a truly optional part, or for a rare cycle where two objects must point at each other. The cost is a window where the object exists and the setter has not been called. Guard that window. Field injection, where a framework writes private fields with no constructor, hides the needs of the class. Prefer a constructor the reader can see.",
      ],
      useWhen: [
        "Constructor: the object cannot do its job without the helper.",
        "Setter: the helper is optional, or you must break a construction cycle and you say so.",
      ],
      skipWhen: [
        "Do not use a setter for a required helper just because the constructor argument list looks long. A long list is a hint the class does too much.",
      ],
      questions: [
        "Why do interviewers dislike field injection? The dependencies are invisible at the constructor, and a unit test can forget to set one.",
        "Pitfall: an init method that must be called after new. That is a setter with an easier name to forget.",
      ],
      remember: "Required helpers go in the constructor. Setters are for optional parts.",
    },
    {
      id: "programming-to-interfaces",
      name: "Programming to Interfaces",
      simple: "Ask for a pencil, not for one brand of pencil",
      body: [
        "Programming to an interface means the type in the field, the argument, and the variable is the face, not the concrete class. Lamp holds Power, not Battery. Checkout holds Pricing, not PercentOff. The concrete class appears at the edge, where you new it, and almost nowhere else.",
        "The interface should speak the caller's language: charge, allow, evict. It should not leak the concrete class's types. Then a new brand is a new class, tests are fakes of the same face, and the caller does not change. This is OCP and DIP in the way you type your fields.",
      ],
      useWhen: [
        "More than one class can do the job, or a test must substitute one.",
      ],
      skipWhen: [
        "The type is a value, such as a money amount or a point, and there will only ever be one class. Programming to an interface there adds a name with no second body.",
      ],
      questions: [
        "Where is the concrete class allowed to appear? At the composer, and inside factories whose job is creation.",
        "Pitfall: an interface so wide it is the concrete class copied. Callers still depend on every method.",
      ],
      remember: "Fields and arguments name the face. The brand appears once, at the edge.",
    },
    {
      id: "fixing-solid-violations",
      name: "Identifying and Fixing SOLID Violations",
      simple: "Smell the lunchbox, then move one rule back inside",
      body: [
        "You find violations by reading for pain, not by hunting initials. A long switch on a type name is an OCP smell. A child method that throws 'not supported' is an LSP smell. A method on an interface that one implementer cannot do is an ISP smell. A class that news up a database client is a DIP smell. A class description with two unrelated reasons to change is an SRP smell.",
        "Fix one smell at a time. Extract the varying part behind a face. Move the broken promise off the parent. Split the fat interface. Pass the detail in. Then rerun the story that used to work. Do not 'SOLID' the file by renaming classes and adding layers that do not remove a smell you can point at.",
      ],
      useWhen: [
        "A small change is touching unrelated lines, or a new kind needs a branch in an old class.",
      ],
      skipWhen: [
        "The code is already easy to change along the axis you care about. Leave the shape alone.",
      ],
      questions: [
        "Give a fix for a switch on notification channel. One sender interface, one class per channel, and the switch only at the edge that picks the class, or no switch at all if the caller already holds the sender.",
        "Pitfall: fixing all five letters in one edit so the diff is a rewrite. Reviewers cannot see which smell you removed.",
      ],
      remember: "Point at the smell. Change the shape that causes it. Leave the rest.",
    },
    {
      id: "refactoring-with-solid",
      name: "Refactoring Code Using SOLID",
      simple: "Move one chore off the crowded card, and check the floor is still clean",
      body: [
        "Refactoring means changing the shape without changing the behavior. With SOLID, the shape change is usually an extract: pull a method, then pull a class, then hide it behind the face callers actually need. After the split, the old class delegates. Callers of the old public method still see the same answers. That is how you know you did not change the story.",
        "A practical order in an interview, if you are allowed to clean as you go: make the fields private, name the rules, extract the part that will vary, inject it, then add the new kind as a new class. Keep a tiny example running between steps. A refactor you cannot check is a rewrite.",
      ],
      useWhen: [
        "Existing code works, and a new requirement would be risky inside the current shape.",
      ],
      skipWhen: [
        "The code is wrong, not just awkward. Fix the behavior first, or write the new behavior beside it and delete the old path once the new one matches.",
      ],
      questions: [
        "How do you prove a refactor? Same inputs, same outputs, before and after. A one-line demo or a unit test is enough on a whiteboard follow-up.",
        "Pitfall: mixing a behavior change into a structural change. If both happen, you will not know which one broke the total.",
      ],
      example: "solid-refactor",
      remember: "Extract the part that changes, keep the answers the same, then add the new kind.",
    },
  ],
  recap: [
    "Injection means the class receives helpers instead of building brands itself.",
    "Put required helpers in the constructor. Use setters only for optional parts.",
    "Type your fields as the face, and name the concrete class at the edge.",
    "Find SOLID smells by the pain: switches, refused promises, fat faces, hidden new.",
    "Refactor by extracting, with the old answers still true.",
  ],
  words: [
    { term: "Dependency injection", meaning: "Passing a helper in from outside, instead of constructing it inside." },
    { term: "Constructor injection", meaning: "Required helpers arrive as constructor arguments, so the object is born ready." },
    { term: "Setter injection", meaning: "A helper is attached after construction. Fine for optional parts." },
    { term: "Composer", meaning: "The edge of the program, usually main, that chooses concrete classes and wires them." },
    { term: "Refactor", meaning: "A shape change that keeps the same behavior." },
  ],
};
