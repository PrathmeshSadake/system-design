import { Arrow, Box, Diagram, Group, Label, Line, Pulse, Traveler, path, tones } from "./primitives";

function SyncVsAsync() {
  const ask = path([260, 104], [640, 104]);
  const answer = path([640, 128], [260, 128]);
  const drop = path([260, 296], [350, 296]);
  const pick = path([550, 296], [640, 296]);
  return (
    <Diagram
      id="async-sync-vs-async"
      width={900}
      height={400}
      title="Waiting on the phone versus leaving a note"
      description="On top, a phone call: you ask your friend for help and stand waiting on hold until the answer comes back. Below, a note: you drop a note in a mailbox and go to play, and your friend picks it up and reads it when ready."
      caption="On the phone you are stuck until the answer comes. With a note, the mailbox holds your message and you are free right away."
    >
      <Group x={30} y={30} w={840} h={150} label="Phone call (synchronous)" />
      <Box x={60} y={76} w={200} h={80} label="You" note={["waiting on hold,", "cannot do anything else"]} tone="sky" />
      <Box x={640} y={76} w={200} h={80} label="Friend" note="busy, then answers" tone="mint" />
      <Arrow d={ask} tone="sky" />
      <Arrow d={answer} tone="mint" />
      <Label x={450} y={83} text="Can you help me?" size={14} weight={600} color={tones.sky.text} />
      <Label x={450} y={150} text="Here is the answer." size={14} weight={600} color={tones.mint.text} />
      <Traveler d={ask} dur={3} tone="sky" r={5} />
      <Traveler d={answer} dur={3} delay={1.5} tone="mint" r={5} />

      <Group x={30} y={210} w={840} h={160} label="Note in a mailbox (asynchronous)" />
      <Box x={60} y={256} w={200} h={80} label="You" note={["drop a note,", "then go and play"]} tone="sky" />
      <Box x={350} y={256} w={200} h={80} label="Mailbox" note="keeps the note safe" tone="sun" />
      <Box x={640} y={256} w={200} h={80} label="Friend" note="reads it when ready" tone="mint" />
      <Arrow d={drop} tone="sky" />
      <Arrow d={pick} tone="sun" />
      <Label x={305} y={274} text="drop" size={14} weight={600} color={tones.sky.text} />
      <Label x={595} y={274} text="pick up" size={14} weight={600} color={tones.sun.text} />
      <Traveler d={drop} dur={1.4} tone="sky" r={5} />
      <Traveler d={pick} dur={2.6} delay={0.8} tone="sun" r={5} />
    </Diagram>
  );
}

