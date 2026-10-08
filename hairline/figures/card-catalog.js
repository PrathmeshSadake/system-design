/**
 * Card catalog: two open drawers of index cards, kids on the left, lunches on
 * the right. A kid's tab carries its own number in dots; a lunch's tab carries
 * the number of the kid who ordered it. The pointer picks a card: that kid's
 * card stands up bright, and every lunch card with the same dots stands up with
 * it, staggered by distance from the pick. That is a join by id. At rest kid 3
 * and its two lunches are half pulled. The slider is the stagger, in ms.
 */
const {
  Cam, facing, fillet, fit, hull, open, poly, proj, rad, ringAt, rrect, run, seg,
  tdone, tset, tval, tween, disposer, mk, place, pointer, register,
} = HL;

const W = 40, H = 30, TW = 14, TH = 6, TK = 1.4, G = 11, WH = 14, LIFT = 15, HALF = 6, REST = -11;
const DRAWERS = [{ ox: 0, oy: 60, ids: [1, 2, 3, 4] }, { ox: 62, oy: 0, ids: [1, 3, 2, 3, 4, 1] }];
const START = 3;

/** A run of points ordered left to right on screen. */
const LR = (pts) => (pts[0][0] <= pts[pts.length - 1][0] ? pts : pts.slice().reverse());

/** An open drawer: its far half now, a group for the cards, then its near wall with a label frame and a pull. */
function drawer(P, front, d, n, g) {
  const x0 = d.ox - 5, y0 = d.oy - 9, x1 = d.ox + W + 5, y1 = d.oy + (n - 1) * G + 9, T = 2.2;
  const outer = rrect(x0, y0, x1, y1, 5, 6), inner = rrect(x0 + T, y0 + T, x1 - T, y1 - T, 5 - T, 6);
  mk("path", { d: poly(hull(ringAt(P, outer, 0).concat(ringAt(P, outer, WH)))), class: "sil" }, g);
  mk("path", { d: poly(ringAt(P, inner, WH)), class: "nf" }, g);
  mk("path", { d: open(ringAt(P, run(inner, (q) => !front(q)), 2)), class: "nf lo" }, g);
  const cards = mk("g", {}, g);
  const iF = LR(ringAt(P, run(inner, front), WH)), oT = LR(ringAt(P, run(outer, front), WH)), oB = LR(ringAt(P, run(outer, front), 0));
  const near = [
    [poly([...iF, oT[oT.length - 1], ...oB.slice().reverse(), oT[0]]), "fo"],
    [open(oT), "nf lo"], [open(iF), "nf"], [open([oT[0], ...oB, oT[oT.length - 1]]), "nf sil"],
  ];
  const hx = (x0 + x1) / 2, on = (r) => poly(r.map((q) => P(q.u, y1, q.v)));
  near.push([on(rrect(hx - 9, 7.5, hx + 9, 12, 1.4, 4)), "nf lo"], [on(rrect(hx - 5, 2.5, hx + 5, 5.5, 1.5, 4)), "nf"]);
  for (const [dd, cls] of near) mk("path", { d: dd, class: cls }, g);
  return cards;
}

