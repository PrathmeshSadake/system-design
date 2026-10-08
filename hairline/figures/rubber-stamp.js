/**
 * Rubber stamp: a stamp with a round knob, a neck and a block, over a sheet on
 * a desk pad. The sheet already carries one mark, and a row of dots on the pad
 * counts the presses so far. The pointer over the sheet presses the stamp
 * down; taking it off the sheet lifts it. Every press adds a dot, but it lands
 * on the same mark, so the sheet only ever shows one: doing it twice is the
 * same as doing it once. The slider is how high the stamp lifts.
 */
const {
  Cam, circ, clamp, extremes, facing, fit, hull, open, poly, prism, proj, rings, ringAt, rrect, run, unproj,
  tween, tset, tval, tdone, flatDot, mk, place, pointer, put, register, disposer, solid,
} = HL;

const SW = 92, SD = 72, MX = 46, MY = 38, BW = 34, BD = 26, TALLY = 8;
const at = (ring, x, y) => ring.map((q) => ({ ...q, u: q.u + x, v: q.v + y }));

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lift = value, pressed = false, presses = 3, onSheet = false;
  const C = Cam(45, 0.5, 1.7);
  fit(C, [[-12, -12, -4], [SW + 12, SD + 22, -4], [SW + 12, -12, -4], [-12, SD + 22, -4], [MX, MY, 28 + 34]], 200, 170);
  const P = proj(C), front = facing(C);
  const box = (el, x0, y0, x1, y1, z0, z1, r, b) => { const [a, c] = rings(x0, y0, x1, y1, r, b); put(el, prism(P, front, a, c, z0, z1)); };
  const g = mk("g", {}, svg);

  // The desk pad, the sheet with its ruled lines, the one mark, and the tally of presses.
  box(solid(g), -12, -12, SW + 12, SD + 22, -4, 0, 9, 2.2);
  const sheet = solid(g);
  box(sheet, 0, 0, SW, SD, 0, 1.2, 1.5, 0.6);
  mk("path", { d: [8, 15, 22].map((y) => open([P(10, y, 1.2), P(SW - (y === 22 ? 40 : 10), y, 1.2)])).join(""), class: "nf lo" }, g);
  const mark = [
    mk("path", { d: poly(ringAt(P, rrect(MX - 13, MY - 9, MX + 13, MY + 9, 4, 4), 1.2)), class: "nf hi" }, g),
    mk("path", { d: poly(ringAt(P, at(circ(5, 16), MX, MY), 1.2)), class: "nf hi" }, g),
  ];
  const tally = [];
  for (let k = 0; k < TALLY; k++) { const d = flatDot(g, C, 1.8, "dot off"); place(d, P(8 + k * 10, SD + 11, 0)); tally.push(d); }

  // The stamp: dashed drops from its block to the sheet, the rubber, the block, the neck, a flared knob.
  const foot = rrect(MX - BW / 2, MY - BD / 2, MX + BW / 2, MY + BD / 2, 5, 4);
  const [lx, rx] = extremes(P, foot);
  const drops = mk("path", { class: "nf dash" }, g);
  const parts = [solid(g), solid(g), solid(g), solid(g)];
  const knobFoot = at(circ(5, 16), MX, MY), knobTop = at(circ(10, 16), MX, MY), knobIn = at(circ(8.6, 16), MX, MY);
  function drawStamp(h) {
    drops.setAttribute("d", h < 3 ? "" : [lx, rx].map((q) => open([P(q.u, q.v, h + 2), P(q.u, q.v, 1.2)])).join(""));
    box(parts[0], MX - 13, MY - 9, MX + 13, MY + 9, h, h + 2, 4, 0.8);
    box(parts[1], MX - BW / 2, MY - BD / 2, MX + BW / 2, MY + BD / 2, h + 2, h + 11, 5, 1.6);
    box(parts[2], MX - 5, MY - 4, MX + 5, MY + 4, h + 11, h + 22, 3, 1);
    put(parts[3], { sil: poly(hull(ringAt(P, knobFoot, h + 22).concat(ringAt(P, knobTop, h + 32)))), crease: open(ringAt(P, run(knobIn, front), h + 32)) });
  }

  const z = tween(lift);
  let drawn = NaN;
  const B = register(stage, (_dt, now) => {
    const h = tval(z, now);
    if (h !== drawn) { drawn = h; drawStamp(h); }
    return !tdone(z, now);
  });
  bag.add(B.unregister);

  function show() {
    const now = performance.now();
    tset(z, pressed ? 1.2 : lift, now, 0);
    mark.forEach((m) => m.classList.toggle("hi", !pressed));
    parts.forEach((p) => p.sil.classList.toggle("hi", pressed));
    tally.forEach((d, k) => d.setAttribute("class", k < Math.min(presses, TALLY) ? "dot m" : "dot off"));
    read.textContent = onSheet ? `press ${presses} · 1 mark` : "rest";
    B.wake();
  }

  /** On the sheet or not, read on the sheet's plane, which never moves. */
  function hit(p) {
    const [x, y] = unproj(C, p[0], p[1], 1.2);
    return x >= -2 && x <= SW + 2 && y >= -2 && y <= SD + 2;
  }
  function onPoint(on) {
    if (on === onSheet) return;
    onSheet = on;
    if (on && !pressed) presses++;
    pressed = on;
    show();
  }

  show();
  bag.add(pointer(stage, { move: (p) => onPoint(hit(p)), leave: () => onPoint(false) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { lift = clamp(v, 4, 40); show(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "rubber-stamp",
  means: "A rubber stamp over a sheet. Point at the sheet to press it: each press adds a dot to the count, but the sheet still has just one mark.",
  rules: [1, 4, 5, 10],
  range: [10, 18, 28],
  tour: [[206, 204], [90, 185], [242, 198], null],
  mount,
});
