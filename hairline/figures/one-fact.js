/**
 * One fact: a card stand at the back holds the one card with the fact on it
 * (three dots), and three desks in front read it along dashed threads. That is
 * a normalized schema: one fact, one place. The pointer slides across the
 * desks: every desk to its left gets its own copy of the card, standing up out
 * of the desk, and its thread is cut, because it no longer needs to look. That
 * is denormalizing, and the read-out counts the copies. The slider is the
 * stagger between copies, in ms.
 */
const {
  Cam, facing, fit, poly, prism, proj, rings, rrect, tdone, tset, tval, tween,
  disposer, mk, open, place, pointer, put, register, solid,
} = HL;

const HUB = [46, 4], DESKS = [[10, 46], [46, 46], [82, 46]], CW = 13, CH = 16, HUBH = 14, DESKH = 12;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;
  const C = Cam(45, 0.5, 2.5);
  fit(C, [[-6, -8, -4], [98, -8, -4], [98, 58, -4], [-6, 58, -4], [HUB[0], HUB[1], HUBH + CH + 4]], 200, 166);
  const P = proj(C), front = facing(C), g = mk("g", {}, svg);
  const box = (x0, y0, x1, y1, r, b, z0, z1) => { const s = solid(g); const [o, i] = rings(x0, y0, x1, y1, r, b); put(s, prism(P, front, o, i, z0, z1)); return s; };

  box(-6, -8, 98, 58, 8, 2.2, -4, 0);
  const cardMid = P(HUB[0], HUB[1] + 1, HUBH + CH / 2);
  const threads = DESKS.map(([x, y]) => mk("path", { d: open([P(x, y, DESKH), cardMid]), class: "dash" }, g));

  /** An upright card standing at (x, y) from z, `h` of its height showing: back, face and its three dots. */
  function card(x, y, z) {
    const back = mk("path", { class: "lo" }, g), face = mk("path", { class: "sil" }, g);
    const dots = [0, 1, 2].map(() => mk("circle", { r: 1.25, class: "dot m" }, g));
    const draw = (h) => {
      dots.forEach((d) => d.setAttribute("r", h < 0.6 ? 0 : 1.25));
      if (h < 0.3) { back.setAttribute("d", ""); face.setAttribute("d", ""); dots.forEach((d) => place(d, P(x, y, z))); return; }
      const ring = rrect(x - CW / 2, z, x + CW / 2, z + CH * h, Math.min(2.4, CH * h / 2), 4);
      back.setAttribute("d", poly(ring.map((q) => P(q.u, y - 0.6, q.v))));
      face.setAttribute("d", poly(ring.map((q) => P(q.u, y + 0.6, q.v))));
      [[-3, 0.66], [3, 0.66], [0, 0.36]].forEach(([dx, dv], k) => place(dots[k], P(x + dx, y + 0.6, z + CH * h * dv)));
    };
    return { face, draw };
  }

  box(HUB[0] - 9, HUB[1] - 5, HUB[0] + 9, HUB[1] + 5, 2.5, 1, 0, HUBH);
  const hub = card(HUB[0], HUB[1], HUBH);
  hub.draw(1);

  const desks = DESKS.map(([x, y]) => {
    box(x - 5, y - 4, x + 5, y + 4, 2, 0.8, 0, DESKH - 2);
    box(x - 10, y - 7, x + 10, y + 7, 2.6, 1.1, DESKH - 2, DESKH);
    return { x, y, copy: card(x, y, DESKH), h: tween(0), drawn: NaN, mid: P(x, y, DESKH) };
  });

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const d of desks) {
      const h = tval(d.h, now);
      if (h !== d.drawn) { d.drawn = h; d.copy.draw(h); }
      if (!tdone(d.h, now)) moving = true;
    }
    return moving;
  });
  bag.add(B.unregister);

  // Every desk whose rest centre is left of the pointer gets a copy. Desks never move, so neither does the test.
  let n = null;
  function slide(m, at) {
    if (m === n) return;
    n = m;
    const now = performance.now();
    desks.forEach((d, i) => {
      const on = m > i;
      tset(d.h, on ? 1 : 0, now, Math.abs(i - at) * stag);
      threads[i].setAttribute("d", on ? "" : open([P(d.x, d.y, DESKH), cardMid]));
      d.copy.face.classList.toggle("hi", on && i === m - 1);
    });
    hub.face.classList.toggle("hi", m <= 0);
    read.textContent = m < 0 ? "rest" : `copies ${m}`;
    B.wake();
  }
  slide(-1, 0);

  bag.add(pointer(stage, {
    move: ([sx]) => { const m = desks.filter((d) => d.mid[0] - 12 < sx).length; slide(m, Math.max(0, m - 1)); },
    leave: () => slide(-1, 0),
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "one-fact",
  means: "One card, three desks that read it by thread. Slide the pointer right and each desk gets its own copy: faster to read, more to keep in sync.",
  rules: [2, 4, 5, 6],
  range: [0, 50, 100],
  tour: [[99, 131], [163, 163], [227, 195], null],
  mount,
});
