import { Arrow, Box, Diagram, Group, Label, Line, Traveler, path, tones, type Tone } from "./primitives";

function ShardPanel({ x0, kind }: { x0: number; kind: "range" | "hash" }) {
  const cx = x0 + 205;
  const range = kind === "range";
  const shards = range
    ? [
        { label: "Shard 1", note: "A to H" },
        { label: "Shard 2", note: "I to P" },
        { label: "Shard 3", note: "Q to Z" },
      ]
    : [
        { label: "Shard 1", note: "leftover 0" },
        { label: "Shard 2", note: "leftover 1" },
        { label: "Shard 3", note: "leftover 2" },
      ];
  const a1 = path([cx, 116], [cx, 150]);
  const a2 = path([cx, 214], [cx, 254]);
  return (
    <g>
      <Group x={x0} y={30} w={410} h={370} label={range ? "Range sharding: split by alphabet" : "Hash sharding: split by a scramble number"} />
      <Box x={x0 + 115} y={70} w={180} h={46} label="Name: Mia" tone="white" />
      <Box
        x={x0 + 40}
        y={150}
        w={330}
        h={64}
        label={range ? "First letter: M" : "Hash of Mia: 7"}
        note={range ? "M is between I and P" : "7 divided by 3 leaves 1"}
        tone="grape"
      />
      {shards.map((s, i) => (
        <Box key={s.label} x={x0 + 20 + i * 127} y={254} w={116} h={64} label={s.label} note={s.note} tone={i === 1 ? "mint" : "sky"} />
      ))}
      <Arrow d={a1} tone="slate" />
      <Arrow d={a2} tone="mint" />
      <Traveler d={a1} dur={1.6} tone="grape" r={5} />
      <Traveler d={a2} dur={1.6} delay={0.8} tone="mint" r={5} />
      <Label
        x={cx}
        y={348}
        text={range ? ["Good: neighbors stay together.", "Risk: busy ranges get crowded."] : ["Good: keys spread out evenly.", "Risk: an A to C list asks every shard."]}
        size={14}
      />
    </g>
  );
}

function RangeVsHash() {
  return (
    <Diagram
      id="db-range-vs-hash"
      width={900}
      height={430}
      title="Range sharding versus hash sharding"
      description="Left: range sharding looks at the first letter of the name Mia, which is M, between I and P, so Mia goes to shard 2 of three shards holding A to H, I to P and Q to Z. Right: hash sharding scrambles Mia into the number 7. Seven divided by three leaves one, so Mia goes to the shard for leftover 1, which is shard 2."
      caption="Both send Mia to shard 2, for different reasons. Range keeps neighbors together. Hash spreads keys evenly but scatters neighbors."
    >
      <ShardPanel x0={30} kind="range" />
      <ShardPanel x0={460} kind="hash" />
    </Diagram>
  );
}

function SingleLeader({ x0 }: { x0: number }) {
  const cx = x0 + 140;
  const w = path([cx, 120], [cx, 166]);
  const f1 = path([cx - 30, 230], [x0 + 72, 296]);
  const f2 = path([cx + 30, 230], [x0 + 208, 296]);
  return (
    <g>
      <Group x={x0} y={30} w={280} h={390} label="Single leader" />
      <Box x={cx - 70} y={70} w={140} h={50} label="Writer" tone="white" />
      <Arrow d={w} tone="slate" />
      <Label x={cx + 12} y={143} text="all writes" anchor="start" size={13} />
      <Box x={cx - 80} y={166} w={160} h={64} label="Leader" note="takes every write" tone="sun" />
      <Arrow d={f1} tone="sun" />
      <Arrow d={f2} tone="sun" />
      <Traveler d={f1} dur={2} tone="sun" r={5} />
      <Traveler d={f2} dur={2} tone="sun" r={5} />
      <Label x={cx} y={272} text="copies" size={13} />
      <Box x={x0 + 12} y={296} w={120} h={64} label="Follower" note="copy, reads" tone="sky" />
      <Box x={x0 + 148} y={296} w={120} h={64} label="Follower" note="copy, reads" tone="sky" />
      <Label x={cx} y={386} text={["Simple, no conflicts.", "All writes go through one."]} size={13} />
    </g>
  );
}

