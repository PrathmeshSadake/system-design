import { Arrow, Box, Diagram, Group, Label, Line, Traveler, path, tones } from "./primitives";

/* The front door: CDN, waiting room, and early shedding. */
function Funnel() {
  const a1 = path([190, 108], [240, 108]);
  const a2 = path([410, 108], [460, 108]);
  const a3 = path([630, 108], [680, 108]);
  const shed = path([545, 156], [545, 270]);
  const gone = path([770, 156], [770, 313], [630, 313]);
  return (
    <Diagram
      id="flash-funnel"
      width={900}
      height={390}
      title="Keeping the crowd calm at the front door"
      description="A million shoppers click at ten o'clock. A CDN hands out the product page from nearby copies and turns away known bots. A waiting room lets about two thousand people a second through to the reservation service. Extra people are shed early with a polite answer, and once the stock is gone everyone gets the polite sold out answer."
      caption="Most of the crowd is answered by copies and the waiting room. Only a steady trickle ever reaches the part that changes the stock."
    >
      <Box x={40} y={60} w={150} h={96} label="Shoppers" note={["1,000,000", "clicks at 10:00"]} tone="slate" />
      <Box x={240} y={60} w={170} h={96} label="CDN" note={["sends the page", "from nearby copies"]} tone="sky" />
      <Box x={460} y={60} w={170} h={96} label="Waiting room" note={["lets in about", "2,000 a second"]} tone="grape" />
      <Box x={680} y={60} w={180} h={96} label="Reservation" note={["changes the", "stock count"]} tone="mint" />
      <Box x={460} y={270} w={170} h={86} label="Polite no" note={["sold out, or", "try again later"]} tone="rose" />
      <Arrow d={a1} tone="slate" width={4} />
      <Arrow d={a2} tone="slate" width={3} />
      <Arrow d={a3} tone="mint" />
      <Arrow d={shed} tone="rose" />
      <Arrow d={gone} tone="rose" dashed />
      <Label x={531} y={213} text="shed the extra" anchor="end" size={14} weight={600} color={tones.rose.text} />
      <Label x={756} y={214} text={["when stock", "is gone"]} anchor="end" size={14} weight={600} color={tones.rose.text} />
      <Label x={325} y={196} text={["also turns away", "known bots"]} size={14} color={tones.sky.text} />
      {[0, 0.35, 0.7].map((d) => (
        <Traveler key={`a1-${d}`} d={a1} dur={1} delay={d} tone="slate" r={4} />
      ))}
      {[0, 0.5].map((d) => (
        <Traveler key={`a2-${d}`} d={a2} dur={1} delay={d} tone="slate" r={4} />
      ))}
      <Traveler d={a3} dur={1.6} tone="mint" r={4} />
      <Traveler d={shed} dur={1.4} tone="rose" r={4} />
      <Traveler d={shed} dur={1.4} delay={0.7} tone="rose" r={4} />
    </Diagram>
  );
}

/* Read-then-write race versus one atomic check-and-take. */
function Race() {
  function Lane({ px, safe }: { px: number; safe: boolean }) {
    const ann = px + 70;
    const ctr = px + 202;
    const ben = px + 335;
    const msgs = safe
      ? [
          { from: ann, to: ctr, y: 146, text: "take 1 if any", tone: "slate" as const },
          { from: ctr, to: ann, y: 184, text: "yes, 0 left", tone: "mint" as const },
          { from: ben, to: ctr, y: 226, text: "take 1 if any", tone: "slate" as const },
          { from: ctr, to: ben, y: 264, text: "no, sold out", tone: "rose" as const },
        ]
      : [
          { from: ctr, to: ann, y: 146, text: "sees 1", tone: "slate" as const },
          { from: ctr, to: ben, y: 184, text: "sees 1", tone: "slate" as const },
          { from: ann, to: ctr, y: 226, text: "writes 0", tone: "rose" as const },
          { from: ben, to: ctr, y: 264, text: "writes 0", tone: "rose" as const },
        ];
    return (
      <g>
        <Group
          x={px}
          y={30}
          w={405}
          h={350}
          label={safe ? "Safe: check and take in one step" : "Unsafe: look, then write"}
          tone={safe ? "mint" : "rose"}
        />
        <Box x={px + 20} y={70} w={100} h={44} label="Ann" tone="sky" />
        <Box x={px + 142} y={70} w={120} h={44} label="Counter" tone="sun" />
        <Box x={px + 285} y={70} w={100} h={44} label="Ben" tone="grape" />
        {[ann, ctr, ben].map((x) => (
          <Line key={x} d={path([x, 114], [x, 284])} color="#94a3b8" width={1.5} dashed />
        ))}
        {msgs.map((m, i) => {
          const d = path([m.from, m.y], [m.to, m.y]);
          return (
            <g key={i}>
              <Arrow d={d} tone={m.tone} />
              <Label
                x={(m.from + m.to) / 2}
                y={m.y - 15}
                text={m.text}
                size={14}
                weight={600}
                color={tones[m.tone].text}
              />
            </g>
          );
        })}
        <Box
          x={px + 40}
          y={302}
          w={325}
          h={54}
          label={safe ? "1 toy, 1 happy buyer" : "2 sold, but only 1 toy"}
          tone={safe ? "mint" : "rose"}
        />
      </g>
    );
  }
  return (
    <Diagram
      id="flash-race"
      width={900}
      height={410}
      title="The oversell race and the one-step fix"
      description="Left, unsafe: Ann and Ben both look at the counter and see 1 toy left, then both write 0, so two toys are sold when only one exists. Right, safe: Ann asks the counter to take one if any are left and gets yes with 0 left. Then Ben asks the same and is told sold out."
      caption="Time runs downward. On the left, Ben looks before Ann writes, so both think the toy is theirs. On the right, each check and take is one step."
    >
      <Lane px={30} safe={false} />
      <Lane px={465} safe />
    </Diagram>
  );
}