function QueueWorkers() {
  const in1 = path([190, 136], [274, 186]);
  const in2 = path([190, 256], [274, 206]);
  const out1 = path([580, 186], [700, 92]);
  const out2 = path([580, 196], [700, 196]);
  const out3 = path([580, 206], [700, 300]);
  const back = path([785, 332], [785, 356], [519, 356], [519, 224]);
  const notes = [
    { x: 274, label: "#8" },
    { x: 346, label: "#7" },
    { x: 418, label: "#6" },
  ];
  return (
    <Diagram
      id="async-queue-workers"
      width={900}
      height={420}
      title="A message queue with competing workers"
      description="Two senders drop notes at the back of a queue. Three workers each take one note from the front. Worker 1 is doing note 4 and worker 2 is doing note 5. Worker 3 crashed while doing note 3 and never said done, so after a timeout note 3 shows up in the queue again for another worker."
      caption="Each note goes to just one worker. Worker 3 crashed before saying done, so note #3 came back and will now finish after #4 and #5. That is why order is not always kept."
    >
      <Box x={40} y={100} w={150} h={72} label="Sender 1" note="drops notes" tone="sky" />
      <Box x={40} y={220} w={150} h={72} label="Sender 2" note="drops notes" tone="sky" />

      <Group x={250} y={112} w={330} h={180} label="Queue: a line of notes" tone="sun" filled />
      {notes.map((n) => (
        <Box key={n.label} x={n.x} y={168} w={58} h={56} label={n.label} tone="white" />
      ))}
      <Box x={490} y={168} w={58} h={56} label="#3" tone="rose" dashed />
      <Label x={250} y={314} text="new notes join the back" anchor="start" size={14} />

      <Box x={700} y={60} w={170} h={64} label="Worker 1" note="doing #4" tone="mint" />
      <Box x={700} y={164} w={170} h={64} label="Worker 2" note="doing #5" tone="mint" />
      <Box x={700} y={268} w={170} h={64} label="Worker 3" note="crashed on #3" tone="rose" dashed />

      <Arrow d={in1} tone="sky" />
      <Arrow d={in2} tone="sky" />
      <Arrow d={out1} tone="mint" />
      <Arrow d={out2} tone="mint" />
      <Arrow d={out3} tone="slate" />
      <Arrow d={back} tone="rose" dashed />
      <Label x={652} y={378} text="no ack in time: #3 is shown again" size={14} weight={600} color={tones.rose.text} />

      <Traveler d={in1} dur={2.2} tone="sky" r={5} />
      <Traveler d={in2} dur={2.2} delay={1.1} tone="sky" r={5} />
      <Traveler d={out1} dur={2.4} tone="mint" r={5} />
      <Traveler d={out2} dur={2.4} delay={1.2} tone="mint" r={5} />
      <Traveler d={back} dur={5} tone="rose" r={5} />
    </Diagram>
  );
}

function PubSubFanout() {
  const post = path([206, 190], [316, 190]);
  const subs = [
    { y: 40, label: "Email helper", note: "sends a receipt", dashed: false },
    { y: 124, label: "Packing helper", note: "packs the box", dashed: false },
    { y: 208, label: "Points helper", note: "adds reward stars", dashed: false },
    { y: 292, label: "Thank-you helper", note: "joined later", dashed: true },
  ];
  return (
    <Diagram
      id="async-pubsub-fanout"
      width={900}
      height={440}
      title="Publish once, every subscriber gets a copy"
      description="The shop app publishes one new order message to a topic. The topic hands its own copy to each subscriber: the email helper, the packing helper and the points helper. A thank-you helper that joined later also gets a copy, and the shop app did not have to change."
      caption="A queue shares out the work. Pub/Sub shares out the news. Adding the thank-you helper needed no change to the shop app."
    >
      <Box x={36} y={150} w={170} h={80} label="Shop app" note="the publisher" tone="sky" />
      <Box x={316} y={136} w={220} h={108} label="Topic: new order" note="the announcement board" tone="sun" />
      <Arrow d={post} tone="sky" />
      <Label x={261} y={168} text="posts once" size={14} weight={600} color={tones.sky.text} />
      <Traveler d={post} dur={3} tone="sky" r={5} />
      {subs.map((s) => {
        const d = path([536, 190], [650, s.y + 30]);
        return (
          <g key={s.label}>
            <Box x={650} y={s.y} w={220} h={60} label={s.label} note={s.note} tone={s.dashed ? "grape" : "mint"} dashed={s.dashed} />
            <Arrow d={d} tone={s.dashed ? "grape" : "mint"} dashed={s.dashed} />
            <Traveler d={d} dur={3} delay={1.5} tone={s.dashed ? "grape" : "mint"} r={5} />
          </g>
        );
      })}
      <Label
        x={420}
        y={384}
        text={["One post, and one copy for every subscriber.", "The shop app never needs to know who is listening."]}
        size={14}
      />
    </Diagram>
  );
}

type Kind = "most" | "least" | "exactly";

