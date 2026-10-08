/** A figure as the hairline-create skill writes it: see hairline/figures/*.js. */
export type FigureRead = { textContent: string | null };

export type FigureHandle = { set: (value: number) => void; destroy: () => void };

export type FigureDef = {
  name: string;
  /** One sentence saying what the figure shows. It is the caption under the stage. */
  means: string;
  rules: number[];
  /** The figure's own number at intensity 0, 0.5 and 1. The middle one is the default. */
  range: [number, number, number];
  /** The viewBox points the unseen pointer visits when play is pressed, or null. */
  tour: ([number, number] | null)[] | null;
  mount: (host: { stage: HTMLElement; svg: SVGSVGElement; read: FigureRead }, value: number) => FigureHandle;
};
