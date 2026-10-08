/**
 * Breaker lever: a circuit breaker, a tall housing with a screw at the top and
 * the bottom and a toggle lever in a window on its face, and in front of it a
 * row of calls, dots on a guide on the floor. The pointer's height sets the
 * lever: high is closed, and every call goes through; the middle is
 * half-open, and only the first two trial calls go; low is open, and none do.
 * The calls change in turn, outwards from the breaker. At rest the lever is
 * closed and bright. The slider is the stagger of the calls, in ms.
 */
const {
  Cam, clamp, facing, fit, hull, open, poly, prism, proj, rad, rings, rrect, run, seg,
  tween, tset, tval, tdone, disposer, flatDot, mk, place, pointer, put, register, solid,
} = HL;

const BW = 46, BD = 22, BH = 84, PZ = 42, LX0 = 15, LX1 = 31, LEN = 30, TK = 6, SC = 2.05;
const STATES = [["closed", 50, 6], ["half-open", 0, 2], ["open", -50, 0]];
const N = 6, DY0 = BD + 13, DGAP = 12;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;
  const C = Cam(45, 0.5, SC);
  fit(C, [[0, 0, 0], [BW, 0, 0], [0, DY0 + N * DGAP, 0], [BW, DY0 + N * DGAP, 0], [0, 0, BH], [BW, BD, BH]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const face = (ring) => poly(ring.map((q) => P(q.u, BD, q.v)));

  const [br, bi] = rings(0, 0, BW, BD, 5, 1.6);
  put(solid(g), prism(P, front, br, bi, 0, BH));
  mk("path", { class: "nf", d: face(rrect(LX0 - 4, PZ - 17, LX1 + 4, PZ + 17, 4, 4)) }, g);
  mk("path", { class: "nf lo", d: face(rrect(LX0 - 2, PZ - 15, LX1 + 2, PZ + 15, 2.5, 4)) }, g);
  for (const z of [BH - 10, 10]) {
    mk("path", { class: "nf", d: face(rrect(BW / 2 - 4, z - 4, BW / 2 + 4, z + 4, 4, 4)) }, g);
    mk("path", { class: "nf lo", d: seg(P(BW / 2 - 2.6, BD, z), P(BW / 2 + 2.6, BD, z)) }, g);
  }

  // The calls: a dashed guide on the floor, then the dots on it.
  mk("path", { class: "dash nf", d: seg(P(BW / 2, BD + 3, 0), P(BW / 2, DY0 + N * DGAP, 0)) }, g);
  const calls = [];
  for (let i = 0; i < N; i++) {
    const el = flatDot(g, C, 2.6, "dot m");
    place(el, P(BW / 2, DY0 + i * DGAP, 0));
    calls.push({ el, on: tween(1), shown: 1 });
  }

  // The lever: a rounded bar turning about an axis along x at the window's middle.
  const lever = solid(g);
  let drawn = NaN;
  function drawLever(phi) {
    if (phi === drawn) return;
    drawn = phi;
    const c = Math.cos(rad(phi)), s = Math.sin(rad(phi));
    const at = (q, x) => P(x, BD + q.u * c - q.v * s, PZ + q.u * s + q.v * c);
    const prof = rrect(1, -TK / 2, LEN, TK / 2, 2.4, 4), inner = rrect(2, -TK / 2 + 1, LEN - 1, TK / 2 - 1, 1.4, 4);
    const sees = (q) => (q.nu * c - q.nv * s) * 0.612 + (q.nu * s + q.nv * c) * 0.5 > 0;
    put(lever, {
      sil: poly(hull(prof.map((q) => at(q, LX0)).concat(prof.map((q) => at(q, LX1))))),
      crease: open(run(inner, sees).map((q) => at(q, LX1))),
    });
  }
  lever.sil.classList.add("hi");
  const ang = tween(STATES[0][1]);

  const B = register(stage, (_dt, now) => {
    let moving = !tdone(ang, now);
    drawLever(tval(ang, now));
    for (const k of calls) {
      const v = tval(k.on, now) > 0.5 ? 1 : 0;
      if (v !== k.shown) { k.shown = v; k.el.setAttribute("class", v ? "dot m" : "dot off"); }
      if (!tdone(k.on, now)) moving = true;
    }
    return moving;
  });
  bag.add(B.unregister);

  let act = -2;
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), [name, phi, lit] = STATES[a < 0 ? 0 : a];
    act = a;
    tset(ang, phi, now, 0);
    calls.forEach((k, i) => tset(k.on, i < lit ? 1 : 0, now, i * stag));
    read.textContent = a < 0 ? "rest" : name;
    B.wake();
  }

  // Bands of screen height, fixed from the resting housing: the lever never moves them.
  const hiZ = P(BW / 2, BD, PZ + 9)[1], loZ = P(BW / 2, BD, PZ - 9)[1];
  const left = P(0, BD, 0)[0] - 50, right = P(BW, 0, 0)[0] + 50, top = P(0, 0, BH)[1] - 20, foot = P(BW, BD, 0)[1] + 10;
  bag.add(pointer(stage, {
    move: ([x, y]) => setActive(x < left || x > right || y < top || y > foot ? -1 : y < hiZ ? 0 : y < loZ ? 1 : 2),
    leave: () => setActive(-1),
  }));
  bag.add(() => svg.replaceChildren());
  setActive(-1);

  return {
    set: (v) => { stag = clamp(v, 0, 200); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "breaker-lever",
  means: "A breaker guards calls to a sick helper. Move the pointer down: closed lets every call through, half-open tries two, open stops them all.",
  rules: [1, 2, 4, 8],
  range: [0, 50, 100],
  tour: [[246, 95], [246, 143], [246, 193], null],
  mount,
});
