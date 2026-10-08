import { Arrow, Box, Diagram, Label, Line, Pulse, Traveler, path, tones } from "./primitives";

function FraudPipeline() {
  const toScoring = path([186, 85], [476, 85]);
  const toDecision = path([626, 85], [716, 85]);
  const toKafka = path([111, 120], [111, 220]);
  const toFlink = path([186, 255], [256, 255]);
  const toOnline = path([406, 255], [476, 255]);
  const readClues = path([551, 220], [551, 120]);
  const toOffline = path([331, 290], [331, 390]);
  const labelsIn = path([186, 425], [256, 425]);
  const toTraining = path([406, 425], [476, 425]);
  const newModel = path([626, 410], [671, 410], [671, 105], [626, 105]);
  const toLog = path([791, 130], [791, 390]);
  const logToTraining = path([716, 440], [626, 440]);
  return (
    <Diagram
      id="fraud-pipeline"
      width={900}
      height={500}
      title="From card swipe to decision, and back to training"
      description="The payment API asks the scoring service whether a swipe is OK. The scoring service reads ready clues from the online feature store, runs the model and rules, and returns approve, challenge or decline. Every swipe is also written to Kafka. Flink counts swipes in sliding windows and writes the latest clues to the online store and their history to the offline store. Each decision is logged with the clues it used. Fraud reports that arrive weeks later, the decision log and the offline history are used to train a new model, which is sent back to the scoring service."
      caption="The top row must finish in tens of milliseconds. The rows below run in the background and keep the clues and the model fresh."
    >
      <Box x={36} y={50} w={150} h={70} label="Payment API" note="a card swipe" tone="sun" />
      <Box x={476} y={50} w={150} h={70} label={["Scoring", "service"]} note="model and rules" tone="grape" />
      <Box x={716} y={40} w={150} h={90} label="Decision" note={["approve,", "challenge,", "or decline"]} tone="mint" />

      <Box x={36} y={220} w={150} h={70} label="Kafka" note="lanes by card" tone="slate" />
      <Box x={256} y={220} w={150} h={70} label="Flink" note="sliding windows" tone="sky" />
      <Box x={476} y={220} w={150} h={70} label="Online store" note="a few ms" tone="sky" />

      <Box x={36} y={390} w={150} h={70} label="Fraud reports" note="weeks later" tone="rose" />
      <Box x={256} y={390} w={150} h={70} label="Offline store" note="full history" tone="slate" />
      <Box x={476} y={390} w={150} h={70} label="Training" note="new model" tone="grape" />
      <Box x={716} y={390} w={150} h={70} label="Decision log" note="clues and result" tone="slate" />

      <Arrow d={toScoring} tone="sun" />
      <Arrow d={toDecision} tone="mint" />
      <Arrow d={toKafka} tone="slate" />
      <Arrow d={toFlink} tone="slate" />
      <Arrow d={toOnline} tone="sky" />
      <Arrow d={readClues} tone="sky" />
      <Arrow d={toOffline} tone="slate" />
      <Arrow d={labelsIn} tone="rose" />
      <Arrow d={toTraining} tone="slate" />
      <Arrow d={newModel} tone="grape" dashed />
      <Arrow d={toLog} tone="slate" />
      <Arrow d={logToTraining} tone="slate" />

      <Label x={331} y={64} text="is this swipe OK?" size={14} weight={600} color={tones.sun.text} />
      <Label x={123} y={170} text="every swipe" anchor="start" size={14} />
      <Label x={563} y={170} text="read clues" anchor="start" size={14} />
      <Label x={319} y={340} text="history" anchor="end" size={14} />
      <Label x={683} y={330} text="new model" anchor="start" size={14} weight={600} color={tones.grape.text} />

      <Traveler d={toScoring} dur={1.6} tone="sun" r={5} />
      <Traveler d={readClues} dur={1.2} delay={0.4} tone="sky" r={5} />
      <Traveler d={toDecision} dur={1} delay={0.8} tone="mint" r={5} />
      <Traveler d={toKafka} dur={1.6} tone="sun" r={5} />
      <Traveler d={toFlink} dur={1.2} delay={0.6} tone="sun" r={5} />
      <Traveler d={toOnline} dur={1.2} delay={1.2} tone="sky" r={5} />
      <Traveler d={newModel} dur={5} delay={2} tone="grape" r={5} />
    </Diagram>
  );
}

