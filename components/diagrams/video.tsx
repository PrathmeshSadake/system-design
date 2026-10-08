import { Arrow, Box, Diagram, Label, Line, Traveler, path, tones } from "./primitives";

function VideoTranscodePipeline() {
  const workerY = [180, 300, 420];
  const down1 = path([111, 104], [111, 153]);
  const down2 = path([111, 217], [111, 266]);
  const toQueue = path([186, 300], [236, 300]);
  const fanOut = workerY.map((y) => path([376, 300], [476, y]));
  const fanIn = workerY.map((y, i) => path([616, y], [696, 285 + i * 15]));
  const toOrigin = path([771, 266], [771, 128]);
  const retry = path([546, 450], [546, 474], [306, 474], [306, 334]);
  return (
    <Diagram
      id="video-transcode-pipeline"
      width={900}
      height={510}
      title="Chunked transcoding with many workers at once"
      description="An uploaded video is stored as an original, then cut into short chunks at keyframes. One job per chunk goes into a queue. Three workers take jobs at the same time and encode each chunk into every size. A packager builds HLS and DASH files and saves them in origin storage. A failed chunk goes back into the queue on its own."
      caption="Each chunk is its own small job. Workers run side by side, and a failed chunk is simply put back in the queue."
    >
      <Box x={36} y={40} w={150} h={64} label="Upload" note="one big file" tone="slate" />
      <Box x={36} y={153} w={150} h={64} label="Original" note="kept safe" tone="slate" />
      <Box x={36} y={266} w={150} h={68} label="Splitter" note="cut at keyframes" tone="sun" />
      <Box x={236} y={266} w={140} h={68} label="Job queue" note="one per chunk" tone="sun" />
      <Label x={546} y={128} text="workers run side by side" size={14} weight={600} color={tones.sky.text} />
      {workerY.map((y, i) => (
        <Box key={y} x={476} y={y - 30} w={140} h={60} label={`Worker ${i + 1}`} note="all sizes" tone="sky" />
      ))}
      <Box x={696} y={266} w={150} h={68} label="Packager" note="HLS and DASH" tone="grape" />
      <Box x={696} y={60} w={150} h={68} label="Origin" note="ready to stream" tone="mint" />

      <Arrow d={down1} tone="slate" />
      <Arrow d={down2} tone="slate" />
      <Arrow d={toQueue} tone="slate" />
      {fanOut.map((d) => (
        <Arrow key={d} d={d} tone="slate" />
      ))}
      {fanIn.map((d) => (
        <Arrow key={d} d={d} tone="slate" />
      ))}
      <Arrow d={toOrigin} tone="mint" />
      <Arrow d={retry} tone="rose" dashed />
      <Label x={294} y={404} text={["failed chunk?", "retry only it"]} anchor="end" size={14} weight={600} color={tones.rose.text} />

      <Traveler d={toQueue} dur={1.2} tone="sun" r={5} />
      {fanOut.map((d, i) => (
        <Traveler key={d} d={d} dur={1.8} delay={i * 0.6} tone="sun" r={5} />
      ))}
      {fanIn.map((d, i) => (
        <Traveler key={d} d={d} dur={1.8} delay={0.9 + i * 0.6} tone="sky" r={5} />
      ))}
      <Traveler d={toOrigin} dur={1.8} delay={0.3} tone="mint" r={5} />
      <Traveler d={retry} dur={4} delay={1} tone="rose" r={5} />
    </Diagram>
  );
}

function VideoBitrateLadder() {
  const rungs = [
    { label: "1080p", note: "about 5 Mbps", w: 440, tone: "mint" as const },
    { label: "720p", note: "about 3 Mbps", w: 360, tone: "sky" as const },
    { label: "480p", note: "about 1.5 Mbps", w: 280, tone: "sun" as const },
    { label: "360p", note: "about 0.8 Mbps", w: 200, tone: "grape" as const },
  ];
  const ys = [60, 130, 200, 270];
  const arrows = ys.map((y, i) => path([220, 178 + i * 8], [360, y + 26]));
  return (
    <Diagram
      id="video-bitrate-ladder"
      width={860}
      height={400}
      title="One chunk becomes a ladder of versions"
      description="A single four second chunk is encoded into four versions: 1080p at about 5 megabits per second, 720p at about 3, 480p at about 1.5 and 360p at about 0.8."
      caption="Bigger pictures need more data every second. Example numbers for one common codec; real ladders are tuned per video."
    >
      <Box x={40} y={150} w={180} h={84} label="One chunk" note="4 seconds long" tone="slate" />
      {rungs.map((r, i) => (
        <Box key={r.label} x={360} y={ys[i]} w={r.w} h={52} label={r.label} note={r.note} tone={r.tone} />
      ))}
      {arrows.map((d, i) => (
        <g key={d}>
          <Arrow d={d} tone="slate" />
          <Traveler d={d} dur={2} delay={i * 0.4} tone="sun" r={5} />
        </g>
      ))}
      <Label x={430} y={360} text="All versions start at the same moment, so the player can switch between them." size={14} />
    </Diagram>
  );
}

