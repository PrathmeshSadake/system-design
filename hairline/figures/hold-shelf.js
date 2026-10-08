/**
 * Hold shelf: a small hold shelf with one spinning top on it, saved for
 * someone, an hourglass beside it, and the main shelf beyond with two more
 * tops and a gap. The pointer's x scrubs the minutes since the hold began:
 * sand runs from the top bulb to the bottom. When the sand runs out, the top
 * hops back to the gap on the main shelf for the next shopper. At rest three
 * minutes have passed and the held top is bright. The slider is the hold's
 * length, in minutes.
 */
const {
  Cam, clamp, facing, fit, hull, open, poly, proj, prism, rings, ringAt, rrect,
  spring, stepS, tween, tset, tval, tdone, mk, pointer, put, register, disposer, solid,
} = HL;

const HOLD = [8, 16], SLOT = [130, 16], HG = [56, 28], REST = 0.3, Z = 19;
const ring = (x, y, r, n) => rrect(x - r, y - r, x + r, y + r, r, n || 8);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let mins = value;
  const C = Cam(45, 0.5, 1.9);
  fit(C, [[-14, -6, -4], [150, -6, -4], [150, 46, -4], [-14, 46, -4], [68, 16, 62], [60, 30, 46]], 200, 168);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const [br, bi] = rings(-14, -6, 150, 46, 10, 2);
  put(solid(g), prism(P, front, br, bi, -4, 0));

  /** A shelf: a block on the base with a plank on top. */
  const shelf = (x0, x1) => {
    const [r, ri] = rings(x0 + 2, 6, x1 - 2, 26, 3, 1.2), [t, ti] = rings(x0, 4, x1, 28, 3, 1.2);
    const s = solid(g), plank = solid(g); put(s, prism(P, front, r, ri, 0, Z - 3)); put(plank, prism(P, front, t, ti, Z - 3, Z));
    return plank;
  };
  /** A spinning top at (x, y, z): a cone on its point, a rim, a stem. */
  const top = (grp) => [solid(grp), solid(grp), solid(grp)];
  const drawTop = (parts, x, y, z) => {
    put(parts[0], { sil: poly(hull(ringAt(P, ring(x, y, 1.4), z).concat(ringAt(P, ring(x, y, 8), z + 10)))), crease: "" });
    const [a, ai] = rings(x - 8, y - 8, x + 8, y + 8, 8, 1.2); put(parts[1], prism(P, front, a, ai, z + 10, z + 12.5));
    const [b, bi2] = rings(x - 1.8, y - 1.8, x + 1.8, y + 1.8, 1.8, 0.5); put(parts[2], prism(P, front, b, bi2, z + 12.5, z + 19));
  };

  const holdPlank = shelf(-6, 22);
  // the hourglass: a base, two glass bulbs meeting at a neck, a lid on posts, and the sand inside
  const hx = HG[0], hy = HG[1], NZ = 22, TZ = 43;
  const [pa, pai] = rings(hx - 12, hy - 12, hx + 12, hy + 12, 12, 1.4);
  put(solid(g), prism(P, front, pa, pai, 0, 2.5));
  const sandTop = solid(g), sandLow = solid(g), stream = mk("path", { class: "nf" }, g);
  const glass = (z0, r0, z1, r1) => poly(hull(ringAt(P, ring(hx, hy, r0, 10), z0).concat(ringAt(P, ring(hx, hy, r1, 10), z1))));
  mk("path", { d: glass(2.5, 10, NZ, 1.8) + glass(NZ, 1.8, TZ, 10), class: "nf lo" }, g);
  mk("path", { d: [[-9, 0], [9, 0], [0, 9]].map(([dx, dy]) => open([P(hx + dx * 1.2, hy + dy * 1.2, 2.5), P(hx + dx * 1.2, hy + dy * 1.2, TZ)])).join(""), class: "nf" }, g);
  const [la, lai] = rings(hx - 11.5, hy - 11.5, hx + 11.5, hy + 11.5, 11.5, 1.4);
  put(solid(g), prism(P, front, la, lai, TZ, TZ + 2.5));
  shelf(86, 144);
  const others = [[95, 16], [112, 16]].map(([x, y]) => { const p = top(mk("g", {}, g)); drawTop(p, x, y, Z); return p; });

  const toyG = mk("g", {}, g), toy = top(toyG);
  toy.forEach((s) => s.sil.classList.add("hi"));
  const sand = spring(1 - REST), back = tween(0);
  let drawn = "";
  function draw(f, u) {
    const k = f.toFixed(3) + u.toFixed(3);
    if (k === drawn) return;
    drawn = k;
    f = clamp(f, 0, 1);
    // what is left in the top bulb, down to the neck, and the heap below
    const zl = NZ + 1 + 15 * f, rl = 1.6 + 6.6 * f;
    if (f > 0.02) put(sandTop, { sil: poly(hull(ringAt(P, ring(hx, hy, 1.3, 10), NZ + 0.5).concat(ringAt(P, ring(hx, hy, rl, 10), zl)))), crease: poly(ringAt(P, ring(hx, hy, rl, 10), zl)) });
    else put(sandTop, { sil: "", crease: "" });
    const hh = 1 + 14 * (1 - f);
    put(sandLow, { sil: poly(hull(ringAt(P, ring(hx, hy, 9, 10), 2.6).concat(ringAt(P, ring(hx, hy, 1 + 2 * f, 10), 2.6 + hh)))), crease: "" });
    stream.setAttribute("d", f > 0.02 && f < 0.98 ? open([P(hx, hy, NZ), P(hx, hy, 2.6 + hh)]) : "");
    // the held top: on the hold shelf, or hopping over the hourglass to the gap on the main shelf
    const x = HOLD[0] + (SLOT[0] - HOLD[0]) * u, y = HOLD[1] + (SLOT[1] - HOLD[1]) * u;
    drawTop(toy, x, y, Z + 40 * u * (1 - u));
    // on the hold shelf it stands behind the hourglass; once it hops, it is over and past it
    if (u < 0.3 && holdPlank.g.nextSibling !== toyG) holdPlank.g.after(toyG);
    else if (u >= 0.3 && g.lastChild !== toyG) g.append(toyG);
  }

  const B = register(stage, (dt, now) => {
    const m = stepS(sand, dt);
    draw(sand.x, tval(back, now));
    return m || !tdone(back, now);
  });
  bag.add(B.unregister);

  let over = null;
  function update() {
    const used = over === null ? REST : over;
    sand.t = 1 - used;
    // the hold ends when the sand's target runs out, not when the drawing does
    tset(back, sand.t <= 0.001 ? 1 : 0, performance.now(), 0);
    const left = Math.round(mins * (1 - used));
    read.textContent = over === null ? "rest" : left > 0 ? `${left} min left` : "0 · back on shelf";
    B.wake();
  }
  update();

  // the minutes run along the stage from left to right
  bag.add(pointer(stage, {
    move: (p) => { over = clamp((p[0] - 70) / 260, 0, 1); update(); },
    leave: () => { over = null; update(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { mins = v; update(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "hold-shelf",
  means: "A toy saved for you on the hold shelf, with an hourglass. Slide through the minutes: when the sand runs out, the toy goes back on the shelf.",
  rules: [3, 5, 8, 10],
  range: [5, 10, 15],
  tour: [[150, 160], [250, 160], [345, 160], null],
  mount,
});
