/**
 * Three lanes: three small belts ride side by side between the same two
 * machines, one belt for each stream, and each lane's pieces carry its dot
 * code on their lids. When a piece is lost it flies off its lane, a dashed
 * outline marks the gap, and only that lane stops to wait for the copy; the
 * other two keep moving. At rest lane 2 is waiting and is the bright one. The
 * pointer picks a lane: that lane loses a piece and waits, and the lane that
 * was waiting gets its copy dropped back in and moves on. The slider is the
 * belts' speed.
 */
const {
  Cam, clamp, facing, fit, flatDot, hull, open, place, poly, prism, proj, rings, rrect, run, unproj,
  spring, stepS, tween, tset, tval, disposer, mk, pointer, put, register, solid,
} = HL;

const H0 = 0, H1 = 200, HD = 36, HZ = 42, LW = 22, GAP = 7, ZB = 6, ZT = 13, PH = 7, PL = 16, SP = 26;
const NL = 3, N = 9, LOOP = N * SP, REST = 1, FLY = 46, MID = 92;
const YL = (j) => j * (LW + GAP), Y1 = YL(NL - 1) + LW;
const V = [0.612, 0.5]; // the direction to the camera, in (x, z)

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let rate = value;
  const C = Cam(45, 0.5, 1.4);
  fit(C, [[H0 - HD, -6, 0], [H1 + HD, Y1 + 6, 0], [H0 - HD, -6, HZ], [H1 + HD, -6, 0], [H0 - HD, Y1 + 6, 0], [H1 + HD, Y1 + 6, HZ]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const box = (x0, y0, x1, y1, z0, z1, r, b) => { const [o, i] = rings(x0, y0, x1, y1, r, b); return prism(P, front, o, i, z0, z1); };
  /** A belt lying along x at y0 to y1: a stadium profile in (x, z), carried across y. */
  const belt = (x0, x1, y0, y1) => {
    const r = (ZT - ZB) / 2, at = (ring, y) => ring.map((q) => P(q.u, y, q.v));
    const prof = rrect(x0, ZB, x1, ZT, r, 6), inner = rrect(x0 + 1, ZB + 1, x1 - 1, ZT - 1, r - 1, 6);
    return { sil: poly(hull(at(prof, y0).concat(at(prof, y1)))), crease: open(at(run(inner, (q) => q.nu * V[0] + q.nv * V[1] > 0), y1)) };
  };

  put(solid(g), box(H0 - HD + 6, -4, H1 + HD - 6, Y1 + 4, 0, ZB - 1, 4, 1.2));
  for (let j = 0; j < NL; j++) put(solid(g), belt(H0 - HD + 4, H1 + HD - 4, YL(j), YL(j) + LW));
  put(solid(g), box(H0 - HD, -6, H0, Y1 + 6, 0, HZ, 7, 2));
  for (let j = 0; j < NL; j++) mk("path", { class: "nf", d: poly(rrect(YL(j) + 1, ZT - 2, YL(j) + LW - 1, ZT + PH + 6, 3, 5).map((q) => P(H0, q.u, q.v))) }, g);

  const lanes = [];
  for (let j = 0; j < NL; j++) {
    const patch = solid(g);
    put(patch, box(H0, YL(j), H1, YL(j) + LW, ZB, ZT, 0.5, 0.4));
    const gap = mk("path", { class: "dash nf" }, g);
    const pieces = [];
    for (let i = 0; i < N; i++) {
      const anchor = mk("g", {}, g), el = solid(anchor), dots = [];
      for (let k = 0; k <= j; k++) dots.push(flatDot(el.g, C, 1.6, "dot m"));
      pieces.push({ i, anchor, el, dots, up: false });
    }
    lanes.push({ j, patch, gap, pieces, off: j * 9, speed: spring(rate, { eps: 0.05 }), lost: -1, lift: tween(0) });
  }
  put(solid(g), box(H1, -6, H1 + HD, Y1 + 6, 0, HZ, 7, 2));

  const xOf = (L, i) => ((i * SP + L.off) % LOOP) - (LOOP - (H1 - H0)) / 2;
  const hide = (el, h) => el.setAttribute("display", h ? "none" : "inline");

  function draw(L, now) {
    const y0 = YL(L.j) + 4, y1 = YL(L.j) + LW - 4, f = tval(L.lift, now);
    let gd = "";
    for (const p of L.pieces) {
      const x0 = xOf(L, p.i), lost = p.i === L.lost, z = ZT + (lost ? f * FLY : 0);
      const a = Math.max(x0, H0), b = Math.min(x0 + PL, H1), seen = b - a > 1.5 && !(lost && f > 0.97);
      put(p.el, seen ? box(lost ? x0 : a, y0, lost ? x0 + PL : b, y1, z, z + PH, 2.2, 0.8) : { sil: "", crease: "" });
      const cx = x0 + PL / 2;
      p.dots.forEach((d, k) => { hide(d, !seen || cx < H0 + 3 || cx > H1 - 3); place(d, P(cx, (y0 + y1) / 2 + (k - L.j / 2) * 5, z + PH)); });
      // a piece in flight is painted last; it comes back to its place when it lands
      const up = lost && f > 0.02;
      if (up !== p.up) { p.up = up; if (up) g.append(p.el.g); else p.anchor.append(p.el.g); }
      if (lost && f > 0.02) gd = poly(rrect(x0, y0, x0 + PL, y1, 2.2, 3).map((q) => P(q.u, q.v, ZT)));
    }
    L.gap.setAttribute("d", gd);
  }

  const B = register(stage, (dt, now) => {
    for (const L of lanes) {
      stepS(L.speed, dt);
      L.off = (L.off + L.speed.x * dt) % LOOP;
      draw(L, now);
    }
    return true;
  });
  bag.add(B.unregister);

  let wait = -1;
  /** Lane w loses the piece nearest the middle and waits; the lane that was waiting gets its copy and moves on. */
  function setWait(w) {
    if (w === wait) return;
    const now = performance.now();
    lanes.forEach((L) => {
      if (L.j === w) {
        let best = 0;
        L.pieces.forEach((p) => { if (Math.abs(xOf(L, p.i) - MID) < Math.abs(xOf(L, best) - MID)) best = p.i; });
        L.lost = best;
        tset(L.lift, 1, now, 0);
        L.speed.t = 0;
      } else if (L.j === wait) {
        tset(L.lift, 0, now, 0);
        L.speed.t = rate;
      }
      // the waiting lane is the one bright thing: its belt and the pieces held on it
      L.patch.sil.classList.toggle("hi", L.j === w);
      L.pieces.forEach((p) => p.el.sil.classList.toggle("hi", L.j === w));
    });
    wait = w;
    B.wake();
  }

  bag.add(pointer(stage, {
    move: (p) => {
      const [x, y] = unproj(C, p[0], p[1], ZT);
      const j = Math.floor((y + GAP / 2) / (LW + GAP));
      const on = x > H0 - 10 && x < H1 + 10 && y > -GAP && y < Y1 + GAP;
      setWait(on ? clamp(j, 0, NL - 1) : REST);
      read.textContent = on ? `lane ${clamp(j, 0, NL - 1) + 1} · waits` : "rest";
    },
    leave: () => { setWait(REST); read.textContent = "rest"; },
  }));
  bag.add(() => svg.replaceChildren());
  setWait(REST);
  read.textContent = "rest";

  return {
    set: (v) => { rate = clamp(v, 0, 80); lanes.forEach((L) => { if (L.j !== wait) L.speed.t = rate; }); B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "three-lanes",
  means: "Three streams ride their own little belts. When one loses a piece, only that lane waits for the copy. Point at a lane to drop a piece there.",
  rules: [1, 4, 6, 10],
  range: [10, 22, 40],
  tour: [[229, 161], [171, 190], null],
  mount,
});
