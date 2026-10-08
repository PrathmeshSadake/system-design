import { Arrow, Box, Diagram, Group, Label, Line, Pulse, Traveler, path, tones } from "./primitives";
import type { Tone } from "./primitives";

/* The FinOps loop: Inform, Optimize, Operate, and around again. */
function FinopsLoop() {
  const toOptimize = path([530, 88], [680, 88], [680, 240]);
  const toOperate = path([560, 288], [300, 288]);
  const toInform = path([180, 240], [180, 88], [330, 88]);
  return (
    <Diagram
      id="cost-finops-loop"
      width={860}
      height={400}
      title="The FinOps loop"
      description="Three phases in a circle. Inform: see who spends what using tags and showback. Optimize: spend less for the same work. Operate: budgets, alerts and good habits. Then measure again and go back to Inform."
      caption="The loop never really ends. New features bring new costs, so each lap starts by looking again."
    >
      <Box x={330} y={40} w={200} h={96} label="Inform" note={["see who spends what", "tags, showback"]} tone="sky" />
      <Box x={560} y={240} w={240} h={96} label="Optimize" note={["spend less for the", "same work"]} tone="mint" />
      <Box x={60} y={240} w={240} h={96} label="Operate" note={["budgets, alerts,", "good habits"]} tone="sun" />
      <Arrow d={toOptimize} tone="slate" />
      <Arrow d={toOperate} tone="slate" />
      <Arrow d={toInform} tone="slate" />
      <Label x={694} y={164} text="find savings" anchor="start" size={14} weight={600} color={tones.slate.text} />
      <Label x={430} y={312} text="make it routine" size={14} weight={600} color={tones.slate.text} />
      <Label x={166} y={164} text="measure again" anchor="end" size={14} weight={600} color={tones.slate.text} />
      <Label x={430} y={196} text="Go around again and again" size={15} weight={600} color={tones.grape.text} />
      <Traveler d={toOptimize} dur={2.4} tone="sun" r={5} />
      <Traveler d={toOperate} dur={2.4} delay={0.8} tone="sun" r={5} />
      <Traveler d={toInform} dur={2.4} delay={1.6} tone="sun" r={5} />
      <Label x={430} y={366} text="Engineers, finance and business people all take part." size={14} />
    </Diagram>
  );
}

/* Ways to pay for the same computer. */
function PurchaseOptions() {
  const rows = [
    {
      label: "On-demand",
      note: ["pay by the hour, stop anytime", "good for new or spiky work"],
      frac: 1,
      value: "full price",
      tone: "sun" as Tone,
    },
    {
      label: "Reserved or committed",
      note: ["promise to use it for 1 to 3 years", "good for steady, sure load"],
      frac: 0.6,
      value: "about 40 percent less",
      tone: "sky" as Tone,
    },
    {
      label: "Spot (spare)",
      note: ["may be taken back at short notice", "good for jobs that can restart"],
      frac: 0.3,
      value: "about 70 percent less",
      tone: "mint" as Tone,
    },
  ];
  const track = { x: 380, w: 300 };
  return (
    <Diagram
      id="cost-purchase-options"
      width={900}
      height={440}
      title="Three ways to pay for the same computer"
      description="On-demand computers cost full price but can be stopped anytime. Reserved or committed computers cost less in exchange for a one to three year promise. Spot computers cost much less but can be taken back at short notice."
      caption="Example numbers only. Commitments often save about 30 to 70 percent and spot can save up to about 90 percent, depending on the provider and the deal."
    >
      <Label x={track.x} y={50} text="Price for the same computer, per hour" anchor="start" size={14} weight={600} color={tones.slate.text} />
      {rows.map((r, i) => {
        const y = 76 + i * 104;
        const w = r.frac * track.w;
        return (
          <g key={r.label}>
            <Box x={40} y={y} w={300} h={86} label={r.label} note={r.note} tone={r.tone} />
            <rect x={track.x} y={y + 27} width={track.w} height={32} rx={8} fill="#ffffff" stroke="#94a3b8" strokeWidth={2} />
            <rect
              x={track.x}
              y={y + 27}
              width={w}
              height={32}
              rx={8}
              fill={tones[r.tone].fill}
              stroke={tones[r.tone].stroke}
              strokeWidth={2}
              className="grow"
              style={{ animationDelay: `${i * 0.25}s` }}
            />
            <Label x={track.x + track.w + 14} y={y + 43} text={r.value} anchor="start" size={14} />
          </g>
        );
      })}
      <Label x={450} y={404} text="Mix them: commit for the steady base, on-demand for bumps, spot for restartable jobs." size={14} />
    </Diagram>
  );
}