function GuaranteeColumn({ x0, kind }: { x0: number; kind: Kind }) {
  const sx = x0 + 62;
  const rx = x0 + 208;
  const mid = x0 + 135;
  const title = { most: "At-most-once", least: "At-least-once", exactly: "Exactly-once effect" }[kind];
  const result = {
    most: { label: "Lost", note: "but never doubled", tone: "rose" as const },
    least: { label: "Done twice", note: "never lost, may double", tone: "sun" as const },
    exactly: { label: "Done once", note: "repeat spotted by ID", tone: "mint" as const },
  }[kind];
  const send1 = path([sx, 140], [rx, 156]);
  const retry = path([sx, 262], [rx, 278]);
  const cross = (cx: number, cy: number) => (
    <g className="blink">
      <Line d={path([cx - 7, cy - 7], [cx + 7, cy + 7])} color={tones.rose.stroke} width={3} />
      <Line d={path([cx - 7, cy + 7], [cx + 7, cy - 7])} color={tones.rose.stroke} width={3} />
    </g>
  );
  return (
    <g>
      <Group x={x0} y={30} w={270} h={386} label={title} />
      <Box x={x0 + 14} y={66} w={96} h={44} label="Sender" tone="sky" />
      <Box x={x0 + 154} y={66} w={108} h={44} label="Receiver" tone="mint" />
      <Line d={path([sx, 110], [sx, 312])} dashed />
      <Line d={path([rx, 110], [rx, 312])} dashed />
      <Label x={mid} y={124} text="#1" size={14} weight={700} color={tones.sky.text} />
      {kind === "most" ? (
        <>
          <Line d={path([sx, 140], [x0 + 124, 147])} color={tones.sky.stroke} />
          {cross(x0 + 133, 148)}
          <Label x={mid} y={172} text="lost" size={13} color={tones.rose.text} weight={600} />
          <Label x={mid} y={252} text="no retry" size={13} />
        </>
      ) : (
        <>
          <Arrow d={send1} tone="sky" />
          <Traveler d={send1} dur={2.5} tone="sky" r={5} />
          <Label x={mid} y={180} text="ack" size={13} weight={700} color={tones.mint.text} />
          <Line d={path([rx, 196], [x0 + 144, 203])} color={tones.mint.stroke} dashed />
          {cross(x0 + 135, 204)}
          <Label x={mid} y={224} text="ack lost" size={13} color={tones.rose.text} weight={600} />
          <Label x={mid} y={250} text="#1 again" size={14} weight={700} color={tones.sky.text} />
          <Arrow d={retry} tone="sky" />
          <Traveler d={retry} dur={2.5} delay={1.25} tone="sky" r={5} />
          <Label
            x={mid}
            y={298}
            text={kind === "least" ? "does it again" : "seen #1: skip"}
            size={13}
            weight={600}
            color={kind === "least" ? tones.sun.text : tones.mint.text}
          />
        </>
      )}
      <Box x={x0 + 20} y={334} w={230} h={62} label={result.label} note={result.note} tone={result.tone} />
    </g>
  );
}

function DeliveryGuarantees() {
  return (
    <Diagram
      id="async-delivery-guarantees"
      width={900}
      height={450}
      title="Three delivery promises side by side"
      description="At-most-once: the sender sends note 1 a single time, it is lost, and it is never sent again, so the work is lost but never doubled. At-least-once: note 1 arrives, but the got it reply is lost, so the sender sends note 1 again and the receiver does the work twice. Exactly-once effect: the same thing happens, but the receiver remembers it already handled ID 1 and skips the repeat, so the work happens once."
      caption="Time flows downward. The only difference between the middle and right columns is that the right receiver remembers which IDs it has already handled."
    >
      <GuaranteeColumn x0={30} kind="most" />
      <GuaranteeColumn x0={315} kind="least" />
      <GuaranteeColumn x0={600} kind="exactly" />
      <Pulse cx={163} cy={148} r={12} tone="rose" />
    </Diagram>
  );
}

export const asyncDiagrams = {
  "async-sync-vs-async": SyncVsAsync,
  "async-queue-workers": QueueWorkers,
  "async-pubsub-fanout": PubSubFanout,
  "async-delivery-guarantees": DeliveryGuarantees,
};
