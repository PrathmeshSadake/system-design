import { Arrow, Box, Diagram, Group, Label, Line, Traveler, path, tones } from "./primitives";

function Cross({ cx, cy, size = 8 }: { cx: number; cy: number; size?: number }) {
  return (
    <g className="blink">
      <Line d={path([cx - size, cy - size], [cx + size, cy + size])} color={tones.rose.stroke} width={3} />
      <Line d={path([cx - size, cy + size], [cx + size, cy - size])} color={tones.rose.stroke} width={3} />
    </g>
  );
}

function WriteAheadLog() {
  const first = path([200, 115], [330, 115]);
  const then = path([570, 115], [700, 115]);
  const redo = path([250, 325], [400, 300]);
  const undo = path([250, 355], [400, 390]);
  return (
    <Diagram
      id="tx-wal"
      width={900}
      height={480}
      title="Write it in the log first"
      description="A new change, Leo gets 5 stars, is first written as line 42 at the end of the write-ahead log and saved to disk. Only then are the real data pages changed, a bit later. After a crash, the database restarts and reads the log: lines 40 and 41 were committed, so they are redone and nothing promised is lost. Line 42 has no commit mark, so it is undone, as if it never started."
      caption="The log is only ever added to at the end, which is fast. It is the single source of truth after a crash."
    >
      <Box x={40} y={80} w={160} h={70} label="New change" note="Leo gets 5 stars" tone="white" />
      <Box
        x={330}
        y={60}
        w={240}
        h={110}
        label="Write-ahead log"
        note={["#40 Mia -2, committed", "#41 Ava +3, committed", "#42 Leo +5, new"]}
        tone="sun"
      />
      <Box x={700} y={80} w={160} h={70} label="Data pages" note="the real tables" tone="sky" />
      <Arrow d={first} tone="sun" />
      <Arrow d={then} tone="sky" />
      <Traveler d={first} dur={2.4} tone="sun" r={5} />
      <Traveler d={then} dur={2.4} delay={1.2} tone="sky" r={5} />
      <Label x={265} y={95} text="1. write first" size={13} weight={600} color={tones.sun.text} />
      <Label x={265} y={136} text="saved to disk" size={13} />
      <Label x={635} y={95} text="2. then change" size={13} weight={600} color={tones.sky.text} />
      <Label x={635} y={136} text="a bit later" size={13} />

      <Group x={40} y={220} w={820} h={230} label="After a crash: read the log again" tone="rose" />
      <Box x={70} y={300} w={180} h={80} label="Restart" note={["read the log", "line by line"]} tone="white" />
      <Box x={400} y={270} w={420} h={60} label="#40 and #41 were committed" note="redo them, so nothing promised is lost" tone="mint" />
      <Box x={400} y={360} w={420} h={60} label="#42 has no commit mark" note="undo it, as if it never started" tone="rose" />
      <Arrow d={redo} tone="mint" />
      <Arrow d={undo} tone="rose" />
    </Diagram>
  );
}

function TwoPcPanel({ x0, phase }: { x0: number; phase: 1 | 2 }) {
  const cx = x0 + 205;
  const names = ["Wallet", "Tickets", "Points"];
  return (
    <g>
      <Group x={x0} y={30} w={410} h={320} label={phase === 1 ? "Phase 1: prepare (everyone votes)" : "Phase 2: commit (everyone acts)"} />
      <Box
        x={x0 + 105}
        y={70}
        w={200}
        h={66}
        label="Coordinator"
        note={phase === 1 ? "asks: can you commit?" : "all said yes: commit"}
        tone="grape"
      />
      {names.map((n, i) => {
        const px = x0 + 20 + i * 127;
        const d = path([cx + (i - 1) * 40, 136], [px + 58, 226]);
        return (
          <g key={n}>
            <Arrow d={d} tone={phase === 1 ? "slate" : "mint"} both={phase === 1} />
            <Traveler d={d} dur={2.2} delay={phase === 1 ? 0 : 1.1} tone={phase === 1 ? "grape" : "mint"} r={5} />
            <Box
              x={px}
              y={226}
              w={116}
              h={74}
              label={n}
              note={phase === 1 ? ["voted yes", "locks held"] : ["committed", "locks freed"]}
              tone={phase === 1 ? "sun" : "mint"}
            />
          </g>
        );
      })}
      <Label
        x={cx}
        y={326}
        text={phase === 1 ? "Each saved the work, then said yes." : "Everyone commits together."}
        size={14}
        weight={600}
        color={phase === 1 ? tones.sun.text : tones.mint.text}
      />
    </g>
  );
}

