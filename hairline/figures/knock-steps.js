/**
 * Knock steps: a staircase of four steps climbing to a door. Each step is one
 * more try, and its tread is the wait before that knock, so every tread is
 * twice as long as the one below it: 100, 200, 400 and 800 ms, as geometry.
 * The try's number is punched in dots on the front of its tread. The pointer
 * picks a step; it rises and the steps beside it rise less, staggered
 * outwards. At rest the first step is the bright mark. The slider is the rise.
 */
const {
  Cam, clamp, facing, fit, prism, proj, rings, unproj,
  tween, tset, tval, tdone, disposer, flatDot, mk, place, pointer, put, register, solid,
} = HL;

const LEN = [12, 24, 48, 96], RISE = 13, YW = 44, FALL = [1, 0.4, 0.15];
const DOOR = [1, 7, 11, 33, 44], SC = 1.5;
// Step k (0 is the first try) runs from x0 to x1, nearest the viewer at the bottom.
const STEPS = LEN.map((l, k) => {
  const x1 = LEN.slice(k).reduce((a, b) => a + b, 0);
  return { k, x0: x1 - l, x1, top: (k + 1) * RISE };
});

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let L = value;
  const C = Cam(45, 0.5, SC);
  const X = STEPS[0].x1, TOP = STEPS[3].top;
  fit(C, [[0, 0, 0], [X, YW, 0], [X, 0, 0], [0, YW, 0], [0, DOOR[2], TOP + DOOR[4]], [X, 0, RISE + 8]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // The farthest, tallest step first, so each nearer one covers the foot of the last.
  const order = STEPS.slice().reverse(), els = [];
  for (const s of order) {
    const el = solid(g), dots = [];
    for (let d = 0; d <= s.k; d++) dots.push(flatDot(el.g, C, 1.3, "dot m"));
    const [ring, inner] = rings(s.x0, 0, s.x1, YW, 2.5, 1.2);
    els[s.k] = { ...s, el, dots, ring, inner, z: tween(0), drawn: NaN };
    if (s.k === 3) {
      // The door, standing on the top step and facing down the stairs.
      const [dr, di] = rings(DOOR[0], DOOR[2], DOOR[1], DOOR[3], 1.5, 1);
      const door = solid(g), knob = mk("circle", { r: 1.8, class: "dot m" }, g);
      els[3].door = { door, knob, dr, di };
    }
  }

  function draw(s, h) {
    if (h === s.drawn) return;
    s.drawn = h;
    const z = s.top + h;
    put(s.el, prism(P, front, s.ring, s.inner, 0, z));
    s.dots.forEach((el, d) => place(el, P(s.x1 - 5, YW / 2 + (d - s.k / 2) * 6, z)));
    if (s.door) {
      put(s.door.door, prism(P, front, s.door.dr, s.door.di, z, z + DOOR[4]));
      place(s.door.knob, P(DOOR[1], DOOR[3] - 5, z + DOOR[4] * 0.48));
    }
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const s of els) { draw(s, tval(s.z, now)); if (!tdone(s.z, now)) moving = true; }
    return moving;
  });
  bag.add(B.unregister);

  let act = -2;
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : 0;
    act = a;
    for (const s of els) {
      const d = Math.abs(s.k - from);
      tset(s.z, a < 0 ? 0 : L * (FALL[d] ?? 0), now, d * 50);
      s.el.sil.classList.toggle("hi", s.k === (a < 0 ? 0 : a));
    }
    read.textContent = a < 0 ? "rest" : `try ${a + 1} · ${100 * 2 ** a}ms`;
    B.wake();
  }

  const mids = els.map((s) => P((s.x0 + s.x1) / 2, YW / 2, s.top));
  bag.add(pointer(stage, {
    move: (p) => {
      // Each step tested on its own resting top, nearest step first; then the nearest resting middle.
      let hit = -1;
      for (const s of els) {
        const [x, y] = unproj(C, p[0], p[1], s.top);
        if (x >= s.x0 - 1 && x <= s.x1 + 3 && y >= -2 && y <= YW + 8) { hit = s.k; break; }
      }
      if (hit < 0) {
        let bd = 34 * 34;
        mids.forEach((m, k) => { const d2 = (p[0] - m[0]) ** 2 + (p[1] - m[1]) ** 2; if (d2 < bd) { bd = d2; hit = k; } });
      }
      setActive(hit);
    },
    leave: () => setActive(-1),
  }));
  bag.add(() => svg.replaceChildren());
  setActive(-1);

  return {
    set: (v) => { L = clamp(v, 0, 12); if (act >= 0) { const a = act; act = -2; setActive(a); } },
    destroy: bag.dispose,
  };
}

hairline({
  name: "knock-steps",
  means: "Stairs up to a door. Each step is one more knock, and each wait is twice as long as the last. Point at a step to see its wait.",
  rules: [1, 2, 5, 10],
  range: [3, 6, 10],
  tour: [[289, 253], [232, 191], [155, 136], null],
  mount,
});
