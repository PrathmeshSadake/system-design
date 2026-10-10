/**
 * cookie-press: An empty tray, then cookies, one press at a time. Slide across and the next cookie stands up on the tray.
 * The pointer picks a block by its resting centre, which does not move.
 * The picked block grows on a spring and takes the bright edge.
 */
const {
  Cam, facing, fit, prism, proj, rings, spring, stepS, disposer, mk, pointer, put, register, solid,
} = HL;

const S = 2.03;
const SHELF = 17;
const FIT = [[-70, -32, -4], [70, -32, -4], [-70, 40, -4], [70, 40, -4], [-70, -32, 17], [-56.77, -15.36, 0], [-41.14, -3.32, 17.44], [-26.79, 10.99, 0], [-11.64, 21.71, 24.02], [1.95, -18.06, 0], [15.61, -7.58, 33.02], [31.81, 14.12, 0], [44.93, 28, 30.12]];
const ITEMS = [
  { name: "tin", x: -56.77, y: -15.36, w: 15.63, d: 12.04, h: 8.72 },
  { name: "one", x: -26.79, y: 10.99, w: 15.15, d: 10.72, h: 12.01 },
  { name: "two", x: 1.95, y: -18.06, w: 13.66, d: 10.48, h: 16.51 },
  { name: "three", x: 31.81, y: 14.12, w: 13.12, d: 13.88, h: 15.06 },
];
const REST = 1;

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
  name: "cookie-press",
  means: "An empty tray, then cookies, one press at a time. Slide across and the next cookie stands up on the tray.",
  rules: [1, 4, 5, 8],
  range: [1.25, 1.6, 2],
  tour: [[149,127],[237,159],[231,206],null],
  mount,
});
