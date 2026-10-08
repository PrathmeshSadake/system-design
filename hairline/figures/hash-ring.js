/**
 * Hash ring: a round dial like a clock face, with four server posts standing on
 * its ring and sixteen key beads around it. Each bead belongs to the first
 * post found walking clockwise. A fifth post, bright, follows the pointer round
 * the dial on a spring; only the beads in the one arc it lands in, between it
 * and the post before it, turn bright and gather toward it. Every other bead
 * stays put. The slider is how far the taken beads gather.
 */
const {
  Cam, facing, fit, poly, prism, proj, rings, rrect, solid, put, mk, flatDot, place, unproj,
  spring, stepS, register, pointer, disposer,
} = HL;

const RP = 64, ZP = 6, R = 48, PR = 4.6, PH = 22, NB = 22;
const POSTS = [8, 84, 208, 292].map((d) => (d * Math.PI) / 180);
const REST = (156 * Math.PI) / 180, TAU = Math.PI * 2;
const norm = (a) => ((a % TAU) + TAU) % TAU;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let gather = value;
  const C = Cam(45, 0.5, 2.02);
  fit(C, [[-RP, -RP, 0], [RP, RP, 0], [RP, -RP, 0], [-RP, RP, 0], [-R, -R * 0, ZP + PH + 4], [-R * 0.7, -R * 0.7, ZP + 2 * PH + 3]], 200, 170);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // the dial: a round plate with a crease, and the ring the posts stand on as a dim guide on its top
  const outer = rrect(-RP, -RP, RP, RP, RP, 14), inner = rrect(-RP + 2, -RP + 2, RP - 2, RP - 2, RP - 2, 14);
  put(solid(g), prism(P, front, outer, inner, 0, ZP));
  const track = rrect(-R, -R, R, R, R, 14);
  mk("path", { d: poly(track.map((q) => P(q.u, q.v, ZP))), class: "nf lo dash" }, g);
  mk("path", { d: poly(rrect(-6, -6, 6, 6, 6, 6).map((q) => P(q.u, q.v, ZP))), class: "nf lo" }, g);

  // beads, painted on the dial before every post
  const beads = [];
  for (let i = 0; i < NB; i++) {
    const a = ((i + 0.5) / NB) * TAU + 0.06 * Math.sin(i * 2.3);
    beads.push({ a, sp: spring(a, { eps: 0.002 }), el: flatDot(g, C, 2.2, "dot off"), drawn: NaN });
  }
  const postG = mk("g", {}, g);
  const post = (a, hi) => {
    const s = solid(postG);
    s.sil.classList.toggle("hi", hi);
    const p = { a, s, drawn: NaN, depth: 0 };
    return p;
  };
  const posts = POSTS.map((a) => post(a, false));
  const fresh = post(REST, true);
  fresh.sp = spring(REST, { eps: 0.002 });
  const all = posts.concat([fresh]);

  function drawPost(p, a) {
    if (a === p.drawn) return false;
    p.drawn = a;
    const x = R * Math.cos(a), y = R * Math.sin(a);
    // the new post hops over an old one it passes, instead of going through it
    let hop = 0;
    if (p === fresh) for (const pa of POSTS) hop = Math.max(hop, 1 - Math.abs(norm(a - pa + Math.PI) - Math.PI) / 0.28);
    const z = ZP + (PH + 3) * Math.sin((Math.PI / 2) * Math.min(1, hop * 1.6));
    const [ring, inn] = rings(x - PR, y - PR, x + PR, y + PR, PR, 1.1);
    put(p.s, prism(P, front, ring, inn, z, z + PH));
    p.depth = x + y + (z - ZP) * 10;
    return true;
  }
  /** The arc a lands in: k such that a lies after post k-1 and up to post k, walking clockwise. */
  const arcOf = (a) => {
    let best = 0, gap = Infinity;
    POSTS.forEach((pa, k) => { const d = norm(pa - a); if (d < gap) { gap = d; best = k; } });
    return best;
  };
  const prevPost = (a) => POSTS[(arcOf(a) + POSTS.length - 1) % POSTS.length];

  function retarget() {
    const a = norm(fresh.sp.t), from = prevPost(a);
    const span = norm(a - from);
    for (const b of beads) {
      const d = norm(b.a - from);
      const taken = d > 0 && d < span;
      // a taken bead gathers toward the new post, but stops short of it
      b.sp.t = taken ? b.a + Math.min(norm(a - b.a) * gather, Math.max(0, norm(a - b.a) - 0.2)) : b.a;
      b.el.setAttribute("class", taken ? "dot" : "dot off");
    }
  }

  const B = register(stage, (dt) => {
    let m = stepS(fresh.sp, dt);
    posts.forEach((p) => drawPost(p, p.a));
    if (drawPost(fresh, fresh.sp.x)) {
      // keep the posts painted back to front as the new one moves round
      const order = all.slice().sort((p, q) => p.depth - q.depth);
      if (order.some((p, i) => postG.children[i] !== p.s.g)) order.forEach((p) => postG.appendChild(p.s.g));
    }
    for (const b of beads) {
      if (stepS(b.sp, dt)) m = true;
      if (b.sp.x === b.drawn) continue;
      b.drawn = b.sp.x;
      place(b.el, P(R * Math.cos(b.sp.x), R * Math.sin(b.sp.x), ZP));
    }
    return m;
  });
  bag.add(B.unregister);

  function aim(a) {
    // the new post never stands on an old one: it is held a little off either side
    for (const pa of POSTS) { const d = norm(a - pa + Math.PI) - Math.PI; if (Math.abs(d) < 0.3) a = norm(pa + (d < 0 ? -0.3 : 0.3)); }
    // unwrap, so the post goes the short way round
    const cur = fresh.sp.t;
    fresh.sp.t = cur + (((a - cur + Math.PI) % TAU) + TAU) % TAU - Math.PI;
    retarget();
    B.wake();
  }
  retarget();

  bag.add(pointer(stage, {
    move: (p) => {
      const [x, y] = unproj(C, p[0], p[1], ZP), d = Math.hypot(x, y);
      if (d < R * 0.35 || d > RP * 1.25) { aim(REST); read.textContent = "rest"; return; }
      const a = norm(Math.atan2(y, x));
      aim(a);
      read.textContent = `arc ${arcOf(a) + 1} of ${POSTS.length}`;
    },
    leave: () => { aim(REST); read.textContent = "rest"; },
  }));
  bag.add(() => svg.replaceChildren());

  return { set: (v) => { gather = v; retarget(); B.wake(); }, destroy: bag.dispose };
}

hairline({
  name: "hash-ring",
  means: "Keys sit round a dial and each walks clockwise to the next server. Move the new server round: only the keys in one arc go to it.",
  rules: [1, 3, 4, 8],
  range: [0.15, 0.4, 0.7],
  tour: [[290, 175], [200, 235], [110, 170], null],
  mount,
});
