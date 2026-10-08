import { Arrow, Box, Diagram, Group, Label, Traveler, path, tones } from "./primitives";

/* Orchestrator, message queues and the four services. */
function Services() {
  const services = [
    { label: "Inventory", note: "reserves the bike" },
    { label: "Payment", note: "takes the money" },
    { label: "Warehouse", note: "packs the box" },
    { label: "Shipping", note: "drives it to you" },
  ];
  const xs = [51, 257, 463, 669];
  const command = path([420, 116], [420, 190]);
  const event = path([480, 190], [480, 116]);
  const save = path([580, 78], [670, 78]);
  return (
    <Diagram
      id="fulfill-services"
      width={900}
      height={440}
      title="An orchestrator and its helpers"
      description="The orchestrator sends commands into message queues, and saves each order's state and version in the order records. Inventory, payment, warehouse and shipping services each pick up their commands from the queues and send events back, which the orchestrator reads to decide the next step."
      caption="Solid arrows carry commands down to the services. Dashed arrows carry events back up."
    >
      <Box x={320} y={40} w={260} h={76} label="Orchestrator" note={["knows the steps", "for every order"]} tone="grape" />
      <Box x={670} y={40} w={190} h={76} label="Order records" note="state and version" tone="slate" />
      <Arrow d={save} tone="slate" both />
      <Label x={625} y={58} text="saves" size={14} weight={600} color={tones.slate.text} />
      <Box x={51} y={190} w={798} h={50} label="Message queues" tone="sky" />
      <Arrow d={command} tone="sky" />
      <Arrow d={event} tone="mint" dashed />
      <Label x={406} y={153} text="commands go out" anchor="end" size={14} weight={600} color={tones.sky.text} />
      <Label x={494} y={153} text="events come back" anchor="start" size={14} weight={600} color={tones.mint.text} />
      <Traveler d={command} dur={1.4} tone="sky" r={5} />
      <Traveler d={event} dur={1.4} delay={0.7} tone="mint" r={5} />
      {services.map((s, i) => {
        const c = xs[i] + 90;
        const down = path([c - 24, 240], [c - 24, 300]);
        const up = path([c + 24, 300], [c + 24, 240]);
        return (
          <g key={s.label}>
            <Box x={xs[i]} y={300} w={180} h={80} label={s.label} note={s.note} tone="white" />
            <Arrow d={down} tone="sky" />
            <Arrow d={up} tone="mint" dashed />
            <Traveler d={down} dur={1.4} delay={0.3 * i} tone="sky" r={4} />
            <Traveler d={up} dur={1.4} delay={0.3 * i + 0.7} tone="mint" r={4} />
          </g>
        );
      })}
      <Label x={450} y={410} text="Each step may take seconds or days, so nobody waits on the line." size={14} />
    </Diagram>
  );
}

/* A saga step fails, so the finished step is undone. */
function Compensation() {
  const ok = path([260, 102], [340, 102]);
  const never = path([560, 102], [640, 102]);
  const fails = path([450, 144], [450, 236]);
  const undo = path([340, 278], [260, 278]);
  return (
    <Diagram
      id="fulfill-compensation"
      width={900}
      height={380}
      title="When a step fails, undo the steps before it"
      description="Step one, reserve the bike, is done. Step two, take payment, fails because the card was declined. Step three, pack and ship, never starts. Instead, the orchestrator runs the undo for step one, putting the bike back on the shelf, and then marks the order cancelled."
      caption="An undo is a new action, not an eraser. Here it puts the bike back so someone else can buy it."
    >
      <Box x={40} y={60} w={220} h={84} label="1. Reserve bike" note="done" tone="mint" />
      <Box x={340} y={60} w={220} h={84} label="2. Take payment" note="card was declined" tone="rose" />
      <Box x={640} y={60} w={220} h={84} label="3. Pack and ship" note="never starts" tone="slate" dashed />
      <Box x={340} y={236} w={220} h={84} label="Undo step 1" note={["put the bike back", "on the shelf"]} tone="sun" />
      <Box x={40} y={236} w={220} h={84} label="Order cancelled" note="the shopper is told" tone="slate" />
      <Arrow d={ok} tone="mint" />
      <Arrow d={never} tone="slate" dashed />
      <Arrow d={fails} tone="rose" />
      <Arrow d={undo} tone="sun" />
      <Label x={464} y={190} text="fails" anchor="start" size={14} weight={600} color={tones.rose.text} />
      <Traveler d={ok} dur={1.4} tone="mint" r={5} />
      <Traveler d={fails} dur={1.6} delay={0.4} tone="rose" r={5} />
      <Traveler d={undo} dur={1.4} delay={0.8} tone="sun" r={5} />
      <Label
        x={450}
        y={352}
        text="Undo runs backwards. If shipping failed later, the undo steps would be a refund, then restocking."
        size={14}
      />
    </Diagram>
  );
}