/* Pre-allocation: stock copied into memory and split into buckets. */
function Buckets() {
  const counts = [7, 3, 0, 5, 9, 2, 6, 4, 8, 1];
  const xs = [314, 423, 532, 641, 750];
  const rows = [86, 226];
  const copy = path([210, 198], [290, 198]);
  const retry = path([580, 156], [580, 226]);
  return (
    <Diagram
      id="flash-buckets"
      width={900}
      height={400}
      title="Splitting the stock into buckets"
      description="Before the sale, the database's count of 100 toys is copied into fast memory and split into 10 buckets of 10. During the sale each bucket has its own count, for example 7, 3, 0 and 5 left. When a shopper lands on an empty bucket, the request tries another bucket."
      caption="This picture is taken in the middle of the sale. The shop only says sold out when every bucket is empty."
    >
      <Box x={40} y={150} w={170} h={96} label="Database" note={["100 toys", "the true count"]} tone="grape" />
      <Arrow d={copy} tone="grape" />
      <Traveler d={copy} dur={1.6} tone="grape" r={5} />
      <Label x={250} y={180} text="copy" size={14} weight={600} color={tones.grape.text} />
      <Label x={125} y={282} text={["copied into memory", "before the sale"]} size={14} />
      <Group x={290} y={40} w={580} h={300} label="Fast memory: 10 buckets, 10 toys each at the start" tone="sun" />
      {counts.map((n, i) => {
        const x = xs[i % 5];
        const y = rows[Math.floor(i / 5)];
        return (
          <Box
            key={i}
            x={x}
            y={y}
            w={96}
            h={70}
            label={`${n} left`}
            note={`bucket ${i + 1}`}
            tone={n === 0 ? "rose" : "sun"}
            dashed={n === 0}
          />
        );
      })}
      <Arrow d={retry} tone="rose" dashed />
      <Traveler d={retry} dur={1.4} tone="rose" r={4} />
      <Label x={594} y={191} text="empty: try another" anchor="start" size={14} weight={600} color={tones.rose.text} />
      <Label x={580} y={366} text="Shoppers spread across 10 small counters instead of crowding 1." size={14} />
    </Diagram>
  );
}

/* A reservation is a hold with a timer. */
function Hold() {
  const paid = path([220, 170], [270, 170], [270, 82], [320, 82]);
  const expired = path([220, 206], [270, 206], [270, 294], [320, 294]);
  const kept = path([540, 82], [640, 82]);
  const back = path([540, 294], [640, 294]);
  return (
    <Diagram
      id="flash-hold"
      width={900}
      height={370}
      title="A reservation is a hold with a timer"
      description="When a toy is put on hold, a ten minute timer starts. If the shopper pays in time, the order is kept. If the timer runs out, the expiry worker cancels the hold and the toy goes back into a bucket for the next shopper."
      caption="A late payment that arrives after the timer needs its own rule: reserve again if a toy is left, or refund the money."
    >
      <Box x={40} y={140} w={180} h={96} label="Toy on hold" note={["timer starts:", "10 minutes"]} tone="sky" />
      <Box x={320} y={40} w={220} h={84} label="Paid in time" note="before the timer ends" tone="mint" />
      <Box x={640} y={40} w={220} h={84} label="Order kept" note={["the toy is yours", "and is saved for good"]} tone="mint" />
      <Box x={320} y={252} w={220} h={84} label="Timer runs out" note={["the expiry worker", "cancels the hold"]} tone="sun" />
      <Box x={640} y={252} w={220} h={84} label="Toy goes back" note={["into a bucket for", "the next shopper"]} tone="sky" />
      <Arrow d={paid} tone="mint" />
      <Arrow d={expired} tone="sun" />
      <Arrow d={kept} tone="mint" />
      <Arrow d={back} tone="sky" />
      <Label x={256} y={124} text="pays" anchor="end" size={14} weight={600} color={tones.mint.text} />
      <Label x={256} y={262} text="no payment" anchor="end" size={14} weight={600} color={tones.sun.text} />
      <Traveler d={paid} dur={2} tone="mint" r={5} />
      <Traveler d={expired} dur={2} delay={1} tone="sun" r={5} />
    </Diagram>
  );
}

