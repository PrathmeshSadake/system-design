import { Arrow, Box, Diagram, Group, Label, Line, Pulse, Traveler, ink, path, tones } from "./primitives";

function Cross({ cx, cy, size = 8 }: { cx: number; cy: number; size?: number }) {
  return (
    <g className="blink">
      <Line d={path([cx - size, cy - size], [cx + size, cy + size])} color={tones.rose.stroke} width={3} />
      <Line d={path([cx - size, cy + size], [cx + size, cy - size])} color={tones.rose.stroke} width={3} />
    </g>
  );
}

function CapPartition() {
  const write = path([160, 100], [160, 170]);
  const read = path([740, 100], [740, 170]);
  const leftString = path([260, 210], [424, 210]);
  return (
    <Diagram
      id="dist-cap-partition"
      width={900}
      height={470}
      title="CAP: two treehouses and a cut string"
      description="Kid 1 saves a new score of 7 in treehouse A. The string telephone to treehouse B is cut, so B still has the old score of 5. When kid 2 asks treehouse B for the score, B must choose: refuse and say try later, which keeps answers correct, or answer 5, which always answers but may be old."
      caption="While the string is cut, B cannot have both. It can be correct and sometimes silent, or always answer and sometimes be out of date."
    >
      <Box x={75} y={40} w={170} h={60} label="Kid 1" note="saves score 7" tone="white" />
      <Box x={655} y={40} w={170} h={60} label="Kid 2" note="asks the score" tone="white" />
      <Box x={60} y={170} w={200} h={80} label="Treehouse A" note="score is 7" tone="mint" />
      <Box x={640} y={170} w={200} h={80} label="Treehouse B" note="still says 5" tone="sun" />
      <Arrow d={write} tone="slate" />
      <Arrow d={read} tone="slate" />
      <Label x={172} y={135} text="write" anchor="start" size={14} weight={600} color={tones.slate.text} />
      <Label x={752} y={135} text="read" anchor="start" size={14} weight={600} color={tones.slate.text} />
      <Traveler d={write} dur={2} tone="mint" r={5} />
      <Traveler d={leftString} dur={2.4} tone="mint" r={5} />

      <Line d={leftString} color={tones.sun.stroke} width={3} />
      <Line d={path([476, 210], [640, 210])} color={tones.sun.stroke} width={3} />
      <Cross cx={450} cy={210} />
      <Label x={450} y={182} text="string telephone is cut" size={14} weight={600} color={tones.rose.text} />
      <Label x={450} y={238} text="(a partition)" size={14} />

      <Group x={40} y={290} w={820} h={150} label="While the string is cut, treehouse B must pick one" />
      <Box
        x={64}
        y={334}
        w={372}
        h={84}
        label="Pick consistency (C)"
        note={["B says: sorry, try again later", "never wrong, but may not answer"]}
        tone="sky"
      />
      <Box
        x={464}
        y={334}
        w={372}
        h={84}
        label="Pick availability (A)"
        note={["B says: the score is 5", "always answers, but may be old"]}
        tone="sun"
      />
    </Diagram>
  );
}

function PacelcTree() {
  const toP = path([450, 100], [240, 170]);
  const toE = path([450, 100], [660, 170]);
  const leaves = [
    { x: 40, from: 240, label: "PA: answer anyway", note: "may give old data", tone: "sun" as const },
    { x: 250, from: 240, label: "PC: wait or refuse", note: "never gives old data", tone: "sky" as const },
    { x: 460, from: 660, label: "EL: answer fast", note: "nearest copy, may lag", tone: "sun" as const },
    { x: 670, from: 660, label: "EC: check first", note: "slower, always fresh", tone: "sky" as const },
  ];
  return (
    <Diagram
      id="dist-pacelc-tree"
      width={900}
      height={460}
      title="PACELC as a decision tree"
      description="First question: is the network split? If yes, choose availability, answering anyway with possibly old data, or consistency, waiting or refusing. If no, on a normal day, choose latency, answering fast from the nearest copy that may lag, or consistency, checking with the others first, which is slower but always fresh."
      caption="CAP only covers the left branch. PACELC reminds us that the right branch, a normal day, has a trade-off too."
    >
      <Box x={320} y={36} w={260} h={64} label="Is the network split?" note="a partition (P)" tone="slate" />
      <Arrow d={toP} tone="rose" />
      <Arrow d={toE} tone="mint" />
      <Label x={320} y={130} text="yes, split (P)" anchor="end" size={14} weight={600} color={tones.rose.text} />
      <Label x={580} y={130} text="no, normal day (E)" anchor="start" size={14} weight={600} color={tones.mint.text} />
      <Box x={90} y={170} w={300} h={56} label="Availability or Consistency?" tone="rose" />
      <Box x={510} y={170} w={300} h={56} label="Latency or Consistency?" tone="mint" />
      {leaves.map((l) => (
        <g key={l.label}>
          <Arrow d={path([l.from, 226], [l.x + 95, 290])} tone="slate" />
          <Box x={l.x} y={290} w={190} h={70} label={l.label} note={l.note} tone={l.tone} />
        </g>
      ))}
      <Label
        x={450}
        y={400}
        text={["Read it as: if P, then A or C. Else, L or C.", "Cassandra (default settings) is PA/EL. Google Spanner is PC/EC."]}
        size={14}
      />
    </Diagram>
  );
}

