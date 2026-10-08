import { Arrow, Box, Diagram, Group, Label, Line, Traveler, path, tones, type Tone } from "./primitives";

/** One row of a scoreboard: a rounded strip with a place, a name and a score written on it. */
function ScoreRow({
  x,
  y,
  w,
  place,
  name,
  score,
  tone = "white",
  blink = false,
}: {
  x: number;
  y: number;
  w: number;
  place: string;
  name: string;
  score: string;
  tone?: Tone;
  blink?: boolean;
}) {
  const c = tones[tone];
  const h = 40;
  return (
    <g data-allow-text="" className={blink ? "blink" : undefined}>
      <g data-box="">
        <rect x={x} y={y} width={w} height={h} rx={10} fill={c.fill} stroke={c.stroke} strokeWidth={2} />
      </g>
      <Label x={x + 18} y={y + h / 2} text={place} anchor="start" size={14} color={c.text} />
      <Label x={x + 72} y={y + h / 2} text={name} anchor="start" size={15} weight={700} color={c.text} />
      <Label x={x + w - 18} y={y + h / 2} text={score} anchor="end" size={15} weight={700} color={c.text} />
    </g>
  );
}

function LeaderboardArchitecture() {
  const gy = [104, 184, 264];
  const lbToPlayers = path([190, 184], [136, 184]);
  const gwToLb = gy.map((y, i) => path([400, y], [300, 170 + i * 14]));
  const pubToGw = gy.map((y) => path([680, 184], [540, y]));
  const answers = path([86, 234], [86, 410]);
  const toQueue = path([186, 445], [266, 445]);
  const toService = path([416, 445], [496, 445]);
  const toRedis = path([646, 445], [726, 445]);
  const publish = path([571, 410], [571, 370], [770, 370], [770, 224]);
  return (
    <Diagram
      id="leaderboard-architecture"
      width={900}
      height={520}
      title="How scores flow in and the top 10 flows out"
      description="Players send answers to a game server, which puts score events in a queue. A score service takes events from the queue and adds points in a Redis sorted set. Once a second the score service publishes the top 10 on a pub/sub channel. Every WebSocket gateway hears it and pushes it through the load balancer to its own players."
      caption="Answers travel down and to the right into the sorted set. Once a second the top 10 travels up through pub/sub to every gateway, and each gateway pushes it to its own players."
    >
      <Box x={36} y={134} w={100} h={100} label="Players" note={["1 million", "tablets"]} tone="sun" />
      <Box x={190} y={149} w={110} h={70} label={["Load", "balancer"]} tone="slate" />
      <Group x={380} y={30} w={180} h={290} label="WebSocket gateways" tone="sky" />
      {["Gateway A", "Gateway B", "Gateway C"].map((g, i) => (
        <Box key={g} x={400} y={gy[i] - 30} w={140} h={60} label={g} note="many lines" tone="sky" />
      ))}
      <Box x={680} y={144} w={180} h={80} label="Pub/sub channel" note={["same news to", "every gateway"]} tone="grape" />

      <Box x={36} y={410} w={150} h={70} label="Game server" note="checks answers" tone="slate" />
      <Box x={266} y={410} w={150} h={70} label="Score queue" note="slips wait here" tone="slate" />
      <Box x={496} y={410} w={150} h={70} label="Score service" note="adds points" tone="mint" />
      <Box x={726} y={410} w={140} h={70} label={["Redis", "sorted set"]} tone="rose" />

      <Arrow d={lbToPlayers} tone="slate" both />
      {gwToLb.map((d) => (
        <Arrow key={d} d={d} tone="slate" both />
      ))}
      {pubToGw.map((d) => (
        <Arrow key={d} d={d} tone="grape" />
      ))}
      <Arrow d={answers} tone="sun" />
      <Arrow d={toQueue} tone="slate" />
      <Arrow d={toService} tone="slate" />
      <Arrow d={toRedis} tone="rose" />
      <Arrow d={publish} tone="grape" />

      <Label x={98} y={322} text="answers" anchor="start" size={14} weight={600} color={tones.sun.text} />
      <Label x={686} y={423} text="ZINCRBY" size={14} weight={600} color={tones.rose.text} />
      <Label x={756} y={297} text="top 10, once a second" anchor="end" size={14} weight={600} color={tones.grape.text} />

      <Traveler d={answers} dur={2.4} tone="sun" r={5} />
      <Traveler d={toQueue} dur={1.6} delay={0.4} tone="sun" r={5} />
      <Traveler d={toService} dur={1.6} delay={0.9} tone="sun" r={5} />
      <Traveler d={toRedis} dur={1.6} delay={1.3} tone="rose" r={5} />
      <Traveler d={publish} dur={3} tone="grape" r={5} />
      {pubToGw.map((d, i) => (
        <Traveler key={d} d={d} dur={2} delay={i * 0.15} tone="grape" r={5} />
      ))}
      {gwToLb.map((d, i) => (
        <Traveler key={d} d={d} dur={2} delay={1 + i * 0.15} tone="grape" r={5} />
      ))}
      <Traveler d={lbToPlayers} dur={1.2} tone="grape" r={5} />
    </Diagram>
  );
}

