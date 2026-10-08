/**
 * Two keys: a padlock with two keys lying in front of it, the old one (round
 * bow, two big teeth) and the new one (square bow, three small teeth). During
 * a rollout both must open the same lock. The pointer picks a key: it rises,
 * stands up into the keyhole, turns, and the shackle springs open. Let go and
 * it goes back to lie beside the other. At rest the keyhole is bright. The
 * slider is how far the shackle springs up.
 */
const {
  Cam, facing, fit, fillet, poly, prism, proj, rad, rings, clamp, lerp, unproj,
  tween, tset, tval, tdone, mk, pointer, put, register, disposer, solid,
} = HL;

const TK = 1.4, HOLE = [0, 6, 16];
const blade = (teeth) => fillet([[0, -2], [20, -2], [20, 2], ...teeth, [0, 2]], [1, 0.5, 0.5, ...teeth.map(() => 0.4), 1]);
const arc = (cx, cy, r, a0, a1, n = 12) => Array.from({ length: n + 1 }, (_, k) => { const a = rad(lerp(a0, a1, k / n)); return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
const KEYS = [
  { name: "v1 ok", x: -15, blade: blade([[13, 2], [13, 4.6], [10, 4.6], [10, 2], [7, 2], [7, 5.2], [4, 5.2], [4, 2]]), bow: arc(26, 0, 6.5, 0, 360, 16) },
  { name: "v2 ok", x: 15, blade: blade([[13, 2], [13, 4], [11, 4], [11, 2], [9.5, 2], [9.5, 4], [7.5, 4], [7.5, 2], [6, 2], [6, 4], [4, 4], [4, 2]]), bow: fillet([[20, -6.5], [33, -6.5], [33, 6.5], [20, 6.5]], [3, 3, 3, 3]) },
];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lift = value;
  const C = Cam(45, 0.5, 3.25);
  fit(C, [[-22, -8, 0], [22, -8, 0], [-22, 46, 0], [22, 46, 0], [0, 0, 44 + 12]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // The shackle: a U in the plane y = 0, its back face then its front; it is painted before the body, so the body hides its legs.
  const U = [...arc(0, 36, 10, 180, 0), [10, 23], [6.5, 23], ...arc(0, 36, 6.5, 0, 180), [-6.5, 23]];
  const shackle = [mk("path", { class: "lo" }, g), mk("path", { class: "sil" }, g)];
  const [br, bi] = rings(-14, -6, 14, 6, 4, 1.2), body = solid(g);
  put(body, prism(P, front, br, bi, 0, 27));
  const hole = [...arc(0, 16, 2.6, -60, 240), [-1.3, 10.5], [1.3, 10.5]];
  const keyhole = mk("path", { d: poly(hole.map(([x, z]) => P(x, 6.05, z))), class: "nf" }, g);

  // Each key: a back face and a front face for the blade and for the bow, and a hole in the bow.
  const keys = KEYS.map((k) => {
    const kg = mk("g", {}, g), el = {};
    for (const part of ["bb", "bf", "wb", "wf"]) el[part] = mk("path", { class: part.endsWith("b") ? "lo" : "sil" }, kg);
    el.hole = mk("path", { class: "nf lo" }, kg);
    return { ...k, g: kg, el, m: tween(0), r: tween(0), drawn: "" };
  });

  /** A key's pose: m carries it from the ground to the keyhole, standing it up; r turns it there. */
  function drawKey(k, m, r) {
    const key = m.toFixed(4) + r.toFixed(4);
    if (key === k.drawn) return;
    k.drawn = key;
    const th = rad(90 * (m - r)), tip = [lerp(k.x, HOLE[0], m), lerp(12, HOLE[1] + 0.3, m), lerp(TK + 0.2, HOLE[2], m)];
    const ev = [Math.cos(th), 0, Math.sin(th)], nrm = [Math.sin(th), 0, -Math.cos(th)];
    const at = ([u, v], d) => P(tip[0] + v * ev[0] + d * nrm[0], tip[1] + u, tip[2] + v * ev[2] + d * nrm[2]);
    const face = (pts, d) => poly(pts.map((p) => at(p, d)));
    k.el.bb.setAttribute("d", face(k.blade, TK)); k.el.bf.setAttribute("d", face(k.blade, 0));
    k.el.wb.setAttribute("d", face(k.bow, TK)); k.el.wf.setAttribute("d", face(k.bow, 0));
    k.el.hole.setAttribute("d", face(arc(28.5, 0, 1.8, 0, 360, 10), 0));
  }
  const sh = tween(0);
  let shDrawn = NaN;
  function drawShackle(f) {
    if (f === shDrawn) return;
    shDrawn = f;
    const z = f * lift;
    shackle[0].setAttribute("d", poly(U.map(([x, h]) => P(x, -1.8, h + z))));
    shackle[1].setAttribute("d", poly(U.map(([x, h]) => P(x, 1.8, h + z))));
  }

  const B = register(stage, (_dt, now) => {
    let moving = !tdone(sh, now);
    drawShackle(tval(sh, now));
    for (const k of keys) { drawKey(k, tval(k.m, now), tval(k.r, now)); if (!tdone(k.m, now) || !tdone(k.r, now)) moving = true; }
    return moving;
  });
  bag.add(B.unregister);

  // Hit test on the ground, which never moves: the key lying on that side, where it rests.
  function hit([sx, sy]) {
    const [x, y] = unproj(C, sx, sy, 0);
    if (y < 9 || y > 48 || Math.abs(x) > 28) return -1;
    return x < 0 ? 0 : 1;
  }

  let act = null;
  function choose(a) {
    if (a === act) return;
    const now = performance.now();
    act = a;
    keys.forEach((k, i) => {
      const on = i === a;
      tset(k.m, on ? 1 : 0, now, 0);
      tset(k.r, on ? 1 : 0, now, on ? 380 : 0);
      k.el.bf.classList.toggle("hi", on); k.el.wf.classList.toggle("hi", on);
    });
    // The picked key is painted last: it rises above the one left lying.
    if (a >= 0) g.append(keys[a].g);
    tset(sh, a >= 0 ? 1 : 0, now, a >= 0 ? 600 : 0);
    keyhole.classList.toggle("hi", a < 0);
    read.textContent = a < 0 ? "rest" : keys[a].name;
    B.wake();
  }
  choose(-1);

  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { lift = clamp(v, 0, 14); shDrawn = NaN; B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "two-keys",
  means: "One lock, an old key and a new key. Point at either key and it opens the lock, as both must work while the update rolls out.",
  rules: [1, 4, 8, 10],
  range: [4, 8, 12],
  tour: [[140, 220], [209, 255], null],
  mount,
});