function MultiLeader({ x0 }: { x0: number }) {
  const cx = x0 + 140;
  const swap = path([x0 + 120, 198], [x0 + 160, 198]);
  return (
    <g>
      <Group x={x0} y={30} w={280} h={390} label="Multi-leader" />
      <Box x={x0 + 16} y={70} w={104} h={50} label="Writer 1" tone="white" />
      <Box x={x0 + 160} y={70} w={104} h={50} label="Writer 2" tone="white" />
      <Arrow d={path([x0 + 68, 120], [x0 + 68, 166])} tone="slate" />
      <Arrow d={path([x0 + 212, 120], [x0 + 212, 166])} tone="slate" />
      <Box x={x0 + 16} y={166} w={104} h={64} label="Leader 1" note="Europe" tone="sun" />
      <Box x={x0 + 160} y={166} w={104} h={64} label="Leader 2" note="America" tone="sun" />
      <Arrow d={swap} tone="sun" both />
      <Label x={cx} y={254} text="share changes" size={13} />
      <Box
        x={x0 + 16}
        y={290}
        w={248}
        h={70}
        label="Watch out: conflicts"
        note={["both change the same thing?", "keep the latest, or merge"]}
        tone="rose"
        dashed
      />
      <Label x={cx} y={386} text={["Fast writes near everyone.", "Conflicts must be settled."]} size={13} />
    </g>
  );
}

function Leaderless({ x0 }: { x0: number }) {
  const cx = x0 + 140;
  const copies: { y: number; note: string; tone: Tone }[] = [
    { y: 76, note: "has new", tone: "mint" },
    { y: 176, note: "has new", tone: "mint" },
    { y: 276, note: "missed it", tone: "white" },
  ];
  const w1 = path([x0 + 112, 128], [x0 + 164, 103]);
  const w2 = path([x0 + 112, 152], [x0 + 164, 200]);
  const r1 = path([x0 + 112, 262], [x0 + 164, 214]);
  const r2 = path([x0 + 112, 286], [x0 + 164, 303]);
  return (
    <g>
      <Group x={x0} y={30} w={280} h={390} label="Leaderless (N = 3)" />
      {copies.map((c, i) => (
        <Box key={c.y} x={x0 + 164} y={c.y} w={104} h={54} label={`Copy ${i + 1}`} note={c.note} tone={c.tone} />
      ))}
      <Box x={x0 + 12} y={110} w={100} h={60} label="Writer" note="W = 2" tone="sun" />
      <Box x={x0 + 12} y={244} w={100} h={60} label="Reader" note="R = 2" tone="sky" />
      <Arrow d={w1} tone="sun" />
      <Arrow d={w2} tone="sun" />
      <Arrow d={r1} tone="sky" dashed />
      <Arrow d={r2} tone="sky" dashed />
      <Traveler d={w1} dur={2} tone="sun" r={5} />
      <Traveler d={w2} dur={2} tone="sun" r={5} />
      <Label x={cx} y={386} text={["W + R = 4, more than 3, so every", "read reaches a copy that has new."]} size={13} />
    </g>
  );
}

function ReplicationTopologies() {
  return (
    <Diagram
      id="db-replication-topologies"
      width={920}
      height={450}
      title="Three ways to arrange copies"
      description="Single leader: one writer sends all writes to one leader, which copies its log to two followers that serve reads. Multi-leader: two writers each write to a nearby leader, in Europe and America, and the leaders share changes, so they must settle conflicts when both change the same thing. Leaderless: with three copies, a writer waits for two copies to save, and a reader asks two copies. Copy 3 missed the write, but the reader also asks copy 2, which has it, because two plus two is more than three."
      caption="Single leader is the most common. Multi-leader helps when users are far apart. Leaderless keeps working when some copies are down."
    >
      <SingleLeader x0={30} />
      <MultiLeader x0={320} />
      <Leaderless x0={610} />
    </Diagram>
  );
}

