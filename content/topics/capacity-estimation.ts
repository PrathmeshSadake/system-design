import type { Topic } from "@/lib/types";

export const topic: Topic = {
  slug: "capacity-estimation",
  kind: "concept",
  title: "Capacity Estimation",
  short: "Guessing how big things will get before you build them, using easy round numbers.",
  bigIdea:
    "Before a birthday party, a grown-up guesses how many friends will come, how much cake to buy, and how many chairs to set out. They do not need the exact number. They need a number that is close enough so nobody is left standing or hungry. Building a big computer system starts the same way: we make quick, friendly guesses about how busy it will be, so we buy enough computers, but not way too many.",
  sections: [
    {
      id: "napkin-math",
      name: "Back-of-the-envelope calculations",
      simple: "Quick math you could do on the back of a napkin",
      body: [
        "This is math that is small enough to scribble on the back of an envelope or a napkin. The goal is not to be perfect. The goal is to be roughly right, fast.",
        "The trick is to use round numbers that are easy to multiply in your head. For example, a day has 86,400 seconds, but we pretend it has 100,000. That makes dividing super easy, and our answer is only a little bit off.",
        "Being off by a little is fine. Being off by ten times is the real danger, because that is the difference between needing 3 computers and needing 30.",
      ],
      points: [
        "A day has about 100,000 seconds.",
        "A month has about 30 days, and a year has about 365 days.",
        "A thousand thousands is a million. A thousand millions is a billion.",
        "Write down every guess, so others can check your thinking.",
      ],
      remember: "Close enough and quick beats perfect and slow when you are planning.",
    },
    {
      id: "requests-per-second",
      name: "Requests per second (RPS)",
      simple: "How many knocks on the door every second",
      body: [
        "Every time someone opens an app and asks it for something, that is one request. It is like a knock on the door of our computer. We want to know how many knocks arrive every second, because each computer can only answer so many knocks at once.",
        "Let us say 1 million kids use our drawing app, and each one asks for something 10 times a day. That is 10 million knocks in one day. Divide by 100,000 seconds and we get about 100 knocks every second.",
        "But kids do not knock evenly all day. Right after school, everyone rushes in at once. So we plan for the busy time, called the peak, by multiplying by about 2 to 5. If we pick 3, we should be ready for about 300 knocks every second.",
      ],
      diagrams: ["rps-math"],
      remember: "Daily requests divided by 100,000 gives the average per second. Then multiply for the busy times.",
    },
    {
      id: "storage-growth",
      name: "Storage growth",
      simple: "How fast the toy box fills up",
      body: [
        "Storage is the giant toy box where we keep everything people make. Some things are small, like a name. Some things are big, like a photo.",
        "Imagine 1 million drawings are saved every day, and each one is about 1 megabyte, which is roughly the size of one small photo. That is 1 million megabytes a day, which is about 1 terabyte. After a month, that is about 30 terabytes. After a year, about 365 terabytes.",
        "We also keep spare copies in case a toy box breaks. Most systems keep 3 copies, so one year of drawings really needs about 1,100 terabytes. That is about 1 petabyte, which is a thousand terabytes.",
      ],
      diagrams: ["storage-growth"],
      remember: "Things saved per day, times size, times days kept, times copies.",
    },
    {
      id: "network-bandwidth",
      name: "Network bandwidth",
      simple: "How wide the water hose needs to be",
      body: [
        "Bandwidth is how much stuff can flow through the network each second. Picture a garden hose. A thin hose can only push a little water at a time. A fat fire hose can push a lot.",
        "If 300 kids per second each download a picture that is 100 kilobytes, we need to push 30,000 kilobytes every second. That is about 30 megabytes every second.",
        "We count the stuff coming in (uploads) and going out (downloads) separately, because they are often very different. In most apps, many more people look at things than make things, so the outgoing hose needs to be much bigger.",
      ],
      remember: "Requests per second, times the size of each answer, is how wide your hose must be.",
    },
    {
      id: "memory-vs-disk",
      name: "Memory vs. disk limits",
      simple: "Your desk versus the shelves in the basement",
      body: [
        "Memory is like the top of your desk. Anything on it is right there, ready to grab in a blink. But the desk is small, it costs a lot of money per spot, and when the power goes out, the desk is wiped clean.",
        "Disk is like big shelves down in the basement. It holds a huge amount, it is cheap, and things stay there even when the power is off. But walking down to the basement takes much longer. Grabbing a random thing from even a fast disk is often about a thousand times slower than grabbing it from memory.",
        "A handy rule is that a small part of our stuff gets used most of the time. Often about 20 percent of the things are asked for about 80 percent of the time. So we keep that busy 20 percent on the desk, and everything else in the basement. If our app touches 10 gigabytes of different things each day, about 2 gigabytes of memory might be enough to answer most knocks quickly.",
      ],
      diagrams: ["memory-disk"],
      remember: "Keep the popular things in fast, small memory. Keep everything in big, slower disk.",
    },
  ],
  recap: [
    "Use round numbers. A day is about 100,000 seconds.",
    "Average requests per second is daily requests divided by 100,000. Plan for a peak that is 2 to 5 times bigger.",
    "Storage per year is items per day, times size, times 365, times the number of copies.",
    "Bandwidth is requests per second times the size of each answer.",
    "Memory is fast and small. Disk is big and slower. Keep the busy 20 percent in memory.",
  ],
  words: [
    { term: "Request", meaning: "One question sent to a computer, like one knock on a door." },
    { term: "RPS", meaning: "Requests per second. How many knocks arrive each second." },
    { term: "Peak", meaning: "The busiest time, like the after school rush." },
    { term: "Terabyte (TB)", meaning: "About a million small photos worth of space." },
    { term: "Petabyte (PB)", meaning: "A thousand terabytes." },
    { term: "Bandwidth", meaning: "How much data can flow each second, like the width of a hose." },
    { term: "Memory (RAM)", meaning: "Fast, small, forgetful space. The desk." },
    { term: "Disk", meaning: "Big, slower space that remembers. The basement shelves." },
  ],
};
