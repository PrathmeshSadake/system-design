/**
 * Sorting mat: three steps going down toward you. On the top step lies a soft
 * mat (memory) where new blocks land in any order. The middle step holds small
 * trays (level 1 files), the floor holds long trays (level 2 files); a block's
 * height is its key, and every tray is sorted. The pointer's height scrubs
 * time: going down, the mat's four blocks hop down and pack into a new sorted
 * tray (a flush), then the three small trays hop down and merge into one long
 * sorted tray (a compaction). The bright stroke follows the level being
 * written. The slider is the height of the hop.
 */
const {
  Cam, clamp, facing, fit, lerp, prism, proj, rings, spring, stepS,
  disposer, mk, pointer, put, register, solid,
} = HL;

const XN = 92, Y3 = 16, Y2 = 36, YN = 60, Z3 = 34, Z2 = 17, BS = 5.4, PITCH = 6.8;
const MAT = [7, 2, 8, 4], L1 = [[1, 5, 6, 8], [3, 4, 6, 7]], L2 = [1, 2, 2, 3, 4, 5, 5, 6, 7, 7, 8, 8];
const hgt = (k) => 3 + k * 1.15;
const smooth = (t) => t * t * (3 - 2 * t);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let hop = value;
  const C = Cam(45, 0.5, 2.2);
  fit(C, [[0, 0, -4], [XN, 0, -4], [XN, YN, -4], [0, YN, -4], [0, 0, Z3 + 14 + 12]], 200, 166);
  const P = proj(C), front = facing(C), g = mk("g", {}, svg);

  const box = (parent, x0, y0, x1, y1, r, b, z0, z1) => { const s = solid(parent); const [o, i] = rings(x0, y0, x1, y1, r, b); put(s, prism(P, front, o, i, z0, z1)); return s; };
  box(g, 0, 0, XN, YN, 7, 2, -4, 0);
  box(g, 0, 0, XN, Y3, 4, 1.6, 0, Z3);
  const lay3 = mk("g", {}, g);
  box(g, 0, Y3, XN, Y2, 4, 1.6, 0, Z2);
  const lay2 = mk("g", {}, g), lay1 = mk("g", {}, g);
  const layer = (y) => (y < Y3 ? lay3 : y < Y2 ? lay2 : lay1);
  const mat = box(lay3, 14, 2.5, 66, 13.5, 4, 1.4, Z3, Z3 + 1.2);

  // trays: [x0, y-centre, z, slots, grows in phase (0 none, 1 flush, 2 compaction), shrinks in phase]
  const yc1 = (Y3 + Y2) / 2, TR = [
    [4, yc1, Z2, 4, 0, 2], [34, yc1, Z2, 4, 0, 2], [64, yc1, Z2, 4, 1, 2],
    [4, 42, 0, 12, 0, 0], [4, 53, 0, 12, 2, 0],
  ].map(([x0, yc, z, n, grow, shrink]) => ({ x0, yc, z, n, grow, shrink, el: solid(layer(yc)), drawn: NaN }));
  const slot = (t, i) => [t.x0 + 3 + PITCH * i + BS / 2, t.yc, t.z + 1.4];

  // blocks: keyframes at time 0, the flush and the compaction
  const blocks = [];
  const add = (key, a, b, c, ord) => blocks.push({ key, k: [a, b, c], ord, el: solid(lay3), drawn: "" });
  const merged = [...MAT, ...L1[0], ...L1[1]].map((k, i) => [k, i]).sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  const rank = (i) => merged.findIndex((m) => m[1] === i);
  const matSorted = MAT.map((k, i) => [k, i]).sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  MAT.forEach((k, i) => {
    const m = [18 + i * 12 + (i % 2) * 2, 6 + (i % 3) * 1.6, Z3 + 1.2];
    const f = slot(TR[2], matSorted.findIndex((s) => s[1] === i));
    add(k, m, f, slot(TR[4], rank(i)), i);
  });
  L1.forEach((tr, j) => tr.forEach((k, i) => { const p = slot(TR[j], i); add(k, p, p, slot(TR[4], rank(4 + j * 4 + i)), j * 4 + i); }));
  L2.forEach((k, i) => { const p = slot(TR[3], i); add(k, p, p, p, 0); });

  const s = spring(0);
  function pose(b, t) {
    const ph = t <= 0.5 ? 0 : 1, local = clamp((ph ? t - 0.5 : t) * 2 * 1.45 - b.ord * 0.035, 0, 1), e = smooth(local);
    const a = b.k[ph], c = b.k[ph + 1], arc = Math.sin(Math.PI * e) * hop;
    return [lerp(a[0], c[0], e), lerp(a[1], c[1], 1 - (1 - e) * (1 - e)), lerp(a[2], c[2], e * e) + arc];
  }
  function draw(t) {
    let moved = false;
    for (const b of blocks) {
      const [x, y, z] = (b.at = pose(b, t)), key = `${x.toFixed(2)},${y.toFixed(2)},${z.toFixed(2)}`;
      if (key === b.drawn) continue;
      b.drawn = key; moved = true;
      const [o, i] = rings(x - BS / 2, y - BS / 2, x + BS / 2, y + BS / 2, 1.2, 0.6);
      put(b.el, prism(P, front, o, i, z, z + hgt(b.key)));
    }
    // back to front: each block in the layer of the step it is over, in order of x + y
    if (moved) blocks.slice().sort((p, q) => p.at[0] + p.at[1] - q.at[0] - q.at[1]).forEach((b) => layer(b.at[1]).append(b.el.g));
    for (const tr of TR) {
      const gp = tr.grow ? smooth(clamp((t - (tr.grow - 1) * 0.5) * 2, 0, 1)) : 1;
      const sp = tr.shrink ? 1 - smooth(clamp((t - (tr.shrink - 1) * 0.5) * 2 - 0.3, 0, 0.7) / 0.7) : 1, f = gp * sp;
      if (f === tr.drawn) continue;
      tr.drawn = f;
      const len = (tr.n * PITCH + 4) * f;
      if (len < 1) { tr.el.sil.setAttribute("d", ""); tr.el.cr.setAttribute("d", ""); continue; }
      const [o, i] = rings(tr.x0, tr.yc - 4.5, tr.x0 + len, tr.yc + 4.5, 2, 0.9);
      put(tr.el, prism(P, front, o, i, tr.z, tr.z + 1.4));
      tr.el.g.parentNode.prepend(tr.el.g);
    }
  }

  const B = register(stage, (dt) => { const m = stepS(s, dt); draw(clamp(s.x, 0, 1)); return m; });
  bag.add(B.unregister);

  // The pointer's height on the stage is time: the top is now, the bottom is after the compaction.
  const top = P(0, 0, Z3)[1] - 30, bot = P(XN, YN, 0)[1];
  let lit = null;
  function aim(t, k) {
    s.t = t;
    if (k !== lit) {
      lit = k;
      mat.sil.classList.toggle("hi", k <= 0);
      TR[2].el.sil.classList.toggle("hi", k === 1);
      TR[4].el.sil.classList.toggle("hi", k === 2);
    }
    read.textContent = ["rest", "mat · 4 blocks", "level 1 · 3 files", "level 2 · 2 files"][k + 1];
    B.wake();
  }
  aim(0, -1);

  bag.add(pointer(stage, {
    move: (p) => { const t = clamp((p[1] - top) / (bot - top), 0, 1); aim(t, t < 0.3 ? 0 : t < 0.75 ? 1 : 2); },
    leave: () => aim(0, -1),
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { hop = v; blocks.forEach((b) => { b.drawn = ""; }); B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "sorting-mat",
  means: "New blocks land on a small mat, get packed into sorted trays, and small trays merge into long ones. Move the pointer down to watch.",
  rules: [3, 5, 6, 8],
  range: [3, 7, 12],
  tour: [[200, 90], [200, 170], [200, 260], null],
  mount,
});
