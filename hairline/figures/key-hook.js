/**
 * Key hook: one key hangs on the only hook of a key board, a tag on its ring.
 * The tag's dots count how many times the key has been lent. The pointer
 * reaching for the key takes it off the hook toward the viewer, and as it
 * comes off the tag gains a dot: each lend gets a bigger number, so an older
 * holder's smaller number can be turned away. The slider is how far the key
 * comes out.
 */
const {
  Cam, fillet, fit, poly, prism, proj, rad, rings, seg, tween, tset, tval, tdone,
  disposer, mk, place, pointer, put, register, solid, facing,
} = HL;

const BX = 32, BT = 4, BH = 84, PEG = 66, KY = 6, LIT = 3;
const SHAFT = fillet([[-2.4, 58], [2.4, 58], [2.4, 46], [6.5, 46], [6.5, 41.5], [2.4, 41.5], [2.4, 38.5], [5.5, 38.5], [5.5, 33], [0, 29], [-2.4, 31]], [0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 1.5, 0.8]);
const circle = (cx, cz, r, n = 28, cw = false) => Array.from({ length: n }, (_, i) => {
  const a = rad((cw ? -1 : 1) * i * (360 / n));
  return [cx + r * Math.cos(a), cz + r * Math.sin(a)];
});
const TAG = fillet([[-24, 30], [-9, 30], [-9, 50], [-24, 50]], [2.5, 2.5, 2.5, 2.5]);
const SLOTS = [[-19.5, 43.5], [-13.5, 43.5], [-19.5, 37], [-13.5, 37]];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let reach = value;
  const C = Cam(45, 0.5, 2.55);
  fit(C, [[-BX - 6, -14, 0], [BX + 6, 12, 0], [BX + 6, -14, 0], [-BX - 6, 12, 0], [-BX, -BT, BH], [BX, -BT, BH], [-24, KY + 32, 30]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // the board on its foot, a few screw heads, and the one hook
  const [fr, fi] = rings(-BX - 6, -14, BX + 6, 12, 5, 1.6);
  put(solid(g), prism(P, front, fr, fi, 0, 5));
  const [br, bi] = rings(-BX, -BT, BX, 0, 1.6, 0.7);
  put(solid(g), prism(P, front, br, bi, 5, BH));
  for (const [a, b] of [[-BX + 7, BH - 8], [BX - 7, BH - 8]]) place(mk("circle", { r: 1.6, class: "dot off" }, g), P(a, 0, b));
  const peg = solid(g);
  const [pr, pi] = rings(-1.8, 0, 1.8, 9, 0.9, 0.5);
  put(peg, prism(P, front, pr, pi, PEG + 0.2, PEG + 2.6));

  // the key and its tag, flat in a plane in front of the board: back edge, face, ring, string, dots
  const key = mk("g", {}, g);
  const back = mk("path", { class: "lo" }, key), face = mk("path", { class: "sil" }, key);
  const tagBack = mk("path", { class: "lo" }, key), tag = mk("path", { class: "sil" }, key);
  const string = mk("path", { class: "nf" }, key);
  const dots = SLOTS.map((_, k) => mk("circle", { r: 1.6, class: k < LIT ? "dot" : "dot off" }, key));
  const tw = tween(0);
  let drawn = NaN;

  function draw(u) {
    if (u === drawn) return;
    drawn = u;
    const y = KY + u * reach, dz = u * 12, w = (pts, yy) => pts.map(([a, b]) => P(a, yy, b + dz));
    // the bow is a ring: its hole is a second loop the other way round, so the board shows through it
    const bow = poly(w(circle(0, PEG - 1, 8), y)) + poly(w(circle(0, PEG - 1, 3.6, 20, true), y));
    const bowBack = poly(w(circle(0, PEG - 1, 8), y - 1.2));
    face.setAttribute("d", poly(w(SHAFT, y)) + bow);
    back.setAttribute("d", poly(w(SHAFT, y - 1.2)) + bowBack);
    tag.setAttribute("d", poly(w(TAG, y)) + poly(w(circle(-16.5, 47, 1.4, 12, true), y)));
    tagBack.setAttribute("d", poly(w(TAG, y - 1.2)));
    string.setAttribute("d", seg(P(-16.5, y, 48.4 + dz), P(-5.6, y, PEG - 4 + dz)));
    dots.forEach((d, k) => place(d, P(SLOTS[k][0], y, SLOTS[k][1] + dz)));
    // once the key is out in front of the hook, the hook is painted behind it
    if (u > 0.25) key.before(peg.g); else key.after(peg.g);
  }

  const B = register(stage, (_dt, now) => { draw(tval(tw, now)); return !tdone(tw, now); });
  bag.add(B.unregister);

  // the hit test: the key's rest pose on screen, which never moves
  const kc = P(-6, KY, 46);
  let held = null;
  function take(p) {
    const h = !!p && Math.hypot(p[0] - kc[0], p[1] - kc[1]) < 62;
    if (h === held) return;
    held = h;
    tset(tw, h ? 1 : 0, performance.now(), 0);
    dots[LIT].setAttribute("class", h ? "dot" : "dot off");
    read.textContent = h ? "token 34" : "rest";
    B.wake();
  }

  face.classList.add("hi");
  take(null);
  bag.add(pointer(stage, { move: (p) => take(p), leave: () => take(null) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { reach = v; drawn = NaN; B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "key-hook",
  means: "One key on a hook, its tag dotted with a count. Each lend adds a dot, a bigger number, so an old holder with a smaller one is turned away.",
  rules: [1, 4, 5, 10],
  range: [14, 24, 34],
  tour: [[200, 160], [320, 260], [190, 150], null],
  mount,
});
