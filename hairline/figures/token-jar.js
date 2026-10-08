/**
 * Token jar: a low rounded jar that holds five tokens standing in a row, and
 * a slow drip that puts one back at a time until it is full again. Each ask
 * takes a token out, and an ask with no token left is turned away. While the
 * pointer is near the jar it asks four times a second, faster than the drip,
 * so the jar runs dry and then each new token is taken as soon as it lands.
 * Leave it and the drip fills it back up. The token that goes next is the
 * bright one. The slider is the drip, in tokens a second.
 */
const {
  Cam, clamp, facing, fit, hull, open, poly, proj, rad, ringAt, rrect, run,
  tween, tset, tval, tdone, disposer, mk, pointer, register,
} = HL;

const N = 5, SP = 24, R = 11, TK = 2.4, X0 = -6, X1 = N * SP + 2, Y0 = -8, Y1 = 14, WH = 12, WR = 9, WT = 2.4;
const YC = 3, ZC = R + 1.5, UP = 38, ASK = 0.25, LEAN = [-7, 3, -4, 6, -1];
const cx = (i) => i * SP + SP / 2 - 2;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let drip = value;
  const C = Cam(45, 0.5, 2.0);
  fit(C, [[X0, Y0, 0], [X1, Y1, 0], [X1, Y0, 0], [X0, Y1, 0], [cx(0), YC, ZC + R + UP], [cx(N - 1), YC, ZC + R + UP]], 200, 166);
  const P = proj(C), front = facing(C);
  const outer = rrect(X0, Y0, X1, Y1, WR, 6), inner = rrect(X0 + WT, Y0 + WT, X1 - WT, Y1 - WT, WR - WT, 6);
  const LR = (pts) => (pts[0][0] <= pts[pts.length - 1][0] ? pts : pts.slice().reverse());
  const g = mk("g", {}, svg);

  // the jar's far half: body, the rim's inner edge, the floor seam along the far walls
  mk("path", { class: "sil", d: poly(hull(ringAt(P, outer, 0).concat(ringAt(P, outer, WH)))) }, g);
  mk("path", { class: "nf", d: poly(ringAt(P, inner, WH)) }, g);
  mk("path", { class: "nf lo", d: open(ringAt(P, run(inner, (q) => !front(q)), 2)) }, g);

  // the tokens: a disc standing across y, its back for thickness, its face, and the raised rim on the face
  const tokens = [];
  for (let i = 0; i < N; i++) {
    const grp = mk("g", {}, g);
    tokens.push({
      back: mk("path", { class: "lo" }, grp), face: mk("path", { class: "sil" }, grp), rim: mk("path", { class: "nf lo" }, grp),
      grp, v: tween(0), here: true, drawn: NaN,
    });
  }
  const disc = (i, r, dy, v) => {
    const s = Math.sin(rad(LEAN[i])), c = Math.cos(rad(LEAN[i])), pts = [];
    for (let k = 0; k < 40; k++) {
      const a = (k / 40) * Math.PI * 2, u = r * Math.cos(a), w = R + r * Math.sin(a);
      pts.push(P(cx(i) + u, YC + dy + w * s, 1.5 + w * c + v * UP));
    }
    return poly(pts);
  };
  function draw(t, i, v) {
    if (v === t.drawn) return;
    t.drawn = v;
    t.grp.setAttribute("display", v > 0.97 ? "none" : "inline");
    t.back.setAttribute("d", disc(i, R, -TK, v));
    t.face.setAttribute("d", disc(i, R, 0, v));
    t.rim.setAttribute("d", disc(i, R - 2.6, 0, v));
  }

  // the jar's near half: one opaque piece from the rim's inner edge down to the floor, and a lip round its rim
  const iF = LR(ringAt(P, run(inner, front), WH)), oT = LR(ringAt(P, run(outer, front), WH)), oB = LR(ringAt(P, run(outer, front), 0));
  mk("path", { class: "fo", d: poly([...iF, oT[oT.length - 1], ...oB.slice().reverse(), oT[0]]) }, g);
  mk("path", { class: "nf lo", d: open(oT) }, g);
  mk("path", { class: "nf", d: open(iF) }, g);
  mk("path", { class: "nf sil", d: open([oT[0], ...oB, oT[oT.length - 1]]) }, g);
  mk("path", { class: "nf lo", d: open(LR(ringAt(P, run(outer, front), WH - 3))) }, g);

  let near = false, dAcc = 0, aAcc = 0, lit = -2;
  const count = () => tokens.filter((t) => t.here).length;
  function mark() {
    // the token that goes next: the last one seated
    let k = -1;
    tokens.forEach((t, i) => { if (t.here) k = i; });
    if (k === lit) return;
    lit = k;
    tokens.forEach((t, i) => t.face.classList.toggle("hi", i === k));
  }
  function say() { read.textContent = near ? `tokens ${count()} of ${N}` : "rest"; }

  const B = register(stage, (dt, now) => {
    let moving = false;
    tokens.forEach((t, i) => { draw(t, i, tval(t.v, now)); if (!tdone(t.v, now)) moving = true; });
    // the drip: one token back every 1 / drip seconds, into the first empty place
    if (count() < N) {
      dAcc += dt;
      if (dAcc >= 1 / drip) {
        dAcc = 0;
        const i = tokens.findIndex((t) => !t.here);
        tokens[i].here = true;
        tset(tokens[i].v, 0, now, 0);
      }
      moving = true;
    } else dAcc = 0;
    // the asks: four a second while the pointer is near; each takes the last seated token, or is turned away
    if (near) {
      aAcc += dt;
      if (aAcc >= ASK) {
        aAcc = 0;
        let k = -1;
        tokens.forEach((t, i) => { if (t.here && tdone(t.v, now)) k = i; });
        if (k >= 0) { tokens[k].here = false; tset(tokens[k].v, 1, now, 0); }
      }
      moving = true;
    }
    mark();
    say();
    return moving;
  });
  bag.add(B.unregister);

  // Near means within the jar's rest outline on screen, grown by a margin: nothing that moves is tested.
  const box = hull(ringAt(P, outer, 0).concat(ringAt(P, outer, WH + R * 2 + 4)));
  const xs = box.map((p) => p[0]), ys = box.map((p) => p[1]);
  const bx = [Math.min(...xs) - 16, Math.max(...xs) + 16, Math.min(...ys) - 24, Math.max(...ys) + 16];
  bag.add(pointer(stage, {
    move: ([x, y]) => { near = x > bx[0] && x < bx[1] && y > bx[2] && y < bx[3]; say(); B.wake(); },
    leave: () => { near = false; say(); B.wake(); },
  }));
  bag.add(() => svg.replaceChildren());
  mark();
  say();

  return {
    set: (v) => { drip = clamp(v, 0.1, 4); B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "token-jar",
  means: "A jar holds five tokens and a drip adds one back each second. Every ask takes a token. Hover near the jar to ask faster than the drip.",
  rules: [4, 5, 7, 8],
  range: [0.5, 1, 2],
  tour: [[200, 170], [120, 60], null],
  mount,
});
