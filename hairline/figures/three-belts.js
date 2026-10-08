/**
 * Three belts: one busy topic split into three conveyor belts side by side on
 * one base. Every note carries its owner's mark in dots: one dot is Mia, two
 * Ava, three Leo, and each owner's notes always ride the same belt, in the
 * order they came. At rest a new note of Ava's hovers over the end of her
 * belt, about to land: the bright mark. The pointer picks a belt; its notes
 * rise in a wave that spreads out from the pointer along the belt, one after
 * another in their order. The slider is the stagger of that wave, in ms.
 */
const {
  Cam, clamp, facing, fit, hull, open, poly, prism, proj, rings, rrect, run, unproj,
  tween, tset, tval, tdone, disposer, flatDot, mk, place, pointer, put, register, solid,
} = HL;

const PITCH = 26, NW = 19, BL = 5 * PITCH + 2, BW = 30, GAP = 13, ZB = 5, ZT = 17, NT = 1.6;
const COUNT = [4, 4, 3], NAMES = ["Mia", "Ava", "Leo"], HOVER = 13, LIFT = 9, HOME = 1;
const V = [0.612, 0.5]; // the direction to the camera, in (x, z)
const by = (k) => k * (BW + GAP);

/** A belt lying along x: a stadium profile in (x, z), carried across y from y0 to y1. */
function belt(P, x0, x1, z0, z1, y0, y1, b) {
  const r = (z1 - z0) / 2, at = (ring, y) => ring.map((q) => P(q.u, y, q.v));
  const prof = rrect(x0, z0, x1, z1, r, 6), inner = rrect(x0 + b, z0 + b, x1 - b, z1 - b, r - b, 6);
  return {
    sil: poly(hull(at(prof, y0).concat(at(prof, y1)))),
    crease: open(at(run(inner, (q) => q.nu * V[0] + q.nv * V[1] > 0), y1)),
  };
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;
  const YE = by(2) + BW;
  const C = Cam(45, 0.5, 1.78);
  fit(C, [[-12, -8, 0], [BL + 8, YE + 8, 0], [BL + 8, -8, 0], [-12, YE + 8, 0], [BL, 0, ZT + HOVER + LIFT]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  const [br, bi] = rings(-12, -8, BL + 8, YE + 8, 8, 2);
  put(solid(g), prism(P, front, br, bi, 0, ZB));

  const notes = [];
  for (let k = 0; k < 3; k++) {
    put(solid(g), belt(P, -6, BL, ZB, ZT, by(k), by(k) + BW, 1.3));
    const n = COUNT[k] + (k === HOME ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const x0 = i * PITCH + 2, y0 = by(k) + 4, [ring, inner] = rings(x0, y0, x0 + NW, y0 + BW - 8, 2.2, 0.8);
      const el = solid(g), dots = [];
      for (let d = 0; d <= k; d++) dots.push(flatDot(el.g, C, 1.1, "dot m"));
      const h0 = i === COUNT[k] ? HOVER : 0;
      notes.push({ k, i, x0, y0, ring, inner, el, dots, h0, z: tween(h0), drawn: NaN });
    }
  }
  const newest = notes.find((n) => n.h0 > 0);

  function draw(n, h) {
    if (h === n.drawn) return;
    n.drawn = h;
    const z = ZT + h + NT, mx = n.x0 + NW / 2, my = n.y0 + (BW - 8) / 2;
    put(n.el, prism(P, front, n.ring, n.inner, ZT + h, z));
    n.dots.forEach((el, d) => place(el, P(mx, my + (d - n.k / 2) * 5, z)));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const n of notes) { draw(n, tval(n.z, now)); if (!tdone(n.z, now)) moving = true; }
    return moving;
  });
  bag.add(B.unregister);

  let act = -2, at = 0;
  /** Picks belt k (-1 for none), with the wave starting from slot a. */
  function setActive(k, a) {
    if (k === act && (k < 0 || a === at)) return;
    const now = performance.now(), from = k >= 0 ? a : at;
    act = k; at = a;
    for (const n of notes) {
      const up = n.k === k ? LIFT : 0;
      tset(n.z, n.h0 + up, now, Math.abs(n.i - from) * stag);
      n.el.sil.classList.toggle("hi", k < 0 ? n === newest : n.k === k);
    }
    read.textContent = k < 0 ? "rest" : `belt ${k} · ${NAMES[k]}`;
    B.wake();
  }

  bag.add(pointer(stage, {
    move: (p) => {
      const [x, y] = unproj(C, p[0], p[1], ZT), k = Math.floor((y + GAP / 2) / (BW + GAP));
      const on = k >= 0 && k < 3 && x > -10 && x < BL + 6;
      // Within one belt the wave's origin is fixed once picked, so a moving pointer does not restart it.
      if (on && k === act) return;
      setActive(on ? k : -1, on ? clamp(Math.round((x - 2 - NW / 2) / PITCH), 0, 4) : at);
    },
    leave: () => setActive(-1, at),
  }));
  bag.add(() => svg.replaceChildren());
  setActive(-1, 0);

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "three-belts",
  means: "One busy belt split into three. Each kid's notes, marked by dots, always ride the same belt, so their order holds. Point at a belt.",
  rules: [1, 2, 5, 10],
  range: [0, 45, 90],
  tour: [[253, 109], [112, 147], [199, 136], null],
  mount,
});