/* The order's finite state machine. */
function StateMachine() {
  const states: { label: string | string[]; tone: "sky" | "mint" }[] = [
    { label: "Placed", tone: "sky" },
    { label: ["Stock", "reserved"], tone: "sky" },
    { label: "Paid", tone: "sky" },
    { label: "Packed", tone: "sky" },
    { label: "Shipped", tone: "sky" },
    { label: "Delivered", tone: "mint" },
  ];
  const x = (i: number) => 39 + i * 142;
  const side = [
    path([95, 130], [110, 220]),
    path([237, 130], [190, 220]),
    path([379, 130], [420, 220]),
    path([521, 130], [480, 220]),
  ];
  return (
    <Diagram
      id="fulfill-state-machine"
      width={900}
      height={400}
      title="The order's state machine"
      description="An order moves from Placed to Stock reserved, Paid, Packed, Shipped and Delivered. Before payment it can move to Cancelled. After payment and before shipping it can move to Refunded. Moves that are not on the list, like Shipped back to Placed, are rejected, and a second paid message for an order that is already Paid is ignored."
      caption="Each order sits on exactly one box at a time. Only the arrows shown are allowed."
    >
      {states.map((s, i) => (
        <Box key={i} x={x(i)} y={60} w={112} h={70} label={s.label} tone={s.tone} />
      ))}
      {states.slice(0, -1).map((_, i) => {
        const d = path([x(i) + 112, 95], [x(i + 1), 95]);
        return <Arrow key={i} d={d} tone="slate" />;
      })}
      <Traveler d={path([x(0) + 112, 95], [x(1), 95])} dur={1.2} tone="sun" r={4} />
      <Traveler d={path([x(2) + 112, 95], [x(3), 95])} dur={1.2} delay={0.6} tone="sun" r={4} />
      <Box x={60} y={220} w={160} h={76} label="Cancelled" note="before paying" tone="slate" />
      <Box x={344} y={220} w={200} h={76} label="Refunded" note="money sent back" tone="sun" />
      {side.map((d, i) => (
        <Arrow key={i} d={d} tone={i < 2 ? "slate" : "sun"} />
      ))}
      <Label
        x={40}
        y={334}
        anchor="start"
        text={["Every move adds 1 to the version.", "Placed is 1, Stock reserved 2, Paid 3."]}
        size={14}
      />
      <Group x={600} y={180} w={270} h={186} label="The rules in action" tone="rose" />
      <Box x={620} y={220} w={230} h={56} label="Shipped to Placed?" note="not allowed: rejected" tone="rose" />
      <Box x={620} y={290} w={230} h={56} label="Paid twice?" note="already Paid: ignore it" tone="white" />
    </Diagram>
  );
}

