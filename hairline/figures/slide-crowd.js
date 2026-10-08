/**
 * Slide crowd: a playground slide, with a ladder up to its deck and a chute
 * down, and eight kids coming back to it. The ground between them and the
 * ladder is time. At rest they all waited the same plain backoff, so they
 * arrive in one bunch, a thundering herd, and the chute is the bright mark.
 * Moving the pointer from the herd towards the ladder adds jitter: each kid
 * keeps its own random wait, so they arrive one by one. The earliest kid
 * takes the bright. The slider is the backoff, the length of the line.
 */
const {
  Cam, clamp, facing, fit, lerp, open, poly, prism, proj, rings, seg, spring, stepS, unproj,
  disposer, mk, pointer, put, register, solid,
} = HL;

const N = 8, DECK = 40, LX = 19, Q0 = 30, REST = 0.06, SC = 1.95, RMAX = 120;
const GAPS = [0, 0.13, 0.28, 0.37, 0.53, 0.67, 0.79, 1]; // each kid's own random place in the line
const TALL = [12, 10.5, 13, 11, 12.5, 10, 11.5, 13];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let R = value;
  const C = Cam(45, 0.5, SC);
  fit(C, [[0, 0, 0], [0, 76, 0], [Q0 + RMAX + 4, 0, 0], [Q0 + RMAX + 4, 12, 0], [0, 0, DECK + 14], [Q0 + RMAX, 7, 22]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const block = (x0, y0, x1, y1, z0, z1, r, b) => { const [ri, ii] = rings(x0, y0, x1, y1, r, b); put(solid(g), prism(P, front, ri, ii, z0, z1)); };

  // The slide, far to near: back legs, deck, ladder rails and rungs, then the chute.
  block(0, 0, 3, 3, 0, DECK, 1.2, 0.5);
  block(0, 13, 3, 16, 0, DECK, 1.2, 0.5);
  block(0, 0, LX - 2, 16, DECK, DECK + 3, 2, 0.9);
  block(LX - 3, 0, LX, 3, 0, DECK + 10, 1.2, 0.5);
  mk("path", { class: "nf", d: [6, 13, 20, 27, 34, 41].map((z) => seg(P(LX - 1.5, 3, z), P(LX - 1.5, 13, z))).join("") }, g);
  block(LX - 3, 13, LX, 16, 0, DECK + 10, 1.2, 0.5);
  const chute = (y) => (y < 66 ? DECK + 2 - ((y - 16) / 50) * (DECK - 2) : 4);
  const edge = (x, dz) => [16, 26, 36, 46, 56, 66, 76].map((y) => P(x, y, chute(y) + dz));
  const L = edge(2, 0), Rt = edge(16, 0), Lt = edge(2, 4), Rtt = edge(16, 4);
  mk("path", { class: "lo", d: poly([...edge(2, -2), ...edge(16, -2).reverse()]) }, g);
  const slide = mk("path", { class: "sil", d: poly([...Lt, ...Rtt.reverse()]) }, g);
  mk("path", { class: "nf lo", d: open(L) + open(Rt) }, g);

  // The kids: a body and a round head each.
  const kids = [];
  for (let i = 0; i < N; i++) {
    const grp = mk("g", {}, g), body = solid(grp), head = mk("path", { class: "sil" }, grp);
    kids.push({ i, grp, body, head, h: TALL[i], key: NaN });
  }
  const sp = spring(REST, { eps: 0.002 });
  let drawn = NaN, lit = -2, px = NaN;

  function draw(s) {
    if (s === drawn) return;
    drawn = s;
    for (const k of kids) {
      // Bunched where the plain wait ends; spread between now and then by each kid's own random wait.
      const bx = Q0 + R - 30 + (k.i % 4) * 8.5, by = -1 + Math.floor(k.i / 4) * 9 + (k.i % 2) * 2.5;
      const x = lerp(bx, Q0 + 4 + GAPS[k.i] * (R - 4), s), y = lerp(by, 7 + ((k.i * 5) % 3 - 1) * 5, s);
      k.key = x + y;
      const [ri, ii] = rings(x - 3.6, y - 3.6, x + 3.6, y + 3.6, 3.6, 1.1);
      put(k.body, prism(P, front, ri, ii, 0, k.h));
      const c = P(x, y, k.h + 4.6), r = 4.2 * SC, pts = [];
      for (let a = 0; a < 20; a++) pts.push([c[0] + r * Math.cos((a / 20) * 2 * Math.PI), c[1] + r * Math.sin((a / 20) * 2 * Math.PI)]);
      k.head.setAttribute("d", poly(pts));
    }
    // Far to near, every frame they move: a kid passing another goes behind or in front of it.
    kids.slice().sort((a, b) => a.key - b.key).forEach((k) => g.append(k.grp));
  }
  function light(i) {
    if (i === lit) return;
    lit = i;
    for (const k of kids) { k.body.sil.classList.toggle("hi", k.i === i); k.head.classList.toggle("hi", k.i === i); }
    slide.classList.toggle("hi", i < 0);
  }
  light(-1);

  const B = register(stage, (dt) => { const m = stepS(sp, dt); draw(sp.x); return m; });
  bag.add(B.unregister);

  function aim(p) {
    if (!p) { sp.t = REST; px = NaN; light(-1); read.textContent = "rest"; B.wake(); return; }
    // The spread is read off the ground, which never moves, never off the kids.
    const [x, y] = unproj(C, p[0], p[1], 0);
    if (y < -40 || y > 50 || x < LX) return aim(null);
    px = x;
    sp.t = clamp((Q0 + R - x) / (0.85 * R), 0, 1);
    light(0);
    read.textContent = `spread ${Math.round(sp.t * 100)}%`;
    B.wake();
  }
  bag.add(pointer(stage, { move: aim, leave: () => aim(null) }));
  bag.add(() => svg.replaceChildren());
  read.textContent = "rest";

  return {
    set: (v) => { R = v; drawn = NaN; if (px === px) sp.t = clamp((Q0 + R - px) / (0.85 * R), 0, 1); B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "slide-crowd",
  means: "Kids who all wait the same time jam the slide. Move the pointer toward the ladder to add jitter: random waits, so they come one by one.",
  rules: [3, 5, 8, 10],
  range: [70, 95, 120],
  tour: [[274, 228], [240, 211], [200, 192], null],
  mount,
});
