// Save a drawing in an envelope. Later, put the envelope back. The editor does not peek.

export class Canvas {
  constructor() { this.marks = []; }
  draw(mark) { this.marks.push(mark); }
  save() { return { marks: this.marks.slice() }; }
  restore(envelope) { this.marks = envelope.marks.slice(); }
}

export function demo() {
  const canvas = new Canvas();
  canvas.draw("sun");
  const saved = canvas.save();
  canvas.draw("cloud");
  canvas.restore(saved);
  if (canvas.marks.join(",") !== "sun") throw new Error(canvas.marks.join(","));
}

if (import.meta.main) demo();
