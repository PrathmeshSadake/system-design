// Builds one Hairline figure per low level design lesson.
// Each figure is a small scene of uneven blocks. Choice figures grow the block
// under the pointer. Scrub figures fill along the pointer's x. Tour points are
// the same projected centres the figure uses to hit-test, so the lesson page's
// play button lands on a real answer.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

const root = new URL("..", import.meta.url).pathname;
const kernel = readFileSync(join(root, ".claude/skills/hairline-create/kernel.js"), "utf8");
const context = vm.createContext({ hairline() {} });
vm.runInContext(kernel, context);
const { Cam, fit, proj } = context.HL;

const choice = (name, means, labels, bright) => ({ kind: "choice", name, means, labels, bright });
const scrub = (name, means, labels, bright) => ({ kind: "scrub", name, means, labels, bright });

const specs = [
  choice("doll-house", "A doll house, a door, and the far block of flats. Point at one and it rises: rooms, or the whole street.", ["rooms", "door", "street"], 0),
  choice("lunch-latch", "A lunchbox, its latch, and one bite set aside. Point at the latch and that piece rises. The food stays put.", ["box", "latch", "bite"], 1),
  choice("snap-bricks", "Loose bricks, one snapped toy, and a brick both toys could share. Point at a piece and it lifts off the mat.", ["loose", "snapped", "shared"], 1),
  scrub("comic-strip", "Four uneven frames of a short comic. Slide across them and each frame stands up, in story order.", ["ask", "try", "break", "fix"], 0),
  choice("chore-cards", "One chore card each, at different heights. Point at a card and it rises. The tall one already has an owner.", ["wash", "sweep", "read"], 2),
  choice("lamp-plug", "A lamp, a plug, and two different sockets. Point at a socket. The lamp does not care which one you pick.", ["lamp", "round", "flat"], 0),
  scrub("cookie-press", "An empty tray, then cookies, one press at a time. Slide across and the next cookie stands up on the tray.", ["tin", "one", "two", "three"], 1),
  scrub("gift-layers", "A present gaining wraps: box, paper, ribbon. Slide across and the next layer stands up.", ["box", "paper", "ribbon"], 0),
  choice("game-pieces", "Three ways a piece may move, sitting as three blocks. Point at one way and that block rises.", ["hop", "slide", "any"], 1),
  scrub("note-chain", "Notes passed along a desk, one child at a time. Slide across and the note that is holding the message rises.", ["first", "next", "last"], 0),
  choice("rule-cards", "Three house rules as cards of different heights. Point at a rule and that card stands up.", ["short", "once", "later"], 0),
  choice("labeled-tins", "A name tin, a value tin, and a tin with a rule inside. Point at one and it rises off the shelf.", ["name", "value", "rule"], 2),
  choice("question-cards", "Three questions to ask before you build. Point at a card and it rises: who, what, or how big.", ["who", "what", "size"], 0),
  scrub("cubby-bins", "Cubby holes filling with blocks of different heights. Slide across and the next cubby takes a block.", ["map", "line", "heap", "ring"], 1),
  choice("bolt-latch", "An open bolt, a shut bolt, and a bolt that is waiting. Point at one and that state rises.", ["open", "shut", "wait"], 0),
  scrub("exam-desk", "A short exam on a desk: plan, build, then tell. Slide across and the step you are in stands up.", ["plan", "build", "tell"], 1),
  choice("coin-piles", "Three ways to split a pile of coins. Point at a pile and it rises: fair shares, exact coins, or a percent.", ["fair", "exact", "percent"], 0),
  scrub("crumb-tin", "A tin filling with crumbs, then one crumb too many. Slide across and watch the tin fill up.", ["few", "more", "full", "drop"], 2),
  choice("paper-planes", "Three paper planes: one that waits, one with a topic, one shared by a group. Point at a plane and it rises.", ["wait", "topic", "group"], 1),
  scrub("turn-stile", "Tokens stacking beside a turnstile. Slide across and another token stands up, until the stack is full.", ["one", "two", "three", "full"], 0),
  choice("painted-spots", "Three painted parking spots, sized for different toys. Point at a spot and it rises.", ["bike", "car", "truck"], 1),
  scrub("date-book", "Days in a date book, one block each. Slide across the week and the day under your hand stands up.", ["mon", "wed", "fri", "sun"], 0),
  choice("dinner-bell", "An order, a pan, and a plate. Point at a step and it rises: asked for, cooking, or served.", ["asked", "cook", "served"], 0),
  choice("checker-board", "Three pieces from a board game, short, tall, and wide. Point at a piece and it rises.", ["pawn", "knight", "king"], 2),
  scrub("coin-slot", "Coins dropped into a slot, one after another. Slide across and the next coin stands in the slot.", ["cent", "more", "change"], 1),
  scrub("shopping-basket", "A basket filling with uneven parcels. Slide across and the next parcel drops in and stands up.", ["one", "two", "three", "full"], 0),
  choice("coin-purse", "A purse, a coin going back, and a coin moving to a friend. Point at one and it rises.", ["pay", "back", "move"], 0),
  scrub("score-pegs", "Pegs climbing a board, each a different height. Slide across and the next peg stands taller.", ["low", "mid", "high", "tie"], 3),
  choice("job-slips", "A slip waiting, a slip tried again, and a slip set aside. Point at one and it rises.", ["wait", "retry", "aside"], 1),
  choice("file-drawers", "A file, a folder, and a drawer with a lock. Point at one and it rises out of the chest.", ["file", "folder", "lock"], 2),
];

