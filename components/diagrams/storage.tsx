import { Arrow, Box, Diagram, Group, Label, Line, Traveler, ink, path, tones } from "./primitives";
import type { Tone } from "./primitives";

/* ------------------------------------------------------------------ */
/* A small table drawn with plain shapes                               */
/* ------------------------------------------------------------------ */

type Row = { cells: string[]; tone?: Tone };

function Table({
  x,
  y,
  cols,
  header,
  rows,
  rowH = 34,
}: {
  x: number;
  y: number;
  cols: number[];
  header: string[];
  rows: Row[];
  rowH?: number;
}) {
  const w = cols.reduce((a, b) => a + b, 0);
  const h = rowH * (rows.length + 1);
  const colX = cols.map((_, i) => x + cols.slice(0, i).reduce((a, b) => a + b, 0));
  const grid = "#cbd5e1";
  return (
    <g>
      <rect x={x} y={y} width={w} height={rowH} fill={tones.slate.fill} />
      {rows.map((r, i) => (
        <rect key={i} x={x} y={y + rowH * (i + 1)} width={w} height={rowH} fill={r.tone ? tones[r.tone].fill : "#ffffff"} />
      ))}
      {rows.map((_, i) => (
        <path key={i} d={`M ${x} ${y + rowH * (i + 1)} H ${x + w}`} stroke={i === 0 ? tones.slate.stroke : grid} strokeWidth={i === 0 ? 1.5 : 1} />
      ))}
      {colX.slice(1).map((cx) => (
        <path key={cx} d={`M ${cx} ${y} V ${y + h}`} stroke={grid} strokeWidth={1} />
      ))}
      <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={tones.slate.stroke} strokeWidth={2} />
      {header.map((t, i) => (
        <Label key={t} x={colX[i] + cols[i] / 2} y={y + rowH / 2} text={t} size={14} weight={700} color={ink} />
      ))}
      {rows.map((r, ri) =>
        r.cells.map((t, ci) => (
          <Label
            key={`${ri}-${ci}`}
            x={colX[ci] + cols[ci] / 2}
            y={y + rowH * (ri + 1) + rowH / 2}
            text={t}
            size={14}
            color={r.tone ? tones[r.tone].text : ink}
          />
        )),
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Relational tables and a join                                        */
/* ------------------------------------------------------------------ */

function Tables() {
  const fromKids = path([175, 206], [330, 280]);
  const fromLunches = path([685, 206], [530, 280]);
  return (
    <Diagram
      id="datastore-tables"
      width={860}
      height={396}
      title="Two linked tables and a join"
      description="A kids table has an id, a name and a class for Ava, Ben and Cy. A lunches table has its own id, a kid_id and a food. Each lunch points to a kid by id. Joining the two tables on kid_id equals id gives Ava with apple and soup, and Cy with pizza."
      caption="The lunches table never copies a name. It stores the kid's id, and the join puts the two together when you ask."
    >
      <Label x={40} y={50} text="Kids table" anchor="start" size={15} weight={700} color={ink} />
      <Table
        x={40}
        y={70}
        cols={[60, 120, 90]}
        header={["id", "name", "class"]}
        rows={[
          { cells: ["1", "Ava", "2B"], tone: "mint" },
          { cells: ["2", "Ben", "2B"] },
          { cells: ["3", "Cy", "3A"], tone: "sun" },
        ]}
      />
      <Label x={550} y={50} text="Lunches table" anchor="start" size={15} weight={700} color={ink} />
      <Table
        x={550}
        y={70}
        cols={[60, 90, 120]}
        header={["id", "kid_id", "food"]}
        rows={[
          { cells: ["10", "1", "apple"], tone: "mint" },
          { cells: ["11", "3", "pizza"], tone: "sun" },
          { cells: ["12", "1", "soup"], tone: "mint" },
        ]}
      />
      <Arrow d={path([550, 87], [310, 87])} tone="grape" dashed />
      <Label x={430} y={118} text={["each lunch points", "to one kid's id"]} size={14} color={tones.grape.text} />

      <Arrow d={fromKids} tone="slate" />
      <Arrow d={fromLunches} tone="slate" />
      <Traveler d={fromKids} dur={2} tone="mint" r={5} />
      <Traveler d={fromLunches} dur={2} tone="mint" r={5} />
      <Box x={230} y={280} w={400} h={80} label="Join on kid_id = id" note={["Ava: apple and soup", "Cy: pizza"]} tone="grape" />
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* The four NoSQL families                                              */
/* ------------------------------------------------------------------ */

function Circle({ cx, cy, name }: { cx: number; cy: number; name: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={26} fill={tones.grape.fill} stroke={tones.grape.stroke} strokeWidth={2} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={700} fill={tones.grape.text}>
        {name}
      </text>
    </g>
  );
}

/** A string between two circles, starting and ending on their edges. */
function edge(a: [number, number], b: [number, number], r = 26) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  return path([a[0] + ux * r, a[1] + uy * r], [b[0] - ux * r, b[1] - uy * r]);
}

function NoSqlShapes() {
  const kv = [
    { key: "cart:7", value: "3 apples, 1 juice" },
    { key: "user:42", value: "Ava, class 2B" },
    { key: "score:ava", value: "9,450 points" },
  ];
  const wide = [
    { key: "ava", cells: ["Mon: 3", "Tue: 5", "Wed: 2"] },
    { key: "ben", cells: ["Mon: 1", "Tue: 4", "Wed: 6", "Thu: 2"] },
    { key: "cy", cells: ["Mon: 7", "Thu: 3"] },
  ];
  const nodes: Record<string, [number, number]> = {
    Ava: [530, 342],
    Ben: [690, 340],
    Cy: [810, 384],
    Dee: [590, 436],
    Eli: [740, 438],
  };
  const links: [string, string][] = [
    ["Ava", "Ben"],
    ["Ben", "Cy"],
    ["Ava", "Dee"],
    ["Dee", "Eli"],
    ["Ben", "Eli"],
  ];
  return (
    <Diagram
      id="datastore-nosql"
      width={900}
      height={506}
      title="Four shapes of NoSQL shelves"
      description="Key-value stores are like lockers: a key such as cart 7 opens to a value. Document stores are like folders: Ava's folder and Ben's folder hold different fields. Wide-column stores are like a sticker book: each row key holds its own sorted set of columns, such as steps per day. Graph databases are like friendship strings connecting Ava, Ben, Cy, Dee and Eli."
      caption="Each family is shaped for a different kind of question. None of them needs every record to have the same fields."
    >
      <Group x={30} y={36} w={410} h={210} label="Key-value: numbered lockers" tone="sky" filled />
      {kv.map((r, i) => {
        const y = 74 + i * 50;
        return (
          <g key={r.key}>
            <Box x={52} y={y} w={120} h={40} label={r.key} tone="sky" />
            <Arrow d={path([172, y + 20], [226, y + 20])} tone="sky" />
            <Box x={226} y={y} w={192} h={40} note={r.value} tone="white" />
          </g>
        );
      })}

      <Group x={460} y={36} w={410} h={210} label="Document: folders of papers" tone="mint" filled />
      <Box x={480} y={72} w={180} h={154} label="Ava's folder" note={["name: Ava", "class: 2B", "pets: cat, fish"]} tone="white" />
      <Box x={670} y={72} w={180} h={154} label="Ben's folder" note={["name: Ben", "class: 2B", "hobby: chess", "best friend: Cy"]} tone="white" />

      <Group x={30} y={266} w={410} h={210} label="Wide-column: a giant sticker book" tone="sun" filled />
      {wide.map((r, i) => {
        const y = 304 + i * 46;
        return (
          <g key={r.key}>
            <Box x={48} y={y} w={70} h={36} label={r.key} tone="sun" size={14} />
            {r.cells.map((c, j) => (
              <Box key={c} x={130 + j * 76} y={y} w={70} h={36} note={c} tone="white" rx={8} />
            ))}
          </g>
        );
      })}

      <Group x={460} y={266} w={410} h={210} label="Graph: friendship strings" tone="grape" filled />
      {links.map(([a, b]) => (
        <Line key={`${a}-${b}`} d={edge(nodes[a], nodes[b])} color={tones.grape.stroke} width={2.5} />
      ))}
      {Object.entries(nodes).map(([name, [cx, cy]]) => (
        <Circle key={name} cx={cx} cy={cy} name={name} />
      ))}
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* B-tree lookup                                                        */
/* ------------------------------------------------------------------ */

function BTree() {
  const leaves = [
    { x: 50, label: "Ava, Ben, Cy" },
    { x: 260, label: "Fay, Gus, Kim" },
    { x: 470, label: "Mo, Nia, Pia" },
    { x: 680, label: "Sam, Tom, Zed" },
  ];
  const rootLeft = path([420, 100], [270, 150]);
  const rootRight = path([480, 100], [630, 150]);
  const lToLeaf1 = path([205, 210], [135, 260]);
  const lToLeaf2 = path([275, 210], [345, 260]);
  const rToLeaf3 = path([625, 210], [555, 260]);
  const rToLeaf4 = path([695, 210], [765, 260]);
  return (
    <Diagram
      id="datastore-btree"
      width={900}
      height={416}
      title="Finding Pia in a B-tree"
      description="The root signpost splits at M: A to L go left, M to Z go right. Pia goes right. The next signpost splits at S: M to R go left, S to Z go right. Pia goes left and reaches the shelf holding Mo, Nia and Pia. The bottom shelves are linked in order so a range search can walk sideways."
      caption="The highlighted path is the search for Pia. Every shelf is the same number of hops from the top."
    >
      <Box x={355} y={40} w={190} h={60} label="Split at M" tone="slate" />
      <Arrow d={rootLeft} tone="slate" />
      <Arrow d={rootRight} tone="rose" width={3} />
      <Label x={330} y={114} text="A to L" anchor="end" size={14} />
      <Label x={570} y={114} text="M to Z" anchor="start" size={14} color={tones.rose.text} weight={700} />

      <Box x={145} y={150} w={190} h={60} label="Split at F" tone="slate" />
      <Box x={565} y={150} w={190} h={60} label="Split at S" tone="rose" />
      <Arrow d={lToLeaf1} tone="slate" />
      <Arrow d={lToLeaf2} tone="slate" />
      <Arrow d={rToLeaf3} tone="rose" width={3} />
      <Arrow d={rToLeaf4} tone="slate" />
      <Label x={156} y={232} text="A to E" anchor="end" size={14} />
      <Label x={332} y={232} text="F to L" anchor="start" size={14} />
      <Label x={578} y={232} text="M to R" anchor="end" size={14} color={tones.rose.text} weight={700} />
      <Label x={752} y={232} text="S to Z" anchor="start" size={14} />

      {leaves.map((l, i) => (
        <Box
          key={l.label}
          x={l.x}
          y={260}
          w={170}
          h={70}
          label={l.label}
          note={i === 2 ? "found Pia" : "and their rows"}
          tone={i === 2 ? "mint" : "white"}
        />
      ))}
      {[220, 430, 640].map((x) => (
        <Arrow key={x} d={path([x, 295], [x + 40, 295])} tone="slate" />
      ))}
      <Traveler d={rootRight} dur={2.4} tone="rose" r={6} />
      <Traveler d={rToLeaf3} dur={2.4} delay={1.2} tone="rose" r={6} />

      <Label x={450} y={362} text="Finding Pia takes 3 hops: right at M, left at S, then the shelf." size={14} color={ink} />
      <Label x={450} y={384} text="Real signposts hold hundreds of keys, so 3 or 4 hops can cover millions of rows." size={14} />
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* Inverted index                                                       */
/* ------------------------------------------------------------------ */

function Inverted() {
  const docs = [
    { label: "Doc 1", note: "the cat sat" },
    { label: "Doc 2", note: "the dog ran" },
    { label: "Doc 3", note: "a cat and a dog" },
  ];
  const words = [
    { label: "cat", note: "in docs 1 and 3", hot: true },
    { label: "dog", note: "in docs 2 and 3", hot: true },
    { label: "ran", note: "in doc 2", hot: false },
    { label: "sat", note: "in doc 1", hot: false },
  ];
  const catLink = path([574, 99], [666, 195]);
  const dogLink = path([574, 157], [666, 215]);
  return (
    <Diagram
      id="datastore-inverted"
      width={900}
      height={414}
      title="An inverted index answers cat AND dog"
      description="Three documents are split into words. The index lists each word with the documents that contain it: cat is in docs 1 and 3, dog is in docs 2 and 3, ran is in doc 2, sat is in doc 1. A search for cat AND dog takes the cat list and the dog list and keeps only the document in both, which is doc 3."
      caption="Searching never reads the documents themselves. It only combines short, sorted lists of document numbers."
    >
      <Group x={30} y={36} w={200} h={314} label="Documents" />
      {docs.map((d, i) => (
        <Box key={d.label} x={46} y={74 + i * 76} w={168} h={60} label={d.label} note={d.note} tone="white" />
      ))}
      <Arrow d={path([230, 186], [290, 186])} tone="slate" />
      <Label x={260} y={164} text="split" size={14} />

      <Group x={290} y={36} w={300} h={314} label="Word list (the index)" tone="sun" />
      {words.map((w, i) => (
        <Box key={w.label} x={306} y={74 + i * 58} w={268} h={50} label={w.label} note={w.note} tone={w.hot ? "sun" : "white"} />
      ))}

      <Group x={650} y={36} w={220} h={314} label="Search" tone="sky" />
      <Box x={666} y={74} w={188} h={56} label="cat AND dog" note="the question" tone="sky" />
      <Arrow d={path([760, 130], [760, 170])} tone="slate" />
      <Box x={666} y={170} w={188} h={70} label="In both lists" note="{1, 3} and {2, 3}" tone="white" />
      <Arrow d={catLink} tone="sun" />
      <Arrow d={dogLink} tone="sun" />
      <Traveler d={catLink} dur={2} tone="sun" r={5} />
      <Traveler d={dogLink} dur={2} delay={0.4} tone="sun" r={5} />
      <Arrow d={path([760, 240], [760, 272])} tone="mint" />
      <Box x={666} y={272} w={188} h={56} label="Doc 3" note="has cat and dog" tone="mint" />

      <Label x={450} y={380} text="Little words like a, and, the are left out here to keep the picture small." size={14} />
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* LSM tree: the write path                                             */
/* ------------------------------------------------------------------ */

function LsmWrite() {
  const toMem = path([226, 88], [360, 88]);
  const toLog = path([136, 120], [136, 206]);
  const flush = path([480, 130], [480, 210]);
  const merge2 = path([630, 270], [650, 346]);
  const merge1 = path([780, 270], [760, 346]);
  const files = [
    { x: 415, label: "SSTable 3", note: "newest" },
    { x: 565, label: "SSTable 2", note: "older" },
    { x: 715, label: "SSTable 1", note: "oldest" },
  ];
  return (
    <Diagram
      id="datastore-lsm-write"
      width={900}
      height={474}
      title="How an LSM tree saves a write"
      description="A new write is first jotted into a write-ahead log on disk for safety, then added to the memtable, a small sorted table in memory. When the memtable is full it is flushed to disk as a new sorted file, an SSTable. Later, compaction merges older SSTables into one bigger file, keeping only the newest value of each key."
      caption="Nothing on disk is ever edited in place. New files are added, and compaction tidies them up in the background."
    >
      <Box x={46} y={56} w={180} h={64} label="New write" note="Ava = 5" tone="sky" />
      <Arrow d={toMem} tone="sky" />
      <Label x={293} y={68} text="2. add, sorted" size={14} color={tones.sky.text} />
      <Traveler d={toMem} dur={1.8} tone="sky" r={5} />
      <Box x={360} y={46} w={240} h={84} label="Memtable (memory)" note={["small sorted table", "fills up fast"]} tone="mint" />

      <Group x={30} y={166} w={840} h={274} label="Disk" />
      <Arrow d={toLog} tone="slate" />
      <Label x={148} y={150} text="1. jot it down" anchor="start" size={14} />
      <Traveler d={toLog} dur={1.8} tone="slate" r={5} />
      <Box x={46} y={206} w={180} h={84} label="Write-ahead log" note={["a diary of every", "write, for safety"]} tone="slate" />
      <Label x={136} y={350} text={["Files are only added,", "never edited in place."]} size={14} />

      <Arrow d={flush} tone="mint" />
      <Label x={492} y={190} text="3. flush when full" anchor="start" size={14} color={tones.mint.text} />
      <Traveler d={flush} dur={2.4} tone="mint" r={5} />
      {files.map((f) => (
        <Box key={f.label} x={f.x} y={210} w={130} h={60} label={f.label} note={f.note} tone="sun" />
      ))}
      <Arrow d={merge2} tone="sun" />
      <Arrow d={merge1} tone="sun" />
      <Label x={705} y={298} text={["4. merge", "(compaction)"]} size={14} color={tones.sun.text} />
      <Box x={565} y={346} w={280} h={70} label="Merged SSTable" note={["keeps the newest value,", "drops old copies"]} tone="sun" />
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* LSM tree: the read path                                              */
/* ------------------------------------------------------------------ */

function LsmRead() {
  const down = path([120, 100], [120, 170]);
  const step1 = path([210, 215], [250, 215]);
  const step2 = path([430, 215], [470, 215]);
  return (
    <Diagram
      id="datastore-lsm-read"
      width={900}
      height={380}
      title="How an LSM tree finds a key"
      description="To read Ava, first look in the memtable in memory, where it is not found. SSTable 3's bloom filter says definitely not here, so that file is skipped. SSTable 2's bloom filter says maybe here, so the file is opened and Ava is found. SSTable 1 is never opened."
      caption="Bloom filters let the reader skip most files without opening them."
    >
      <Box x={30} y={40} w={180} h={60} label="Read: Ava?" tone="sky" />
      <Arrow d={down} tone="slate" />
      <Traveler d={down} dur={1.6} tone="sky" r={5} />
      <Box x={30} y={170} w={180} h={90} label="Memtable" note={["in memory:", "not here"]} tone="white" />
      <Arrow d={step1} tone="slate" />
      <Box x={250} y={170} w={180} h={90} label="SSTable 3" note={["filter says: no,", "skip this file"]} tone="slate" dashed />
      <Arrow d={step2} tone="slate" />
      <Box x={470} y={170} w={180} h={90} label="SSTable 2" note={["filter says: maybe,", "open it: found"]} tone="mint" />
      <Box x={690} y={170} w={180} h={90} label="SSTable 1" note={["not opened,", "already found"]} tone="white" dashed />
      <Label x={250} y={136} text="newer" anchor="start" size={14} />
      <Arrow d={path([304, 136], [798, 136])} tone="slate" width={1.5} />
      <Label x={812} y={136} text="older" anchor="start" size={14} />

      <Label x={450} y={292} text="Look from newest to oldest, and stop at the first match." size={14} color={ink} />
      <Label
        x={450}
        y={322}
        text={["A bloom filter answers definitely not here, or maybe here.", "It never says not here when the key really is there."]}
        size={14}
      />
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* Normalized vs denormalized                                           */
/* ------------------------------------------------------------------ */

function Normalize() {
  return (
    <Diagram
      id="datastore-normalize"
      width={900}
      height={356}
      title="Normalized versus denormalized"
      description="Normalized: a kids table stores each kid's class, and a separate classes table stores each class's teacher once, so renaming Ms. Lee to Ms. Park is one change. Denormalized: one table copies the teacher onto every kid's row for fast reads, and when one copy is missed, class 2B ends up with two different teacher names."
      caption="Storing a fact once keeps it honest. Copying it makes reads faster, as long as every copy is updated together."
    >
      <Group x={30} y={36} w={405} h={284} label="Normalized: each fact stored once" tone="mint" />
      <Label x={50} y={84} text="Kids" anchor="start" size={14} weight={700} color={ink} />
      <Table
        x={50}
        y={100}
        cols={[76, 64]}
        rowH={32}
        header={["name", "class"]}
        rows={[{ cells: ["Ava", "2B"] }, { cells: ["Ben", "2B"] }, { cells: ["Cy", "3A"] }]}
      />
      <Label x={250} y={84} text="Classes" anchor="start" size={14} weight={700} color={ink} />
      <Table
        x={250}
        y={100}
        cols={[64, 104]}
        rowH={32}
        header={["class", "teacher"]}
        rows={[{ cells: ["2B", "Ms. Park"], tone: "mint" }, { cells: ["3A", "Mr. Diaz"] }]}
      />
      <Arrow d={path([190, 148], [250, 148])} tone="grape" dashed />
      <Label x={232} y={274} text={["Rename the teacher in one place.", "Reads need a join to put it together."]} size={14} />

      <Group x={465} y={36} w={405} h={284} label="Denormalized: copies for fast reads" tone="sun" />
      <Label x={532} y={84} text="Kids with teacher" anchor="start" size={14} weight={700} color={ink} />
      <Table
        x={532}
        y={100}
        cols={[76, 64, 130]}
        rowH={32}
        header={["name", "class", "teacher"]}
        rows={[
          { cells: ["Ava", "2B", "Ms. Park"], tone: "mint" },
          { cells: ["Ben", "2B", "Ms. Lee"], tone: "rose" },
          { cells: ["Cy", "3A", "Mr. Diaz"] },
        ]}
      />
      <Label x={667} y={248} text="Ben's copy was missed. Now 2B has two teachers." size={13} weight={600} color={tones.rose.text} />
      <Label x={667} y={274} text={["One look, no join: fast reads.", "Every copy must be kept in sync."]} size={14} />
    </Diagram>
  );
}

export const storageDiagrams = {
  "datastore-tables": Tables,
  "datastore-nosql": NoSqlShapes,
  "datastore-btree": BTree,
  "datastore-inverted": Inverted,
  "datastore-lsm-write": LsmWrite,
  "datastore-lsm-read": LsmRead,
  "datastore-normalize": Normalize,
};
