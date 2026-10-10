import type { Topic } from "@/lib/types";

export const topic: Topic = {
  slug: "lld-behavioral-links",
  kind: "lld",
  title: "How objects talk",
  short: "Bells, teachers, passing notes, walks, envelopes, visitors, and a quiet stand-in.",
  bigIdea:
    "The other half of behavioral design is communication. Who hears the bell. Who is allowed to talk to whom. How a note moves along a desk until someone can answer it. How you walk a shelf without knowing it is an array. These patterns keep objects from all grabbing each other's collars.",
  sections: [
    {
      id: "observer",
      name: "Observer",
      simple: "One bell, and a sheet of everyone who asked to hear it",
      figure: "note-chain",
      body: [
        "An observer signs up for news. When the event happens, the subject tells everyone on the sheet. The bell does not know what the listeners do with the news. The listeners do not sit in a circle calling each other. One-to-many, from the subject outward.",
        "Use it when several parts must react to one fact and you do not want the fact's owner to name them all. A price change updates a screen, a log, and a cache. Remember to unsubscribe, or a dead listener stays on the sheet. In interviews, also say what happens if a listener throws: the others should still hear, unless you have a reason to stop.",
      ],
      useWhen: [
        "One event, many independent reactions, and the source should not depend on those reactions.",
      ],
      skipWhen: [
        "There is one listener you already hold. Call it. A subscription list of one is machinery.",
      ],
      questions: [
        "Push or pull? Push sends the data with the event. Pull tells the listener that something changed and the listener reads what it needs. Push is simpler until the data gets large.",
        "Pitfall: listeners that change the list while you are walking it. Copy the list first, or you will skip someone.",
      ],
      example: "observer",
      remember: "One subject, many listeners, and the subject does not know their jobs.",
    },
    {
      id: "mediator",
      name: "Mediator",
      simple: "Children tell the teacher, and the teacher tells the others",
      body: [
        "A mediator sits in the middle so colleagues do not point at each other. Ada tells the teacher. The teacher tells Bo. Ada does not hold a reference to Bo. Add a third child and you edit the teacher, not every child.",
        "Use it when a group of objects would otherwise form a knot of calls: dialog boxes, players in a game lobby, air traffic. The cost is a mediator that knows everyone and grows into a god. Keep it to routing and the few rules that are truly about the group. Rules about one child stay on the child.",
      ],
      useWhen: [
        "Many peers would otherwise each know all the others.",
      ],
      skipWhen: [
        "Two objects talk. A direct call is clearer than a teacher with one student.",
      ],
      questions: [
        "Mediator or facade? A facade simplifies a subsystem for outsiders. A mediator coordinates colleagues who must not reference each other.",
        "Pitfall: business rules piled into the mediator until the colleagues are empty. Then you moved the knot instead of cutting it.",
      ],
      example: "mediator",
      remember: "Peers talk to the middle. The middle routes. Peers do not collect each other.",
    },
    {
      id: "observer-vs-mediator",
      name: "Observer vs Mediator",
      simple: "A bell that does not know the chores, versus a teacher who directs the room",
      body: [
        "Both loosen a direct link. An observer is one way: the subject announces, and listeners react on their own. The subject does not coordinate them. A mediator is the conversation: it receives from one colleague and decides who else should hear, sometimes changing the message, sometimes applying a group rule.",
        "If listeners do not know about each other and the source does not care what they do, publish an event. If the point of the design is that they must not call each other and someone must order the conversation, use a mediator. A bus, in the machine coding lessons, is an observer that grew topics. A game lobby that pairs players is a mediator.",
      ],
      useWhen: [
        "You are about to say 'they should not call each other' and you need the right pattern.",
      ],
      skipWhen: [
        "The link is already one call between two objects. Leave it.",
      ],
      questions: [
        "Can you use both? Yes. Colleagues talk only to a mediator, and the mediator notifies observers outside the room. Say why each exists.",
        "Pitfall: an 'event bus' that is really a mediator full of if statements on event names. Then the decoupling is fake.",
      ],
      remember: "Observer announces. Mediator directs a conversation among peers.",
    },
    {
      id: "chain-of-responsibility",
      name: "Chain of Responsibility",
      simple: "Pass the note along the desk until someone can answer it",
      body: [
        "A chain is a line of handlers. Each one either handles the request or passes it to the next. Small amounts stop at the first desk. Bigger amounts go on. If nobody takes it, you get a clear 'nobody,' not a crash you did not plan.",
        "Use it for rules that are naturally ordered: approval limits, log filters, middleware, input checks that can stop early. Do not use it when every handler must run. That is a list of calls, or observers. The chain's point is that handling stops, or that exactly one handler owns the request.",
      ],
      useWhen: [
        "The first handler who can take the request should take it, and the order is a decision.",
      ],
      skipWhen: [
        "Every step must run. A chain that never stops is a disguised pipeline. A pipeline is fine, but call it that.",
      ],
      questions: [
        "Who builds the order? The composer, not the handlers themselves, or you cannot see the line.",
        "Pitfall: a handler that sometimes handles and also always forwards, so two desks charge the customer.",
      ],
      example: "chain",
      remember: "Each desk takes it or passes it. Someone owns the stop.",
    },
    {
      id: "iterator",
      name: "Iterator",
      simple: "Walk the shelf from the left without knowing the shelf is a row",
      body: [
        "An iterator walks a collection one item at a time and remembers the place. The caller asks hasNext and next. The shelf could be an array, a tree, or a filtered view. The walk looks the same. That is the point: the caller depends on the walk, not on the storage.",
        "In Java and JavaScript the language already gives you iterators, for loops, and for-of. You write your own when the walk is not the obvious order: a tree in breadth-first order, a board's empty squares, a page of results. Keep the iterator honest if the collection changes mid-walk. Fail, or document a snapshot.",
      ],
      useWhen: [
        "The way you walk is a design decision, separate from how you store.",
      ],
      skipWhen: [
        "It is an array and you mean every element in order. Use the language loop.",
      ],
      questions: [
        "What does a custom iterator add in an interview? A walk with a rule: only free spots, or level order on a composite.",
        "Pitfall: an iterator that returns the live list and lets the caller edit storage the owner meant to hide.",
      ],
      example: "iterator",
      remember: "A walk with a place in it. Callers learn the walk, not the storage.",
    },
    {
      id: "memento",
      name: "Memento",
      simple: "An envelope with the drawing inside. The editor does not peek",
      body: [
        "A memento is a saved snapshot. The canvas writes its marks into an envelope and can restore them later. The caretaker, the undo stack or the editor history, holds envelopes and does not read them. The originator, the canvas, is the only one who understands the inside.",
        "Use it when you need to restore an object without making its fields public. Undo can be done with commands that store the previous values themselves. Memento fits when the snapshot is the whole state and only the object knows how to pack it. Watch the size: snapshotting a huge object on every keystroke will hurt. Snapshot the small part that changes.",
      ],
      useWhen: [
        "You must restore state, and you do not want outsiders reading the fields.",
      ],
      skipWhen: [
        "A command can remember the one field it changed. A full snapshot is waste.",
      ],
      questions: [
        "Who may open the envelope? The object that created it. The history list only stores it.",
        "Pitfall: a memento that shares the live list instead of copying it. Restore then changes the past.",
      ],
      example: "memento",
      remember: "The object packs its own snapshot. The history holds the envelope shut.",
    },
    {
      id: "visitor",
      name: "Visitor",
      simple: "The shapes stay. A new question walks around and asks each one",
      body: [
        "A visitor adds a new operation across a set of classes without editing those classes every time. Each shape has accept. The visitor has a method per shape. Area is one visitor. A later question, 'bounding box,' is another visitor. The shapes gain no new methods.",
        "The trade is famous: new operations are easy, new shapes are hard, because every visitor must grow a method. Use visitor when the set of types is stable and the set of questions grows: a syntax tree, a document of fixed node kinds. Do not use it when you expect new types often. Then a method on the type, ordinary polymorphism, is the better open end.",
      ],
      useWhen: [
        "Fixed types, growing operations, and you do not want to edit every type for each operation.",
      ],
      skipWhen: [
        "The types grow and the operations are few. Put the method on the type.",
      ],
      questions: [
        "What is double dispatch here? The shape's accept calls the visitor method for that shape, so the pair of types picks the code.",
        "Pitfall: a visitor that mutates the structure it is walking, so the walk skips or repeats nodes.",
      ],
      example: "visitor",
      remember: "Stable types, new questions as visitors. New types are the expensive direction.",
    },
    {
      id: "null-object",
      name: "Null Object",
      simple: "A quiet logger that has the methods and does nothing",
      body: [
        "A null object implements the interface and does nothing, or returns a neutral value. Callers call write without checking whether a logger exists. The quiet log is a real object. It is not a null reference hiding in a corner.",
        "Use it when the missing case is common and the right behavior is 'do nothing' or 'return empty.' Do not use it when missing is a bug. A missing payment gateway should fail loudly. A missing optional logger can be quiet. The name of the class should say that it is the do-nothing version, so nobody thinks the work happened.",
      ],
      useWhen: [
        "Optional behavior, and skipping it is correct, not an error.",
      ],
      skipWhen: [
        "Absence is exceptional. Throw or return a clear error. Silence would hide a broken setup.",
      ],
      questions: [
        "Null object or Optional? Optional forces the caller to decide. A null object decides that the decision is 'do the neutral thing.' Use Optional when callers must choose.",
        "Pitfall: a null object that returns success for a command that did not run. The caller thinks the charge happened.",
      ],
      example: "null-object",
      remember: "A real object that does the neutral thing. Do not use it to hide a failure.",
    },
    {
      id: "specification",
      name: "Specification",
      simple: "A rule you can hold, and combine with another rule using and",
      body: [
        "A specification is a rule object with a method like ok(candidate). 'At least ten' is a rule. 'Is a member' is a rule. And combines them. The candidate does not grow a method for every policy, and the policies can be built from data: a coupon that applies if the cart is large and the user is new.",
        "Use it when business rules combine and change faster than the objects they judge. It is a cousin of strategy, aimed at yes or no questions. Keep the leaves small. If a specification starts charging money or saving rows, it is no longer a rule. It is a service wearing a rule's name.",
      ],
      useWhen: [
        "Yes or no rules combine with and, or, and not, and the combinations vary.",
      ],
      skipWhen: [
        "One fixed check. A method is enough.",
      ],
      questions: [
        "Where do specifications show up in machine coding? Coupon eligibility, seating rules, search filters, move legality if you want the rules listed separately from the piece.",
        "Pitfall: specifications that need six collaborators to answer ok. The rule is no longer pure, and you cannot test it on a plain candidate.",
      ],
      example: "specification",
      remember: "A yes or no object. Combine rules. Do not hide side effects inside them.",
    },
    {
      id: "event-driven-basics",
      name: "Event-Driven Design Basics",
      simple: "Something happened. Write it down. Whoever cares can listen",
      body: [
        "Event-driven design means the important facts are announced as events, and the code that cares subscribes. 'Seat booked' is a fact in the past, named in the past tense. The booking object does not call the emailer, the ledger, and the screen. It publishes the fact. Listeners react. This is the observer idea, promoted from one class to the way the program is cut.",
        "In low level design you can do this inside one process with an event bus. Keep events small and immutable. Handlers should tolerate seeing the same event twice if you will later cross a queue, which is the idempotency rule. Do not use events to hide a simple call that must finish before you answer the user. If the user is waiting for the result, that part is a direct call. The rest can be events.",
      ],
      useWhen: [
        "Several independent reactions follow a fact, and the core should not name them.",
      ],
      skipWhen: [
        "The next step's result is required to answer the request. Call it. Wait for it.",
      ],
      questions: [
        "What is a good event name? A fact in the past: SeatReserved, PaymentCaptured. Not DoSendEmail, which is a command disguised as an event.",
        "Pitfall: a chain of events where nobody can explain the order, and a failure in the middle is invisible. Log the fact, and decide which reactions are allowed to fail alone.",
      ],
      remember: "Publish facts in the past tense. Listeners react. Direct calls stay where the user is waiting.",
    },
  ],
  recap: [
    "Observer: one announcement, many independent listeners.",
    "Mediator: peers talk only to the middle, which directs the conversation.",
    "A chain passes a request until one handler takes it.",
    "An iterator hides storage behind a walk. A memento is a sealed snapshot.",
    "Visitor adds operations when types are stable. A null object does the neutral thing on purpose.",
    "Specifications are combinable yes or no rules. Events are facts listeners react to.",
  ],
  words: [
    { term: "Observer", meaning: "A listener signed up for announcements from a subject." },
    { term: "Mediator", meaning: "The only object peers talk to, so they do not point at each other." },
    { term: "Chain of responsibility", meaning: "Handlers in a line. The first one that can take the request does." },
    { term: "Iterator", meaning: "A cursor that walks items without exposing storage." },
    { term: "Memento", meaning: "A snapshot only the owning object can interpret." },
    { term: "Visitor", meaning: "An operation that walks a fixed set of types from outside." },
    { term: "Null object", meaning: "A real implementation that does nothing, or returns a neutral result." },
    { term: "Specification", meaning: "A combinable rule object that answers yes or no." },
    { term: "Event", meaning: "A named fact in the past that listeners may react to." },
  ],
};
