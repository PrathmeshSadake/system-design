import { Arrow, Box, Diagram, Label, Traveler, path, tones } from "./primitives";

function RpsMath() {
  const boxes = [
    { x: 30, label: "1,000,000 kids", note: "each ask 10 times" },
    { x: 258, label: "10,000,000", note: "asks every day" },
    { x: 486, label: "about 100", note: "asks each second" },
    { x: 714, label: "about 300", note: "at the busy peak" },
  ];
  const steps = ["multiply by 10", "divide by 100,000", "multiply by 3"];
  return (
    <Diagram
      id="rps-math"
      width={900}
      height={280}
      title="From daily users to requests per second"
      description="One million kids asking ten times each makes ten million asks a day. Dividing by about one hundred thousand seconds gives about one hundred asks per second. Multiplying by three for the after school rush gives about three hundred."
      caption="A day really has 86,400 seconds. Rounding up to 100,000 keeps the math easy and the answer close enough."
    >
      {boxes.map((b, i) => (
        <Box key={b.label} x={b.x} y={110} w={156} h={92} label={b.label} note={b.note} tone={i === 3 ? "rose" : "sky"} />
      ))}
      {steps.map((s, i) => {
        const x1 = boxes[i].x + 156;
        const x2 = boxes[i + 1].x;
        const d = path([x1, 156], [x2, 156]);
        return (
          <g key={s}>
            <Arrow d={d} tone="slate" />
            <Label x={(x1 + x2) / 2} y={84} text={s} size={14} weight={600} color={tones.slate.text} />
            <Traveler d={d} dur={1.6} delay={i * 0.5} tone="sun" r={5} />
          </g>
        );
      })}
      <Label x={450} y={244} text="Average first, then plan for the rush." size={14} />
    </Diagram>
  );
}

function StorageGrowth() {
  const max = 1100;
  const full = 470;
  const rows = [
    { name: "One day", tb: 1, value: "about 1 TB", tone: "sky" as const },
    { name: "One month", tb: 30, value: "about 30 TB", tone: "sky" as const },
    { name: "One year", tb: 365, value: "about 365 TB", tone: "grape" as const },
    { name: "One year, 3 copies", tb: 1095, value: "about 1,100 TB", tone: "rose" as const },
  ];
  return (
    <Diagram
      id="storage-growth"
      width={860}
      height={320}
      title="How the toy box fills up"
      description="Saving one terabyte a day grows to about thirty terabytes in a month, about three hundred sixty five terabytes in a year, and about eleven hundred terabytes once three copies are kept."
      caption="1 million drawings a day at about 1 megabyte each. Keeping 3 copies for safety triples everything."
    >
      {rows.map((r, i) => {
        const y = 48 + i * 64;
        const w = Math.max(8, (r.tb / max) * full);
        return (
          <g key={r.name}>
            <Label x={32} y={y + 16} text={r.name} anchor="start" size={15} weight={600} color={tones.slate.text} />
            <rect
              x={210}
              y={y}
              width={w}
              height={32}
              rx={8}
              fill={tones[r.tone].fill}
              stroke={tones[r.tone].stroke}
              strokeWidth={2}
              className="grow"
              style={{ animationDelay: `${i * 0.25}s` }}
            />
            <Label x={210 + w + 14} y={y + 16} text={r.value} anchor="start" size={14} />
          </g>
        );
      })}
      <Label x={430} y={290} text="Bars are drawn to scale. The last one is about 1 petabyte." size={13} />
    </Diagram>
  );
}

function MemoryDisk() {
  const toMemory = path([360, 98], [190, 196]);
  const toDisk = path([460, 98], [620, 176]);
  return (
    <Diagram
      id="memory-disk"
      width={820}
      height={370}
      title="Memory is a small desk, disk is a big basement"
      description="The computer's thinking chip can grab things from memory almost instantly, but memory is small. Disk is much larger and cheaper but about a thousand times slower to reach for a random item."
      caption="Watch the two dots. The one going to memory makes many trips while the one going to disk is still walking."
    >
      <Box x={310} y={32} w={200} h={66} label="Thinking chip" note="where work happens" tone="slate" />
      <Box x={60} y={196} w={250} h={96} label="Memory (the desk)" note={["small, pricey, very fast", "forgets when power is off"]} tone="mint" />
      <Box x={480} y={176} w={300} h={136} label="Disk (the basement)" note={["huge and cheap", "slower to reach", "remembers after power off"]} tone="sun" />
      <Arrow d={toMemory} tone="mint" />
      <Arrow d={toDisk} tone="sun" />
      <Label x={250} y={128} text="grab in a blink" anchor="end" size={14} weight={600} color={tones.mint.text} />
      <Label x={566} y={118} text="about 1,000 times slower" anchor="start" size={14} weight={600} color={tones.sun.text} />
      <Traveler d={toMemory} dur={0.8} tone="mint" />
      <Traveler d={toDisk} dur={4} tone="sun" />
      <Label x={410} y={340} text="Keep the busy 20 percent of things on the desk. Keep everything in the basement." size={14} />
    </Diagram>
  );
}

export const capacityDiagrams = {
  "rps-math": RpsMath,
  "storage-growth": StorageGrowth,
  "memory-disk": MemoryDisk,
};
