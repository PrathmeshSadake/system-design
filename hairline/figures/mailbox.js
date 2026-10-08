/**
 * Mailbox: a mailbox on a post, its flag down, a note half in the slot of its
 * door. The pointer is the hand: along the note's lane it pushes the note in
 * (a spring on how far), and once the note is all the way in the flag swings
 * up on the 700ms curve: the note is posted and waits safely. The slider is
 * how long the flag waits after the note is in, in ms.
 */
const {
  Cam, clamp, facing, fillet, fit, hull, lerp, open, poly, prism, proj, rad, rings, unproj,
  spring, stepS, tween, tset, tval, tdone, disposer, flatDot, mk, place, pointer, put, register, solid,
} = HL;

const BX0 = -30, BX1 = 30, BY = 13, BZ = 50, WALL = 12, NZ = 61, NOUT = 52, NIN = 30.4, NL = 26;
const PIV = [-20, 62];

/** The box's end profile in (y, z): a flat floor with rounded corners and an arched roof. */
function arch(Y, z0, h, rb) {
  const pts = [];
  const arc = (cy, cz, r, a0, a1, n) => {
    for (let k = 0; k <= n; k++) { const a = rad(lerp(a0, a1, k / n)); pts.push([cy + r * Math.cos(a), cz + r * Math.sin(a)]); }
  };
  arc(Y - rb, z0 + rb, rb, -90, 0, 4);
  arc(0, z0 + h, Y, 0, 180, 18);
  arc(-Y + rb, z0 + rb, rb, 180, 270, 4);
  return pts;
}

/** The flag, an arm with a plate at its end, in its own (a, b) plane, turned th degrees about the pivot. */
const FLAG = fillet([[-3, -1.6], [25, -1.6], [25, 10], [14, 10], [14, 1.6], [-3, 1.6]], [1.6, 1.6, 2, 2, 1, 1.6]);
const flagAt = (P, th, y) => FLAG.map(([a, b]) => {
  const c = Math.cos(rad(th)), s = Math.sin(rad(th));
  return P(PIV[0] + a * c - b * s, y, PIV[1] + a * s + b * c);
});

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let wait = value;
  const C = Cam(45, 0.5, 2.6);
  fit(C, [[-20, -16, 0], [10, 16, 0], [BX0, -BY, BZ + WALL + BY], [NOUT, 0, NZ], [-21, BY, PIV[1] + 26], [BX1, BY, BZ]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // the stone the post stands in, and the post
  const [br, bi] = rings(-18, -14, 10, 14, 6, 1.6);
  put(solid(g), prism(P, front, br, bi, 0, 5));
  const [pr, pi] = rings(-8, -4, 0, 4, 2, 1);
  put(solid(g), prism(P, front, pr, pi, 5, BZ));

  // the box: the hull of its two end profiles, then the door on the near end, its inset, and the slot
  const prof = arch(BY, BZ, WALL, 3), door = arch(BY - 2.2, BZ + 2.2, WALL - 1.2, 2);
  const at = (pts, x) => pts.map(([y, z]) => P(x, y, z));
  mk("path", { d: poly(hull(at(prof, BX0).concat(at(prof, BX1)))), class: "sil" }, g);
  mk("path", { d: poly(at(prof, BX1)), class: "nf" }, g);
  mk("path", { d: poly(at(door, BX1)), class: "nf lo" }, g);
  mk("path", { d: poly(at(fillet([[-8.5, NZ - 1.6], [8.5, NZ - 1.6], [8.5, NZ + 2.6], [-8.5, NZ + 2.6]], [1.2, 1.2, 1.2, 1.2]), BX1)), class: "nf" }, g);

  // the flag on the near side wall: its back edge, its face, and the pivot
  const fBack = mk("path", { class: "lo" }, g), fFace = mk("path", { class: "sil" }, g);
  const knob = mk("circle", { r: 1.3, class: "dot m" }, g);
  place(knob, P(PIV[0], BY + 2, PIV[1]));

  // the note: only the part outside the door is drawn, so it goes in through the slot
  const note = solid(g), marks = mk("g", {}, g), md = [];
  for (let k = 0; k < 3; k++) md.push(flatDot(marks, C, 0.95, "dot"));

  const x1 = spring(NOUT, { eps: 0.03 }), flag = tween(0);
  let drawnX = NaN, drawnF = NaN, inside = false;
  function drawNote(x) {
    if (x === drawnX) return;
    drawnX = x;
    if (x - NIN < 1) { note.sil.setAttribute("d", ""); note.cr.setAttribute("d", ""); marks.remove(); return; }
    const [nr, ni] = rings(NIN, -7, x, 7, 1.4, 0.6);
    put(note, prism(P, front, nr, ni, NZ, NZ + 1.4));
    if (x - 6 > NIN + 1) { note.g.after(marks); md.forEach((el, k) => place(el, P(x - 5, (k - 1) * 3.6, NZ + 1.4))); }
    else marks.remove();
  }
  function drawFlag(th) {
    if (th === drawnF) return;
    drawnF = th;
    fBack.setAttribute("d", poly(flagAt(P, th, BY + 0.5)));
    fFace.setAttribute("d", poly(flagAt(P, th, BY + 1.9)));
  }

  const B = register(stage, (dt, now) => {
    const m = stepS(x1, dt);
    drawNote(x1.x); drawFlag(tval(flag, now));
    return m || !tdone(flag, now);
  });
  bag.add(B.unregister);

  function aim(p) {
    const q = p && unproj(C, p[0], p[1], NZ);
    const on = !!q && Math.abs(q[1]) < 24 && q[0] > -34 && q[0] < 74;
    x1.t = on ? clamp(q[0], NIN, NOUT) : NOUT;
    // the choice reads the spring's target, never where the note is on screen
    const now = performance.now(), was = inside;
    inside = on && x1.t <= NIN + 1;
    if (inside !== was) tset(flag, inside ? 90 : 0, now, inside ? wait : 0);
    note.sil.classList.toggle("hi", !inside);
    fFace.classList.toggle("hi", inside);
    read.textContent = !on ? "rest" : inside ? "note 3 · waiting" : "note 3 · posting";
    B.wake();
  }

  aim(null);
  bag.add(pointer(stage, { move: (p) => aim(p), leave: () => aim(null) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { wait = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "mailbox",
  means: "A mailbox with a note in its slot. Push the note in and walk away: the flag goes up, and the note waits safely until someone reads it.",
  rules: [1, 5, 8, 10],
  range: [0, 250, 500],
  tour: [[262, 158], [244, 149], [202, 128], null],
  mount,
});
