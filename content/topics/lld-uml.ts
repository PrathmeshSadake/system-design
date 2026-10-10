import type { Topic } from "@/lib/types";

export const topic: Topic = {
  slug: "lld-uml",
  kind: "lld",
  title: "Pictures of a design",
  short: "Class boxes, a comic of calls, a life of states, and a flowchart of the work.",
  bigIdea:
    "A design in your head is invisible. UML is a small set of pictures so someone else can see the rooms, the order of the shouts, and the moods a thing can be in. You do not need every symbol. You need the four pictures interviewers still ask for, drawn in words they recognize.",
  sections: [
    {
      id: "uml-class",
      name: "UML Class Diagrams",
      simple: "A box for each toy, and a line for how they hold each other",
      figure: "comic-strip",
      body: [
        "Draw a box. Write the class name on top, the fields in the middle, the methods at the bottom. A line between boxes is a relationship. A hollow triangle means inheritance, pointing at the parent. A filled diamond means composition. A hollow diamond means aggregation. A plain line is association. Numbers at the ends are multiplicity.",
        "In an interview, a class diagram is the map of the nouns. Keep fields few and methods named as verbs. Mark a method on an interface in italics, or write <<interface>> above the name. Do not draw the database, the framework, or a box called Main. If a line has no counts and no reason, erase it. The picture is done when you can tell the story of park, borrow, or pay by walking the lines.",
      ],
      points: [
        "Box: name, fields, methods.",
        "Triangle toward the parent: inheritance. Diamond toward the whole: aggregation or composition.",
        "1, 0..1, and 1..* belong on the ends.",
      ],
      useWhen: [
        "You need to show structure: who holds whom, before you show the order of calls.",
      ],
      skipWhen: [
        "The interviewer asked for the sequence of a single request. A class diagram does not show time.",
      ],
      questions: [
        "Which way does the inheritance arrow point? Toward the parent. Children point up at what they are.",
        "Pitfall: methods that are really the whole use case stuffed into one box, like ParkingLot.doEverything.",
      ],
      remember: "Boxes are nouns. Lines are how they hold each other. Diamonds mark the whole.",
    },
    {
      id: "uml-sequence",
      name: "UML Sequence Diagrams",
      simple: "A comic strip: who shouts, who answers, and in what order",
      body: [
        "A sequence diagram is a comic in a column. Each object is a stick at the top. Time runs downward. An arrow is a call. A dashed arrow back is the answer. A narrow rectangle on a stick is the time that object is busy. Use it for one story: 'user parks a car' or 'payment is refunded,' not for the whole system.",
        "This picture catches mistakes the class diagram hides. You see who starts the story, which object is not supposed to be called, and where a lock or a check must happen before the next arrow. Keep names the same as the class diagram. If you need a new box here, you missed a class there.",
      ],
      useWhen: [
        "The order of calls is the design: booking a seat, charging a card, taking a lock.",
      ],
      skipWhen: [
        "There is only one object. A sequence of a class talking to itself is usually just a method.",
      ],
      questions: [
        "Where do you show a failure? An arrow to an error, or a note on the arrow that the call can refuse. Say what the caller does next.",
        "Pitfall: arrows into a class's private helper as if outsiders call it. Only draw calls that cross an object's latch.",
      ],
      remember: "One story, top to bottom. Arrows are calls. The busy boxes are who is working.",
    },
    {
      id: "uml-state",
      name: "UML State Diagrams",
      simple: "The moods of one toy, and the events that change its mood",
      body: [
        "Some objects are mostly a mood. An order is placed, then paid, then packed, then shipped. A traffic light is green, yellow, or red. A state diagram draws a circle or a rounded box for each mood, and an arrow for the event that moves it. The arrow can be labeled 'event [guard] / action': pay, but only if the cart is not empty, and then reserve stock.",
        "This is the right picture when illegal moves are the whole problem. You list every mood, every allowed arrow, and you treat a missing arrow as a refusal. In code, the mood is an enum or a state object, and the methods check the mood before they work. Interviewers love this for orders, games, vending machines, and elevators.",
      ],
      useWhen: [
        "The same action is legal in one mood and illegal in another.",
      ],
      skipWhen: [
        "The object has no memory of a phase. A pure calculation does not have states.",
      ],
      questions: [
        "How do you find missing states? Ask what happens on cancel, timeout, and a second click. Those three invent moods people forget: cancelling, expired, and already done.",
        "Pitfall: a boolean zoo. isPaid, isShipped, isCancelled can all be true at once. One mood field cannot.",
      ],
      remember: "Moods are boxes. Events are arrows. A missing arrow means no.",
    },
    {
      id: "uml-activity",
      name: "UML Activity Diagrams",
      simple: "A flowchart of the work, including the split where two jobs run together",
      body: [
        "An activity diagram is a flowchart of work, not of one object's mood. Rounded boxes are actions. Diamonds are decisions. A thick bar splits one path into parallel work, or joins parallel work back together. Use it when the story is a procedure: 'how a return is handled,' with a branch for damaged goods and a branch for a change of mind.",
        "Do not confuse it with a state diagram. State is the life of one thing. Activity is the steps of a process, which may touch many things. In a short interview, a numbered list is often enough, and you can say it is the activity. Draw the diamonds only where a decision changes the path. Draw the fork only when two steps truly may happen at the same time.",
      ],
      useWhen: [
        "You are explaining a business procedure with branches, or real parallel steps.",
      ],
      skipWhen: [
        "You are explaining the legal moods of one order. That is a state diagram, and a flowchart will hide the illegal pairs.",
      ],
      questions: [
        "State or activity for a vending machine? State, if the question is what the machine may do while it waits for coins. Activity, if the question is the steps of one purchase from button to change.",
        "Pitfall: a flowchart so detailed it is code in boxes. Stop at decisions a person would argue about.",
      ],
      remember: "Activity is the flowchart of the work. State is the mood of one thing.",
    },
  ],
  recap: [
    "Class diagrams show nouns, fields, methods, and how objects hold each other.",
    "Sequence diagrams show one story as calls down the page.",
    "State diagrams show moods and the only arrows that are legal.",
    "Activity diagrams show a procedure, its branches, and real parallel steps.",
  ],
  words: [
    { term: "UML", meaning: "A common set of pictures for software. You only need a few of them in an interview." },
    { term: "Class diagram", meaning: "Boxes for classes and lines for relationships." },
    { term: "Sequence diagram", meaning: "A timeline of calls between objects for one story." },
    { term: "State diagram", meaning: "Moods of one object, and the events that change the mood." },
    { term: "Activity diagram", meaning: "A flowchart of a process, including branches and joins." },
  ],
};
