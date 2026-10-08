import { Arrow, Box, Diagram, Group, Label, Line, Pulse, Traveler, path, tones } from "./primitives";

/* Waits that double after each failed try, then a stop. */
function Backoff() {
  const scale = 0.5;
  const rows = [
    { name: "Try 1 fails", ms: 100 },
    { name: "Try 2 fails", ms: 200 },
    { name: "Try 3 fails", ms: 400 },
    { name: "Try 4 fails", ms: 800 },
  ];
  return (
    <Diagram
      id="resil-backoff"
      width={820}
      height={380}
      title="Exponential backoff: each wait is twice as long"
      description="After try 1 fails the client waits 100 milliseconds, after try 2 it waits 200, after try 3 it waits 400 and after try 4 it waits 800. When try 5 also fails, it stops and reports the error instead of trying forever."
      caption="Bars are drawn to scale. Real systems also cap the wait (for example at a few seconds) so it never grows forever."
    >
      {rows.map((r, i) => {
        const y = 50 + i * 56;
        const w = r.ms * scale;
        return (
          <g key={r.name}>
            <Label x={40} y={y + 16} text={r.name} anchor="start" size={15} weight={600} color={tones.slate.text} />
            <rect
              x={200}
              y={y}
              width={w}
              height={32}
              rx={8}
              fill={tones.sun.fill}
              stroke={tones.sun.stroke}
              strokeWidth={2}
              className="grow"
              style={{ animationDelay: `${i * 0.25}s` }}
            />
            <Label x={200 + w + 14} y={y + 16} text={`wait ${r.ms} ms`} anchor="start" size={14} />
          </g>
        );
      })}
      <Label x={40} y={290} text="Try 5 fails" anchor="start" size={15} weight={600} color={tones.slate.text} />
      <Label x={200} y={290} text="stop and report the error" anchor="start" size={14} weight={600} color={tones.rose.text} />
      <Label x={410} y={340} text="Each wait is double the last, and there is a limit on the number of tries." size={14} />
    </Diagram>
  );
}

/* The same retries without and with jitter, as load arriving at the server. */
function Jitter() {
  const x = (t: number) => 120 + t * 1.7;
  const unit = 16;
  const panel = (
    top: number,
    title: string,
    tone: "rose" | "mint",
    bars: { t: number; n: number }[],
    notes: { x: number; text: string }[],
    capX: number,
    noteY: number,
  ) => {
    const base = top + 170;
    const cap = base - 3 * unit;
    return (
      <g>
        <Group x={30} y={top} w={820} h={210} label={title} tone={tone === "rose" ? "rose" : "mint"} />
        {bars.map((b, i) => (
          <rect
            key={i}
            x={x(b.t) - 12}
            y={base - b.n * unit}
            width={24}
            height={b.n * unit}
            rx={4}
            fill={tones[tone].fill}
            stroke={tones[tone].stroke}
            strokeWidth={2}
          />
        ))}
        <Line d={path([110, cap], [820, cap])} color={tones.slate.stroke} dashed width={1.5} />
        <Label x={capX} y={cap - 18} text="the most the server can handle at once" size={13} />
        <Line d={path([110, base], [820, base])} color={tones.slate.stroke} />
        {[0, 100, 200, 300, 400].map((t) => (
          <Label key={t} x={x(t)} y={base + 18} text={`${t} ms`} size={13} />
        ))}
        {notes.map((n) => (
          <Label key={n.text} x={n.x} y={top + noteY} text={n.text} size={14} weight={600} color={tones[tone].text} />
        ))}
      </g>
    );
  };
  return (
    <Diagram
      id="resil-jitter"
      width={880}
      height={540}
      title="Jitter turns a stampede into a trickle"
      description="Six clients fail at the same moment. Without jitter, all six retry at exactly 100 milliseconds and again at 300 milliseconds, making two tall spikes above what the server can handle. With full jitter, each client picks a random wait, so the retries arrive one or two at a time, always below the server's limit."
      caption="Same six clients, same hiccup. Only the waiting rule is different."
    >
      {panel(
        30,
        "Without jitter: everyone retries at the same moment",
        "rose",
        [
          { t: 100, n: 6 },
          { t: 300, n: 6 },
        ],
        [
          { x: x(100), text: "all 6 at once" },
          { x: x(300), text: "all 6 again" },
        ],
        460,
        56,
      )}
      {panel(
        270,
        "With jitter: each client waits a random amount",
        "mint",
        [
          { t: 10, n: 1 },
          { t: 30, n: 1 },
          { t: 50, n: 2 },
          { t: 70, n: 1 },
          { t: 90, n: 1 },
          { t: 170, n: 1 },
          { t: 250, n: 1 },
        ],
        [{ x: x(110), text: "spread out, one or two at a time" }],
        650,
        104,
      )}
      <Label x={440} y={512} text="Bars show how many retries reach the server at each moment." size={14} />
    </Diagram>
  );
}

