/**
 * Canary seats: a round stand with a hundred seats (dots) in four rings around
 * a hub. A slice of the seats runs the new version: those seats rise on stems
 * and are bright, the rest stay down. The pointer's height widens the slice in
 * the release's steps, 1, 5, 25 and then 100 percent, the seats rising in turn
 * around the ring from the slice's edge. At rest the slice is 5 percent. The
 * slider is how high the new seats rise.
 */
const {
  Cam, facing, fit, prism, proj, rrect, seg, clamp,
  tween, tset, tval, tdone, flatDot, mk, place, pointer, put, register, disposer, solid,
} = HL;

const STEPS = [1, 5, 25, 100], REST = 1, R = 46, SPREAD = 520, A0 = Math.PI / 4;
const RINGS = [[17, 16], [24, 22], [31, 28], [38, 34]];
const disc = (r, n = 14) => rrect(-r, -r, r, r, r, n);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lift = value;
  const C = Cam(45, 0.5, 3.0);
  fit(C, [[-R, -R, -4], [R, R, -4], [R, -R, -4], [-R, R, -4], [-38, -38, 14]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  put(solid(g), prism(P, front, disc(R), disc(R - 2), -4, 0));
  // every seat, numbered by its angle round the ring from the slice's leading edge
  const seats = [];
  RINGS.forEach(([r, n], k) => {
    for (let i = 0; i < n; i++) {
      const a = (i + 0.5 * (k % 2)) / n;
      seats.push({ a, x: r * Math.cos(A0 - a * 2 * Math.PI), y: r * Math.sin(A0 - a * 2 * Math.PI) });
    }
  });
  seats.sort((p, q) => p.a - q.a).forEach((s, i) => { s.rank = i; });
  // paint by depth: the far half, the hub, then the near half
  const far = mk("g", {}, g);
  put(solid(g), prism(P, front, disc(10, 8), disc(8.8, 8), 0, 9));
  put(solid(g), prism(P, front, disc(5, 8), disc(4, 8), 9, 13));
  const near = mk("g", {}, g);
  for (const s of seats.slice().sort((p, q) => p.x + p.y - (q.x + q.y))) {
    const parent = s.x + s.y < 0 ? far : near;
    s.stem = mk("path", { class: "nf lo" }, parent);
    s.el = flatDot(parent, C, 1.45, "dot off");
    s.t = tween(0);
    s.drawn = NaN;
  }

  function draw(s, f) {
    const z = f * lift;
    if (z === s.drawn) return;
    s.drawn = z;
    s.stem.setAttribute("d", z > 0.3 ? seg(P(s.x, s.y, 0), P(s.x, s.y, z)) : "");
    place(s.el, P(s.x, s.y, z));
    s.el.setAttribute("class", f > 0.5 ? "dot" : "dot off");
  }

  const B = register(stage, (_dt, now) => {
    let m = false;
    for (const s of seats) { draw(s, tval(s.t, now)); if (!tdone(s.t, now)) m = true; }
    return m;
  });
  bag.add(B.unregister);

  // Hit test against the stand's resting box on screen: how high up it the pointer is picks the step.
  const top = P(-R, -R, 0)[1] - 30, bottom = P(R, R, -4)[1] + 10, left = P(-R, R, 0)[0] - 20, right = P(R, -R, 0)[0] + 20;
  function level([sx, sy]) {
    if (sx < left || sx > right || sy < top - 20 || sy > bottom + 20) return -1;
    return clamp(Math.floor(((bottom - sy) / (bottom - top)) * 4), 0, 3);
  }

  let act = null, edge = STEPS[REST];
  function choose(l) {
    if (l === act) return;
    const now = performance.now(), n = STEPS[l < 0 ? REST : l];
    act = l;
    for (const s of seats) tset(s.t, s.rank < n ? 1 : 0, now, (Math.abs(s.rank - edge) / 100) * SPREAD);
    edge = n;
    read.textContent = l < 0 ? "rest" : `${n} percent`;
    B.wake();
  }
  choose(-1);

  bag.add(pointer(stage, { move: (p) => choose(level(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { lift = v; seats.forEach((s) => { s.drawn = NaN; }); B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "canary-seats",
  means: "A hundred seats, and a few try the new version first. Raise the pointer to widen the slice from 1 to 5 to 25 to every seat.",
  rules: [1, 2, 4, 5],
  range: [6, 10, 14],
  tour: [[200, 245], [200, 150], [200, 90], null],
  mount,
});
