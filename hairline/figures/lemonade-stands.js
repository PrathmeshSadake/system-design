/**
 * Lemonade stands: three stands in a row, each a counter under an awning with
 * a jug on it, a level line on the jug's front. On a normal day each jug is
 * two thirds full. The pointer brings the rain cloud over one stand: its jug
 * runs dry, and the other two fill up to carry its
 * share, spreading out from it. The cloud is the one bright mark. The slider
 * is how busy each stand is on a normal day; past two thirds, the two left
 * spill over.
 */
const {
  Cam, clamp, facing, fit, open, poly, proj, prism, rings, rrect, ringAt, run, unproj,
  tween, tset, tval, tdone, mk, place, pointer, put, register, disposer, solid,
} = HL;

const STANDS = [[0, 0], [68, 0], [136, 0]];
const W = 36, D = 22, CT = 16, JR = 9, JH = 26, TOP = 58;
const CLOUD0 = [120, -62];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let load = value / 100;
  const C = Cam(45, 0.5, 1.6);
  fit(C, [[-14, -14, 0], [186, 36, 0], [186, -14, 0], [-14, 36, 0], [0, 0, TOP + 6], [120, -62, 82], [0, 10, 82]], 200, 166);
  const P = proj(C), front = facing(C), SC = Math.abs(P(1, -1, 0)[0] - P(0, 0, 0)[0]) / Math.SQRT2;

  const g = mk("g", {}, svg);
  const [gr, gi] = rings(-14, -14, 186, 36, 12, 2);
  put(solid(g), prism(P, front, gr, gi, -4, 0));

  const jx = (s) => s.x + W / 2, jy = (s) => s.y + 12;
  const ring0 = rrect(-JR, -JR, JR, JR, JR, 10), liq0 = rrect(-JR + 1.4, -JR + 1.4, JR - 1.4, JR - 1.4, JR - 1.4, 10);
  const at = (ring, x, y) => ring.map((q) => ({ ...q, u: q.u + x, v: q.v + y }));
  const stands = STANDS.map(([x, y], i) => {
    const grp = mk("g", {}, g), s = { i, x, y, grp, lvl: tween(load), drawn: NaN };
    // two posts at the back, the counter, the lemonade, the glass jug and its handle, then the canopy over it all
    mk("path", { d: [x + 3, x + W - 3].map((px) => open([P(px, y + 3, CT), P(px, y + 3, TOP - 3)])).join(""), class: "nf" }, grp);
    const [cr, ci] = rings(x, y, x + W, y + D, 3, 1.2);
    put(solid(grp), prism(P, front, cr, ci, 0, CT));
    s.liq = solid(grp);
    s.ring = at(ring0, jx(s), jy(s)); s.liqRing = at(liq0, jx(s), jy(s));
    const jug = prism(P, front, s.ring, s.ring, CT, CT + JH), glass = solid(grp);
    put(glass, { sil: jug.sil, crease: poly(ringAt(P, s.ring, CT + JH)) });
    glass.sil.classList.add("nf", "lo"); glass.sil.classList.remove("sil");
    const h = P(jx(s) + JR, jy(s), CT + JH * 0.7), r = 5.5 * SC;
    mk("path", { d: open(Array.from({ length: 9 }, (_, j) => [h[0] + r * 0.8 * Math.sin((j / 8) * Math.PI), h[1] - r + (2 * r * j) / 8])), class: "nf" }, grp);
    s.spill = [0, 1, 2].map(() => mk("circle", { r: 1.5, class: "dot m off" }, grp));
    const FY = y + D - 4, cz = (yy) => TOP + 4 - ((yy - (y - 3)) / (FY - y + 3)) * 8;
    mk("path", { d: poly([[x - 4, y - 3], [x + W + 4, y - 3], [x + W + 4, FY], [x - 4, FY]].map(([u, v]) => P(u, v, cz(v)))) }, grp);
    mk("path", { d: open([P(x - 4, FY, cz(FY) - 2.4), P(x + W + 4, FY, cz(FY) - 2.4)]), class: "nf lo" }, grp);
    // the awning's stripes, running from the back to the front
    mk("path", { d: [1, 2, 3, 4, 5].map((k) => open([P(x - 4 + k * (W + 8) / 6, y - 3, cz(y - 3)), P(x - 4 + k * (W + 8) / 6, FY, cz(FY))])).join(""), class: "nf lo" }, grp);
    return s;
  });

  /** One stand's lemonade at lv, a share of the jug; past the brim it runs down the front. */
  function drawStand(s, lv) {
    if (lv === s.drawn) return;
    s.drawn = lv;
    const top = CT + 1 + (JH - 1.5) * clamp(lv, 0, 1);
    if (lv < 0.03) { s.liq.sil.setAttribute("d", ""); s.liq.cr.setAttribute("d", ""); }
    else put(s.liq, { sil: prism(P, front, s.liqRing, s.liqRing, CT + 0.6, top).sil, crease: poly(ringAt(P, s.liqRing, top)) });
    s.spill.forEach((el, j) => { place(el, P(jx(s) - 2 + j * 2, jy(s) + JR + 0.4, CT + JH - 4 - j * 7)); el.classList.toggle("off", lv <= 1.02); });
  }

  // the rain cloud: three puffs over a flat base, and its drops, hidden in it until it stands over a stand
  const cloud = mk("g", {}, g), drops = [0, 1, 2, 3].map(() => mk("circle", { r: 1.5, class: "dot" }, cloud));
  const puffs = [0, 1, 2].map(() => mk("path", { class: "sil hi" }, cloud)), base = solid(cloud);
  base.sil.classList.add("hi");
  const cx = tween(CLOUD0[0]), cy = tween(CLOUD0[1]);
  let cDrawn = "";
  function drawCloud(x, y, rain) {
    const k = x.toFixed(2) + y.toFixed(2) + rain;
    if (k === cDrawn) return;
    cDrawn = k;
    const Z = 74, [br, bi] = rings(x - 16, y - 10, x + 16, y + 10, 10, 2);
    put(base, prism(P, front, br, bi, Z, Z + 5));
    [[-6, -4, 7], [3, 2, 9], [10, -2, 6]].forEach(([dx, dy, r], j) => {
      const o = P(x + dx, y + dy, Z + 5 + r * 0.4), R = r * SC;
      puffs[j].setAttribute("d", poly(Array.from({ length: 18 }, (_, n) => [o[0] + R * Math.cos(n * 0.349), o[1] + R * Math.sin(n * 0.349)])));
    });
    drops.forEach((el, j) => place(el, P(x - 9 + j * 6, y + 2 - (j % 2) * 5, rain ? Z - 8 - (j % 2) * 7 : Z + 3)));
  }

  let act = -1;
  const B = register(stage, (_dt, now) => {
    stands.forEach((s) => drawStand(s, tval(s.lvl, now)));
    drawCloud(tval(cx, now), tval(cy, now), act >= 0 && tdone(cx, now));
    return stands.some((s) => !tdone(s.lvl, now)) || !tdone(cx, now) || !tdone(cy, now);
  });
  bag.add(B.unregister);

  function choose(a, force) {
    if (a === act && !force) return;
    act = a;
    const now = performance.now(), share = a < 0 ? load : (load * 3) / 2;
    stands.forEach((s) => {
      const delay = a < 0 ? 0 : Math.abs(s.i - a) * 60;
      tset(s.lvl, s.i === a ? 0 : share, now, delay);
    });
    tset(cx, a < 0 ? CLOUD0[0] : jx(stands[a]), now, 0); tset(cy, a < 0 ? CLOUD0[1] : jy(stands[a]), now, 0);
    read.textContent = a < 0 ? "rest" : `2 open · ${Math.round(share * 100)}%`;
    B.wake();
  }

  /** The stand nearest the pointer, read on the plane of the counter tops, which never move. */
  function hit(p) {
    const [x, y] = unproj(C, p[0], p[1], CT);
    let best = -1, bd = 30;
    stands.forEach((s) => { const d = Math.hypot(jx(s) - x, jy(s) - y); if (d < bd) { bd = d; best = s.i; } });
    return best;
  }

  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { load = v / 100; choose(act, true); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "lemonade-stands",
  means: "Three lemonade stands, each jug two thirds full. Point at one to rain it out: the other two fill to the top to serve its customers.",
  rules: [1, 2, 4, 5],
  range: [50, 66.667, 80],
  tour: [[122, 152], [276, 229], [199, 190], null],
  mount,
});
