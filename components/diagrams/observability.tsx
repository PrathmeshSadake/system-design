import { Arrow, Box, Diagram, Group, Label, Line, Pulse, Traveler, ink, path, tones } from "./primitives";
import type { Tone } from "./primitives";

/* The trace ID rides along every hop, and every service reports its span. */
function TracePropagation() {
  const hop1 = path([220, 100], [340, 100]);
  const hop2 = path([520, 100], [640, 100]);
  const spans = [path([130, 140], [330, 250]), path([430, 140], [430, 250]), path([730, 140], [530, 250])];
  return (
    <Diagram
      id="obs-trace-propagation"
      width={860}
      height={400}
      title="One trace ID travels with the request"
      description="The front door creates trace ID 4bf9 and passes it to the payment service, which passes it to the bank service. Each service sends its own span, tagged with the same trace ID, to a trace collector that joins the spans into one waterfall picture."
      caption="The ID rides in a request header (for example the traceparent header), like a tracking number on a parcel."
    >
      <Box x={40} y={60} w={180} h={80} label="Front door" note={["creates trace", "ID 4bf9"]} tone="sky" />
      <Box x={340} y={60} w={180} h={80} label="Payment" note={["adds its own", "span"]} tone="sky" />
      <Box x={640} y={60} w={180} h={80} label="Bank" note={["adds its own", "span"]} tone="sky" />
      <Arrow d={hop1} tone="sky" />
      <Arrow d={hop2} tone="sky" />
      <Label x={280} y={76} text="trace 4bf9" size={14} weight={600} color={tones.sky.text} />
      <Label x={580} y={76} text="trace 4bf9" size={14} weight={600} color={tones.sky.text} />
      <Traveler d={hop1} dur={1.6} tone="sky" r={5} />
      <Traveler d={hop2} dur={1.6} delay={0.8} tone="sky" r={5} />

      <Box x={280} y={250} w={300} h={70} label="Trace collector" note="joins spans into one waterfall" tone="grape" />
      {spans.map((d, i) => (
        <g key={i}>
          <Arrow d={d} tone="grape" dashed />
          <Traveler d={d} dur={2.4} delay={i * 0.6} tone="grape" r={5} />
        </g>
      ))}
      <Label x={444} y={195} text="each sends its span" anchor="start" size={14} color={tones.grape.text} />
      <Label x={430} y={364} text="Every hop carries the same ID, so the pieces can be matched up later." size={14} />
    </Diagram>
  );
}

/* A waterfall of spans shows where the time went. */
function TraceWaterfall() {
  const x0 = 270;
  const rows: { name: string; indent: number; start: number; end: number; tone: Tone; note?: string }[] = [
    { name: "Checkout (front door)", indent: 0, start: 0, end: 480, tone: "sky" },
    { name: "Cart", indent: 1, start: 20, end: 80, tone: "mint" },
    { name: "Payment", indent: 1, start: 90, end: 430, tone: "grape" },
    { name: "Bank call", indent: 2, start: 110, end: 410, tone: "rose", note: "slowest" },
    { name: "Email", indent: 1, start: 440, end: 470, tone: "mint" },
  ];
  return (
    <Diagram
      id="obs-trace-waterfall"
      width={880}
      height={430}
      title="A trace waterfall"
      description="One checkout request took 480 milliseconds. Inside it, the cart span took 60 milliseconds, the payment span took 340 milliseconds, and inside payment the bank call took 300 milliseconds. A final email span took 30 milliseconds. The bank call is clearly where most of the time went."
      caption="Each bar is a span. Indented bars were called by the bar above them."
    >
      <Label x={40} y={44} text="Trace 4bf9: one checkout, five spans" anchor="start" size={15} weight={700} color={tones.slate.text} />
      {rows.map((r, i) => {
        const y = 80 + i * 52;
        const bx = x0 + r.start;
        const w = r.end - r.start;
        return (
          <g key={r.name}>
            <Label x={40 + r.indent * 20} y={y + 15} text={r.name} anchor="start" size={14} weight={600} color={tones.slate.text} />
            <rect
              x={bx}
              y={y}
              width={w}
              height={30}
              rx={6}
              fill={tones[r.tone].fill}
              stroke={tones[r.tone].stroke}
              strokeWidth={2}
              className="grow"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
            <Label
              x={bx + w + 12}
              y={y + 15}
              text={r.note ? `${w} ms, ${r.note}` : `${w} ms`}
              anchor="start"
              size={13}
              weight={r.note ? 700 : 400}
              color={r.note ? tones.rose.text : undefined}
            />
          </g>
        );
      })}
      <Line d={path([x0, 350], [x0 + 500, 350])} color={tones.slate.stroke} />
      {[0, 100, 200, 300, 400, 500].map((t) => (
        <Label key={t} x={x0 + t} y={370} text={`${t} ms`} size={13} />
      ))}
      <Label x={440} y={406} text="Long bars show where the time went. Nested bars show who called whom." size={14} />
    </Diagram>
  );
}

