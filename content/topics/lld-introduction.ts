import type { Topic } from "@/lib/types";

export const topic: Topic = {
  slug: "lld-introduction",
  kind: "lld",
  title: "What low level design is",
  short: "The rooms inside the building: which objects exist, and who is allowed to touch what.",
  bigIdea:
    "High level design is the town: where the school is, which road the buses take, and what happens if a bridge closes. Low level design is one building with the roof lifted off. You can see the rooms, the doors between them, and which person is in charge of the keys. In an interview, low level design means you pick those rooms and write them down as classes before you type very much.",
  sections: [
    {
      id: "introduction-to-lld",
      name: "Introduction to LLD",
      simple: "A doll house with the front open, so you can see every room",
      figure: "doll-house",
      body: [
        "Imagine a doll house. From the street you only see a roof and a door. That is enough to say 'a house.' Open the front and you see a kitchen, a bedroom, and a tiny staircase. You can point at the stove and say who is allowed to cook. That opened house is low level design.",
        "Low level design (LLD) is the plan of the objects inside one program: the classes, the data they keep, the methods they offer, and the rules that stay true. It sits under the system diagram and above the lines of code. A good LLD is specific enough that two people would write almost the same program from it, and small enough that you can explain it on a whiteboard in a few minutes.",
        "In a machine coding round you are asked to build something like a parking lot or a cache. The interviewer is not grading a product. They are watching whether you can turn a fuzzy story into objects with clear jobs, protect the rules inside those objects, and leave seams so a new rule can be added without rewriting the whole toy.",
      ],
      useWhen: [
        "The problem is one program, one service, or one whiteboard exercise.",
        "The hard part is rules, states, and who owns the data, not how many servers you need.",
      ],
      skipWhen: [
        "The question is about traffic, sharding, or what happens when a whole data center dies. That is high level design. You still name the modules, but you do not design every class.",
      ],
      questions: [
        "What do you put in an LLD? Classes, fields, methods, relationships, the main flows, and the rules that must never break.",
        "Pitfall: jumping to code, or to a design pattern, before you can say the nouns and the rules in plain words.",
      ],
      remember: "LLD is the opened doll house: the rooms, the doors, and who holds the keys.",
    },
    {
      id: "lld-vs-hld",
      name: "LLD vs HLD",
      simple: "The town map, and the opened doll house, answer different questions",
      body: [
        "A town map answers: where do the children live, which road do they take to school, and what if the bridge is closed? A doll house answers: where is the bed, who may open the toy box, and what happens when two children want the same doll? Both are design. They are not the same zoom.",
        "High level design (HLD) chooses boxes that are whole programs or stores: an API, a database, a cache, a queue. It talks about capacity, failure, and data flow between machines. Low level design chooses boxes that are classes inside one of those programs. It talks about responsibilities, interfaces, state changes, and how the code stays easy to change.",
        "Interviewers mix the words on purpose. If they say 'design Instagram,' start with HLD. If they say 'design a parking lot' or 'code a rate limiter,' start with LLD. If a system-design round drops into 'how would you model the feed in code,' you have zoomed in. Say the zoom out loud so you and the interviewer are looking at the same floor of the house.",
      ],
      points: [
        "HLD: services, storage, queues, caches, APIs between them, numbers, and failure.",
        "LLD: classes, interfaces, relationships, state machines, rules, and how you would test them.",
        "The same noun can appear in both. 'Cache' in HLD is Redis. 'Cache' in LLD is a class with get, put, and an eviction rule.",
      ],
      useWhen: [
        "You need to tell an interviewer which floor you are on before you draw.",
      ],
      skipWhen: [
        "You already agreed the zoom. Do not redraw the town map in the middle of a class diagram.",
      ],
      questions: [
        "Name one decision that belongs only to HLD, and one that belongs only to LLD. Example: how many cache replicas is HLD. Whether eviction is LRU or LFU is LLD.",
        "Pitfall: drawing boxes labeled 'manager' with no methods. A box with no job is not a design yet.",
      ],
      remember: "HLD is the town. LLD is one building with the roof off.",
    },
  ],
  recap: [
    "LLD names the objects inside one program and the rules those objects protect.",
    "HLD names the programs and stores in a whole system, and how they fail and scale.",
    "Machine coding rounds are LLD: clarify, name classes, keep rules inside them, then code.",
  ],
  words: [
    { term: "LLD", meaning: "Low level design. The classes, data, methods, and rules inside one program." },
    { term: "HLD", meaning: "High level design. The services, stores, and roads between them." },
    { term: "Responsibility", meaning: "The one job a class is trusted to do, and the rules it keeps true." },
    { term: "Machine coding", meaning: "An interview where you design and code a small working model, usually in memory." },
  ],
};
