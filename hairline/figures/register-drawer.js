/**
 * Register drawer: a shop counter. In front, the cash register, with keys on
 * its sloped top and a small display. Right beside it, a small drawer of
 * sticky notes: the fresh clues, in reach at once. At the back, a tall
 * archive cabinet of four drawers: the whole history, far too slow to open
 * during a sale. The pointer picks a drawer; it slides out, bright, with what
 * it holds on top. At rest the sticky-note drawer is a little open. The
 * slider is how far a drawer comes out.
 *
 * The pattern: one of many, with a hit test on the drawers' rest fronts.
 */
const {
  Cam, fit, facing, hull, open, poly, proj, prism, rings, rrect, ringAt, run, seg,
  tdone, tset, tval, tween, disposer, mk, place, pointer, put, register, solid,
} = HL;

const CF = 26, CH = 60, SF = 84, NOTE = 0, REST_O = 12;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let travel = value;
  const C = Cam(45, 0.5, 1.75);
  fit(C, [[-6, -6, -4], [116, 76, -4], [116, -6, -4], [-6, 76, -4], [0, 0, CH], [SF + 26, 60, 0]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const box = (parent, x0, y0, x1, y1, z0, z1, r = 3, b = 1) => { const [o, i] = rings(x0, y0, x1, y1, r, b); const s = solid(parent); put(s, prism(P, front, o, i, z0, z1)); return s; };
  const onX = (x, rg) => poly(rg.map((q) => P(x, q.u, q.v)));

  // the counter top everything stands on
  box(g, -6, -6, 116, 76, -4, 0, 8, 2);

  /** A drawer in a case whose front is the plane x = f: y0..y1 across, z0..z1 high. */
  function drawer(f, y0, y1, z0, z1, contents) {
    const grp = mk("g", {}, g), s = solid(grp), face = mk("path", { class: "nf lo" }, grp), pull = mk("path", { class: "nf" }, grp);
    const top = mk("path", { class: "nf lo" }, grp);
    const d = { f, y0, y1, z0, z1, s, face, pull, top, o: tween(0), drawn: NaN };
    d.draw = (o) => {
      if (o === d.drawn) return;
      d.drawn = o;
      const x = f + o, ym = (y0 + y1) / 2, zm = (z0 + z1) / 2;
      if (o > 0.5) { const [r, i] = rings(f - 1, y0, x, y1, 1.6, 0.6); put(s, prism(P, front, r, i, z0, z1)); }
      else put(s, { sil: "", crease: "" });
      face.setAttribute("d", onX(x, rrect(y0 + 1.5, z0 + 1.5, y1 - 1.5, z1 - 1.5, 1.4, 3)));
      pull.setAttribute("d", seg(P(x, ym - 4, zm), P(x, ym + 4, zm)));
      top.setAttribute("d", o > 6 ? contents(o) : "");
    };
    return d;
  }

  // the archive cabinet at the back, four drawers high; open, a drawer shows its packed files
  box(g, 0, 4, CF, 46, 0, CH, 3, 1.2);
  const files = (zt, y0, y1) => (o) => { let p = ""; for (let x = CF + 2; x < CF + o - 1; x += 3) p += seg(P(x, y0 + 3, zt), P(x, y1 - 3, zt)); return p; };
  const cab = [0, 1, 2, 3].map((k) => { const z0 = 2 + k * 14.5, z1 = z0 + 13; return drawer(CF, 8, 42, z0, z1, files(z1, 8, 42)); });

  // the register: a body, a sloped top with keys, a display on a post, a cash drawer in front
  box(g, 54, 8, 84, 40, 0, 13, 3, 1);
  const slope = mk("path", {}, g);
  slope.setAttribute("d", poly(hull(ringAt(P, rrect(54, 8, 84, 40, 3, 3), 13).concat(ringAt(P, rrect(54, 8, 66, 40, 3, 3), 23)))));
  mk("path", { d: open(ringAt(P, run(rrect(54, 8, 66, 40, 3, 3), front), 23)), class: "nf lo" }, g);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) place(mk("circle", { r: 1.3, class: "dot off" }, g), P(70 + i * 4.5, 14 + j * 6.5, 23 - (70 + i * 4.5 - 66) * (10 / 18)));
  box(g, 58, 21, 62, 27, 23, 31, 1.5, 0.6);
  box(g, 55, 15, 64, 33, 31, 38, 2, 0.8);
  mk("path", { d: onX(84, rrect(12, 3, 36, 9, 1.5, 3)), class: "nf lo" }, g);

  // the sticky-note drawer, right beside the register; open, it shows its stack of notes
  box(g, 60, 46, SF, 72, 0, 16, 3, 1);
  // only the part of the stack that has come out of the case is drawn: the rest is still inside it
  const notes = (o) => [0, 1, 2].map((k) => {
    const x0 = Math.max(SF + 1, SF + o - 15 + k * 1.5), x1 = SF + o - 3 + k * 1.5 - (k === 2 ? 3 : 0);
    return x1 - x0 < 2 ? "" : poly(ringAt(P, rrect(x0, 51 + k * 2, x1, 63 + k * 2, 1.2, 2), 14 + k * 1.2));
  }).join("");
  const sticky = drawer(SF, 48, 70, 2, 14, notes);
  sticky.top.setAttribute("class", "");
  const all = [sticky, ...cab];

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const d of all) { d.draw(tval(d.o, now)); if (!tdone(d.o, now)) moving = true; }
    return moving;
  });
  bag.add(B.unregister);

  // hit: the drawers' fronts in their rest pose, which never moves
  const centres = all.map((d, k) => P(d.f + (k === NOTE ? REST_O : 0), (d.y0 + d.y1) / 2, (d.z0 + d.z1) / 2));
  function hit([x, y]) {
    let best = -1, bd = 26;
    centres.forEach((c, k) => { const dd = Math.hypot(c[0] - x, c[1] - y); if (dd < bd) { bd = dd; best = k; } });
    return best;
  }

  let act = -2;
  function setActive(a, force) {
    if (a === act && !force) return;
    const now = performance.now();
    act = a;
    all.forEach((d, k) => {
      tset(d.o, a < 0 ? (k === NOTE ? REST_O : 0) : k === a ? travel : 0, now, 0);
      d.s.sil.classList.toggle("hi", k === (a < 0 ? NOTE : a));
    });
    read.textContent = a < 0 ? "rest" : a === NOTE ? "online · 3 ms" : "offline · slow";
    B.wake();
  }
  setActive(-1);

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { travel = v; setActive(act, true); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "register-drawer",
  means: "Fresh clues sit on sticky notes in a small drawer by the register, quick to grab. The full history fills a big slow cabinet behind.",
  rules: [1, 4, 5, 9],
  range: [12, 18, 24],
  tour: [[221, 233], [176, 125], [176, 168], null],
  mount,
});