function TwoPhaseCommit() {
  const stuck = ["Wallet", "Tickets", "Points"];
  return (
    <Diagram
      id="tx-2pc"
      width={920}
      height={520}
      title="Two-phase commit and its weak spot"
      description="Phase 1: the coordinator asks the wallet, tickets and points databases whether they can commit. Each saves the work, keeps its rows locked, and votes yes. Phase 2: since everyone said yes, the coordinator tells all of them to commit, and they free their locks. Below: if the coordinator crashes after the votes, the three participants are stuck waiting with their rows still locked."
      caption="A yes vote is a promise to obey the coordinator. That is why a crashed coordinator leaves everyone frozen, holding their locks."
    >
      <TwoPcPanel x0={30} phase={1} />
      <TwoPcPanel x0={480} phase={2} />

      <Group x={30} y={370} w={860} h={120} label="If the coordinator crashes after the votes" tone="rose" />
      <Box x={60} y={410} w={200} h={60} label="Coordinator" note="crashed" tone="rose" dashed />
      <Line d={path([260, 440], [420, 440])} color={tones.rose.stroke} dashed />
      <Label x={340} y={420} text="no answer comes" size={14} weight={600} color={tones.rose.text} />
      {stuck.map((n, i) => (
        <Box key={n} x={420 + i * 156} y={410} w={136} h={60} label={n} note="stuck, locked" tone="sun" />
      ))}
    </Diagram>
  );
}

function SagaCompensation() {
  const f1 = path([240, 95], [340, 95]);
  const f2 = path([540, 95], [640, 95]);
  const back1 = path([750, 130], [750, 255], [540, 255]);
  const back2 = path([340, 255], [240, 255]);
  return (
    <Diagram
      id="tx-saga-compensation"
      width={900}
      height={360}
      title="A saga undoes finished steps in reverse"
      description="A trip is booked in three steps. Step 1, book flight, is saved. Step 2, book hotel, is saved. Step 3, rent a car, fails because none are left. So the saga runs the undo steps in reverse order: first cancel the hotel, then cancel the flight."
      caption="Each step saves on its own. When a later step fails, the undo steps run backward, newest first."
    >
      <Box x={40} y={60} w={200} h={70} label="1. Book flight" note="saved" tone="mint" />
      <Box x={340} y={60} w={200} h={70} label="2. Book hotel" note="saved" tone="mint" />
      <Box x={640} y={60} w={220} h={70} label="3. Rent a car" note="fails: none left" tone="rose" />
      <Arrow d={f1} tone="mint" />
      <Arrow d={f2} tone="mint" />
      <Traveler d={f1} dur={2} tone="mint" r={5} />
      <Traveler d={f2} dur={2} delay={1} tone="mint" r={5} />

      <Label x={410} y={180} text="the car failed, so undo the finished steps, newest first" size={14} weight={600} color={tones.rose.text} />

      <Box x={340} y={220} w={200} h={70} label="Cancel hotel" note="undo step 2" tone="sun" />
      <Box x={40} y={220} w={200} h={70} label="Cancel flight" note="undo step 1" tone="sun" />
      <Arrow d={back1} tone="rose" />
      <Arrow d={back2} tone="rose" />
      <Traveler d={back1} dur={3} tone="rose" r={5} />

      <Label x={450} y={322} text="In between, others could see the hotel booked, then canceled." size={14} />
    </Diagram>
  );
}

function OrchVsChoreo() {
  const L = 30;
  const R = 460;
  const lcx = L + 205;
  const services = ["Flight", "Hotel", "Car"];
  const fh = path([R + 130, 110], [R + 250, 110]);
  const hc = path([R + 290, 140], [R + 290, 240]);
  const failHotel = path([R + 330, 240], [R + 330, 140]);
  const failFlight = path([R + 250, 270], [R + 75, 270], [R + 75, 140]);
  return (
    <Diagram
      id="tx-orch-vs-choreo"
      width={900}
      height={420}
      title="Orchestration versus choreography"
      description="Left, orchestration: one orchestrator tells the flight, hotel and car services what to do, one by one, and hears back from each. Right, choreography: the flight service announces flight booked, the hotel service hears it and books, then announces hotel booked, which the car service hears. When the car fails, it announces car failed, and the hotel and flight services each undo their own step."
      caption="Left: one conductor knows the whole plan. Right: no conductor, each service reacts to the events it hears."
    >
      <Group x={L} y={30} w={410} h={360} label="Orchestration: a conductor" />
      <Box x={L + 95} y={70} w={220} h={70} label="Orchestrator" note={["the conductor:", "knows every step"]} tone="grape" />
      {services.map((s, i) => {
        const px = L + 20 + i * 127;
        const d = path([lcx + (i - 1) * 40, 140], [px + 58, 246]);
        return (
          <g key={s}>
            <Arrow d={d} tone="grape" both />
            <Traveler d={d} dur={2.4} delay={i * 0.8} tone="grape" r={5} />
            <Box x={px} y={246} w={116} h={64} label={s} note={`step ${i + 1}`} tone="sky" />
          </g>
        );
      })}
      <Label x={lcx} y={340} text={["The whole plan lives in one place.", "Risk: the conductor does too much."]} size={14} />

      <Group x={R} y={30} w={410} h={360} label="Choreography: dancers and music" />
      <Box x={R + 20} y={80} w={110} h={60} label="Flight" note="step 1" tone="sky" />
      <Box x={R + 250} y={80} w={120} h={60} label="Hotel" note="step 2" tone="sky" />
      <Box x={R + 250} y={240} w={120} h={60} label="Car" note="step 3, fails" tone="rose" />
      <Arrow d={fh} tone="mint" />
      <Arrow d={hc} tone="mint" />
      <Traveler d={fh} dur={2} tone="mint" r={5} />
      <Traveler d={hc} dur={2} delay={1} tone="mint" r={5} />
      <Label x={R + 190} y={92} text="flight booked" size={13} weight={600} color={tones.mint.text} />
      <Label x={R + 278} y={190} text="hotel booked" anchor="end" size={13} weight={600} color={tones.mint.text} />
      <Arrow d={failHotel} tone="rose" dashed />
      <Arrow d={failFlight} tone="rose" dashed />
      <Label x={R + 165} y={252} text="car failed: undo" size={13} weight={600} color={tones.rose.text} />
      <Label x={R + 205} y={340} text={["Loosely tied and easy to add to.", "Risk: the flow is hard to see."]} size={14} />
    </Diagram>
  );
}