/* The same event written as free text and as structured fields. */
function StructuredLog() {
  const fields = [
    ["time", "2026-10-08T15:02:07Z"],
    ["level", "error"],
    ["service", "payment"],
    ["trace_id", "4bf92f3577b34da6"],
    ["user_id", "u_42"],
    ["message", "card charge failed"],
    ["duration_ms", "2140"],
  ];
  return (
    <Diagram
      id="obs-structured-log"
      width={880}
      height={480}
      title="Free text versus a structured log line"
      description="The free text line says: payment broke for user 42 again, took forever, not sure why. The structured line records the same event as named fields: time, level error, service payment, trace ID, user ID u_42, message card charge failed, and duration 2140 milliseconds. With fields, a computer can count errors per service, find every line for one trace, and chart slow payments."
      caption="Same event, two ways. Only the second one can be searched and counted reliably."
    >
      <Group x={40} y={36} w={800} h={100} label="Free text: easy for a person, hard for a computer" tone="rose" filled />
      <Label x={64} y={94} text="Payment broke for user 42 again, took forever, not sure why" anchor="start" size={15} color={ink} />

      <Group x={40} y={166} w={800} h={230} label="Structured: one named field per fact (JSON)" tone="mint" filled />
      {fields.map(([k, v], i) => (
        <g key={k}>
          <Label x={70} y={210 + i * 25} text={k} anchor="start" size={14} weight={700} color={tones.mint.text} />
          <Label x={200} y={210 + i * 25} text={v} anchor="start" size={14} color={ink} />
        </g>
      ))}
      <Box
        x={500}
        y={210}
        w={310}
        h={150}
        label="Now a computer can"
        note={["count errors per service", "find every line for", "trace 4bf92f3577b34da6", "chart slow payments"]}
        tone="white"
      />
      <Label
        x={440}
        y={430}
        text={[
          "Use the same field names in every service, and always include the trace ID.",
          "Never put passwords, card numbers or other secrets in a log.",
        ]}
        size={13}
      />
    </Diagram>
  );
}

/* SLI, SLO and SLA as a staircase, from measurement to promise. */
function SliSloSla() {
  const toGoal = path([140, 250], [140, 210], [320, 210]);
  const toPromise = path([420, 160], [420, 120], [600, 120]);
  return (
    <Diagram
      id="obs-sli-slo-sla"
      width={880}
      height={440}
      title="From measurement to goal to promise"
      description="The SLI is the measurement: the share of requests that work in under 300 milliseconds, which is 99.95 percent this month. The SLO is the team's goal: at least 99.9 percent over 30 days. The SLA is the promise to customers: at least 99.5 percent a month or they get money back. Each step is set a little looser than the one before."
      caption="Like a spelling test: your score, your own goal, and the deal you made with your parents."
    >
      <Box x={40} y={250} w={240} h={100} label="SLI: the measurement" note={["share of requests that", "work in under 300 ms", "this month: 99.95%"]} tone="sky" />
      <Box x={320} y={160} w={240} h={100} label="SLO: the goal" note={["at least 99.9% good,", "over 30 days,", "kept inside the team"]} tone="mint" />
      <Box x={600} y={70} w={240} h={100} label="SLA: the promise" note={["at least 99.5% a month,", "or customers get", "money back"]} tone="sun" />
      <Arrow d={toGoal} tone="slate" />
      <Arrow d={toPromise} tone="slate" />
      <Label x={230} y={188} text="set a goal" size={14} weight={600} color={tones.slate.text} />
      <Label x={510} y={98} text="promise a bit less" size={14} weight={600} color={tones.slate.text} />
      <Label x={160} y={372} text="like your spelling test score" size={14} />
      <Label x={440} y={282} text="like your own goal" size={14} />
      <Label x={720} y={192} text="like a deal with your parents" size={14} />
      <Label x={440} y={412} text="99.95% measured beats the 99.9% goal, which sits safely above the 99.5% promise." size={13} />
    </Diagram>
  );
}