function FraudSlidingWindows() {
  const x0 = 170;
  const perMin = 45;
  const at = (m: number) => x0 + m * perMin;
  const swipes = [1.5, 5, 9.2, 10.3, 10.8, 11.3, 11.8, 12.3, 12.8];
  const windows = [0, 1, 2, 3].map((k) => ({
    k,
    from: k,
    to: k + 10,
    count: swipes.filter((s) => s >= k && s < k + 10).length,
  }));
  const clock = (m: number) => `12:${String(m).padStart(2, "0")}`;
  return (
    <Diagram
      id="fraud-sliding-windows"
      width={880}
      height={430}
      title="A 10 minute window that slides every minute"
      description="Nine swipes of one card are shown on a timeline from 12:00 to 12:14. Four overlapping 10 minute windows start one minute apart. They count 3, 5, 6 and 8 swipes, showing a sudden burst near the end."
      caption="Windows overlap, so each swipe is counted in several of them. The counts stay fresh every minute."
    >
      <Label x={40} y={100} text="Swipes" anchor="start" size={15} weight={700} color={tones.rose.text} />
      <Line d={path([at(0), 100], [at(14), 100])} color="#94a3b8" width={2} />
      {Array.from({ length: 15 }, (_, m) => (
        <Line key={m} d={path([at(m), 94], [at(m), 106])} color="#94a3b8" width={2} />
      ))}
      {[0, 5, 10].map((m) => (
        <Label key={m} x={at(m)} y={130} text={clock(m)} size={13} />
      ))}
      {swipes.map((s) => (
        <circle key={s} cx={at(s)} cy={100} r={7} fill={tones.rose.fill} stroke={tones.rose.stroke} strokeWidth={2} />
      ))}
      <Pulse cx={at(12.8)} cy={100} r={11} tone="rose" />

      {windows.map((w) => {
        const y = 170 + w.k * 50;
        const hot = w.count > 6;
        const tone = hot ? tones.rose : tones.sky;
        return (
          <g key={w.k}>
            <Label x={40} y={y + 15} text={`${clock(w.from)} to ${clock(w.to)}`} anchor="start" size={14} />
            <rect
              x={at(w.from)}
              y={y}
              width={(w.to - w.from) * perMin}
              height={30}
              rx={8}
              fill={tone.fill}
              stroke={tone.stroke}
              strokeWidth={2}
              className="grow"
              style={{ animationDelay: `${w.k * 0.4}s` }}
            />
            <Label
              x={at(w.to) + 12}
              y={y + 15}
              text={`${w.count} swipes`}
              anchor="start"
              size={14}
              weight={hot ? 700 : 400}
              color={hot ? tones.rose.text : undefined}
            />
          </g>
        );
      })}
      <Label x={440} y={386} text="A jump to 8 swipes in 10 minutes is a strong clue that something is wrong." size={14} />
    </Diagram>
  );
}

function FraudTimeBudget() {
  const clockLine = path([40, 292], [840, 292]);
  return (
    <Diagram
      id="fraud-time-budget"
      width={880}
      height={400}
      title="The time budget for one decision"
      description="A whole card payment takes about 300 milliseconds. The fraud check gets about 50 of them. Inside those 50 milliseconds, reading clues takes about 8, running the model about 12 and the rules about 5, leaving about 25 spare. If time runs out, the system answers with rules only."
      caption="Example numbers. Real budgets differ between companies, but the fraud check always gets only a small slice of the payment."
    >
      <Label x={40} y={44} text="One card payment, about 300 ms in all" anchor="start" size={15} weight={700} color={tones.slate.text} />
      <Box x={40} y={66} w={660} h={60} label="Card network and bank steps" note="about 250 ms" tone="slate" />
      <Box x={708} y={66} w={132} h={60} label="Fraud check" note="about 50 ms" tone="rose" />
      <Line d={path([708, 126], [40, 194])} color={tones.rose.stroke} dashed />
      <Line d={path([840, 126], [840, 194])} color={tones.rose.stroke} dashed />

      <Box x={40} y={196} w={124} h={60} label="Read clues" note="8 ms" tone="sky" />
      <Box x={168} y={196} w={188} h={60} label="Run model" note="12 ms" tone="grape" />
      <Box x={360} y={196} w={76} h={60} label="Rules" note="5 ms" tone="sun" />
      <Box x={440} y={196} w={400} h={60} label="Safety room" note="25 ms spare" tone="white" dashed />

      <Arrow d={clockLine} tone="slate" />
      <Traveler d={clockLine} dur={5} tone="rose" r={6} />
      <Label x={40} y={316} text="0 ms" anchor="start" size={14} />
      <Label x={840} y={316} text="50 ms: answer due" anchor="end" size={14} weight={600} color={tones.rose.text} />
      <Label x={440} y={356} text="If the clock runs out, answer with rules only, or a policy chosen in advance." size={14} />
    </Diagram>
  );
}

export const fraudDiagrams = {
  "fraud-pipeline": FraudPipeline,
  "fraud-sliding-windows": FraudSlidingWindows,
  "fraud-time-budget": FraudTimeBudget,
};
