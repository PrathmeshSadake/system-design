import { Arrow, Box, Diagram, Group, Label, Line, Traveler, path, tones } from "./primitives";
import type { Tone } from "./primitives";

/* Three rooms of a pizza shop, each with its own meaning of "Order". */
function OrderRooms() {
  const rooms: { x: number; name: string; tone: Tone; note: string[]; means: string }[] = [
    { x: 30, name: "Kitchen", tone: "sun", note: ["2 pizzas to bake", "extra cheese", "ready by 6:10"], means: "Order = pizzas to bake" },
    { x: 320, name: "Register", tone: "mint", note: ["total 24 dollars", "paid by card", "tax 2 dollars"], means: "Order = money to collect" },
    { x: 610, name: "Delivery", tone: "sky", note: ["12 Elm Street", "arrive by 6:30", "driver: Sam"], means: "Order = a trip to make" },
  ];
  return (
    <Diagram
      id="ddd-order-rooms"
      width={900}
      height={360}
      title="One word, three meanings"
      description="A pizza shop has three rooms. In the kitchen, order 1187 means two pizzas to bake with extra cheese, ready by 6:10. At the register, order 1187 means a total of 24 dollars paid by card. In delivery, order 1187 means a trip to 12 Elm Street, arriving by 6:30, with driver Sam."
      caption="Every room uses the same order number, but keeps only the details it cares about."
    >
      {rooms.map((r) => (
        <g key={r.name}>
          <Group x={r.x} y={40} w={260} h={250} label={r.name} tone={r.tone} filled />
          <Box x={r.x + 30} y={90} w={200} h={110} label="Order 1187" note={r.note} tone="white" />
          <Label x={r.x + 130} y={240} text={r.means} size={14} weight={600} color={tones[r.tone].text} />
        </g>
      ))}
      <Label x={450} y={324} text="Same order number, a different meaning in each room." size={14} />
    </Diagram>
  );
}

/* A context map: who calls whom, who announces what, and where the translator sits. */
function ContextMap() {
  const placed = path([135, 200], [135, 105], [365, 105]);
  const ready = path([555, 105], [690, 105]);
  const ask = path([230, 245], [365, 245]);
  const theirs = path([555, 245], [690, 245]);
  const menu = path([135, 290], [135, 350]);
  return (
    <Diagram
      id="ddd-context-map"
      width={920}
      height={480}
      title="A context map for the pizza shop"
      description="Ordering is the core context. When an order is placed it announces an event that the kitchen listens to, and the kitchen announces pizza ready, which delivery listens to. To charge a card, ordering talks to an outside card company through a translator, the anti-corruption layer, which turns our words into theirs. Ordering also reads the menu through the menu's published API."
      caption="Dashed arrows are events: news that others react to later. Solid arrows are API calls: ask and wait for an answer."
    >
      <Box x={365} y={60} w={190} h={90} label="Kitchen" note={["supporting:", "bakes the pizzas"]} tone="sun" />
      <Box x={690} y={60} w={190} h={90} label="Delivery" note={["supporting:", "drives pizzas out"]} tone="sky" />
      <Box x={40} y={200} w={190} h={90} label="Ordering" note={["core: the heart", "of the shop"]} tone="mint" />
      <Box x={365} y={200} w={190} h={90} label="Translator" note={["anti-corruption", "layer"]} tone="grape" dashed />
      <Box x={690} y={200} w={190} h={90} label="Card company" note={["generic: bought,", "not built"]} tone="slate" />
      <Box x={40} y={350} w={190} h={80} label="Menu" note={["supporting:", "published API"]} tone="white" />

      <Arrow d={placed} tone="grape" dashed />
      <Label x={250} y={83} text="order placed" size={14} weight={600} color={tones.grape.text} />
      <Arrow d={ready} tone="grape" dashed />
      <Label x={622} y={83} text="pizza ready" size={14} weight={600} color={tones.grape.text} />
      <Arrow d={ask} tone="slate" />
      <Label x={297} y={223} text="our words" size={14} weight={600} color={tones.slate.text} />
      <Arrow d={theirs} tone="slate" />
      <Label x={622} y={223} text="their words" size={14} weight={600} color={tones.slate.text} />
      <Arrow d={menu} tone="slate" />
      <Label x={149} y={320} text="reads the menu" anchor="start" size={14} weight={600} color={tones.slate.text} />

      <Traveler d={placed} dur={2.6} tone="grape" r={5} />
      <Traveler d={ready} dur={1.6} delay={1} tone="grape" r={5} />
      <Traveler d={ask} dur={1.6} tone="slate" r={5} />
      <Traveler d={theirs} dur={1.6} delay={0.8} tone="slate" r={5} />

      <Line d={path([420, 384], [470, 384])} color={tones.grape.stroke} dashed />
      <Label x={484} y={384} text="event: news shared, others react later" anchor="start" size={13} />
      <Line d={path([420, 414], [470, 414])} color={tones.slate.stroke} />
      <Label x={484} y={414} text="API call: ask and wait for an answer" anchor="start" size={13} />
    </Diagram>
  );
}

