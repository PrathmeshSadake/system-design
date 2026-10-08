/**
 * Desk and shelves: a small desk close by, two blocks on its top, and a tall
 * shelf unit far behind it, four shelves of three blocks. The desk is memory,
 * small and near; the shelves are disk, big and far. The pointer picks a
 * block and it is fetched to the free corner of the desk: from the desk it
 * hops over at once, from a shelf it waits for the walk first, then slides
 * out and flies over. The slider is that walk, in ms.
 */
const {
  Cam, fit, facing, hull, poly, prism, proj, rings, clamp,
  tween, tset, tval, tdone, disposer, mk, pointer, put, register, solid,
} = HL;

const SW = 66, SD = 18, SH = 96, NB = 4, BT = 3, BK = 15;
const DX0 = 112, DX1 = 164, DY0 = 16, DY1 = 62, DZ = 36, DT = 4, LEG = 4;
const DEST = [DX1 - 21, DY1 - 21, DZ + DT];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let walk = value;
  const C = Cam(45, 0.5, 1.5);
  fit(C, [[-6, -6, -4], [DX1 + 6, DY1 + 6, -4], [DX1 + 6, -6, -4], [-6, DY1 + 6, -4], [0, 0, SH], [DEST[0], DEST[1], DEST[2] + 34]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const box = (x0, y0, x1, y1, z0, z1, r = 1.6, b = 0.7) => { const [o, i] = rings(x0, y0, x1, y1, r, b); return prism(P, front, o, i, z0, z1); };
  const slab = (parent, ...a) => { const s = solid(parent); put(s, box(...a)); return s; };

  slab(g, -6, -6, DX1 + 6, DY1 + 6, -4, 0, 8, 2);
  // The shelf unit, back to front: back panel, left side, then each board with its blocks, then the right side.
  slab(g, 0, 0, SW, 2.5, 0, SH);
  slab(g, 0, 0, BT, SD, 0, SH);
  const zb = (k) => (k * (SH - BT)) / NB, blocks = [];
  /** A block at home: its anchor holds its place in the paint order while it is away. */
  const block = (hx, hy, hz, shelf) => {
    const anchor = mk("g", {}, g), el = solid(anchor);
    blocks.push({ home: [hx, hy, hz], shelf, anchor, el, t: tween(0), away: false, drawn: NaN });
  };
  for (let k = 0; k <= NB; k++) {
    slab(g, BT, 2.5, SW - BT, SD, zb(k), zb(k) + BT, 1, 0.5);
    if (k < NB) for (let m = 0; m < 3; m++) block(BT + 3 + m * 19.5, 3.5, zb(k) + BT, NB - k);
  }
  slab(g, SW - BT, 0, SW, SD, 0, SH);
  // The desk: legs, then the top, then its two blocks.
  for (const [x, y] of [[DX0 + 2, DY0 + 2], [DX1 - 2 - LEG, DY0 + 2], [DX0 + 2, DY1 - 2 - LEG], [DX1 - 2 - LEG, DY1 - 2 - LEG]]) slab(g, x, y, x + LEG, y + LEG, 0, DZ, 1.2, 0.5);
  const top = slab(g, DX0, DY0, DX1, DY1, DZ, DZ + DT, 3, 1.2);
  block(DX0 + 5, DY0 + 5, DZ + DT, 0);
  block(DX0 + 25, DY0 + 4, DZ + DT, 0);

  function draw(b, t) {
    if (t === b.drawn) return;
    b.drawn = t;
    const [hx, hy, hz] = b.home, out = b.shelf > 0;
    // From a shelf: out of the cubby first, then over to the desk. From the desk: a short hop.
    const u = out ? clamp(t / 0.3, 0, 1) : 0, v = out ? clamp((t - 0.3) / 0.7, 0, 1) : t;
    const sx = hx, sy = hy + u * (SD + 10), sz = hz;
    const x = sx + (DEST[0] - sx) * v, y = sy + (DEST[1] - sy) * v, z = sz + (DEST[2] - sz) * v + Math.sin(Math.PI * v) * (out ? 30 : 12);
    put(b.el, box(x, y, x + BK, y + BK, z, z + BK, 2.4, 0.9));
    const away = t > (out ? 0.2 : 0.001);
    if (away !== b.away) { b.away = away; if (away) g.append(b.el.g); else b.anchor.append(b.el.g); }
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const b of blocks) { draw(b, tval(b.t, now)); if (!tdone(b.t, now)) moving = true; }
    return moving;
  });
  bag.add(B.unregister);

  // Hit areas from the rest pose only: the desk's top, and each shelf's open front.
  const inside = (pts, [px, py]) => {
    const h = hull(pts);
    return h.every((a, i) => { const b = h[(i + 1) % h.length]; return (b[0] - a[0]) * (py - a[1]) - (b[1] - a[1]) * (px - a[0]) >= 0; })
      || h.every((a, i) => { const b = h[(i + 1) % h.length]; return (b[0] - a[0]) * (py - a[1]) - (b[1] - a[1]) * (px - a[0]) <= 0; });
  };
  const zone = (x0, y0, x1, y1, z0, z1) => [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]].map((q) => P(...q));
  const zones = [[0, zone(DX0, DY0, DX1, DY1, DZ, DZ + DT + BK)]];
  for (let k = 0; k < NB; k++) zones.push([NB - k, zone(0, SD - 4, SW, SD, zb(k) + BT, zb(k + 1))]);
  function hit(p) {
    const z = zones.find(([, pts]) => inside(pts, p));
    if (!z) return -1;
    let best = -1, d = 1e9;
    blocks.forEach((b, i) => {
      if (b.shelf !== z[0]) return;
      const c = P(b.home[0] + BK / 2, b.home[1] + BK / 2, b.home[2]), e = Math.abs(c[0] - p[0]);
      if (e < d) { d = e; best = i; }
    });
    return best;
  }

  const restMark = blocks.length - 2;
  let act = -2;
  function setActive(a) {
    if (a === act) return;
    const now = performance.now();
    act = a;
    blocks.forEach((b, i) => {
      tset(b.t, i === a ? 1 : 0, now, i === a && b.shelf > 0 ? walk : 0);
      b.el.sil.classList.toggle("hi", i === (a < 0 ? restMark : a));
    });
    read.textContent = a < 0 ? "rest" : blocks[a].shelf ? `shelf ${blocks[a].shelf} · slow` : "desk · fast";
    B.wake();
  }

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());
  setActive(-1);
  top.sil.classList.remove("hi");

  return {
    set: (v) => { walk = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "desk-basement",
  means: "The desk is memory: small, close, quick. The shelves are disk: big, far, slow. Point at a block to fetch it to the desk.",
  rules: [1, 4, 5, 6],
  range: [300, 700, 1200],
  tour: [[252, 182], [165, 112], [148, 165], null],
  mount,
});
