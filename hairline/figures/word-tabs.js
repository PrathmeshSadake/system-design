/**
 * Word tabs: a pile of eight loose pages on a board, with four word tabs
 * sticking out of its right side at four heights, each tab numbered with dots.
 * The tabs are the index: each one lists the pages that hold its word. The
 * pointer picks a tab: it takes the bright stroke, and the pages that hold the
 * word slide out of the pile toward you, the nearest to the tab first. At rest
 * the tab for "cat" is lit and its pages peek out. The slider is how far a
 * page slides.
 */
const {
  Cam, facing, fit, prism, proj, rings, seg, tdone, tset, tval, tween,
  disposer, flatDot, mk, place, pointer, put, register, solid,
} = HL;

const W = 52, H = 44, N = 8, STEP = 3.8, TH = 2.8, B0 = -3;
const WORDS = [["sun", [3]], ["cat", [2, 5]], ["dog", [1, 5, 7]], ["hat", [4, 6, 8]]];
const START = 1;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let slide = value;
  const C = Cam(45, 0.5, 2.85);
  fit(C, [[-3, -3, B0], [W + 12, -3, B0], [W + 3, H + 26, B0], [-3, H + 26, B0], [-3, -3, N * STEP]], 200, 166);
  const P = proj(C), front = facing(C), g = mk("g", {}, svg);

  const [br, bi] = rings(-3, -3, W + 3, H + 3, 3, 1.4);
  put(solid(g), prism(P, front, br, bi, B0, 0));

  // tabs: one per word, out of the right side, each a little higher and further forward than the last
  const tabs = WORDS.map(([word, pages], k) => {
    const z = 2 + k * 2 * STEP, y0 = 2 + k * 10.5;
    return { word, pages, k, z, y0, mid: P(W + 6, y0 + 4, z + 0.8) };
  });

  const pages = [];
  for (let i = 0; i < N; i++) {
    const z0 = i * STEP, el = solid(g);
    const lines = i === N - 1 ? mk("path", { class: "nf lo" }, g) : null;
    pages.push({ n: N - i, z0, el, lines, o: tween(0), drawn: NaN });
    for (const t of tabs) if (t.z >= z0 && t.z < z0 + STEP) {
      const [r, ri] = rings(W - 2, t.y0, W + 10, t.y0 + 8, 2.4, 0.9);
      t.el = solid(g);
      put(t.el, prism(P, front, r, ri, t.z, t.z + 1.6));
      t.dots = [];
      for (let d = 0; d <= t.k; d++) t.dots.push(flatDot(g, C, 0.55, "dot m"));
      t.dots.forEach((el, d) => place(el, P(W + 6, t.y0 + 4 + (d - t.k / 2) * 1.8, t.z + 1.6)));
    }
  }

  function draw(pg, o) {
    if (o === pg.drawn) return;
    pg.drawn = o;
    const [r, ri] = rings(0, o, W, H + o, 1.8, 0.9);
    put(pg.el, prism(P, front, r, ri, pg.z0, pg.z0 + TH));
    if (pg.lines) {
      const z = pg.z0 + TH;
      let d = "";
      for (let j = 0; j < 6; j++) d += seg(P(7, 7 + j * 5 + o, z), P(W - 7 - (j % 3) * 8, 7 + j * 5 + o, z));
      pg.lines.setAttribute("d", d);
    }
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const pg of pages) { draw(pg, tval(pg.o, now)); if (!tdone(pg.o, now)) moving = true; }
    return moving;
  });
  bag.add(B.unregister);

  // The tabs never move: the pointer takes the one whose centre is nearest on screen.
  function hit([sx, sy]) {
    let best = -1, bd = 60;
    tabs.forEach((t, k) => { const e = Math.hypot(t.mid[0] - sx, t.mid[1] - sy); if (e < bd) { bd = e; best = k; } });
    return best;
  }

  let act = null;
  function choose(k) {
    if (k === act) return;
    act = k;
    const now = performance.now(), t = tabs[k < 0 ? START : k], far = k < 0 ? slide * 0.3 : slide;
    // pages slide out spreading from the tab's height: the nearest page first
    pages.forEach((pg) => {
      const on = t.pages.includes(pg.n), delay = (Math.abs(pg.z0 - t.z) / STEP) * 45;
      tset(pg.o, on ? far : 0, now, on ? delay : 0);
    });
    tabs.forEach((u) => {
      u.el.sil.classList.toggle("hi", u === t);
      u.dots.forEach((d) => d.setAttribute("class", u === t ? "dot" : "dot m"));
    });
    read.textContent = k < 0 ? "rest" : `${t.word} · ${t.pages.length} page${t.pages.length === 1 ? "" : "s"}`;
    B.wake();
  }
  choose(-1);

  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { slide = v; const a = act; act = null; choose(a); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "word-tabs",
  means: "A pile of pages with word tabs on the side. Point at a tab and every page that holds that word slides out: a word leads to its pages.",
  rules: [1, 2, 6, 10],
  range: [10, 18, 26],
  tour: [[290, 191], [268, 183], [247, 174], null],
  mount,
});
