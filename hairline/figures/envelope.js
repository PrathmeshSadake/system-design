/**
 * Envelope: a letter in its envelope, standing on a rack. Sealed, all you
 * can read is the outside: the address lines and the stamp, which is all a
 * layer 4 balancer looks at. Raise the pointer and the flap swings up and the
 * letter rises out of it: now you can read what is asked, as a layer 7
 * balancer does. The pointer's height opens the flap on a spring; the bright
 * stroke sits on what can be read, the address or the letter. The slider is
 * how far the letter rises.
 */
const {
  Cam, clamp, fillet, fit, facing, open, poly, prism, proj, rad, rings, rrect, seg,
  spring, stepS, disposer, mk, pointer, put, register, solid,
} = HL;

const EW = 132, EH = 80, ET = 4, FD = 42, LH = 72, L0 = 3, RH = 7, REST = 0.5;
const SHEET = fillet([[0, 0], [EW, 0], [EW, EH], [0, EH]], [2, 2, 2, 2]);
const FLAP = fillet([[1, 0], [EW - 1, 0], [EW / 2, FD]], [2, 2, 7]);
const LETTER = fillet([[7, 0], [EW - 7, 0], [EW - 7, LH], [7, LH]], [1, 1, 1.5, 1.5]);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lift = value;
  const C = Cam(45, 0.5, 1.75);
  fit(C, [[-4, -10, 0], [EW + 4, ET + 10, 0], [EW + 4, -10, 0], [-4, ET + 10, 0], [EW / 2, 0, RH + EH + FD], [7, 2, RH + L0 + LH + 44], [0, 0, RH + EH]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const box = (x0, y0, x1, y1, z0, z1) => { const [o, i] = rings(x0, y0, x1, y1, 3, 1); return prism(P, front, o, i, z0, z1); };
  const Q = (x, y, z) => P(x, y, z + RH); // the envelope stands on the rack
  const onFace = (pts, y) => pts.map(([u, v]) => Q(u, y, v));

  // the rack the envelope stands on, then the flap and the letter, which are behind the envelope's face
  put(solid(g), box(-6, -10, EW + 6, ET + 10, 0, RH));
  const flap = mk("path", { class: "sil" }, g);
  const letter = mk("path", { class: "sil" }, g), lines = mk("path", { class: "nf lo" }, g);
  // the envelope: its back edge for thickness, its face, the address and the stamp
  mk("path", { class: "lo", d: poly(onFace(SHEET, 0)) }, g);
  mk("path", { class: "sil", d: poly(onFace(SHEET, ET)) }, g);
  const addr = mk("path", { class: "nf", d: [[38, 34, 98], [38, 27, 90], [38, 20, 80]].map(([a, z, b]) => seg(Q(a, ET, z), Q(b, ET, z))).join("") }, g);
  const stamp = mk("path", { class: "nf", d: poly(rrect(EW - 30, EH - 30, EW - 10, EH - 8, 1.5, 3).map((q) => Q(q.u, ET, q.v))) }, g);
  mk("path", { class: "nf lo", d: poly(rrect(EW - 27, EH - 27, EW - 13, EH - 11, 1, 3).map((q) => Q(q.u, ET, q.v))) }, g);

  const op = spring(REST, { eps: 0.002 });
  let drawn = NaN, layer = -1;
  function draw() {
    const o = op.x, key = o + lift * 10;
    if (key === drawn) return;
    drawn = key;
    const phi = rad(clamp(o, 0, 1) * 180), s = Math.sin(phi), c = Math.cos(phi);
    flap.setAttribute("d", poly(FLAP.map(([u, w]) => Q(u, -0.5 - w * s, EH - w * c))));
    const up = L0 + clamp((o - 0.3) / 0.7, 0, 1) * lift;
    letter.setAttribute("d", poly(LETTER.map(([u, v]) => Q(u, 2, up + v))));
    lines.setAttribute("d", [10, 17, 24, 31].map((d, k) => seg(Q(16, 2, up + LH - d), Q(k === 3 ? 70 : EW - 16, 2, up + LH - d))).join(""));
  }
  function mark(seven) {
    if (seven === layer) return;
    layer = seven;
    letter.classList.toggle("hi", seven === 1);
    addr.classList.toggle("hi", seven === 0);
    stamp.classList.toggle("hi", seven === 0);
  }

  const B = register(stage, (dt) => { const m = stepS(op, dt); draw(); return m; });
  bag.add(B.unregister);

  // The pointer's height on the stage, between the rack and the top of the open flap, is how open the flap is.
  const yTop = P(EW / 2, 0, RH + EH + FD - 6)[1], yBot = P(EW / 2, ET, RH + 10)[1];
  bag.add(pointer(stage, {
    move: ([, y]) => {
      op.t = clamp((yBot - y) / (yBot - yTop), 0, 1);
      mark(op.t >= 0.5 ? 1 : 0);
      read.textContent = op.t >= 0.5 ? "layer 7 · letter" : "layer 4 · address";
      B.wake();
    },
    leave: () => { op.t = REST; mark(0); read.textContent = "rest"; B.wake(); },
  }));
  bag.add(() => svg.replaceChildren());
  mark(0);
  read.textContent = "rest";

  return {
    set: (v) => { lift = clamp(v, 0, 50); B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "envelope",
  means: "Layer 4 reads only the envelope: address and stamp. Layer 7 opens it and reads the letter. Raise the pointer to lift the flap.",
  rules: [3, 4, 5, 6],
  range: [20, 32, 44],
  tour: [[200, 230], [200, 70], [200, 150], null],
  mount,
});
