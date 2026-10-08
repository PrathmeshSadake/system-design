import { Arrow, Box, Diagram, Group, Label, Pulse, Traveler, path, tones } from "./primitives";

/* Strangler fig: a router in front, features move one at a time, the old app retires. */
function StranglerStages() {
  const stages = [
    { title: "Stage 1: start", old: "4 features", next: "0 features", toOld: true, toNew: false, retired: false },
    { title: "Stage 2: halfway", old: "2 features", next: "2 features", toOld: true, toNew: true, retired: false },
    { title: "Stage 3: done", old: "switched off", next: "4 features", toOld: false, toNew: true, retired: true },
  ];
  return (
    <Diagram
      id="migr-strangler"
      width={900}
      height={390}
      title="The strangler fig in three stages"
      description="A router sits in front of the old app and the new app. At the start, the old app handles all four features. Halfway, each app handles two features. At the end, the new app handles all four and the old app is switched off."
      caption="The router decides where each request goes. Moving a feature, or moving it back, is just a change to the router."
    >
      {stages.map((s, i) => {
        const px = 30 + i * 285;
        const toOld = path([px + 105, 134], [px + 70, 210]);
        const toNew = path([px + 165, 134], [px + 200, 210]);
        return (
          <g key={s.title}>
            <Group x={px} y={30} w={270} h={290} label={s.title} />
            <Box x={px + 45} y={74} w={180} h={60} label="Router" note="checks each request" tone="sky" />
            <Box
              x={px + 12}
              y={210}
              w={116}
              h={84}
              label="Old app"
              note={s.old}
              tone={s.retired ? "slate" : "sun"}
              dashed={s.retired}
            />
            <Box x={px + 142} y={210} w={116} h={84} label="New app" note={s.next} tone="mint" dashed={!s.toNew} />
            {s.toOld ? (
              <>
                <Arrow d={toOld} tone="sun" />
                <Traveler d={toOld} dur={1.8} tone="sun" r={5} />
              </>
            ) : null}
            {s.toNew ? (
              <>
                <Arrow d={toNew} tone="mint" />
                <Traveler d={toNew} dur={1.8} delay={0.6} tone="mint" r={5} />
              </>
            ) : null}
          </g>
        );
      })}
      <Label x={450} y={352} text="Move one feature at a time. If a move goes badly, point the router back." size={14} />
    </Diagram>
  );
}

/* During a rolling update, old and new servers share one database. */
function MixedVersions() {
  const servers = [0, 1, 2, 3, 4].map((i) => ({
    x: 72 + i * 156,
    old: i < 3,
    end: 330 + i * 60,
  }));
  return (
    <Diagram
      id="migr-mixed-versions"
      width={900}
      height={380}
      title="Old and new versions share the same data"
      description="During a rolling update, three servers still run version one of the app and two already run version two. All five read and write the same shared database, which has both a price field and a new price_cents field. Version one reads and writes price only. Version two writes both fields and still reads price."
      caption="The release being rolled out here starts filling in price_cents. Old servers ignore the new field, new ones fill it in."
    >
      <Group x={50} y={30} w={800} h={130} label="Rolling update: servers are swapped a few at a time" />
      {servers.map((s, i) => {
        const d = path([s.x + 66, 134], [s.end, 250]);
        return (
          <g key={i}>
            <Box
              x={s.x}
              y={70}
              w={132}
              h={64}
              label={s.old ? "Old app" : "New app"}
              note={s.old ? "version 1" : "version 2"}
              tone={s.old ? "sun" : "mint"}
            />
            <Arrow d={d} tone={s.old ? "sun" : "mint"} both />
            <Traveler d={d} dur={2.2} delay={i * 0.4} tone={s.old ? "sun" : "mint"} r={4} />
          </g>
        );
      })}
      <Box x={300} y={250} w={300} h={84} label="Shared database" note="has price and price_cents" tone="grape" />
      <Label
        x={282}
        y={282}
        anchor="end"
        text={["Version 1 reads and", "writes price only"]}
        size={14}
        weight={600}
        color={tones.sun.text}
      />
      <Label
        x={618}
        y={282}
        anchor="start"
        text={["Version 2 writes both,", "still reads price"]}
        size={14}
        weight={600}
        color={tones.mint.text}
      />
    </Diagram>
  );
}