function hash(s) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}
function unit(seed, i) {
  let h = Math.imul(seed ^ (i * 374761393), 668265263);
  h = (h ^ (h >>> 13)) >>> 0;
  return (h % 1000) / 1000;
}

function layout(labels, seed) {
  const n = labels.length;
  const span = 118;
  const gap = span / n;
  return labels.map((label, i) => ({
    name: label,
    x: -58 + i * gap + unit(seed, i + 3) * 2,
    y: (i % 2 === 0 ? -16 : 12) + (unit(seed, i + 9) - 0.5) * 6,
    w: 12 + unit(seed, i + 20) * 4,
    d: 10 + unit(seed, i + 30) * 4,
    h: 6 + unit(seed, i + 40) * 14,
  }));
}

function scene(items, seed) {
  const s = Math.round((1.78 + unit(seed, 1) * 0.28) * 100) / 100;
  const shelfH = 16 + Math.round(unit(seed, 2) * 12);
  const pts = [
    [-70, -32, -4],
    [70, -32, -4],
    [-70, 40, -4],
    [70, 40, -4],
    [-70, -32, shelfH],
  ];
  for (const it of items) pts.push([it.x, it.y, 0], [it.x + it.w, it.y + it.d, it.h * 2]);
  const C = Cam(45, 0.5, s);
  fit(C, pts, 200, 168);
  const P = proj(C);
  const centers = items.map((it) => {
    const p = P(it.x + it.w / 2, it.y + it.d / 2, it.h / 2);
    return [Math.round(p[0]), Math.round(p[1])];
  });
  return { s, shelfH, pts, centers };
}

