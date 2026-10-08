/**
 * Domino undo: five dominoes stand in a row on a board, one per step of a
 * saga, each with its step number as pips. The pointer picks the step that
 * fails: that domino tips forward, bright, and the finished steps before it
 * lie back down one by one in reverse, the nearest first, staggered out from
 * the failure. The steps after it never ran, so they keep standing. The
 * slider is the stagger, in ms.
 */
const {
  Cam, fit, hull, poly, proj, rad, rrect, seg, mk, place,
  tween, tset, tval, tdone, register, pointer, disposer,
} = HL;

const N = 5, T = 6, W = 20, H = 32, G = 40, R = 3;
const REST = [9, 3, -2, 2, 0];
const PIPS = [[[0.5, 0.5]], [[0.25, 0.25], [0.75, 0.75]], [[0.2, 0.2], [0.5, 0.5], [0.8, 0.8]],
  [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]], [[0.2, 0.2], [0.8, 0.2], [0.5, 0.5], [0.2, 0.8], [0.8, 0.8]]];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;
  const X0 = -H - 8, X1 = (N - 1) * G + T + H + 8;
  const C = Cam(45, 0.5, 1.52);
  fit(C, [[X0, -6, -5], [X1, -6, -5], [X0, W + 6, -5], [X1, W + 6, -5], [0, 0, H + 4]], 200, 172);
  const P = proj(C);
  const view = [Math.cos(rad(45)) * 0.866, Math.sin(rad(45)) * 0.866, 0.5];
  const g = mk("g", {}, svg);

  // the board, a long plate with a crease
  const top = rrect(X0, -6, X1, W + 6, 5, 4), inset = rrect(X0 + 2, -4, X1 - 2, W + 4, 3, 4);
  const at = (ring, z) => ring.map((q) => P(q.u, q.v, z));
  mk("path", { d: poly(hull(at(top, 0).concat(at(top, -5)))), class: "sil" }, g);
  mk("path", { d: poly(at(top, 0)), class: "nf" }, g);
  mk("path", { d: poly(at(inset, 0)), class: "nf lo" }, g);

  // a domino's large face, in its own (v, w) plane: a rounded rectangle
  const face = rrect(0, 0, W, H, R, 4);
  const doms = Array.from({ length: N }, (_, i) => {
    const grp = mk("g", {}, g);
    const d = {
      i, x: i * G, a: tween(REST[i]), drawn: NaN,
      sil: mk("path", { class: "sil" }, grp), cr: mk("path", { class: "nf lo" }, grp), mid: mk("path", { class: "nf" }, grp),
      pips: PIPS[i].map(() => mk("circle", { r: 1.7, class: "dot m" }, grp)),
    };
    d.cx = P(d.x + T / 2, W / 2, H / 2)[0];
    return d;
  });

  /** A point (u across the thickness, v along the width, w up) of domino d leaning th degrees: forward on its front edge, back on its back edge. */
  const pt = (d, th, u, v, w) => {
    const s = Math.sin(rad(Math.abs(th))), c = Math.cos(rad(Math.abs(th)));
    if (th >= 0) return [d.x + T + (u - T) * c + w * s, v, -(u - T) * s + w * c];
    return [d.x + u * c - w * s, v, u * s + w * c];
  };
  function draw(d, now) {
    const th = tval(d.a, now);
    if (th === d.drawn) return;
    d.drawn = th;
    const ring = (u) => face.map((q) => P(...pt(d, th, u, q.u, q.v)));
    d.sil.setAttribute("d", poly(hull(ring(0).concat(ring(T)))));
    // the large face that looks at the camera carries the divider and the pips
    const n = th >= 0 ? [Math.cos(rad(th)), 0, -Math.sin(rad(th))] : [Math.cos(rad(-th)), 0, Math.sin(rad(-th))];
    const u = n[0] * view[0] + n[2] * view[2] > 0 ? T : 0;
    const inner = rrect(1.4, 1.4, W - 1.4, H - 1.4, R - 1.4, 4).map((q) => P(...pt(d, th, u, q.u, q.v)));
    d.cr.setAttribute("d", poly(inner));
    d.mid.setAttribute("d", seg(P(...pt(d, th, u, 3, H / 2)), P(...pt(d, th, u, W - 3, H / 2))));
    PIPS[d.i].forEach(([a, b], k) => place(d.pips[k], P(...pt(d, th, u, 3 + a * (W - 6), H / 2 + 2.5 + b * (H / 2 - 5)))));
  }
  const B = register(stage, (_dt, now) => {
    let m = false;
    for (const d of doms) { draw(d, now); if (!tdone(d.a, now)) m = true; }
    return m;
  });
  bag.add(B.unregister);

  let act = -2;
  function choose(k) {
    if (k === act) return;
    act = k;
    const now = performance.now();
    doms.forEach((d) => {
      const to = k < 0 ? REST[d.i] : d.i === k ? 90 : d.i < k ? -90 : 0;
      // the failed step goes first; the undo runs back from it, nearest first
      tset(d.a, to, now, k < 0 || d.i >= k ? 0 : (k - d.i) * stag + 120);
      const lit = k < 0 ? d.i === 0 : d.i === k;
      d.sil.classList.toggle("hi", lit);
      d.pips.forEach((p) => p.setAttribute("class", lit ? "dot" : "dot m"));
    });
    read.textContent = k < 0 ? "rest" : `step ${k + 1} fails · undo ${k}`;
    B.wake();
  }
  choose(-1);

  const band = hull([P(X0, -6, 0), P(X1, -6, 0), P(X0, W + 6, 0), P(X1, W + 6, 0), P(X0, -6, H + 6), P(X1, -6, H + 6), P(X1, W + 6, H + 6)]);
  const inside = ([x, y], pl) => {
    let c = false;
    for (let i = 0, j = pl.length - 1; i < pl.length; j = i++) if ((pl[i][1] > y) !== (pl[j][1] > y) && x < ((pl[j][0] - pl[i][0]) * (y - pl[i][1])) / (pl[j][1] - pl[i][1]) + pl[i][0]) c = !c;
    return c;
  };
  bag.add(pointer(stage, {
    // the domino whose rest centre is nearest the pointer across the screen
    move: (p) => {
      if (!inside(p, band)) return choose(-1);
      let k = 0;
      doms.forEach((d, i) => { if (Math.abs(d.cx - p[0]) < Math.abs(doms[k].cx - p[0])) k = i; });
      choose(k);
    },
    leave: () => choose(-1),
  }));
  bag.add(() => svg.replaceChildren());

  return { set: (v) => { stag = v; }, destroy: bag.dispose };
}

hairline({
  name: "domino-undo",
  means: "Each domino is one finished step. Point at the step that fails: it tips over, and the steps before it lie back down in reverse.",
  rules: [1, 2, 3, 8],
  range: [40, 110, 180],
  tour: [[270, 210], [200, 175], [130, 140], null],
  mount,
});
