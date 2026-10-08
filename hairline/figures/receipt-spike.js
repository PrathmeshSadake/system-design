/**
 * Receipt spike: a desk spike with two notes already pierced on it (one dot
 * and two dots: note 1 and note 2). Two more hang above: note 3, new, on the
 * left, and a repeat of note 1 on the right. The pointer picks a side. The new
 * note drops onto the spike and joins the pile; the repeat comes down to the
 * tip, is turned away because its id was already seen, and lands on the desk.
 * The slider is how far the repeat is tossed aside.
 */
const {
  Cam, circ, facing, fit, hull, lerp, poly, prism, proj, rad, ringAt, rrect, tween, tset, tval, tdone,
  disposer, flatDot, mk, place, pointer, put, register, solid,
} = HL;

const TIP = 60, TOP = 72, HALF = 12, NT = 1.2, PILE = [[8, 14], [10.6, -10]];
const START = [[-26, 26, 52], [26, -26, 52]];

/** A rounded square note turned by deg about its centre, moved to (x, y). */
function noteRing(x, y, deg, inset) {
  const c = Math.cos(rad(deg)), s = Math.sin(rad(deg)), h = HALF - inset;
  return rrect(-h, -h, h, h, 2.4 - inset * 0.6, 3).map((q) => ({
    u: x + q.u * c - q.v * s, v: y + q.u * s + q.v * c, nu: q.nu * c - q.nv * s, nv: q.nu * s + q.nv * c,
  }));
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let toss = value;
  const C = Cam(45, 0.5, 2.15);
  fit(C, [[-54, -44, -5], [54, 60, -5], [54, -44, -5], [-54, 60, -5], [0, 0, TOP + 12], [-38, 38, 52], [38, -38, 52]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // the desk and the spike's weighted foot; everything after them is reordered each frame
  const desk = rrect(-54, -44, 54, 60, 12, 4), di = rrect(-52, -42, 52, 58, 10, 4);
  put(solid(g), prism(P, front, desk, di, -5, 0));
  const foot = circ(17, 40), fi = circ(15.4, 40);
  put(solid(g), prism(P, front, foot, fi, 0, 5));
  const layer = mk("g", {}, g), rodPool = [0, 1, 2, 3, 4].map(() => solid(layer));
  const rodR = circ(1.6, 12), tip = mk("path", { class: "sil" }, layer);

  /** A note: its plate and its dots, the number of the note. */
  function makeNote(n) {
    const el = solid(layer), dots = [];
    for (let k = 0; k < n; k++) dots.push(flatDot(el.g, C, 0.9, "dot"));
    return { el, dots, n, drawn: "" };
  }
  const pile = PILE.map(([z, deg], i) => ({ ...makeNote(i + 1), z, x: 0, y: 0, deg }));
  const fly = [makeNote(3), makeNote(1)].map((nt, i) => ({ ...nt, tw: tween(0), side: i }));

  /** Where flying note i is at progress u: up and over the tip, then down the spike or off to the desk. */
  function pose(f, u) {
    const [sx, sy, sz] = START[f.side];
    if (u <= 0.5) { const s = u / 0.5; return [lerp(sx, 0, s), lerp(sy, 0, s), lerp(sz, TOP, s) + 6 * Math.sin(Math.PI * s), f.side ? 24 : -18]; }
    const s = (u - 0.5) / 0.5;
    if (f.side === 0) return [0, 0, lerp(TOP, 13.2, s), lerp(-18, 30, s)];
    // the repeat is lifted clear of the tip first, then falls to the desk beside the spike
    const h = s < 0.4 ? (s / 0.4) * 22 : lerp(22, toss, (s - 0.4) / 0.6);
    const z = s < 0.4 ? TOP + 6 * Math.sin(Math.PI * s / 0.4) : lerp(TOP, 0, ((s - 0.4) / 0.6) ** 2);
    return [h * 0.52, h * 0.85, z, lerp(24, 64, s)];
  }

  function drawNote(nt, x, y, z, deg) {
    const key = [x, y, z, deg].map((v) => v.toFixed(2)).join(",");
    if (key === nt.drawn) return;
    nt.drawn = key;
    put(nt.el, prism(P, front, noteRing(x, y, deg, 0), noteRing(x, y, deg, 0.8), z, z + NT));
    const c = Math.cos(rad(deg)), s = Math.sin(rad(deg));
    nt.dots.forEach((d, k) => { const a = -7 + k * 3.6, b = -7; place(d, P(x + a * c - b * s, y + a * s + b * c, z + NT)); });
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    const plates = pile.map((p) => ({ nt: p, x: p.x, y: p.y, z: p.z, deg: p.deg }));
    for (const f of fly) {
      const [x, y, z, deg] = pose(f, tval(f.tw, now));
      plates.push({ nt: f, x, y, z, deg });
      if (!tdone(f.tw, now)) moving = true;
    }
    // back to front: notes off the spike behind it, then up the spike, cut wherever a note sits on it, then notes in front
    const onRod = (p) => Math.hypot(p.x, p.y) < HALF + 6 && p.z < TIP - 5;
    const behind = plates.filter((p) => !onRod(p) && p.x + p.y < 0), ahead = plates.filter((p) => !onRod(p) && p.x + p.y >= 0);
    const stack = plates.filter(onRod).sort((a, b) => a.z - b.z);
    for (const p of behind) { layer.append(p.nt.el.g); drawNote(p.nt, p.x, p.y, p.z, p.deg); }
    let z0 = 5, r = 0;
    for (const p of stack.concat([{ z: TIP - 5, end: true }])) {
      const rod = rodPool[r++];
      layer.append(rod.g);
      put(rod, p.z - z0 > 0.4 ? prism(P, front, rodR, rodR, z0, Math.min(p.z, TIP - 5)) : { sil: "", crease: "" });
      if (p.end) { layer.append(tip); break; }
      layer.append(p.nt.el.g); drawNote(p.nt, p.x, p.y, p.z, p.deg);
      z0 = p.z + NT;
    }
    for (; r < rodPool.length; r++) put(rodPool[r], { sil: "", crease: "" });
    for (const p of ahead) { layer.append(p.nt.el.g); drawNote(p.nt, p.x, p.y, p.z, p.deg); }
    return moving;
  });
  bag.add(B.unregister);

  tip.setAttribute("d", poly(hull(ringAt(P, rodR, TIP - 5).concat([P(0, 0, TIP)]))));

  // the hit test: which side of the spike's rest line on screen, inside the figure's height
  const rx = P(0, 0, 0)[0], yTop = P(0, 0, TOP + 14)[1], yBot = P(30, 30, 0)[1];
  let act = -2;
  function choose(p) {
    const a = !p || p[1] < yTop || p[1] > yBot || Math.abs(p[0] - rx) > 150 ? -1 : p[0] < rx ? 0 : 1;
    if (a === act) return;
    act = a;
    const now = performance.now();
    fly.forEach((f, i) => { tset(f.tw, i === a ? 1 : 0, now, 0); f.el.sil.classList.toggle("hi", a < 0 ? i === 1 : i === a); });
    read.textContent = a < 0 ? "rest" : a === 0 ? "note 3 · new" : "note 1 · seen";
    B.wake();
  }

  choose(null);
  bag.add(pointer(stage, { move: (p) => choose(p), leave: () => choose(null) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { toss = v; fly[1].drawn = ""; B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "receipt-spike",
  means: "Notes are kept on a spike, each with its own number. A new note goes on. A repeat of a note already seen is set aside, so it counts once.",
  rules: [1, 4, 6, 10],
  range: [34, 40, 46],
  tour: [[291, 99], [133, 99], null],
  mount,
});
