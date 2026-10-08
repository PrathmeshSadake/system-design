/**
 * Ice cream trucks: a factory with a chimney in the middle of town, and ice
 * cream trucks parked around it, each with a cab, wheels, a scoop on the roof
 * and a serving hatch. The pointer is someone standing on the ground: the
 * nearest truck opens its hatch with the bright stroke and drives a little way
 * toward them along its road (a spring, clamped), and a dashed path runs from
 * the person to it. Near the factory, the factory answers itself. At rest
 * truck 3 is serving. The slider is how many trucks are parked: more trucks,
 * shorter trips. The pointer is read on the ground plane, which never moves.
 */
const {
  Cam, clamp, facing, fit, open, poly, prism, proj, rad, rings, rrect, spring, stepS, tset, tval, tween, tdone, unproj,
  disposer, flatDot, mk, place, pointer, put, register, solid,
} = HL;

const SPOTS = [[-40, -12], [38, 10], [-4, -40], [6, 38], [34, -30], [-36, 28]];
const E = 56, FAC = 16, NEAR = 30, DRIVE = 16;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let n = Math.round(value);
  const C = Cam(45, 0.5, 2.0);
  fit(C, [[-E, -E, -4], [E, -E, -4], [E, E, -4], [-E, E, -4], [6, -8, 36]], 200, 166);
  const P = proj(C), front = facing(C), g = mk("g", {}, svg);
  const box = (parent, x0, y0, x1, y1, r, b, z0, z1, el) => { const s = el || solid(parent); const [o, i] = rings(x0, y0, x1, y1, r, b); put(s, prism(P, front, o, i, z0, z1)); return s; };
  const side = (y, ring) => poly(ring.map((q) => P(q.u, y, q.v)));

  box(g, -E, -E, E, E, 6, 2.2, -4, 0);
  const path = mk("path", { class: "dash" }, g), who = flatDot(g, C, 1.8, "dot");
  SPOTS.forEach(([x, y]) => mk("path", { d: poly(rrect(x - 13, y - 7.5, x + 14, y + 7.5, 3, 4).map((q) => P(q.u, q.v, 0))), class: "dash" }, g));

  // back to front: the factory and the six parking spots, by x + y
  const order = [[0, 0, -1], ...SPOTS.map(([x, y], k) => [x, y, k])].sort((p, q) => p[0] + p[1] - q[0] - q[1]);
  const trucks = [];
  let factory = null;
  for (const [x, y, k] of order) {
    if (k < 0) {
      factory = box(g, -13, -10, 13, 10, 3, 1.4, 0, 22);
      mk("path", { d: side(10.2, rrect(-5, 0, 5, 11, 2, 4)), class: "nf" }, g);
      box(g, 4, -7, 10, -1, 3, 1, 22, 36);
      continue;
    }
    const slot = mk("g", {}, g), t = mk("g", {}, slot);
    const parts = { body: solid(t), cab: solid(t), scoop: solid(t), hatch: mk("path", { class: "nf lo" }, t), wheels: mk("path", {}, t), flap: mk("path", { class: "nf" }, t) };
    trucks[k] = { k, x, y, slot, t, parts, a: tween(0), dx: spring(0), drawn: "" };
  }

  /** Truck T driven dx along its road, its hatch flap opened a degrees. */
  function drawTruck(T, dx, a) {
    const key = dx.toFixed(2) + ":" + a.toFixed(2);
    if (key === T.drawn) return;
    T.drawn = key;
    const x = T.x + dx, y = T.y, f = T.parts, yf = y + 5.6;
    box(null, x - 11, y - 5.5, x + 5, y + 5.5, 2.2, 1, 2, 15, f.body);
    box(null, x + 5, y - 5.5, x + 12, y + 5.5, 2.2, 1, 2, 10, f.cab);
    box(null, x - 8, y - 4, x, y + 4, 4, 1, 15, 18, f.scoop);
    f.hatch.setAttribute("d", side(yf, rrect(x - 9, 7, x + 1, 12.5, 1, 3)));
    f.wheels.setAttribute("d", [x - 7, x + 8].map((wx) => side(yf + 0.2, rrect(wx - 3, 0, wx + 3, 6, 3, 4))).join(""));
    const s = Math.sin(rad(a)), c = Math.cos(rad(a)), w = (u, v) => P(u, yf + v * s, 12.5 - v * c);
    f.flap.setAttribute("d", poly(rrect(x - 9.4, 0, x + 1.4, 5.5, 0.8, 3).map((q) => w(q.u, q.v))));
  }

  const sx = spring(0), sy = spring(0);
  let target = null;
  const B = register(stage, (dt, now) => {
    let m = stepS(sx, dt) | stepS(sy, dt);
    for (const T of trucks) { m |= stepS(T.dx, dt); drawTruck(T, T.dx.x, tval(T.a, now)); if (!tdone(T.a, now)) m = true; }
    if (target) {
      if (!who.isConnected) path.after(who);
      place(who, P(sx.x, sy.x, 0));
      const [tx, ty] = target.k < 0 ? [0, 11] : [target.x + target.dx.x - 4, target.y + 7.5];
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
    // the truck that serves drives toward the person along its road, as far as DRIVE; the rest go back to their spots
    trucks.forEach((T) => { T.dx.t = target === T ? clamp(at[0] - T.x, -DRIVE, DRIVE) : 0; });
    if (key !== act) {
      act = key;
      const now = performance.now(), lit = at ? pick.k : n > 2 ? 2 : 1;
      trucks.forEach((T) => { tset(T.a, T.k === lit ? 80 : 0, now, 0); T.parts.body.sil.classList.toggle("hi", T.k === lit); });
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
  tour: [[155, 134], [182, 168], [211, 196], null],
  mount,
});
