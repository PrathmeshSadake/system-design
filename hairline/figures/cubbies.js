/**
 * Cubbies: a wall of six follower cubbies, and beside it one post, a card on
 * a stand. Over the post the pointer is posting with push: a copy slips into
 * every cubby at once, the nearest first. Over a cubby it is reading with
 * pull: nothing was copied, so only that cubby gets the post, fetched when it
 * is read. At rest the post is the bright mark and the cubbies wait empty.
 * The slider is the stagger of the copies, in ms.
 */
const {
  Cam, facing, fit, hull, poly, prism, proj, ringAt, rings, rrect, seg,
  tween, tset, tval, tdone, disposer, mk, pointer, put, register, solid,
} = HL;

const CW = 96, CD = 24, CH = 66, D = 15, COLS = 3, ROWS = 2, OW = 24, OG = 30, OZ = 6;
const PX0 = 120, PX1 = 144, PY = 13, PZ = 9, PH = 30, CARD = 18, SC = 2.05, LIFT = 9;
const box = (c, r) => [6 + c * OG, OZ + (ROWS - 1 - r) * OG]; // r 0 is the top row

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;
  const C = Cam(45, 0.5, SC);
  fit(C, [[0, 0, 0], [CW, CD, 0], [0, CD, 0], [PX1 + 2, PY + 10, 0], [0, 0, CH], [CW, 0, CH], [PX0, PY, PZ + PH + LIFT]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const plate = (x0, x1, y, z0, z1, r) => poly(rrect(x0, z0, x1, z1, r, 3).map((q) => P(q.u, y, q.v)));

  // Inside each cubby first: its back wall and corner lines, then the copy.
  // The cabinet comes after, filled everywhere but its openings, so it covers
  // whatever lies outside them.
  const cubbies = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const [x0, z0] = box(c, r), x1 = x0 + OW, z1 = z0 + OW;
    mk("path", { class: "nf lo", d: plate(x0, x1, CD - D, z0, z1, 1.5) + [[x0, z0], [x0, z1], [x1, z0]].map(([x, z]) => seg(P(x, CD, z), P(x, CD - D, z))).join("") }, g);
    const grp = mk("g", {}, g);
    cubbies.push({ c, r, x0, z0, back: mk("path", { class: "lo" }, grp), face: mk("path", { class: "sil" }, grp), lines: mk("path", { class: "nf lo" }, grp), s: tween(0), drawn: NaN });
  }
  // Each opening winds against the outline, so the fill leaves it open.
  const area = (pts) => pts.reduce((a, p, i) => { const q = pts[(i + 1) % pts.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0);
  const [cr, ci] = rings(0, 0, CW, CD, 4, 1.4), cab = prism(P, front, cr, ci, 0, CH);
  const outline = hull(ringAt(P, cr, 0).concat(ringAt(P, cr, CH)));
  const holes = cubbies.map((k) => {
    const h = rrect(k.x0, k.z0, k.x0 + OW, k.z0 + OW, 2.5, 3).map((q) => P(q.u, CD, q.v));
    return Math.sign(area(h)) === Math.sign(area(outline)) ? h.reverse() : h;
  });
  mk("path", { class: "fo", d: poly(outline) + holes.map(poly).join("") }, g);
  const shell = solid(g);
  put(shell, cab);
  shell.sil.classList.add("nf");
  for (const h of holes) mk("path", { class: "nf", d: poly(h) }, g);

  // The post: a card on a stand.
  const [sr, si] = rings(PX0, PY - 9, PX1, PY + 9, 3, 1.2);
  put(solid(g), prism(P, front, sr, si, 0, PZ));
  // The card lifts off its stand while it is being sent out.
  const pb = mk("path", { class: "lo" }, g), post = mk("path", { class: "sil" }, g), pl = mk("path", { class: "nf lo" }, g);
  const pz = tween(0);
  let pDrawn = NaN;
  function drawPost(h) {
    if (h === pDrawn) return;
    pDrawn = h;
    const z = PZ + h;
    pb.setAttribute("d", plate(PX0 + 2, PX1 - 2, PY - 1.3, z, z + PH, 2));
    post.setAttribute("d", plate(PX0 + 2, PX1 - 2, PY, z, z + PH, 2));
    pl.setAttribute("d", [8, 13, 18, 23].map((k) => seg(P(PX0 + 6, PY, z + k), P(PX1 - 6, PY, z + k))).join(""));
  }
  const postHit = P((PX0 + PX1) / 2, PY, PZ + PH / 2);

  function draw(k, s) {
    if (s === k.drawn) return;
    k.drawn = s;
    const h = CARD * s, x0 = k.x0 + 3, x1 = k.x0 + OW - 3, y = CD - 4;
    k.face.setAttribute("d", h < 1 ? "" : plate(x0, x1, y, k.z0, k.z0 + h, Math.min(1.5, h / 2)));
    k.back.setAttribute("d", h < 1 ? "" : plate(x0, x1, y - 1.2, k.z0, k.z0 + h, Math.min(1.5, h / 2)));
    k.lines.setAttribute("d", [5, 9, 13].filter((z) => z < h - 3).map((z) => seg(P(x0 + 4, y, k.z0 + h - z), P(x1 - 4, y, k.z0 + h - z))).join(""));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const k of cubbies) { draw(k, tval(k.s, now)); if (!tdone(k.s, now)) moving = true; }
    drawPost(tval(pz, now));
    if (!tdone(pz, now)) moving = true;
    return moving;
  });
  bag.add(B.unregister);

  let act = -2;
  /** a: -1 rest, 0 to 5 pull into that cubby, 6 push from the post. */
  function setActive(a) {
    if (a === act) return;
    const now = performance.now();
    act = a;
    const from = a >= 0 && a < 6 ? cubbies[a] : { c: COLS, r: 0.5 };
    for (const [i, k] of cubbies.entries()) {
      const on = a === 6 || a === i;
      tset(k.s, on ? 1 : 0, now, Math.hypot(k.c - from.c, k.r - from.r) * stag);
      k.face.classList.toggle("hi", a === i);
    }
    post.classList.toggle("hi", a < 0 || a === 6);
    tset(pz, a === 6 ? LIFT : 0, now, 0);
    read.textContent = a < 0 ? "rest" : a === 6 ? "push · 6 copies" : `pull · cubby ${a + 1}`;
    B.wake();
  }

  const hits = cubbies.map((k) => P(k.x0 + OW / 2, CD, k.z0 + OW / 2));
  bag.add(pointer(stage, {
    move: (q) => {
      // Picked by resting centres: the openings and the post never move.
      const d2 = (p) => (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2;
      let best = d2(postHit) < 30 * 30 ? 6 : -1, bd = 24 * 24;
      hits.forEach((p, i) => { if (d2(p) < bd) { bd = d2(p); best = i; } });
      setActive(best);
    },
    leave: () => setActive(-1),
  }));
  bag.add(() => svg.replaceChildren());
  setActive(-1);

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "cubbies",
  means: "One post and a wall of cubbies. Point at the post to push a copy into every cubby; point at a cubby to pull it only when read.",
  rules: [1, 2, 6, 10],
  range: [0, 50, 100],
  tour: [[301, 226], [120, 109], [207, 205], null],
  mount,
});
