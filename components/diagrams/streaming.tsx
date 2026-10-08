import { Arrow, Box, Diagram, Group, Label, Line, Traveler, path, tones } from "./primitives";
import type { Tone } from "./primitives";

const ink2 = tones.slate.text;

/* A belt of numbered notes. Reading moves a bookmark, it never removes a note. */
function StreamBelt() {
  const noteX = (i: number) => 90 + i * 76;
  const notes = Array.from({ length: 8 }, (_, i) => i);
  const add = path([756, 138], [686, 138]);
  const billing = path([350, 260], [350, 166]);
  const analytics = path([578, 260], [578, 166]);
  return (
    <Diagram
      id="hts-belt"
      width={860}
      height={400}
      title="An event stream is a belt of notes that stays put"
      description="Eight notes numbered 0 to 7 sit in order on one belt. A new note is added at the end. The billing reader has a bookmark at note 3 and the analytics reader has a bookmark at note 6. Reading does not remove notes, and the oldest notes are deleted only after seven days."
      caption="Each note keeps its place number forever. Each reader only moves its own bookmark."
    >
      <Group x={66} y={64} w={640} h={142} label="Snack sales topic (notes kept for 7 days)" tone="slate" />
      {notes.map((i) => (
        <Box key={i} x={noteX(i)} y={110} w={64} h={56} label={String(i)} tone={i === 3 || i === 6 ? "sun" : "white"} />
      ))}
      <Label x={122} y={186} text="oldest" size={13} />
      <Label x={654} y={186} text="newest" size={13} />
      <Box x={756} y={110} w={64} h={56} label="8" tone="mint" dashed />
      <Arrow d={add} tone="mint" />
      <Label x={788} y={86} text="new note" size={13} weight={600} color={tones.mint.text} />
      <Traveler d={add} dur={2.4} tone="mint" r={5} />

      <Box x={265} y={260} w={170} h={64} label="Billing" note="bookmark at note 3" tone="sky" />
      <Box x={493} y={260} w={170} h={64} label="Analytics" note="bookmark at note 6" tone="grape" />
      <Arrow d={billing} tone="sky" />
      <Arrow d={analytics} tone="grape" />
      <Label x={430} y={360} text="Reading does not remove a note. Each reader keeps its own bookmark." size={14} />
    </Diagram>
  );
}

/* Keys are hashed to pick a belt, so one user's notes stay together and in order. */
function Partitions() {
  const userTone: Record<string, Tone> = { Mia: "sky", Leo: "mint", Ava: "sun", Sam: "grape" };
  const belts = [
    { name: "Partition 0", notes: ["Mia #1", "Leo #1", "Mia #2", "Leo #2"], note: ["two users can", "share a belt"] },
    { name: "Partition 1", notes: ["Ava #1", "Ava #2", "Ava #3"], note: ["Ava's notes", "stay in order"] },
    { name: "Partition 2", notes: ["Sam #1", "Sam #2", "Sam #3", "Sam #4"], note: ["busy user,", "crowded belt"] },
  ];
  const groupY = (i: number) => 50 + i * 110;
  const rowMid = (i: number) => groupY(i) + 58;
  const starts: [number, number][] = [
    [230, 196],
    [230, 218],
    [230, 240],
  ];
  return (
    <Diagram
      id="hts-partitions"
      width={900}
      height={430}
      title="A key picks the partition"
      description="A sorter looks at the user name on each new note and always sends the same user to the same partition. Partition 0 holds notes from Mia and Leo, partition 1 holds Ava's notes, and partition 2 holds many notes from the busy user Sam. Inside each partition, a user's notes stay in order."
      caption="The sorter uses a fixed recipe (a hash of the user name), so Mia always goes to the same belt. Order is kept per belt, not across belts."
    >
      <Label x={135} y={124} text={["New notes arrive,", "each with a user"]} size={13} />
      <Box x={40} y={173} w={190} h={90} label="Pick a belt" note={["same user,", "same belt"]} tone="slate" />
      {belts.map((b, i) => {
        const gy = groupY(i);
        const d = path(starts[i], [340, rowMid(i)]);
        return (
          <g key={b.name}>
            <Group x={320} y={gy} w={530} h={96} label={b.name} tone="slate" filled />
            {b.notes.map((n, j) => (
              <Box key={n} x={340 + j * 92} y={gy + 34} w={80} h={48} label={n} size={14} tone={userTone[n.split(" ")[0]]} />
            ))}
            <Label x={712} y={gy + 49} text={b.note} anchor="start" size={13} />
            <Arrow d={d} tone="slate" />
            <Traveler d={d} dur={2} delay={i * 0.7} tone="sun" r={5} />
          </g>
        );
      })}
      <Label x={450} y={396} text="Order is kept inside one belt, not across belts." size={14} />
    </Diagram>
  );
}