/* Retry with backoff, then dead-letter, then fix and redrive. */
function DeadLetter() {
  const r1 = 60;
  const r2 = 210;
  const r3 = 360;
  const h = 84;
  const a = {
    take: path([220, r1 + 42], [300, r1 + 42]),
    works: path([500, r1 + 42], [640, r1 + 42]),
    fails: path([370, r1 + h], [370, r2]),
    again: path([430, r2], [430, r1 + h]),
    giveUp: path([500, r2 + 42], [640, r2 + 42]),
    alert: path([740, r2 + h], [740, r3]),
    fix: path([640, r3 + 42], [500, r3 + 42]),
    redrive: path([300, r3 + 42], [130, r3 + 42], [130, r1 + h]),
  };
  return (
    <Diagram
      id="fulfill-dlq"
      width={900}
      height={480}
      title="Retry, then the problem pile, then replay"
      description="A message waits in the order queue and the payment helper works on it. If it works, the order moves on. If it fails, the helper waits one, two, then four seconds and tries again, up to five tries. After five failed tries the message moves to the dead-letter queue. An alert tells a person, who fixes the cause and redrives the message back into the order queue."
      caption="The problem pile keeps the line moving. It only works if someone is alerted and actually looks."
    >
      <Box x={40} y={r1} w={180} h={h} label="Order queue" note="messages wait here" tone="sky" />
      <Box x={300} y={r1} w={200} h={h} label="Payment helper" note="works on one message" tone="grape" />
      <Box x={640} y={r1} w={200} h={h} label="Done" note="the order moves on" tone="mint" />
      <Box x={300} y={r2} w={200} h={h} label="Wait, then retry" note={["1, 2, then 4 seconds", "up to 5 tries"]} tone="sun" />
      <Box x={640} y={r2} w={200} h={h} label="Dead-letter queue" note="the problem pile" tone="rose" />
      <Box x={640} y={r3} w={200} h={h} label="Alert" note="a person is told" tone="slate" />
      <Box x={300} y={r3} w={200} h={h} label="Fix, then redrive" note="replay the message" tone="mint" />
      <Arrow d={a.take} tone="sky" />
      <Arrow d={a.works} tone="mint" />
      <Arrow d={a.fails} tone="rose" />
      <Arrow d={a.again} tone="sun" />
      <Arrow d={a.giveUp} tone="rose" />
      <Arrow d={a.alert} tone="slate" />
      <Arrow d={a.fix} tone="slate" />
      <Arrow d={a.redrive} tone="mint" dashed />
      <Label x={570} y={r1 + 24} text="works" size={14} weight={600} color={tones.mint.text} />
      <Label x={356} y={r1 + h + 33} text="fails" anchor="end" size={14} weight={600} color={tones.rose.text} />
      <Label x={444} y={r1 + h + 33} text="try again" anchor="start" size={14} weight={600} color={tones.sun.text} />
      <Label x={570} y={r2 + 24} text="after 5 tries" size={14} weight={600} color={tones.rose.text} />
      <Label x={144} y={r2 + 42} text="back in line" anchor="start" size={14} weight={600} color={tones.mint.text} />
      <Traveler d={a.take} dur={1.2} tone="sky" r={5} />
      <Traveler d={a.giveUp} dur={1.6} delay={0.4} tone="rose" r={5} />
      <Traveler d={a.redrive} dur={3} delay={0.8} tone="mint" r={5} />
    </Diagram>
  );
}

/* Transactional outbox: the state change and its message are saved together. */
function Outbox() {
  const toOrders = path([220, 150], [310, 122]);
  const toOutbox = path([220, 190], [310, 252]);
  const toRelay = path([550, 252], [660, 252]);
  const publish = path([760, 210], [760, 164]);
  return (
    <Diagram
      id="fulfill-outbox"
      width={900}
      height={410}
      title="The transactional outbox"
      description="The payment helper saves two things in one all or nothing database save: the order row, now Paid at version 3, and an outbox row holding the message that order 42 was paid. A relay reads new outbox rows and publishes them to the event queue, where the warehouse hears that order 42 is paid."
      caption="The order change and its message are saved together, so one can never happen without the other."
    >
      <Box x={40} y={128} w={180} h={84} label="Payment helper" note="finishes a payment" tone="grape" />
      <Group x={280} y={30} w={300} h={300} label="One save: all or nothing" tone="slate" />
      <Box x={310} y={80} w={240} h={84} label="Orders table" note={["order 42 is now Paid", "version 3"]} tone="sky" />
      <Box x={310} y={210} w={240} h={84} label="Outbox table" note={["message: order 42", "was paid, not sent yet"]} tone="sun" />
      <Box x={660} y={210} w={200} h={84} label="Relay" note={["reads new messages", "and sends them"]} tone="slate" />
      <Box x={660} y={80} w={200} h={84} label="Event queue" note={["the warehouse hears", "order 42 was paid"]} tone="mint" />
      <Arrow d={toOrders} tone="grape" />
      <Arrow d={toOutbox} tone="grape" />
      <Arrow d={toRelay} tone="sun" />
      <Arrow d={publish} tone="mint" />
      <Label x={774} y={187} text="publish" anchor="start" size={14} weight={600} color={tones.mint.text} />
      <Traveler d={toOrders} dur={1.2} tone="grape" r={5} />
      <Traveler d={toOutbox} dur={1.2} tone="grape" r={5} />
      <Traveler d={toRelay} dur={1.4} delay={0.6} tone="sun" r={5} />
      <Traveler d={publish} dur={1} delay={1.2} tone="mint" r={5} />
      <Label
        x={450}
        y={360}
        text={[
          "Crash after saving? The message still waits in the outbox and is sent later.",
          "It might be sent twice, so every reader must handle repeats.",
        ]}
        size={14}
      />
    </Diagram>
  );
}

export const fulfillmentDiagrams = {
  "fulfill-services": Services,
  "fulfill-compensation": Compensation,
  "fulfill-state-machine": StateMachine,
  "fulfill-dlq": DeadLetter,
  "fulfill-outbox": Outbox,
};
