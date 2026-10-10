import type { Topic } from "@/lib/types";

export const topic: Topic = {
  slug: "lld-cache",
  kind: "lld",
  title: "Cache",
  short: "A small tin of answers, with a rule for which crumb falls out when the tin is full.",
  bigIdea:
    "A cache is a tin on the counter. It holds a few answers so you do not walk to the pantry every time. The interesting design is not the map. It is the rule for who leaves when the tin is full, how long a crumb stays fresh, and the fact that the tin and the pantry can be swapped.",
  sections: [
    {
      id: "cache",
      name: "Cache",
      simple: "A little tin of snacks in front of the big pantry",
      figure: "crumb-tin",
      example: "cache",
      body: [
        "You ask for a key. If the tin has a fresh value, you get it. If not, the caller goes to the real store and then may put the answer in the tin. The cache in these notes is the tin itself: get and set, a capacity, and a clock you pass in so tests do not sleep.",
        "Keep capacity, eviction, expiry, and storage as separate ideas. A HashMap alone is a store. It does not know who is oldest. A linked list alone does not find a key quickly. The usual shape is a map plus an order structure the policy owns.",
        "The JavaScript file takes a policy and a store. The Java file in the same lesson is the LRU plus TTL shape, with a clock you can move. Both refuse to hide time inside System.currentTimeMillis or Date.now, because a test must be able to expire a key without waiting.",
      ],
      useWhen: ["The prompt is an in-process cache: get, put, capacity, and a removal rule."],
      skipWhen: ["They want Redis, replication, or cache invalidation across servers. That is high level design. You can still name the key and the TTL."],
      questions: [
        "What is a cache hit, a miss, and an eviction? Hit: the key is present and fresh. Miss: absent or expired. Eviction: dropped because the tin is full, not because it is stale.",
        "Pitfall: deleting an expired key from the map and leaving it in the order list, so a later eviction removes a ghost.",
      ],
      remember: "Map for lookup, policy for who leaves, clock you control for freshness.",
    },
    {
      id: "cache-lru-lfu-ttl",
      name: "Cache with LRU/LFU/TTL",
      simple: "Throw out the snack nobody has touched, the snack touched least, or the snack that went stale",
      body: [
        "LRU means least recently used. A get or a put moves that key to the front. When the tin is full, the back of the line leaves. A doubly linked list plus a map does this in constant time. An array that you sort on every get does not.",
        "LFU means least frequently used. Each key has a count. You keep buckets of keys that share a count, and you remember the smallest count that still has keys. A get moves the key to the next bucket. Ties inside a bucket follow insertion or recency. Say which tie you picked.",
        "TTL means time to live. Each entry stores expiresAt. get checks the clock before it returns. Expiry is not eviction: the key can leave even when the tin has room. On expiry, forget the key in the policy too.",
      ],
      useWhen: ["They name LRU, LFU, or a timeout. Implement the one they care about first."],
      skipWhen: ["They said a fixed size and did not ask for a policy. A simple map with a max size and 'reject new keys' is enough until they ask who gets dropped."],
      questions: [
        "LRU or LFU for a hot key that was popular yesterday and quiet today? LRU forgets it once newer keys push it out. LFU may keep it too long. Say the workload.",
        "Pitfall: calling the clock inside the class. Pass now, or a clock function, so the TTL test is one assignment.",
      ],
      remember: "LRU is recency. LFU is counts. TTL is a deadline. They can sit on the same entry.",
    },
    {
      id: "cache-pluggable-eviction",
      name: "Cache with Pluggable Eviction",
      simple: "The tin stays. You swap the rule for which crumb falls out",
      body: [
        "The cache should not contain a switch on the string 'lru'. It should hold an EvictionPolicy with onPut, onGet, evict, and forget. LRU and LFU are two classes. The cache asks the policy who to drop when size hits capacity.",
        "That is the strategy pattern from the pattern lessons, applied to a real interview problem. Adding FIFO later is a new class, not a new branch in get.",
        "forget exists because expiry removes a key that the policy still tracks. If you skip it, evict can return a key the map already dropped.",
      ],
      useWhen: ["They say the eviction rule might change, or they ask for both LRU and LFU."],
      skipWhen: ["One rule is the whole problem and time is short. Write that rule clearly, and name the interface you would extract."],
      questions: [
        "What methods does the policy need? Notice a new key, notice a hit, choose a victim, and drop a key that expired.",
        "Pitfall: the policy and the map both think they own size, and they disagree after a delete.",
      ],
      remember: "The cache owns entries. The policy owns the order. Expiry tells the policy to forget.",
    },
    {
      id: "cache-backends",
      name: "Cache with Multiple Storage Backends",
      simple: "The same tin lid can sit on a map, or on a notebook that also writes down what you stored",
      body: [
        "A Store interface is get, set, and delete. A MapStore is the interview default. A logging store wraps another store and records the calls. A later store could be a file or a remote cache. The cache does not care.",
        "This is a decorator around storage, not a second eviction policy. Do not mix 'where bytes live' with 'who gets evicted'.",
        "In the JavaScript demo a LogStore wraps the map, and the LFU run checks that the log saw the put. The Java LRU/LFU file keeps the structures in memory, which is the usual whiteboard store.",
      ],
      useWhen: ["They ask to swap memory for another store, or to observe writes."],
      skipWhen: ["The whole exercise is eviction. A HashMap is the store. Say you would hide it behind an interface if the backing changed."],
      questions: [
        "Who checks TTL, the store or the cache? The cache, unless the store itself expires keys. Pick one owner.",
        "Pitfall: a backend that is slower than the thing you were caching, with no capacity story.",
      ],
      remember: "Policy decides who leaves. Store decides where the entry sits. The cache applies TTL.",
    },
    {
      id: "lru-lfu-cache",
      name: "LRU/LFU Cache",
      simple: "The same two rules, written as their own small classes",
      example: "lru-cache",
      body: [
        "Interviewers often ask for LRU alone, then say 'now LFU'. A second file in the examples builds both as neighboring classes: a doubly linked list for LRU, and frequency buckets for LFU.",
        "Capacity two is the demo that catches a swapped victim. Touch one key, insert until full, and assert which key remains. If you only test capacity one, both policies look the same.",
        "Say the costs out loud. LRU get and put are O(1). LFU get and put are O(1) with buckets. A TreeMap of timestamps is fine if you admit it is O(log n) and you ran out of time for the list.",
      ],
      useWhen: ["They want the data structure, not only the idea."],
      skipWhen: ["You already shipped a correct policy inside the pluggable cache and the clock is the priority. Do not rewrite it twice in the same round."],
      questions: [
        "How do you evict when two keys share the lowest frequency? Pick the least recently bumped inside that bucket, and say so.",
        "Pitfall: moving a node in a list without unlinking it first, so the list points at itself.",
      ],
      remember: "Demo capacity two. One hot key must survive. One cold key must leave.",
    },
  ],
  recap: [
    "A cache is a map plus a policy plus a clock.",
    "LRU is order of use. LFU is counts. TTL is a deadline checked on read.",
    "Expiry must remove the key from the policy, not only from the map.",
  ],
  words: [
    { term: "Eviction", meaning: "Dropping a key because the cache is at capacity." },
    { term: "TTL", meaning: "Time to live. The key is stale when the clock passes expiresAt." },
    { term: "Policy", meaning: "The swappable object that chooses the next victim." },
  ],
};
