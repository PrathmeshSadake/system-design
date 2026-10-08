/**
 * Tin phone: two cups lying on their stands at either end of a plank, joined
 * by one taut string, a line that stays open. The near cup shows its mouth,
 * the far one its bottom where the string is tied. A bead on the string is
 * the message: it runs along the line on a spring to wherever the pointer is,
 * either way, and the string dips a little under it. Nobody has to call
 * again to send the next one. The read-out says which way the bead last ran.
 * The slider is how far the string dips under the bead.
 */
const {
  Cam, clamp, facing, fit, hull, open, place, poly, prism, proj, rings,
  spring, stepS, disposer, mk, pointer, put, register, solid,
} = HL;

const YC = 12, ZC = 34, XL = 40, XR = 150, LEN = 32, RM = 14, RB = 10.5, REST = 82, BR = 6.5;
const V = [0.612, 0.612, 0.5]; // the direction to the camera

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let sag = value;
  const C = Cam(45, 0.5, 1.85);
  fit(C, [[-6, -10, -5], [XR + LEN + 10, YC + 22, -5], [XR + LEN + 10, -10, -5], [-6, YC + 22, -5], [XL - LEN, YC, ZC + RM], [XR + LEN, YC, ZC + RM]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const box = (x0, y0, x1, y1, z0, z1, r, b) => { const [o, i] = rings(x0, y0, x1, y1, r, b); return prism(P, front, o, i, z0, z1); };
  /** A circle standing across x at xa, radius r: its points, or only those on the side that faces the camera. */
  const disc = (xa, r, near) => {
    const pts = [];
    for (let k = 0; k <= 48; k++) {
      const a = (k / 48) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      if (!near || c * V[1] + s * V[2] > 0) pts.push(P(xa, YC + r * c, ZC + r * s));
    }
    return pts;
  };
  /** A cup lying on its side, from its mouth at xm to its bottom at xb. */
  function cup(xm, xb) {
    const el = solid(g);
    el.sil.setAttribute("d", poly(hull(disc(xm, RM).concat(disc(xb, RB)))));
    const shut = xb > xm; // the left cup shows its bottom, the right one its mouth
    if (shut) {
      el.cr.setAttribute("d", open(disc(xm + 3, RM - 0.6, true)));
      mk("path", { class: "nf", d: poly(disc(xb, RB)) }, el.g);
    } else {
      mk("path", { class: "nf", d: poly(disc(xm, RM)) }, el.g);
      mk("path", { class: "nf lo", d: poly(disc(xm - 0.4, RM - 2)) }, el.g);
      mk("path", { class: "nf lo", d: open(disc(xb + 1, RB - 0.5, true)) }, el.g);
    }
  }

  put(solid(g), box(-6, -10, XR + LEN + 10, YC + 22, -5, 0, 6, 1.8));
  put(solid(g), box(XL - LEN + 2, YC - 9, XL - 4, YC + 9, 0, ZC - RM + 1, 3, 1));
  cup(XL - LEN, XL);
  const line = mk("path", { class: "nf" }, g);
  const bead = mk("path", { class: "sil hi" }, g), hole = mk("circle", { r: 1.4, class: "dot" }, g);
  put(solid(g), box(XR + 4, YC - 9, XR + LEN - 2, YC + 9, 0, ZC - RM + 1, 3, 1));
  cup(XR + LEN, XR);

  const bx = spring(REST, { eps: 0.05 });
  let drawn = NaN;
  function draw() {
    const x = bx.x, key = x + sag * 1000;
    if (key === drawn) return;
    drawn = key;
    const t = (x - XL) / (XR - XL), z = ZC - sag * 4 * t * (1 - t);
    const b = P(x, YC, z);
    line.setAttribute("d", open([P(XL, YC, ZC), b, P(XR, YC, ZC)]));
    const ring = [];
    for (let k = 0; k < 24; k++) ring.push([b[0] + BR * Math.cos((k / 24) * Math.PI * 2), b[1] + BR * Math.sin((k / 24) * Math.PI * 2)]);
    bead.setAttribute("d", poly(ring));
    place(hole, b);
  }

  const B = register(stage, (dt) => { const m = stepS(bx, dt); draw(); return m; });
  bag.add(B.unregister);

  // The pointer is read against the straight rest line between the cups, which never moves.
  const a = P(XL, YC, ZC), c = P(XR, YC, ZC), dx = c[0] - a[0], dy = c[1] - a[1], L2 = dx * dx + dy * dy;
  let way = "to server";
  function aim(target) {
    if (Math.abs(target - bx.t) > 0.5) way = target > bx.t ? "to server" : "to you";
    bx.t = target;
    B.wake();
  }
  bag.add(pointer(stage, {
    move: ([px, py]) => {
      const t = clamp(((px - a[0]) * dx + (py - a[1]) * dy) / L2, 0.08, 0.86);
      aim(XL + t * (XR - XL));
      read.textContent = `${way} · open`;
    },
    leave: () => { aim(REST); read.textContent = "rest"; },
  }));
  bag.add(() => svg.replaceChildren());
  read.textContent = "rest";

  return {
    set: (v) => { sag = clamp(v, 0, 16); B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "tin-phone",
  means: "Two cups joined by a string: a line that stays open. Move along it and the message bead runs either way, with no new call each time.",
  rules: [1, 3, 5, 8],
  range: [4, 8, 14],
  tour: [[255, 160], [160, 114], [215, 142], null],
  mount,
});