function DualWrite() {
  const save = path([260, 140], [600, 75]);
  return (
    <Diagram
      id="tx-dual-write"
      width={900}
      height={330}
      title="The dual write problem"
      description="The order service saves a new order in its database, which works. Then it crashes before sending the order placed message to the message broker, so the message is never sent and the warehouse never hears about the order."
      caption="Two separate systems cannot be saved in one step. A crash in the gap leaves them disagreeing."
    >
      <Box x={60} y={120} w={200} h={80} label="Order service" note="saves, then sends" tone="sky" />
      <Box x={600} y={40} w={240} h={70} label="Database" note="order saved" tone="mint" />
      <Box x={600} y={210} w={240} h={70} label="Message broker" note="never hears about it" tone="rose" dashed />
      <Arrow d={save} tone="mint" />
      <Traveler d={save} dur={2.4} tone="mint" r={5} />
      <Label x={380} y={80} text="1. save order: ok" size={14} weight={600} color={tones.mint.text} />
      <Line d={path([260, 180], [420, 214])} color={tones.sky.stroke} dashed />
      <Cross cx={432} cy={217} />
      <Label x={380} y={252} text="2. crash before sending" size={14} weight={600} color={tones.rose.text} />
      <Label x={450} y={300} text="Now the order exists, but the warehouse never packs it." size={14} />
    </Diagram>
  );
}

function Outbox() {
  const toOrders = path([186, 185], [256, 135]);
  const toOutbox = path([186, 215], [256, 265]);
  const toRelay = path([476, 265], [566, 265]);
  const publish = path([646, 230], [646, 160]);
  const deliver = path([711, 125], [760, 125]);
  return (
    <Diagram
      id="tx-outbox"
      width={920}
      height={420}
      title="The transactional outbox"
      description="The order service saves a new order row and an outbox row holding the message, both in one transaction in the same database, so both are saved or neither is. A separate relay reads new outbox rows, publishes them to the broker, and marks them sent. The broker delivers the message to the warehouse, which skips any repeats."
      caption="The database makes the order and its message one all or nothing save. The relay does the sending later."
    >
      <Box x={36} y={165} w={150} h={70} label="Order service" note="one save" tone="sky" />
      <Group x={236} y={50} w={260} h={280} label="Database: one transaction" tone="mint" filled />
      <Box x={256} y={100} w={220} h={70} label="Orders table" note="new order row" tone="white" />
      <Box x={256} y={230} w={220} h={70} label="Outbox table" note="message to send" tone="white" />
      <Arrow d={toOrders} tone="mint" />
      <Arrow d={toOutbox} tone="mint" />
      <Traveler d={toOrders} dur={2.4} tone="mint" r={5} />
      <Traveler d={toOutbox} dur={2.4} tone="mint" r={5} />

      <Box x={566} y={230} w={160} h={70} label="Relay" note={["reads new rows,", "sends, marks sent"]} tone="grape" />
      <Box x={581} y={90} w={130} h={70} label="Broker" note="the post office" tone="sun" />
      <Box x={760} y={90} w={130} h={70} label="Warehouse" note="skips repeats" tone="sky" />
      <Arrow d={toRelay} tone="grape" />
      <Arrow d={publish} tone="grape" />
      <Arrow d={deliver} tone="sun" />
      <Traveler d={toRelay} dur={2.4} delay={1.2} tone="grape" r={5} />
      <Traveler d={publish} dur={2.4} tone="grape" r={5} />
      <Label x={521} y={247} text="reads" size={13} weight={600} color={tones.grape.text} />
      <Label x={658} y={195} text="publish" anchor="start" size={13} weight={600} color={tones.grape.text} />

      <Label
        x={460}
        y={366}
        text={["If the relay crashes after sending but before marking sent, it sends again.", "So delivery is at least once, and the warehouse must skip repeats."]}
        size={14}
      />
    </Diagram>
  );
}

export const transactionsDiagrams = {
  "tx-wal": WriteAheadLog,
  "tx-2pc": TwoPhaseCommit,
  "tx-saga-compensation": SagaCompensation,
  "tx-orch-vs-choreo": OrchVsChoreo,
  "tx-dual-write": DualWrite,
  "tx-outbox": Outbox,
};
