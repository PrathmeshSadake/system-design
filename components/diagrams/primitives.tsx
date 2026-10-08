import type { ReactNode } from "react";

/*
 * Small drawing kit shared by every diagram.
 *
 * Rules that keep pictures tidy (checked by scripts/check-diagrams.mjs):
 *  - Keep at least 24 units of empty space between content and the viewBox edge.
 *  - Text inside a Box must fit inside that Box.
 *  - No two pieces of text may touch, and no arrow may pass through text or a Box.
 *  - Arrows start and end on Box edges, never inside them.
 */

export type Tone = "sky" | "mint" | "sun" | "rose" | "grape" | "slate" | "white";

export const tones: Record<Tone, { fill: string; stroke: string; text: string }> = {
  sky: { fill: "#e0f2fe", stroke: "#0369a1", text: "#0c4a6e" },
  mint: { fill: "#dcfce7", stroke: "#15803d", text: "#14532d" },
  sun: { fill: "#fef3c7", stroke: "#b45309", text: "#78350f" },
  rose: { fill: "#ffe4e6", stroke: "#be123c", text: "#881337" },
  grape: { fill: "#ede9fe", stroke: "#6d28d9", text: "#4c1d95" },
  slate: { fill: "#f1f5f9", stroke: "#475569", text: "#1e293b" },
  white: { fill: "#ffffff", stroke: "#94a3b8", text: "#1e293b" },
};

export const ink = "#1e293b";
export const muted = "#475569";

type Pt = readonly [number, number];

/** Builds a straight path through a list of points. */
export function path(...pts: Pt[]): string {
  return pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
}

