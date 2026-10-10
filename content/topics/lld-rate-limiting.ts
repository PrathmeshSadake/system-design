import type { Topic } from "@/lib/types";

export const topic: Topic = {
  slug: "lld-rate-limiting",
  kind: "lld",
  title: "Rate limiter",
  short: "A turnstile that only lets a person through when they still have a token.",
  bigIdea:
    "A rate limiter answers one question: may this key do the thing right now? The key might be a user or an address. Four classic machines answer it differently. An API client is the person walking up to the turnstile, with a plan for what to do when the turnstile says no.",
  sections: [
    {
      id: "rate-limiter",
      name: "Rate Limiter",
      simple: "A turnstile that clicks only if you are allowed through",
      figure: "turn-stile",
      example: "rate-limiter",
      body: [
        "Callers should see one method: allow(key, now). They should not know whether the machine is a bucket or a window. That interface is the design. The four classes behind it are details you can swap.",
        "Pass now in. A limiter that calls the system clock cannot be tested without sleeping, and sleeping in an interview is how you lose the round.",
        "Decide the scope of the key before you code. One bucket per user is not one bucket per IP, and a global bucket is a third choice. Say which one you built.",
      ],
      useWhen: ["You must reject or delay calls that arrive too fast, in one process."],
      skipWhen: ["They want a distributed limiter across many servers. Mention a shared store, then build the single-process rule unless they insist."],
      questions: [
        "What do you return when the call is not allowed? A boolean is enough in the model. In an API, that becomes a 429 and a retry-after hint.",
        "Pitfall: one bucket for every user, stored in a map that never forgets idle keys. Mention a cleanup, even if you do not write it.",
      ],
      remember: "allow(key, now) is the whole public question. The algorithm sits behind it.",
    },
    {
      id: "token-bucket",
      name: "Rate Limiter Token Bucket",
      simple: "A jar of tokens that refills while you wait, and each trip takes one",
      body: [
        "Each key has a number of tokens and the time you last looked. On allow, add (now - then) times the refill rate, cap at capacity, and take one token if any remain.",
        "A burst is allowed up to the capacity, then the caller must wait for refill. That is why token bucket feels kinder than a hard window: a quiet minute fills the jar.",
        "The Java demo in this file checks the capacity path without a clock, because a full jar that is asked twice should deny the extra. The JavaScript class also refills from elapsed time. Talk about both: the cap, and the refill.",
      ],
      useWhen: ["Bursts are fine as long as the average rate stays bounded."],
      skipWhen: ["You need a hard 'no more than N per minute' with no burst. A window counter is easier to explain."],
      questions: [
        "What are the two numbers? Capacity (burst) and refill rate (average).",
        "Pitfall: refilling before you store the new timestamp, so the next call refills the same gap again.",
      ],
      remember: "Tokens refill with time, up to a cap. A call spends tokens.",
    },
    {
      id: "leaky-bucket",
      name: "Leaky Bucket",
      simple: "A bucket with a small hole. Water drips out at a steady pace. A flood spills",
      body: [
        "Each call adds one unit of water. Water leaks out at a constant rate based on elapsed time. If adding one would pass the capacity, the call is denied. The output, if you were queueing, would be smooth.",
        "People mix this up with token bucket. Token bucket stores permission that you spend. Leaky bucket stores arriving work that drains. A full token bucket says yes. A full leaky bucket says no.",
        "In an interview, drawing the bucket and saying which number goes up on a request saves you from swapping the two names.",
      ],
      useWhen: ["You want a steady drain and you want to reject the flood, not save it up as burst credit."],
      skipWhen: ["The product wants users to save up calls while idle. That is token bucket."],
      questions: [
        "Say the difference in one line. Token bucket fills with permission. Leaky bucket fills with requests and leaks them out.",
        "Pitfall: allowing the call and then adding water past the rim.",
      ],
      remember: "Requests add water. Time removes water. Over the rim means no.",
    },
    {
      id: "fixed-window",
      name: "Fixed Window",
      simple: "A scoreboard that resets when the bell rings, and counts until then",
      body: [
        "Time is cut into windows of windowMs. A key stores the window id (now divided by the size) and a count. If the call is in a new window, the count resets. If the count is already at the limit, deny.",
        "The edge is the famous bug: a limit of 10 per minute allows 10 at 12:00:59 and 10 at 12:01:00. That is 20 in two seconds. Mention it before the interviewer does.",
        "Fixed windows are easy and cheap. They are a good first answer when the burst at the boundary is acceptable.",
      ],
      useWhen: ["You want a simple counter and the boundary burst is acceptable."],
      skipWhen: ["They ask 'what is wrong with this?' and then wait. Move to a sliding window."],
      questions: [
        "What is the boundary burst? Two adjacent windows can each be full, back to back.",
        "Pitfall: using the wall-clock minute as a string you compute wrong around midnight.",
      ],
      remember: "Count inside a bucket of time. Reset when the bucket id changes. Watch the edges.",
    },
    {
      id: "sliding-window",
      name: "Sliding Window",
      simple: "You only count the knocks that happened in the last minute, whenever 'now' is",
      body: [
        "A sliding window log keeps the timestamps of recent allows and drops the ones older than now minus the window. The call is allowed if the remaining list is under the limit. It is exact and it costs memory per call.",
        "A sliding window counter approximates: it weights the previous window by how much of it still overlaps 'now', plus the current count. Less memory, a little less exact. If you implement the log, say the memory cost.",
        "The example uses the log. For a whiteboard, the log is easier to defend. For a high-scale service, name the counter approximation and stop unless they ask you to code it.",
      ],
      useWhen: ["The boundary burst of a fixed window is not acceptable, and the rate is modest."],
      skipWhen: ["The key has millions of events per window. A timestamp list will not fit. Say so and sketch the weighted counter."],
      questions: [
        "What do you store per key? The timestamps still inside the window, not the whole history.",
        "Pitfall: forgetting to drop old timestamps before you check the size, so the window only grows.",
      ],
      remember: "Look back a fixed duration from now. Forget anything older.",
    },
    {
      id: "rate-limited-api-client",
      name: "Rate-Limited API Client",
      simple: "The friend who knocks, waits, and knocks again, but not a thousand times",
      example: "api-client",
      body: [
        "The client wraps a call. Before each attempt it asks the limiter. If the limiter says no, it stops. If the call throws, it waits a backoff and tries again, up to maxAttempts.",
        "The JavaScript client is async because waiting is part of the story. The Java client is synchronous and advances its own clock by the backoff, which is easier to assert. Both demos show the same count: the third attempt succeeds, and the request function ran three times.",
        "Separate three failures: denied by the limiter, failed by the server, and failed because you gave up. Callers handle them differently.",
      ],
      useWhen: ["The prompt is a client, not only the limiter: retries, backoff, and a cap."],
      skipWhen: ["They only asked for allow(). A client is a second object. Do not hide it inside the bucket."],
      questions: [
        "Where does the limiter sit? In front of the attempt, so a denied call does not burn a retry for a server error, or does, if you choose that. Say which.",
        "Pitfall: retrying a 400 forever. Only retry the failures you marked as temporary.",
      ],
      remember: "The client asks the turnstile, then the server, then sleeps by a rule you can test.",
    },
    {
      id: "api-client-retries",
      name: "API Client Retries/Backoff/Rate Limiting",
      simple: "Wait longer each time, and stop if the turnstile or the clock says so",
      body: [
        "Backoff in the example is exponential: the delay after attempt n is 10 * 2^(n-1). Attempt 1 waits 10, attempt 2 waits 20. You can add jitter in words: a random extra so many clients do not retry on the same millisecond.",
        "maxAttempts includes the first try. Three attempts means one try and two retries. Say that, because people count differently.",
        "Rate limiting and retry solve different problems. The limiter protects the server from you. The retry protects you from a blip. The demo shows the retry half: a flaky server succeeds on the third call. A closed limiter would throw 'limited' without calling the server, because allow is checked first.",
      ],
      useWhen: ["The call can fail for a moment, and you must not hammer the server."],
      skipWhen: ["The operation is not safe to repeat. A charge without an idempotency key should not be retried blindly. Point at the payment lesson."],
      questions: [
        "Why jitter? So a herd that failed together does not wake together.",
        "Pitfall: sleeping for real in the test. Inject the delay function and record the numbers.",
      ],
      remember: "Exponential waits, a max, a limiter, and a delay function the test owns.",
    },
  ],
  recap: [
    "allow(key, now) hides the algorithm.",
    "Token bucket stores permission. Leaky bucket stores water. Windows count calls in time.",
    "A client retries with backoff only when the limiter and the error both say another try is allowed.",
  ],
  words: [
    { term: "Token bucket", meaning: "A jar of permits that refills over time, up to a burst cap." },
    { term: "Leaky bucket", meaning: "A queue or counter of arrivals that drains at a fixed rate." },
    { term: "Backoff", meaning: "Waiting longer after each failed try, often doubling." },
  ],
};
