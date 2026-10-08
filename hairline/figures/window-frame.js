/**
 * Window frame: a long rail marked in minutes, with one bead for every swipe
 * of a card, set down where in time it happened: a few early, a burst in the
 * middle, a few late. A frame lies on the rail, as long as ten minutes. The
 * pointer slides it along the rail, and the beads inside it lift: that count
 * is the number of swipes in the last ten minutes. At rest the frame sits on
 * the burst. The slider is the frame's length, in minutes.
 *
 * The pattern: a continuous position on springs, read on the ground plane,
 * which never moves; the frame is moved in the paint order as it slides.
 */
const {
  Cam, circ, clamp, fit, facing, poly, proj, prism, rings, rrect, ringAt,
  spring, stepS, unproj, disposer, flatDot, mk, place, pointer, put, register, solid,
} = HL;

const LEN = 200, MIN = LEN / 30, BW = 22, LIFT = 14, BH = 6, BR = 4.2, REST = 88;
const AT = [7, 19, 30, 47, 66, 74, 81, 88, 95, 102, 109, 133, 153, 172, 190];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let W = value * MIN;
  const C = Cam(45, 0.5, 1.7);
  fit(C, [[-8, -8, -4], [LEN + 8, BW + 8, -4], [LEN + 8, -8, -4], [-8, BW + 8, -4], [100, 0, LIFT + BH + 4]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // the rail, with a dot for every minute along its near edge
  const [rr, ri] = rings(-8, -8, LEN + 8, BW + 8, 7, 2);
  put(solid(g), prism(P, front, rr, ri, -4, 0));
  for (let m = 0; m <= 30; m++) place(flatDot(g, C, 0.5, m % 5 ? "dot off" : "dot m"), P(m * MIN, BW + 4, 0));

  const frame = mk("g", {}), fs = solid(frame), hole = mk("path", { class: "nf" }, frame);
  const beads = AT.map((x) => {
    const grp = mk("g", {}, g), s = solid(grp);
    return { x, grp, s, sp: spring(0, { eps: 0.05 }), drawn: NaN, ring: circ(BR, 16).map((q) => ({ ...q, u: q.u + x, v: q.v + BW / 2 })), inner: circ(BR - 1, 16).map((q) => ({ ...q, u: q.u + x, v: q.v + BW / 2 })) };
  });
  g.append(frame);

  const fc = spring(REST, { eps: 0.05 });
  let fdrawn = NaN, fW = NaN;
  function drawFrame() {
    if (fc.x === fdrawn && W === fW) return;
    fdrawn = fc.x; fW = W;
    const x0 = fc.x - W / 2, x1 = fc.x + W / 2;
    const [o, i] = rings(x0 - 4, -5, x1 + 4, BW + 5, 5, 1.2);
    put(fs, prism(P, front, o, i, 0, 3));
    hole.setAttribute("d", poly(ringAt(P, rrect(x0, -1, x1, BW + 1, 3, 4), 3)));
    // paint order: the frame goes in after the beads behind its far edge
    const after = beads.filter((b) => b.x < x0 - 4 - BR).pop();
    if (after) after.grp.after(frame); else beads[0].grp.before(frame);
  }
  function drawBead(b) {
    if (b.sp.x === b.drawn) return;
    b.drawn = b.sp.x;
    put(b.s, prism(P, front, b.ring, b.inner, b.sp.x, b.sp.x + BH));
  }

  const B = register(stage, (dt) => {
    let m = stepS(fc, dt);
    for (const b of beads) if (stepS(b.sp, dt)) m = true;
    drawFrame();
    beads.forEach(drawBead);
    return m;
  });
  bag.add(B.unregister);

  let over = false;
  /** Retargets the frame, and lifts the beads inside where it is going: a choice read on a target, not a position. */
  function retarget(cx) {
    fc.t = clamp(cx, W / 2, LEN - W / 2);
    let n = 0;
    for (const b of beads) {
      const inside = Math.abs(b.x - fc.t) <= W / 2;
      if (inside) n++;
      b.sp.t = inside ? LIFT : 0;
      b.s.sil.classList.toggle("hi", inside);
    }
    fs.sil.classList.add("hi");
    read.textContent = over ? `${n} swipes` : "rest";
    B.wake();
  }
  retarget(REST);
  for (const b of beads) b.sp.x = b.sp.t;

  bag.add(pointer(stage, {
    move: (p) => { over = true; retarget(unproj(C, p[0], p[1], 0)[0]); },
    leave: () => { over = false; retarget(REST); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { W = v * MIN; retarget(fc.t); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "window-frame",
  means: "Card swipes as beads along a rail of minutes. Slide the ten-minute frame along it: the swipes inside lift, and that is the count.",
  rules: [1, 3, 5, 6],
  range: [5, 10, 15],
  tour: [[120, 120], [200, 165], [280, 205], null],
  mount,
});