/* Two consumer groups read the same partitions with their own bookmarks. */
function ConsumerGroups() {
  const parts = [100, 180, 260];
  const billing = [
    { y: 100, label: "Billing 1", note: "reads P0" },
    { y: 180, label: "Billing 2", note: "reads P1" },
    { y: 260, label: "Billing 3", note: "reads P2" },
    { y: 340, label: "Billing 4", note: "idle, no belt left" },
  ];
  const toBilling = parts.map((y) => path([365, y + 30], [230, y + 30]));
  const toAnalytics = [path([535, 130], [670, 155]), path([535, 210], [670, 185]), path([535, 290], [670, 290])];
  return (
    <Diagram
      id="hts-consumer-groups"
      width={900}
      height={480}
      title="Two consumer groups share the same three partitions"
      description="Three partitions sit in the middle. The billing group on the left has four helpers: three each read one partition and the fourth sits idle because there is no partition left. The analytics group on the right has two helpers: one reads partitions 0 and 1, the other reads partition 2. Each group keeps its own bookmarks, so both groups read every note."
      caption="Inside one group, each partition goes to exactly one helper. Extra helpers wait on the bench."
    >
      <Group x={40} y={60} w={210} h={356} label="Billing group" tone="sky" />
      <Group x={345} y={60} w={210} h={356} label="Topic: orders" tone="slate" filled />
      <Group x={650} y={60} w={210} h={356} label="Analytics group" tone="grape" />
      {billing.map((b, i) => (
        <Box key={b.label} x={60} y={b.y} w={170} h={60} label={b.label} note={b.note} tone={i === 3 ? "white" : "sky"} dashed={i === 3} />
      ))}
      {parts.map((y, i) => (
        <Box key={y} x={365} y={y} w={170} h={60} label={`Partition ${i}`} note={`P${i}`} tone="slate" />
      ))}
      <Box x={670} y={135} w={170} h={70} label="Analytics A" note="reads P0 and P1" tone="grape" />
      <Box x={670} y={255} w={170} h={70} label="Analytics B" note="reads P2" tone="grape" />
      {toBilling.map((d, i) => (
        <g key={`b${i}`}>
          <Arrow d={d} tone="sky" />
          <Traveler d={d} dur={1.8} delay={i * 0.6} tone="sky" r={5} />
        </g>
      ))}
      {toAnalytics.map((d, i) => (
        <g key={`a${i}`}>
          <Arrow d={d} tone="grape" />
          <Traveler d={d} dur={2.4} delay={i * 0.8} tone="grape" r={5} />
        </g>
      ))}
      <Label x={450} y={358} text={["3 belts, so at most", "3 busy helpers a group"]} size={13} />
      <Label x={755} y={364} text={["fewer helpers, so", "A reads two belts"]} size={13} />
      <Label x={450} y={448} text="Each group keeps its own bookmarks, so billing and analytics both read every note." size={14} />
    </Diagram>
  );
}

/* Tumbling, sliding and session windows over the same events. */
function Windows() {
  const x = (t: number) => 160 + t * 110;
  const events = [0.3, 0.8, 1.4, 1.9, 2.6, 3.1, 4.5, 4.8, 5.6];
  const count = (a: number, b: number) => events.filter((e) => e >= a && e < b).length;
  const win = (a: number, b: number, y: number, h: number, tone: Tone, key: string) => (
    <Box key={key} x={x(a) + 3} y={y} w={(b - a) * 110 - 6} h={h} label={`${count(a, b)} events`} size={14} tone={tone} />
  );
  return (
    <Diagram
      id="hts-windows"
      width={880}
      height={450}
      title="Three ways to cut a stream into time buckets"
      description="Nine events happen over six minutes. Tumbling windows cut time into back to back two minute buckets that do not overlap, holding 4, 2 and 3 events. Sliding windows are also two minutes long but start every minute, so they overlap and some events are counted twice. Session windows group bursts of activity and close after a quiet gap of one minute, giving one session of 6 events and one of 3."
      caption="Same nine events, three different ways to bucket them."
    >
      <Label x={40} y={70} text="Events" anchor="start" size={15} weight={700} color={ink2} />
      <Line d={path([x(0), 70], [x(6), 70])} color={tones.slate.stroke} />
      {events.map((e) => (
        <circle key={e} cx={x(e)} cy={70} r={7} fill={tones.sun.fill} stroke={tones.sun.stroke} strokeWidth={2} />
      ))}
      {[0, 1, 2, 3, 4, 5, 6].map((t) => (
        <Label key={t} x={x(t)} y={100} text={`${t} min`} size={13} />
      ))}

      <Label x={40} y={152} text="Tumbling" anchor="start" size={15} weight={700} color={ink2} />
      {win(0, 2, 130, 44, "sky", "t0")}
      {win(2, 4, 130, 44, "sky", "t1")}
      {win(4, 6, 130, 44, "sky", "t2")}

      <Label x={40} y={246} text="Sliding" anchor="start" size={15} weight={700} color={ink2} />
      {win(0, 2, 202, 40, "grape", "s0")}
      {win(2, 4, 202, 40, "grape", "s2")}
      {win(4, 6, 202, 40, "grape", "s4")}
      {win(1, 3, 252, 40, "grape", "s1")}
      {win(3, 5, 252, 40, "grape", "s3")}

      <Label x={40} y={342} text="Session" anchor="start" size={15} weight={700} color={ink2} />
      <Box x={x(0.3) - 10} y={320} w={x(3.1) - x(0.3) + 20} h={44} label="6 events" size={14} tone="mint" />
      <Box x={x(4.5) - 10} y={320} w={x(5.6) - x(4.5) + 20} h={44} label="3 events" size={14} tone="mint" />

      <Label
        x={440}
        y={402}
        text={[
          "Tumbling: back to back, each event counted once. Sliding: buckets overlap, so an event can count twice.",
          "Session: a bucket ends after a quiet gap (here, 1 minute with no events).",
        ]}
        size={13}
      />
    </Diagram>
  );
}


