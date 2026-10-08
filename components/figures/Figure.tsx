"use client";

import { useEffect, useRef, useState } from "react";
import meta from "./generated/meta.json";
import { loaders } from "./generated/registry";
import type { FigureHandle } from "./types";

type Meta = Record<string, { means: string; range: number[] }>;
const META: Meta = meta;

/**
 * One Hairline figure, mounted the way the hairline-create skill's bench page
 * mounts it: a stage with a 400 x 320 svg, a read-out in the corner, and a play
 * button that walks the figure's tour with an unseen pointer.
 *
 * The plate keeps its 5:4 box from CSS, so nothing shifts while the figure's
 * code loads. The code loads only when the plate comes near the screen, and the
 * kernel's one frame loop sleeps while a figure is still or off screen.
 */
export function Figure({ name, caption }: { name: string; caption?: string }) {
  const stage = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const control = useRef<{ play: () => void; stop: () => void } | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const info = META[name];

  useEffect(() => {
    const el = stage.current;
    if (!el || !loaders[name]) return;
    let gone = false;
    let handle: FigureHandle | null = null;
    let walk: { stop: () => void } | null = null;

    const start = async () => {
      const [{ HL }, mod] = await Promise.all([import("./generated/kernel.js"), loaders[name]()]);
      if (gone) return;
      const figure = mod.default;
      HL.inject(document);
      const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, el) as SVGSVGElement;
      let text: string | null = null;
      const read = {
        get textContent() {
          return text;
        },
        set textContent(value: string | null) {
          text = value == null ? "" : String(value);
          if (readout.current) readout.current.textContent = text;
        },
      };
      handle = figure.mount({ stage: el, svg, read }, figure.range[1]);
      if (text === null) read.textContent = "rest";
      control.current = {
        play: () => {
          walk = HL.tour(el, figure.tour || HL.LAP, () => {});
        },
        stop: () => {
          walk?.stop();
          walk = null;
        },
      };
      setReady(true);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        void start();
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);

    return () => {
      gone = true;
      io.disconnect();
      walk?.stop();
      handle?.destroy();
      el.replaceChildren();
      control.current = null;
    };
  }, [name]);

  const toggle = () => {
    if (!control.current) return;
    if (playing) control.current.stop();
    else control.current.play();
    setPlaying(!playing);
  };

  const words = caption ?? info?.means ?? "";
  return (
    <figure className="figure">
      <div className="figure-plate">
        <span className="figure-tag" aria-hidden="true">
          {name}
        </span>
        <span className="figure-tag figure-read" ref={readout} aria-hidden="true">
          rest
        </span>
        <div ref={stage} className="figure-stage" data-hairline={name} role="img" aria-label={words} />
        <button
          type="button"
          className="figure-play"
          onClick={toggle}
          aria-pressed={playing}
          disabled={!ready}
          aria-label={playing ? `Stop the ${name} tour` : `Play the ${name} tour`}
        >
          {playing ? "stop" : "play"}
        </button>
      </div>
      {words ? <figcaption className="figure-caption">{words}</figcaption> : null}
    </figure>
  );
}
