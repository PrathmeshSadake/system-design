import type { Topic } from "@/lib/types";

export const topic: Topic = {
  slug: "lld-the-round",
  kind: "lld",
  title: "How the round actually goes",
  short: "Tests that would catch a lie, a clock you can see, and a story you can tell while you type.",
  bigIdea:
    "The last skill is the round itself. You prove the rules with small checks, you leave time to talk, and you present the design as a story instead of a tour of every field. A correct class nobody understood is a weak interview. A clear story with one checked rule is a strong one.",
  sections: [
    {
      id: "unit-and-integration-tests",
      name: "Unit and Integration Testing",
      simple: "Check one toy, then check the toys playing together",
      figure: "exam-desk",
      body: [
        "A unit test calls one object and checks one rule. A wallet refuses an overdraft. It does not boot the program. An integration test checks a story across objects: park, then unpark, then the spot is free and the fee is right. Both matter. Units pin the rules. The integration pins the wiring.",
        "On a whiteboard you may not have a framework. A main method that throws when a rule fails is a test. Name what it covers. In a take-home, use the language's test tool. Do not print and stare. Assert.",
      ],
      useWhen: ["A rule or a story is done enough to be checked."],
      skipWhen: ["You are still naming classes. A test of a design you will delete in five minutes is early. A test of a rule you have agreed is not."],
      questions: [
        "What is a good unit versus a good integration here? Unit: pricing given two timestamps. Integration: the lot parks a car and the free-spot set shrinks.",
        "Pitfall: only an integration test, so a failure could be any of six classes, and you cannot see which rule broke.",
      ],
      remember: "Unit tests pin one rule. A story test pins the wiring. Assert, do not stare at a print.",
    },
    {
      id: "tdd",
      name: "TDD",
      simple: "Write the failing check, then make the toy pass it",
      body: [
        "Test-driven development writes the failing check first, then the code that makes it pass, then cleans the shape. The check records the rule before the implementation can cheat. It is a loop: red, green, clean. You do not write the whole program's tests on day one. You write the next behavior's test.",
        "In an interview, full TDD is optional unless they ask. A lighter version always helps: say the example, code the method, run the example. If you do practice TDD, start with the refusal case. It is smaller than the happy path and it forces the error type into existence.",
      ],
      useWhen: ["The rule is crisp and you want the code pulled by an example."],
      skipWhen: ["You do not yet know the API. A test against a guess will be rewritten immediately. Sketch the method name first, in a few lines, then test."],
      questions: [
        "What is the order? Failing test, smallest code to pass, then refactor while the test stays green.",
        "Pitfall: a test that repeats the implementation line by line, so it cannot fail unless the code is deleted.",
      ],
      remember: "A failing example, then code, then a cleanup that keeps the example green.",
    },
    {
      id: "mocking",
      name: "Mocking and Dependency Substitution",
      simple: "A cardboard clock that says whatever time you need",
      body: [
        "A test double stands in for a helper. A fake clock returns the time you set. A fake gateway records the charge and does not call the network. Substitution works because the domain asked for a face, not a brand. If the class constructed the real clock, you cannot substitute it.",
        "Use the simplest double. A hand-written fake that stores calls in a list is enough. A mocking framework is fine when you already know it. Do not mock the class you are testing. Do not mock a value object. Mock at the port: clock, store, random, gateway.",
      ],
      useWhen: ["A rule depends on time, randomness, or a system you do not want to touch."],
      skipWhen: ["The collaborator is pure and fast. Call the real pricing object. A mock of pure math hides bugs."],
      questions: [
        "Stub, fake, or mock? A stub returns a canned answer. A fake has a tiny working version, such as an in-memory store. A mock asserts it was called a certain way. Prefer fakes and stubs. Mocks that demand an exact call sequence break when you refactor.",
        "Pitfall: a test that only checks the mock was called, and never checks the business result.",
      ],
      example: "dependency-injection",
      remember: "Substitute ports, not the object under test. A cardboard clock is enough.",
    },
    {
      id: "boundary-and-negative-testing",
      name: "Boundary and Negative Testing",
      simple: "Try the last legal cookie, the first illegal one, and a nonsense form",
      body: [
        "Boundary tests sit on the line. A cache of capacity 1. A withdrawal of exactly the balance. A lock that expires at the current timestamp. Off-by-one bugs live here, so test the last allowed value and the first rejected one.",
        "Negative tests are the refusals. Empty name, duplicate key, illegal move, double spend. Each one should leave state unchanged. Assert the error type and assert the balance, the seat, or the board did not move. A refusal that half-updates is worse than a crash you can see.",
      ],
      useWhen: ["The happy path already passes."],
      skipWhen: ["You are generating dozens of random cases with no asserted rule. A few precise boundaries teach more."],
      questions: [
        "What do you assert on a refusal? The error, and the unchanged state.",
        "Pitfall: a negative test that only checks 'it threw,' without checking which error, so a crash in the setup looks like a pass.",
      ],
      example: "validation",
      remember: "Last legal, first illegal, and a nonsense input. After a refusal, the state is the old state.",
    },
    {
      id: "time-management",
      name: "Time Management in a Machine Coding Round",
      simple: "A clock on the desk: talk, shape, happy path, then the sharp edges",
      body: [
        "A common round is about 45 to 90 minutes. Spend the opening on scope and the class list, not on code. Then get one story working end to end: park and leave, or charge and refuse. Then add the edges you ranked highest. A pretty factory with no working story loses to a plain class that parks a car.",
        "When time is short, say the next thing instead of half-writing it. 'Next I would add expiry on the lock, with a clock passed in.' Interviewers can score a clear plan. They cannot score a silent scramble. If you are stuck, narrate the invariant you are trying to protect. The class often appears from that sentence.",
      ],
      points: [
        "Opening: questions, scope, nouns, moods, and the first story.",
        "Middle: that story working, with one refusal.",
        "End: the sharpest edge, a quick recap, and what you would do with another hour.",
      ],
      useWhen: ["You are in the round, or practicing with a timer."],
      skipWhen: ["Never. Even a take-home has a budget. A finished small scope beats an unfinished framework."],
      questions: [
        "What do you cut first? Persistence, UI, and the second variation, unless the prompt made them the point. You say the cut.",
        "Pitfall: polishing names for twenty minutes with no method that runs.",
      ],
      remember: "One working story before the extra rooms. Narrate the rest if the clock runs out.",
    },
    {
      id: "presenting-your-design",
      name: "Presenting Your Design",
      simple: "Tell the story of one visitor, and point at the box that says yes or no",
      body: [
        "Present in story order. 'A driver arrives. The lot asks the free spots for a car spot. The spot marks itself taken. A ticket is born. On exit, pricing reads the times and the spot becomes free.' Then point at the refusal: 'If no spot fits, the lot refuses and nothing is half-taken.' This is a sequence in sentences. You do not read every field.",
        "Invite the follow-up. 'The part I would extend is pricing, because you mentioned weekends.' Mention one tradeoff: a coarse lock, a scan instead of an index, an in-memory store. Tradeoffs are how you sound like someone who could ship it. Finish with the invariant in one sentence. That sentence is what they remember.",
      ],
      useWhen: ["You start the round, you finish a story, and you end."],
      skipWhen: ["You are inside a tricky bug. Fix it, with a sentence of what you expected. Do not give a speech over a broken demo."],
      questions: [
        "How long is the recap? Under a minute: nouns, the main story, the refusal, the extension point.",
        "Pitfall: apologizing for every shortcut. State the scope as a choice. Apology sounds like you think the choice was wrong.",
      ],
      remember: "One visitor's story, the refusal, the extension point, and the invariant.",
    },
  ],
  recap: [
    "Unit tests pin rules. Story tests pin wiring. Assert the result.",
    "TDD is red, green, clean, when the API is known. Doubles stand in for ports.",
    "Test the last legal value, the first illegal one, and that a refusal does not mutate.",
    "Get one story working before extra rooms. Present that story, the refusal, and the invariant.",
  ],
  words: [
    { term: "Unit test", meaning: "A check of one object's rule, with collaborators substituted." },
    { term: "Integration test", meaning: "A check of a story across the real objects you wired." },
    { term: "Test double", meaning: "A stand-in for a port, such as a clock or a gateway." },
    { term: "Boundary", meaning: "The last allowed value and the first rejected one." },
    { term: "Invariant", meaning: "A rule that stays true after every public method." },
  ],
};