function QuorumOverlap() {
  const xs = [70, 230, 390, 550, 710];
  return (
    <Diagram
      id="dist-quorum-overlap"
      width={900}
      height={310}
      title="Any two majorities share a member"
      description="Five nodes stand in a row. Nodes 1, 2 and 3 form a majority that picked red. Any other majority, such as nodes 3, 4 and 5, must include at least one node from the first group, here node 3, which remembers red. So two different values can never both be chosen."
      caption="With 5 nodes, any 3 make a majority. Two groups of 3 cannot avoid each other, so someone always remembers the earlier choice."
    >
      <Line d={path([70, 100], [70, 84], [510, 84], [510, 100])} color={tones.grape.stroke} width={2.5} />
      <Label x={290} y={60} text="Majority 1: nodes 1, 2, 3 picked red" size={14} weight={600} color={tones.grape.text} />
      {xs.map((x, i) => (
        <Box
          key={x}
          x={x}
          y={114}
          w={120}
          h={64}
          label={`Node ${i + 1}`}
          note={i === 2 ? "in both" : undefined}
          tone={i === 2 ? "sun" : "sky"}
        />
      ))}
      <Line d={path([390, 192], [390, 208], [830, 208], [830, 192])} color={tones.mint.stroke} width={2.5} />
      <Label x={610} y={232} text="Majority 2: nodes 3, 4, 5" size={14} weight={600} color={tones.mint.text} />
      <Label x={450} y={272} text="Node 3 is in both groups, so it will tell majority 2 that red was already picked." size={14} />
    </Diagram>
  );
}

function PaxosPanel({ x0, phase }: { x0: number; phase: 1 | 2 }) {
  const cx = x0 + 210;
  const accX = [x0 + 18, x0 + 149, x0 + 280];
  const proposerNote = phase === 1 ? ["prepare(5): promise to", "ignore tickets below 5?"] : ["accept(5, red)", "red: nobody had a value"];
  return (
    <g>
      <Group x={x0} y={30} w={420} h={340} label={phase === 1 ? "Phase 1: prepare and promise" : "Phase 2: accept and accepted"} />
      <Box x={x0 + 95} y={70} w={230} h={74} label="Proposer" note={proposerNote} tone="sky" />
      {accX.map((ax, i) => {
        const asleep = i === 2;
        const d = path([cx + (i - 1) * 40, 144], [ax + 61, 234]);
        const note = asleep ? ["asleep,", "no reply"] : phase === 1 ? ["promise 5,", "had nothing"] : ["accepted", "5, red"];
        return (
          <g key={ax}>
            <Arrow d={d} tone={asleep ? "rose" : "slate"} dashed={asleep} both={!asleep} />
            {!asleep ? <Traveler d={d} dur={2.4} delay={phase === 1 ? 0 : 1.2} tone="sky" r={5} /> : null}
            <Box
              x={ax}
              y={234}
              w={122}
              h={74}
              label="Acceptor"
              note={note}
              tone={asleep ? "rose" : phase === 1 ? "white" : "mint"}
              dashed={asleep}
            />
          </g>
        );
      })}
      <Label
        x={cx}
        y={342}
        text={phase === 1 ? "2 of 3 promised: a majority" : "2 of 3 accepted: red is chosen"}
        size={14}
        weight={600}
        color={phase === 1 ? ink : tones.mint.text}
      />
    </g>
  );
}

function PaxosPhases() {
  return (
    <Diagram
      id="dist-paxos-phases"
      width={920}
      height={400}
      title="The two phases of Paxos"
      description="Phase 1: a proposer sends prepare with ticket 5 to three acceptors. Two of them promise to ignore lower tickets and report that they have accepted nothing yet; the third is asleep. Phase 2: since nobody had a value, the proposer may use its own, red, and sends accept 5 red. The same two acceptors accept it, a majority, so red is chosen."
      caption="If an acceptor had reported an earlier value in phase 1, the proposer would have to propose that value instead of red."
    >
      <PaxosPanel x0={30} phase={1} />
      <PaxosPanel x0={470} phase={2} />
    </Diagram>
  );
}