function LeaderboardSortedSet() {
  const before = [
    ["Leo", "120"],
    ["Ana", "110"],
    ["Sam", "95"],
    ["Kai", "90"],
    ["Mia", "85"],
    ["Zoe", "70"],
  ];
  const after = [
    ["Leo", "120"],
    ["Mia", "115"],
    ["Ana", "110"],
    ["Sam", "95"],
    ["Kai", "90"],
    ["Zoe", "70"],
  ];
  const places = ["1st", "2nd", "3rd", "4th", "5th", "6th"];
  const rowY = (i: number) => 80 + i * 50;
  const inArrow = path([300, 300], [330, 300], [330, 245], [360, 245]);
  const outArrow = path([520, 205], [550, 205], [550, 150], [580, 150]);
  return (
    <Diagram
      id="leaderboard-sorted-set"
      width={880}
      height={480}
      title="A sorted set keeps itself in order"
      description="Before the update, Mia is in fifth place with 85 points. The command ZINCRBY adds 30 points to Mia. After the update, Mia has 115 points and the sorted set has moved Mia to second place, while everyone else keeps their order."
      caption="Only Mia's entry is moved. The players Mia passed slide down one place without anyone rewriting them."
    >
      <Label x={170} y={50} text="Before" size={15} weight={700} color={tones.slate.text} />
      <Label x={710} y={50} text="After" size={15} weight={700} color={tones.slate.text} />
      {before.map(([n, s], i) => (
        <ScoreRow key={`b-${n}`} x={40} y={rowY(i)} w={260} place={places[i]} name={n} score={s} tone={n === "Mia" ? "sun" : "white"} />
      ))}
      {after.map(([n, s], i) => (
        <ScoreRow
          key={`a-${n}`}
          x={580}
          y={rowY(i)}
          w={260}
          place={places[i]}
          name={n}
          score={s}
          tone={n === "Mia" ? "mint" : "white"}
          blink={n === "Mia"}
        />
      ))}
      <Box x={360} y={180} w={160} h={90} label="ZINCRBY" note={["board 30 mia", "Mia gets 30"]} tone="grape" />
      <Arrow d={inArrow} tone="grape" />
      <Arrow d={outArrow} tone="grape" />
      <Traveler d={inArrow} dur={2} tone="grape" r={5} />
      <Traveler d={outArrow} dur={2} delay={1} tone="grape" r={5} />
      <Label x={170} y={404} text="Mia is 5th. ZREVRANK says 4." size={14} />
      <Label x={710} y={404} text="Mia is 2nd. ZREVRANK says 1." size={14} />
      <Label x={440} y={446} text="Places are counted from 0, so the app adds 1 before showing them." size={14} />
    </Diagram>
  );
}

/** Spreads score change ticks over the timeline in a fixed, natural looking pattern. */
function tickPositions(count: number, from: number, to: number) {
  const xs: number[] = [];
  let seed = 7;
  for (let i = 0; i < count; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    const jitter = (seed / 233280 - 0.5) * 9;
    xs.push(from + ((to - from) * (i + 0.5)) / count + jitter);
  }
  return xs;
}

