/**
 * Permission slips: a round board with a tall coordinator pole at the back
 * and three shorter participant poles in front, each flying a flag. A flag at
 * the top of its pole is a yes; all up means the trip goes, commit. The
 * pointer on a participant turns its vote to no: its flag drops first, then the
 * coordinator's, then everyone else's, staggered outwards through the
 * coordinator, because one no aborts all. The slider is the stagger, in ms.
 */
const {
  Cam, facing, fit, fillet, hull, poly, prism, proj, rings, rrect, solid, put, mk,
  tween, tset, tval, tdone, register, pointer, disposer,
} = HL;

const RB = 58, ZB = 5, FW = 17, FH = 11;
// the coordinator first, then the participants; [x, y, pole height, foot radius]
const POSTS = [[-20, -20, 64, 9], [36, -10, 44, 6.5], [12, 32, 44, 6.5], [-22, 32, 44, 6.5]];
const PAINT = [0, 3, 1, 2];
const PENNANT = fillet([[0, 0], [FW, 0], [FW - 4, FH / 2], [FW, FH], [0, FH]], [0.6, 1, 0.8, 1, 0.6]);

function inside([x, y], pl) {
  let c = false;
  for (let i = 0, j = pl.length - 1; i < pl.length; j = i++) {
    const [xi, yi] = pl[i], [xj, yj] = pl[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;
  const C = Cam(45, 0.5, 1.78);
  fit(C, [[-RB, -RB, 0], [RB, RB, 0], [RB, -RB, 0], [-RB, RB, 0], [-20, -20, ZB + 64 + 3]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const disc = (s, x, y, r, z0, z1, b = 1, n = 6) => {
    put(s, prism(P, front, rrect(x - r, y - r, x + r, y + r, r, n), rrect(x - r + b, y - r + b, x + r - b, y + r - b, r - b, n), z0, z1));
    return s;
  };

  disc(solid(g), 0, 0, RB, 0, ZB, 2, 14);
  const posts = POSTS.map(([x, y, h, fr], k) => ({ k, x, y, h, fr, v: tween(1), drawn: NaN }));
  for (const i of PAINT) {
    const p = posts[i];
    disc(solid(g), p.x, p.y, p.fr, ZB, ZB + (i ? 3 : 5), 1, 4);
    p.zf = ZB + (i ? 3 : 5);
    p.pole = solid(g);
    const [ring, inner] = rings(p.x - 1.5, p.y - 1.5, p.x + 1.5, p.y + 1.5, 1.5, 0.6);
    put(p.pole, prism(P, front, ring, inner, p.zf, p.zf + p.h));
    p.knob = disc(solid(g), p.x, p.y, 2.6, p.zf + p.h, p.zf + p.h + 2.6, 0.8, 4);
    p.flag = mk("path", { class: "sil" }, g);
    p.hull = hull([P(p.x - p.fr, p.y - p.fr, 0), P(p.x + p.fr, p.y + p.fr, 0), P(p.x + p.fr, p.y - p.fr, 0), P(p.x - p.fr, p.y + p.fr, 0),
      P(p.x, p.y, p.zf + p.h + 3), P(p.x + FW + 2, p.y, p.zf + p.h + 2), P(p.x + FW + 2, p.y, p.zf + p.h - FH - 3)]);
  }

  /** The flag rides its pole: v 1 at the top, 0 lowered near the foot. */
  function drawFlag(p, now) {
    const v = tval(p.v, now);
    if (v === p.drawn) return;
    p.drawn = v;
    const top = p.zf + 6 + FH + (p.h - 8 - FH) * v;
    p.flag.setAttribute("d", poly(PENNANT.map(([u, w]) => P(p.x + 1.6 + u, p.y, top - FH + w))));
  }
  const B = register(stage, (_dt, now) => {
    let m = false;
    for (const p of posts) { drawFlag(p, now); if (!tdone(p.v, now)) m = true; }
    return m;
  });
  bag.add(B.unregister);

  let act = -2;
  function choose(k) {
    if (k === act) return;
    act = k;
    const now = performance.now(), no = k > 0;
    // a no travels: the voter's flag first, then the coordinator's, then the others
    posts.forEach((p, i) => tset(p.v, no ? 0 : 1, now, !no ? 0 : i === k ? 0 : i === 0 ? stag : 2 * stag));
    posts.forEach((p, i) => {
      const lit = k < 0 ? i === 0 : no ? i === k : i === 0;
      p.pole.sil.classList.toggle("hi", lit);
      p.knob.sil.classList.toggle("hi", lit);
      p.flag.classList.toggle("hi", lit);
    });
    read.textContent = k < 0 ? "rest" : no ? "1 no · abort" : "3 yes · commit";
    B.wake();
  }
  choose(-1);

  bag.add(pointer(stage, {
    move: (pt) => {
      let best = -1, d = Infinity;
      posts.forEach((p, i) => {
        const dx = Math.abs(P(p.x, p.y, 0)[0] - pt[0]);
        if (inside(pt, p.hull) && dx < d) { d = dx; best = i; }
      });
      choose(best);
    },
    leave: () => choose(-1),
  }));
  bag.add(() => svg.replaceChildren());

  return { set: (v) => { stag = v; }, destroy: bag.dispose };
}

hairline({
  name: "permission-slips",
  means: "A trip leaves only if every flag is up. Point at one helper to make it vote no: its flag drops, and then every flag drops too.",
  rules: [1, 2, 4, 5],
  range: [0, 70, 140],
  tour: [[270, 160], [200, 240], [160, 100], null],
  mount,
});