function RaftElection() {
  const followers = [
    { x: 50, y: 74, label: "Node A", d: path([230, 180], [160, 138]) },
    { x: 360, y: 74, label: "Node C", d: path([350, 180], [420, 138]) },
    { x: 360, y: 306, label: "Node D", d: path([350, 264], [420, 306]) },
  ];
  const toE = path([230, 264], [160, 306]);
  const steps = [
    { y: 76, lines: ["1. Leader E crashed, so the", "heartbeats stopped."] },
    { y: 142, lines: ["2. B's random timer rang first.", "B moved to term 4 and voted", "for itself."] },
    { y: 226, lines: ["3. B asked for votes. A, C and", "D had not voted in term 4,", "so each said yes."] },
    { y: 310, lines: ["4. 4 of 5 votes (3 was enough).", "B is leader and sends", "heartbeats to everyone."] },
  ];
  return (
    <Diagram
      id="dist-raft-election"
      width={900}
      height={440}
      title="A Raft leader election in term 4"
      description="Five nodes. Node E, the old leader, has crashed. Node B's random timer ran out first, so it moved to term 4, voted for itself and asked the others for votes. Nodes A, C and D had not voted in term 4 and each voted yes. With 4 of 5 votes, more than the 3 needed, B became leader and now sends heartbeats to everyone."
      caption="The moving dots are B's heartbeats. As long as they keep arriving, nobody else starts an election."
    >
      <Group x={30} y={30} w={520} h={380} label="Term 4 election (5 nodes)" />
      <Box x={190} y={180} w={200} h={84} label="Node B" note={["candidate, then leader", "4 of 5 votes"]} tone="sun" />
      {followers.map((f) => (
        <g key={f.label}>
          <Box x={f.x} y={f.y} w={170} h={64} label={f.label} note="votes yes" tone="mint" />
          <Arrow d={f.d} tone="sun" />
          <Traveler d={f.d} dur={1.6} tone="sun" r={5} />
        </g>
      ))}
      <Box x={50} y={306} w={170} h={64} label="Node E" note={["old leader,", "crashed"]} tone="rose" dashed />
      <Arrow d={toE} tone="rose" dashed />

      <Group x={570} y={30} w={300} h={380} label="What happened" />
      {steps.map((s) => (
        <Label key={s.y} x={590} y={s.y} text={s.lines} anchor="start" size={14} color={ink} />
      ))}
    </Diagram>
  );
}

function FencingTokens() {
  const lanes = [
    { y: 90, label: "Client 1" },
    { y: 180, label: "Lock keeper" },
    { y: 270, label: "Client 2" },
    { y: 360, label: "Storage" },
  ];
  const grant33 = path([230, 180], [230, 90]);
  const grant34 = path([520, 180], [520, 270]);
  const write34 = path([600, 270], [600, 360]);
  const write33 = path([790, 90], [790, 360]);
  return (
    <Diagram
      id="dist-fencing-tokens"
      width={900}
      height={440}
      title="Fencing tokens stop a frozen lock holder"
      description="Time moves to the right. The lock keeper lends the lock to client 1 with token 33. Client 1 freezes in a long pause and its lease runs out. The lock keeper lends the lock to client 2 with token 34, and client 2 writes to storage with token 34, which is accepted. Client 1 wakes up still believing it holds the lock and writes with token 33. Storage has already seen 34, so it rejects the write."
      caption="Time moves left to right. Client 1 cannot know it was frozen, so the storage, not the client, has to catch the stale write."
    >
      {lanes.map((l) => (
        <Box key={l.label} x={30} y={l.y - 24} w={130} h={48} label={l.label} tone={l.label === "Lock keeper" ? "grape" : l.label === "Storage" ? "slate" : "sky"} />
      ))}
      <Line d={path([160, 90], [290, 90])} dashed />
      <Line d={path([560, 90], [870, 90])} dashed />
      {lanes.slice(1).map((l) => (
        <Line key={l.label} d={path([160, l.y], [870, l.y])} dashed />
      ))}

      <Box x={290} y={68} w={270} h={44} label="frozen in a long pause" tone="sun" dashed />

      <Arrow d={grant33} tone="grape" />
      <Label x={242} y={135} text="lock, token 33" anchor="start" size={14} weight={600} color={tones.grape.text} />

      <Line d={path([400, 166], [400, 194])} color={tones.rose.stroke} width={3} />
      <Label x={400} y={208} text="lease for 33 ends" size={14} color={tones.rose.text} weight={600} />

      <Arrow d={grant34} tone="grape" />
      <Label x={532} y={225} text="lock, token 34" anchor="start" size={14} weight={600} color={tones.grape.text} />

      <Arrow d={write34} tone="mint" />
      <Traveler d={write34} dur={2} tone="mint" r={5} />
      <Label x={612} y={315} text="write, token 34" anchor="start" size={14} weight={600} color={tones.mint.text} />
      <Label x={600} y={386} text="accepted" size={14} weight={700} color={tones.mint.text} />

      <Arrow d={write33} tone="rose" />
      <Traveler d={write33} dur={3} delay={1} tone="rose" r={5} />
      <Label x={778} y={135} text="write, token 33" anchor="end" size={14} weight={600} color={tones.rose.text} />
      <Label x={780} y={386} text={["rejected:", "33 is less than 34"]} size={14} weight={700} color={tones.rose.text} />
      <Pulse cx={790} cy={360} r={12} tone="rose" />
    </Diagram>
  );
}

export const distributedDiagrams = {
  "dist-cap-partition": CapPartition,
  "dist-pacelc-tree": PacelcTree,
  "dist-quorum-overlap": QuorumOverlap,
  "dist-paxos-phases": PaxosPhases,
  "dist-raft-election": RaftElection,
  "dist-fencing-tokens": FencingTokens,
};
