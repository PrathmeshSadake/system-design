/**
 * Ten bowls: the candy poured out into ten small bowls on a tray, five by
 * two, each holding a different few, two of them empty already. The pointer
 * takes from a bowl. A bowl with candy lifts and one piece pops up out of it;
 * an empty bowl lifts, finds nothing, and sends you on to the next bowl that
 * still has some, which lifts a moment later and gives the piece. The bowl
 * that gives is bright; at rest an empty one is. The slider is the lift.
 */
const {
  Cam, facing, fit, hull, poly, proj, rrect, ringAt, rings, prism, unproj,
  tween, tset, tval, tdone, mk, place, pointer, put, register, disposer, solid,
} = HL;

const FILL = [4, 2, 0, 3, 1, 5, 2, 0, 3, 1], COLS = 5, GX = 28, GY = 30, RR = 10.5, RF = 6.5, BH = 8, REST = 2;
const SPOTS = [[0, 0], [-4, -2.5], [4, -2], [-2.5, 3.5], [3, 3.5]];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lift = value;
  const C = Cam(45, 0.5, 2.0);
  fit(C, [[-18, -18, -4], [(COLS - 1) * GX + 18, -18, -4], [(COLS - 1) * GX + 18, GY + 18, -4], [-18, GY + 18, -4], [0, 0, BH + 30]], 200, 168);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const [tr, ti] = rings(-18, -18, (COLS - 1) * GX + 18, GY + 18, 10, 2);
  put(solid(g), prism(P, front, tr, ti, -4, 0));

  // back to front: by row and column sum, so a nearer bowl covers a farther one
  const bowls = FILL.map((n, i) => ({ i, n, x: (i % COLS) * GX, y: Math.floor(i / COLS) * GY }));
  const order = bowls.slice().sort((a, b) => a.x + a.y - (b.x + b.y));
  for (const b of order) {
    b.grp = mk("g", {}, g); b.body = solid(b.grp);
    b.candy = SPOTS.slice(0, b.n).map(() => mk("circle", { r: 2.1, class: "dot m" }, b.grp));
    b.pop = mk("circle", { r: 2.4, class: "dot off" }, b.grp);
    b.z = tween(0); b.p = tween(0); b.drawn = "";
  }
  const foot = (b) => rrect(b.x - RF, b.y - RF, b.x + RF, b.y + RF, RF, 8), rim = (b) => rrect(b.x - RR, b.y - RR, b.x + RR, b.y + RR, RR, 10);
  const inner = (b) => rrect(b.x - RR + 1.3, b.y - RR + 1.3, b.x + RR - 1.3, b.y + RR - 1.3, RR - 1.3, 10);

  function draw(b, z, p) {
    const k = z.toFixed(2) + p.toFixed(2);
    if (k === b.drawn) return;
    b.drawn = k;
    put(b.body, { sil: poly(hull(ringAt(P, foot(b), z).concat(ringAt(P, rim(b), z + BH)))), crease: poly(ringAt(P, inner(b), z + BH)) });
    b.candy.forEach((el, j) => place(el, P(b.x + SPOTS[j][0], b.y + SPOTS[j][1], z + BH - 2)));
    // the piece taken: it rises out of the bowl's middle and hangs over it
    place(b.pop, P(b.x, b.y, z + BH - 2 + p * 16));
    b.pop.setAttribute("r", p > 0.05 ? 2.6 : 0);
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const b of bowls) { draw(b, tval(b.z, now), tval(b.p, now)); if (!tdone(b.z, now) || !tdone(b.p, now)) moving = true; }
    return moving;
  });
  bag.add(B.unregister);

  let act = -2;
  /** The bowl that serves a take from bowl a: a itself, or the next one along that still has candy. */
  const serve = (a) => { for (let k = 0; k < bowls.length; k++) { const b = bowls[(a + k) % bowls.length]; if (b.n) return b.i; } return -1; };
  function choose(a) {
    if (a === act) return;
    act = a;
    const now = performance.now(), s = a < 0 ? -1 : serve(a), steps = s < 0 ? 0 : (s - a + bowls.length) % bowls.length;
    for (const b of bowls) {
      const delay = b.i === s ? steps * 160 : 0;
      tset(b.z, b.i === a || b.i === s ? lift : 0, now, delay);
      tset(b.p, b.i === s ? 1 : 0, now, b.i === s ? delay + 120 : 0);
      b.body.sil.classList.toggle("hi", a < 0 ? b.i === REST : b.i === s);
      b.pop.classList.toggle("off", b.i !== s);
    }
    read.textContent = a < 0 ? "rest" : bowls[a].n ? `bowl ${a + 1} · ${bowls[a].n}` : `bowl ${a + 1} · 0 · next ${s + 1}`;
    B.wake();
  }
  choose(-1);

  /** The bowl whose rim, at rest, is nearest the pointer, read on the plane of the rims. */
  function hit(p) {
    const [x, y] = unproj(C, p[0], p[1], BH);
    let best = -1, bd = RR + 3;
    for (const b of bowls) { const d = Math.hypot(b.x - x, b.y - y); if (d < bd) { bd = d; best = b.i; } }
    return best;
  }

  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { lift = v; if (act >= 0) { const a = act; act = -2; choose(a); } },
    destroy: bag.dispose,
  };
}

hairline({
  name: "ten-bowls",
  means: "The candy is split into ten small bowls so the crowd spreads out. Take from one; if it is empty, you are sent on to the next.",
  rules: [1, 2, 4, 5],
  range: [3, 6, 10],
  tour: [[142, 121], [221, 160], [258, 221], null],
  mount,
});
