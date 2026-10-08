/**
 * Allowance jar: a glass jar of beads, the month's error budget (43 minutes of
 * allowed downtime). Rows of beads show through the glass, and four marks on
 * the glass measure it in tens of minutes. The pointer's x scrubs the day of
 * the month: the beads drain at the steady burn plus two bad days, when a
 * handful goes at once. At rest it is day 12. The slider is the steady burn,
 * in minutes a day.
 */
const {
  Cam, facing, fit, hull, open, poly, prism, proj, ringAt, rrect, run, clamp,
  spring, stepS, mk, place, pointer, put, register, disposer, solid,
} = HL;

const R = 29, RB = 27.5, ZB = 64, TOTAL = 43, ZPM = 56 / TOTAL, REST_DAY = 12;
const BAD = [[8, 12], [16, 8]];
const TOP = [[0, 0], ...[0, 1, 2, 3, 4, 5].map((k) => [10 * Math.cos(k * 1.047), 10 * Math.sin(k * 1.047)]),
  ...[0, 1, 2, 3, 4, 5, 6, 7].map((k) => [19.5 * Math.cos(k * 0.785 + 0.39), 19.5 * Math.sin(k * 0.785 + 0.39)])];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let burn = value;
  const C = Cam(45, 0.5, 2.55);
  fit(C, [[-R, -R, 0], [R, R, 0], [R, -R, 0], [-R, R, 0], [0, 0, ZB + 11]], 200, 166);
  const P = proj(C), front = facing(C);
  const circle = (r, n = 14) => rrect(-r, -r, r, r, r, n);
  const glass = circle(R), beads = circle(RB), beadIn = circle(RB - 1.6);
  const left = (d) => clamp(TOTAL - burn * d - BAD.reduce((s, [day, m]) => s + m * clamp(d - day + 0.5, 0, 1), 0), 0, TOTAL);

  const g = mk("g", {}, svg);
  // Glass first, behind everything: its outline and the far half of its shoulder.
  mk("path", { d: poly(hull(ringAt(P, glass, 0).concat(ringAt(P, glass, ZB)))), class: "nf sil" }, g);
  mk("path", { d: open(ringAt(P, run(glass, (q) => !front(q)), ZB)), class: "nf lo" }, g);
  // The beads inside: a pile, its side rows, its top.
  const pile = solid(g), rows = mk("g", {}, g), tops = TOP.map(() => mk("circle", { r: 1.25, class: "dot" }, g));
  // The near glass, in front of the beads: its shoulder and the four ten-minute marks.
  mk("path", { d: open(ringAt(P, run(glass, front), ZB)), class: "nf" }, g);
  for (let m = 1; m <= 4; m++) {
    const z = m * 10 * ZPM, a0 = m % 2 ? 1.65 : 1.8;
    const arc = [];
    for (let a = a0; a <= 2.15; a += 0.05) arc.push(P(R * Math.cos(a), R * Math.sin(a), z));
    mk("path", { d: open(arc), class: "nf" }, g);
  }
  // The neck and the screw lid.
  const neck = circle(22), lid = circle(24);
  put(solid(g), prism(P, front, neck, circle(20.6), ZB, ZB + 3));
  put(solid(g), prism(P, front, lid, circle(22.4), ZB + 3, ZB + 11));
  mk("path", { d: open(ringAt(P, run(lid, front), ZB + 7)), class: "nf lo" }, g);

  const day = spring(REST_DAY, { eps: 0.01 });
  let drawn = NaN, nRows = -1;
  function draw() {
    const h = Math.max(1.2, left(day.x) * ZPM);
    if (h === drawn) return;
    drawn = h;
    put(pile, prism(P, front, beads, beadIn, 0, h));
    TOP.forEach(([x, y], k) => { place(tops[k], P(x, y, h)); tops[k].setAttribute("class", h > 1.2 ? "dot" : "dot off"); });
    const n = Math.max(0, Math.floor((h - 4) / 6));
    if (n !== nRows) {
      nRows = n;
      rows.replaceChildren();
      for (let r = 0; r < n; r++) for (let k = 0; k < 6; k++) {
        const a = Math.PI / 4 + (k - 2.5) * 0.4 + (r % 2) * 0.2;
        place(mk("circle", { r: 1.1, class: "dot m" }, rows), P(RB * Math.cos(a), RB * Math.sin(a), 3 + r * 6));
      }
    }
  }
  draw();

  const B = register(stage, (dt) => { const m = stepS(day, dt); draw(); return m; });
  bag.add(B.unregister);

  // The day is read from the pointer's x alone, across a fixed band: nothing it reads moves.
  const x0 = P(-R, R, 0)[0] - 30, x1 = P(R, -R, 0)[0] + 30;
  function scrub(p) {
    if (!p) { day.t = REST_DAY; read.textContent = "rest"; B.wake(); return; }
    const d = Math.round(clamp((p[0] - x0) / (x1 - x0), 0, 1) * 30);
    day.t = d;
    read.textContent = `day ${d} · ${Math.round(left(d))} min`;
    B.wake();
  }

  bag.add(pointer(stage, { move: scrub, leave: () => scrub(null) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { burn = v; drawn = NaN; draw(); B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "allowance-jar",
  means: "A jar holds this month's 43 minutes of allowed mistakes. Slide across the month and watch the beads drain, fastest on the bad days.",
  rules: [3, 5, 8, 10],
  range: [0.4, 0.7, 1],
  tour: [[130, 160], [200, 160], [270, 160], null],
  mount,
});