/* Error budget burning down over a 30 day window. */
function ErrorBudget() {
  const x = (d: number) => 120 + d * (680 / 30);
  const y = (m: number) => 320 - m * (240 / 43.2);
  const actual: [number, number][] = [
    [0, 43.2],
    [5, 40],
    [10, 37],
    [12, 35],
    [12.3, 15],
    [18, 12],
    [20, 9],
  ];
  const pts = actual.map(([d, m]) => [x(d), y(m)] as const);
  const today = pts[pts.length - 1];
  return (
    <Diagram
      id="obs-error-budget"
      width={860}
      height={420}
      title="An error budget burning down over 30 days"
      description="A 99.9 percent goal over 30 days allows about 43.2 minutes of full downtime. A dashed line shows a steady burn rate of 1, which reaches zero exactly on day 30. The real budget falls slowly until day 12, when an outage uses 20 minutes at once. By day 20 only 9 minutes are left. The team rule says that if the budget runs out, risky launches are frozen and the team works on reliability."
      caption="99.9 percent of 30 days leaves 0.1 percent, which is about 43 minutes. A burn rate of 1 uses it up exactly at the end."
    >
      <Label x={40} y={44} text="Error budget left, in minutes" anchor="start" size={14} weight={700} color={tones.slate.text} />
      <Line d={path([120, 70], [120, 320], [800, 320])} color={tones.slate.stroke} />
      <Label x={108} y={y(43.2)} text="43.2 min" anchor="end" size={13} />
      <Label x={108} y={y(21.6)} text="21.6 min" anchor="end" size={13} />
      <Label x={108} y={y(0)} text="0 min" anchor="end" size={13} />
      {[0, 10, 20, 30].map((d) => (
        <Label key={d} x={x(d)} y={342} text={`day ${d}`} size={13} />
      ))}

      <Line d={path([x(0), y(43.2)], [x(30), y(0)])} color={tones.slate.stroke} dashed />
      <Line d={path(...pts)} color={tones.rose.stroke} width={3} />
      <circle cx={today[0]} cy={today[1]} r={6} fill={tones.rose.stroke} />
      <Pulse cx={today[0]} cy={today[1]} r={10} tone="rose" />

      <Label x={420} y={130} text={["outage on day 12:", "20 minutes used at once"]} anchor="start" size={13} weight={600} color={tones.rose.text} />
      <Label x={573} y={300} text="today: 9 minutes left" size={13} weight={600} color={tones.rose.text} />
      <Box x={620} y={80} w={200} h={90} label="Team rule" note={["if the budget runs out,", "freeze risky launches", "and fix reliability"]} size={14} tone="sun" />

      <Line d={path([120, 384], [160, 384])} color={tones.slate.stroke} dashed />
      <Label x={172} y={384} text="steady pace (burn rate 1)" anchor="start" size={13} />
      <Line d={path([460, 384], [500, 384])} color={tones.rose.stroke} width={3} />
      <Label x={512} y={384} text="budget really left" anchor="start" size={13} />
    </Diagram>
  );
}

export const observabilityDiagrams = {
  "obs-trace-propagation": TracePropagation,
  "obs-trace-waterfall": TraceWaterfall,
  "obs-structured-log": StructuredLog,
  "obs-sli-slo-sla": SliSloSla,
  "obs-error-budget": ErrorBudget,
};