function LeaderboardThrottle() {
  const x0 = 230;
  const sec = 180;
  const at = (s: number) => x0 + s * sec;
  const axis = path([at(0), 170], [at(3), 170]);
  const pushes = [
    { s: 1, label: "Push", note: "new top 10", tone: "mint" as const, dashed: false },
    { s: 2, label: "Skip", note: "no change", tone: "slate" as const, dashed: true },
    { s: 3, label: "Push", note: "new top 10", tone: "mint" as const, dashed: false },
  ];
  return (
    <Diagram
      id="leaderboard-throttle"
      width={880}
      height={400}
      title="Many score changes, few messages"
      description="Over three seconds, dozens of score changes arrive. The top 10 is sent to players only once a second, and the message is skipped when the top 10 did not change. Each player's own place is sent separately, when they open the board or every few seconds."
      caption="The flood of score changes stays inside the system. Players get a calm, steady beat of news."
    >
      <Label x={40} y={84} text={["Score changes", "thousands a second"]} anchor="start" size={14} weight={600} color={tones.sun.text} />
      {tickPositions(46, at(0) + 4, at(3) - 4).map((x) => (
        <Line key={x} d={path([x, 76], [x, 116])} color={tones.sun.stroke} width={2} />
      ))}
      <Line d={axis} color="#94a3b8" width={2} />
      {[0, 1, 2, 3].map((s) => (
        <g key={s}>
          <Line d={path([at(s), 163], [at(s), 177])} color="#94a3b8" width={2} />
          <Label x={at(s)} y={194} text={`${s} s`} size={14} />
        </g>
      ))}
      <Traveler d={axis} dur={6} tone="slate" r={5} />

      <Label x={40} y={244} text={["Top 10 to players", "once a second at most"]} anchor="start" size={14} weight={600} color={tones.mint.text} />
      {pushes.map((p) => (
        <Box key={p.s} x={at(p.s) - 60} y={222} w={120} h={60} label={p.label} note={p.note} tone={p.tone} dashed={p.dashed} />
      ))}

      <Label x={40} y={334} text={["Your own place", "sent less often"]} anchor="start" size={14} weight={600} color={tones.sky.text} />
      <Box x={at(0.45) - 80} y={312} w={160} h={60} label="Your place" note="when you look" tone="sky" />
      <Box x={at(3) - 80} y={312} w={160} h={60} label="Your place" note="every few seconds" tone="sky" />
    </Diagram>
  );
}

function LeaderboardShardMerge() {
  const shards = [
    { name: "Shard 1", top: "Leo 120, Ana 99, Ben 97" },
    { name: "Shard 2", top: "Mia 118, Tom 96, Ivy 90" },
    { name: "Shard 3", top: "Kai 115, Zoe 112, Max 101" },
  ];
  const ends = [175, 200, 225];
  const arrows = shards.map((_, i) => path([300, 110 + i * 100], [380, ends[i]]));
  const toResult = path([540, 200], [620, 200]);
  return (
    <Diagram
      id="leaderboard-shard-merge"
      width={880}
      height={420}
      title="Merging each shard's top 3 into the global top 3"
      description="Players are split across three shards. Each shard reports its own top three players. A merge step picks the best three of those nine, giving Leo with 120, Mia with 118 and Kai with 115 as the global top three."
      caption="This is exact for the top of the board, because anyone in the true top 3 is also in the top 3 of their own shard."
    >
      <Label x={170} y={44} text="Each shard sends its own top 3" size={14} weight={600} color={tones.slate.text} />
      {shards.map((s, i) => (
        <Box key={s.name} x={40} y={70 + i * 100} w={260} h={80} label={s.name} note={s.top} tone="sky" />
      ))}
      <Box x={380} y={150} w={160} h={100} label="Merge" note={["pick the best", "3 of these 9"]} tone="grape" />
      <Box x={620} y={140} w={220} h={120} label="Global top 3" note={["Leo 120", "Mia 118", "Kai 115"]} tone="mint" />
      {arrows.map((d, i) => (
        <g key={d}>
          <Arrow d={d} tone="slate" />
          <Traveler d={d} dur={2} delay={i * 0.4} tone="sky" r={5} />
        </g>
      ))}
      <Arrow d={toResult} tone="mint" />
      <Traveler d={toResult} dur={1.4} delay={0.6} tone="mint" r={5} />
      <Label x={440} y={384} text="Every player lives in exactly one shard, so nobody is counted twice." size={14} />
    </Diagram>
  );
}

export const leaderboardDiagrams = {
  "leaderboard-architecture": LeaderboardArchitecture,
  "leaderboard-sorted-set": LeaderboardSortedSet,
  "leaderboard-throttle": LeaderboardThrottle,
  "leaderboard-shard-merge": LeaderboardShardMerge,
};