/* Expand and contract, six releases grouped into three phases. */
function ExpandContract() {
  const phases = [
    {
      name: "Expand",
      steps: [
        { label: "1. Add new field", note: ["add price_cents,", "empty for now"], tone: "mint" as const },
        { label: "2. Write both", note: ["each save fills price", "and price_cents"], tone: "mint" as const },
      ],
    },
    {
      name: "Migrate",
      steps: [
        { label: "3. Backfill", note: ["fill price_cents", "for all old rows"], tone: "sky" as const },
        { label: "4. Read new", note: ["the app now trusts", "price_cents"], tone: "sky" as const },
      ],
    },
    {
      name: "Contract",
      steps: [
        { label: "5. Stop old writes", note: ["nothing updates", "price anymore"], tone: "sun" as const },
        { label: "6. Remove old", note: ["delete the price", "field for good"], tone: "rose" as const },
      ],
    },
  ];
  return (
    <Diagram
      id="migr-expand-contract"
      width={900}
      height={460}
      title="Expand and contract, step by step"
      description="Six small releases in three phases. Expand: add the new price_cents field, then write both fields. Migrate: backfill old rows, then switch reads to the new field. Contract: stop writing the old price field, then remove it."
      caption="Example: moving from a price field in dollars to a new price_cents field. Each box is one small release."
    >
      {phases.map((p, i) => {
        const gx = 40 + i * 280;
        const down = path([gx + 130, 184], [gx + 130, 250]);
        const across = path([gx + 235, 300], [gx + 270, 300], [gx + 270, 134], [gx + 305, 134]);
        return (
          <g key={p.name}>
            <Group x={gx} y={30} w={260} h={350} label={p.name} />
            <Box x={gx + 25} y={84} w={210} h={100} label={p.steps[0].label} note={p.steps[0].note} tone={p.steps[0].tone} />
            <Box x={gx + 25} y={250} w={210} h={100} label={p.steps[1].label} note={p.steps[1].note} tone={p.steps[1].tone} />
            <Arrow d={down} tone="slate" />
            <Traveler d={down} dur={1.6} delay={i * 0.7} tone="sun" r={5} />
            {i < 2 ? (
              <>
                <Arrow d={across} tone="slate" />
                <Traveler d={across} dur={2.6} delay={i * 0.7} tone="sun" r={5} />
              </>
            ) : null}
          </g>
        );
      })}
      <Label
        x={450}
        y={410}
        text={[
          "Every step is its own release, and both app versions work after each one.",
          "Only step 6 is hard to undo, so wait until nothing reads price.",
        ]}
        size={14}
      />
    </Diagram>
  );
}

/* Blue-green: two identical environments, the router flips between them. */
function BlueGreen() {
  const panels = [
    {
      title: "Before: blue is live",
      blue: ["version 1", "serving everyone"],
      green: ["version 2", "tested, no users"],
      live: "blue" as const,
    },
    {
      title: "After the switch: green is live",
      blue: ["version 1", "kept for undo"],
      green: ["version 2", "serving everyone"],
      live: "green" as const,
    },
  ];
  return (
    <Diagram
      id="migr-blue-green"
      width={900}
      height={430}
      title="Blue-green deployment"
      description="Two panels. Before the switch, users go through the router to the blue copy running version one, while the green copy running version two is tested with no users. After the switch, the router sends everyone to green, and blue is kept ready so the team can switch back."
      caption="The switch moves all traffic at once. Going back is the same switch in reverse."
    >
      {panels.map((p, i) => {
        const px = 30 + i * 435;
        const toRouter = path([px + 202, 118], [px + 202, 158]);
        const toLive =
          p.live === "blue" ? path([px + 170, 206], [px + 105, 250]) : path([px + 234, 206], [px + 300, 250]);
        return (
          <g key={p.title}>
            <Group x={px} y={30} w={405} h={320} label={p.title} />
            <Box x={px + 122} y={70} w={160} h={48} label="Users" tone="slate" />
            <Box x={px + 122} y={158} w={160} h={48} label="Router" tone="slate" />
            <Box x={px + 20} y={250} w={170} h={76} label="Blue" note={p.blue} tone="sky" dashed={p.live !== "blue"} />
            <Box x={px + 215} y={250} w={170} h={76} label="Green" note={p.green} tone="mint" dashed={p.live !== "green"} />
            <Arrow d={toRouter} tone="slate" />
            <Arrow d={toLive} tone={p.live === "blue" ? "sky" : "mint"} />
            <Traveler d={toRouter} dur={1.4} tone="slate" r={5} />
            <Traveler d={toLive} dur={1.4} delay={0.7} tone={p.live === "blue" ? "sky" : "mint"} r={5} />
            {i === 1 ? <Pulse cx={px + 202} cy={182} r={14} tone="mint" /> : null}
          </g>
        );
      })}
      <Label
        x={450}
        y={382}
        text={[
          "To undo, flip the router back to blue. Both colors share one database,",
          "so data changes must work for both versions.",
        ]}
        size={14}
      />
    </Diagram>
  );
}

