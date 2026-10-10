import type { Topic } from "@/lib/types";

export const topic: Topic = {
  slug: "lld-principles",
  kind: "lld",
  title: "Small rules that keep code kind",
  short: "Say it once, keep it simple, do not build the extra room, and do not reach through a friend.",
  bigIdea:
    "SOLID is the famous list. These are the shorter house rules that sit beside it. They stop you copying a rule into three places, building a hallway you do not need, and grabbing a toy out of a friend's friend's bag. Interviewers listen for them when you justify a cut, not only when you add a class.",
  sections: [
    {
      id: "dry",
      name: "DRY",
      simple: "Write the rule on one card, not on three",
      figure: "rule-cards",
      body: [
        "DRY means do not repeat yourself. If the price of a late fee is copied in the printer, the calculator, and the test as the number 25, the next change will miss one of them. Put the rule in one place and point at it.",
        "DRY is about knowledge, not about similar-looking lines. Two loops that happen to look alike, but mean different things, should stay apart. Merging them couples two stories. The test: if one reason to change would have to edit several copies, those copies are the same knowledge and should meet.",
      ],
      useWhen: ["The same rule or formula would otherwise be edited in more than one place."],
      skipWhen: ["Two bits of code look alike today and mean different things. Leave the coincidence alone."],
      questions: [
        "Is a shared helper always DRY? Only if it names one piece of knowledge. A helper of unrelated leftovers is a junk drawer.",
        "Pitfall: drying too early, before you know the two copies will change together.",
      ],
      remember: "One place for one rule. Similar lines that mean different things may both stay.",
    },
    {
      id: "kiss",
      name: "KISS",
      simple: "The simplest toy that still plays the game",
      body: [
        "KISS means keep it simple. The simplest design that meets the rules is the one you can explain, test, and change. A second interface, a cache, or a plugin slot is a cost. Pay it when it removes a pain you can name.",
        "In a machine coding round, simple means: clear class names, straightforward collections, and rules in the object that owns them. It does not mean one giant method. A short method with a good name is simple. A clever one-liner nobody can read is not.",
      ],
      useWhen: ["You are choosing between a plain version and a clever version that do the same job."],
      skipWhen: ["The simple version hides a bug, such as sharing a mutable list, or loses a requirement. Correct beats cute."],
      questions: [
        "How do you defend a simple design? 'This meets the rules we listed, and I can add the next kind here without a rewrite.'",
        "Pitfall: calling a tangled method simple because it is one method.",
      ],
      remember: "The simplest shape that keeps the rules. Clever is not simple.",
    },
    {
      id: "yagni",
      name: "YAGNI",
      simple: "Do not build the guest room before anyone is coming",
      body: [
        "YAGNI means you are not gonna need it. Do not add a feature, a parameter, or a seam for a future you invented. The unused code still has to be understood, and it is usually wrong when the future arrives because the future is not what you guessed.",
        "The exception is a seam the problem already named. If the interviewer says 'we will add trucks,' the spot types are not YAGNI. If nobody mentioned motorcycles, a motorcycle class is. Ask before you build the extra room.",
      ],
      useWhen: ["You are about to add flexibility that no requirement and no interviewer has asked for."],
      skipWhen: ["The variation is already in the prompt. Building only cars when they said cars and bikes is incomplete, not simple."],
      questions: [
        "YAGNI or OCP? OCP is for a variation you already expect. YAGNI says do not invent the variation.",
        "Pitfall: skipping a requirement you find inconvenient and calling it YAGNI.",
      ],
      remember: "Build the rooms that were asked for. Ask before you build the next one.",
    },
    {
      id: "law-of-demeter",
      name: "Law of Demeter",
      simple: "Ask your friend. Do not rummage in your friend's friend's bag",
      body: [
        "The Law of Demeter says talk only to your close friends: yourself, what you were given, what you created, and what you hold directly. A customer can pay. The shop should not write customer.wallet.cents -= 40. That line knows the wallet's insides, so a change to the wallet breaks the shop.",
        "The fix is a method on the friend: customer.pay(40). The wallet stays private. Long chains of dots are the smell. A chain of pure values, such as address.city.name where nobody has behavior, is less dangerous, but a chain that changes state is a design error.",
      ],
      useWhen: ["A caller reaches through an object into the next object's fields."],
      skipWhen: ["You are inside the owner, using your own parts. The wallet may touch its own cents."],
      questions: [
        "Why does the chain hurt? Each dot is a dependency. The caller must change whenever any middle type changes.",
        "Pitfall: a method that only forwards five layers with no rule of its own, added only to silence the dots. Give the method the real verb.",
      ],
      example: "demeter",
      remember: "One dot of behavior. Ask the friend to act. Do not grab the bag inside the bag.",
    },
    {
      id: "separation-of-concerns",
      name: "Separation of Concerns",
      simple: "Cooking, taking money, and writing the receipt are different jobs",
      body: [
        "Separation of concerns means each part of the program worries about one kind of question. Pricing does not print. The HTTP handler does not decide chess legality. The repository does not compute a discount. When a concern is mixed, every change risks the other concern.",
        "This is SRP at the scale of modules, not only classes. In machine coding, the usual split is: the domain objects and their rules, the in-memory store, and the little driver that shows a story. You can code them in one file on a whiteboard if the sections are obvious. The split is in the responsibilities, not in the number of files.",
      ],
      useWhen: ["One block of code both decides a rule and talks to the outside world."],
      skipWhen: ["The program is tiny and the split would be two functions that are always called together and share everything."],
      questions: [
        "What are the usual concerns in an LLD round? Rules, storage, and the edge that receives input.",
        "Pitfall: separating so far that a single rule is spread across five types and you cannot find it.",
      ],
      remember: "One kind of question per part. Rules stay out of the printer and the socket.",
    },
    {
      id: "favor-composition",
      name: "Favor Composition Over Inheritance",
      simple: "Snap the engine on. Do not say the truck is a kind of engine",
      body: [
        "This is the relationships lesson in one sentence. Hold a helper and call it, instead of extending it to reuse its code. You can swap the helper, test it alone, and you do not inherit methods you cannot honor.",
        "Inheritance stays appropriate for a true is-a that keeps every promise. In interviews, if you reach for extends to share three methods, stop and ask whether a field would do. Most strategy, state, and decorator shapes are composition on purpose.",
      ],
      useWhen: ["You want to reuse or vary behavior without a family tree."],
      skipWhen: ["The child really is the parent in every way callers depend on."],
      questions: [
        "Give a parking-lot example. A lot holds a pricing strategy. It is not a subclass of hourly pricing and of daily pricing at once, which inheritance could not even express cleanly.",
        "Pitfall: composition so deep that a call passes through six empty wrappers. Snap the bricks you need.",
      ],
      example: "composition",
      remember: "Has-a and a call. Extend only for a true is-a.",
    },
    {
      id: "tell-dont-ask",
      name: "Tell Don't Ask",
      simple: "Tell the piggy bank to spend. Do not ask for the coins and do the math yourself",
      body: [
        "Tell, don't ask means you tell an object to do the work, instead of asking for its data and doing the work outside. Outside code that reads the balance, decides, and writes the balance back has stolen the rule. The next caller will forget the decision.",
        "Asking is fine when you need a value to show, such as the balance on a screen. The smell is ask, decide, then set. That decision belongs in a method. This is encapsulation said as a verb.",
      ],
      useWhen: ["Callers are copying the same if around getters and setters."],
      skipWhen: ["The object is a pure value and the caller is a report. Reading is the job."],
      questions: [
        "How does this relate to the Law of Demeter? Both stop outsiders operating on someone else's insides. Demeter is about how far you reach. Tell, don't ask is about who decides.",
        "Pitfall: a tell method that takes ten flags and still lets the caller make every decision. The object should know the rule.",
      ],
      example: "rich-model",
      remember: "Tell the object to act. Do not borrow its data and act for it.",
    },
    {
      id: "encapsulate-what-varies",
      name: "Encapsulate What Varies",
      simple: "Put the part that changes in a little box, and leave the steady part outside",
      body: [
        "Find what will change, and hide it behind a stable face so the steady code does not see the changes. Pricing varies, so it sits behind Pricing. The checkout does not. This sentence is the motive under strategy, state, and most of OCP.",
        "You cannot encapsulate a variation you have not named. Watch the problem statement for words like 'types of,' 'rules for,' and 'later we might.' Those are the boxes. Leave the rest concrete until it varies too.",
      ],
      useWhen: ["You can point at the part that will change separately from the rest."],
      skipWhen: ["Nothing varies. A box around a constant is noise."],
      questions: [
        "What do you encapsulate in a cache? The eviction rule, and maybe the store, if both can change. The get and put story stays.",
        "Pitfall: encapsulating everything, so there is no steady part left to read.",
      ],
      example: "ocp",
      remember: "Name what varies. Put it behind a face. Let the steady story call the face.",
    },
    {
      id: "program-to-an-interface",
      name: "Program to an Interface",
      simple: "Ask for a pencil, not for a brand",
      body: [
        "The type you mention in fields and arguments should be the face, not the concrete class, whenever more than one body is real or a test must stand in. This is the same idea as the injection lesson. It is listed again because it is the habit inside every other principle: strategy, decorator, proxy, and DIP all fail if the field is typed as the one concrete class.",
        "Do not make an interface that has only one implementation and no test double, unless the boundary is a port you are sure will be substituted. A value object is a class. Program to that class. The slogan is not 'every type is an interface.'",
      ],
      useWhen: ["A second implementation, including a fake, is part of the design."],
      skipWhen: ["The class is a value or the only body, and hiding it adds a name with no purpose."],
      questions: [
        "Where may the concrete class appear? At the edge that wires the program, and inside factories.",
        "Pitfall: an interface that exposes the concrete class's helpers, so callers depend on the brand anyway.",
      ],
      example: "dip",
      remember: "Name the face in the field. Name the brand once, where you wire it.",
    },
  ],
  recap: [
    "DRY shares one piece of knowledge, not every similar-looking line.",
    "KISS picks the simplest correct shape. YAGNI refuses rooms nobody asked for.",
    "Demeter: do not reach through a friend. Tell the object to act instead of asking for its data.",
    "Separate concerns, prefer composition, and encapsulate the part that varies behind a face.",
  ],
  words: [
    { term: "DRY", meaning: "Do not repeat a piece of knowledge. One rule lives in one place." },
    { term: "KISS", meaning: "Keep it simple. The smallest shape that still holds the rules." },
    { term: "YAGNI", meaning: "You are not gonna need it. Do not build for a guess." },
    { term: "Law of Demeter", meaning: "Call your friends. Do not walk a chain into their insides." },
    { term: "Tell, don't ask", meaning: "Tell an object to do the work instead of pulling its data out to decide." },
  ],
};
