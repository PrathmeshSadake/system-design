/**
 * Problem pile: a belt of message crates runs into a machine, the handler,
 * with a tray beside it, the dead-letter pile. Every other crate goes straight
 * in. The stubborn one (bright) bumps the machine's mouth and backs off, waiting
 * longer each time, while the line behind it waits; five dots on the machine's
 * roof count its tries. After the fifth it slides into the tray, and the line
 * moves again. A crate in the tray is taken away during the next round. The
 * world never stops; hovering slows it so a try can be read. The slider is how
 * slow, as a share of full speed.
 */
const {
  Cam, clamp, facing, fit, hull, open, poly, prism, proj, rings, ringAt, rrect, run, EASE_LIFT,
  spring, stepS, flatDot, mk, pointer, place, put, register, disposer, solid,
} = HL;

const XH = 32, XE = XH + 12 + 4 * 24 + 14, PITCH = 24, CW = 16, CH = 13, BT = 6, K = 4, TRIES = 5;
const WAITS = [0.15, 0.3, 0.6, 1.2], PUSH = 0.6, A1 = 0.7, A2 = [0.8, 1.5];
const T0 = 1.5, STARTS = [T0], TY0 = 38, TY1 = 66, TX0 = XH + 12, TX1 = XH + 56, WH = 14, HH = 28;
for (let k = 1; k < TRIES; k++) STARTS.push(STARTS[k - 1] + PUSH + WAITS[k - 1]);
const LEAVE = STARTS[TRIES - 1] + PUSH + 0.2, LAND = LEAVE + 0.8, CYCLE = LAND + 0.9;
const ease = (p) => EASE_LIFT(clamp(p, 0, 1));
const slotX = (s) => XH + 12 + s * PITCH;
const LR = (pts) => (pts[0][0] <= pts[pts.length - 1][0] ? pts : pts.slice().reverse());

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let slow = value, over = false, T = T0 + 0.4, said = "";
  const rate = spring(1);
  const C = Cam(45, 0.5, 1.72);
  fit(C, [[-6, -10, -5], [XE + 6, TY1 + 4, -5], [XE + 6, -10, -5], [-6, TY1 + 4, -5], [0, -6, HH]], 200, 170);
  const P = proj(C), front = facing(C);
  const box = (el, x0, y0, x1, y1, z0, z1, r, b) => { const [a, c] = rings(x0, y0, x1, y1, r, b); put(el, prism(P, front, a, c, z0, z1)); };
  const g = mk("g", {}, svg);

  // Floor, belt with its roller seams, and the tray's far half.
  box(solid(g), -6, -10, XE + 6, TY1 + 4, -5, 0, 9, 2.2);
  box(solid(g), 4, 0, XE, 24, 0, BT, 5, 1.4);
  mk("path", { d: [XH + 24, XH + 48, XH + 72, XH + 96].map((x) => open([P(x, 2.5, BT), P(x, 21.5, BT)])).join(""), class: "nf lo" }, g);
  const outer = rrect(TX0, TY0, TX1, TY1, 5, 6), inner = rrect(TX0 + 2.4, TY0 + 2.4, TX1 - 2.4, TY1 - 2.4, 2.6, 6);
  mk("path", { d: poly(hull(ringAt(P, outer, 0).concat(ringAt(P, outer, WH)))), class: "sil" }, g);
  mk("path", { d: poly(ringAt(P, inner, WH)), class: "nf" }, g);
  mk("path", { d: open(ringAt(P, run(inner, (q) => !front(q)), 1.5)), class: "nf lo" }, g);

  // The handler: a machine at the belt's far end, a mouth in its face, the try count on its roof.
  box(solid(g), 0, -6, XH, 30, 0, HH, 6, 1.8);
  mk("path", { d: poly(rrect(1, BT - 1, 23, BT + CH + 3, 3, 4).map((q) => P(XH, q.u, q.v))), class: "nf" }, g);
  const dots = [];
  for (let k = 0; k < TRIES; k++) dots.push(flatDot(g, C, 1.6, "dot off"));
  dots.forEach((d, k) => place(d, P(XH / 2, -1 + k * 6.5, HH)));

  // The crates live in their own layer, re-sorted back to front each frame.
  const layer = mk("g", {}, g), pool = [];
  for (let k = 0; k < 8; k++) pool.push(solid(layer));

  // The tray's near half, painted over whatever lies in it.
  const iF = LR(ringAt(P, run(inner, front), WH)), oT = LR(ringAt(P, run(outer, front), WH)), oB = LR(ringAt(P, run(outer, front), 0));
  mk("path", { d: poly([...iF, oT[oT.length - 1], ...oB.slice().reverse(), oT[0]]), class: "fo" }, g);
  mk("path", { d: open(oT), class: "nf lo" }, g);
  mk("path", { d: open(iF), class: "nf" }, g);
  mk("path", { d: open([oT[0], ...oB, oT[oT.length - 1]]), class: "nf sil" }, g);

  /** Where every crate is at world time t: [x, y, z, height, stubborn]. */
  function scene(t) {
    const c = Math.floor(t / CYCLE), u = t - c * CYCLE, out = [];
    const B = 2 * c - 1 + ease(u / A1) + ease((u - A2[0]) / (A2[1] - A2[0]));
    let tries = 0;
    for (let k = 0; k < TRIES; k++) if (u >= STARTS[k]) tries = k + 1;
    for (let q = 2 * c; q <= Math.floor(B) + K + 1; q++) {
      let s = q - B;
      if (s < -1 || s > K) continue;
      const stub = q === 2 * c + 1;
      if (stub && u >= STARTS[0]) {
        const k = tries - 1, p = (u - STARTS[k]) / PUSH;
        s = p < 1 ? -0.38 * Math.sin(Math.PI * ease(p)) : 0;
        if (u >= LEAVE) {
          const m = ease((u - LEAVE) / (LAND - LEAVE));
          out.push([slotX(0) + m * ((TX0 + TX1) / 2 - slotX(0)), 12 + m * ((TY0 + TY1) / 2 - 12), BT + (1.5 - BT) * m + Math.sin(Math.PI * m) * 10, CH, true]);
          continue;
        }
      }
      out.push([slotX(s), 12, BT, CH * clamp(K - s, 0, 1), stub]);
    }
    // last round's stubborn crate, taken out of the tray while the line moves
    if (u < T0) out.push([(TX0 + TX1) / 2, (TY0 + TY1) / 2, 1.5, CH * (1 - ease(u / T0)), false, true]);
    return { out, tries, c, u };
  }

  function draw() {
    const { out, tries, c, u } = scene(T);
    out.sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
    pool.forEach((el, k) => {
      const cr = out[k];
      if (!cr || cr[3] <= 0.3) { put(el, { sil: "", crease: "" }); return; }
      layer.append(el.g);
      // a crate going into the mouth is cut at the machine's face
      const x0 = Math.max(cr[0] - CW / 2, XH + 0.4), x1 = cr[0] + CW / 2;
      if (x1 - x0 < 1.5) { put(el, { sil: "", crease: "" }); return; }
      box(el, x0, cr[1] - CW / 2, x1, cr[1] + CW / 2, cr[2], cr[2] + cr[3], Math.min(3, (x1 - x0) / 2), Math.min(1.2, (x1 - x0) / 3));
      el.sil.classList.toggle("hi", !!cr[4]);
    });
    dots.forEach((d, k) => d.setAttribute("class", k < tries && u < LAND + 0.3 ? "dot m" : "dot off"));
    const n = (9 + 2 * c) % 100;
    const say = !over ? "rest" : u < A2[0] ? `msg ${n - 1} · ok` : u < T0 ? `msg ${n} · wait` : u < LEAVE ? `msg ${n} · try ${tries}` : `msg ${n} · pile`;
    if (say !== said) { said = say; read.textContent = say; }
  }

  const B = register(stage, (dt) => {
    stepS(rate, dt);
    T += dt * rate.x;
    draw();
    return true;
  });
  bag.add(B.unregister);
  draw();

  bag.add(pointer(stage, {
    move: () => { over = true; rate.t = slow; B.wake(); },
    leave: () => { over = false; rate.t = 1; B.wake(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { slow = v; if (over) rate.t = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "problem-pile",
  means: "Message crates ride a belt into a machine. A stubborn one bumps it five times, waiting longer each time, then drops onto the problem pile.",
  rules: [3, 5, 7, 8],
  range: [0.6, 0.3, 0.1],
  tour: [[182, 144], [232, 176], [170, 214], null],
  mount,
});
