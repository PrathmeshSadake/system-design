/**
 * Metronome: a tapered metronome swings its arm on a steady beat. Beside it,
 * small slips (score changes) pile up on a tray between beats, as fast as they
 * come; on every beat the pile goes out as one message and the tray starts
 * again. The pointer slides the weight on the arm, as on a real metronome:
 * higher is a slower beat and a taller pile. The slider is how fast changes
 * arrive, per second.
 */
const {
  Cam, clamp, facing, fillet, fit, hull, lerp, open, poly, prism, proj, rad, rings, ringAt, rrect, run,
  spring, stepS, mk, pointer, put, register, disposer, solid,
} = HL;

const PX = 22, PY = 40, PZ = 12, ARM = 84, AMP = 22, CAP = 14, SLIP = 2.6;
const U0 = 1 / 3, TX0 = 66, TX1 = 96, TY0 = 12, TY1 = 38;
/** Seconds per beat for a weight at u (0 low on the arm, 1 high). */
const period = (u) => lerp(0.5, 2, u);
const say = (p) => (p <= 1 ? `${Math.round(2 / p) / 2} per s` : `1 per ${Math.round(p * 2) / 2} s`);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let rate = value, phi = 0, since = 0;
  const w = spring(U0);
  const C = Cam(45, 0.5, 1.62);
  fit(C, [[-10, -10, -4], [TX1 + 10, 56, -4], [TX1 + 10, -10, -4], [-10, 56, -4], [PX, PY, PZ + ARM + 4], [PX + 34, PY, PZ + ARM - 8], [PX - 34, PY, PZ + ARM - 8]], 200, 162);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const [br, bi] = rings(-10, -10, TX1 + 10, 56, 9, 2.2);
  put(solid(g), prism(P, front, br, bi, -4, 0));

  // The body: a pyramid that tapers, with a scale panel set into its sloping face.
  const foot = rrect(0, 0, 44, 36, 6, 6), top = rrect(15, 10, 29, 24, 3, 4), inner = rrect(16.6, 11.6, 27.4, 22.4, 1.6, 4);
  put(solid(g), { sil: poly(hull(ringAt(P, foot, 0).concat(ringAt(P, top, 76)))), crease: open(ringAt(P, run(inner, front), 76)) });
  const face = (x, z) => P(x, 36 - (z / 76) * 12, z);
  mk("path", { d: poly(fillet([face(9, 20), face(35, 20), face(28, 66), face(16, 66)], [2, 2, 2, 2])), class: "nf lo" }, g);

  // The arm, its pivot and its weight, all in the plane just in front of the face.
  const inPlane = (th, s, o, y) => P(PX + s * Math.sin(th) + o * Math.cos(th), y, PZ + s * Math.cos(th) - o * Math.sin(th));
  const arm = mk("path", { class: "sil" }, g);
  const pivot = mk("path", { class: "" }, g);
  const wBack = mk("path", { class: "lo" }, g), wFront = mk("path", { class: "hi" }, g);
  const circle = (r, y) => Array.from({ length: 16 }, (_, k) => P(PX + r * Math.cos((k / 16) * Math.PI * 2), y, PZ + r * Math.sin((k / 16) * Math.PI * 2)));
  pivot.setAttribute("d", poly(circle(4.5, PY + 1)));

  // The tray of slips, in front and to the side.
  const [tr, ti] = rings(TX0, TY0, TX1, TY1, 4, 1.4);
  put(solid(g), prism(P, front, tr, ti, 0, 3));
  const slips = [];
  for (let k = 0; k < CAP; k++) {
    const el = solid(g), z = 3 + k * SLIP, [a, b] = rings(TX0 + 3, TY0 + 3, TX1 - 3, TY1 - 3, 2, 0.8);
    slips.push({ el, d: prism(P, front, a, b, z, z + SLIP - 0.5) });
  }

  const wOut = (d, th, y) => fillet([[d - 6, -8], [d + 6, -8], [d + 6, 8], [d - 6, 8]].map(([s, o]) => inPlane(th, s, o, y)), [2.5, 2.5, 2.5, 2.5]);
  let shown = -1;
  function draw() {
    const th = rad(AMP) * Math.sin(phi), d = lerp(30, ARM - 8, w.x);
    arm.setAttribute("d", poly(fillet([[-4, -1.6], [ARM, -1.6], [ARM, 1.6], [-4, 1.6]].map(([s, o]) => inPlane(th, s, o, PY)), [1, 1, 1, 1])));
    wBack.setAttribute("d", poly(wOut(d, th, PY - 1)));
    wFront.setAttribute("d", poly(wOut(d, th, PY + 2)));
    const n = Math.min(CAP, Math.floor(since * rate));
    if (n !== shown) {
      slips.forEach((s, k) => put(s.el, k < n ? s.d : { sil: "", crease: "" }));
      shown = n;
    }
  }

  const B = register(stage, (dt) => {
    stepS(w, dt);
    const before = Math.floor(phi / Math.PI + 0.5);
    phi += (Math.PI / period(w.x)) * dt;
    since += dt;
    // a beat at each end of the swing: the pile goes out as one message
    if (Math.floor(phi / Math.PI + 0.5) !== before) since = 0;
    draw();
    return true;
  });
  bag.add(B.unregister);
  draw();

  // The pointer's height sets the weight, read against the arm standing upright, which never moves.
  const lo = P(PX, PY, PZ + 30)[1], hi = P(PX, PY, PZ + ARM - 8)[1];
  bag.add(pointer(stage, {
    move: (p) => {
      w.t = clamp((lo - p[1]) / (lo - hi), 0, 1);
      read.textContent = say(period(w.t));
      B.wake();
    },
    leave: () => { w.t = U0; read.textContent = "rest"; B.wake(); },
  }));
  read.textContent = "rest";
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { rate = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "metronome",
  means: "A metronome ticks a steady beat while small changes pile up beside it. Each beat sends the pile as one. Point to slide the weight.",
  rules: [3, 5, 7, 8],
  range: [4, 8, 14],
  tour: [[151, 104], [151, 70], [151, 140], null],
  mount,
});
