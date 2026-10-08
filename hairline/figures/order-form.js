/**
 * Order form: a stencil plate, the form both sides agreed on, with four
 * shaped holes in a row: a round one, a long one, a square and a triangle.
 * Over each hole floats the one block that fits it, and only that one. The
 * pointer picks a hole and its block drops in; the others lift away a little,
 * staggered outwards from it. At rest the round block sits in its hole and is
 * the bright mark. The read-out names the field the hole stands for. The
 * slider is the stagger, in ms.
 */
const {
  Cam, circ, clamp, extremes, facing, fillet, fit, open, seg, poly, prism, proj, ringAt, rings, rrect, run,
  tween, tset, tval, tdone, disposer, mk, pointer, put, register, solid,
} = HL;

const PX = 186, PY = 52, PT = 9, BH = 16, SINK = 6, CY = PY / 2, UP = 8, PAD = 1.8;
const CX = [28, 72, 116, 158], HOV = [22, 30, 20, 32];
const FIELD = ["size · number", "topping · word", "crust · choice", "extra · yes/no"];

/** A closed outline of points as a ring of samples {u, v, nu, nv}, the normals pointing out. */
function ringOf(pts) {
  const n = pts.length, cx = pts.reduce((s, p) => s + p[0], 0) / n, cy = pts.reduce((s, p) => s + p[1], 0) / n;
  return pts.map((p, i) => {
    const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
    let nu = b[1] - a[1], nv = a[0] - b[0];
    const l = Math.hypot(nu, nv) || 1;
    if (nu * (p[0] - cx) + nv * (p[1] - cy) < 0) { nu = -nu; nv = -nv; }
    return { u: p[0], v: p[1], nu: nu / l, nv: nv / l };
  });
}
const tri = (cx, cy, s) => ringOf(fillet([[cx - s, cy + s * 0.9], [cx + s, cy + s * 0.9], [cx, cy - s * 1.05]], [3, 3, 3], 5));
const round = (cx, cy, R) => circ(R, 36).map((q) => ({ ...q, u: q.u + cx, v: q.v + cy }));
/** Shape k, grown by g: [ring, crease ring]. */
function shape(k, g) {
  const cx = CX[k];
  if (k === 0) return [round(cx, CY, 12 + g), round(cx, CY, 11 + g)];
  if (k === 1) return [rrect(cx - 7 - g, CY - 18 - g, cx + 7 + g, CY + 18 + g, 4, 5), rrect(cx - 6 - g, CY - 17 - g, cx + 6 + g, CY + 17 + g, 3, 5)];
  if (k === 2) return rings(cx - 11 - g, CY - 11 - g, cx + 11 + g, CY + 11 + g, 2.5, 1);
  return [tri(cx, CY, 13 + g), tri(cx, CY, 12 + g)];
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;
  const C = Cam(45, 0.5, 1.8);
  fit(C, [[-4, -4, -4], [PX + 4, PY + 4, -4], [PX + 4, -4, -4], [-4, PY + 4, -4], [CX[3], CY, PT + Math.max(...HOV) + UP + BH]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // the plate on four feet, its holes, and the far inner wall of each hole where it meets the floor
  for (const [x, y] of [[8, 8], [PX - 16, 8], [8, PY - 16], [PX - 16, PY - 16]]) {
    const [o, i] = rings(x, y, x + 8, y + 8, 2, 0.8);
    put(solid(g), prism(P, front, o, i, -4, 0));
  }
  const [po, pi] = rings(0, 0, PX, PY, 7, 1.8);
  put(solid(g), prism(P, front, po, pi, 0, PT));
  const holes = CX.map((_, k) => {
    const [hr] = shape(k, PAD);
    const rim = mk("path", { class: "nf", d: poly(ringAt(P, hr, PT)) }, g);
    // only the middle of the far wall's foot: near the hole's sides it would fall outside the hole and show through the plate
    const xs = ringAt(P, hr, PT).map((p) => p[0]), lo = Math.min(...xs) + 11, hi = Math.max(...xs) - 11;
    mk("path", { class: "nf lo", d: open(ringAt(P, run(hr, (q) => !front(q)), PT - SINK).filter((p) => p[0] > lo && p[0] < hi)) }, g);
    return rim;
  });

  const blocks = CX.map((_, k) => {
    const [ring, inner] = shape(k, 0);
    // dashed drops from the block's sides down to the plate, painted behind the block they belong to
    const drop = mk("path", { class: "dash nf" }, g);
    return { k, ring, inner, drop, el: solid(g), z: tween(k === 0 ? PT - SINK : HOV[k]), drawn: NaN };
  });
  // A seated block is drawn only above the plate's top: the plate hides the rest of it.
  function draw(b, z) {
    if (z === b.drawn) return;
    b.drawn = z;
    put(b.el, prism(P, front, b.ring, b.inner, Math.max(z, PT), z + BH));
    const [l, r] = extremes(P, b.ring);
    b.drop.setAttribute("d", z > PT + 2 ? seg(P(l.u, l.v, PT), P(l.u, l.v, z)) + seg(P(r.u, r.v, PT), P(r.u, r.v, z)) : "");
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const b of blocks) { draw(b, tval(b.z, now)); if (!tdone(b.z, now)) moving = true; }
    return moving;
  });
  bag.add(B.unregister);

  // The hit test reads the rest pose: the hole nearest the pointer's screen x, inside the band the blocks fill.
  const cs = CX.map((x) => P(x, CY, PT));
  const top = Math.min(...CX.map((x, k) => P(x, CY, PT + HOV[k] + UP + BH)[1])) - 10;
  function hit([x, y]) {
    let a = 0;
    cs.forEach((c, k) => { if (Math.abs(c[0] - x) < Math.abs(cs[a][0] - x)) a = k; });
    return Math.abs(cs[a][0] - x) < 34 && y > top && y < cs[a][1] + 34 ? a : -1;
  }

  let act = -2;
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act >= 0 ? act : 0;
    act = a;
    const seat = a < 0 ? 0 : a;
    blocks.forEach((b, k) => {
      const z = k === seat ? PT - SINK : HOV[k] + (a < 0 ? 0 : UP);
      tset(b.z, z, now, Math.abs(k - from) * stag);
      b.el.sil.classList.toggle("hi", k === seat);
      holes[k].classList.toggle("hi", k === seat);
    });
    read.textContent = a < 0 ? "rest" : FIELD[a];
    B.wake();
  }

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());
  setActive(-1);

  return {
    set: (v) => { stag = clamp(v, 0, 120); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "order-form",
  means: "Both sides share one form: a plate with shaped holes, and blocks that fit only their own hole. Point at a hole to drop its block in.",
  rules: [1, 2, 5, 10],
  range: [0, 40, 80],
  tour: [[150, 150], [215, 175], [265, 200], null],
  mount,
});
