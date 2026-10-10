/**
 * shopping-basket: A basket filling with uneven parcels. Slide across and the next parcel drops in and stands up.
 * The pointer picks a block by its resting centre, which does not move.
 * The picked block grows on a spring and takes the bright edge.
 */
const {
  Cam, facing, fit, prism, proj, rings, spring, stepS, disposer, mk, pointer, put, register, solid,
} = HL;

const S = 1.79;
const SHELF = 17;
const FIT = [[-70, -32, -4], [70, -32, -4], [-70, 40, -4], [70, 40, -4], [-70, -32, 17], [-57.93, -16.23, 0], [-43.39, -2.9, 31.58], [-27.15, 11.99, 0], [-14.87, 22.21, 12.22], [1.96, -16.88, 0], [17.86, -4.11, 19.58], [31.92, 12.26, 0], [47.22, 25.33, 32.38]];
const ITEMS = [
  { name: "one", x: -57.93, y: -16.23, w: 14.54, d: 13.33, h: 15.79 },
  { name: "two", x: -27.15, y: 11.99, w: 12.28, d: 10.22, h: 6.11 },
  { name: "three", x: 1.96, y: -16.88, w: 15.9, d: 12.77, h: 9.79 },
  { name: "full", x: 31.92, y: 12.26, w: 15.3, d: 13.07, h: 16.19 },
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
  name: "shopping-basket",
  means: "A basket filling with uneven parcels. Slide across and the next parcel drops in and stands up.",
  rules: [1, 4, 5, 8],
  range: [1.25, 1.6, 2],
  tour: [[153,125],[231,168],[231,200],null],
  mount,
});
