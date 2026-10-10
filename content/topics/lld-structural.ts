import type { Topic } from "@/lib/types";

export const topic: Topic = {
  slug: "lld-structural",
  kind: "lld",
  title: "Wrapping and joining objects",
  short: "Adapters, gift wrap, a front counter, stand-ins, trees, remotes, and shared crayons.",
  bigIdea:
    "Structural patterns are about shape. One object does not fit a hole, so you wrap it. A job is a pile of steps, so you hide them behind one counter. A picture is made of pictures. A remote should not be glued to one brand of television. The pattern is the wrap or the join, and the thing inside stays itself.",
  sections: [
    {
      id: "adapter",
      name: "Adapter",
      simple: "A little sleeve so a round peg can sit in a square hole",
      body: [
        "You have a round peg and a hole that only accepts squares. You do not sand the peg down if someone else owns it, and you do not rebuild the hole. You make a sleeve: the outside is square, the inside holds the peg. Callers talk to the sleeve.",
        "An adapter converts one interface to another. The client expects fits(square). The library gives you a radius. The adapter exposes width by doubling the radius. Use it at the border with code you do not control: a third party SDK, a legacy class, a hardware API. Do not use it to hide a mess you could rename. If you own both sides, change one side so they match.",
      ],
      useWhen: [
        "Two faces must meet, and you cannot change the one you do not own.",
      ],
      skipWhen: [
        "You own both classes. Change the called class, or the caller, instead of adding a sleeve forever.",
      ],
      questions: [
        "Adapter or facade? An adapter makes one existing class look like another face. A facade hides several classes behind one new simple face.",
        "Pitfall: an adapter that also adds business rules. Then it is no longer a sleeve. It is a second product.",
      ],
      example: "adapter",
      remember: "A sleeve changes the face. It does not change the peg.",
    },
    {
      id: "decorator",
      name: "Decorator",
      simple: "Wrap the gift. It is still a gift, with paper and a ribbon added",
      figure: "gift-layers",
      body: [
        "A decorator wraps an object and offers the same face, adding a little behavior before or after it calls the inside. Paper wraps a toy. A ribbon wraps the paper. open still works, and each layer adds a word. You can stack layers in different orders without a subclass for every combination.",
        "Use it when you want to add behavior in combinations: compression plus encryption, logging plus timing, a discount plus a gift wrap on a price. Inheritance would explode into a class per combination. The decorator implements the same interface as the thing it wraps, so callers cannot tell, and do not need to.",
      ],
      useWhen: [
        "Optional behaviors stack, and you do not want a class for every stack.",
      ],
      skipWhen: [
        "There is one fixed extra and it will not stack. A method on the class is simpler.",
      ],
      questions: [
        "Decorator or subclass? Subclass when the new behavior is a true kind. Decorator when the extra is optional and combinable.",
        "Pitfall: a decorator that changes the meaning of the method so callers of the plain object would be surprised. That breaks substitution.",
      ],
      example: "decorator",
      remember: "Same face, extra behavior, stackable. Combinations stay out of the class tree.",
    },
    {
      id: "facade",
      name: "Facade",
      simple: "One lunch counter in front of the kitchen, the cashier, and the bagger",
      body: [
        "A facade is a simple door in front of a complicated set of objects. The customer says 'soup.' The counter charges, cooks, and bags. The customer does not call those three in order, and does not have to know they exist. The kitchen is still there for people who work in the kitchen.",
        "Use a facade to give a subsystem a single happy path. The detailed classes stay public to their own package if experts need them. The facade does not do the work itself. It orders the work. If the facade grows rules of its own, it is becoming a god class. Push the rules back to the specialists.",
      ],
      useWhen: [
        "Callers keep repeating the same sequence of calls across several objects.",
      ],
      skipWhen: [
        "There is only one object. A facade of one is a rename.",
      ],
      questions: [
        "Does a facade hide the subsystem completely? It offers a simple path. It does not have to be the only path.",
        "Pitfall: a facade that callers must use, while the methods on it are one-to-one copies of the inside. Then you added a hop and no simplicity.",
      ],
      example: "facade",
      remember: "One simple order in front of several specialists. The facade sequences. It does not hoard.",
    },
    {
      id: "proxy",
      name: "Proxy",
      simple: "A guard stands where the door is, and checks your badge first",
      body: [
        "A proxy looks like the real object and stands in front of it. The guard has the same open method as the vault. It checks the badge, and only then calls the vault. Other proxies load the real object on first use (lazy), or talk to an object in another process (remote), or remember a recent answer (cache).",
        "The proxy and the real object share a face, like a decorator. The intent differs. A decorator adds behavior the client wants stacked. A proxy controls access to the real object, often for a reason the client should not manage: permission, cost, or location. Say which one you mean.",
      ],
      useWhen: [
        "Access needs a check, a delay, or a stand-in before the real object runs.",
      ],
      skipWhen: [
        "The caller is supposed to know about the check, because the check is the business rule they asked for. Then it is an ordinary method, not a hidden guard.",
      ],
      questions: [
        "Name three kinds of proxy. Protection (the guard), virtual (create on first use), remote (local face, far object).",
        "Pitfall: a proxy that the caller must cast to use extra methods. Then it does not share the face, and it is not a proxy.",
      ],
      example: "proxy",
      remember: "Same face, in front, controlling access. The client talks to the guard.",
    },
    {
      id: "composite",
      name: "Composite",
      simple: "A drawing can be a circle, or a group of drawings",
      body: [
        "A composite lets you treat one item and a group of items the same way. A circle draws itself. A group draws each part, and a part may be a group. The caller calls draw and does not ask which. Trees of files and folders, menus and submenus, and shapes in a picture are the usual stories.",
        "The interface has the operations that make sense for both. Be careful with operations that only make sense for a group, such as add. Putting add on every shape forces a circle to refuse it, which is an LSP smell. Keep add on the group, or accept the small lie knowingly and say so. Children in the tree should not point back in a cycle unless you can explain the cycle.",
      ],
      useWhen: [
        "The story is a tree, and callers want one verb for a leaf and for a branch.",
      ],
      skipWhen: [
        "The structure is flat. A list of circles does not need a composite. A loop is enough.",
      ],
      questions: [
        "Where does add live? Prefer the group type, so leaves are not forced to pretend they can hold children.",
        "Pitfall: a cycle. A group that contains itself never finishes draw. Reject a parent being added to its own child.",
      ],
      example: "composite",
      remember: "One verb for a leaf and for a group. The group walks its children.",
    },
    {
      id: "bridge",
      name: "Bridge",
      simple: "The remote and the television can change without being glued together",
      body: [
        "A bridge splits one idea into two hierarchies that vary on their own. Remotes vary: simple, or one with a mute button. Devices vary: television, radio. If you inherit, you get SimpleTv, SimpleRadio, MuteTv, MuteRadio, and the grid grows. A bridge makes the remote hold a device. New remotes and new devices do not multiply.",
        "The two sides talk through a small face. The remote calls toggle. It does not know about antennas. Use a bridge when you can already name two reasons to vary. If you can name only one, you do not have a bridge. You have a strategy, which is the device side alone.",
      ],
      useWhen: [
        "Two dimensions will grow, and a class per pair would explode.",
      ],
      skipWhen: [
        "Only one dimension varies. Strategy or a simple subclass is enough.",
      ],
      questions: [
        "Bridge or strategy? Strategy swaps one algorithm behind a face. Bridge is two hierarchies connected by a face, so both sides can grow.",
        "Pitfall: calling any field a bridge. A field is composition. A bridge is composition used to split two variations.",
      ],
      example: "bridge",
      remember: "Two ways to vary, joined by a small face, so the pairs do not become classes.",
    },
    {
      id: "flyweight",
      name: "Flyweight",
      simple: "A thousand trees, and only two drawings of a tree",
      body: [
        "A flyweight shares the heavy part that is the same for many objects, and keeps the small differing part outside. A thousand trees on a map can share one oak sprite. Each tree keeps only its x and y. The sprite is immutable, or the trees will corrupt each other.",
        "Use it when you can measure the waste: many objects, a large repeated chunk, and the chunk does not depend on the instance. Do not use it because it sounds advanced. Sharing mutable state to save memory creates bugs that cost more than the memory. In an interview, split intrinsic state (shared, the sprite) from extrinsic state (passed in, the position).",
      ],
      useWhen: [
        "Lots of copies would repeat a big identical chunk.",
      ],
      skipWhen: [
        "The objects are few, or the shared part would have to change per instance.",
      ],
      questions: [
        "What must be true of the shared part? It is safe to share: no per-object mutable fields hiding inside it.",
        "Pitfall: sharing a sprite that also stores the last tree's position. The next draw paints every oak on top of the last one.",
      ],
      example: "flyweight",
      remember: "Share the heavy identical part. Keep each object's own spot outside it.",
    },
    {
      id: "adapter-vs-facade",
      name: "Adapter vs Facade",
      simple: "A sleeve for one peg, or a counter in front of a whole kitchen",
      body: [
        "Both sit in front of existing code and show a nicer face. An adapter's face is dictated by the client that already exists. You are making an old class fit a hole. There is usually one adaptee. A facade's face is new, designed to be simple, and it usually sits in front of several classes, ordering them.",
        "If the sentence is 'make this look like that,' it is an adapter. If the sentence is 'here is the one call that does the usual job,' it is a facade. A class can be a bit of both, but in an interview pick the sentence that matches and use that name.",
      ],
      useWhen: [
        "You are choosing a name for a wrapper and the two candidates are these.",
      ],
      skipWhen: [
        "The wrapper adds behavior the client wants stacked. Look at decorator instead.",
      ],
      questions: [
        "Can a facade adapt? It can translate, but its goal is a simpler workflow, not compatibility with an existing interface.",
        "Pitfall: using both names for one class in the same answer. Pick one intent.",
      ],
      remember: "Adapter: fit an existing hole. Facade: offer one simple path over many steps.",
    },
    {
      id: "decorator-vs-proxy",
      name: "Decorator vs Proxy",
      simple: "Gift wrap the client asked for, or a guard the client did not hire",
      body: [
        "Decorator and proxy both wrap an object and share its face. The difference is who wants the wrapper, and why. A decorator adds a behavior the client chose: paper, a ribbon, a discount. You stack them because the client asked for that stack. A proxy stands in for a reason of access or cost: a guard, a cache, a lazy load. The client often thinks it has the real object.",
        "A practical test: if removing the wrapper changes the business result the user asked for, it is a decorator. If removing the wrapper changes safety, latency, or location, but not the requested result, it is a proxy. Say the test if the interviewer pushes.",
      ],
      useWhen: [
        "You have a wrapper and you need the right name.",
      ],
      skipWhen: [
        "The extra code is just the object's own method. Do not wrap a class in itself.",
      ],
      questions: [
        "Can one class be either, depending on the story? Yes. Logging every call for the user is a decorator. Logging every call for operations, invisibly, is closer to a proxy. The story picks the name.",
        "Pitfall: memorizing 'decorator adds, proxy controls' and then being unable to point at which lines are the addition.",
      ],
      remember: "Decorator changes the result the client asked for. Proxy controls how they reach the real object.",
    },
    {
      id: "choosing-a-structural-pattern",
      name: "Choosing the Right Structural Pattern",
      simple: "Say the problem in one line, then pick the wrap that matches",
      body: [
        "Start from the sentence, not from the list. 'This face does not fit' is adapter. 'Callers repeat a sequence' is facade. 'I want to stack optional extras' is decorator. 'I need to control access' is proxy. 'A group should work like one item' is composite. 'Two sides will both grow' is bridge. 'Too many copies of a heavy chunk' is flyweight.",
        "If two sentences are true, you may combine them: a facade that returns an interface, and a decorator around one of the specialists. Do not combine them in the first five minutes. Get the nouns working. Add a pattern when a change you can name would hurt. On a whiteboard, one well-chosen pattern beats a diagram of seven.",
      ],
      useWhen: [
        "You feel the urge to say a structural pattern's name.",
      ],
      skipWhen: [
        "A private method would do. Patterns are for seams between objects, not for tidiness inside one.",
      ],
      questions: [
        "Which pattern for a cache in front of a repository? Proxy, if the cache stands in and the caller still thinks it called the repository. Decorator, if the caller explicitly wraps a reader with a caching reader.",
        "Pitfall: a structural pattern around data that has no behavior. Wrapping a string in six classes does not make a design.",
      ],
      remember: "One sentence of pain, one pattern. Leave the others in the box.",
    },
  ],
  recap: [
    "Adapter fits an existing face you cannot change. Facade simplifies a sequence across several objects.",
    "Decorator stacks chosen behavior. Proxy controls access and shares the face.",
    "Composite treats a group like one item. Bridge lets two hierarchies grow without a class per pair.",
    "Flyweight shares an immutable heavy part and keeps each object's own data outside.",
  ],
  words: [
    { term: "Adapter", meaning: "A sleeve that makes one class match a face the client already has." },
    { term: "Decorator", meaning: "A wrapper with the same face that adds stackable behavior." },
    { term: "Facade", meaning: "A simple door that runs several objects in order." },
    { term: "Proxy", meaning: "A stand-in with the same face that controls access to the real object." },
    { term: "Composite", meaning: "A tree where a group and a leaf share one verb." },
    { term: "Bridge", meaning: "Two varying sides joined by a face, so pairs do not become classes." },
    { term: "Flyweight", meaning: "A shared immutable chunk, plus the small data that differs per object." },
  ],
};