/* The whole design end to end. */
function Architecture() {
  const r1 = 50;
  const r2 = 200;
  const r3 = 350;
  const h = 84;
  const arrows = {
    toCdn: path([190, r1 + 42], [240, r1 + 42]),
    toRoom: path([410, r1 + 42], [460, r1 + 42]),
    shed: path([640, r1 + 42], [690, r1 + 42]),
    admit: path([550, r1 + h], [550, r2]),
    take: path([640, r2 + 42], [690, r2 + 42]),
    held: path([550, r2 + h], [550, r3]),
    save: path([460, r3 + 42], [410, r3 + 42]),
    putBack: path([775, r3], [775, r2 + h]),
  };
  return (
    <Diagram
      id="flash-architecture"
      width={900}
      height={470}
      title="The whole flash sale design"
      description="Shoppers reach a CDN, then a waiting room. The waiting room sheds extra shoppers to a polite no page and admits the rest to the reservation service. The reservation service takes one toy from the fast counters in one step, then puts the held order into a queue. The queue feeds the order database, which is the source of truth. An expiry worker puts unpaid toys back into the fast counters."
      caption="Fast counters give speed, the queue gives safety, and the database has the final word."
    >
      <Box x={40} y={r1} w={150} h={h} label="Shoppers" note={["1,000,000", "clicks"]} tone="slate" />
      <Box x={240} y={r1} w={170} h={h} label="CDN" note={["static page,", "bot checks"]} tone="sky" />
      <Box x={460} y={r1} w={180} h={h} label="Waiting room" note={["lets people in", "at a safe speed"]} tone="grape" />
      <Box x={690} y={r1} w={170} h={h} label="Polite no" note={["sold out, or", "try again later"]} tone="rose" />
      <Box x={460} y={r2} w={180} h={h} label="Reservation" note={["check and take", "in one step"]} tone="mint" />
      <Box x={690} y={r2} w={170} h={h} label="Fast counters" note={["10 buckets", "in memory"]} tone="sun" />
      <Box x={240} y={r3} w={170} h={h} label="Order database" note={["the source", "of truth"]} tone="grape" />
      <Box x={460} y={r3} w={180} h={h} label="Order queue" note={["keeps held orders", "safe in line"]} tone="sky" />
      <Box x={690} y={r3} w={170} h={h} label="Expiry worker" note={["returns unpaid", "toys after 10 min"]} tone="slate" />
      <Arrow d={arrows.toCdn} tone="slate" />
      <Arrow d={arrows.toRoom} tone="slate" />
      <Arrow d={arrows.shed} tone="rose" />
      <Arrow d={arrows.admit} tone="grape" />
      <Arrow d={arrows.take} tone="sun" />
      <Arrow d={arrows.held} tone="mint" />
      <Arrow d={arrows.save} tone="sky" />
      <Arrow d={arrows.putBack} tone="slate" dashed />
      <Label x={564} y={r1 + h + 33} text="admitted" anchor="start" size={14} weight={600} color={tones.grape.text} />
      <Label x={564} y={r2 + h + 33} text="held" anchor="start" size={14} weight={600} color={tones.mint.text} />
      <Label x={789} y={r2 + h + 33} text="puts back" anchor="start" size={14} weight={600} color={tones.slate.text} />
      <Label
        x={40}
        y={r2 + 22}
        anchor="start"
        text={["Only shoppers let in", "by the waiting room", "ever reach the stock."]}
        size={14}
      />
      <Traveler d={arrows.toCdn} dur={1} tone="slate" r={4} />
      <Traveler d={arrows.toRoom} dur={1} delay={0.5} tone="slate" r={4} />
      <Traveler d={arrows.admit} dur={1.6} tone="grape" r={4} />
      <Traveler d={arrows.held} dur={1.6} delay={0.8} tone="mint" r={4} />
      <Traveler d={arrows.save} dur={1.2} delay={0.4} tone="sky" r={4} />
    </Diagram>
  );
}

export const flashSaleDiagrams = {
  "flash-funnel": Funnel,
  "flash-race": Race,
  "flash-buckets": Buckets,
  "flash-hold": Hold,
  "flash-architecture": Architecture,
};
