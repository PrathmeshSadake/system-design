/**
 * Fig vine: an old bare tree on a patch of soil, its trunk marked into six
 * lengths, one for each feature of the old system. A strangler fig wraps it
 * from the roots up, one ring per length, each ring with a strand of vine
 * twisting across it. The pointer's height says how many features have moved
 * to the new system: the rings grow up to it, or let go back down, staggered
 * out from the pointer. The newest ring is bright. At rest two have moved. The
 * slider is how thick the vine grows.
 */
const {
  Cam, facing, fit, hull, open, poly, prism, proj, ringAt, rrect, run, clamp, seg,
  tween, tset, tval, tdone, mk, pointer, put, register, disposer, solid,
} = HL;

const N = 6, Z0 = 7, BH = 9, RT = 11, RTOP = 8, REST = 2, TOP = Z0 + N * BH;
/** The old trunk's radius at height z: it tapers as it rises. */
const rAt = (z) => RT - ((RT - RTOP) * (z - Z0)) / (TOP - Z0);
const disc = (r, cx = 0, cy = 0, n = 8) => rrect(cx - r, cy - r, cx + r, cy + r, r, n);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let thick = value;
  const C = Cam(45, 0.5, 2.55);
  fit(C, [[-34, -34, -3], [34, 34, -3], [34, -34, -3], [-34, 34, -3], [-9, 5, TOP + 22]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  /** A solid from a foot ring at z0 to a top ring at z1, which may be smaller or set off to one side. */
  const shape = (foot, top, inner, z0, z1) => ({ sil: poly(hull(ringAt(P, foot, z0).concat(ringAt(P, top, z1)))), crease: open(ringAt(P, run(inner, front), z1)) });
  const taper = (parent, foot, top, inner, z0, z1) => { const s = solid(parent); put(s, shape(foot, top, inner, z0, z1)); return s; };

  put(solid(g), prism(P, front, disc(34, 0, 0, 14), disc(32, 0, 0, 14), -3, 0));
  taper(g, disc(17), disc(RT), disc(RT - 1), 0, Z0);
  const trunk = taper(g, disc(RT), disc(RTOP), disc(RTOP - 1), Z0, TOP);
  // the six lengths, scored on the old bark
  for (let k = 1; k < N; k++) mk("path", { d: open(ringAt(P, run(disc(rAt(Z0 + k * BH)), front), Z0 + k * BH)), class: "nf lo" }, g);

  const bands = [];
  for (let k = 0; k < N; k++) {
    const el = solid(g), strand = mk("path", { class: "nf lo" }, g);
    bands.push({ k, el, strand, t: tween(k < REST ? 1 : 0), drawn: NaN });
  }
  // the bare crown: two limbs forking off the top
  taper(g, disc(RTOP - 2.5, 2, -1), disc(2.6, 6, -10), disc(1.8, 6, -10), TOP, TOP + 12);
  taper(g, disc(RTOP - 1), disc(3.6, -10, 5), disc(2.8, -10, 5), TOP, TOP + 20);
  taper(g, disc(RTOP - 2), disc(3, 9, 5), disc(2.2, 9, 5), TOP, TOP + 15);

  function drawBand(b, f) {
    const d = f * thick;
    if (d === b.drawn) return;
    b.drawn = d;
    if (f < 0.02) { b.el.sil.setAttribute("d", ""); b.el.cr.setAttribute("d", ""); b.strand.setAttribute("d", ""); return; }
    const z0 = Z0 + b.k * BH + 0.5, z1 = z0 + BH - 1;
    const r0 = rAt(z0) + d, r1 = rAt(z1) + d;
    put(b.el, shape(disc(r0, 0, 0, 10), disc(r1, 0, 0, 10), disc(r1 - 1.2, 0, 0, 10), z0, z1));
    const a0 = 0.15 + b.k * 0.5, a1 = a0 + 1.1;
    b.strand.setAttribute("d", seg(P(r0 * Math.cos(a0), r0 * Math.sin(a0), z0 + 1), P(r1 * Math.cos(a1), r1 * Math.sin(a1), z1 - 1)));
  }

  const B = register(stage, (_dt, now) => {
    let m = false;
    for (const b of bands) { drawBand(b, tval(b.t, now)); if (!tdone(b.t, now)) m = true; }
    return m;
  });
  bag.add(B.unregister);

  // Hit test on the trunk's axis, which never moves: the pointer's height along it, in lengths.
  const base = P(0, 0, 0), unit = base[1] - P(0, 0, 1)[1];
  function count([sx, sy]) {
    if (Math.abs(sx - base[0]) > 80) return -1;
    const z = (base[1] - sy) / unit;
    if (z < -12 || z > TOP + 26) return -1;
    return clamp(Math.ceil((z - Z0) / BH), 0, N);
  }

  let act = null;
  function choose(n) {
    if (n === act) return;
    const now = performance.now(), want = n < 0 ? REST : n;
    act = n;
    bands.forEach((b) => {
      tset(b.t, b.k < want ? 1 : 0, now, Math.abs(b.k - want) * 45);
      b.el.sil.classList.toggle("hi", b.k === want - 1);
    });
    trunk.sil.classList.toggle("hi", want === 0);
    read.textContent = n < 0 ? "rest" : `${n} of ${N} moved`;
    B.wake();
  }
  choose(-1);

  bag.add(pointer(stage, { move: (p) => choose(count(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { thick = v; bands.forEach((b) => { b.drawn = NaN; }); B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "fig-vine",
  means: "A new vine wraps the old tree one ring at a time, one ring per feature moved. Raise the pointer to move more, lower it to give some back.",
  rules: [1, 2, 5, 9],
  range: [2, 3.5, 5],
  tour: [[200, 195], [200, 142], [200, 89], null],
  mount,
});
