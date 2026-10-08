import { Arrow, Box, Diagram, Group, Label, Line, Traveler, ink, path, tones } from "./primitives";
import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* Cache-aside: hit and miss                                            */
/* ------------------------------------------------------------------ */

function CacheAside() {
  const ask = path([230, 90], [560, 90]);
  const answer = path([560, 140], [230, 140]);
  const save = path([230, 190], [560, 190]);
  const readDb = path([230, 300], [560, 300]);
  const dbAnswer = path([560, 350], [230, 350]);
  const mid = 395;
  return (
    <Diagram
      id="caching-aside"
      width={880}
      height={430}
      title="Cache-aside: check the backpack first"
      description="Step 1, the app asks the cache if it has the answer. Step 2, on a hit the cache hands it back and the trip is over; on a miss the cache says it is not here. Step 3, on a miss the app reads the database. Step 4, the database answers. Step 5, the app saves a copy in the cache for next time."
      caption="The cache never talks to the database itself. The app does all the fetching and saving."
    >
      <Box x={40} y={50} w={190} h={320} label="App" note={["follows the steps", "in order"]} tone="slate" />
      <Box x={560} y={50} w={280} h={160} label="Cache" note={["in memory, like Redis", "small and very fast"]} tone="mint" />
      <Box x={560} y={270} w={280} h={100} label="Database" note={["on disk", "has everything, slower"]} tone="sun" />

      <Arrow d={ask} tone="slate" />
      <Label x={mid} y={70} text="1. Is it in the cache?" size={14} color={ink} />
      <Arrow d={answer} tone="mint" />
      <Label x={mid} y={120} text="2. Hit: here it is. Miss: not here." size={14} color={tones.mint.text} />
      <Arrow d={save} tone="sky" dashed />
      <Label x={mid} y={170} text="5. Save a copy for next time" size={14} color={tones.sky.text} />
      <Arrow d={readDb} tone="sun" />
      <Label x={mid} y={280} text="3. On a miss, read the database" size={14} color={tones.sun.text} />
      <Arrow d={dbAnswer} tone="sun" />
      <Label x={mid} y={330} text="4. Here is the answer" size={14} color={tones.sun.text} />

      <Traveler d={ask} dur={1.6} tone="mint" r={5} />
      <Traveler d={answer} dur={1.6} delay={0.8} tone="mint" r={5} />

      <Label x={440} y={402} text="On a hit, the trip ends at step 2. Only misses go on to the database." size={14} />
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* LRU eviction                                                         */
/* ------------------------------------------------------------------ */

function Lru() {
  const slots = [
    { x: 225, label: "Apple", note: "1 min ago" },
    { x: 340, label: "Cookie", note: "3 min ago" },
    { x: 455, label: "Cheese", note: "8 min ago" },
    { x: 570, label: "Grapes", note: "40 min ago" },
  ];
  const inbound = path([170, 144], [210, 144]);
  const out = path([675, 144], [730, 144]);
  return (
    <Diagram
      id="caching-lru"
      width={900}
      height={326}
      title="Least recently used goes first"
      description="The backpack cache has room for four snacks, ordered by when each was last used: apple one minute ago, cookie three minutes ago, cheese eight minutes ago and grapes forty minutes ago. When pretzels arrive, the grapes, used least recently, are thrown out to make room."
      caption="Every time a snack is used, it moves back to the front. Whatever drifts to the far end is the next to go."
    >
      <Box x={30} y={104} w={140} h={80} label="Pretzels" note={["new snack,", "needs a spot"]} tone="sky" />
      <Arrow d={inbound} tone="sky" />
      <Traveler d={inbound} dur={1.6} tone="sky" r={5} />

      <Group x={210} y={60} w={480} h={160} label="Backpack cache: room for 4" tone="mint" />
      {slots.map((s, i) => (
        <Box
          key={s.label}
          x={s.x}
          y={104}
          w={105}
          h={80}
          label={s.label}
          note={s.note}
          tone={i === 3 ? "rose" : "mint"}
          dashed={i === 3}
        />
      ))}

      <Arrow d={out} tone="rose" />
      <Traveler d={out} dur={1.6} delay={0.8} tone="rose" r={5} />
      <Box x={730} y={104} w={140} h={80} label="Grapes" note={["thrown out", "to make room"]} tone="white" dashed />

      <Label x={270} y={244} text="used most recently" size={14} />
      <Arrow d={path([358, 244], [535, 244])} tone="slate" width={1.5} />
      <Label x={622} y={244} text="used least recently" size={14} />

      <Label
        x={450}
        y={290}
        text="Each copy also has a timer (TTL). When it runs out, the copy is tossed even if there is room."
        size={14}
        color={ink}
      />
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* CDN edges around one origin                                          */
/* ------------------------------------------------------------------ */

function Cdn() {
  const cities = ["Tokyo", "Paris", "Lima"];
  const rowsY = [50, 165, 280];
  const toOrigin = [
    path([360, 85], [130, 85], [130, 150]),
    path([360, 200], [220, 200]),
    path([360, 315], [130, 315], [130, 250]),
  ];
  return (
    <Diagram
      id="caching-cdn"
      width={900}
      height={424}
      title="A CDN parks copies near people"
      description="Kids in Tokyo, Paris and Lima each make a short trip to the edge server in their own city, which keeps nearby copies of files. Only when an edge does not have a file yet does it make the long trip to the one origin server."
      caption="Like ice cream trucks parked in every neighborhood, so nobody has to travel to the faraway factory."
    >
      <Box x={40} y={150} w={180} h={100} label="Origin server" note={["the one far factory", "has the real files"]} tone="sun" />
      {toOrigin.map((d, i) => (
        <g key={i}>
          <Arrow d={d} tone="sky" dashed />
          <Traveler d={d} dur={4} delay={i * 1.3} tone="sky" r={5} />
        </g>
      ))}
      <Label x={290} y={180} text="only on a miss" size={14} color={tones.sky.text} />

      {cities.map((c, i) => {
        const y = rowsY[i];
        const cy = y + 35;
        const near = path([690, cy], [560, cy]);
        return (
          <g key={c}>
            <Box x={360} y={y} w={200} h={70} label={`Edge in ${c}`} note="keeps nearby copies" tone="sky" />
            <Arrow d={near} tone="mint" both />
            <Traveler d={near} dur={1.2} delay={i * 0.4} tone="mint" r={5} />
            <Box x={690} y={y} w={180} h={70} label={`Kids in ${c}`} note="a short, fast trip" tone="mint" />
          </g>
        );
      })}

      <Label
        x={450}
        y={392}
        text="First visit near an edge: fetched from the origin once. After that: the close copy."
        size={14}
      />
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* Write-through, write-around, write-back                              */
/* ------------------------------------------------------------------ */

function Column({
  ox,
  title,
  tone,
  notes,
  children,
}: {
  ox: number;
  title: string;
  tone: "mint" | "sky" | "sun";
  notes: string[];
  children: ReactNode;
}) {
  return (
    <>
      <Group x={ox} y={36} w={260} h={410} label={title} tone={tone} />
      <Box x={ox + 15} y={76} w={230} h={60} label="App" note="saves a change" tone="slate" />
      <Box x={ox + 15} y={196} w={120} h={60} label="Cache" tone="mint" />
      <Box x={ox + 15} y={316} w={230} h={60} label="Database" tone="sun" />
      {children}
      <Label x={ox + 130} y={404} text={notes} size={14} color={ink} />
    </>
  );
}

function WritePolicies() {
  const lane = 75; // under the cache
  const side = 170; // the lane that skips the cache
  const cols = [30, 320, 610];

  const wt = {
    a: path([cols[0] + lane, 136], [cols[0] + lane, 196]),
    b: path([cols[0] + lane, 256], [cols[0] + lane, 316]),
    done: path([cols[0] + side, 316], [cols[0] + side, 136]),
  };
  const wa = {
    write: path([cols[1] + side, 136], [cols[1] + side, 316]),
    del: path([cols[1] + lane, 136], [cols[1] + lane, 196]),
  };
  const wb = {
    a: path([cols[2] + lane, 136], [cols[2] + lane, 196]),
    later: path([cols[2] + lane, 256], [cols[2] + lane, 316]),
  };
  return (
    <Diagram
      id="caching-write-policies"
      width={900}
      height={480}
      title="Three ways to handle a write"
      description="Write-through: the app writes to the cache, the cache writes to the database, and only then is the write done, so the copies match but writes wait for both. Write-around: the app writes straight to the database and deletes the old cached copy, so the first read afterwards is a miss. Write-back: the app writes to the cache and is done right away, and the cache saves to the database later in batches, which is fastest but loses changes if the cache dies first."
      caption="Write-back is the cousin: fastest of all, but only safe when losing the last few changes would be acceptable."
    >
      <Column ox={cols[0]} title="Write-through" tone="mint" notes={["Copies always match.", "Writes wait for both saves."]}>
        <Arrow d={wt.a} tone="slate" />
        <Label x={cols[0] + lane + 12} y={166} text="1. write" anchor="start" size={13} color={ink} />
        <Arrow d={wt.b} tone="slate" />
        <Label x={cols[0] + lane + 12} y={286} text="2. write" anchor="start" size={13} color={ink} />
        <Arrow d={wt.done} tone="mint" dashed />
        <Label x={cols[0] + side + 12} y={226} text="3. done" anchor="start" size={13} color={tones.mint.text} />
        <Traveler d={wt.a} dur={2} tone="slate" r={5} />
        <Traveler d={wt.b} dur={2} delay={1} tone="slate" r={5} />
      </Column>

      <Column ox={cols[1]} title="Write-around" tone="sky" notes={["Cache skips new data.", "First read after is a miss."]}>
        <Arrow d={wa.write} tone="slate" />
        <Label x={cols[1] + side + 12} y={226} text="1. write" anchor="start" size={13} color={ink} />
        <Arrow d={wa.del} tone="rose" dashed />
        <Label x={cols[1] + lane + 12} y={166} text="2. delete" anchor="start" size={13} color={tones.rose.text} />
        <Traveler d={wa.write} dur={2.4} tone="slate" r={5} />
      </Column>

      <Column ox={cols[2]} title="Write-back (the cousin)" tone="sun" notes={["Fastest: done right away.", "Lost if cache dies first."]}>
        <Arrow d={wb.a} tone="slate" />
        <Label x={cols[2] + lane + 12} y={166} text="1. write, done" anchor="start" size={13} color={ink} />
        <Arrow d={wb.later} tone="sun" dashed />
        <Label x={cols[2] + lane + 12} y={286} text={["2. later,", "in batches"]} anchor="start" size={13} color={tones.sun.text} />
        <Traveler d={wb.a} dur={1.2} tone="slate" r={5} />
        <Traveler d={wb.later} dur={4} delay={1} tone="sun" r={5} />
      </Column>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* Stampede, before and after a lock                                    */
/* ------------------------------------------------------------------ */

function Stampede() {
  const leftX = [50, 183, 315];
  const rightX = [485, 618, 750];
  const reqW = 100;
  const center = (x: number) => x + reqW / 2;
  const oneRefill = path([center(rightX[0]), 242], [center(rightX[0]), 300]);
  return (
    <Diagram
      id="caching-stampede"
      width={900}
      height={450}
      title="A cache stampede, and the lock that stops it"
      description="Without a lock, a hot key expires and every request misses at the same moment, so all of them hit the database with the same question and swamp it. With a lock, the first request takes the lock and refills the cache with a single database query while the others wait for its answer or get the old copy."
      caption="Three requests stand in for thousands. With a lock, the database answers the question once."
    >
      <Group x={30} y={36} w={405} h={382} label="Without a lock" tone="rose" />
      {leftX.map((x, i) => {
        const toCache = path([center(x), 126], [center(x), 172]);
        const toDb = path([center(x), 242], [center(x), 300]);
        return (
          <g key={x}>
            <Box x={x} y={76} w={reqW} h={50} label="Request" tone="sky" />
            <Arrow d={toCache} tone="slate" />
            <Arrow d={toDb} tone="rose" />
            <Traveler d={toDb} dur={1.4} delay={i * 0.15} tone="rose" r={5} />
          </g>
        );
      })}
      <Box x={50} y={172} w={365} h={70} label="Cache" note="the hot key just expired: miss" tone="white" dashed />
      <Box x={50} y={300} w={365} h={70} label="Database" note="swamped: same work again and again" tone="rose" />
      <Label x={232} y={396} text="Thousands of copies of one question." size={14} color={tones.rose.text} />

      <Group x={465} y={36} w={405} h={382} label="With a lock (single flight)" tone="mint" />
      {rightX.map((x, i) => (
        <g key={x}>
          <Box x={x} y={76} w={reqW} h={50} label="Request" tone="sky" />
          <Arrow d={path([center(x), 126], [center(x), 172])} tone="slate" both={i > 0} dashed={i > 0} />
        </g>
      ))}
      <Box
        x={485}
        y={172}
        w={365}
        h={70}
        label="Cache"
        note={["first request takes the lock,", "others wait or get the old copy"]}
        tone="white"
      />
      <Arrow d={oneRefill} tone="sun" width={3} />
      <Label x={center(rightX[0]) + 14} y={271} text="one refill" anchor="start" size={14} color={tones.sun.text} />
      <Traveler d={oneRefill} dur={1.4} tone="sun" r={5} />
      <Box x={485} y={300} w={365} h={70} label="Database" note="calm: one query, then rest" tone="mint" />
      <Label x={667} y={396} text="One trip to the database, shared by all." size={14} color={tones.mint.text} />
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* TTL jitter                                                           */
/* ------------------------------------------------------------------ */

function Jitter() {
  const stack = [0, 1, 2, 3, 4, 5].map((k) => 128 - k * 12);
  const spread = [372, 395, 418, 442, 465, 488];
  return (
    <Diagram
      id="caching-jitter"
      width={860}
      height={346}
      title="Jitter spreads out expiry times"
      description="When six keys all get the same ten minute timer at the same moment, they all expire together at 10:00 and all miss at once. When each timer gets a small random extra, the keys expire a few at a time between about 9:59 and 10:01."
      caption="A little randomness in each timer turns one big rush into a gentle trickle."
    >
      <Label x={40} y={46} text="Same timer for every key" anchor="start" size={15} weight={700} color={ink} />
      <Line d={path([60, 140], [800, 140])} color={tones.slate.stroke} width={2} />
      {stack.map((cy) => (
        <circle key={cy} cx={430} cy={cy} r={5} fill={tones.rose.stroke} className="blink" />
      ))}
      <Label x={450} y={98} text="all 6 expire at 10:00 and miss at once" anchor="start" size={14} color={tones.rose.text} />
      <Label x={140} y={160} text="9:55" size={13} />
      <Label x={430} y={160} text="10:00" size={13} />
      <Label x={720} y={160} text="10:05" size={13} />

      <Label x={40} y={210} text="Timer plus a small random extra (jitter)" anchor="start" size={15} weight={700} color={ink} />
      <Line d={path([60, 290], [800, 290])} color={tones.slate.stroke} width={2} />
      {spread.map((cx) => (
        <circle key={cx} cx={cx} cy={278} r={5} fill={tones.mint.stroke} />
      ))}
      <Label x={430} y={250} text="they expire a few at a time" size={14} color={tones.mint.text} />
      <Label x={140} y={310} text="9:55" size={13} />
      <Label x={430} y={310} text="10:00" size={13} />
      <Label x={720} y={310} text="10:05" size={13} />
    </Diagram>
  );
}

export const cachingDiagrams = {
  "caching-aside": CacheAside,
  "caching-lru": Lru,
  "caching-cdn": Cdn,
  "caching-write-policies": WritePolicies,
  "caching-stampede": Stampede,
  "caching-jitter": Jitter,
};
