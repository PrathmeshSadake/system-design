/**
 * Time trays: a rod held up by two posts, with ten beads threaded on it, each
 * bead a note placed along the rod by when it happened. Under the rod stand
 * four open trays end to end, one for each slice of time; they never overlap,
 * so every bead belongs to exactly one tray. The pointer picks a tray and the
 * beads above it drop into it, staggered out from the bead nearest the
 * pointer, while the others go back up on the rod. At rest the third tray is
 * already counted and bright. The slider is the stagger, in ms.
 */
const {
  Cam, clamp, facing, fit, hull, open, poly, prism, proj, rings, ringAt, rrect, run, unproj,
  tween, tset, tval, tdone, disposer, mk, pointer, put, register, solid,
} = HL;

const W = 50, NT = 4, TY = 30, WH = 9, WT = 2.4, ZR = 50, RR = 2.4, BR = 6.3, SC = 1.66;
const BEADS = [12, 33, 55, 68, 81, 94, 111, 125, 139, 170];
const XE = NT * W + 10, X0 = -10, HOME = 2;
const tray = (x) => clamp(Math.floor(x / W), 0, NT - 1);
const LR = (pts) => (pts[0][0] <= pts[pts.length - 1][0] ? pts : pts.slice().reverse());

/** One open tray: `far` is painted before its beads, `near` after; each entry is [d, class]. */
function trayPaths(P, front, t) {
  const x0 = t * W + 3, x1 = (t + 1) * W - 3;
  const outer = rrect(x0, 0, x1, TY, 5, 6), inner = rrect(x0 + WT, WT, x1 - WT, TY - WT, 5 - WT, 6);
  const iF = LR(ringAt(P, run(inner, front), WH)), oT = LR(ringAt(P, run(outer, front), WH)), oB = LR(ringAt(P, run(outer, front), 0));
  return {
    far: [[poly(hull(ringAt(P, outer, 0).concat(ringAt(P, outer, WH)))), "sil"], [poly(ringAt(P, inner, WH)), "nf"]],
    near: [[poly([...iF, oT[oT.length - 1], ...oB.slice().reverse(), oT[0]]), "fo"], [open(oT), "nf lo"], [open(iF), "nf"],
      [open([oT[0], ...oB, oT[oT.length - 1]]), "nf sil"]],
  };
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;
  const C = Cam(45, 0.5, SC);
  fit(C, [[X0 - 4, 0, 0], [XE + 4, TY, 0], [X0, TY / 2, ZR + 8], [XE, TY / 2, ZR + 8], [X0, TY, 0], [XE, 0, 0]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const post = (x) => { const [r, i] = rings(x - 4, TY / 2 - 4, x + 4, TY / 2 + 4, 2.5, 0.9); put(solid(g), prism(P, front, r, i, 0, ZR + 5)); };

  post(X0);
  // The rod: a round bar along x, its near end facing the viewer.
  const at = (ring, x) => ring.map((q) => P(x, q.u, q.v));
  const prof = rrect(TY / 2 - RR, ZR - RR, TY / 2 + RR, ZR + RR, RR, 4), pin = rrect(TY / 2 - RR + 0.7, ZR - RR + 0.7, TY / 2 + RR - 0.7, ZR + RR - 0.7, RR - 0.7, 4);
  put(solid(g), { sil: poly(hull(at(prof, X0).concat(at(prof, XE)))), crease: open(at(run(pin, (q) => q.nu * 0.612 + q.nv * 0.5 > 0), XE)) });

  const trays = [], beads = [];
  for (let t = 0; t < NT; t++) {
    const paths = trayPaths(P, front, t), lit = [];
    for (const [d, cls] of paths.far) { const el = mk("path", { d, class: cls }, g); if (cls === "sil") lit.push(el); }
    BEADS.forEach((x, i) => { if (tray(x) === t) beads.push({ x, i, t, el: mk("path", { class: "sil" }, g), s: tween(t === HOME ? 1 : 0), drawn: NaN }); });
    for (const [d, cls] of paths.near) { const el = mk("path", { d, class: cls }, g); if (cls === "nf sil") lit.push(el); }
    trays.push({ lit, n: BEADS.filter((x) => tray(x) === t).length });
  }
  post(XE);

  const R = BR * SC, ring = [];
  for (let k = 0; k < 24; k++) ring.push([R * Math.cos((k / 24) * 2 * Math.PI), R * Math.sin((k / 24) * 2 * Math.PI)]);
  function draw(b, s) {
    if (s === b.drawn) return;
    b.drawn = s;
    const c = P(b.x, TY / 2, ZR + (2.6 + BR - ZR) * s);
    b.el.setAttribute("d", poly(ring.map((p) => [c[0] + p[0], c[1] + p[1]])));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const b of beads) { draw(b, tval(b.s, now)); if (!tdone(b.s, now)) moving = true; }
    return moving;
  });
  bag.add(B.unregister);

  let act = -2;
  /** Picks tray a (-1 for rest, where the third tray is counted); px is the pointer's x on the rod. */
  function setActive(a, px) {
    if (a === act) return;
    const now = performance.now(), t = a < 0 ? HOME : a;
    act = a;
    const near = beads.reduce((p, q) => (Math.abs(q.x - px) < Math.abs(p.x - px) ? q : p)).i;
    for (const b of beads) {
      tset(b.s, b.t === t ? 1 : 0, now, Math.abs(b.i - near) * stag);
      b.el.classList.toggle("hi", b.t === t);
    }
    trays.forEach((tr, k) => tr.lit.forEach((el) => el.classList.toggle("hi", k === t)));
    read.textContent = a < 0 ? "rest" : `tray ${a + 1} · ${trays[a].n}`;
    B.wake();
  }

  bag.add(pointer(stage, {
    move: (p) => {
      // The trays on the ground, or the rod above them: both planes stay put.
      const [x, y] = unproj(C, p[0], p[1], 0), [xr, yr] = unproj(C, p[0], p[1], ZR);
      const onTray = y > -10 && y < TY + 10 && x > 0 && x < NT * W, onRod = yr > -6 && yr < TY + 6 && xr > 0 && xr < NT * W;
      setActive(onTray ? tray(x) : onRod ? tray(xr) : -1, onTray ? x : xr);
    },
    leave: () => setActive(-1, 2.5 * W),
  }));
  bag.add(() => svg.replaceChildren());
  setActive(-1, 2.5 * W);

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "time-trays",
  means: "Beads on a rod are notes in time order. Trays split time into slices that never overlap. Point at a tray and its beads drop in.",
  rules: [1, 2, 5, 6],
  range: [0, 40, 90],
  tour: [[112, 145], [171, 175], [288, 233], null],
  mount,
});
