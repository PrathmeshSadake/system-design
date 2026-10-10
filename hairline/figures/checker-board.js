/**
 * checker-board: Three pieces from a board game, short, tall, and wide. Point at a piece and it rises.
 * The pointer picks a block by its resting centre, which does not move.
 * The picked block grows on a spring and takes the bright edge.
 */
const {
  Cam, facing, fit, prism, proj, rings, spring, stepS, disposer, mk, pointer, put, register, solid,
} = HL;

const S = 1.93;
const SHELF = 19;
const FIT = [[-70, -32, -4], [70, -32, -4], [-70, 40, -4], [70, 40, -4], [-70, -32, 19], [-56.98, -15.97, 0], [-44.48, -2.95, 25.18], [-18.52, 14.54, 0], [-4.6, 28.18, 25.78], [21.38, -16.23, 0], [35.84, -4.94, 13.46]];
const ITEMS = [
  { name: "pawn", x: -56.98, y: -15.97, w: 12.5, d: 13.02, h: 12.59 },
  { name: "knight", x: -18.52, y: 14.54, w: 13.92, d: 13.64, h: 12.89 },
  { name: "king", x: 21.38, y: -16.23, w: 14.46, d: 11.29, h: 6.73 },
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
  name: "checker-board",
  means: "Three pieces from a board game, short, tall, and wide. Point at a piece and it rises.",
  rules: [1, 4, 5, 8],
  range: [1.25, 1.6, 2],
  tour: [[149,126],[161,174],[259,184],null],
  mount,
});