/* Capacity planning: forecast the peak, keep headroom, order before the lead time runs out. */
function CapacityPlan() {
  const slope = 140 / 730;
  const peakAt = (x: number) => 290 - slope * (x - 90);
  const today = 260;
  const capacity = path([90, 200], [440, 200], [440, 140], [750, 140], [750, 80], [820, 80]);
  const headroom = path([380, 202], [380, peakAt(380) - 2]);
  const lead = path([340, 300], [440, 300]);
  return (
    <Diagram
      id="cost-capacity-plan"
      width={880}
      height={390}
      title="Planning capacity ahead of the peak"
      description="A chart over time. The expected busiest load rises steadily, measured up to today and forecast after. The capacity line steps up in blocks and always stays above the peak, leaving a gap called headroom. Each new block is ordered before it is needed, because getting it takes time, called lead time."
      caption="Capacity grows in steps, so each step is ordered while there is still headroom left."
    >
      <Line d={path([90, 64], [90, 330], [820, 330])} color={tones.slate.stroke} width={2} />
      <Label x={90} y={46} text="load" size={14} weight={600} color={tones.slate.text} />
      <Label x={820} y={352} text="time (months)" anchor="end" size={14} weight={600} color={tones.slate.text} />
      <Line d={path([today, 330], [today, 76])} color="#94a3b8" width={1.5} dashed />
      <Label x={today} y={60} text="today" size={14} weight={600} color={tones.slate.text} />
      <Line d={path([90, peakAt(90)], [today, peakAt(today)])} color={tones.rose.stroke} width={3} />
      <Line d={path([today, peakAt(today)], [820, peakAt(820)])} color={tones.rose.stroke} width={3} dashed />
      <Line d={capacity} color={tones.sky.stroke} width={3} />
      <Label x={595} y={120} text="capacity we have" size={14} weight={600} color={tones.sky.text} />
      <Label x={640} y={214} text="forecast peak" anchor="start" size={14} weight={600} color={tones.rose.text} />
      <Arrow d={headroom} tone="grape" both />
      <Label x={368} y={218} text="headroom" anchor="end" size={13} weight={600} color={tones.grape.text} />
      <Arrow d={lead} tone="sun" both />
      <Label x={390} y={282} text="lead time: order early" size={14} weight={600} color={tones.sun.text} />
      <Pulse cx={440} cy={200} r={8} tone="sky" />
    </Diagram>
  );
}

