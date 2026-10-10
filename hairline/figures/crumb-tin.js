/**
 * crumb-tin: A tin filling with crumbs, then one crumb too many. Slide across and watch the tin fill up.
 * The pointer picks a block by its resting centre, which does not move.
 * The picked block grows on a spring and takes the bright edge.
 */
const {
  Cam, facing, fit, prism, proj, rings, spring, stepS, disposer, mk, pointer, put, register, solid,
} = HL;

const S = 1.97;
const SHELF = 24;
const FIT = [[-70, -32, -4], [70, -32, -4], [-70, 40, -4], [70, 40, -4], [-70, -32, 24], [-57.78, -15.41, 0], [-42.76, -2.02, 14.82], [-27.19, 14.61, 0], [-13.63, 25.04, 20.66], [2.73, -13.96, 0], [18.36, -2.81, 20.9], [31.06, 10.32, 0], [44.13, 23.22, 38.1]];
const ITEMS = [
  { name: "few", x: -57.78, y: -15.41, w: 15.02, d: 13.39, h: 7.41 },
  { name: "more", x: -27.19, y: 14.61, w: 13.56, d: 10.43, h: 10.33 },
  { name: "full", x: 2.73, y: -13.96, w: 15.63, d: 11.15, h: 10.45 },
  { name: "drop", x: 31.06, y: 10.32, w: 13.07, d: 12.9, h: 19.05 },
];
const REST = 2;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let grow = value;
  const C = Cam(45, 0.5, S);
  fit(C, FIT, 200, 168);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const [fr, fi] = rings(-70, -32, 70, 40, 12, 1.8);
  put(solid(g), prism(P, front, fr, fi, -4, 0));
  const [sr, si] = rings(-66, -30, 66, -18, 3, 1);
  put(solid(g), prism(P, front, sr, si, 0, SHELF));

  const blocks = ITEMS.map((it, i) => ({ ...it, i, h0: it.h, el: solid(g), sp: spring(it.h), drawn: NaN }));
  blocks.sort((a, b) => a.x + a.y - (b.x + b.y)).forEach((b) => g.append(b.el.g));
  const center = ITEMS.map((it) => P(it.x + it.w / 2, it.y + it.d / 2, it.h / 2));

  function draw(b) {
    const z = Math.max(2, b.sp.x);
    if (z === b.drawn) return;
    b.drawn = z;
    const [ring, inner] = rings(b.x, b.y, b.x + b.w, b.y + b.d, 2, 0.7);
    put(b.el, prism(P, front, ring, inner, 0, z));
  }

  const B = register(stage, (dt) => {
    let moving = false;
    for (const b of blocks) {
      if (stepS(b.sp, dt)) moving = true;
      draw(b);
    }
    return moving;
  });
  bag.add(B.unregister);

  let over = -1;
  function apply() {
    const bright = over < 0 ? REST : over;
    blocks.forEach((b) => {
      b.el.sil.classList.toggle("hi", b.i === bright);
      b.sp.t = b.h0 * (b.i === over ? grow : 1);
    });
    read.textContent = over < 0 ? "rest" : ITEMS[over].name;
    B.wake();
  }
  function nearest(p) {
    let best = 0, bd = Infinity;
    for (let i = 0; i < center.length; i++) {
      const d = Math.hypot(center[i][0] - p[0], center[i][1] - p[1]);
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  }

  apply();
  bag.add(pointer(stage, {
    move: (p) => { over = nearest(p); apply(); },
    leave: () => { over = -1; apply(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { grow = v; apply(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "crumb-tin",
  means: "A tin filling with crumbs, then one crumb too many. Slide across and watch the tin fill up.",
  rules: [1, 4, 5, 8],
  range: [1.25, 1.6, 2],
  tour: [[148,135],[232,175],[235,204],null],
  mount,
});
