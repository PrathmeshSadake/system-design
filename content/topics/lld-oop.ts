import type { Topic } from "@/lib/types";

export const topic: Topic = {
  slug: "lld-oop",
  kind: "lld",
  title: "Objects and the four big ideas",
  short: "Recipes, lunchboxes, remotes, toy trucks, and puppets that answer in their own voice.",
  bigIdea:
    "Object oriented programming is a way of packing a program into things that look like the things in the story. A book knows its page. A bank knows its coins. A puppet knows its voice. You do not start from files and functions floating loose. You start from the nouns, then you decide what each noun is allowed to do.",
  sections: [
    {
      id: "oop-fundamentals",
      name: "OOP Fundamentals",
      simple: "The story's nouns get to hold their own toys",
      figure: "lunch-latch",
      body: [
        "In a classroom, each child has a cubby. The cubby holds that child's pencils. You do not dump every pencil into one bucket and hope the right child finds them. Object oriented programming (OOP) does the same with a program: each important noun gets an object, and the object holds the data and the actions that belong together.",
        "The four ideas you will be asked to name are encapsulation, abstraction, inheritance, and polymorphism. They are not decorations. Encapsulation keeps rules inside. Abstraction gives callers a small face. Inheritance shares a recipe. Polymorphism lets one call do different work depending on the real object. Most interview designs need the first two every time, and the last two only when they make a change cheaper.",
      ],
      useWhen: [
        "The problem is a world of things with rules: spots, seats, orders, pieces on a board.",
      ],
      skipWhen: [
        "A short script that transforms one list into another. Forcing objects onto it adds rooms the story does not have.",
      ],
      questions: [
        "Name the four pillars and one sentence each. Practice until you can do it without a list in front of you.",
        "Pitfall: saying 'I used OOP' because the code has the word class. A class with public fields and no rules is only a bag.",
      ],
      remember: "OOP puts each noun's data and actions in one place, then guards that place.",
    },
    {
      id: "classes-and-objects",
      name: "Classes and Objects",
      simple: "The recipe card, and one cake baked from it",
      body: [
        "A recipe card says how to bake a cake. It is not a cake. You can bake two cakes from one card, and eating a slice of the first does not eat the second. The card is the class. Each cake is an object, also called an instance.",
        "A class lists the fields (the data each object keeps) and the methods (the actions). The constructor is the moment you bake: it sets the starting values and refuses a cake that could never be valid, such as a book with a negative number of pages. After that, two objects of the same class share the recipe and keep their own fields.",
      ],
      points: [
        "Class: the recipe. Object: one baked thing.",
        "Identity matters. Two books with the same title are still two books if they are two objects.",
        "Construct only valid objects. Do not build a half-made thing and hope a later call fixes it.",
      ],
      useWhen: [
        "Many things share a shape but each has its own data.",
      ],
      skipWhen: [
        "You need exactly one of something for the whole program, and a class would only be a costume on a global. Even then a class is often still the clear place to put it. The smell is a class that is never instantiated with meaning.",
      ],
      questions: [
        "What is the difference between a class and an object? The class is the type and the behavior. The object is one value with its own fields.",
        "Pitfall: using the class name as a bucket of static methods that all touch global data. That is a script wearing a class.",
      ],
      example: "classes-objects",
      remember: "The class is the recipe. Each object is its own cake.",
    },
    {
      id: "encapsulation",
      name: "Encapsulation",
      simple: "A lunchbox that opens only at the latch",
      body: [
        "Your lunch sits in a box. A friend can ask for a bite, and you hand one over. They do not open the box, rearrange the food, and close it wrong. The latch is the only way in.",
        "Encapsulation means an object keeps its fields private and changes them only in its own methods. Those methods are where the rules live: you cannot spend more cents than the bank holds, and you cannot deposit zero. Callers depend on the methods, so you can change the way the cents are stored without visiting every caller.",
      ],
      useWhen: [
        "A rule must stay true no matter who calls.",
        "The storage might change later, and callers should not notice.",
      ],
      skipWhen: [
        "A plain record with no rules, handed from one function to another and never protected. A small public data carrier is honest there. Do not pretend it is a rich object.",
      ],
      questions: [
        "How is encapsulation different from abstraction? Encapsulation hides data behind methods. Abstraction hides a whole job behind a smaller face, often an interface.",
        "Pitfall: a getter and a setter for every field, with no checks. That is a public field in a coat. The rules have leaked out to every caller.",
      ],
      example: "encapsulation",
      remember: "Keep the data private. Let the object guard its own rules.",
    },
    {
      id: "abstraction",
      name: "Abstraction",
      simple: "A remote with two buttons, and the wires hidden inside",
      body: [
        "A lamp remote has a button. You press it. You do not hold the wires. The button is the idea of 'toggle the light,' and the wires are a detail you are allowed to ignore.",
        "Abstraction means you show a small, stable face and hide the rest. In code the face is often an interface or an abstract class: a list of methods with no story about arrays, files, or network calls. Callers program to that face. The real class behind it can change. Abstraction is what lets you say 'a notifier' instead of 'this exact email client' in a design.",
      ],
      useWhen: [
        "Callers need a job done, and more than one thing could do that job.",
        "You want to test the caller without the real clock, disk, or payment network.",
      ],
      skipWhen: [
        "There is only one implementation, no test double, and no expected second one. An interface with a single class and no seam is extra paper. Add it when the seam is real.",
      ],
      questions: [
        "Give an example of a good face. 'PaymentGateway.charge(order, key)' is a face. 'StripeSdk.createPaymentIntent' is a detail that belongs behind it.",
        "Pitfall: a vague interface named Manager or Helper. If you cannot say the job in a few words, the abstraction is not one yet.",
      ],
      example: "abstraction",
      remember: "Show the button. Hide the wires. Name the job, not the brand.",
    },
    {
      id: "inheritance",
      name: "Inheritance",
      simple: "A toy truck is a toy, and it can also roll",
      body: [
        "Every toy can be hugged. A truck is a toy, so it can be hugged, and it can also roll. You write 'hug' once, on Toy. Truck borrows it. That borrowing is inheritance: a child class reuses and extends a parent class.",
        "Use inheritance only for a true 'is a' that never breaks. A Truck is a Toy in every place a Toy is expected, including the promises Toy made. If the child has to cancel a parent promise ('this bird cannot fly'), the hierarchy is lying. Interviewers know this trap. Prefer composition, a child holding another object, when the link is 'has a' or 'uses a.'",
      ],
      useWhen: [
        "The child really is the parent, in every promise, and you want shared behavior with a few differences.",
      ],
      skipWhen: [
        "You only want to reuse some code. Hold a helper object instead of extending it.",
        "The child would throw from a method the parent promised, or would ignore a field the parent requires.",
      ],
      questions: [
        "When is inheritance the wrong reuse? When the relationship is 'has a,' or when the child cannot keep the parent's promises. That second failure is the Liskov substitution problem.",
        "Pitfall: a deep tree of classes because it looks organized. Three levels you cannot explain out loud is already too deep for a whiteboard.",
      ],
      example: "inheritance",
      remember: "Inherit only for a true 'is a' that keeps every promise the parent made.",
    },
    {
      id: "polymorphism",
      name: "Polymorphism",
      simple: "You shout 'speak,' and each puppet answers in its own voice",
      body: [
        "You line up a dog puppet and a cat puppet and shout 'speak.' You do not shout a different word at each. The dog says woof. The cat says meow. One call, many bodies. That is polymorphism.",
        "In code, the caller holds the parent type or the interface, and the real method that runs belongs to the object. This is how a parking lot prices a bike and a truck through one method, fee(ticket), and how a notifier sends mail or a text through one method, send(message). The caller does not grow a new branch every time you add a voice. The new class does.",
      ],
      useWhen: [
        "The same verb means different work for different kinds of thing, and you expect new kinds later.",
      ],
      skipWhen: [
        "There are two cases, they will not grow, and a plain conditional is clearer. Polymorphism is a tool against change, not a tax on small code.",
      ],
      questions: [
        "What is the difference between overloading and overriding? Overloading is two methods with the same name and different inputs, chosen at compile time. Overriding is a child replacing a parent method, chosen from the real object at run time. Interviewers mean overriding when they say polymorphism, unless they say otherwise.",
        "Pitfall: a switch on a type name inside the caller. That switch must be edited for every new type. A method on the type itself does not.",
      ],
      example: "polymorphism",
      remember: "One verb, many bodies. Add a new body without editing the caller.",
    },
  ],
  recap: [
    "A class is a recipe. An object is one thing baked from it, with its own fields.",
    "Encapsulation keeps fields private and puts the rules in the methods.",
    "Abstraction shows a small face and hides wires, brands, and storage.",
    "Inherit only when the child truly is the parent and can keep every promise.",
    "Polymorphism is one call that runs the real object's method.",
  ],
  words: [
    { term: "Class", meaning: "The recipe: fields and methods shared by every object of that type." },
    { term: "Object", meaning: "One instance. It has its own field values and its own identity." },
    { term: "Encapsulation", meaning: "Private data, and methods that are the only way to change it." },
    { term: "Abstraction", meaning: "A small stable face that hides how the job is done." },
    { term: "Inheritance", meaning: "A child class reuses a parent class because it truly is that parent." },
    { term: "Polymorphism", meaning: "One call, and the real object decides which method body runs." },
    { term: "Interface", meaning: "A list of methods with no storage, used as a face." },
  ],
};
