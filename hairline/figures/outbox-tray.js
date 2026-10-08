/**
 * Outbox tray: a record book lies open on the desk beside an outbox tray of
 * standing letters. Each row in the book was written in the same go as the
 * letter behind it, so a row and its letter are one thing and light together.
 * The pointer picks a row, in the book or by its letter; after a moment the
 * relay lifts that letter out of the tray to send it. At rest the newest row
 * and its letter are bright, still waiting. The slider is the relay's wait, in ms.
 */
const {
  Cam, facing, fillet, fit, hull, open, poly, prism, proj, rad, ringAt, rings, rrect, run, seg, solid, put, mk, place, unproj,
  tween, tset, tval, tdone, register, pointer, disposer,
} = HL;

const N = 5, LW = 34, LH = 24, G = 10, LEAN = -14, LIFT = 50;
const TX0 = 64, TX1 = TX0 + LW + 10, TY0 = -8, TY1 = (N - 1) * G + 8, WH = 13, WT = 2.4;
const BX = 0, BY = 30, BW = 48, BD = 50, BT = 4;

/** The tray, fixed: `far` is painted before the letters, `near` after them (after Riffle's tray). */
function tray(P, front) {
  const outer = rrect(TX0, TY0, TX1, TY1, 6, 6), inner = rrect(TX0 + WT, TY0 + WT, TX1 - WT, TY1 - WT, 6 - WT, 6);
  const LR = (pts) => (pts[0][0] <= pts[pts.length - 1][0] ? pts : pts.slice().reverse());
  const iF = LR(ringAt(P, run(inner, front), WH)), oT = LR(ringAt(P, run(outer, front), WH)), oB = LR(ringAt(P, run(outer, front), 0));
  return {
    far: [[poly(hull(ringAt(P, outer, 0).concat(ringAt(P, outer, WH)))), "sil"], [poly(ringAt(P, inner, WH)), "nf"]],
    near: [[poly([...iF, oT[oT.length - 1], ...oB.slice().reverse(), oT[0]]), "fo"], [open(oT), "nf lo"], [open(iF), "nf"], [open([oT[0], ...oB, oT[oT.length - 1]]), "nf sil"]],
  };
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let wait = value;
  const C = Cam(45, 0.5, 2.3);
  fit(C, [[BX, BY + BD, 0], [BX, BY, 0], [TX1, TY0, 0], [TX1, TY1, 0], [TX0, TY0, LIFT + LH + 2]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // the record book: a cover, a page block, the spine, and one written row per letter, each with a bullet
  const [cr, ci] = rings(BX - 2, BY - 2, BX + BW + 2, BY + BD + 2, 2.4, 1);
  put(solid(g), prism(P, front, cr, ci, 0, 1.6));
  const [pr, pi] = rings(BX, BY, BX + BW, BY + BD, 2, 0.9);
  put(solid(g), prism(P, front, pr, pi, 1.6, BT));
  mk("path", { d: seg(P(BX + BW / 2, BY + 2, BT), P(BX + BW / 2, BY + BD - 2, BT)), class: "nf lo" }, g);
  const rowY = (i) => BY + 8 + i * 8.5;
  const rows = Array.from({ length: N }, (_, i) => {
    const y = rowY(i), len = [0.85, 0.6, 0.75, 0.9, 0.65][i];
    const line = mk("path", { d: seg(P(BX + 8, y, BT), P(BX + 8 + len * (BW - 14), y, BT)), class: "nf" }, g);
    const dot = mk("circle", { r: 1.2, class: "dot m" }, g);
    place(dot, P(BX + 4.5, y, BT));
    return { line, dot };
  });

  // the tray and its letters, back to front
  const tp = tray(P, front);
  for (const [d, cls] of tp.far) mk("path", { d, class: cls }, g);
  const flap = (w) => [w(0, LH), w(LW / 2, LH * 0.48), w(LW, LH)];
  const shape = fillet([[0, 0], [LW, 0], [LW, LH], [0, LH]], [1.5, 1.5, 1.5, 1.5]);
  const letters = Array.from({ length: N }, (_, i) => {
    const grp = mk("g", {}, g);
    return { i, face: mk("path", { class: "sil" }, grp), v: mk("path", { class: "nf" }, grp), up: tween(0), a: tween(LEAN), drawn: "" };
  });
  for (const [d, cls] of tp.near) mk("path", { d, class: cls }, g);

  /** Letter i leaning back, lifted by `lift` and stood upright as it rises. */
  function draw(L, now) {
    const e = tval(L.up, now), a = tval(L.a, now), key = e + "," + a;
    if (key === L.drawn) return;
    L.drawn = key;
    const th = a * (1 - e), s = Math.sin(rad(th)), c = Math.cos(rad(th));
    const w = (u, v) => P(TX0 + 5 + u, L.i * G + v * s, 1.5 + e * LIFT + v * c);
    L.face.setAttribute("d", poly(shape.map(([u, v]) => w(u, v))));
    L.v.setAttribute("d", open(flap(w)));
  }
  const say = () => { read.textContent = act < 0 ? "rest" : `row ${act + 1} · ${tval(letters[act].up, performance.now()) > 0.98 ? "sent" : "saved"}`; };
  let act = -2;
  const B = register(stage, (_dt, now) => {
    let m = false;
    for (const L of letters) { draw(L, now); if (!tdone(L.up, now) || !tdone(L.a, now)) m = true; }
    if (act >= 0) say();
    return m;
  });
  bag.add(B.unregister);

  function choose(k) {
    if (k === act) return;
    act = k;
    const now = performance.now(), lit = k < 0 ? N - 1 : k;
    letters.forEach((L, i) => {
      // the row and its letter were saved together; the relay comes for the letter later
      tset(L.up, i === k ? 1 : 0, now, i === k ? wait : 0);
      // the letters around it part, spreading out from it, so the relay can reach in
      tset(L.a, k < 0 || i === k ? LEAN : i < k ? -30 : 14, now, Math.abs(i - (k < 0 ? 0 : k)) * 40);
      L.face.classList.toggle("hi", i === lit);
      L.v.classList.toggle("hi", i === lit);
      rows[i].line.classList.toggle("hi", i === lit);
      rows[i].dot.setAttribute("class", i === lit ? "dot" : "dot m");
    });
    say();
    B.wake();
  }
  choose(-1);

  // letters are picked by their resting top edge, nearest on screen; rows by the book's page
  const tops = letters.map((L) => P(TX0 + 5 + LW / 2, L.i * G + LH * Math.sin(rad(LEAN)), 1.5 + LH * Math.cos(rad(LEAN))));
  const trayBox = hull([P(TX0, TY0, 0), P(TX1, TY0, 0), P(TX1, TY1, 0), P(TX0, TY1, 0), P(TX0, TY0, LH + 4), P(TX1, TY0, LH + 4), P(TX1, TY1, WH)]);
  const inside = ([x, y], pl) => {
    let c = false;
    for (let i = 0, j = pl.length - 1; i < pl.length; j = i++) if ((pl[i][1] > y) !== (pl[j][1] > y) && x < ((pl[j][0] - pl[i][0]) * (y - pl[i][1])) / (pl[j][1] - pl[i][1]) + pl[i][0]) c = !c;
    return c;
  };
  bag.add(pointer(stage, {
    move: (p) => {
      const [x, y] = unproj(C, p[0], p[1], BT);
      if (x > BX - 2 && x < BX + BW + 2 && y > BY - 2 && y < BY + BD + 2) return choose(Math.max(0, Math.min(N - 1, Math.round((y - BY - 8) / 8.5))));
      if (!inside(p, trayBox)) return choose(-1);
      let k = 0;
      tops.forEach((t, i) => { if (Math.hypot(t[0] - p[0], t[1] - p[1]) < Math.hypot(tops[k][0] - p[0], tops[k][1] - p[1])) k = i; });
      choose(k);
    },
    leave: () => choose(-1),
  }));
  bag.add(() => svg.replaceChildren());

  return { set: (v) => { wait = v; }, destroy: bag.dispose };
}

hairline({
  name: "outbox-tray",
  means: "A row in the book and its letter in the outbox are saved in one go. Point at a row: soon a helper lifts its letter out to send.",
  rules: [1, 4, 5, 8],
  range: [150, 450, 900],
  tour: [[130, 200], [250, 110], [290, 150], null],
  mount,
});