function VideoAbrSwitching() {
  const slotX = (i: number) => 200 + i * 80;
  const level = { fast: 70, medium: 110, slow: 150 };
  const speedLine = path(
    [200, level.fast],
    [475, level.fast],
    [475, level.slow],
    [595, level.slow],
    [595, level.medium],
    [675, level.medium],
    [675, level.fast],
    [830, level.fast],
  );
  const heights = { "1080p": 90, "720p": 70, "480p": 52, "360p": 38 } as const;
  const toneOf = { "1080p": "mint", "720p": "sky", "480p": "sun", "360p": "rose" } as const;
  const picked: (keyof typeof heights)[] = ["480p", "1080p", "1080p", "1080p", "360p", "480p", "720p", "1080p"];
  const base = 330;
  return (
    <Diagram
      id="video-abr-switching"
      width={880}
      height={430}
      title="The player picks a quality for each next chunk"
      description="Over eight chunks the network is fast, turns slow in the middle of chunk 4, becomes medium, then fast again. The player starts at 480p, climbs to 1080p, drops to 360p for the next chunk after the network slows, then climbs back one step at a time through 480p and 720p to 1080p."
      caption="It starts low so the video begins quickly, drops fast when the network slows, and climbs back carefully."
    >
      <Label x={40} y={40} text="Network speed" anchor="start" size={15} weight={700} color={tones.sky.text} />
      <Label x={186} y={level.fast} text="fast" anchor="end" size={14} />
      <Label x={186} y={level.medium} text="medium" anchor="end" size={14} />
      <Label x={186} y={level.slow} text="slow" anchor="end" size={14} />
      <Line d={speedLine} color={tones.sky.stroke} width={3} />
      <Traveler d={speedLine} dur={8} tone="sky" r={6} />

      <Label x={40} y={205} text="Quality picked" anchor="start" size={15} weight={700} color={tones.slate.text} />
      {picked.map((q, i) => {
        const h = heights[q];
        return (
          <g key={i} className={i === 4 ? "blink" : undefined}>
            <Box x={slotX(i)} y={base - h} w={70} h={h} label={q} tone={toneOf[q]} size={14} rx={8} />
          </g>
        );
      })}
      {picked.map((_, i) => (
        <Label key={i} x={slotX(i) + 35} y={352} text={`chunk ${i + 1}`} size={13} />
      ))}
      <Label x={440} y={392} text="Each chunk is a few seconds of video. The choice is made again before every chunk." size={14} />
    </Diagram>
  );
}

function VideoCdnTiers() {
  const edgeX = [75, 275, 475, 675];
  const edgeLink = [
    path([150, 380], [220, 328]),
    path([350, 380], [280, 328]),
    path([550, 380], [620, 328]),
    path([750, 380], [680, 328]),
  ];
  const aToShield = path([250, 264], [420, 214]);
  const bToShield = path([650, 264], [480, 214]);
  const toOrigin = path([450, 150], [450, 104]);
  const notes = [
    { text: "hit: served here", color: tones.mint.text },
    { text: "miss: ask upstairs", color: tones.rose.text },
    { text: "miss: ask upstairs", color: tones.rose.text },
    { text: "hit: served here", color: tones.mint.text },
  ];
  return (
    <Diagram
      id="video-cdn-tiers"
      width={900}
      height={540}
      title="Misses climb the CDN one level at a time"
      description="Four edge servers sit near viewers. Edges 1 and 4 already have the chunk and serve it right away. Edges 2 and 3 miss, so they ask their regional caches. Both regional caches miss too and ask the origin shield, which merges the two identical requests into one request to origin storage."
      caption="Each level keeps a copy on the way back down, so the next viewer nearby gets a hit at the edge."
    >
      <Box x={350} y={40} w={200} h={64} label="Origin storage" note="the main warehouse" tone="slate" />
      <Box x={350} y={150} w={200} h={64} label="Origin shield" note="merges misses" tone="grape" />
      <Box x={150} y={264} w={200} h={64} label="Regional cache" note="serves many edges" tone="sky" />
      <Box x={550} y={264} w={200} h={64} label="Regional cache" note="serves many edges" tone="sky" />
      {edgeX.map((x, i) => (
        <Box key={x} x={x} y={380} w={150} h={60} label={`Edge ${i + 1}`} note="near viewers" tone={i === 0 || i === 3 ? "mint" : "sun"} />
      ))}
      {notes.map((n, i) => (
        <Label key={i} x={edgeX[i] + 75} y={464} text={n.text} size={14} weight={600} color={n.color} />
      ))}

      <Line d={edgeLink[0]} />
      <Line d={edgeLink[3]} />
      <Arrow d={edgeLink[1]} tone="rose" dashed />
      <Arrow d={edgeLink[2]} tone="rose" dashed />
      <Arrow d={aToShield} tone="rose" dashed />
      <Arrow d={bToShield} tone="rose" dashed />
      <Arrow d={toOrigin} tone="grape" />
      <Label x={440} y={127} text="one request" anchor="end" size={14} weight={600} color={tones.grape.text} />
      <Label x={572} y={168} text={["two misses for the same", "chunk become one trip"]} anchor="start" size={14} />

      <Traveler d={edgeLink[1]} dur={1.6} tone="rose" r={5} />
      <Traveler d={edgeLink[2]} dur={1.6} tone="rose" r={5} />
      <Traveler d={aToShield} dur={2} delay={1} tone="rose" r={5} />
      <Traveler d={bToShield} dur={2} delay={1} tone="rose" r={5} />
      <Traveler d={toOrigin} dur={1.4} delay={0.5} tone="grape" r={5} />
      <Label x={450} y={500} text="Viewers always ask the closest edge first." size={14} />
    </Diagram>
  );
}

export const videoDiagrams = {
  "video-transcode-pipeline": VideoTranscodePipeline,
  "video-bitrate-ladder": VideoBitrateLadder,
  "video-abr-switching": VideoAbrSwitching,
  "video-cdn-tiers": VideoCdnTiers,
};
