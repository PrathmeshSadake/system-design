/**
 * Fridge to attic: four places to keep things, on four steps that climb away
 * from you, each bigger and further than the last: a fridge (door seam and
 * handle), a pantry cupboard (two doors, jars on top), an attic (a pitched
 * roof with a round window), and a storage unit (a roll-up door). Near is
 * fast and dear; far is slow and cheap. The pointer picks one: it lifts, and
 * its neighbours lift a little, later the further they are. At rest the
 * fridge is bright. The slider is the lift.
 */
const {
  Cam, facing, fit, hull, open, poly, proj, prism, rings, ringAt, rrect, run, unproj,
  tween, tset, tval, tdone, mk, place, pointer, put, register, disposer, solid,
} = HL;

// far to near: [x0, x1, depth, height, step under it, read-out]
const TIERS = [
  [0, 46, 38, 30, 21, "archive · hours"],
  [56, 92, 30, 18, 14, "cold · cheap"],
  [102, 130, 20, 26, 7, "warm · near"],
  [140, 158, 18, 32, 0, "hot · fast"],
];
const Y = 24, FALL = [1, 0.3, 0.12, 0.05];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lift = value;
  const C = Cam(45, 0.5, 1.62);
  fit(C, [[-6, 0, -4], [164, 48, -4], [164, 0, -4], [-6, 48, -4], [0, 4, 51 + 20 + 12], [150, 24, 32 + 22]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // the steps, far and high to near and low, then each tier's piece on its step
  const tiers = TIERS.map(([x0, x1, d, h, st, name], i) => {
    const sx0 = i ? TIERS[i - 1][1] + 0.01 : -6, sx1 = i < 3 ? x1 + 5 : 164;
    const [sr, si] = rings(sx0, 0, sx1, 48, 4, 1.4);
    put(solid(g), prism(P, front, sr, si, -4, st));
    const t = { i, x0, x1, y0: Y - d / 2, y1: Y + d / 2, h, st, name, grp: mk("g", {}, g), z: tween(0), drawn: NaN, parts: [] };
    t.body = solid(t.grp);
    t.marks = mk("path", { class: "nf lo" }, t.grp);
    if (i === 1) t.roof = solid(t.grp);
    if (i === 2) t.jars = [0, 1].map(() => solid(t.grp));
    t.dots = [0, 1].map(() => mk("circle", { r: 1.5, class: "dot m" }, t.grp));
    return t;
  });

  const segs = (list) => list.map(([a, b]) => "M" + a.join(",") + "L" + b.join(",")).join("");
  function draw(t, z) {
    if (z === t.drawn) return;
    t.drawn = z;
    const b = t.st + z, top = b + t.h, { x0, x1, y0, y1 } = t, F = (x, zz) => P(x, y1, zz);
    const [r, ri] = rings(x0, y0, x1, y1, 3, 1.3);
    put(t.body, prism(P, front, r, ri, b, top));
    let m = [];
    if (t.i === 0) {
      // a roll-up door: its frame and its slats
      m = [[F(x0 + 6, b), F(x0 + 6, b + 22)], [F(x0 + 6, b + 22), F(x1 - 6, b + 22)], [F(x1 - 6, b + 22), F(x1 - 6, b)]];
      for (let k = 1; k < 5; k++) m.push([F(x0 + 6, b + k * 4.4), F(x1 - 6, b + k * 4.4)]);
      place(t.dots[0], F((x0 + x1) / 2, b + 2.2)); t.dots[1].setAttribute("r", 0);
    } else if (t.i === 1) {
      // the attic: a pitched roof whose ridge runs along x, and a round window in its gable
      const foot = rrect(x0 - 3, y0 - 3, x1 + 3, y1 + 3, 3, 4), ridge = rrect(x0 - 3, Y - 1.6, x1 + 3, Y + 1.6, 1.5, 4), inner = rrect(x0 - 2, Y - 0.6, x1 + 2, Y + 0.6, 0.5, 4);
      put(t.roof, { sil: poly(hull(ringAt(P, foot, top).concat(ringAt(P, ridge, top + 16)))), crease: open(ringAt(P, run(inner, front), top + 16)) });
      place(t.dots[0], P(x1 + 3, Y, top + 6)); t.dots[1].setAttribute("r", 0);
      m = [[F(x0 + 8, b), F(x0 + 8, b + 12)], [F(x0 + 8, b + 12), F(x0 + 16, b + 12)], [F(x0 + 16, b + 12), F(x0 + 16, b)]];
    } else if (t.i === 2) {
      // the pantry: two doors with a knob each, and two jars on top
      const mx = (x0 + x1) / 2;
      m = [[F(mx, b + 2), F(mx, top - 2)]];
      place(t.dots[0], F(mx - 3, b + t.h * 0.55)); place(t.dots[1], F(mx + 3, b + t.h * 0.55));
      t.jars.forEach((j, k) => {
        const cx = x0 + 8 + k * 12, [jr, ji] = rings(cx - 4, Y - 4, cx + 4, Y + 4, 4, 1);
        put(j, prism(P, front, jr, ji, top, top + 9 - k * 2));
      });
    } else {
      // the fridge: the freezer's seam and a handle on each door
      m = [[F(x0 + 1.5, b + t.h * 0.66), F(x1 - 1.5, b + t.h * 0.66)], [F(x1 - 4, b + t.h * 0.72), F(x1 - 4, b + t.h * 0.9)], [F(x1 - 4, b + t.h * 0.3), F(x1 - 4, b + t.h * 0.56)]];
      t.dots.forEach((d) => d.setAttribute("r", 0));
    }
    t.marks.setAttribute("d", segs(m));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const t of tiers) { draw(t, tval(t.z, now)); if (!tdone(t.z, now)) moving = true; }
    return moving;
  });
  bag.add(B.unregister);

  let act = -2;
  function choose(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    for (const t of tiers) {
      const d = Math.abs(t.i - from);
      tset(t.z, a < 0 ? 0 : lift * FALL[Math.abs(t.i - a)], now, (Number.isFinite(d) ? d : 0) * 50);
      const on = a < 0 ? t.i === 3 : t.i === a;
      t.body.sil.classList.toggle("hi", on);
      if (t.roof) t.roof.sil.classList.toggle("hi", on);
      if (t.jars) t.jars.forEach((j) => j.sil.classList.toggle("hi", on));
    }
    read.textContent = a < 0 ? "rest" : tiers[a].name;
    B.wake();
  }
  choose(-1);

  /** Each piece's rest box, tried on planes from its foot to its top; nearer pieces stand in front, so they are tried first. */
  function hit(p) {
    for (let i = 3; i >= 0; i--) {
      const t = tiers[i], top = t.st + t.h + (i === 1 ? 16 : i === 2 ? 9 : 0);
      for (let z = t.st; z <= top; z += 2) {
        const [x, y] = unproj(C, p[0], p[1], z);
        if (x > t.x0 - 3 && x < t.x1 + 3 && y > t.y0 - 3 && y < t.y1 + 3) return i;
      }
    }
    return -1;
  }

  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { lift = v; if (act >= 0) { const a = act; act = -2; choose(a); } },
    destroy: bag.dispose,
  };
}

hairline({
  name: "fridge-attic",
  means: "A fridge, a pantry, an attic and a storage unit, each further away and cheaper. Pick one: the further it is, the slower to fetch from.",
  rules: [1, 2, 4, 10],
  range: [6, 12, 20],
  tour: [[280, 214], [194, 171], [136, 115], null],
  mount,
});
