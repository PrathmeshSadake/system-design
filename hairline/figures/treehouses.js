/**
 * Treehouses: two treehouses on their own patches of grass, joined by a
 * string telephone from cup to cup. The pointer on the string cuts it there;
 * each half falls slack from its cup, the fall spreading out from the cut,
 * and comes to lie on the grass. Now neither house can hear the other, and
 * each must pick: answer with what it has, or refuse. The slider is the
 * stagger of the fall along the string, in ms per bead of string.
 */
const {
  Cam, circ, clamp, facing, fit, hull, lerp, open, poly, prism, proj, ringAt, rings, rrect, run,
  tween, tset, tval, tdone, disposer, mk, pointer, put, register, solid,
} = HL;

const K = 26, D = 46, CUP = 25, LEDGE = 8, PZ = 44, CZ = 52;
const HOUSES = [[-D, D, 1], [D, -D, -1]];

const shift = (ring, x, y) => ring.map((q) => ({ ...q, u: q.u + x, v: q.v + y }));

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let step = value;
  const C = Cam(45, 0.5, 1.75);
  fit(C, [[-94, 50, -5], [50, -94, -5], [-50, 94, -5], [94, -50, -5], [-D, D, 84], [D, -D, 84]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // each house: a patch of grass, a trunk, a platform, a hut with a roof, and a cup on the side facing the other
  const cups = [];
  // one lawn under both, a long rounded strip along the line between them
  const turn = (ring) => ring.map((q) => ({ u: (q.u + q.v) / Math.SQRT2, v: (q.v - q.u) / Math.SQRT2, nu: (q.nu + q.nv) / Math.SQRT2, nv: (q.nv - q.nu) / Math.SQRT2 }));
  put(solid(g), prism(P, front, turn(rrect(-102, -32, 102, 32, 30, 10)), turn(rrect(-100, -30, 100, 30, 28, 10)), -5, 0));
  for (const [hx, hy, s] of HOUSES) {
    put(solid(g), prism(P, front, shift(circ(6, 16), hx, hy), shift(circ(6, 16), hx, hy), 0, PZ - 3));
    const [pr, pi] = rings(hx - 20, hy - 20, hx + 20, hy + 20, 5, 1.6);
    put(solid(g), prism(P, front, pr, pi, PZ - 3, PZ));
    const [hr, hi] = rings(hx - 13, hy - 13, hx + 13, hy + 13, 2.5, 1.2);
    put(solid(g), prism(P, front, hr, hi, PZ, PZ + 18));
    const foot = rrect(hx - 16, hy - 16, hx + 16, hy + 16, 3, 3), top = rrect(hx - 2.5, hy - 2.5, hx + 2.5, hy + 2.5, 1.5, 3);
    mk("path", { d: poly(hull(ringAt(P, foot, PZ + 18).concat(ringAt(P, top, PZ + 34)))), class: "sil" }, g);
    mk("path", { d: open(ringAt(P, run(foot, front), PZ + 18)), class: "nf lo" }, g);
    // a window on the face we can see
    mk("path", { d: poly(rrect(hx - 5, PZ + 6, hx + 5, PZ + 13, 1.5, 3).map((q) => P(q.u, hy + 13, q.v))), class: "nf lo" }, g);
    const cx = hx + (s * CUP) / Math.SQRT2, cy = hy - (s * CUP) / Math.SQRT2;
    put(solid(g), prism(P, front, shift(circ(3.2, 16), cx, cy), shift(circ(2.4, 16), cx, cy), PZ, CZ));
    cups.push([cx, cy, CZ - 1]);
  }
  const string = mk("path", { class: "nf sil" }, g), string2 = mk("path", { class: "nf sil" }, g);

  const [A, Bc] = cups, L = Math.hypot(Bc[0] - A[0], Bc[1] - A[1]);
  const dir = [(Bc[0] - A[0]) / L, (Bc[1] - A[1]) / L];
  const taut = (i) => { const s = i / (K - 1); return [lerp(A[0], Bc[0], s), lerp(A[1], Bc[1], s), CZ - 1 - 7 * Math.sin(Math.PI * s)]; };
  /** A bead d along the string from cup c, the string hanging: out past the ledge, down, then along the grass. */
  const hang = (c, sg, d) => {
    if (d < LEDGE) return [c[0] + sg * dir[0] * d, c[1] + sg * dir[1] * d, c[2] - d * 0.5];
    const drop = c[2] - LEDGE * 0.5, fall = d - LEDGE, run2 = Math.max(0, fall - drop);
    return [c[0] + sg * dir[0] * (LEDGE + run2 * 0.8), c[1] + sg * dir[1] * (LEDGE + run2 * 0.8), Math.max(0.3, drop - fall)];
  };
  const beads = Array.from({ length: K }, () => tween(0));
  let cut = -1, ci = Math.floor(K / 2), drawn = "";

  const B = register(stage, (_dt, now) => {
    let moving = false;
    const pts = beads.map((tw, i) => {
      const u = tval(tw, now), a = taut(i), s = i / (K - 1);
      if (!tdone(tw, now)) moving = true;
      if (u === 0) return a;
      const h = i <= ci ? hang(A, 1, s * L) : hang(Bc, -1, (1 - s) * L);
      return [lerp(a[0], h[0], u), lerp(a[1], h[1], u), lerp(a[2], h[2], u)];
    });
    const sp = pts.map((q) => P(q[0], q[1], q[2])), key = sp.map((q) => q[0].toFixed(1) + q[1].toFixed(1)).join();
    if (key !== drawn) {
      drawn = key;
      const split = beads.some((tw) => tval(tw, now) > 0);
      string.setAttribute("d", open(split ? sp.slice(0, ci + 1) : sp));
      string2.setAttribute("d", split ? open(sp.slice(ci + 1)) : "");
    }
    return moving;
  });
  bag.add(B.unregister);

  // the hit test: the string's rest pose on screen, which never moves
  const rest = Array.from({ length: K }, (_, i) => { const q = taut(i); return P(q[0], q[1], q[2]); });
  function aim(p) {
    let best = -1, bd = 26 * 26;
    if (p) rest.forEach((q, i) => { const d = (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2; if (d < bd) { bd = d; best = i; } });
    const now = performance.now();
    if (best >= 0 && cut < 0) {
      // the cut point is kept until the pointer leaves the string, so the halves never swap mid-fall
      cut = ci = clamp(best, 3, K - 4);
      beads.forEach((tw, i) => tset(tw, 1, now, Math.abs(i - ci) * step));
    } else if (best < 0 && cut >= 0) {
      cut = -1;
      beads.forEach((tw, i) => tset(tw, 0, now, (K - Math.abs(i - ci)) * step * 0.3));
    }
    string.classList.toggle("hi", true); string2.classList.toggle("hi", true);
    read.textContent = cut >= 0 ? "split · pick one" : "rest";
    B.wake();
  }

  aim(null);
  bag.add(pointer(stage, { move: (p) => aim(p), leave: () => aim(null) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { step = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "treehouses",
  means: "Two treehouses share a string telephone. Cut the string and it falls slack: each house must now pick, answer with old news or wait.",
  rules: [1, 2, 3, 5],
  range: [6, 16, 28],
  tour: [[200, 146], [200, 262], [150, 140], null],
  mount,
});