/** A card's filleted outline with its tab at t0, upright in its own plane. */
const shape = (t0) => fillet(
  [[0, 0], [W, 0], [W, H], [t0 + TW, H], [t0 + TW, H + TH], [t0, H + TH], [t0, H], [0, H]],
  [1, 1, 3, 1.6, 2.2, 2.2, 1.6, 3],
);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;
  const C = Cam(45, 0.5, 2.08);
  const [a, b] = DRAWERS, top = H + TH + LIFT;
  fit(C, [[a.ox - 5, a.oy + 42, 0], [b.ox + W + 5, b.oy - 9, 0], [b.ox + W + 5, b.oy + 64, 0], [a.ox - 5, a.oy - 9, top], [b.ox + W, b.oy - 9, top]], 200, 170);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg), cards = [];

  DRAWERS.forEach((d) => {
    const layer = drawer(P, front, d, d.ids.length, g);
    d.ids.forEach((id, i) => {
      const t0 = [4, 22, 13][i % 3], grp = mk("g", {}, layer);
      const back = mk("path", { class: "lo" }, grp), face = mk("path", { class: "sil" }, grp);
      const lines = mk("path", { class: "nf lo" }, grp), dots = [];
      for (let k = 0; k < id; k++) dots.push(mk("circle", { r: 1.1, class: "dot off" }, grp));
      const lean = REST + ((i * 7) % 5) - 2;
      cards.push({ d, i, id, t0, sh: shape(t0), back, face, lines, dots, lean, a: tween(lean), z: tween(0), kid: d === a });
    });
  });

  function draw(c, th, lift) {
    const yb = c.d.oy + c.i * G, s = Math.sin(rad(th)), co = Math.cos(rad(th));
    const w = (u, v) => P(c.d.ox + u, yb + v * s, v * co + lift);
    const wb = (u, v) => P(c.d.ox + u, yb + v * s - TK * co, v * co + TK * s + lift);
    c.back.setAttribute("d", poly(c.sh.map((p) => wb(p[0], p[1]))));
    c.face.setAttribute("d", poly(c.sh.map((p) => w(p[0], p[1]))));
    c.lines.setAttribute("d", seg(w(5, H - 8), w(W - 5, H - 8)) + seg(w(5, H - 15), w(W - 12, H - 15)));
    c.dots.forEach((el, k) => place(el, w(c.t0 + TW / 2 + (k - (c.id - 1) / 2) * 3, H + TH / 2)));
  }

  // Hit lines: each card's top edge in its rest pose. They never move.
  const restTop = (c) => {
    const yb = c.d.oy + c.i * G, s = Math.sin(rad(c.lean)), co = Math.cos(rad(c.lean));
    return [P(c.d.ox, yb + H * s, H * co), P(c.d.ox + W, yb + H * s, H * co)];
  };
  const tops = cards.map(restTop);
  const mid = tops.map(([p, q]) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]);
  function hit([x, y]) {
    let best = -1, bd = 22;
    tops.forEach(([p, q], k) => {
      const dx = q[0] - p[0], dy = q[1] - p[1], t = Math.max(0, Math.min(1, ((x - p[0]) * dx + (y - p[1]) * dy) / (dx * dx + dy * dy)));
      const e = Math.hypot(x - p[0] - t * dx, y - p[1] - t * dy) + (y > p[1] + t * dy ? 0 : 6);
      if (e < bd) { bd = e; best = k; }
    });
    return best;
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const c of cards) { draw(c, tval(c.a, now), tval(c.z, now)); if (!tdone(c.a, now) || !tdone(c.z, now)) moving = true; }
    return moving;
  });
  bag.add(B.unregister);

  let act = null;
  /** Picks card k (-1 for rest): its kid and that kid's lunches stand up, spreading out from the card picked. */
  function choose(k) {
    const key = k < 0 ? "rest" : String(cards[k].id);
    if (key === act) return;
    act = key;
    const now = performance.now(), id = k < 0 ? START : cards[k].id, from = k < 0 ? mid[2] : mid[k];
    let n = 0;
    cards.forEach((c, j) => {
      const on = c.id === id, delay = (Math.hypot(mid[j][0] - from[0], mid[j][1] - from[1]) / 16) * stag;
      if (on && !c.kid) n++;
      tset(c.a, on && k >= 0 ? 0 : c.lean, now, delay);
      tset(c.z, on ? (k < 0 ? HALF : LIFT) : 0, now, delay);
      c.face.classList.toggle("hi", on && c.kid);
      c.dots.forEach((el) => el.setAttribute("class", on ? (c.kid ? "dot" : "dot m") : "dot off"));
    });
    read.textContent = k < 0 ? "rest" : `kid ${id} · ${n} lunch${n === 1 ? "" : "es"}`;
    B.wake();
  }
  choose(-1);

  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "card-catalog",
  means: "Two drawers of cards, kids and lunches. Point at a card and every card with the same kid number stands up: tables joined by an id.",
  rules: [1, 2, 4, 10],
  range: [0, 40, 90],
  tour: [[111, 156], [258, 172], [330, 143], null],
  mount,
});
