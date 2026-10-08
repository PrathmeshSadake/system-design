/**
 * Cookie jar: an empty, open cookie jar in the middle of a round mat, with a
 * ring of twelve kids around it (pawns: a body and a head). The pointer is
 * where the hunger starts: the kids near it stand up on their springs, the
 * farther the less, all wanting a cookie. But there is a lock: only the kid
 * nearest the pointer goes in to refill the jar, with the bright stroke; the
 * rest stand and wait. At rest the empty jar has the bright stroke. The
 * slider is how far the hunger reaches, in world units.
 */
const {
  Cam, facing, fit, hull, open, poly, prism, proj, ringAt, rings, rrect, run, spring, stepS,
  tdone, tset, tval, tween, unproj, disposer, mk, pointer, put, register, solid,
} = HL;

const N = 12, RING = 46, IN = 22, HMAX = 22, ER = 64, JR = 13, JH = 20;
const falloff = (u) => (u <= 0 ? 1 : u <= 0.417 ? 1 - (u / 0.417) * 0.6875 : u <= 1 ? 0.3125 - ((u - 0.417) / 0.583) * 0.2185 : 0.094);
const LR = (pts) => (pts[0][0] <= pts[pts.length - 1][0] ? pts : pts.slice().reverse());

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let R = value;
  const C = Cam(45, 0.5, 2.0);
  fit(C, [[-ER, -ER, -4], [ER, -ER, -4], [ER, ER, -4], [-ER, ER, -4], [-RING, -RING * 0.3, 14 + HMAX + 6]], 200, 168);
  const P = proj(C), front = facing(C), g = mk("g", {}, svg);
  put(solid(g), prism(P, front, rrect(-ER, -ER, ER, ER, ER, 16), rrect(-ER + 2.2, -ER + 2.2, ER - 2.2, ER - 2.2, ER - 2.2, 16), -4, 0));
  const scene = mk("g", {}, g);

  // the jar: its body, the rim and the empty inside, the near wall over it
  const jar = mk("g", {}, scene), outer = rrect(-JR, -JR, JR, JR, JR, 12), inner = rrect(-JR + 2, -JR + 2, JR - 2, JR - 2, JR - 2, 12);
  const jarSil = mk("path", { d: poly(hull(ringAt(P, outer, 0).concat(ringAt(P, outer, JH)))), class: "sil" }, jar);
  mk("path", { d: poly(ringAt(P, inner, JH)), class: "nf" }, jar);
  mk("path", { d: open(ringAt(P, run(inner, (q) => !front(q)), 3)), class: "nf lo" }, jar);
  const iF = LR(ringAt(P, run(inner, front), JH)), oT = LR(ringAt(P, run(outer, front), JH)), oB = LR(ringAt(P, run(outer, front), 0));
  mk("path", { d: poly([...iF, oT[oT.length - 1], ...oB.slice().reverse(), oT[0]]), class: "fo" }, jar);
  mk("path", { d: open(iF), class: "nf" }, jar);
  const jarNear = mk("path", { d: open([oT[0], ...oB, oT[oT.length - 1]]), class: "nf sil" }, jar);
  mk("path", { d: open(LR(ringAt(P, run(outer, front), JH - 5))), class: "nf lo" }, jar);

  const kids = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + 0.26, cx = Math.cos(a), cy = Math.sin(a);
    const h0 = 9 + 3 * Math.sin(i * 1.7) + 2 * Math.cos(i * 0.9);
    const el = mk("g", {}, scene);
    kids.push({ i, cx, cy, h0, el, body: solid(el), head: solid(el), h: spring(h0, { eps: 0.04 }), go: tween(0), drawn: "" });
  }

  const where = (k, go) => { const r = RING - (RING - IN) * go; return [k.cx * r, k.cy * r]; };
  function drawKid(k, h, go) {
    const key = h.toFixed(2) + ":" + go.toFixed(3);
    if (key === k.drawn) return false;
    k.drawn = key;
    const [x, y] = where(k, go);
    const [b, bi] = rings(x - 3.6, y - 3.6, x + 3.6, y + 3.6, 2.6, 0.9), [hd, hi] = rings(x - 2.8, y - 2.8, x + 2.8, y + 2.8, 2.8, 0.8);
    put(k.body, prism(P, front, b, bi, 0, h));
    put(k.head, prism(P, front, hd, hi, h + 0.8, h + 6.4));
    return true;
  }

  const B = register(stage, (dt, now) => {
    let moving = false, moved = false;
    for (const k of kids) {
      if (stepS(k.h, dt)) moving = true;
      if (!tdone(k.go, now)) moving = true;
      if (drawKid(k, Math.max(1, k.h.x), tval(k.go, now))) moved = true;
    }
    // back to front: the jar and each kid by x + y, as the refilling kid walks in
    if (moved) {
      const items = [[0, jar], ...kids.map((k) => { const [x, y] = where(k, tval(k.go, now)); return [x + y, k.el]; })];
      items.sort((p, q) => p[0] - q[0]).forEach(([, el]) => scene.append(el));
    }
    return moving;
  });
  bag.add(B.unregister);

  let over = null, lock = null;
  function retarget() {
    let best = null, bd = Infinity;
    if (over) for (const k of kids) { const d = Math.hypot(k.cx * RING - over[0], k.cy * RING - over[1]); if (d < bd) { bd = d; best = k; } }
    let wait = 0;
    for (const k of kids) {
      const u = over ? Math.hypot(k.cx * RING - over[0], k.cy * RING - over[1]) / R : 9;
      k.h.t = over ? k.h0 + HMAX * falloff(u) : k.h0;
      if (over && k !== best && u < 1) wait++;
    }
    if (best !== lock) {
      lock = best;
      const now = performance.now();
      kids.forEach((k) => { tset(k.go, k === best ? 1 : 0, now, 0); k.body.sil.classList.toggle("hi", k === best); });
      jarSil.classList.toggle("hi", !best); jarNear.classList.toggle("hi", !best);
    }
    read.textContent = over ? `1 refill · ${wait} wait` : "rest";
    B.wake();
  }
  retarget();

  bag.add(pointer(stage, {
    move: (p) => { const w = unproj(C, p[0], p[1], 0); over = Math.hypot(w[0], w[1]) < ER ? w : null; retarget(); },
    leave: () => { over = null; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { R = v; retarget(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "cookie-jar",
  means: "An empty cookie jar with kids all around. Hungry kids near the pointer stand up, but only one goes to refill the jar while the rest wait.",
  rules: [1, 3, 4, 8],
  range: [30, 50, 90],
  tour: [[150, 150], [250, 150], [200, 210], null],
  mount,
});
