import type { Topic } from "@/lib/types";

export const topic: Topic = {
  slug: "lld-creational",
  kind: "lld",
  title: "Making objects",
  short: "Who bakes the cake, which recipe they pick, and how you avoid baking two trophies.",
  bigIdea:
    "Most bugs in object design are not in the math. They are in birth and death: who is allowed to create the thing, what must be true at birth, and whether a second copy is a mistake. Creational patterns are small answers to that question. Use one when creation is a decision, not when creation is a single obvious line.",
  sections: [
    {
      id: "intro-to-design-patterns",
      name: "Intro to Design Patterns",
      simple: "Named ways of snapping bricks that people have already tried",
      figure: "cookie-press",
      body: [
        "A design pattern is a named shape for a problem that keeps coming back. The name is the useful part. If you say 'this is a strategy,' a teammate knows you split the varying rule into its own object. You do not have to invent the shape, and you do not have to explain it from zero.",
        "Patterns are sorted, loosely, into creational (making objects), structural (how objects are wrapped or joined), and behavioral (how they talk and change). They are not a checklist to apply. In an interview, pick a pattern only after you can say the problem in plain words: 'the price rule will grow,' 'the old plug does not fit the new hole,' 'the lamp has moods.' If you cannot say that sentence, you do not have a pattern yet. You have a guess.",
      ],
      useWhen: [
        "A shape has a known name, and using the name makes the design shorter to explain.",
      ],
      skipWhen: [
        "The code is clearer as a plain class or a function. A pattern you cannot justify is a costume.",
      ],
      questions: [
        "What are the three groups? Creational, structural, behavioral. Give one example of each before you go deeper.",
        "Pitfall: starting the answer with 'I will use a factory and a singleton' before naming the nouns.",
      ],
      remember: "A pattern is a name for a problem you already have, not a sticker you collect.",
    },
    {
      id: "simple-factory",
      name: "Simple Factory",
      simple: "One counter that hands you the right cookie when you say the name",
      body: [
        "A simple factory is a function or a class whose only job is to build the right object from a name or a flag. Callers say 'wave' or 'bow' and get a greeter. They do not know the class names. The decision of which class to new lives in one place.",
        "It is not one of the classic Gang of Four patterns. Interviewers still expect it, because it is the smallest step before Factory Method. The limit is that adding a kind edits the factory. That is fine when the list of kinds is small and owned by one team. When each kind should arrive without editing a central switch, move to Factory Method or a registry.",
      ],
      useWhen: [
        "Several callers would otherwise copy the same if or switch to pick a class.",
      ],
      skipWhen: [
        "There is only one class. A factory of one is a rename of new.",
      ],
      questions: [
        "Simple factory or factory method? Simple factory is one place with a switch. Factory method lets each child class decide what to build, so the parent story stays closed.",
        "Pitfall: a factory that also runs the business. Creation and the job are two reasons to change.",
      ],
      example: "simple-factory",
      remember: "One place picks the class from a name. Callers stop copying the switch.",
    },
    {
      id: "factory-method",
      name: "Factory Method",
      simple: "The parent knows the trip. Each child picks the vehicle",
      body: [
        "Factory Method puts the varying creation step in a method that children override. The parent already knows the story: deliver a box. Road logistics creates a truck. Sea logistics creates a ship. The deliver method is written once and calls createTransport.",
        "This is inheritance used on purpose, at one seam. The parent is closed. A new route is a new child, not an edit to deliver. Use it when the story around creation is shared and only the product differs. If there is no shared story, a simple factory or a strategy is enough.",
      ],
      useWhen: [
        "A fixed sequence must create one step that varies by child.",
      ],
      skipWhen: [
        "You only need to pick a class once, with no surrounding story. That is a simple factory.",
      ],
      questions: [
        "What is the method that children override? The factory method, often named create or make. The parent calls it. Callers call the parent's story method, not the factory method.",
        "Pitfall: a child that overrides the whole story and ignores the parent. Then you do not have a template of creation. You have a copy.",
      ],
      example: "factory-method",
      remember: "Parent owns the story. Children own the one line that says new.",
    },
    {
      id: "abstract-factory",
      name: "Abstract Factory",
      simple: "A whole matching set: dark button with dark field, never mixed",
      body: [
        "An abstract factory builds a family of objects that must match. A dark kit builds a dark button and a dark field. A light kit builds the light pair. The screen asks the kit for parts and never mixes kits. The factory's methods are the kinds of parts. Each concrete factory is one family.",
        "Use it when mixing families would be a bug: a dark button on a light form, a Windows scroll bar in a Mac window, a SQL dialect's types with another database's connection. It is heavier than Factory Method, which builds one product. If you only have one product, you do not have a family, and you do not need this pattern.",
      ],
      useWhen: [
        "Several parts must come from the same family, and mixing them is wrong.",
      ],
      skipWhen: [
        "There is one product type. Factory Method or a simple factory is the smaller tool.",
      ],
      questions: [
        "How do you add a new family? A new kit class. The screen stays shut. How do you add a new kind of part? You edit every kit, which is the pattern's cost. Say that cost out loud.",
        "Pitfall: calling a simple factory an abstract factory because it returns an interface.",
      ],
      example: "abstract-factory",
      remember: "A kit builds a matching family. One product is not a family.",
    },
    {
      id: "builder",
      name: "Builder",
      simple: "Stack the burger one layer at a time, and refuse to serve it half made",
      body: [
        "A builder builds a complicated object step by step, then hands it over in one finish step. Each step returns the builder so the caller can chain them. build checks the rules: a burger needs a bun and a patty. The half-made burger is not visible to the rest of the program.",
        "Use a builder when an object has many optional parts, or when creation has an order and a validity check you do not want in a constructor with eight arguments. Do not use it for an object with two required fields. A constructor is clearer. The director, in the textbook version, is a class that runs a known sequence of builder calls. On a whiteboard you can skip the director and let the caller chain the steps, as long as build is the only way out.",
      ],
      useWhen: [
        "Many optional parts, or a validity rule that should fail at the end of construction, not halfway.",
      ],
      skipWhen: [
        "Two fields, both required. Write a constructor.",
      ],
      questions: [
        "Builder or factory? A factory picks a class. A builder fills in one class (or one product) over several steps.",
        "Pitfall: a builder whose build does not check anything, and whose object can also be mutated later. Then you only added a fluent costume.",
      ],
      example: "builder",
      remember: "Steps, then one finish that refuses an unfinished object.",
    },
    {
      id: "singleton",
      name: "Singleton",
      simple: "One trophy. Asking again does not make a second trophy",
      body: [
        "A singleton is a class that allows only one instance, and gives everyone a way to reach it. A trophy case, a process-wide config, a connection to a resource that truly must not be doubled. Asking get twice returns the same object.",
        "Interviewers often hope you will resist it. A singleton is global state with a fancy door. Tests cannot easily replace it, and the hidden dependency does not show in the constructor. Prefer passing the one object in. Use a singleton only when there is a real 'exactly one per process' rule you can defend, and even then keep the business classes depending on a face so tests are not stuck.",
      ],
      useWhen: [
        "A second instance would be a bug, such as two writers to one hardware device, and you can say why.",
      ],
      skipWhen: [
        "You want a convenient global. Pass the object in. Convenience is not a rule.",
      ],
      questions: [
        "How do you test code that calls a singleton? Poorly, unless the singleton's useful part is behind a face you can replace. That difficulty is the argument against the pattern.",
        "Pitfall: singletons that hold mutable request data. One user's cart in a process-wide object is a data leak.",
      ],
      example: "singleton",
      remember: "One instance, only when a second would be wrong. Prefer passing it in.",
    },
    {
      id: "prototype",
      name: "Prototype",
      simple: "Stamp a copy of the sheep, tags included, without rebuilding the flock",
      body: [
        "Prototype makes a new object by copying an existing one. The copy is cheaper or safer when setup is heavy, or when the original was configured by someone else and you want the same setup with a few changes. The important bug is a shallow copy: two sheep sharing one tag list, so a tag on the copy appears on the original.",
        "Copy what the object owns. Share what it only uses, on purpose. In Java, think about clone versus a copy constructor. A copy constructor is easier to explain and harder to get wrong. In JavaScript, spread and slice make shallow copies. Nested arrays need their own copy, as the sheep's tags do.",
      ],
      useWhen: [
        "You have a ready-made example and want another with the same start, or creation is expensive.",
      ],
      skipWhen: [
        "Construction is a few assignments. new is clearer than a copy.",
      ],
      questions: [
        "Shallow or deep? Say which fields are copied and which are shared. Shared mutable fields are the bug.",
        "Pitfall: cloning an object that holds a socket, a thread, or a lock. Those should not be copied. They should be left out or reopened.",
      ],
      example: "prototype",
      remember: "Copy owned data. Do not share a list by accident.",
    },
    {
      id: "lifecycle",
      name: "Object Creation and Lifecycle Management",
      simple: "Birth, work, and a clear moment when the toy is put away",
      body: [
        "Every object has a life. Birth is the constructor or the factory, and it should produce a valid object or fail. Work is the methods. Death is when nobody should use it: a connection returned to a pool, a lock released, a file closed. If death is fuzzy, you get leaks and use-after-close bugs.",
        "Say who owns the life. The owner creates it, or receives it and is responsible for closing it. Borrowers use it and do not close it. In interviews this shows up as connection pools, seat locks with an expiry, and tickets that move from open to closed and never go backward. A lifecycle you can draw as a state diagram is a lifecycle you can code.",
      ],
      useWhen: [
        "The object holds something scarce: a seat, a connection, a file, a lock.",
      ],
      skipWhen: [
        "The object is a pure value. Nobody closes a point or a money amount.",
      ],
      questions: [
        "Where do you check validity, constructor or later? At birth, for rules that are always true. Later, for rules that depend on time, such as an expired lock.",
        "Pitfall: a close method that callers might forget. Pair it with a scope, a pool, or a test that fails if it is skipped.",
      ],
      remember: "Born valid, used through methods, put away by the owner.",
    },
    {
      id: "thread-safe-singleton",
      name: "Thread-Safe Singleton",
      simple: "Two children reach for the trophy at the same moment, and there is still one",
      body: [
        "A naive singleton checks 'if empty, create.' Two threads can both see empty and both create. You now have two trophies, which is the bug the pattern exists to prevent. In Java, the safe simple answers are: create it eagerly when the class loads, or use a static holder class that the class loader initializes once, or lock the getter. Double-checked locking needs volatile or it is still wrong. Say that if you mention it.",
        "JavaScript, in one process on the main thread, runs your function to the end before another call. A module-level instance is the usual singleton, and the race is not the same. The moment you share the object across workers, or you port the idea to Java, the race returns. The interview answer they want on a Java whiteboard is the holder class or an eager static final, plus the reason the unsynchronized check is wrong.",
      ],
      useWhen: [
        "You defended a singleton, and the language can run the getter on two threads.",
      ],
      skipWhen: [
        "You can pass one object in from main. Then there is no getter race to solve.",
      ],
      questions: [
        "Why is double-checked locking tricky? Without a memory barrier, a second thread can see a reference to an object whose fields are not finished. In Java the field must be volatile, or you avoid the pattern.",
        "Pitfall: synchronizing the whole getter forever, even after creation, when a holder class was enough.",
      ],
      example: "thread-safe-singleton",
      remember: "Two threads must not both pass the empty check. Prefer the holder class.",
    },
    {
      id: "factory-vs-abstract-vs-builder",
      name: "Factory vs Abstract Factory vs Builder",
      simple: "Pick a cookie, pick a matching set, or stack one cookie in layers",
      body: [
        "These three get mixed because all of them sit near the word new. A factory, simple or method, chooses which class to build. You have one product type and several kinds. An abstract factory chooses a family of products that must match each other. A builder does not choose among classes so much as it fills one complicated product in steps and checks it at the end.",
        "A short way to decide: one product, a few kinds, shared story: factory method. Several products that must match: abstract factory. One product, many optional parts: builder. If none of those sentences fit, call new in the constructor that needs the object, or pass the object in. Naming a pattern wrong is worse than using no pattern, because the interviewer now thinks you do not know the difference.",
      ],
      useWhen: [
        "You are about to say the word factory and you want to be sure which one you mean.",
      ],
      skipWhen: [
        "Creation is obvious. Do not compare patterns you are not using.",
      ],
      questions: [
        "Give one example of each from a parking lot. Factory: a vehicle from a type name. Abstract factory: a whole garage layout of spots and signs that match a country. Builder: a monthly pass with many optional add-ons.",
        "Pitfall: a class named Factory that is really a service full of business rules.",
      ],
      remember: "Factory picks a kind. Abstract factory picks a matching family. Builder fills one object in steps.",
    },
  ],
  recap: [
    "Use a pattern name only when it makes a real problem shorter to explain.",
    "Simple factory centralizes a switch. Factory method lets children create inside a shared story.",
    "Abstract factory builds a matching family. Builder fills one object in checked steps.",
    "Singleton means exactly one, and it is usually the wrong convenience.",
    "Prototype copies owned data and must not share mutable lists by accident.",
    "Make thread-safe singletons with a holder class or an eager instance, not a bare empty check.",
  ],
  words: [
    { term: "Simple factory", meaning: "One function or class that picks a concrete class from a name." },
    { term: "Factory method", meaning: "A parent story calls a create method that each child overrides." },
    { term: "Abstract factory", meaning: "A kit that builds a whole matching family of parts." },
    { term: "Builder", meaning: "Step by step construction, with a finish step that checks the result." },
    { term: "Singleton", meaning: "A class that allows one instance and hands that same instance out." },
    { term: "Prototype", meaning: "A new object made by copying an existing one." },
  ],
};
