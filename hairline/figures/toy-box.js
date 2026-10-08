/**
 * Toy box: an open bin, tall at the back and low at the front, with a handle
 * cut into each front wall and slats inside. It fills with blocks, nine to a
 * layer, one block for each few days of saved drawings. The pointer's x
 * scrubs time from day 1 to day 365 and the blocks pile up, layer on layer,
 * on a spring. The newest block is always on its way down and takes the
 * bright stroke; a full box gives it to the whole stack. At rest it is day
 * 200, the box half full. The slider is the size of one drawing, in MB.
 */
const {
  Cam, clamp, facing, fit, hull, open, poly, prism, proj, ringAt, rings, rrect, run, seg,
  spring, stepS, disposer, mk, pointer, put, register, solid,
} = HL;

const W = 96, D = 96, WR = 8, WT = 3, WH = 64, LO = 15, B = 12, LAYERS = 5, PER = 9, DROP = 24;
const IN0 = WT + 1, IN1 = W - WT - 1, BW = (IN1 - IN0) / 3, TBB = 9, REST_DAY = 200;
const CAP = LAYERS * PER;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let rate = value;
  const C = Cam(45, 0.5, 1.72);
  fit(C, [[0, 0, 0], [W, D, 0], [W, 0, 0], [0, D, 0], [0, 0, WH], [W / 2, D / 2, LAYERS * B + DROP + B]], 200, 166);
  const P = proj(C), front = facing(C);
  const outer = rrect(0, 0, W, D, WR, 6), inner = rrect(WT, WT, W - WT, D - WT, WR - WT, 6);
  const g = mk("g", {}, svg);

  // the bin's far half: a body with tall back walls and low front ones, the far walls' inner edge, their slats, the floor seam
  const far = (q) => !front(q), farIn = ringAt(P, run(inner, far), WH), farOut = ringAt(P, run(outer, far), WH);
  const nearIn = ringAt(P, run(inner, front), LO);
  mk("path", { class: "sil", d: poly(hull(ringAt(P, outer, 0).concat(farOut, ringAt(P, run(outer, front), LO)))) }, g);
  mk("path", { class: "nf", d: open(farIn) }, g);
  mk("path", { class: "nf", d: seg(farIn[0], nearIn[nearIn.length - 1]) + seg(farIn[farIn.length - 1], nearIn[0]) }, g);
  for (const z of [WH / 3, (2 * WH) / 3]) mk("path", { class: "nf lo", d: open(ringAt(P, run(inner, far), z)) }, g);
  mk("path", { class: "nf lo", d: open(ringAt(P, run(inner, far), 2)) }, g);

  // the blocks: the full layers as one solid with its seams, and nine blocks for the layer being filled
  const [cr, ci] = rings(IN0, IN0, IN1, IN1, 3, 1.2);
  const base = solid(g), seams = mk("path", { class: "nf lo" }, g);
  const cells = [];
  for (let s = 0; s <= 4; s++) for (let i = 0; i < 3; i++) {
    const j = s - i;
    if (j < 0 || j > 2) continue;
    const x0 = IN0 + i * BW + 1, y0 = IN0 + j * BW + 1;
    const [ring, ri] = rings(x0, y0, x0 + BW - 2, y0 + BW - 2, 3, 1);
    cells.push({ ring, ri, el: solid(g) });
  }

  // the bin's near half: one opaque piece from the low rim's inner edge down to the floor, and a handle in each front wall
  const LR = (pts) => (pts[0][0] <= pts[pts.length - 1][0] ? pts : pts.slice().reverse());
  const iF = LR(nearIn), oT = LR(ringAt(P, run(outer, front), LO)), oB = LR(ringAt(P, run(outer, front), 0));
  mk("path", { class: "fo", d: poly([...iF, oT[oT.length - 1], ...oB.slice().reverse(), oT[0]]) }, g);
  mk("path", { class: "nf lo", d: open(oT) }, g);
  mk("path", { class: "nf", d: open(iF) }, g);
  mk("path", { class: "nf sil", d: open([oT[0], ...oB, oT[oT.length - 1]]) }, g);
  const slot = rrect(W / 2 - 13, 5, W / 2 + 13, 10, 2.5, 5);
  mk("path", { class: "nf", d: poly(slot.map((q) => P(q.u, D, q.v))) }, g);
  mk("path", { class: "nf", d: poly(slot.map((q) => P(W, q.u, q.v))) }, g);

  const day = spring(REST_DAY, { eps: 0.05 });
  let drawn = NaN;
  function draw() {
    const F = clamp((day.x * rate) / TBB, 0, CAP);
    if (F === drawn) return;
    drawn = F;
    const n = Math.floor(F), L = Math.min(LAYERS, Math.floor(n / PER)), k = n - L * PER, z0 = L * B;
    put(base, L > 0 ? prism(P, front, cr, ci, 0.6, z0) : { sil: "", crease: "" });
    base.sil.classList.toggle("hi", n >= CAP);
    let d = "";
    if (L > 0) for (let m = 1; m < 3; m++) {
      d += seg(P(IN0 + m * BW, IN0 + 1, z0), P(IN0 + m * BW, IN1 - 1, z0)) + seg(P(IN0 + 1, IN0 + m * BW, z0), P(IN1 - 1, IN0 + m * BW, z0));
    }
    for (let m = 1; m < L; m++) if (m * B > LO) d += open(ringAt(P, run(cr, front), m * B));
    if (z0 > LO) for (let m = 1; m < 3; m++) {
      d += seg(P(IN0 + m * BW, IN1, LO), P(IN0 + m * BW, IN1, z0)) + seg(P(IN1, IN0 + m * BW, LO), P(IN1, IN0 + m * BW, z0));
    }
    seams.setAttribute("d", d);
    cells.forEach((c, i) => {
      const falling = i === k && n < CAP, z = z0 + (falling ? (1 - (F - n)) * DROP : 0);
      put(c.el, i < k || falling ? prism(P, front, c.ring, c.ri, z, z + B) : { sil: "", crease: "" });
      c.el.sil.classList.toggle("hi", falling);
    });
  }

  const Bk = register(stage, (dt) => { const m = stepS(day, dt); draw(); return m; });
  bag.add(Bk.unregister);

  // The pointer's x, across the crate's width on screen, is the day. Nothing it touches moves under it.
  const xl = P(0, D, 0)[0], xr = P(W, 0, 0)[0];
  let over = false, d0 = REST_DAY;
  function retarget() {
    day.t = over ? d0 : REST_DAY;
    if (over) {
      const tb = Math.round(d0 * rate);
      read.textContent = tb > CAP * TBB ? `day ${d0} · full` : `day ${d0} · ${tb} TB`;
    } else read.textContent = "rest";
    Bk.wake();
  }
  bag.add(pointer(stage, {
    move: (p) => { over = true; d0 = Math.round(1 + 364 * clamp((p[0] - xl) / (xr - xl), 0, 1)); retarget(); },
    leave: () => { over = false; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());
  retarget();

  return {
    set: (v) => { rate = v; drawn = NaN; retarget(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "toy-box",
  means: "A toy box fills with a day's drawings, one block at a time. Slide left to right through a year and watch the layers stack up.",
  rules: [3, 5, 6, 8],
  range: [0.5, 1, 2],
  tour: [[110, 160], [200, 160], [300, 160], null],
  mount,
});
