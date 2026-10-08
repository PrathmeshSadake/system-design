/**
 * Ice cream trucks: a factory with a chimney in the middle of town, and ice
 * cream trucks parked around it, each with a cab, wheels, a scoop on the roof
 * and a serving hatch. The pointer is someone standing on the ground: the
 * nearest truck opens its hatch with the bright stroke, and a dashed path runs
 * from the person to it. Near the factory, the factory answers itself. At rest
 * truck 3 is serving. The slider is how many trucks are parked: more trucks,
 * shorter trips. The pointer is read on the ground plane, which never moves.
 */
const {
  Cam, clamp, facing, fit, open, poly, prism, proj, rad, rings, rrect, spring, stepS, tdone, tset, tval, tween, unproj,
  disposer, flatDot, mk, place, pointer, put, register, solid,
} = HL;

const SPOTS = [[-50, -18], [46, 14], [-8, -50], [10, 50], [40, -36], [-44, 34]];
const E = 68, FAC = 18, NEAR = 34;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let n = Math.round(value);
  const C = Cam(45, 0.5, 1.42);
  fit(C, [[-E, -E, -4], [E, -E, -4], [E, E, -4], [-E, E, -4], [6, -8, 36]], 200, 166);
  const P = proj(C), front = facing(C), g = mk("g", {}, svg);
  const box = (parent, x0, y0, x1, y1, r, b, z0, z1) => { const s = solid(parent); const [o, i] = rings(x0, y0, x1, y1, r, b); put(s, prism(P, front, o, i, z0, z1)); return s; };

  box(g, -E, -E, E, E, 12, 2.2, -4, 0);
  const path = mk("path", { class: "dash" }, g), who = flatDot(g, C, 1.6, "dot");
  SPOTS.forEach(([x, y]) => mk("path", { d: poly(rrect(x - 10, y - 6.5, x + 11, y + 6.5, 3, 4).map((q) => P(q.u, q.v, 0))), class: "dash" }, g));

  // back to front: the factory and the six parking spots, by x + y
  const order = [[0, 0, -1], ...SPOTS.map(([x, y], k) => [x, y, k])].sort((p, q) => p[0] + p[1] - q[0] - q[1]);
  const trucks = [];
  let factory = null;
  for (const [x, y, k] of order) {
    if (k < 0) {
      factory = box(g, -14, -11, 14, 11, 3, 1.4, 0, 20);
      mk("path", { d: poly(rrect(-5, 0, 5, 11, 2, 4).map((q) => P(q.u, 11.2, q.v))), class: "nf" }, g);
      box(g, 5, -8, 11, -2, 3, 1, 20, 34);
      continue;
    }
    const slot = mk("g", {}, g), t = mk("g", {}, slot);
    const body = box(t, x - 9, y - 4.5, x + 4, y + 4.5, 2, 0.9, 1.6, 12);
    box(t, x + 4, y - 4.5, x + 10, y + 4.5, 2, 0.9, 1.6, 8);
    box(t, x - 5.5, y - 2.5, x - 0.5, y + 2.5, 2.5, 0.8, 12, 16);
    mk("path", { d: poly(rrect(x - 7, 5.5, x + 1, 10, 1, 3).map((q) => P(q.u, y + 4.6, q.v))), class: "nf lo" }, t);
    [x - 5, x + 6].forEach((wx) => place(mk("circle", { r: 2.6 }, t), P(wx, y + 4.6, 1.8)));
    const flap = mk("path", { class: "nf" }, t), mid = P(x, y, 0);
    trucks[k] = { k, x, y, slot, t, flap, a: tween(0), drawn: NaN, mid, body: body.sil };
  }

  function drawFlap(T, a) {
    if (a === T.drawn) return;
    T.drawn = a;
    const s = Math.sin(rad(a)), c = Math.cos(rad(a)), h = 4.5;
    const w = (u, v) => P(u, T.y + 4.6 + v * s, 10 - v * c);
    T.flap.setAttribute("d", poly(rrect(T.x - 7.4, 0, T.x + 1.4, h, 0.8, 3).map((q) => w(q.u, q.v))));
  }

  const sx = spring(0), sy = spring(0);
  let target = null;
  const B = register(stage, (dt, now) => {
    let m = stepS(sx, dt) | stepS(sy, dt);
    for (const T of trucks) { drawFlap(T, tval(T.a, now)); if (!tdone(T.a, now)) m = true; }
    if (target) {
      if (!who.isConnected) path.after(who);
      place(who, P(sx.x, sy.x, 0));
      const [tx, ty] = target.k < 0 ? [0, 12] : [target.x - 3, target.y + 7];
      path.setAttribute("d", open([P(sx.x, sy.x, 0), P(tx, sy.x, 0), P(tx, ty, 0)]));
    } else { who.remove(); path.setAttribute("d", ""); }
    return !!m;
  });
  bag.add(B.unregister);

  const live = () => trucks.filter((T) => T.k < n);
  function show() { trucks.forEach((T) => { if (T.k < n) T.slot.append(T.t); else T.t.remove(); }); }

  let act = null;
  function answer(at) {
    let pick = null, d = Infinity;
    if (at) for (const T of live()) { const e = Math.hypot(T.x - at[0], T.y - at[1]); if (e < d) { d = e; pick = T; } }
    if (at && Math.hypot(at[0], at[1]) < FAC && Math.hypot(at[0], at[1]) < d) { pick = { k: -1 }; d = 0; }
    const key = at ? pick.k : "rest";
    target = at ? pick : null;
    if (at) { sx.t = clamp(at[0], -E, E); sy.t = clamp(at[1], -E, E); if (!act || act === "rest") { sx.x = sx.t; sy.x = sy.t; } }
    if (key !== act) {
      act = key;
      const now = performance.now(), lit = at ? pick.k : n > 2 ? 2 : 1;
      trucks.forEach((T) => { tset(T.a, T.k === lit ? 80 : 0, now, 0); T.body.classList.toggle("hi", T.k === lit); });
      factory.sil.classList.toggle("hi", at && pick.k < 0);
    }
    read.textContent = !at ? "rest" : pick.k < 0 ? "factory" : `truck ${pick.k + 1} · ${d < NEAR ? "near" : "far"}`;
    B.wake();
  }
  show();
  answer(null);

  bag.add(pointer(stage, {
    move: (p) => { const w = unproj(C, p[0], p[1], 0); answer(Math.abs(w[0]) < E && Math.abs(w[1]) < E ? w : null); },
    leave: () => answer(null),
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { n = Math.round(v); show(); act = null; answer(target ? [sx.t, sy.t] : null); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "ice-cream-trucks",
  means: "A factory in the middle of town and ice cream trucks parked around it. Point anywhere: the nearest truck serves you, so the trip is short.",
  rules: [1, 3, 4, 5],
  range: [2, 4, 6],
  tour: [[120, 130], [280, 150], [200, 230], null],
  mount,
});
