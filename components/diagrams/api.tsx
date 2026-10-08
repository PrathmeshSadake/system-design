import { Arrow, Box, Diagram, Group, Label, Pulse, Traveler, ink, path, tones } from "./primitives";

/* ------------------------------------------------------------------ */
/* Shared bits for the "pieces on a belt" pictures                     */
/* ------------------------------------------------------------------ */

type Stream = "A" | "B" | "C";
type PieceState = "ok" | "wait" | "lost";

const streamTone = { A: "sky", B: "sun", C: "grape" } as const;
const PIECE_W = 40;
const PIECE_H = 26;
const TUBE_X = 240;
const TUBE_W = 630;
/** Left edge of slot i (12 slots, 50 apart, centered in the tube). */
const slotX = (i: number) => 260 + i * 50;

/** One small labeled piece of a message. Faded when it is stuck waiting. */
function Piece({ x, y, s, state = "ok" }: { x: number; y: number; s: Stream; state?: PieceState }) {
  if (state === "lost") {
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={PIECE_W}
          height={PIECE_H}
          rx={6}
          fill="#ffffff"
          stroke={tones.rose.stroke}
          strokeWidth={2}
          strokeDasharray="4 3"
        />
        <text
          x={x + PIECE_W / 2}
          y={y + PIECE_H / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13}
          fill={tones.rose.text}
        >
          lost
        </text>
      </g>
    );
  }
  const t = tones[streamTone[s]];
  return (
    <g opacity={state === "wait" ? 0.4 : 1}>
      <rect x={x} y={y} width={PIECE_W} height={PIECE_H} rx={6} fill={t.fill} stroke={t.stroke} strokeWidth={2} />
      <text
        x={x + PIECE_W / 2}
        y={y + PIECE_H / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontWeight={700}
        fill={t.text}
      >
        {s}
      </text>
    </g>
  );
}

/** The road (a long rounded tube) that pieces ride along. */
function Tube({ y, h }: { y: number; h: number }) {
  return <rect x={TUBE_X} y={y} width={TUBE_W} height={h} rx={14} fill={tones.slate.fill} stroke={tones.slate.stroke} strokeWidth={1.5} />;
}

/** A single lane of pieces. `seq` is read left to right. Empty strings leave a gap. */
function Lane({ y, seq, states = {} }: { y: number; seq: (Stream | "")[]; states?: Record<number, PieceState> }) {
  return (
    <>
      {seq.map((s, i) => (s ? <Piece key={i} x={slotX(i)} y={y} s={s} state={states[i]} /> : null))}
    </>
  );
}

