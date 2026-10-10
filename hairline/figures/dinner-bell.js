/**
 * dinner-bell: An order, a pan, and a plate. Point at a step and it rises: asked for, cooking, or served.
 * The pointer picks a block by its resting centre, which does not move.
 * The picked block grows on a spring and takes the bright edge.
 */
const {
  Cam, facing, fit, prism, proj, rings, spring, stepS, disposer, mk, pointer, put, register, solid,
} = HL;

const S = 1.9;
const SHELF = 22;
const FIT = [[-70, -32, -4], [70, -32, -4], [-70, 40, -4], [70, 40, -4], [-70, -32, 22], [-57.97, -18.5, 0], [-44.93, -5.22, 30.56], [-17.75, 13.35, 0], [-2.17, 25.24, 21.08], [21.44, -18.07, 0], [33.57, -5.15, 26.2]];
const ITEMS = [
  { name: "asked", x: -57.97, y: -18.5, w: 13.04, d: 13.28, h: 15.28 },
  { name: "cook", x: -17.75, y: 13.35, w: 15.58, d: 11.89, h: 10.54 },
  { name: "served", x: 21.44, y: -18.07, w: 12.13, d: 12.92, h: 13.1 },
];
const REST = 0;

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
  name: "dinner-bell",
  means: "An order, a pan, and a plate. Point at a step and it rises: asked for, cooking, or served.",
  rules: [1, 4, 5, 8],
  range: [1.25, 1.6, 2],
  tour: [[152,125],[166,178],[258,180],null],
  mount,
});
