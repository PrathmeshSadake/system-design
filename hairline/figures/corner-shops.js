/**
 * Corner shops: a town on three steps. Three corner shops with awnings stand
 * on the front step, a regional warehouse with a pitched roof behind them, and
 * at the top a guard wall, the shield, in front of the main bakery and its
 * chimney. The pointer picks a shop. A hit stays at the shop; a miss climbs
 * one level at a time, each building on the way lifting in turn, until one
 * has the slice, and that one is bright. The slider is the step between levels.
 *
 * The pattern: one of many, staggered by level instead of by row, with a hit
 * test on the shops' rest centres.
 */
const {
  Cam, fit, facing, hull, open, poly, proj, prism, rings, rrect, ringAt, run,
  tdone, tset, tval, tween, disposer, mk, pointer, put, register, solid,
} = HL;

const LIFT = 7;
// how far each shop's ask climbs: shop 1 has it, shop 2 asks the warehouse, shop 3 goes all the way
const CLIMB = [0, 1, 3];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let step = value;
  const C = Cam(45, 0.5, 1.62);
  fit(C, [[-4, -4, -4], [104, 96, -4], [104, -4, -4], [-4, 96, -4], [60, 8, 20 + 34 + 13 + LIFT]], 200, 170);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const slab = (x0, y0, x1, y1, z0, z1, r) => { const [o, i] = rings(x0, y0, x1, y1, r, 1.6); put(solid(g), prism(P, front, o, i, z0, z1)); };

  /** A building: its parts, each a function of its lift that returns [d, class] pairs or a prism. */
  function building(parts) {
    const grp = mk("g", {}, g), els = parts.map((p) => (p.box ? { p, s: solid(grp) } : { p, s: mk("path", { class: p.cls }, grp) }));
    const b = { els, z: tween(0), drawn: NaN, sil: els[0].s.sil };
    b.draw = (dz) => {
      if (dz === b.drawn) return;
      b.drawn = dz;
      for (const { p, s } of els) {
        if (p.box) { const [o, i] = rings(...p.box, p.r || 3, 1.2); put(s, prism(P, front, o, i, p.z0 + dz, p.z1 + dz)); }
        else s.setAttribute("d", p.d(dz));
      }
    };
    return b;
  }
  const onY = (y, ring, dz) => poly(ring.map((q) => P(q.u, y, q.v + dz)));

  // the top step: the bakery, its chimney and the shield in front of it
  slab(14, -4, 86, 30, -4, 20, 6);
  const bakery = building([
    { box: [26, 2, 74, 22], z0: 20, z1: 54, r: 4 },
    { box: [58, 6, 66, 14], z0: 54, z1: 67, r: 2 },
  ]);
  const shield = building([{ box: [20, 24, 80, 28], z0: 20, z1: 38, r: 1.8 }]);
  // the middle step: the regional warehouse, with a pitched roof and a wide door
  slab(4, 30, 96, 60, -4, 10, 4);
  const roof = (dz) => {
    const foot = rrect(10, 34, 90, 57, 2, 3), top = rrect(12, 44.5, 88, 46.5, 1, 3);
    return poly(hull(ringAt(P, foot, 22 + dz).concat(ringAt(P, top, 30 + dz))));
  };
  const warehouse = building([
    { box: [12, 36, 88, 56], z0: 10, z1: 22, r: 3 },
    { cls: "", d: roof },
    { cls: "nf lo", d: (dz) => open(ringAt(P, run(rrect(12, 44.5, 88, 46.5, 1, 3), front), 30 + dz)) },
    { cls: "nf lo", d: (dz) => onY(56, rrect(38, 10, 62, 20, 3, 4), dz) },
  ]);
  // the front step: three corner shops, each with a door under an awning
  slab(-4, 60, 104, 96, -4, 0, 8);
  const shops = [0, 1, 2].map((k) => {
    const x0 = 6 + k * 33, x1 = x0 + 26;
    return building([
      { box: [x0, 66, x1, 86], z0: 0, z1: 18, r: 3 },
      { cls: "nf lo", d: (dz) => onY(86, rrect(x0 + 9, 0, x0 + 17, 10, 2, 3), dz) },
      { cls: "", d: (dz) => poly([P(x0 + 1, 86, 14 + dz), P(x1 - 1, 86, 14 + dz), P(x1 - 1, 92, 10 + dz), P(x0 + 1, 92, 10 + dz)]) },
    ]);
  });
  const levels = [null, warehouse, shield, bakery];
  const all = [bakery, shield, warehouse, ...shops];

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const b of all) { b.draw(tval(b.z, now)); if (!tdone(b.z, now)) moving = true; }
    return moving;
  });
  bag.add(B.unregister);

  // hit: the shops' rest centres, which never move
  const centres = shops.map((_, k) => P(19 + k * 33, 76, 12));
  function hit([x, y]) {
    let best = -1, bd = 40;
    centres.forEach((c, k) => { const d = Math.hypot(c[0] - x, c[1] - y); if (d < bd) { bd = d; best = k; } });
    return best;
  }

  let act = -2;
  function setActive(a) {
    if (a === act) return;
    const now = performance.now();
    act = a;
    const path = a < 0 ? [] : [shops[a], ...levels.slice(1, CLIMB[a] + 1)];
    const lit = a < 0 ? shops[0] : path[path.length - 1];
    for (const b of all) {
      const at = path.indexOf(b);
      tset(b.z, at < 0 ? 0 : LIFT, now, Math.max(at, 0) * step);
      b.sil.classList.toggle("hi", b === lit);
    }
    read.textContent = a < 0 ? "rest" : `shop ${a + 1} · ${CLIMB[a] ? "miss" : "hit"}`;
    B.wake();
  }
  setActive(-1);

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { step = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "corner-shops",
  means: "Corner shops, a warehouse, a guard wall and the main bakery. Point at a shop: if it has no copy, the ask climbs one level at a time.",
  rules: [1, 2, 4, 6],
  range: [30, 60, 90],
  tour: [[130, 180], [168, 199], [206, 218], null],
  mount,
});
