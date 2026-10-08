/**
 * Road ahead: a player's buffer, a tray of video chunks queued up in front of
 * a screen. Each chunk is a slab of film, its height the quality it was
 * fetched at, with sprocket holes along its top. At rest the queue tells a
 * trip: sharp chunks, a dip through a tunnel, a climb back. The pointer's
 * height is the network speed: the four newest chunks, at the far end of the
 * queue, come in at the quality it allows, staggered back from the newest.
 * The chunks already in the buffer keep the size they had. The slider is the
 * stagger.
 *
 * The pattern: one of many, chosen by a fixed band of the stage, so nothing
 * that moves can change the choice.
 */
const {
  Cam, fit, facing, poly, proj, prism, rings, rrect, ringAt,
  tdone, tset, tval, tween, disposer, flatDot, mk, place, pointer, put, register, solid,
} = HL;

const N = 7, SP = 21, CW = 16, BW = 24, NEW = 4;
const RUNG = [7, 14, 22, 31], NAMES = ["360p", "480p", "720p", "1080p"], REST = [3, 3, 2, 1, 0, 0, 1];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;
  const X1 = N * SP + 4;
  const C = Cam(45, 0.5, 1.72);
  fit(C, [[-30, -6, -4], [X1, BW + 6, -4], [X1, -6, -4], [-30, BW + 6, -4], [-24, -6, 50], [X1, 0, RUNG[3]]], 200, 170);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const box = (parent, x0, y0, x1, y1, z0, z1, r, b) => { const [o, i] = rings(x0, y0, x1, y1, r, b); const s = solid(parent); put(s, prism(P, front, o, i, z0, z1)); return s; };

  // the buffer: a long tray floor the chunks queue on
  box(g, -30, -6, X1, BW + 6, -4, 0, 8, 2.2);
  mk("path", { d: poly(ringAt(P, rrect(2, -1, X1 - 3, BW + 1, 4, 4), 0)), class: "nf lo" }, g);
  // the player: a screen on a stand at the head of the queue, facing it
  box(g, -24, BW / 2 - 9, -14, BW / 2 + 9, 0, 2.5, 3, 1);
  box(g, -21, BW / 2 - 2, -17, BW / 2 + 2, 2.5, 14, 1.5, 0.6);
  box(g, -22, -6, -18, BW + 6, 12, 48, 2, 0.8);
  const onFace = (ring) => ring.map((q) => P(-18, q.u, q.v));
  mk("path", { d: poly(onFace(rrect(-3, 15, BW + 3, 45, 2.5, 4))), class: "nf lo" }, g);

  const chunks = [];
  for (let i = 0; i < N; i++) {
    const x0 = 6 + i * SP, grp = mk("g", {}, g);
    const [ring, inner] = rings(x0, 2, x0 + CW, BW - 2, 2.6, 1);
    const s = solid(grp), holes = [];
    for (let k = 0; k < 6; k++) holes.push({ x: x0 + 4 + (k % 3) * 4, y: k < 3 ? 5 : BW - 5, el: flatDot(grp, C, 0.6, "dot off") });
    chunks.push({ ring, inner, s, holes, h: tween(RUNG[REST[i]]), drawn: NaN });
  }

  function draw(i, h) {
    const c = chunks[i];
    if (h === c.drawn) return;
    c.drawn = h;
    put(c.s, prism(P, front, c.ring, c.inner, 0, h));
    c.holes.forEach((d) => place(d.el, P(d.x, d.y, h)));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    chunks.forEach((c, i) => { draw(i, tval(c.h, now)); if (!tdone(c.h, now)) moving = true; });
    return moving;
  });
  bag.add(B.unregister);

  // the speed: a fixed band of the stage's height, the top the fastest
  const speed = (y) => Math.max(0, Math.min(3, 3 - Math.floor((y - 50) / 60)));

  let act = -2;
  function setRung(r) {
    if (r === act) return;
    const now = performance.now();
    act = r;
    chunks.forEach((c, i) => {
      const fresh = i >= N - NEW;
      tset(c.h, RUNG[r >= 0 && fresh ? r : REST[i]], now, (N - 1 - i) * stag);
      c.s.sil.classList.toggle("hi", i === N - 1);
    });
    read.textContent = r < 0 ? "rest" : NAMES[r];
    B.wake();
  }
  setRung(-1);

  bag.add(pointer(stage, { move: (p) => setRung(speed(p[1])), leave: () => setRung(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "road-ahead",
  means: "Video chunks wait in a player's buffer. Raise the pointer for fast internet: the newest chunks come in taller, sharper.",
  rules: [1, 2, 5, 8],
  range: [0, 50, 110],
  tour: [[260, 80], [260, 250], [260, 170], null],
  mount,
});