/* Canary: a small slice goes to the new version and a watcher compares. */
function CanarySplit() {
  const toRouter = path([160, 160], [210, 160]);
  const toOld = path([360, 145], [430, 100]);
  const toNew = path([360, 175], [430, 220]);
  const oldToWatch = path([620, 82], [700, 140]);
  const newToWatch = path([620, 238], [700, 180]);
  return (
    <Diagram
      id="migr-canary-split"
      width={900}
      height={345}
      title="A canary gets a small slice of users"
      description="Users reach a router. The router sends 95 of every 100 users to the old version and 5 of every 100 to the new version, called the canary. A watcher compares errors and speed between the two."
      caption="The comparison is fair because both versions serve the same kind of users at the same time."
    >
      <Box x={40} y={128} w={120} h={64} label="Users" tone="slate" />
      <Box x={210} y={128} w={150} h={64} label="Router" note="splits traffic" tone="sky" />
      <Box x={430} y={40} w={190} h={84} label="Old version" note="95 of 100 users" tone="sun" />
      <Box x={430} y={196} w={190} h={84} label="New version" note={["the canary:", "5 of 100 users"]} tone="mint" />
      <Box x={700} y={118} w={160} h={84} label="Watcher" note={["compares errors", "and speed"]} tone="grape" />
      <Arrow d={toRouter} tone="slate" />
      <Arrow d={toOld} tone="sun" width={3} />
      <Arrow d={toNew} tone="mint" />
      <Arrow d={oldToWatch} tone="grape" dashed />
      <Arrow d={newToWatch} tone="grape" dashed />
      <Traveler d={toOld} dur={1.2} tone="sun" r={5} />
      <Traveler d={toOld} dur={1.2} delay={0.6} tone="sun" r={5} />
      <Traveler d={toNew} dur={2.4} tone="mint" r={5} />
      <Label x={450} y={308} text="Worse than the old version? The router sends everyone back." size={14} />
    </Diagram>
  );
}

/* Canary ramp: 1, 5, 25, then 100 percent, with a rollback exit at every step. */
function CanaryRamp() {
  const steps = [1, 5, 25, 100];
  const track = { x: 120, w: 330 };
  const targets = [155, 185, 215, 245];
  return (
    <Diagram
      id="migr-canary-ramp"
      width={900}
      height={390}
      title="Widening the canary step by step"
      description="Four steps. Step one sends 1 percent of users to the new version, step two 5 percent, step three 25 percent and step four 100 percent. Between steps the team waits and checks. If the new version is worse at any step, everyone goes back to the old version right away."
      caption="Bars are drawn to scale, which is why the 1 percent step is only a sliver."
    >
      {steps.map((pct, i) => {
        const y = 70 + i * 72;
        const w = Math.max(5, (pct / 100) * track.w);
        const back = path([620, y + 18], [690, targets[i]]);
        const next = path([520, y + 38], [520, y + 70]);
        return (
          <g key={pct}>
            <Label x={40} y={y + 18} text={`Step ${i + 1}`} anchor="start" size={15} weight={600} color={tones.slate.text} />
            <rect x={track.x} y={y} width={track.w} height={36} rx={8} fill="#ffffff" stroke="#94a3b8" strokeWidth={2} />
            <rect
              x={track.x}
              y={y}
              width={w}
              height={36}
              rx={pct === 100 ? 8 : 4}
              fill={tones.mint.fill}
              stroke={tones.mint.stroke}
              strokeWidth={2}
              className="grow"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
            <Box x={470} y={y - 2} w={150} h={40} label={`${pct} percent`} size={14} tone="mint" />
            <Arrow d={back} tone="rose" dashed />
            {i < 3 ? (
              <>
                <Arrow d={next} tone="mint" />
                <Label x={534} y={y + 54} text="healthy" anchor="start" size={13} color={tones.mint.text} />
              </>
            ) : null}
          </g>
        );
      })}
      <Box
        x={690}
        y={130}
        w={170}
        h={140}
        label={["Worse than", "the old one?"]}
        note={["roll back to", "0 percent", "right away"]}
        tone="rose"
      />
      <Label x={285} y={44} text="Share of users on the new version" size={14} weight={600} color={tones.slate.text} />
      <Label x={450} y={356} text="Between steps, wait and compare error rate and speed with the old version." size={14} />
    </Diagram>
  );
}

export const migrationsDiagrams = {
  "migr-strangler": StranglerStages,
  "migr-mixed-versions": MixedVersions,
  "migr-expand-contract": ExpandContract,
  "migr-blue-green": BlueGreen,
  "migr-canary-split": CanarySplit,
  "migr-canary-ramp": CanaryRamp,
};