function source(spec, items, scene) {
  const centers = scene.centers;
  const tour = spec.kind === "scrub"
    ? [centers[0], centers[Math.floor(centers.length / 2)], centers[centers.length - 1], null]
    : [centers[0], centers[Math.min(1, centers.length - 1)], centers[centers.length - 1], null];
  const bright = spec.bright ?? 0;
  const fitLiteral = scene.pts.map((p) => `[${p.map(num).join(", ")}]`).join(", ");
  return `/**
 * ${spec.name}: ${spec.means}
 * The pointer picks a block by its resting centre, which does not move.
 * The picked block grows on a spring and takes the bright edge.
 */
const {
  Cam, facing, fit, prism, proj, rings, spring, stepS, disposer, mk, pointer, put, register, solid,
} = HL;

const S = ${scene.s};
const SHELF = ${scene.shelfH};
const FIT = [${fitLiteral}];
const ITEMS = [
${items.map((it) => `  { name: ${JSON.stringify(it.name)}, x: ${num(it.x)}, y: ${num(it.y)}, w: ${num(it.w)}, d: ${num(it.d)}, h: ${num(it.h)} },`).join("\n")}
];
const REST = ${bright};

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let grow = value;
  const C = Cam(45, 0.5, S);
  fit(C, FIT, 200, 168);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const [fr, fi] = rings(-70, -32, 70, 40, 12, 1.8);
  put(solid(g), prism(P, front, fr, fi, -4, 0));
  const [sr, si] = rings(-66, -30, 66, -18, 3, 1);
  put(solid(g), prism(P, front, sr, si, 0, SHELF));

  const blocks = ITEMS.map((it, i) => ({ ...it, i, h0: it.h, el: solid(g), sp: spring(it.h), drawn: NaN }));
  blocks.sort((a, b) => a.x + a.y - (b.x + b.y)).forEach((b) => g.append(b.el.g));
  const center = ITEMS.map((it) => P(it.x + it.w / 2, it.y + it.d / 2, it.h / 2));

  function draw(b) {
    const z = Math.max(2, b.sp.x);
    if (z === b.drawn) return;
    b.drawn = z;
    const [ring, inner] = rings(b.x, b.y, b.x + b.w, b.y + b.d, 2, 0.7);
    put(b.el, prism(P, front, ring, inner, 0, z));
  }

  const B = register(stage, (dt) => {
    let moving = false;
    for (const b of blocks) {
      if (stepS(b.sp, dt)) moving = true;
      draw(b);
    }
    return moving;
  });
  bag.add(B.unregister);

  let over = -1;
  function apply() {
    const bright = over < 0 ? REST : over;
    blocks.forEach((b) => {
      b.el.sil.classList.toggle("hi", b.i === bright);
      b.sp.t = b.h0 * (b.i === over ? grow : 1);
    });
    read.textContent = over < 0 ? "rest" : ITEMS[over].name;
    B.wake();
  }
  function nearest(p) {
    let best = 0, bd = Infinity;
    for (let i = 0; i < center.length; i++) {
      const d = Math.hypot(center[i][0] - p[0], center[i][1] - p[1]);
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  }

  apply();
  bag.add(pointer(stage, {
    move: (p) => { over = nearest(p); apply(); },
    leave: () => { over = -1; apply(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { grow = v; apply(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: ${JSON.stringify(spec.name)},
  means: ${JSON.stringify(spec.means)},
  rules: [1, 4, 5, 8],
  range: [1.25, 1.6, 2],
  tour: ${JSON.stringify(tour)},
  mount,
});
`;
}

function num(n) {
  return Math.round(n * 100) / 100;
}

const seen = new Set();
for (const spec of specs) {
  if (seen.has(spec.name)) throw new Error(`duplicate ${spec.name}`);
  seen.add(spec.name);
  if (spec.means.length > 140) throw new Error(`${spec.name} means is ${spec.means.length} chars`);
  const seed = hash(spec.name);
  const items = layout(spec.labels, seed).map((it) => ({
    name: it.name, x: num(it.x), y: num(it.y), w: num(it.w), d: num(it.d), h: num(it.h),
  }));
  const shot = scene(items, seed);
  for (const [x, y] of shot.centers) {
    if (x < 4 || x > 396 || y < 4 || y > 316) throw new Error(`${spec.name} centre ${x},${y} leaves the frame`);
  }
  for (let i = 0; i < shot.centers.length; i++) {
    for (let j = i + 1; j < shot.centers.length; j++) {
      const d = Math.hypot(shot.centers[i][0] - shot.centers[j][0], shot.centers[i][1] - shot.centers[j][1]);
      if (d < 28) throw new Error(`${spec.name} items ${i} and ${j} are only ${d.toFixed(0)} apart`);
    }
  }
  const file = join(root, "hairline/figures", `${spec.name}.js`);
  writeFileSync(file, source(spec, items, shot));
  console.log(`${spec.name} tour ${JSON.stringify(shot.centers)}`);
}
console.log(`wrote ${specs.length} figures`);
