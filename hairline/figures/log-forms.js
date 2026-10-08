/**
 * Log forms: six log lines, each a ruled form strip with the same four fields
 * in the same places: time, level, service, trace id. Each field is a raised
 * tile holding its value (a dim rule of its own length, or a dot for the
 * level). The pointer picks a column and that field lifts out of every line
 * together, staggered outwards from the line under the pointer. At rest the
 * trace id column stands a little proud, bright. The slider is the lift.
 */
const {
  Cam, facing, fit, prism, proj, rings, rrect, poly, seg, unproj,
  tween, tset, tval, tdone, flatDot, mk, place, pointer, put, register, disposer, solid,
} = HL;

const NAMES = ["time", "level", "service", "trace_id"];
const COLS = [[4, 30], [34, 47], [51, 79], [83, 113]], W = 117;
const ROWS = 6, PITCH = 15, DEPTH = 11, PT = 1.6, TH = 2.2, RESTC = 3, RESTF = 0.4;
/** A fixed spread of value lengths, so each line holds its own values in the same fields. */
const LEN = (j, c) => 0.35 + ((j * 7 + c * 3) % 5) * 0.13;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lift = value;
  const C = Cam(45, 0.5, 2.05);
  const Y1 = (ROWS - 1) * PITCH + DEPTH;
  fit(C, [[-3, -3, 0], [W + 3, -3, 0], [-3, Y1 + 3, 0], [W + 3, Y1 + 3, 0], [0, 0, PT + TH + 20]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  const tiles = [];
  for (let j = 0; j < ROWS; j++) {
    const y0 = j * PITCH, rg = mk("g", {}, g);
    const [pr, pi] = rings(0, y0, W, y0 + DEPTH, 2.4, 1);
    put(solid(rg), prism(P, front, pr, pi, 0, PT));
    // the form's punched margin: two holes at its left end
    for (const v of [y0 + 3.5, y0 + 7.5]) place(flatDot(rg, C, 0.7, "dot off"), P(1.8, v, PT));
    COLS.forEach(([x0, x1], c) => {
      const s = solid(rg), [ring, inner] = rings(x0, y0 + 2, x1, y0 + DEPTH - 2, 1.8, 0.8);
      const val = c === 1 ? flatDot(rg, C, 1.1, "dot m") : mk("path", { class: "nf" }, rg);
      tiles.push({ j, c, s, ring, inner, val, x0, x1, y0, t: tween(c === RESTC ? RESTF : 0), drawn: NaN });
    });
  }

  function draw(T, f) {
    const z0 = PT + lift * f;
    if (z0 === T.drawn) return;
    T.drawn = z0;
    put(T.s, prism(P, front, T.ring, T.inner, z0, z0 + TH));
    const cy = T.y0 + DEPTH / 2, top = z0 + TH;
    if (T.c === 1) place(T.val, P((T.x0 + T.x1) / 2, cy, top));
    else T.val.setAttribute("d", seg(P(T.x0 + 3, cy, top), P(T.x0 + 3 + (T.x1 - T.x0 - 6) * LEN(T.j, T.c), cy, top)));
  }

  const B = register(stage, (_dt, now) => {
    let m = false;
    for (const T of tiles) { draw(T, tval(T.t, now)); if (!tdone(T.t, now)) m = true; }
    return m;
  });
  bag.add(B.unregister);

  // Hit test on the forms' resting top plane: the column by x (gaps go to the nearer field), the line by y.
  function hit([sx, sy]) {
    const [x, y] = unproj(C, sx, sy, PT + TH);
    if (x < -4 || x > W + 4 || y < -4 || y > Y1 + 4) return null;
    let c = 0, bd = 1e9;
    COLS.forEach(([x0, x1], k) => { const d = x < x0 ? x0 - x : x > x1 ? x - x1 : 0; if (d < bd) { bd = d; c = k; } });
    return { c, j: Math.max(0, Math.min(ROWS - 1, Math.floor(y / PITCH))) };
  }

  let act = null;
  function choose(h) {
    const key = h ? h.c : -1;
    if (act !== null && key === act.c) return;
    const now = performance.now(), from = h ? h.j : act && act.j >= 0 ? act.j : 0, c = h ? h.c : RESTC;
    act = h ? h : { c: -1, j: -1 };
    for (const T of tiles) {
      const want = T.c !== c ? 0 : h ? 1 : RESTF;
      tset(T.t, want, now, Math.abs(T.j - from) * 40);
      T.s.sil.classList.toggle("hi", T.c === c);
    }
    read.textContent = h ? NAMES[c] : "rest";
    B.wake();
  }
  choose(null);

  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(null) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { lift = v; tiles.forEach((T) => { T.drawn = NaN; }); B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "log-forms",
  means: "Each log line is a form with the same boxes in the same places. Point at a box and that field lifts out of every line at once.",
  rules: [1, 2, 4, 10],
  range: [8, 14, 20],
  tour: [[170, 133], [160, 171], [217, 177], null],
  mount,
});