function HashRing() {
  const cx = 270;
  const cy = 240;
  const r = 150;
  const pt = (deg: number, rad = r): [number, number] => {
    const a = (deg * Math.PI) / 180;
    return [Math.round((cx + rad * Math.sin(a)) * 10) / 10, Math.round((cy - rad * Math.cos(a)) * 10) / 10];
  };
  const arc = (from: number, to: number, rad = r) => {
    const [x1, y1] = pt(from, rad);
    const [x2, y2] = pt(to, rad);
    const large = (to - from + 360) % 360 > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${rad} ${rad} 0 ${large} 1 ${x2} ${y2}`;
  };
  const ring = `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r}`;
  const servers = [
    { deg: 0, tone: "sky" as const },
    { deg: 60, tone: "rose" as const },
    { deg: 130, tone: "sky" as const },
    { deg: 240, tone: "sky" as const },
  ];
  const keys = [
    { name: "Mia", deg: 30, to: 60, tone: "rose" as const },
    { name: "Leo", deg: 100, to: 130, tone: "sun" as const },
    { name: "Ava", deg: 200, to: 240, tone: "sun" as const },
    { name: "Sam", deg: 300, to: 360, tone: "sun" as const },
  ];
  return (
    <Diagram
      id="db-consistent-hash-ring"
      width={900}
      height={430}
      title="Consistent hashing on a ring"
      description="Servers A, B and C sit on a circle like numbers on a clock. Keys sit on the circle too, and each key walks clockwise to the next server. A new server D lands between A and B. Only the keys in the arc between A and D, here Mia, move to D. Leo, Ava and Sam stay where they were. With hash mod N, going from three to four servers would move about three of every four keys."
      caption="Each dot walks clockwise to its server. Adding server D only changes the home of keys in the red arc."
    >
      <Line d={ring} color="#94a3b8" width={3} />
      <Line d={arc(0, 60)} color={tones.rose.stroke} width={6} />
      <Arrow d={arc(-50, 50, 62)} tone="slate" />
      <Label x={cx} y={236} text={["keys walk clockwise", "to the next server"]} size={14} weight={600} color={tones.slate.text} />
      {keys.map((k) => {
        const [x, y] = pt(k.deg);
        const [lx, ly] = pt(k.deg, 122);
        return (
          <g key={k.name}>
            <circle cx={x} cy={y} r={6} fill={tones[k.tone].stroke} />
            <Label x={lx} y={ly} text={k.name} size={14} weight={700} color={tones[k.tone].text} />
            <Traveler d={arc(k.deg, k.to)} dur={2.4} tone={k.tone} r={5} />
          </g>
        );
      })}
      {servers.map((s) => {
        const [x, y] = pt(s.deg);
        return <circle key={s.deg} cx={x} cy={y} r={11} fill={tones[s.tone].fill} stroke={tones[s.tone].stroke} strokeWidth={3} />;
      })}
      <Label x={270} y={62} text="Server A" size={14} weight={700} color={tones.sky.text} />
      <Label x={420} y={148} text="New server D" anchor="start" size={14} weight={700} color={tones.rose.text} />
      <Label x={406} y={354} text="Server B" anchor="start" size={14} weight={700} color={tones.sky.text} />
      <Label x={116} y={332} text="Server C" anchor="end" size={14} weight={700} color={tones.sky.text} />
      <Label x={362} y={80} text="only this arc moves" anchor="start" size={14} weight={600} color={tones.rose.text} />

      <Box x={560} y={60} w={310} h={90} label="Old way: hash mod N" note={["from 3 to 4 servers, about", "3 of every 4 keys move"]} tone="rose" />
      <Box x={560} y={176} w={310} h={90} label="Ring: add server D" note={["only keys in one arc move:", "on average about 1 in 4"]} tone="mint" />
      <Box x={560} y={292} w={310} h={90} label="Virtual nodes" note={["each server sits at many spots,", "so the arcs even out"]} tone="grape" />
    </Diagram>
  );
}

function ReplicationLag() {
  const lanes = [
    { y: 90, label: "You", tone: "white" as const },
    { y: 200, label: "Leader", tone: "sun" as const },
    { y: 310, label: "Follower", tone: "sky" as const },
  ];
  const post = path([200, 90], [200, 200]);
  const copy = path([230, 200], [700, 310]);
  const read = path([380, 90], [380, 310]);
  const fix = path([600, 90], [600, 200]);
  return (
    <Diagram
      id="db-replication-lag"
      width={900}
      height={410}
      title="Where did my photo go"
      description="Time moves to the right. You post a photo, which is saved on the leader. The leader starts copying it to the follower, but the copy is slow. You refresh, and your read goes to the follower, which does not have the photo yet, so it seems to vanish. The fix: for a short while, read your own posts from the leader, which already has the photo. Later the copy finally reaches the follower."
      caption="Red is what goes wrong: the read hits a follower that is behind. Green is the fix: read your own fresh changes from the leader."
    >
      {lanes.map((l) => (
        <g key={l.label}>
          <Box x={30} y={l.y - 24} w={120} h={48} label={l.label} tone={l.tone} />
          <Line d={path([150, l.y], [870, l.y])} dashed />
        </g>
      ))}
      <Arrow d={post} tone="sky" />
      <Label x={212} y={140} text="1. post a photo" anchor="start" size={14} weight={600} color={tones.sky.text} />
      <Arrow d={copy} tone="grape" dashed />
      <Traveler d={copy} dur={6} tone="grape" r={5} />
      <Label x={720} y={262} text="3. copy arrives late (lag)" size={14} weight={600} color={tones.grape.text} />

      <Arrow d={read} tone="rose" both />
      <Label x={392} y={112} text={["2. refresh: the read goes", "to the follower"]} anchor="start" size={14} weight={600} color={tones.rose.text} />
      <Label x={380} y={336} text="no photo here yet" size={14} weight={600} color={tones.rose.text} />

      <Arrow d={fix} tone="mint" both />
      <Label x={612} y={112} text={["Fix: read my own posts", "from the leader"]} anchor="start" size={14} weight={600} color={tones.mint.text} />
      <Label x={600} y={224} text="photo is here" size={14} weight={600} color={tones.mint.text} />

      <Arrow d={path([690, 372], [860, 372])} tone="slate" />
      <Label x={678} y={372} text="time" anchor="end" size={14} />
    </Diagram>
  );
}

function MonotonicPanel({ x0, fixed }: { x0: number; fixed: boolean }) {
  const first = path([x0 + 170, 122], [x0 + 110, 236]);
  const second = fixed ? path([x0 + 200, 122], [x0 + 140, 236]) : path([x0 + 240, 122], [x0 + 300, 236]);
  return (
    <g>
      <Group x={x0} y={30} w={410} h={330} label={fixed ? "Fix: stick to one follower" : "Problem: time goes backward"} />
      <Box x={x0 + 125} y={72} w={160} h={50} label="You" tone="white" />
      <Box x={x0 + 30} y={236} w={160} h={64} label="Follower 1" note="3 comments" tone="mint" />
      <Box
        x={x0 + 220}
        y={236}
        w={160}
        h={64}
        label="Follower 2"
        note={fixed ? "not used by you" : "2 comments, behind"}
        tone={fixed ? "white" : "rose"}
        dashed={fixed}
      />
      <Arrow d={first} tone="mint" />
      <Arrow d={second} tone={fixed ? "mint" : "rose"} />
      <Label x={x0 + 128} y={170} text="1st look" anchor="end" size={14} weight={600} color={tones.mint.text} />
      <Label
        x={fixed ? x0 + 188 : x0 + 284}
        y={170}
        text="2nd look"
        anchor="start"
        size={14}
        weight={600}
        color={fixed ? tones.mint.text : tones.rose.text}
      />
      <Label
        x={x0 + 205}
        y={330}
        text={fixed ? "Your view only moves forward." : "You saw 3 comments, then 2."}
        size={14}
        weight={600}
        color={fixed ? tones.mint.text : tones.rose.text}
      />
    </g>
  );
}

function MonotonicReads() {
  return (
    <Diagram
      id="db-monotonic-reads"
      width={900}
      height={390}
      title="Monotonic reads: no going back in time"
      description="Left: your first look goes to follower 1 and shows 3 comments, but your second look goes to follower 2, which is further behind and shows only 2, so time seems to go backward. Right: both looks go to follower 1, so your view only moves forward."
      caption="Picking the follower from your user ID keeps you on the same one every time."
    >
      <MonotonicPanel x0={30} fixed={false} />
      <MonotonicPanel x0={460} fixed />
    </Diagram>
  );
}

export const databasesDiagrams = {
  "db-range-vs-hash": RangeVsHash,
  "db-replication-topologies": ReplicationTopologies,
  "db-consistent-hash-ring": HashRing,
  "db-replication-lag": ReplicationLag,
  "db-monotonic-reads": MonotonicReads,
};