/* Circuit breaker states and the rules that move between them. */
function Breaker() {
  const trip = path([260, 125], [600, 125]);
  const cool = path([700, 170], [700, 345], [530, 345]);
  const heal = path([330, 345], [160, 345], [160, 170]);
  const fail = path([480, 300], [640, 170]);
  return (
    <Diagram
      id="resil-breaker"
      width={860}
      height={460}
      title="The three states of a circuit breaker"
      description="Closed is normal: calls go through and failures are counted. Too many failures move it to open, where it fails fast without calling and uses a fallback. When a cool-down timer ends it moves to half-open and lets a few trial calls through. If they succeed it goes back to closed. If a trial call fails it goes back to open."
      caption="Closed means calls flow, like a closed circuit lets electricity flow. Open means the path is cut."
    >
      <Box x={60} y={80} w={200} h={90} label="Closed" note={["calls go through,", "failures are counted"]} tone="mint" />
      <Box x={600} y={80} w={200} h={90} label="Open" note={["fail fast, no calls,", "use a fallback"]} tone="rose" />
      <Box x={330} y={300} w={200} h={90} label="Half-open" note={["let a few", "trial calls through"]} tone="sun" />

      <Arrow d={trip} tone="rose" />
      <Label x={430} y={103} text="too many failures" size={14} weight={600} color={tones.rose.text} />
      <Arrow d={cool} tone="sun" />
      <Label x={714} y={250} text={["cool-down", "timer ends"]} anchor="start" size={14} weight={600} color={tones.sun.text} />
      <Arrow d={heal} tone="mint" />
      <Label x={146} y={250} text={["trial calls", "succeed"]} anchor="end" size={14} weight={600} color={tones.mint.text} />
      <Arrow d={fail} tone="rose" dashed />
      <Label x={540} y={212} text={["a trial", "call fails"]} anchor="end" size={14} weight={600} color={tones.rose.text} />

      <Traveler d={trip} dur={2.6} tone="rose" r={5} />
      <Traveler d={cool} dur={3.2} delay={1} tone="sun" r={5} />
      <Traveler d={heal} dur={3.2} delay={2} tone="mint" r={5} />
      <Label x={430} y={430} text="Each arrow is a rule: count failures, wait out a cool-down, then test carefully." size={14} />
    </Diagram>
  );
}

