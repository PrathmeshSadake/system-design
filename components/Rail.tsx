"use client";

import { useEffect, useState } from "react";

/** The lesson's parts, beside the column from 1100px. The part being read is marked. */
export function Rail({ items }: { items: { id: string; name: string }[] }) {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        const seen = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (seen[0]) setCurrent(seen[0].target.id);
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav className="rail" aria-label="Parts of this lesson">
      <div className="rail-inner">
        <p className="mono-label">On this page</p>
        <ol>
          {items.map((i) => (
            <li key={i.id}>
              <a href={`#${i.id}`} aria-current={current === i.id ? "true" : undefined}>
                {i.name}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