/** "pieces travel this way" pointer at the top of the belt pictures. */
function Direction() {
  return (
    <>
      <Label x={640} y={44} text="pieces travel this way" anchor="end" size={14} />
      <Arrow d={path([656, 44], [866, 44])} tone="slate" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* HTTP/1.1 vs HTTP/2                                                   */
/* ------------------------------------------------------------------ */

function Multiplex() {
  // Rightmost pieces were sent first.
  const http1: Stream[] = ["C", "C", "C", "B", "B", "B", "B", "A", "A", "A", "A", "A"];
  const http2: Stream[] = ["C", "B", "A", "C", "B", "A", "C", "B", "A", "C", "B", "A"];
  return (
    <Diagram
      id="apinet-multiplex"
      width={900}
      height={316}
      title="One request at a time versus pieces taking turns"
      description="With HTTP/1.1 a connection carries all of answer A, then all of B, then all of C, so B and C wait. With HTTP/2 the answers are cut into labeled pieces that take turns on one connection, so a big answer does not block a small one."
      caption="Pieces on the right were sent first. On HTTP/2 the letters take turns, and the other side sorts them back out by their labels."
    >
      <Direction />
      <Box x={30} y={72} w={180} h={64} label="HTTP/1.1" note="one at a time" tone="slate" />
      <Tube y={82} h={44} />
      <Lane y={91} seq={http1} />
      <Label x={555} y={150} text="B cannot start until all of A is done, and C waits for B." size={14} />

      <Box x={30} y={192} w={180} h={64} label="HTTP/2" note="pieces take turns" tone="sky" />
      <Tube y={202} h={44} />
      <Lane y={211} seq={http2} />
      <Label x={555} y={270} text="A, B and C share one line, so a big answer no longer blocks a small one." size={14} />
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* HTTP/2 vs HTTP/3 when a piece is lost                               */
/* ------------------------------------------------------------------ */

function LostPiece() {
  const http2: Stream[] = ["C", "B", "A", "C", "B", "A", "C", "B", "A", "C", "B", "A"];
  const lostAt = 7; // a B piece
  const http2States: Record<number, PieceState> = { [lostAt]: "lost" };
  for (let i = 0; i < lostAt; i++) http2States[i] = "wait";

  // The same pieces, split into one lane per stream at the same spots.
  const lane = (s: Stream) => http2.map((p) => (p === s ? p : "")) as (Stream | "")[];
  const bStates: Record<number, PieceState> = { [lostAt]: "lost", 1: "wait", 4: "wait" };

  return (
    <Diagram
      id="apinet-lost-piece"
      width={900}
      height={346}
      title="One lost piece on HTTP/2 versus HTTP/3"
      description="On HTTP/2 every stream shares one TCP belt, so when one B piece is lost, all the pieces behind it wait, even A and C pieces. On HTTP/3 each stream has its own lane inside QUIC, so only the B pieces behind the lost one wait while A and C keep moving."
      caption="Faded pieces have arrived but are stuck waiting for the lost piece to be sent again."
    >
      <Direction />
      <Box x={30} y={72} w={180} h={64} label="HTTP/2" note="one belt, on TCP" tone="sky" />
      <Tube y={82} h={44} />
      <Lane y={91} seq={http2} states={http2States} />
      <Pulse cx={slotX(lostAt) + PIECE_W / 2} cy={104} r={16} tone="rose" />
      <Label x={555} y={150} text="One B piece is lost, so every piece behind it waits, even A and C." size={14} color={tones.rose.text} />

      <Box x={30} y={208} w={180} h={64} label="HTTP/3" note="own lanes, on QUIC" tone="mint" />
      <Tube y={188} h={104} />
      <Lane y={196} seq={lane("A")} />
      <Lane y={228} seq={lane("B")} states={bStates} />
      <Lane y={260} seq={lane("C")} />
      <Pulse cx={slotX(lostAt) + PIECE_W / 2} cy={241} r={16} tone="rose" />
      <Label x={555} y={316} text="Each stream has its own lane. Only the B pieces wait. A and C keep going." size={14} color={tones.mint.text} />
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* gRPC                                                                 */
/* ------------------------------------------------------------------ */

function Grpc() {
  const toCaller = path([390, 120], [220, 200]);
  const toAnswerer = path([490, 120], [660, 200]);
  const ask = path([280, 228], [600, 228]);
  const reply = path([600, 272], [280, 272]);
  return (
    <Diagram
      id="apinet-grpc"
      width={880}
      height={392}
      title="gRPC: one shared order form, two services"
      description="A shared Protocol Buffers file describes every message. Tools turn it into code for the calling service and the answering service. The caller sends GetOrder with id 7 and gets back an order with id 7 and food pizza, packed into just nine bytes and carried over HTTP/2."
      caption="Both sides were built from the same form, so they always agree on what every field means."
    >
      <Box x={330} y={40} w={220} h={80} label="Shared order form" note={["orders.proto file", "lists every field"]} tone="grape" />
      <Arrow d={toCaller} tone="grape" dashed />
      <Arrow d={toAnswerer} tone="grape" dashed />
      <Label x={286} y={150} text="makes code" anchor="end" size={14} color={tones.grape.text} />
      <Label x={594} y={150} text="makes code" anchor="start" size={14} color={tones.grape.text} />

      <Box x={40} y={200} w={240} h={100} label="Caller service" note={["code written for it", "from the form"]} tone="sky" />
      <Box x={600} y={200} w={240} h={100} label="Answering service" note={["code written for it", "from the form"]} tone="mint" />

      <Arrow d={ask} tone="slate" />
      <Label x={440} y={209} text="GetOrder(id = 7)" size={14} weight={600} color={ink} />
      <Arrow d={reply} tone="mint" />
      <Label x={440} y={291} text="Order(id = 7, food = pizza)" size={14} weight={600} color={tones.mint.text} />
      <Traveler d={ask} dur={2.4} tone="sky" r={5} />
      <Traveler d={reply} dur={2.4} delay={1.2} tone="mint" r={5} />
      <Traveler d={reply} dur={2.4} delay={0.4} tone="mint" r={5} />

      <Label x={440} y={334} text="That reply packs into just 9 bytes: 08 07 12 05 70 69 7a 7a 61" size={14} />
      <Label x={440} y={358} text="The same reply as JSON text takes 23 bytes. Both ride on HTTP/2." size={14} />
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* Polling vs WebSocket                                                 */
/* ------------------------------------------------------------------ */

function Pillar({ x, name }: { x: number; name: string }) {
  return (
    <>
      <Label x={x + 40} y={92} text={name} size={15} weight={700} color={ink} />
      <Box x={x} y={110} w={80} h={256} tone="slate" />
    </>
  );
}

function WebSocketDiagram() {
  // Polling side: phone pillar right edge 136, server pillar left edge 329.
  const pl = 136;
  const pr = 329;
  const polls = [
    { y: 146, text: "anything new?", right: true, tone: "slate" as const },
    { y: 186, text: "no", right: false, tone: "rose" as const },
    { y: 226, text: "anything new?", right: true, tone: "slate" as const },
    { y: 266, text: "no", right: false, tone: "rose" as const },
    { y: 306, text: "anything new?", right: true, tone: "slate" as const },
    { y: 346, text: "yes: Hi from Ben", right: false, tone: "mint" as const },
  ];
  // WebSocket side: phone pillar right edge 571, server pillar left edge 764.
  const wl = 571;
  const wr = 764;
  const open = path([wl, 236], [wr, 236]);
  const openBack = path([wr, 236], [wl, 236]);
  const push = path([wr, 286], [wl, 286]);
  const send = path([wl, 336], [wr, 336]);
  return (
    <Diagram
      id="apinet-websocket"
      width={900}
      height={444}
      title="Polling versus a WebSocket"
      description="With polling, the phone keeps asking the server if there is anything new, and most answers are no. With a WebSocket, the phone asks once to upgrade, the server agrees, and one line stays open so the server can push a new message the moment it arrives and the phone can send whenever it likes."
      caption="Polling pays for a trip on every question. A WebSocket pays once to open the line, then keeps it open."
    >
      <Group x={30} y={36} w={405} h={380} label="Polling: asking again and again" />
      <Pillar x={56} name="Phone" />
      <Pillar x={329} name="Server" />
      {polls.map((p) => {
        const d = p.right ? path([pl, p.y], [pr, p.y]) : path([pr, p.y], [pl, p.y]);
        return (
          <g key={p.y}>
            <Arrow d={d} tone={p.tone} />
            <Label x={(pl + pr) / 2} y={p.y - 19} text={p.text} size={14} color={tones[p.tone].text} />
          </g>
        );
      })}
      <Label x={232} y={392} text="Most answers are no. Every question is a trip." size={13} />

      <Group x={465} y={36} w={405} h={380} label="WebSocket: one line that stays open" tone="grape" />
      <Pillar x={491} name="Phone" />
      <Pillar x={764} name="Server" />
      <Arrow d={path([wl, 146], [wr, 146])} tone="slate" />
      <Label x={(wl + wr) / 2} y={127} text="please upgrade" size={14} color={tones.slate.text} />
      <Arrow d={path([wr, 186], [wl, 186])} tone="slate" />
      <Label x={(wl + wr) / 2} y={167} text="ok, switching" size={14} color={tones.slate.text} />
      <Arrow d={open} tone="grape" both width={4} />
      <Label x={(wl + wr) / 2} y={217} text="line stays open" size={14} weight={700} color={tones.grape.text} />
      <Traveler d={open} dur={2.2} tone="grape" r={5} />
      <Traveler d={openBack} dur={2.2} delay={1.1} tone="grape" r={5} />
      <Arrow d={push} tone="mint" />
      <Label x={(wl + wr) / 2} y={267} text="new message for you" size={14} color={tones.mint.text} />
      <Traveler d={push} dur={1.8} tone="mint" r={5} />
      <Arrow d={send} tone="sky" />
      <Label x={(wl + wr) / 2} y={317} text="send: hello" size={14} color={tones.sky.text} />
      <Label x={667} y={392} text="Either side can talk at any time." size={13} />
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* API gateway                                                          */
/* ------------------------------------------------------------------ */

function Gateway() {
  const rows = [
    { y: 70, client: "Phone app", ask: "GET /videos/9", service: "Videos", route: "/videos" },
    { y: 158, client: "Web browser", ask: "GET /orders/7", service: "Orders", route: "/orders" },
    { y: 246, client: "Partner app", ask: "GET /users/3", service: "Users", route: "/users" },
  ];
  return (
    <Diagram
      id="apinet-gateway"
      width={900}
      height={400}
      title="An API gateway is the front desk"
      description="A phone app, a web browser and a partner app all send their requests to one API gateway. The gateway checks the badge, checks the visit limit, picks the right service and writes a log, then passes each request to the videos, orders or users service inside."
      caption="Clients only ever talk to the front desk. The services behind it never meet strangers directly."
    >
      {rows.map((r, i) => {
        const cy = r.y + 32;
        const inbound = path([200, cy], [320, cy]);
        const outbound = path([570, cy], [700, cy]);
        return (
          <g key={r.client}>
            <Box x={30} y={r.y} w={170} h={64} label={r.client} note={r.ask} tone="sky" />
            <Arrow d={inbound} tone="slate" />
            <Arrow d={outbound} tone="grape" />
            <Traveler d={inbound} dur={1.6} delay={i * 0.5} tone="sky" r={5} />
            <Traveler d={outbound} dur={1.6} delay={i * 0.5 + 0.8} tone="grape" r={5} />
          </g>
        );
      })}
      <Box
        x={320}
        y={60}
        w={250}
        h={260}
        label="API gateway"
        note={["1. check the badge", "2. check the limit", "3. pick the right room", "4. write it in the log"]}
        tone="grape"
      />
      <Group x={680} y={36} w={190} h={308} label="Services inside" />
      {rows.map((r) => (
        <Box key={r.service} x={700} y={r.y} w={150} h={64} label={r.service} note={r.route} tone="mint" />
      ))}
      <Label
        x={450}
        y={370}
        text="One front door for everyone. Run several copies of it, because if it stops, nobody gets in."
        size={14}
      />
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* Layer 4 vs layer 7 load balancing                                    */
/* ------------------------------------------------------------------ */

function Envelope({ cx, y }: { cx: number; y: number }) {
  const w = 220;
  const h = 72;
  const x = cx - w / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill="#ffffff" stroke={tones.slate.stroke} strokeWidth={2} />
      <path d={`M ${x} ${y} L ${cx} ${y + 32} L ${x + w} ${y}`} fill="none" stroke={tones.slate.stroke} strokeWidth={2} />
      <text x={cx} y={y + 52} textAnchor="middle" dominantBaseline="central" fontSize={14} fill={ink}>
        to 10.0.0.5, port 443
      </text>
    </g>
  );
}

function Letter({ cx, y }: { cx: number; y: number }) {
  const w = 220;
  const h = 72;
  const x = cx - w / 2;
  const fold = 16;
  const lines = ["GET /videos/42", "Host: kids.example", "Cookie: id=7"];
  return (
    <g>
      <path
        d={`M ${x} ${y} L ${x + w - fold} ${y} L ${x + w} ${y + fold} L ${x + w} ${y + h} L ${x} ${y + h} Z`}
        fill="#ffffff"
        stroke={tones.slate.stroke}
        strokeWidth={2}
      />
      <path d={`M ${x + w - fold} ${y} L ${x + w - fold} ${y + fold} L ${x + w} ${y + fold}`} fill="none" stroke={tones.slate.stroke} strokeWidth={1.5} />
      {lines.map((t, i) => (
        <text key={t} x={x + 18} y={y + 17 + i * 19} dominantBaseline="central" fontSize={13} fill={ink} fontWeight={i === 0 ? 700 : 400}>
          {t}
        </text>
      ))}
    </g>
  );
}

function L4L7() {
  const lcx = 232;
  const rcx = 667;
  const serverW = 110;
  const leftServers = [50, 177, 305];
  const rightServers = [485, 612, 740];
  const lbBottom = 260;
  const sTop = 320;
  const leftPick = path([lcx, lbBottom], [leftServers[1] + serverW / 2, sTop]);
  const rightPick = path([rcx - 40, lbBottom], [rightServers[0] + serverW / 2, sTop]);
  return (
    <Diagram
      id="apinet-l4-l7"
      width={900}
      height={490}
      title="Layer 4 reads the envelope, layer 7 reads the letter"
      description="A layer 4 load balancer only sees the address and port on the outside of the envelope, so it can send the request to any of three identical servers. A layer 7 load balancer reads the request inside, sees the path slash videos and a cookie, and sends it to the video team."
      caption="Both spread the work. Only layer 7 knows what is being asked, so only layer 7 can route by it."
    >
      <Group x={30} y={36} w={405} h={418} label="Layer 4: reads only the envelope" />
      <Envelope cx={lcx} y={76} />
      <Arrow d={path([lcx, 148], [lcx, 184])} tone="slate" />
      <Box x={112} y={184} w={240} h={76} label="Layer 4 balancer" note={["sees address and port", "picks any server"]} tone="sky" />
      {leftServers.map((x, i) => {
        const sx = x + serverW / 2;
        const from = lcx + (i - 1) * 40;
        return i === 1 ? null : <Arrow key={x} d={path([from, lbBottom], [sx, sTop])} tone="slate" dashed />;
      })}
      <Arrow d={leftPick} tone="sky" width={3} />
      <Traveler d={leftPick} dur={1.8} tone="sky" r={5} />
      {leftServers.map((x, i) => (
        <Box key={x} x={x} y={sTop} w={serverW} h={62} label={`Server ${i + 1}`} note="same app" tone={i === 1 ? "sky" : "white"} />
      ))}
      <Label x={lcx} y={412} text={["Fast and simple, works for any traffic.", "Cannot tell what is being asked."]} size={14} />

      <Group x={465} y={36} w={405} h={418} label="Layer 7: opens the letter" tone="grape" />
      <Letter cx={rcx} y={76} />
      <Arrow d={path([rcx, 148], [rcx, 184])} tone="slate" />
      <Box x={547} y={184} w={240} h={76} label="Layer 7 balancer" note={["reads path, headers", "and cookies"]} tone="grape" />
      {rightServers.map((x, i) => {
        const sx = x + serverW / 2;
        const from = rcx + (i - 1) * 40;
        return i === 0 ? null : <Arrow key={x} d={path([from, lbBottom], [sx, sTop])} tone="slate" dashed />;
      })}
      <Arrow d={rightPick} tone="grape" width={3} />
      <Traveler d={rightPick} dur={1.8} tone="grape" r={5} />
      {[
        { label: "Videos", note: "/videos/..." },
        { label: "Shop", note: "/shop/..." },
        { label: "Help", note: "/help/..." },
      ].map((s, i) => (
        <Box key={s.label} x={rightServers[i]} y={sTop} w={serverW} h={62} label={s.label} note={s.note} tone={i === 0 ? "grape" : "white"} />
      ))}
      <Label x={rcx} y={412} text={["Smart routing, sticky users, ends TLS.", "More work for every request."]} size={14} />
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* Token bucket                                                         */
/* ------------------------------------------------------------------ */

function Jar({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const inset = 10;
  return (
    <path
      d={`M ${x} ${y} L ${x + inset} ${y + h - 10} Q ${x + inset + 1} ${y + h} ${x + inset + 12} ${y + h} L ${x + w - inset - 12} ${y + h} Q ${x + w - inset - 1} ${y + h} ${x + w - inset} ${y + h - 10} L ${x + w} ${y}`}
      fill={tones.slate.fill}
      stroke={tones.slate.stroke}
      strokeWidth={3}
      strokeLinejoin="round"
    />
  );
}

function TokenBucket() {
  const drip = path([415, 100], [415, 146]);
  const incoming = path([220, 228], [335, 228]);
  const allowed = path([497, 190], [630, 175]);
  const rejected = path([492, 270], [630, 285]);
  const tokens = [372, 402, 432, 462];
  return (
    <Diagram
      id="apinet-token-bucket"
      width={860}
      height={410}
      title="Token bucket"
      description="A refill helper drips one token per second into a jar that holds at most five. Each request must take a token from the jar. With a token, the request is allowed. With an empty jar, the request is turned away with a 429."
      caption="Tokens drip in at a steady pace. Saved up tokens allow a short burst, but never more than the jar holds."
    >
      <Box x={320} y={36} w={190} h={64} label="Refill" note="1 token each second" tone="sun" />
      <Arrow d={drip} tone="sun" />
      <Label x={428} y={124} text="drip" anchor="start" size={14} color={tones.sun.text} />
      <Traveler d={drip} dur={2} tone="sun" r={6} />

      <Jar x={330} y={150} w={170} h={160} />
      {tokens.map((cx) => (
        <circle key={cx} cx={cx} cy={288} r={13} fill={tones.sun.fill} stroke={tones.sun.stroke} strokeWidth={2} />
      ))}
      <Label x={415} y={334} text="Token jar" size={15} weight={700} color={ink} />
      <Label x={415} y={354} text="holds at most 5" size={14} />

      <Box x={40} y={190} w={180} h={76} label="Requests" note="each needs 1 token" tone="sky" />
      <Arrow d={incoming} tone="slate" />
      <Traveler d={incoming} dur={1.4} tone="sky" r={5} />
      <Traveler d={incoming} dur={1.4} delay={0.5} tone="sky" r={5} />

      <Box x={630} y={140} w={200} h={70} label="Allowed" note="a token was used" tone="mint" />
      <Arrow d={allowed} tone="mint" />
      <Label x={563} y={160} text="token taken" size={14} color={tones.mint.text} />

      <Box x={630} y={250} w={200} h={70} label="429: try later" note="the jar was empty" tone="rose" />
      <Arrow d={rejected} tone="rose" dashed />
      <Label x={561} y={302} text="no token left" size={14} color={tones.rose.text} />

      <Label x={430} y={388} text="A full jar lets 5 through in a quick burst. After that, about 1 each second." size={14} />
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* Leaky bucket                                                         */
/* ------------------------------------------------------------------ */

function LeakyBucket() {
  const pour = path([240, 88], [400, 88], [400, 124]);
  const out = path([415, 302], [415, 340], [640, 340]);
  const spill = path([500, 130], [640, 100]);
  const queue: [number, number][] = [
    [362, 262],
    [400, 262],
    [438, 262],
    [376, 238],
    [414, 238],
    [452, 238],
  ];
  return (
    <Diagram
      id="apinet-leaky-bucket"
      width={860}
      height={424}
      title="Leaky bucket"
      description="A burst of requests pours into a bucket that holds up to six waiting requests. They drip out of a hole in the bottom to the server at a steady pace of one each second. When the bucket is full, extra requests spill over and get a 429."
      caption="However bumpy the arrivals, the server sees a smooth, even drip. The price is that requests may wait in the bucket."
    >
      <Box x={40} y={50} w={200} h={76} label="Burst of requests" note="all arrive at once" tone="sky" />
      <Arrow d={pour} tone="sky" />
      <Traveler d={pour} dur={2.4} tone="sky" r={5} />
      <Traveler d={pour} dur={2.4} delay={0.25} tone="sky" r={5} />
      <Traveler d={pour} dur={2.4} delay={0.5} tone="sky" r={5} />

      <Jar x={330} y={130} w={170} h={160} />
      <rect x={405} y={290} width={20} height={12} rx={3} fill={tones.slate.fill} stroke={tones.slate.stroke} strokeWidth={2} />
      {queue.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x - 14} y={y - 9} width={28} height={18} rx={4} fill={tones.sky.fill} stroke={tones.sky.stroke} strokeWidth={1.5} />
      ))}
      <Label x={315} y={204} text={["Waiting line,", "holds up to 6"]} anchor="end" size={14} />

      <Arrow d={out} tone="mint" />
      <Label x={528} y={322} text="steady drip" size={14} color={tones.mint.text} />
      <Traveler d={out} dur={3} tone="mint" r={5} />
      <Traveler d={out} dur={3} delay={1} tone="mint" r={5} />
      <Traveler d={out} dur={3} delay={2} tone="mint" r={5} />
      <Box x={640} y={305} w={190} h={70} label="Server" note="gets 1 each second" tone="mint" />

      <Arrow d={spill} tone="rose" dashed />
      <Label x={560} y={96} text="spills over" size={14} color={tones.rose.text} />
      <Box x={640} y={50} w={190} h={76} label="429: try later" note="the bucket was full" tone="rose" />

      <Label x={430} y={394} text="Bursts go in. A smooth, even stream comes out." size={14} />
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* Fixed window edge problem vs sliding window                          */
/* ------------------------------------------------------------------ */

function Cluster({ x, top, tone, hollow = false }: { x: number; top: number; tone: "mint" | "rose"; hollow?: boolean }) {
  const dots: [number, number][] = [];
  for (let c = 0; c < 2; c++) for (let r = 0; r < 5; r++) dots.push([x + c * 12, top + r * 10]);
  return (
    <>
      {dots.map(([cx, cy]) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r={4}
          fill={hollow ? "#ffffff" : tones[tone].stroke}
          stroke={tones[tone].stroke}
          strokeWidth={1.5}
        />
      ))}
    </>
  );
}

function Times({ y }: { y: number }) {
  return (
    <>
      <Label x={70} y={y} text="0:00" size={13} />
      <Label x={450} y={y} text="1:00" size={13} />
      <Label x={830} y={y} text="2:00" size={13} />
    </>
  );
}

function Windows() {
  return (
    <Diagram
      id="apinet-windows"
      width={900}
      height={420}
      title="The fixed window edge problem, fixed by a sliding window"
      description="The limit is 10 requests a minute. Ten requests arrive at 0:59 and ten more at 1:00. A fixed window counts each minute separately, so all twenty get in within about two seconds. A sliding window always looks at the last sixty seconds, so it sees twenty and turns the second ten away with a 429."
      caption="Same twenty requests, same limit of 10 a minute. Only the way of counting changes."
    >
      <Label x={40} y={50} text="Fixed window: the count goes back to 0 when each minute starts" anchor="start" size={15} weight={700} color={ink} />
      <Label x={260} y={86} text="minute 1" size={14} />
      <Label x={450} y={86} text="20 let in within about 2 seconds" size={14} weight={600} color={tones.rose.text} />
      <Label x={640} y={86} text="minute 2" size={14} />
      <rect x={70} y={102} width={380} height={60} rx={8} fill={tones.sky.fill} stroke={tones.sky.stroke} strokeWidth={2} />
      <rect x={450} y={102} width={380} height={60} rx={8} fill={tones.grape.fill} stroke={tones.grape.stroke} strokeWidth={2} />
      <Label x={250} y={132} text="count 10, all allowed" size={14} color={tones.sky.text} />
      <Label x={650} y={132} text="count 10, all allowed" size={14} color={tones.grape.text} />
      <Cluster x={424} top={112} tone="mint" />
      <Cluster x={464} top={112} tone="mint" />
      <Pulse cx={450} cy={132} r={20} tone="rose" />
      <Times y={180} />

      <Label x={40} y={226} text="Sliding window: always counts the last 60 seconds" anchor="start" size={15} weight={700} color={ink} />
      <Label x={294} y={252} text="the last 60 seconds" size={14} weight={600} color={tones.grape.text} />
      <rect x={70} y={272} width={760} height={60} rx={8} fill={tones.slate.fill} stroke={tones.slate.stroke} strokeWidth={1.5} />
      <rect x={96} y={267} width={396} height={70} rx={10} fill="none" stroke={tones.grape.stroke} strokeWidth={2.5} strokeDasharray="7 5" />
      <Label x={260} y={302} text="first 10: allowed" size={14} color={tones.mint.text} />
      <Cluster x={424} top={282} tone="mint" />
      <Cluster x={464} top={282} tone="rose" hollow />
      <Label x={650} y={302} text="next 10: turned away, 429" size={14} color={tones.rose.text} />
      <Times y={352} />

      <Label x={450} y={390} text="A log of time stamps gets this exact. A two number counter gets very close." size={14} />
    </Diagram>
  );
}

export const apiDiagrams = {
  "apinet-multiplex": Multiplex,
  "apinet-lost-piece": LostPiece,
  "apinet-grpc": Grpc,
  "apinet-websocket": WebSocketDiagram,
  "apinet-gateway": Gateway,
  "apinet-l4-l7": L4L7,
  "apinet-token-bucket": TokenBucket,
  "apinet-leaky-bucket": LeakyBucket,
  "apinet-windows": Windows,
};