/* Active-active headroom: 2 regions vs 3 regions, before and after one fails. */
function ActiveActive() {
  const barTop = 116;
  const barH = 160;
  const panels = [
    { title: "2 regions: each may be at most 50% busy", normal: [50, 50], failed: [null, 100], w: 56, gap: 24 },
    { title: "3 regions: each may be at most 67% busy", normal: [67, 67, 67], failed: [null, 100, 100], w: 44, gap: 14 },
  ];
  const names = ["A", "B", "C"];
  function Bars({ cx, values, w, gap }: { cx: number; values: (number | null)[]; w: number; gap: number }) {
    const total = values.length * w + (values.length - 1) * gap;
    return (
      <>
        {values.map((v, i) => {
          const x = cx - total / 2 + i * (w + gap);
          const down = v === null;
          const h = down ? 0 : (v / 100) * barH;
          const full = v === 100;
          return (
            <g key={i}>
              <rect
                x={x}
                y={barTop}
                width={w}
                height={barH}
                rx={6}
                fill={down ? tones.rose.fill : "#ffffff"}
                stroke={down ? tones.rose.stroke : "#94a3b8"}
                strokeWidth={2}
                strokeDasharray={down ? "6 5" : undefined}
                className={down ? "blink" : undefined}
              />
              {!down ? (
                <rect
                  x={x}
                  y={barTop + barH - h}
                  width={w}
                  height={h}
                  rx={6}
                  fill={full ? tones.sun.fill : tones.sky.fill}
                  stroke={full ? tones.sun.stroke : tones.sky.stroke}
                  strokeWidth={2}
                />
              ) : null}
              <Label
                x={x + w / 2}
                y={barTop - 16}
                text={down ? "down" : `${v}%`}
                size={14}
                weight={700}
                color={down ? tones.rose.text : full ? tones.sun.text : tones.sky.text}
              />
              <Label x={x + w / 2} y={barTop + barH + 20} text={names[i]} size={14} weight={600} color={tones.slate.text} />
            </g>
          );
        })}
      </>
    );
  }
  return (
    <Diagram
      id="cost-active-active"
      width={900}
      height={390}
      title="How much spare room active-active needs"
      description="With two regions, each normally runs at 50 percent. When one goes down, the other jumps to 100 percent. With three regions, each normally runs at about 67 percent. When one goes down, the other two each jump to 100 percent."
      caption="These are ceilings. Real teams stay a bit below them so the survivors are not completely full after a failure."
    >
      {panels.map((p, i) => {
        const px = 30 + i * 435;
        return (
          <g key={p.title}>
            <Group x={px} y={30} w={405} h={290} label={p.title} />
            <Label x={px + 105} y={76} text="Normal day" size={14} weight={600} color={tones.slate.text} />
            <Label x={px + 300} y={76} text="One region fails" size={14} weight={600} color={tones.slate.text} />
            <Bars cx={px + 105} values={p.normal} w={p.w} gap={p.gap} />
            <Bars cx={px + 300} values={p.failed} w={p.w} gap={p.gap} />
          </g>
        );
      })}
      <Label x={450} y={350} text="Rule: with N regions, keep each one at most (N minus 1) out of N busy." size={14} />
    </Diagram>
  );
}

/* Storage tiers as a ladder: hot at the top, archive at the bottom. */
function StorageLadder() {
  const tiers = [
    { label: "Hot", note: ["the fridge", "instant, costs most"], tone: "rose" as Tone },
    { label: "Warm", note: ["the pantry", "quick, costs less"], tone: "sun" as Tone },
    { label: "Cold", note: ["the attic", "slow, cheap to keep"], tone: "sky" as Tone },
    { label: "Archive", note: ["across town", "hours to get back"], tone: "grape" as Tone },
  ];
  const moves = ["after 30 days", "after 90 days", "after a year"];
  return (
    <Diagram
      id="cost-storage-ladder"
      width={900}
      height={412}
      title="The storage ladder"
      description="Four storage tiers step down like a ladder. Hot storage is like the fridge: instant but most expensive. Warm is the pantry. Cold is the attic: slow but cheap to keep. Archive is a storage unit across town: cheapest to keep but hours to get things back. Data moves down after 30 days, 90 days and a year."
      caption="Lifecycle rules move data down the ladder automatically as it gets older. The day counts are only examples."
    >
      {tiers.map((t, i) => {
        const x = 40 + i * 205;
        const y = 40 + i * 90;
        return <Box key={t.label} x={x} y={y} w={190} h={72} label={t.label} note={t.note} tone={t.tone} />;
      })}
      {moves.map((m, i) => {
        const x = 40 + i * 205;
        const y = 40 + i * 90;
        const d = path([x + 190, y + 36], [x + 260, y + 36], [x + 260, y + 90]);
        return (
          <g key={m}>
            <Arrow d={d} tone="slate" />
            <Traveler d={d} dur={2} delay={i * 0.6} tone="sun" r={5} />
            <Label x={x + 274} y={y + 63} text={m} anchor="start" size={14} />
          </g>
        );
      })}
      <Label
        x={860}
        y={60}
        anchor="end"
        text={["Up the ladder:", "faster to reach,", "costs more to keep"]}
        size={14}
        weight={600}
        color={tones.rose.text}
      />
      <Label
        x={40}
        y={300}
        anchor="start"
        text={["Down the ladder:", "cheaper to keep,", "slower and pricier to get back"]}
        size={14}
        weight={600}
        color={tones.grape.text}
      />
    </Diagram>
  );
}

export const costDiagrams = {
  "cost-finops-loop": FinopsLoop,
  "cost-purchase-options": PurchaseOptions,
  "cost-capacity-plan": CapacityPlan,
  "cost-active-active": ActiveActive,
  "cost-storage-ladder": StorageLadder,
};
