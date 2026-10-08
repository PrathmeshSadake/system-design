/**
 * Rope line: a theme-park queue that zigzags between ropes on posts, up to a
 * gate arch. People shuffle along it packed close; the gate lets them through
 * at one steady pace, so past it they walk on spaced out. At the line's mouth
 * the ones who came too late turn back and walk away. The world never stops;
 * hovering slows it so one person can be followed, and the one nearest the
 * pointer is bright. At rest the gate is bright. The slider is the rate.
 */
const {
  Cam, clamp, facing, fit, open, poly, proj, prism, rings, spring, stepS,
  mk, pointer, put, register, disposer, solid,
} = HL;

const LINE = [[-6, 60], [100, 60], [100, 34], [10, 34], [10, 8], [112, 8]];
const PAST = [[112, 8], [132, 8], [132, 84]];
const BACK = [[-6, 66], [6, 80], [96, 80]];
const ROPES = [[-5, 0, 108], [21, 18, 108], [47, 0, 92], [73, 4, 108]];
const DQ = 17, VQ = 6, RATIO = 1.8, DB = 34, VB = 9;

/** A walker along a polyline: its length, and the point at distance s. */
function path(pts) {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const L = cum[cum.length - 1];
  const at = (s) => {
    let i = 1;
    while (i < pts.length - 1 && cum[i] < s) i++;
    const k = clamp((s - cum[i - 1]) / (cum[i] - cum[i - 1]), 0, 1);
    return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k];
  };
  return { L, at };
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let base = value;
  const C = Cam(45, 0.5, 1.84);
  fit(C, [[-14, -16, -4], [144, 92, -4], [144, -16, -4], [-14, 92, -4], [112, 8, 34]], 200, 166);
  const P = proj(C), front = facing(C), SC = Math.abs(P(1, -1, 0)[0] - P(0, 0, 0)[0]) / Math.SQRT2;
  const line = path(LINE), past = path(PAST), back = path(BACK);

  const g = mk("g", {}, svg);
  const [fr, fi] = rings(-14, -16, 144, 92, 12, 2);
  put(solid(g), prism(P, front, fr, fi, -4, 0));

  // back to front: a rope and its posts, then the people between it and the next rope
  const layers = [];
  // a stanchion: a thin pole with a knob on top
  const post = (parent, x, y) => { mk("path", { d: open([P(x, y, 0), P(x, y, 12)]), class: "nf" }, parent); const q = P(x, y, 12.5); mk("circle", { r: 1.8, cx: q[0], cy: q[1], class: "dot m" }, parent); };
  ROPES.forEach(([y, x0, x1], k) => {
    const rg = mk("g", {}, g), xs = [x0, (x0 + x1) / 2, x1];
    let d = "";
    for (let j = 0; j < 2; j++) d += open(Array.from({ length: 9 }, (_, n) => { const t = n / 8; return P(xs[j] + (xs[j + 1] - xs[j]) * t, y, 11 - 3.2 * Math.sin(Math.PI * t)); }));
    const [a, ai] = rings(110, -5.6, 114, -0.4, 2, 0.6), [b, bi] = rings(110, 16.4, 114, 21.6, 2, 0.6), [c, ci] = rings(109, -6, 115, 22, 2, 0.8);
    if (k === 0) { layers.gate = [solid(rg)]; put(layers.gate[0], prism(P, front, a, ai, 0, 28)); }
    mk("path", { d, class: "nf" }, rg);
    xs.forEach((x) => post(rg, x, y));
    layers.push(mk("g", {}, g));
    if (k === 0) {
      // the gate: its far post stands behind the far row's walkers, its near post and crossbar in front of them
      const gate = mk("g", {}, g);
      layers.gate.push(solid(gate), solid(gate));
      put(layers.gate[1], prism(P, front, b, bi, 0, 28)); put(layers.gate[2], prism(P, front, c, ci, 28, 33));
    }
  });
  layers.push(mk("g", {}, g));
  const gateHi = (on) => layers.gate.forEach((s) => s.sil.classList.toggle("hi", on));
  gateHi(true);

  // the walkers: a pool, laid out each frame along the three paths
  const nQ = Math.ceil(line.L / DQ) + Math.ceil(past.L / (DQ * RATIO)) + 2, nB = Math.ceil(back.L / DB) + 1;
  const people = Array.from({ length: nQ + nB }, () => {
    const grp = mk("g", {}, layers[0]), body = solid(grp), head = mk("path", { class: "sil" }, grp);
    return { grp, body, head, layer: 0, key: "" };
  });
  function lay(p, x, y, h, kind) {
    p.kind = kind; p.x = x; p.y = y;
    const key = x.toFixed(2) + y.toFixed(2) + h.toFixed(2);
    if (key === p.key) return;
    p.key = key;
    if (h < 0.05) { p.body.sil.setAttribute("d", ""); p.body.cr.setAttribute("d", ""); p.head.setAttribute("d", ""); return; }
    const [r, ri] = rings(x - 3.2, y - 3.2, x + 3.2, y + 3.2, 3.2, 1);
    put(p.body, prism(P, front, r, ri, 0, 8 * h));
    const o = P(x, y, 11.6 * h), R = 3.5 * SC * h;
    p.head.setAttribute("d", poly(Array.from({ length: 14 }, (_, j) => [o[0] + R * Math.cos(j * 0.4488), o[1] + R * Math.sin(j * 0.4488)])));
    const layer = kind === 1 ? 4 : kind === 2 ? 4 : clamp(Math.floor((y + 5) / 26), 0, 3);
    if (layer !== p.layer) { p.layer = layer; layers[layer].append(p.grp); }
  }

  let T = 0, over = null, hot = null;
  const rate = spring(base);
  function frame() {
    const u = (T * VQ) % DQ, w = (T * VB) % DB;
    people.forEach((p, k) => {
      if (k < nQ) {
        const s = u + k * DQ;
        if (s <= line.L) { const [x, y] = line.at(s); lay(p, x, y, clamp(s / 8, 0, 1), 0); }
        else { const s2 = (s - line.L) * RATIO, [x, y] = past.at(s2); lay(p, x, y, clamp((past.L - s2) / 8, 0, 1), 1); }
      } else {
        const s = w + (k - nQ) * DB, [x, y] = back.at(s);
        lay(p, x, y, clamp(Math.min(s, back.L - s) / 8, 0, 1), 2);
      }
    });
    // within each layer, back to front by depth, regrouped only when the order changes
    layers.forEach((L, i) => {
      const mine = people.filter((p) => p.layer === i).sort((a, b) => a.x + a.y - (b.x + b.y));
      for (let j = 1; j < mine.length; j++) if (mine[j].grp.previousSibling !== mine[j - 1].grp) { mine.forEach((p) => L.append(p.grp)); break; }
    });
    // the walker nearest the pointer, on screen, is bright; with nobody near, the gate is
    let best = null, bd = 14;
    if (over) people.forEach((p) => { if (!p.key || p.body.sil.getAttribute("d") === "") return; const q = P(p.x, p.y, 8), d = Math.hypot(q[0] - over[0], q[1] - over[1]); if (d < bd) { bd = d; best = p; } });
    if (best !== hot) {
      if (hot) { hot.body.sil.classList.remove("hi"); hot.head.classList.remove("hi"); }
      hot = best;
      if (hot) { hot.body.sil.classList.add("hi"); hot.head.classList.add("hi"); }
      gateHi(!hot);
    }
    read.textContent = !over ? "rest" : !hot ? "2,000/s in" : hot.kind === 0 ? "waiting" : hot.kind === 1 ? "2,000/s in" : "turned back";
  }

  const B = register(stage, (dt) => {
    rate.t = over ? base * 0.12 : base;
    stepS(rate, dt);
    T += dt * rate.x;
    frame();
    return true;
  });
  bag.add(B.unregister);

  bag.add(pointer(stage, {
    move: (p) => { over = p; B.wake(); },
    leave: () => { over = null; B.wake(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { base = v; B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "rope-line",
  means: "A theme-park rope line. The gate lets people in at one steady pace; the rest wait, or turn back. Hover to slow time and follow one.",
  rules: [4, 5, 7, 8],
  range: [0.6, 1, 1.6],
  tour: [[300, 118], [200, 150], [259, 218], null],
  mount,
});
