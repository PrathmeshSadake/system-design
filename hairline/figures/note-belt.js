/**
 * Note belt: a conveyor carries notes past three in-trays, one per worker.
 * Each note leaves the belt into exactly one tray, in turn, and lies there
 * until that worker's next note arrives. The belt never stops; hovering slows
 * its clock (a spring on the rate) so one note can be followed, and the note
 * nearest the pointer takes the bright edge. At rest the bright goes to the
 * note being taken. The slider is the slowed rate.
 */
const {
  Cam, facing, fit, hull, open, poly, prism, proj, rings, ringAt, run, seg,
  spring, stepS, disposer, mk, place, pointer, put, register, solid,
} = HL;

const BX0 = -72, BX1 = 72, BW = 13, BZ = 10, X0 = -60, V = 40, DT = 0.9;
const TX = [-34, 6, 46], TY0 = 21, TY1 = 47, WH = 4, NY = 34, NW = 10, NH = 7, POOL = 9;

/** A run of points ordered left to right on screen. */
const LR = (pts) => (pts[0][0] <= pts[pts.length - 1][0] ? pts : pts.slice().reverse());

/** Where note n is at belt time T: [x, y, z, worker], or null when it is not on the stage. */
function where(n, T) {
  const w = ((n % 3) + 3) % 3, a = T - n * DT, d = a * V, L1 = TX[w] - X0, L2 = NY;
  if (a < 0 || a > 3 * DT + L1 / V) return null;
  if (d < L1) return [X0 + d, 0, BZ, w, 0];
  const p = Math.min(1, (d - L1) / L2);
  return [TX[w], p * L2, BZ - (BZ - 1.5) * Math.min(1, p * p * 1.6), w, p < 1 ? 1 : 2];
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let slow = value;
  const C = Cam(45, 0.5, 2.3);
  fit(C, [[BX0, -BW, 0], [BX1, BW, 0], [BX1, -BW, BZ], [TX[0] - 14, TY1, 0], [TX[2] + 14, TY1, 0], [BX0, BW, BZ]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // the belt: a band round two rollers, and the slats that run with it
  const [br, bi] = rings(BX0, -BW, BX1, BW, BW, 2);
  put(solid(g), prism(P, front, br, bi, 0, BZ));
  const slats = mk("path", { class: "nf lo" }, g);
  const onBelt = mk("g", {}, g);

  // the three in-trays: back half, a layer for the note inside, front wall, and k dots for worker k
  const trays = TX.map((tx, k) => {
    const outer = rings(tx - 14, TY0, tx + 14, TY1, 4, 2.2)[0], inner = rings(tx - 14, TY0, tx + 14, TY1, 4, 2.2)[1];
    mk("path", { d: poly(hull(ringAt(P, outer, 0).concat(ringAt(P, outer, WH)))), class: "sil" }, g);
    mk("path", { d: poly(ringAt(P, inner, WH)), class: "nf" }, g);
    const layer = mk("g", {}, g);
    const iF = LR(ringAt(P, run(inner, front), WH)), oT = LR(ringAt(P, run(outer, front), WH)), oB = LR(ringAt(P, run(outer, front), 0));
    mk("path", { d: poly([...iF, oT[oT.length - 1], ...oB.slice().reverse(), oT[0]]), class: "fo" }, g);
    mk("path", { d: open(oT), class: "nf lo" }, g);
    mk("path", { d: open(iF), class: "nf" }, g);
    mk("path", { d: open([oT[0], ...oB, oT[oT.length - 1]]), class: "nf sil" }, g);
    for (let j = 0; j <= k; j++) place(mk("circle", { r: 1.2, class: "dot m" }, g), P(tx + (j - k / 2) * 4, TY1, WH / 2));
    return layer;
  });

  // a pool of notes, each moved between layers as it goes from the belt into a tray
  const notes = [];
  for (let i = 0; i < POOL; i++) { const el = solid(onBelt); notes.push({ el, ink: mk("path", { class: "nf lo" }, el.g), home: onBelt, key: "" }); }
  const [nr0, ni0] = rings(-NW, -NH, NW, NH, 1.6, 0.8);
  const shift = (ring, x, y) => ring.map((q) => ({ ...q, u: q.u + x, v: q.v + y }));

  const rate = spring(1, { eps: 0.002 });
  let T = 3 * DT + 4, over = null;

  function draw() {
    const off = ((T * V) % 12 + 12) % 12, s = [];
    for (let x = X0 - 6 + off; x < BX1 - 8; x += 12) s.push(seg(P(x, -BW + 3, BZ), P(x, BW - 3, BZ)));
    slats.setAttribute("d", s.join(""));
    const live = [];
    const last = Math.floor(T / DT);
    for (let n = last; n > last - POOL; n--) { const q = where(n, T); if (q) live.push([n, q]); }
    // the bright: the note nearest the pointer, or at rest the note being taken
    let best = null, bd = 6400;
    for (const [n, q] of live) {
      if (over) { const p = P(q[0], q[1], q[2]), d = (p[0] - over[0]) ** 2 + (p[1] - over[1]) ** 2; if (d < bd) { bd = d; best = n; } }
      else if (q[4] === 1 && (best === null || n > best)) best = n;
    }
    notes.forEach((nt, i) => {
      const hit = live.find(([n]) => ((n % POOL) + POOL) % POOL === i);
      if (!hit) { if (nt.key !== "") { nt.key = ""; put(nt.el, { sil: "", crease: "" }); nt.ink.setAttribute("d", ""); } return; }
      const [n, q] = hit, home = q[4] === 0 ? onBelt : trays[q[3]];
      if (home !== nt.home) { home.append(nt.el.g); nt.home = home; }
      const key = q.map((v) => v.toFixed(2)).join(",");
      if (key !== nt.key) { nt.key = key; put(nt.el, prism(P, front, shift(nr0, q[0], q[1]), shift(ni0, q[0], q[1]), q[2], q[2] + 1.4));
        // two lines of writing on the note
        const z = q[2] + 1.4;
        nt.ink.setAttribute("d", [-2, 2].map((dy, k) => seg(P(q[0] - 6, q[1] + dy, z), P(q[0] + (k ? 2 : 6), q[1] + dy, z))).join(""));
      }
      nt.el.sil.classList.toggle("hi", n === best);
    });
    if (over) {
      const q = best === null ? null : where(best, T);
      read.textContent = q ? `note ${((best % 9) + 9) % 9 + 1} · worker ${q[3] + 1}` : "slow";
    }
  }

  // ambient: the belt runs while the figure is on screen, at the rate's spring
  const B = register(stage, (dt) => { stepS(rate, dt); T += dt * rate.x; draw(); return true; });
  bag.add(B.unregister);

  read.textContent = "rest";
  bag.add(pointer(stage, {
    move: (p) => { over = p; rate.t = slow; B.wake(); },
    leave: () => { over = null; rate.t = 1; read.textContent = "rest"; B.wake(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { slow = v; if (over) rate.t = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "note-belt",
  means: "A belt of notes runs past three trays. Each note goes to just one worker, in turn. Hover to slow the belt and follow one note.",
  rules: [3, 4, 7, 10],
  range: [0.08, 0.2, 0.4],
  tour: [[140, 110], [163, 186], [228, 214], null],
  mount,
});
