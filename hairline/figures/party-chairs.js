/**
 * Party chairs: a long party table with a cake on it, and ten chairs set out
 * round it, five a side. Guests sit down as the months go by, filling the
 * chairs from the cake end; the chairs still empty are the headroom. The
 * pointer's x scrubs the months, one to eight; guests sit down or stand up,
 * spreading out from the newest one, who takes the bright stroke. At rest it
 * is month 6: eight guests, two spare chairs. The slider is the stagger, in ms.
 */
const {
  Cam, clamp, facing, fit, poly, proj, prism, rings, tween, tset, tval, tdone,
  mk, pointer, put, register, disposer, solid,
} = HL;

const N = 10, COLS = [12, 34, 56, 78, 100], REST = 6, M = 8;
const guests = (m) => m + 2;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;
  const C = Cam(45, 0.5, 1.75);
  fit(C, [[-6, -32, 0], [118, -32, 0], [118, 62, 0], [-6, 62, 0], [56, 15, 52]], 200, 170);
  const P = proj(C), front = facing(C), SC = Math.abs(P(1, -1, 0)[0] - P(0, 0, 0)[0]) / Math.SQRT2;

  const g = mk("g", {}, svg);
  const [fr, fi] = rings(-6, -32, 118, 62, 10, 2);
  put(solid(g), prism(P, front, fr, fi, -4, 0));

  // chair i: side 0 is the far side, side 1 the near; filled in order from the cake end
  const chairs = [];
  for (let i = 0; i < N; i++) {
    const side = i % 2, x = COLS[Math.floor(i / 2)];
    chairs.push({ i, side, x, y0: side ? 38 : -28, y1: side ? 52 : -14, h: tween(i < guests(REST) ? 1 : 0), drawn: NaN });
  }
  const far = mk("g", {}, g), table = mk("g", {}, g), near = mk("g", {}, g);
  for (const c of chairs) {
    c.grp = mk("g", {}, c.side ? near : far);
    const back = c.side ? [c.x - 7, c.y1 - 3, c.x + 7, c.y1] : [c.x - 7, c.y0, c.x + 7, c.y0 + 3];
    const seat = solid(c.grp), [sr, si] = rings(c.x - 7, c.y0, c.x + 7, c.y1, 2.5, 1.1);
    put(seat, prism(P, front, sr, si, 0, 9));
    const [br, bi] = rings(...back, 1.4, 0.6), bk = solid(c.grp);
    put(bk, prism(P, front, br, bi, 9, 21));
    c.body = solid(c.grp); c.head = mk("path", { class: "sil" }, c.grp);
    // the back stands behind a far guest and in front of a near one
    if (!c.side) c.grp.append(bk.g, c.body.g, c.head); else c.grp.append(c.body.g, c.head, bk.g);
  }

  // the table, a top over a narrower foot, and the cake with its candle
  const [tr, ti] = rings(0, 0, 112, 30, 4, 1.4), [ur, ui] = rings(6, 5, 106, 25, 3, 1.2);
  put(solid(table), prism(P, front, ur, ui, 0, 19));
  put(solid(table), prism(P, front, tr, ti, 19, 23));
  const [kr, ki] = rings(0, 6, 18, 24, 9, 1.4);
  put(solid(table), prism(P, front, kr, ki, 23, 34));
  mk("path", { d: "M" + P(9, 15, 34).join(",") + "L" + P(9, 15, 42).join(","), class: "nf" }, table);
  mk("circle", { r: 1.6, cx: P(9, 15, 45)[0], cy: P(9, 15, 45)[1], class: "dot m" }, table);

  function drawChair(c, h) {
    if (h === c.drawn) return;
    c.drawn = h;
    if (h < 0.02) { c.body.sil.setAttribute("d", ""); c.body.cr.setAttribute("d", ""); c.head.setAttribute("d", ""); return; }
    const cy = (c.y0 + c.y1) / 2 + (c.side ? -1.5 : 1.5), [pr, pi] = rings(c.x - 4.6, cy - 4.6, c.x + 4.6, cy + 4.6, 4.6, 1.2);
    put(c.body, prism(P, front, pr, pi, 9, 9 + 14 * h));
    const o = P(c.x, cy, 9 + 20 * h), r = 4.8 * SC * h;
    c.head.setAttribute("d", poly(Array.from({ length: 16 }, (_, j) => [o[0] + r * Math.cos(j * 0.3927), o[1] + r * Math.sin(j * 0.3927)])));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const c of chairs) { drawChair(c, tval(c.h, now)); if (!tdone(c.h, now)) moving = true; }
    return moving;
  });
  bag.add(B.unregister);

  let shown = "", count = guests(REST);
  function show(m, rest) {
    const key = rest ? "rest" : String(m);
    if (key === shown) return;
    shown = key;
    const now = performance.now(), n = guests(m), from = Math.max(n, count) - 1;
    count = n;
    chairs.forEach((c) => {
      tset(c.h, c.i < n ? 1 : 0, now, Math.abs(c.i - from) * stag);
      c.body.sil.classList.toggle("hi", c.i === n - 1); c.head.classList.toggle("hi", c.i === n - 1);
    });
    read.textContent = rest ? "rest" : `month ${m} · ${n * 10}%`;
    B.wake();
  }
  show(REST, true);

  // the months run along the stage from left to right; the floor's ends are month 1 and month 8
  const L = P(-6, 62, 0)[0], R = P(118, -32, 0)[0];
  bag.add(pointer(stage, {
    move: (p) => show(clamp(Math.round(1 + ((p[0] - L) / (R - L)) * (M - 1)), 1, M), false),
    leave: () => show(REST, true),
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "party-chairs",
  means: "Chairs set out for a party, with spares. Slide along the months: more guests come and sit, and the spare chairs, the headroom, run out.",
  rules: [2, 3, 5, 8],
  range: [0, 45, 100],
  tour: [[110, 160], [210, 160], [300, 160], null],
  mount,
});
