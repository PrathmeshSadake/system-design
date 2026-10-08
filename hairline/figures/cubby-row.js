/**
 * Cubby row: four open cubbies in a row, front (most recently used) at the
 * left, far end at the right, and one more snack waiting on the floor past the
 * far end, and an empty spot beyond it. Each snack has its own shape. The pointer touches a snack: it hops
 * into the front cubby and the others shift back one, staggered from it. If
 * the snack came from the floor there is no room, so the one at the far end,
 * least recently used, drops out to that spot: eviction. At rest the grapes,
 * next out, take the bright stroke. The slider is the stagger, in ms.
 */
const {
  Cam, clamp, facing, fit, hull, lerp, open, poly, prism, proj, ringAt, rings, rrect, run,
  tdone, tset, tval, tween, disposer, mk, place, pointer, put, register, solid,
} = HL;

/** Each snack: name, footprint w × d, height, corner radius. */
const SNACKS = [["apple", 10, 10, 10, 5], ["cookie", 10, 10, 13, 5], ["juice", 7, 7, 17, 1.5], ["grapes", 11, 9, 9, 3.5], ["cracker", 12, 6, 15, 1.6]];
const N = 4, PITCH = 22, BW = 19, BD = 17, WH = 8, FLOOR = N * PITCH + 11, YC = BD / 2, HOP = 16;
const slotX = (s) => (s < N ? s * PITCH + BW / 2 : FLOOR + (s - N) * 19);
const REST = [0, 1, 2, 3, 4]; // slot of each snack at rest; slot 4 is the floor where a new one waits, 5 where an evicted one lands

const LR = (pts) => (pts[0][0] <= pts[pts.length - 1][0] ? pts : pts.slice().reverse());

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;
  const C = Cam(45, 0.5, 2.8);
  fit(C, [[-5, -5, -3], [FLOOR + 28, -5, -3], [FLOOR + 28, BD + 5, -3], [-5, BD + 5, -3], [PITCH, YC, 17 + HOP]], 200, 170);
  const P = proj(C), front = facing(C), g = mk("g", {}, svg);
  const [pr, pi] = rings(-5, -5, FLOOR + 28, BD + 5, 6, 2);
  put(solid(g), prism(P, front, pr, pi, -3, 0));
  for (const fx of [FLOOR, FLOOR + 19]) mk("path", { d: poly(rrect(fx - 8, YC - 7, fx + 8, YC + 7, 4, 5).map((q) => P(q.u, q.v, 0))), class: "dash" }, g);

  // each cubby: its far half, a layer for what is inside, then its near half
  const layers = [];
  for (let i = 0; i < N; i++) {
    const x0 = i * PITCH, outer = rrect(x0, 0, x0 + BW, BD, 3, 6), inner = rrect(x0 + 1.8, 1.8, x0 + BW - 1.8, BD - 1.8, 1.4, 6);
    mk("path", { d: poly(hull(ringAt(P, outer, 0).concat(ringAt(P, outer, WH)))), class: "sil" }, g);
    mk("path", { d: poly(ringAt(P, inner, WH)), class: "nf" }, g);
    layers.push(mk("g", {}, g));
    const iF = LR(ringAt(P, run(inner, front), WH)), oT = LR(ringAt(P, run(outer, front), WH)), oB = LR(ringAt(P, run(outer, front), 0));
    mk("path", { d: poly([...iF, oT[oT.length - 1], ...oB.slice().reverse(), oT[0]]), class: "fo" }, g);
    mk("path", { d: open(oT), class: "nf lo" }, g);
    mk("path", { d: open(iF), class: "nf" }, g);
    mk("path", { d: open([oT[0], ...oB, oT[oT.length - 1]]), class: "nf sil" }, g);
    // the cubby's number, in dots on its front lip
    for (let d = 0; d <= i; d++) place(mk("circle", { r: 0.9, class: "dot off" }, g), P(x0 + BW / 2 + (d - i / 2) * 2.4, BD, WH - 2.2));
  }
  layers.push(mk("g", {}, g));
  const layerAt = (x) => layers[x > N * PITCH - 1 ? N : clamp(Math.floor(x / PITCH), 0, N - 1)];

  const snacks = SNACKS.map(([name, w, d, h, r], k) => ({ k, name, w, d, h, r, el: solid(layers[0]), x: tween(slotX(REST[k])), from: slotX(REST[k]), to: slotX(REST[k]), drawn: NaN }));
  const baseZ = (x) => (x > N * PITCH - 1 ? 0 : 1.6);

  function draw(sn, x) {
    if (x === sn.drawn) return;
    sn.drawn = x;
    const span = sn.to - sn.from, f = span ? clamp((x - sn.from) / span, 0, 1) : 1;
    const z = lerp(baseZ(sn.from), baseZ(sn.to), f) + Math.sin(Math.PI * f) * (Math.abs(span) > 1 ? HOP : 0);
    const [o, i] = rings(x - sn.w / 2, YC - sn.d / 2, x + sn.w / 2, YC + sn.d / 2, sn.r, 0.7);
    put(sn.el, prism(P, front, o, i, z, z + sn.h));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const sn of snacks) { draw(sn, tval(sn.x, now)); if (!tdone(sn.x, now)) moving = true; }
    // back to front: each snack in the layer of the cubby under it, in order of x
    snacks.slice().sort((p, q) => p.drawn - q.drawn).forEach((sn) => layerAt(sn.drawn).append(sn.el.g));
    return moving;
  });
  bag.add(B.unregister);

  // The cubbies never move: the pointer touches the snack that sits, at rest, in the slot nearest it on screen.
  const mid = [0, 1, 2, 3, 4].map((s) => P(slotX(s), YC, 8));
  function hit([sx, sy]) {
    if (Math.abs(sy - mid[2][1]) > 70) return -1;
    let best = -1, bd = 26;
    mid.forEach((p, s) => { const e = Math.abs(p[0] - sx); if (e < bd) { bd = e; best = s; } });
    return best < 0 ? -1 : REST.indexOf(best);
  }

  let act = null;
  function choose(k) {
    if (k === act) return;
    act = k;
    const now = performance.now(), slots = REST.slice();
    let out = -1;
    if (k >= 0) {
      const was = REST[k], lru = REST.indexOf(N - 1);
      // the touched snack goes to the front; the ones before it shift back; from the floor, the far one drops out
      slots.forEach((s, j) => { if (j !== k && s < was) slots[j] = s + 1; });
      slots[k] = 0;
      if (was === N) { slots[lru] = N + 1; out = lru; }
    }
    const at = k >= 0 ? REST[k] : 0;
    snacks.forEach((sn, j) => {
      const to = slotX(slots[j]), x = tval(sn.x, now);
      if (to !== sn.to) { sn.from = x; sn.to = to; sn.drawn = NaN; }
      tset(sn.x, to, now, j === k ? at * stag + 50 : Math.abs(REST[j] - at) * stag); // the touched one goes last, once the front is clear
      sn.el.sil.classList.toggle("hi", k < 0 ? j === 3 : j === k);
    });
    read.textContent = k < 0 ? "rest" : out >= 0 ? `${SNACKS[out][0]} out · slot ${N}` : `${SNACKS[k][0]} · slot 1`;
    B.wake();
  }
  choose(-1);

  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "cubby-row",
  means: "Four cubbies of snacks. Touch one and it moves to the front. Bring in a new one and the snack nobody touched for longest drops out.",
  rules: [1, 2, 4, 8],
  range: [0, 50, 100],
  tour: [[187, 160], [231, 182], [278, 206], null],
  mount,
});