/* One shared pool versus separate pools per dependency. */
function Bulkhead() {
  const sharedWait = path([140, 170], [140, 240]);
  const weatherWait = path([555, 170], [555, 240]);
  const paymentsFlow = path([745, 170], [745, 240]);
  return (
    <Diagram
      id="resil-bulkhead"
      width={880}
      height={420}
      title="Bulkheads keep a slow service from using up every worker"
      description="On the left, one shared pool of six helpers is used for every call. The weather service is slow, so all six helpers are stuck waiting on it, and the healthy payments service cannot be called because no helper is free. On the right, weather has its own pool of three helpers and payments has its own pool of three. Only the weather helpers get stuck, and payments keeps working."
      caption="Red squares are helpers stuck waiting. Green squares are helpers free to work."
    >
      <Group x={30} y={30} w={400} h={320} label="Without bulkheads: one shared pool" tone="slate" />
      <Group x={55} y={70} w={350} h={100} label="6 helpers, all stuck waiting" tone="rose" />
      {Array.from({ length: 6 }, (_, i) => (
        <Box key={i} x={81 + i * 52} y={110} w={38} h={38} rx={8} tone="rose" />
      ))}
      <Box x={60} y={240} w={160} h={80} label="Weather" note={["slow, never", "answers"]} tone="rose" />
      <Box x={250} y={240} w={160} h={80} label="Payments" note={["healthy, but no", "helper is free"]} tone="slate" />
      <Arrow d={sharedWait} tone="rose" />
      <Label x={154} y={205} text="all 6 wait here" anchor="start" size={14} weight={600} color={tones.rose.text} />

      <Group x={450} y={30} w={400} h={320} label="With bulkheads: one pool per job" tone="slate" />
      <Group x={470} y={70} w={170} h={100} label="Weather: 3 stuck" tone="rose" />
      <Group x={660} y={70} w={170} h={100} label="Payments: 3 free" tone="mint" />
      {Array.from({ length: 3 }, (_, i) => (
        <Box key={`w${i}`} x={484 + i * 52} y={110} w={38} h={38} rx={8} tone="rose" />
      ))}
      {Array.from({ length: 3 }, (_, i) => (
        <Box key={`p${i}`} x={674 + i * 52} y={110} w={38} h={38} rx={8} tone="mint" />
      ))}
      <Box x={470} y={240} w={170} h={80} label="Weather" note={["slow, never", "answers"]} tone="rose" />
      <Box x={660} y={240} w={170} h={80} label="Payments" note={["works fine,", "helpers are free"]} tone="mint" />
      <Arrow d={weatherWait} tone="rose" />
      <Label x={569} y={205} text="3 stuck" anchor="start" size={14} weight={600} color={tones.rose.text} />
      <Arrow d={paymentsFlow} tone="mint" />
      <Label x={759} y={205} text="flowing" anchor="start" size={14} weight={600} color={tones.mint.text} />
      <Traveler d={paymentsFlow} dur={1.4} tone="mint" r={5} />

      <Label x={440} y={385} text="Like walls inside a ship: a leak floods one room, not the whole ship." size={14} />
    </Diagram>
  );
}

/* Health checks move traffic from a failed region to a healthy one. */
function Failover() {
  const enter = path([440, 90], [440, 130]);
  const toA = path([370, 200], [180, 310]);
  const toB = path([510, 200], [700, 310]);
  const copy = path([330, 350], [550, 350]);
  return (
    <Diagram
      id="resil-failover"
      width={880}
      height={500}
      title="Failing over from one region to another"
      description="Users reach a traffic director, which keeps checking the health of each region. Region A, the main region, has stopped answering, so its health check fails. The director sends traffic to region B, the backup, which has its own app and a copy of the database. Data is copied from region A to region B a little behind, so the newest changes can be lost."
      caption="Health checks notice the problem. The traffic director moves people. The copy of the data decides how much is lost."
    >
      <Box x={340} y={36} w={200} h={54} label="Users" note="from all over" tone="white" />
      <Arrow d={enter} tone="slate" />
      <Traveler d={enter} dur={1.2} tone="slate" r={5} />
      <Box x={300} y={130} w={280} h={70} label="Traffic director" note={["global load balancer or", "DNS, checks health"]} tone="sky" />

      <Arrow d={toA} tone="rose" dashed />
      <Label x={245} y={234} text={["health check", "fails"]} anchor="end" size={14} weight={600} color={tones.rose.text} />
      <Arrow d={toB} tone="mint" />
      <Label x={634} y={234} text={["traffic moves", "here instead"]} anchor="start" size={14} weight={600} color={tones.mint.text} />
      <Traveler d={toB} dur={2} delay={0.5} tone="mint" r={5} />

      <Group x={40} y={270} w={320} h={150} label="Region A" tone="rose" />
      <Box x={70} y={310} w={260} h={80} label="Main region" note={["app and database,", "stopped answering"]} tone="rose" />
      <Pulse cx={316} cy={324} r={8} tone="rose" />
      <Group x={520} y={270} w={320} h={150} label="Region B" tone="mint" />
      <Box x={550} y={310} w={260} h={80} label="Backup region" note={["app and database copy,", "now serving everyone"]} tone="mint" />

      <Arrow d={copy} tone="grape" dashed />
      <Label x={440} y={328} text="copies data" size={13} weight={600} color={tones.grape.text} />
      <Label x={440} y={372} text="a little behind" size={13} color={tones.grape.text} />

      <Label
        x={440}
        y={452}
        text={[
          "Copies run a little behind, so the newest changes can be lost. That amount is the RPO.",
          "How long the switch takes before people are served again is the RTO.",
        ]}
        size={13}
      />
    </Diagram>
  );
}

export const resiliencyDiagrams = {
  "resil-backoff": Backoff,
  "resil-jitter": Jitter,
  "resil-breaker": Breaker,
  "resil-bulkhead": Bulkhead,
  "resil-failover": Failover,
};
