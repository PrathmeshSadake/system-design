/**
 * One belt: a single conveyor belt runs from one machine's hood into
 * another's, and every piece on it belongs to one of three streams, told
 * apart by the dots on its lid: one, two or three. The pieces of all three
 * ride mixed together, taking turns. The belt never stops; hovering slows it
 * on a spring so a piece can be followed, and the piece under the pointer
 * takes the bright stroke while the read-out names its stream. At rest the
 * bright piece is one of stream 1. The slider is the belt's speed.
 */
const {
  Cam, clamp, facing, fit, flatDot, hull, open, place, poly, prism, proj, rings, rrect, run, unproj,
  spring, stepS, disposer, mk, pointer, put, register, solid,
} = HL;

const H0 = 0, H1 = 212, HD = 40, HZ = 40, BW = 30, ZB = 6, ZT = 14, PH = 7, PL = 17, SP = 24;
const STREAM = [1, 2, 3, 1, 1, 2, 3, 2, 1, 3, 2], N = STREAM.length, LOOP = N * SP, SLOW = 0.16;
const V = [0.612, 0.5]; // the direction to the camera, in (x, z)

/** A belt lying along x: a stadium profile in (x, z), carried across y from 0 to BW. */
function belt(P, x0, x1, b) {
  const r = (ZT - ZB) / 2, at = (ring, y) => ring.map((q) => P(q.u, y, q.v));
  const prof = rrect(x0, ZB, x1, ZT, r, 6), inner = rrect(x0 + b, ZB + b, x1 - b, ZT - b, r - b, 6);
  return { sil: poly(hull(at(prof, 0).concat(at(prof, BW)))), crease: open(at(run(inner, (q) => q.nu * V[0] + q.nv * V[1] > 0), BW)) };
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let rate = value;
  const C = Cam(45, 0.5, 1.45);
  fit(C, [[H0 - HD, -6, 0], [H1 + HD, BW + 6, 0], [H0 - HD, -6, HZ], [H1 + HD, BW + 6, HZ], [H1 + HD, -6, 0], [H0 - HD, BW + 6, 0]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const box = (x0, y0, x1, y1, z0, z1, r, b) => { const [o, i] = rings(x0, y0, x1, y1, r, b); return prism(P, front, o, i, z0, z1); };

  for (const x of [40, 160]) put(solid(g), box(x, 8, x + 10, BW - 8, 0, ZB + 1, 2, 0.8));
  put(solid(g), belt(P, H0 - HD + 4, H1 + HD - 4, 1.2));
  // the sending machine: a hood over the belt, with the mouth the pieces come out of
  put(solid(g), box(H0 - HD, -6, H0, BW + 6, 0, HZ, 7, 2));
  mk("path", { class: "nf", d: poly(rrect(1, ZT - 2, BW - 1, ZT + PH + 8, 4, 5).map((q) => P(H0, q.u, q.v))) }, g);
  // the belt again, between the machines, so the hood never covers the part in front of it
  put(solid(g), box(H0, 0, H1, BW, ZB, ZT, 0.5, 0.4));
  mk("path", { class: "nf lo", d: open([P(H0, BW - 3, ZT), P(H1, BW - 3, ZT)]) }, g);

  const pieces = STREAM.map((s, i) => {
    const el = solid(g), dots = [];
    for (let k = 0; k < s; k++) dots.push(flatDot(el.g, C, 1.7, "dot m"));
    return { s, i, el, dots, x: NaN };
  });
  // the receiving machine, last: the pieces go into it
  put(solid(g), box(H1, -6, H1 + HD, BW + 6, 0, HZ, 7, 2));

  const speed = spring(rate, { eps: 0.05 });
  let off = 0, over = null, pick = -1;
  const xOf = (p) => ((p.i * SP + off) % LOOP) - (LOOP - (H1 - H0)) / 2;

  function draw() {
    for (const p of pieces) {
      const x0 = xOf(p), a = Math.max(x0, H0), b = Math.min(x0 + PL, H1);
      p.x = x0;
      put(p.el, b - a > 1.5 ? (() => { const [o, n] = rings(a, 5, b, BW - 5, 2.4, 0.8); return prism(P, front, o, n, ZT, ZT + PH); })() : { sil: "", crease: "" });
      p.dots.forEach((d, k) => {
        const dy = (k - (p.s - 1) / 2) * 6, cx = x0 + PL / 2;
        d.setAttribute("display", cx > H0 + 3 && cx < H1 - 3 ? "inline" : "none");
        place(d, P(cx, BW / 2 + dy, ZT + PH));
      });
    }
  }
  function mark() {
    // the piece under the pointer, read on the lid plane; at rest, the first piece of stream 1
    let a = -1;
    if (over) for (const p of pieces) if (over[0] >= p.x && over[0] <= p.x + PL && p.x > H0 - 4 && p.x + PL < H1 + 4) a = p.i;
    if (over && Math.abs(over[1] - BW / 2) > BW / 2 + 6) a = -1;
    const lit = over ? a : 0;
    if (lit !== pick) {
      pick = lit;
      pieces.forEach((p) => { p.el.sil.classList.toggle("hi", p.i === lit); p.dots.forEach((d) => d.setAttribute("class", p.i === lit ? "dot" : "dot m")); });
    }
    read.textContent = !over ? "rest" : a >= 0 ? `stream ${STREAM[a]}` : "belt · slow";
  }

  const B = register(stage, (dt) => {
    stepS(speed, dt);
    off = (off + speed.x * dt) % LOOP;
    draw();
    mark();
    return true;
  });
  bag.add(B.unregister);

  bag.add(pointer(stage, {
    move: (p) => { over = unproj(C, p[0], p[1], ZT + PH); speed.t = rate * SLOW; B.wake(); },
    leave: () => { over = null; speed.t = rate; B.wake(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { rate = clamp(v, 0, 80); speed.t = over ? rate * SLOW : rate; B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "one-belt",
  means: "One belt carries pieces of three streams, mixed and taking turns. Dots on each lid say whose it is. Hover to slow the belt and follow one.",
  rules: [1, 4, 7, 10],
  range: [10, 22, 40],
  tour: [[150, 150], [230, 190], [300, 220], null],
  mount,
});
