/**
 * Front desk: a wall with four doors, each with its room number in dots above
 * it, and in front of them one front desk with a swing gate on a post beside
 * it. Every visitor comes in at the desk. The pointer picks a door: the gate
 * swings round to it, the door opens, and its neighbours open a little less,
 * staggered outwards. At rest the gate is shut and the desk is the bright
 * mark. The slider is the stagger, in ms.
 */
const {
  Cam, clamp, facing, fillet, fit, poly, prism, proj, rad, rings,
  tween, tset, tval, tdone, disposer, mk, place, pointer, put, register, solid,
} = HL;

const WX = 196, WT = 6, WH = 70, DW = 28, DH = 48, CX = [32, 76, 120, 164];
const PV = [104, 62], ARM = 34, AZ = 30, REST = [8, 0, 14, 4], OPEN = 88, FALL = [1, 0.34, 0.14, 0.06];
const LEAF = fillet([[0, 0], [DW, 0], [DW, DH], [0, DH]], [1, 1, 3, 3]);

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

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;
  const C = Cam(45, 0.5, 1.3);
  fit(C, [[-10, -10, -4], [WX + 10, 114, -4], [WX + 10, -10, -4], [-10, 114, -4], [0, 0, WH], [WX, 0, WH]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const box = (x0, y0, x1, y1, z0, z1, r, b) => { const [o, i] = rings(x0, y0, x1, y1, r, b); return prism(P, front, o, i, z0, z1); };

  put(solid(g), box(-10, -10, WX + 10, 114, -4, 0, 9, 2.2));
  put(solid(g), box(0, 0, WX, WT, 0, WH, 3, 1.2));
  // each doorway: its frame on the wall's face, the far jamb inside it, and its number in dots above it
  CX.forEach((cx, i) => {
    const at = (y) => poly(LEAF.map(([u, v]) => P(cx - DW / 2 + u, y, v)));
    mk("path", { class: "nf lo", d: at(1) }, g);
    mk("path", { class: "nf", d: at(WT + 0.2) }, g);
    for (let k = 0; k <= i; k++) place(mk("circle", { r: 1.5, class: "dot m" }, g), P(cx + (k - i / 2) * 5, WT + 0.2, DH + 9));
  });

  const doors = CX.map((cx, i) => {
    const grp = mk("g", {}, g);
    const back = mk("path", { class: "lo" }, grp), face = mk("path", { class: "sil" }, grp);
    const knob = mk("circle", { r: 1.6, class: "dot m" }, grp);
    return { hx: cx - DW / 2, back, face, knob, a: tween(REST[i]), drawn: NaN };
  });
  function drawDoor(d, deg) {
    if (deg === d.drawn) return;
    d.drawn = deg;
    const c = Math.cos(rad(deg)), s = Math.sin(rad(deg));
    const w = (u, v, o) => P(d.hx + u * c - o * s, WT + 0.6 + u * s + o * c, v);
    d.back.setAttribute("d", poly(LEAF.map(([u, v]) => w(u, v, -1.4))));
    d.face.setAttribute("d", poly(LEAF.map(([u, v]) => w(u, v, 0))));
    place(d.knob, w(DW - 4, DH * 0.48, 0));
  }

  // the gate: a post behind the desk and an arm that swings round it
  const [pr, pi] = rings(PV[0] - 3, PV[1] - 3, PV[0] + 3, PV[1] + 3, 3, 1);
  put(solid(g), prism(P, front, pr, pi, 0, AZ + 4));
  const arm = solid(g), swing = tween(-180);
  function drawArm(deg) {
    const c = Math.cos(rad(deg)), s = Math.sin(rad(deg)), q = (u, v) => [PV[0] + u * c - v * s, PV[1] + u * s + v * c];
    const ring = ringOf(fillet([q(-2, -2), q(ARM, -2), q(ARM, 2), q(-2, 2)], [1.9, 1.9, 1.9, 1.9]));
    const inner = ringOf(fillet([q(-1.4, -1.4), q(ARM - 0.6, -1.4), q(ARM - 0.6, 1.4), q(-1.4, 1.4)], [1.3, 1.3, 1.3, 1.3]));
    put(arm, prism(P, front, ring, inner, AZ, AZ + 3));
  }
  // the desk: a counter with a top that overhangs it
  put(solid(g), box(76, 78, 132, 96, 0, 24, 4, 1.2));
  const desk = solid(g);
  put(desk, box(73, 75, 135, 99, 24, 28, 5, 1.6));
  desk.sil.classList.add("hi");

  let armDrawn = NaN;
  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const d of doors) { drawDoor(d, tval(d.a, now)); if (!tdone(d.a, now)) moving = true; }
    const a = tval(swing, now);
    if (a !== armDrawn) { armDrawn = a; drawArm(a); }
    if (!tdone(swing, now)) moving = true;
    return moving;
  });
  bag.add(B.unregister);

  // The hit test reads the closed doors: the doorway whose middle is nearest the pointer, within reach.
  const mids = CX.map((cx) => P(cx, WT, DH / 2));
  function hit([x, y]) {
    let a = 0;
    mids.forEach((m, i) => { if (Math.hypot(m[0] - x, m[1] - y) < Math.hypot(mids[a][0] - x, mids[a][1] - y)) a = i; });
    return Math.abs(mids[a][0] - x) < 26 && Math.abs(mids[a][1] - y) < 44 ? a : -1;
  }

  let act = -2;
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act >= 0 ? act : 0;
    act = a;
    doors.forEach((d, i) => {
      const k = Math.abs(i - from);
      tset(d.a, a < 0 ? REST[i] : OPEN * FALL[Math.abs(i - a)], now, k * stag);
      d.face.classList.toggle("hi", i === a);
    });
    desk.sil.classList.toggle("hi", a < 0);
    const deg = a < 0 ? -180 : (Math.atan2(WT + 14 - PV[1], CX[a] - PV[0]) * 180) / Math.PI;
    tset(swing, deg, now, 0);
    read.textContent = a < 0 ? "rest" : `door ${a + 1}`;
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
  name: "front-desk",
  means: "One front desk stands before many doors. Everyone comes in here first. Point at a door and the gate swings to send you through it.",
  rules: [1, 2, 5, 10],
  range: [0, 40, 80],
  tour: [[182, 102], [263, 142], [303, 163], null],
  mount,
});
