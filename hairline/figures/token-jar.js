/**
 * Token jar: a short round jar holding a stack of up to five tokens, and over
 * it a tap on a post that drips one token back at a steady pace until the jar
 * is full again. Each ask takes the top token, and an ask that finds the jar
 * empty is turned away. While the pointer is near the jar it asks four times
 * a second, faster than the drip, so the stack runs down and then each new
 * token is taken as soon as it lands. Leave, and the drip fills it back up.
 * The top token, the one that goes next, is bright. The slider is the drip.
 */
const {
  Cam, circ, clamp, facing, fit, hull, open, poly, prism, proj, ringAt, rings, rrect, run,
  tween, tset, tval, tdone, disposer, mk, pointer, put, register, solid,
} = HL;

const N = 5, JR = 22, WT = 2.4, WH = 12, CR = 15, CT = 6, NZ = 74, UP = 34, OUT = 30, ASK = 0.25;
const PY = -JR - 12; // the post stands behind the jar
const at = (ring, dx, dy) => ring.map((q) => ({ ...q, u: q.u + dx, v: q.v + dy }));

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let drip = value;
  const C = Cam(45, 0.5, 2.2);
  fit(C, [[-JR - 6, PY - 6, -4], [JR + 6, JR + 6, -4], [JR + 6, PY - 6, -4], [-JR - 6, JR + 6, -4], [0, PY, NZ + 10], [OUT, 0, N * CT + UP + CT]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const box = (x0, y0, x1, y1, z0, z1, r, b) => { const [o, i] = rings(x0, y0, x1, y1, r, b); return prism(P, front, o, i, z0, z1); };
  const outer = rrect(-JR, -JR, JR, JR, JR, 14), inner = rrect(-JR + WT, -JR + WT, JR - WT, JR - WT, JR - WT, 14);
  const LR = (pts) => (pts[0][0] <= pts[pts.length - 1][0] ? pts : pts.slice().reverse());

  // the base, then the tap: a post behind the jar, an arm over it, a nozzle pointing down
  put(solid(g), box(-JR - 6, PY - 6, JR + 6, JR + 6, -4, 0, 10, 2));
  put(solid(g), box(-3, PY - 3, 3, PY + 3, 0, NZ + 10, 2.5, 0.8));
  put(solid(g), box(-2.5, PY - 2, 2.5, 2.5, NZ + 6, NZ + 10, 2, 0.6));
  put(solid(g), prism(P, front, at(circ(4, 16), 0, 0), at(circ(3.2, 16), 0, 0), NZ, NZ + 6));

  // the jar's far half: body, the rim's inner edge, the floor seam along the far wall
  mk("path", { class: "sil", d: poly(hull(ringAt(P, outer, 0).concat(ringAt(P, outer, WH)))) }, g);
  mk("path", { class: "nf", d: poly(ringAt(P, inner, WH)) }, g);
  mk("path", { class: "nf lo", d: open(ringAt(P, run(inner, (q) => !front(q)), 2)) }, g);

  // the tokens, bottom to top: each one's place in the stack, whether it is there, and its trip in or out
  const coin = circ(CR, 28), crease = circ(CR - 1.2, 28);
  const tokens = [];
  for (let k = 0; k < N; k++) tokens.push({ k, el: solid(g), here: true, coming: false, v: tween(0), drawn: NaN });
  function draw(t, v) {
    if (v === t.drawn) return;
    t.drawn = v;
    const z0 = 1.5 + t.k * CT, gone = !t.coming && v > 0.97;
    // coming: down from the nozzle; going: up and away to the asker
    const z = t.coming ? z0 + v * (NZ - CT - z0) : z0 + v * UP, x = t.coming ? 0 : v * OUT;
    put(t.el, gone ? { sil: "", crease: "" } : prism(P, front, at(coin, x, 0), at(crease, x, 0), z, z + CT - 1));
  }

  // the jar's near half: one opaque piece from the rim's inner edge down to the floor, and a lip under the rim
  const iF = LR(ringAt(P, run(inner, front), WH)), oT = LR(ringAt(P, run(outer, front), WH)), oB = LR(ringAt(P, run(outer, front), 0));
  mk("path", { class: "fo", d: poly([...iF, oT[oT.length - 1], ...oB.slice().reverse(), oT[0]]) }, g);
  mk("path", { class: "nf lo", d: open(oT) }, g);
  mk("path", { class: "nf", d: open(iF) }, g);
  mk("path", { class: "nf sil", d: open([oT[0], ...oB, oT[oT.length - 1]]) }, g);
  mk("path", { class: "nf lo", d: open(LR(ringAt(P, run(outer, front), WH - 3))) }, g);

  let near = false, dAcc = 0, aAcc = 0, lit = -2;
  const count = () => tokens.filter((t) => t.here).length;
  function mark() {
    const k = count() - 1;
    if (k === lit) return;
    lit = k;
    tokens.forEach((t) => t.el.sil.classList.toggle("hi", t.k === k));
  }
  function say() { read.textContent = near ? `tokens ${count()} of ${N}` : "rest"; }

  const B = register(stage, (dt, now) => {
    let moving = false;
    tokens.forEach((t) => { draw(t, tval(t.v, now)); if (!tdone(t.v, now)) moving = true; });
    // the drip: one token every 1 / drip seconds, dropped from the nozzle onto the stack
    // the next drop waits until the last one has landed, so an ask can always reach the top token
    if (count() < N) {
      dAcc += dt;
      if (dAcc >= 1 / drip && tokens.every((t) => !t.coming || tdone(t.v, now))) {
        dAcc = 0;
        const t = tokens[count()];
        t.here = true; t.coming = true; t.drawn = NaN;
        t.v = tween(1); tset(t.v, 0, now, 0);
      }
      moving = true;
    } else dAcc = 0;
    // the asks: four a second while the pointer is near; each takes the top token once it has landed
    if (near) {
      aAcc += dt;
      if (aAcc >= ASK) {
        aAcc = 0;
        const t = tokens[count() - 1];
        if (t && tdone(t.v, now)) { t.here = false; t.coming = false; t.drawn = NaN; tset(t.v, 1, now, 0); }
      }
      moving = true;
    }
    mark();
    say();
    return moving;
  });
  bag.add(B.unregister);

  // Near means inside the jar's rest outline on screen, grown by a margin: nothing that moves is tested.
  const pts = ringAt(P, outer, 0).concat(ringAt(P, outer, N * CT + 8)), xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const bx = [Math.min(...xs) - 18, Math.max(...xs) + 18, Math.min(...ys) - 18, Math.max(...ys) + 14];
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
  means: "A jar holds five tokens and a tap drips one back each second. Every ask takes a token. Hover on the jar to ask faster than the drip.",
  rules: [4, 5, 7, 8],
  range: [0.5, 1, 2],
  tour: [[200, 190], [330, 60], null],
  mount,
});
