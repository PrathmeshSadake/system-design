import type { Topic } from "@/lib/types";

export const topic: Topic = {
  slug: "lld-behavioral",
  kind: "lld",
  title: "Choosing what happens next",
  short: "Swappable rules, moods, recipes, and buttons you can press backward.",
  bigIdea:
    "Behavioral patterns are about what an object does when the world moves. The rule can be swapped. The mood can change. The steps can stay fixed while one step varies. A button press can be remembered and taken back. These are the patterns you reach for when the story is a verb, not a wrap.",
  sections: [
    {
      id: "strategy",
      name: "Strategy",
      simple: "The trip stays. The way you price it can be swapped",
      figure: "game-pieces",
      body: [
        "A strategy is a family of algorithms behind one face, so the object that uses them does not contain the choice. A trip asks pricing.price. Daytime returns the fare. Night returns more. You can pass a different pricing in without editing Trip.",
        "This is the workhorse of machine coding rounds: parking fees, eviction, split rules, notification channels, move rules in a game. The caller holds the interface. Each rule is a class. The place that knows which rule applies is the edge, or a small lookup, not a switch buried in the middle of park or charge.",
      ],
      useWhen: [
        "One step varies, and you can name at least two real versions.",
      ],
      skipWhen: [
        "The choice is a single formula that will not grow. A method is clearer than a strategy of one.",
      ],
      questions: [
        "Strategy or a switch? A switch is fine for a closed set of two that you own completely. A strategy is for a set that should grow by adding a class.",
        "Pitfall: a strategy interface with ten methods. That is a second object, not a single swappable step.",
      ],
      example: "strategy",
      remember: "One face, many rules. The object that uses the rule does not contain the versions.",
    },
    {
      id: "state",
      name: "State",
      simple: "The same button, and a different mood decides what it does",
      body: [
        "A state object represents the mood of another object. Pressing a lamp while it is off turns it on. Pressing it while it is broken does nothing useful. Each mood is a class with the same method. The lamp delegates, and the mood changes the lamp's current mood.",
        "Use state when behavior depends on a phase, and a pile of booleans would allow impossible combinations. Orders, vending machines, TCP connections, and elevators are the textbook stories. An enum plus a switch is a lighter version of the same idea. Prefer the enum when the transitions are few and the actions are short. Prefer state classes when each mood carries real behavior.",
      ],
      useWhen: [
        "The same method is legal or illegal, or means something else, depending on the phase.",
      ],
      skipWhen: [
        "There is no phase. Do not invent moods for a pure calculation.",
      ],
      questions: [
        "Who changes the mood, the context or the state object? Either works. If the next mood depends on the action's result, the state object often sets the next mood on the context. Say which you chose.",
        "Pitfall: a mood that reaches into another mood's fields. Transitions should be a replacement of the whole mood, not a tweak.",
      ],
      example: "state",
      remember: "One mood object at a time. Missing transitions are refusals, not forgotten booleans.",
    },
    {
      id: "template-method",
      name: "Template Method",
      simple: "The sandwich recipe is fixed. The filling is the only line that changes",
      body: [
        "A template method is a parent method that runs the steps in order and calls a hook for the step that varies. Bread, filling, bread. Cheese and jam override filling. The order of steps is closed. The hook is open.",
        "It is inheritance used for a recipe. Use it when every child must follow the same steps and forgetting a step would be a bug. Prefer a strategy when the whole step should be replaceable at runtime, or when you do not want a class tree. The parent method should be final in spirit: children do not override make, they override filling.",
      ],
      useWhen: [
        "The sequence is sacred and one or two steps vary by kind.",
      ],
      skipWhen: [
        "The sequence itself varies. Then the template is a lie, and a strategy or a list of steps is more honest.",
      ],
      questions: [
        "What do you lock? The method that orders the steps. What do you open? The hooks.",
        "Pitfall: a hook that children override by copying the whole parent method. The template has escaped.",
      ],
      example: "template-method",
      remember: "Lock the recipe. Open the one step that is allowed to change.",
    },
    {
      id: "strategy-vs-state",
      name: "Strategy vs State",
      simple: "A rule you picked, versus a mood the object is in",
      body: [
        "Strategy and state look the same in code: an object holds another object and calls a method on it. The difference is who changes it, and why. A strategy is chosen, often from outside, and it does not care what the previous strategy was. A night price does not become a day price by itself. A state is the object's mood. The mood changes because something happened, and the next mood depends on the current one.",
        "If you can replace the helper at any time and the object does not notice a 'transition,' it is a strategy. If there is a diagram of arrows between versions, it is a state. Using the wrong name makes the interviewer think you missed the transitions, or that you think a price rule is a lifecycle.",
      ],
      useWhen: [
        "The code shape is 'held object with one method' and you need the right name.",
      ],
      skipWhen: [
        "You are not choosing between these two. Do not compare them as filler.",
      ],
      questions: [
        "Can a state be implemented as an enum while a strategy stays a class? Yes. The name follows the idea, not the number of files.",
        "Pitfall: a strategy that secretly changes itself into another strategy based on history. That is a state hiding in the strategy.",
      ],
      remember: "Strategy is a chosen rule. State is a mood with legal transitions.",
    },
    {
      id: "strategy-vs-template-method",
      name: "Strategy vs Template Method",
      simple: "Pass in the filling, or inherit the sandwich and override the filling",
      body: [
        "Both keep a fixed story and vary a step. Template method uses inheritance: the child overrides a hook, and the recipe is a parent method. Strategy uses composition: the story object holds a helper and you can swap the helper without a subclass, even at runtime.",
        "Choose template method when every variant is a true kind, the recipe must not be skippable, and you are fine with a class tree. Choose strategy when the rule is a plug, when tests want to pass a fake rule, or when the choice depends on data rather than on the class of the outer object. In machine coding, strategy is usually the one to reach for first, because the interviewer will ask you to add a rule without editing the old ones.",
      ],
      useWhen: [
        "A step varies and you are deciding between extends and a field.",
      ],
      skipWhen: [
        "The whole algorithm changes shape. Neither pattern saves a story that is not actually shared.",
      ],
      questions: [
        "Which is easier to test? Strategy. You pass the fake in. Template method wants a subclass or a test hook.",
        "Pitfall: a template method whose hooks are so numerous that the parent recipe is empty. The sequence was not real.",
      ],
      remember: "Template method inherits a locked recipe. Strategy plugs a rule into a field.",
    },
    {
      id: "command",
      name: "Command",
      simple: "A button press becomes a slip of paper you can keep",
      body: [
        "A command turns a request into an object. The slip has everything the work needs: which light, and the verb toggle. The remote does not know about electricity. It only knows how to run a slip. Because the slip is an object, you can queue it, log it, or hand it to someone else.",
        "Use commands when the moment you decide to do something is not the moment you do it, or when you need a list of what happened. Jobs, buttons, and macros are the usual stories. If you call the method immediately and never store it, a command object is extra paper. Call the method.",
      ],
      useWhen: [
        "You queue, log, schedule, or undo the request.",
      ],
      skipWhen: [
        "The call happens now and is not remembered. A method is the command.",
      ],
      questions: [
        "What lives on the command object? The receiver, the arguments, and run. Undo lives there too if you need it.",
        "Pitfall: a command that reaches out and reads global state at run time, so replaying it does something else. Capture what you need when the slip is written.",
      ],
      example: "command",
      remember: "A request as an object. Then you can keep it, queue it, or run it later.",
    },
    {
      id: "command-undo",
      name: "Command with Undo/Redo",
      simple: "Each slip knows how to take itself back, and you keep a pile of slips",
      body: [
        "Undo needs memory of what happened, in order. Each command grows an undo method that reverses its own run. The remote keeps a stack. Undo pops the last slip and calls undo. Redo keeps a second stack: undo pushes the slip there, and a new action clears it, because the future you undid is no longer valid.",
        "The hard part is commands that are not naturally reversible. 'Clear the canvas' must remember the old marks, or it cannot undo. Capture the previous value in the command when it runs. Do not try to invert a lossy action with hope. If the interviewer asks for undo, mention the stack, the captured previous state, and what a new action does to the redo stack.",
      ],
      useWhen: [
        "The user, or the test, must reverse recent actions in order.",
      ],
      skipWhen: [
        "There is nothing to reverse, or the reverse is a new business action with its own rules, such as a refund. A refund is often its own command, not the undo of charge, because money has extra rules.",
      ],
      questions: [
        "Where is the previous value stored? On the command, at the time run happens, not looked up later.",
        "Pitfall: one global undo that switches on command type. The reverse belongs with the command that did the work.",
      ],
      remember: "A stack of slips. Each slip remembers how to undo itself. A new action clears redo.",
    },
  ],
  recap: [
    "Strategy swaps a rule. State swaps a mood along legal arrows.",
    "Template method locks a recipe and opens a hook. Strategy plugs the varying step in as a field.",
    "Command makes a request into an object so you can queue it.",
    "Undo is a stack of commands that each remember the reverse, including the data they overwrote.",
  ],
  words: [
    { term: "Strategy", meaning: "A swappable algorithm behind one face." },
    { term: "State", meaning: "A mood object. Behavior and the next mood depend on it." },
    { term: "Template method", meaning: "A parent recipe with a hook children override." },
    { term: "Command", meaning: "A request packaged as an object with a run method." },
    { term: "Undo stack", meaning: "The recent commands, each able to reverse itself." },
  ],
};
