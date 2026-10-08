/**
 * Loaf slicer: a loaf cut into slices, each slice in its own toaster, five
 * toasters side by side on one counter. At rest every toaster is busy and the
 * slices stand at different heights, the highest one bright. The pointer picks
 * a toaster: its slice pops up done and bright, and the others sink back to
 * toast, staggered outwards from the one picked. The slider is the stagger.
 *
 * The pattern: one of many. Tweens, a stagger by distance, a hit test on the
 * toasters' rest centres, and slices clipped at the slot so none shows through.
 */
const {
  Cam, fillet, fit, facing, poly, proj, prism, rings, rrect, ringAt,
  tdone, tset, tval, tween, disposer, mk, pointer, put, register, solid,
} = HL;

const N = 5, SP = 26, TX = 40, TW = 18, TH = 24, DEPTH = 22, POP = 17;
const REST = [9, 2, 15, 5, 11], LIT = 2;
const U0 = 8, SW = 24, SH = 25, CR = 9;

/** A slice of bread, upright in its own (u, v) plane: a square body under a crown that spills over it. */
const SHAPE = fillet(
  [[0, 0], [SW, 0], [SW - 1, SH], [SW + 3, SH + 4], [SW - 3, SH + CR], [3, SH + CR], [-3, SH + 4], [1, SH]],
  [1.5, 1.5, 1, 4, 5, 5, 4, 1],
);
const CRUST = SHAPE.map(([u, v]) => [SW / 2 + (u - SW / 2) * 0.8, 3 + v * 0.86]);

/** The part of a closed (u, v) outline at or above v = m; the rest is down in the slot. */
function clipV(pts, m) {
  const out = [];
  for (let k = 0; k < pts.length; k++) {
    const a = pts[k], b = pts[(k + 1) % pts.length], ia = a[1] >= m, ib = b[1] >= m;
    if (ia) out.push(a);
    if (ia !== ib) { const t = (m - a[1]) / (b[1] - a[1]); out.push([a[0] + t * (b[0] - a[0]), m]); }
  }
  return out;
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;
  const Y1 = (N - 1) * SP + TW;
  const C = Cam(45, 0.5, 1.9);
  fit(C, [[-8, -8, -5], [TX + 10, Y1 + 8, -5], [TX + 10, -8, -5], [-8, Y1 + 8, -5], [U0, 0, TH - DEPTH + POP + SH + CR]], 200, 170);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const [pr, pi] = rings(-8, -8, TX + 10, Y1 + 8, 9, 2.2);
  put(solid(g), prism(P, front, pr, pi, -5, 0));

  const items = [];
  for (let j = 0; j < N; j++) {
    const y0 = j * SP, yc = y0 + TW / 2, grp = mk("g", {}, g);
    const [tr, ti] = rings(0, y0, TX, y0 + TW, 6, 1.4);
    put(solid(grp), prism(P, front, tr, ti, 0, TH));
    // the lever on the toaster's end, and the slot on its top
    const [lr, li] = rings(TX - 1, yc - 3, TX + 4, yc + 3, 1.5, 0.6);
    put(solid(grp), prism(P, front, lr, li, TH * 0.45, TH * 0.62));
    mk("path", { d: poly(ringAt(P, rrect(U0 - 2, yc - 2.2, U0 + SW + 2, yc + 2.2, 2, 3), TH)), class: "nf lo" }, grp);
    const back = mk("path", { class: "lo" }, grp), face = mk("path", { class: "sil" }, grp), crust = mk("path", { class: "nf lo" }, grp);
    items.push({ yc, back, face, crust, z: tween(REST[j]), drawn: NaN });
  }

  /** Slice j lifted by `lift`: its outline from the slot up, and its crust. */
  function draw(j, lift) {
    const it = items[j];
    if (lift === it.drawn) return;
    it.drawn = lift;
    const zb = TH - DEPTH + lift, m = DEPTH - lift;
    const w = (dy) => ([u, v]) => P(U0 + u, it.yc + dy, zb + v);
    it.back.setAttribute("d", poly(clipV(SHAPE, m).map(w(-1.6))));
    it.face.setAttribute("d", poly(clipV(SHAPE, m).map(w(0))));
    const cr = clipV(CRUST, m);
    it.crust.setAttribute("d", cr.length > 2 ? poly(cr.map(w(0))) : "");
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    items.forEach((it, j) => { draw(j, tval(it.z, now)); if (!tdone(it.z, now)) moving = true; });
    return moving;
  });
  bag.add(B.unregister);

  // hit: the toasters' rest centres, which never move
  const centres = items.map((it) => P(TX / 2, it.yc, TH + 8));
  function hit([x, y]) {
    let best = -1, bd = 46;
    centres.forEach((c, j) => { const d = Math.hypot(c[0] - x, c[1] - y); if (d < bd) { bd = d; best = j; } });
    return best;
  }

  let act = -2;
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    items.forEach((it, j) => {
      tset(it.z, a < 0 ? REST[j] : j === a ? POP : 0, now, Math.abs(j - from) * stag);
      it.face.classList.toggle("hi", a < 0 ? j === LIT : j === a);
    });
    read.textContent = a < 0 ? "rest" : `chunk ${a + 1}`;
    B.wake();
  }
  setActive(-1);

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "loaf-slicer",
  means: "A loaf cut into slices, each in its own toaster, all toasting at once. Point at a toaster and its slice pops up done.",
  rules: [1, 2, 5, 6],
  range: [0, 40, 90],
  tour: [[150, 200], [230, 150], [290, 110], null],
  mount,
});