/* Fan-out on write copies posts into feeds early. Fan-out on read gathers them late. */
function Fanout() {
  const feeds = ["Leo's feed", "Ava's feed", "Sam's feed"];
  const authors = ["Mia's posts", "Ava's posts", "Sam's posts"];
  const pushArrows = [98, 158, 218].map((y) => path([230, 158], [390, y]));
  const readOwn = path([560, 98], [660, 98]);
  const pullArrows = [358, 418, 478].map((y, i) => path([230, y], [390, 403 + i * 15]));
  return (
    <Diagram
      id="hts-fanout"
      width={900}
      height={590}
      title="Fan-out on write versus fan-out on read"
      description="Top: with fan-out on write, Mia's new post is copied into Leo's, Ava's and Sam's feeds right away, so when Leo opens the app he reads one ready list. The weak spot is a star with fifty million fans, which needs fifty million copies per post. Bottom: with fan-out on read, each account's posts are saved once, and when Leo opens the app the system gathers posts from everyone he follows and merges them, which is slower, but posting is cheap."
      caption="Push does the work when someone posts. Pull does the work when someone reads."
    >
      <Group x={30} y={30} w={840} h={232} label="Fan-out on write (push): copy at posting time" tone="sky" />
      <Box x={60} y={118} w={170} h={80} label="Mia posts" note={["copied into every", "follower's feed"]} tone="sky" />
      {feeds.map((f, i) => (
        <Box key={f} x={390} y={74 + i * 60} w={170} h={48} label={f} size={14} tone="white" />
      ))}
      {pushArrows.map((d, i) => (
        <g key={i}>
          <Arrow d={d} tone="sky" />
          <Traveler d={d} dur={2} delay={i * 0.25} tone="sky" r={5} />
        </g>
      ))}
      <Box x={660} y={70} w={190} h={56} label="Leo opens app" note="fast: one list to read" size={14} tone="mint" />
      <Arrow d={readOwn} tone="mint" />
      <Box x={660} y={150} w={190} h={92} label="Weak spot" note={["a star with 50 million", "fans means 50 million", "copies per post"]} size={14} tone="rose" />

      <Group x={30} y={290} w={840} h={232} label="Fan-out on read (pull): gather at reading time" tone="grape" />
      {authors.map((a, i) => (
        <Box key={a} x={60} y={334 + i * 60} w={170} h={48} label={a} size={14} tone="white" />
      ))}
      {pullArrows.map((d, i) => (
        <g key={i}>
          <Arrow d={d} tone="grape" />
          <Traveler d={d} dur={2} delay={i * 0.3} tone="grape" r={5} />
        </g>
      ))}
      <Box x={390} y={378} w={200} h={80} label="Leo opens app" note={["slower: ask everyone,", "then sort and merge"]} size={14} tone="rose" />
      <Box x={660} y={378} w={190} h={80} label="Good part" note={["posting is cheap:", "save the post once"]} size={14} tone="mint" />

      <Label x={450} y={556} text="Hybrid: push for most accounts, pull for the few stars, and merge the two when reading." size={14} />
    </Diagram>
  );
}

export const streamingDiagrams = {
  "hts-belt": StreamBelt,
  "hts-partitions": Partitions,
  "hts-consumer-groups": ConsumerGroups,
  "hts-windows": Windows,
  "hts-fanout": Fanout,
};
