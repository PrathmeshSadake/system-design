/**
 * Parcel route: a parcel rides a track past four little post offices. Every
 * office carries the same three-dot tracking number as the parcel's lid. Beside
 * each office stands a bar whose height is the time the parcel spent there.
 * The pointer picks an office: its bar rises to full height and takes the
 * bright edge, and the parcel slides along the track to it. At rest the
 * payment office's bar, the tallest, is bright. The slider is the bars' scale.
 */
const {
  Cam, facing, fit, prism, proj, rings, rrect, poly, unproj,
  tween, tset, tval, tdone, flatDot, mk, place, pointer, put, register, disposer, solid,
} = HL;

const NAMES = ["door", "cart", "payment", "email"], MS = [40, 90, 340, 60];
const N = 4, PITCH = 44, BW = 22, BD = 20, BH = 18, REST = 0.3, SLOW = 2;
const TY0 = 27, TY1 = 39, X0 = -8, X1 = (N - 1) * PITCH + 38;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let hmax = value;
  const C = Cam(45, 0.5, 1.95);
  fit(C, [[X0, -4, 0], [X1, -4, 0], [X0, TY1, 0], [X1, TY1, 0], [SLOW * PITCH + 29, 8, 4 + 96]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const box = (parent, x0, y0, x1, y1, r, b, z0, z1) => {
    const s = solid(parent), [ring, inner] = rings(x0, y0, x1, y1, r, b);
    put(s, prism(P, front, ring, inner, z0, z1));
    return s;
  };
  const code = (parent, cx, cy, z, cls) => [-3, 0, 3].map((d) => place(flatDot(parent, C, 0.85, cls), P(cx + d, cy, z)));

  // Office and bar, back to front along the row.
  const st = [];
  for (let i = 0; i < N; i++) {
    const x = i * PITCH, sg = mk("g", {}, g);
    box(sg, x, 0, x + BW, BD, 3, 1.2, 0, BH);
    const roof = box(sg, x - 3, -3, x + BW + 3, BD + 3, 3.5, 1.4, BH, BH + 3);
    const door = rrect(x + 7, 0, x + 15, 11, 2.5, 4).map((q) => P(q.u, BD, q.v));
    mk("path", { d: poly(door), class: "nf lo" }, sg);
    code(sg, x + BW / 2, BD / 2, BH + 3, "dot m");
    const [ring, inner] = rings(x + 26, 5, x + 33, 12, 2.2, 0.9);
    const bar = solid(sg);
    st.push({ x, roof, bar, ring, inner, h: tween(REST), drawn: NaN });
  }
  // The track, in front of every office, and the parcel riding it.
  box(g, X0, TY0, X1, TY1, 4, 1.4, 0, 3);
  mk("path", { d: poly(rrect(X0 + 4, TY0 + 4, X1 - 4, TY1 - 4, 2, 4).map((q) => P(q.u, q.v, 3))), class: "nf lo" }, g);
  const pg = mk("g", {}, g), lid = solid(pg), dots = [0, 1, 2].map(() => flatDot(pg, C, 0.85, "dot m"));
  const px = tween(SLOW * PITCH);
  let pDrawn = NaN;

  const barH = (i, f) => 3 + (MS[i] / 340) * hmax * f;
  function drawBar(s) {
    const i = st.indexOf(s), h = barH(i, s.hv);
    if (h === s.drawn) return;
    s.drawn = h;
    put(s.bar, prism(P, front, s.ring, s.inner, 0, h));
  }
  function drawParcel(x) {
    if (x === pDrawn) return;
    pDrawn = x;
    const [ring, inner] = rings(x + 5, TY0 + 2, x + 17, TY1 - 2, 2.4, 1);
    put(lid, prism(P, front, ring, inner, 3, 11));
    dots.forEach((d, k) => place(d, P(x + 8 + k * 3, (TY0 + TY1) / 2, 11)));
  }

  const B = register(stage, (_dt, now) => {
    let m = false;
    for (const s of st) { s.hv = tval(s.h, now); drawBar(s); if (!tdone(s.h, now)) m = true; }
    drawParcel(tval(px, now));
    return m || !tdone(px, now);
  });
  bag.add(B.unregister);

  // Hit test on the rest pose: the office whose centre is nearest the pointer's screen x, inside the row's band.
  const cx = st.map((s) => P(s.x + 16, 10, 0)[0]);
  const inRow = ([x, y]) => x > X0 - 4 && x < X1 + 4 && y > -8 && y < TY1 + 4;
  function hit([sx, sy]) {
    if (![0, BH + 3].some((z) => inRow(unproj(C, sx, sy, z)))) return -1;
    let best = -1, bd = 1e9;
    cx.forEach((c, i) => { const d = Math.abs(c - sx); if (d < bd) { bd = d; best = i; } });
    return best;
  }

  let act = null;
  function choose(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : SLOW;
    act = a;
    st.forEach((s, i) => {
      tset(s.h, i === a ? 1 : REST, now, Math.abs(i - from) * 40);
      s.bar.sil.classList.toggle("hi", a < 0 ? i === SLOW : i === a);
    });
    tset(px, (a < 0 ? SLOW : a) * PITCH, now, 0);
    read.textContent = a < 0 ? "rest" : `${NAMES[a]} · ${MS[a]}ms`;
    B.wake();
  }
  choose(-1);

  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { hmax = v; st.forEach((s) => { s.drawn = NaN; }); B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "parcel-route",
  means: "A parcel with one tracking number passes four stops. Point at a stop: its bar rises to show how long the parcel waited there.",
  rules: [1, 4, 5, 10],
  range: [56, 76, 96],
  tour: [[114, 114], [235, 175], [296, 205], null],
  mount,
});
