/**
 * Ticket posts: a proposer's rack of eight numbered tickets, the number being
 * the ticket's height, and three acceptor posts, each as tall as the biggest
 * ticket it has promised. The pointer's height picks a ticket; it slides out
 * and a dashed level runs from it to the posts. Each post shorter than the
 * ticket promises and lifts to it, staggered from the rack outwards; a taller
 * post refuses and stays. The slider is the stagger, in ms.
 */
const {
  Cam, circ, facing, fit, prism, proj, rrect, seg,
  tween, tset, tval, tdone, disposer, mk, pointer, put, register, solid,
} = HL;

const LV = 7, NT = 8, PROMISED = [3, 6, 2], AT = [-22, 18, 58], RACK = -68, OUT = 14, REST_T = 5;
const E = [Math.SQRT1_2, -Math.SQRT1_2], A = [Math.SQRT1_2, Math.SQRT1_2];
const at = (t, s = 0) => [t * E[0] + s * A[0], t * E[1] + s * A[1]];
const turn = (rg, t) => rg.map((q) => {
  const [x, y] = at(t + q.u, q.v);
  return { u: x, v: y, nu: q.nu * E[0] + q.nv * A[0], nv: q.nu * E[1] + q.nv * A[1] };
});

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let step = value;
  const C = Cam(45, 0.5, 2.0);
  const box = [[-92, -24], [80, -24], [-92, 24], [80, 24]].map(([t, s]) => [...at(t, s), -5]);
  fit(C, box.concat([[...at(RACK, -12), NT * LV + 6], [...at(AT[2], 0), NT * LV]]), 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  put(solid(g), prism(P, front, turn(rrect(-92, -24, 80, 24, 14, 6), 0), turn(rrect(-90, -22, 78, 22, 12, 6), 0), -5, 0));
  const level = mk("path", { class: "dash nf" }, g);

  // the rack: a back board and a foot, then the tickets from the bottom up
  put(solid(g), prism(P, front, turn(rrect(-13, -14, 13, -9, 2, 4), RACK), turn(rrect(-12, -13, 12, -10, 1.2, 4), RACK), 0, NT * LV + 6));
  put(solid(g), prism(P, front, turn(rrect(-14, -14, 14, 12, 4, 4), RACK), turn(rrect(-12.6, -12.6, 12.6, 10.6, 2.8, 4), RACK), 0, 3));
  const tickets = Array.from({ length: NT }, (_, k) => ({ n: k + 1, el: solid(g), tw: tween(k + 1 === REST_T ? 5 : 0), drawn: NaN }));

  // the acceptors: a round post each, as tall as its promise
  const posts = AT.map((t, i) => {
    const [x, y] = at(t);
    return { i, el: solid(g), ring: circ(10, 24).map((q) => ({ ...q, u: q.u + x, v: q.v + y })), inner: circ(8.5, 24).map((q) => ({ ...q, u: q.u + x, v: q.v + y })), tw: tween(PROMISED[i] * LV), drawn: NaN };
  });

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const tk of tickets) {
      const o = tval(tk.tw, now);
      if (!tdone(tk.tw, now)) moving = true;
      if (o === tk.drawn) continue;
      tk.drawn = o;
      const z = tk.n * LV;
      put(tk.el, prism(P, front, turn(rrect(-11 + o, -9, 11 + o, 11, 2.4, 4), RACK), turn(rrect(-10 + o, -8, 10 + o, 10, 1.6, 4), RACK), z - 2.2, z));
    }
    for (const p of posts) {
      const h = tval(p.tw, now);
      if (!tdone(p.tw, now)) moving = true;
      if (h === p.drawn) continue;
      p.drawn = h;
      put(p.el, prism(P, front, p.ring, p.inner, 0, h));
    }
    return moving;
  });
  bag.add(B.unregister);

  // the hit test: a level is a horizontal line on screen, read from the rack's rest pose
  const ys = tickets.map((tk) => P(...at(RACK), tk.n * LV)[1]);
  const x0 = P(...at(-100), 0)[0], x1 = P(...at(88), 0)[0];
  let act = null;
  function choose(p) {
    let n = 0;
    if (p && p[0] > x0 && p[0] < x1 && p[1] > ys[NT - 1] - 14 && p[1] < ys[0] + 30) {
      n = 1 + ys.reduce((b, y, k) => (Math.abs(y - p[1]) < Math.abs(ys[b] - p[1]) ? k : b), 0);
    }
    if (n === act) return;
    act = n;
    const now = performance.now();
    tickets.forEach((tk) => {
      tset(tk.tw, n ? (tk.n === n ? OUT : 0) : tk.n === REST_T ? 5 : 0, now, 0);
      tk.el.sil.classList.toggle("hi", tk.n === (n || REST_T));
    });
    // a post shorter than the ticket promises and lifts to it; a taller one refuses
    posts.forEach((p, i) => tset(p.tw, Math.max(PROMISED[i], n) * LV, now, (i + 1) * step));
    const z = n * LV;
    level.setAttribute("d", n ? seg(P(...at(RACK + 11 + OUT), z), P(...at(AT[2] + 14), z)) : "");
    const k = PROMISED.filter((v) => v < n).length;
    read.textContent = n ? `ticket ${n} · ${k} of 3` : "rest";
    B.wake();
  }

  choose(null);
  bag.add(pointer(stage, { move: (p) => choose(p), leave: () => choose(null) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { step = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "ticket-posts",
  means: "Each post is as tall as the biggest ticket it promised. Pick a ticket by height: lower posts promise and lift, taller ones refuse.",
  rules: [1, 2, 6, 10],
  range: [20, 50, 90],
  tour: [[248, 149], [248, 112], [248, 182], null],
  mount,
});