/** Shared arrowhead markers. Rendered once in the root layout. */
export function DiagramDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
      <defs>
        {(Object.keys(tones) as Tone[]).map((t) => (
          <marker
            key={t}
            id={`arrow-${t}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="9"
            markerHeight="9"
            markerUnits="userSpaceOnUse"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={tones[t].stroke} />
          </marker>
        ))}
      </defs>
    </svg>
  );
}

export function Diagram({
  id,
  title,
  description,
  width,
  height,
  caption,
  children,
}: {
  id: string;
  title: string;
  description: string;
  width: number;
  height: number;
  caption?: string;
  children: ReactNode;
}) {
  const titleId = `${id}-title`;
  const descId = `${id}-desc`;
  return (
    <figure className="diagram my-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" data-diagram={id}>
      <div className="diagram-scroll -mx-1 overflow-x-auto px-1 pb-1" tabIndex={0} aria-label={`${title}. Scroll sideways on small screens.`}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-labelledby={`${titleId} ${descId}`}
          className="mx-auto block h-auto w-full"
          style={{ maxWidth: width, minWidth: Math.round(width * 0.72) }}
          fontFamily="inherit"
        >
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          {children}
        </svg>
      </div>
      <p className="mt-2 text-xs text-slate-500 sm:hidden" aria-hidden="true">
        Swipe sideways to see the whole picture.
      </p>
      {caption ? <figcaption className="mt-4 text-sm leading-relaxed text-slate-600">{caption}</figcaption> : null}
    </figure>
  );
}

/** A rounded box with centered text. The first block of lines is bold, `note` lines are smaller. */
export function Box({
  x,
  y,
  w,
  h,
  label,
  note,
  tone = "sky",
  size = 15,
  dashed = false,
  rx = 12,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string | string[];
  note?: string | string[];
  tone?: Tone;
  size?: number;
  dashed?: boolean;
  rx?: number;
}) {
  const c = tones[tone];
  const main = label === undefined ? [] : Array.isArray(label) ? label : [label];
  const small = note === undefined ? [] : Array.isArray(note) ? note : [note];
  const noteSize = size - 2;
  const lines = [
    ...main.map((t) => ({ t, s: size, bold: true })),
    ...small.map((t) => ({ t, s: noteSize, bold: false })),
  ];
  const lh = (s: number) => s * 1.35;
  const total = lines.reduce((sum, l) => sum + lh(l.s), 0);
  let cursor = y + h / 2 - total / 2;
  return (
    <g data-box="">
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={rx}
        fill={c.fill}
        stroke={c.stroke}
        strokeWidth={2}
        strokeDasharray={dashed ? "6 5" : undefined}
      />
      {lines.length > 0 ? (
        <text textAnchor="middle" fill={c.text}>
          {lines.map((l, i) => {
            const cy = cursor + lh(l.s) / 2;
            cursor += lh(l.s);
            return (
              <tspan
                key={i}
                x={x + w / 2}
                y={cy}
                dominantBaseline="central"
                fontSize={l.s}
                fontWeight={l.bold ? 700 : 400}
              >
                {l.t}
              </tspan>
            );
          })}
        </text>
      ) : null}
    </g>
  );
}

/**
 * An area that groups other things. Dashed and empty by default, or a soft
 * filled panel with `filled`. Its label sits in the top left corner.
 * Boxes, text and arrows may all sit inside a Group.
 */
export function Group({
  x,
  y,
  w,
  h,
  label,
  tone = "slate",
  filled = false,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  tone?: Tone;
  filled?: boolean;
}) {
  const c = tones[tone];
  return (
    <g data-container="">
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={16}
        fill={filled ? c.fill : "none"}
        fillOpacity={filled ? 0.55 : undefined}
        stroke={c.stroke}
        strokeWidth={1.5}
        strokeDasharray={filled ? undefined : "7 6"}
      />
      {label ? (
        <text x={x + 14} y={y + 22} fontSize={13} fontWeight={700} fill={c.text}>
          {label}
        </text>
      ) : null}
    </g>
  );
}

/** Free text. Use `lines` for several lines that share one anchor. */
export function Label({
  x,
  y,
  text,
  size = 14,
  anchor = "middle",
  color = muted,
  weight = 400,
}: {
  x: number;
  y: number;
  text: string | string[];
  size?: number;
  anchor?: "start" | "middle" | "end";
  color?: string;
  weight?: number;
}) {
  const lines = Array.isArray(text) ? text : [text];
  return (
    <text textAnchor={anchor} fill={color} fontSize={size} fontWeight={weight} data-label="">
      {lines.map((t, i) => (
        <tspan key={i} x={x} y={y + i * size * 1.35} dominantBaseline="central">
          {t}
        </tspan>
      ))}
    </text>
  );
}

/** An arrow along a path. Use `path()` to build the `d` string. */
export function Arrow({
  d,
  tone = "slate",
  dashed = false,
  both = false,
  width = 2,
}: {
  d: string;
  tone?: Tone;
  dashed?: boolean;
  both?: boolean;
  width?: number;
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={tones[tone].stroke}
      strokeWidth={width}
      strokeDasharray={dashed ? "6 5" : undefined}
      markerEnd={`url(#arrow-${tone})`}
      markerStart={both ? `url(#arrow-${tone})` : undefined}
      data-arrow=""
    />
  );
}

/** A plain line with no arrowhead (for axes, dividers and links). */
export function Line({
  d,
  color = "#94a3b8",
  width = 2,
  dashed = false,
}: {
  d: string;
  color?: string;
  width?: number;
  dashed?: boolean;
}) {
  return (
    <path d={d} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dashed ? "6 5" : undefined} data-arrow="" />
  );
}

/**
 * A small dot that travels along a path forever. It is hidden for people who
 * prefer reduced motion (see globals.css). `delay` spreads several dots apart.
 */
export function Traveler({
  d,
  dur = 3,
  delay = 0,
  tone = "rose",
  r = 6,
}: {
  d: string;
  dur?: number;
  delay?: number;
  tone?: Tone;
  r?: number;
}) {
  return (
    <circle r={r} fill={tones[tone].stroke} className="motion" aria-hidden="true">
      <animateMotion dur={`${dur}s`} begin={`${-delay}s`} repeatCount="indefinite" path={d} rotate="auto" />
    </circle>
  );
}

/** A soft pulse used to draw the eye to one spot. Hidden for reduced motion. */
export function Pulse({ cx, cy, r = 10, tone = "rose" }: { cx: number; cy: number; r?: number; tone?: Tone }) {
  return (
    <circle cx={cx} cy={cy} r={r} fill="none" stroke={tones[tone].stroke} strokeWidth={2} className="motion pulse" aria-hidden="true" />
  );
}
