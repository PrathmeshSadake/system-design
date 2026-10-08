/**
 * Conductor: a round podium with the conductor's score stand on it, and five
 * music stands in a half ring facing it. That is orchestration: one leader,
 * everyone watching it. The pointer slides across from left to right: the
 * podium sinks into the floor and each stand turns away from it to face the
 * next stand along, like dancers who follow each other instead of a leader.
 * Each stand turns on its own spring. The slider is how far they turn, 1 being right round to face the next.
 */
const {
  Cam, facing, fit, poly, prism, proj, rad, rings, rrect, seg, solid, put, mk,
  spring, stepS, register, pointer, disposer, clamp,
} = HL;

const RA = 50, PR = 13, PH = 10, POST = 24, DW = 21, DHT = 14, TILT = 32, PX = 16;
// the stands stand in the back half, so their faces turn toward the podium and the viewer
const ANG = [138, 182, 224, 268, 312];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let turn = value;
  const C = Cam(45, 0.5, 2.1);
  fit(C, [[-RA - 10, -RA - 10, 0], [RA + 10, RA + 10, 0], [RA + 10, -RA - 10, 0], [-RA - 10, RA + 10, 0], [0, 0, PH + POST + DHT]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const disc = (s, x, y, r, z0, z1, b = 1, n = 6) => put(s, prism(P, front, rrect(x - r, y - r, x + r, y + r, r, n), rrect(x - r + b, y - r + b, x + r - b, y + r - b, r - b, n), z0, z1));
  const post = (s, x, y, z0, z1) => { const [a, b] = rings(x - 1.4, y - 1.4, x + 1.4, y + 1.4, 1.4, 0.5); put(s, prism(P, front, a, b, z0, z1)); };

  /** A music stand's desk, centred over (x, y) at height z, its face turned to look along phi (degrees). */
  function desk(x, y, z, phi, tilt = TILT) {
    const n = [Math.cos(rad(phi)), Math.sin(rad(phi))], t = [-n[1], n[0]];
    const s = Math.sin(rad(tilt)), c = Math.cos(rad(tilt));
    const at = (u, v) => P(x + t[0] * u - n[0] * v * s, y + t[1] * u - n[1] * v * s, z + v * c);
    return {
      plate: poly([at(-DW / 2, 0), at(DW / 2, 0), at(DW / 2, DHT), at(-DW / 2, DHT)]),
      lip: seg(at(-DW / 2, 1.6), at(DW / 2, 1.6)),
    };
  }

  const stands = ANG.map((a, i) => {
    const x = RA * Math.cos(rad(a)), y = RA * Math.sin(rad(a)), f = (Math.atan2(PX - y, PX - x) * 180) / Math.PI;
    return { i, a, x, y, f, sp: spring(f, { eps: 0.05 }), drawn: NaN };
  });
  // in the dance, each stand faces the next one along, and the last faces the first
  stands.forEach((st, i) => {
    const nx = stands[(i + 1) % stands.length];
    const to = (Math.atan2(nx.y - st.y, nx.x - st.x) * 180) / Math.PI;
    st.d = ((to - st.f + 540) % 360) - 180;
  });
  // the floor, then the stands back to front, then the podium in front of them all
  disc(solid(g), 0, 0, RA + 12, -3, 0, 2, 14);
  stands.slice().sort((p, q) => p.x + p.y - (q.x + q.y)).forEach((st) => {
    disc(solid(g), st.x, st.y, 5, 0, 2.2, 0.8, 4);
    post(solid(g), st.x, st.y, 2.2, POST);
    st.plate = mk("path", { class: "sil" }, g);
    st.lip = mk("path", { class: "nf" }, g);
  });
  const pod = { body: solid(g), post: solid(g), plate: mk("path", { class: "sil" }, g), lip: mk("path", { class: "nf" }, g), h: spring(PH), drawn: NaN };

  function drawPod() {
    const h = Math.max(0.6, pod.h.x);
    if (h === pod.drawn) return;
    pod.drawn = h;
    disc(pod.body, PX, PX, PR, 0, h, 1.4, 10);
    // as the podium sinks, the conductor's stand folds down onto it: nobody is leading
    const k = (h - 0.6) / (PH - 0.6), top = h + 2 + (POST - 6) * k;
    post(pod.post, PX, PX, h, top);
    const d = desk(PX, PX, top, 45, 90 - (90 - TILT) * k);
    pod.plate.setAttribute("d", d.plate);
    pod.lip.setAttribute("d", d.lip);
  }
  function drawStand(st) {
    if (st.sp.x === st.drawn) return;
    st.drawn = st.sp.x;
    const d = desk(st.x, st.y, POST, st.sp.x);
    st.plate.setAttribute("d", d.plate);
    st.lip.setAttribute("d", d.lip);
  }
  const B = register(stage, (dt) => {
    let m = stepS(pod.h, dt);
    for (const st of stands) if (stepS(st.sp, dt)) m = true;
    drawPod();
    stands.forEach(drawStand);
    return m;
  });
  bag.add(B.unregister);

  let t = 0, over = false;
  function retarget() {
    // t 0: everyone faces the podium; t 1: the podium is gone and each faces the next stand along
    pod.h.t = PH * (1 - t) + 0.6 * t;
    stands.forEach((st) => { st.sp.t = st.f + st.d * turn * t; });
    const chor = over && t >= 0.5;
    [pod.plate, pod.lip].forEach((el) => el.classList.toggle("hi", !chor));
    stands.forEach((st) => { st.plate.classList.toggle("hi", chor && st.i === 0); st.lip.classList.toggle("hi", chor && st.i === 0); });
    read.textContent = !over ? "rest" : t < 0.5 ? "orchestration" : "choreography";
    B.wake();
  }
  retarget();

  const L = P(-RA - 10, RA + 10, 0)[0], Rr = P(RA + 10, -RA - 10, 0)[0];
  bag.add(pointer(stage, {
    move: ([sx]) => { over = true; t = clamp((sx - L - 30) / (Rr - L - 60), 0, 1); retarget(); },
    leave: () => { over = false; t = 0; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());

  return { set: (v) => { turn = v; retarget(); }, destroy: bag.dispose };
}

hairline({
  name: "conductor",
  means: "Music stands all face a conductor's podium. Slide right and the podium sinks while each stand turns to follow the next, like dancers.",
  rules: [3, 4, 5, 8],
  range: [0.5, 1, 1.15],
  tour: [[110, 170], [300, 170], [200, 150], null],
  mount,
});