/* A tangled boundary versus a clean one. */
function Boundaries() {
  const chatty = [100, 125, 150, 175].map((y, i) => (i % 2 === 0 ? path([200, y], [270, y]) : path([270, y], [200, y])));
  const sharedA = path([130, 200], [180, 290]);
  const sharedB = path([340, 200], [290, 290]);
  const event = path([630, 140], [700, 140]);
  const ownA = path([560, 200], [560, 290]);
  const ownB = path([770, 200], [770, 290]);
  return (
    <Diagram
      id="ddd-boundaries"
      width={900}
      height={460}
      title="A tangled boundary versus a clean one"
      description="On the left, an orders service and a customers service send many small calls back and forth and both read and write one shared database, so neither can change alone. On the right, ordering and kitchen each own their own data, and only one message, order placed, crosses between them."
      caption="If one action needs a stream of tiny calls across a line, the line is probably in the wrong place."
    >
      <Group x={30} y={30} w={410} h={350} label="Tangled: chatty calls, shared data" tone="rose" />
      <Box x={60} y={80} w={140} h={120} label="Orders" note="service" tone="sun" />
      <Box x={270} y={80} w={140} h={120} label="Customers" note="service" tone="sun" />
      {chatty.map((d, i) => (
        <g key={i}>
          <Arrow d={d} tone="rose" />
          <Traveler d={d} dur={1.2} delay={i * 0.3} tone="rose" r={4} />
        </g>
      ))}
      <Label x={235} y={224} text={["many tiny calls,", "every time"]} size={14} weight={600} color={tones.rose.text} />
      <Box x={130} y={290} w={210} h={60} label="One shared database" tone="rose" />
      <Arrow d={sharedA} tone="rose" both />
      <Arrow d={sharedB} tone="rose" both />

      <Group x={460} y={30} w={410} h={350} label="Clean: split by business job" tone="mint" />
      <Box x={490} y={80} w={140} h={120} label="Ordering" note="context" tone="mint" />
      <Box x={700} y={80} w={140} h={120} label="Kitchen" note="context" tone="mint" />
      <Arrow d={event} tone="grape" dashed />
      <Traveler d={event} dur={1.6} tone="grape" r={5} />
      <Label x={665} y={224} text={["one message:", "order placed"]} size={14} weight={600} color={tones.grape.text} />
      <Box x={485} y={290} w={150} h={60} label="Orders data" tone="white" />
      <Box x={695} y={290} w={150} h={60} label="Kitchen data" tone="white" />
      <Arrow d={ownA} tone="mint" both />
      <Arrow d={ownB} tone="mint" both />

      <Label x={235} y={412} text={["Every change needs both teams.", "One slow call slows everything."]} size={13} />
      <Label x={665} y={412} text={["Each team changes its own side.", "Only one clear message crosses."]} size={13} />
    </Diagram>
  );
}

export const dddDiagrams = {
  "ddd-order-rooms": OrderRooms,
  "ddd-context-map": ContextMap,
  "ddd-boundaries": Boundaries,
};
