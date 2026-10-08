/**
 * Size stack: the same picture made in four sizes, as four nesting trays of
 * the same 16:9 shape stacked from the biggest up. Each tray's floor is a
 * grid of dots at one pitch, so a bigger tray holds more dots: more picture,
 * more data. The pointer picks a tray: it rises a little and the smaller ones
 * above it lift away, staggered outwards, so its floor shows whole and bright.
 * The slider is the lift.
 *
 * The pattern: scrub and pick. Tweens, a stagger by distance, and a hit test
 * on each tray's own rest top, smallest first.
 */
const {
  Cam, fit, facing, poly, proj, prism, rings, rrect, ringAt,
  tdone, tset, tval, tween, unproj, disposer, flatDot, mk, place, pointer, put, register, solid,
} = HL;

const W = [116, 86, 60, 38], TH = 5, GAP = [14, 10, 15], LIT = 1, PITCH = 9;
const NAMES = ["1080p · 5 Mbps", "720p · 3 Mbps", "480p · 1.5 Mbps", "360p · 0.8 Mbps"];
const half = (k) => [W[k] / 2, (W[k] * 9) / 32];
const base = (k) => { let z = 0; for (let i = 0; i < k; i++) z += TH + GAP[i]; return z; };

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let L = value;
  const C = Cam(45, 0.5, 1.85);
  const [hx, hy] = half(0);
  fit(C, [[-hx, -hy, 0], [hx, hy, 0], [hx, -hy, 0], [-hx, hy, 0], [-half(3)[0], -half(3)[1], base(3) + TH + 20]], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg), trays = [];
  for (let k = 0; k < W.length; k++) {
    const [ax, ay] = half(k), grp = mk("g", {}, g);
    const [ring, inner] = rings(-ax, -ay, ax, ay, 7, 1.6);
    const floor = rrect(-ax + 5, -ay + 5, ax - 5, ay - 5, 4, 4);
    const s = solid(grp), fl = mk("path", { class: "nf lo" }, grp);
    // the picture's dots, all at one pitch: a bigger tray holds more of them
    const dots = [], cx = Math.floor((ax - 8) / PITCH), cy = Math.floor((ay - 8) / PITCH);
    for (let i = -cx; i <= cx; i++) for (let j = -cy; j <= cy; j++) dots.push({ x: i * PITCH, y: j * PITCH, el: flatDot(grp, C, 0.95, "dot off") });
    trays.push({ ring, inner, floor, s, fl, dots, z: tween(base(k)), drawn: NaN });
  }

  function draw(k, z) {
    const t = trays[k];
    if (z === t.drawn) return;
    t.drawn = z;
    put(t.s, prism(P, front, t.ring, t.inner, z, z + TH));
    t.fl.setAttribute("d", poly(ringAt(P, t.floor, z + TH)));
    t.dots.forEach((d) => place(d.el, P(d.x, d.y, z + TH)));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    trays.forEach((t, k) => { draw(k, tval(t.z, now)); if (!tdone(t.z, now)) moving = true; });
    return moving;
  });
  bag.add(B.unregister);

  // hit: each tray's rest top, smallest first, so a raised tray never steals the pointer from under itself
  function hit([sx, sy]) {
    for (let k = W.length - 1; k >= 0; k--) {
      const [ax, ay] = half(k), q = unproj(C, sx, sy, base(k) + TH);
      if (Math.abs(q[0]) <= ax + 3 && Math.abs(q[1]) <= ay + 3) return k;
    }
    return -1;
  }

  let act = -2;
  function setActive(a, force) {
    if (a === act && !force) return;
    const now = performance.now(), from = a >= 0 ? a : Math.max(act, 0);
    act = a;
    trays.forEach((t, k) => {
      tset(t.z, base(k) + (a < 0 ? 0 : k > a ? L : k === a ? L * 0.3 : 0), now, Math.abs(k - from) * 45);
      const on = a < 0 ? k === LIT : k === a;
      t.s.sil.classList.toggle("hi", on);
      t.dots.forEach((d) => d.el.setAttribute("class", on ? "dot m" : "dot off"));
    });
    read.textContent = a < 0 ? "rest" : NAMES[a];
    B.wake();
  }
  setActive(-1);

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { L = v; setActive(act, true); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "size-stack",
  means: "One picture made in four sizes, stacked like nesting trays. Bigger trays hold more dots, more data. Point at a size to open it up.",
  rules: [1, 2, 4, 5],
  range: [6, 12, 20],
  tour: [[200, 120], [200, 175], [110, 200], null],
  mount,
});
