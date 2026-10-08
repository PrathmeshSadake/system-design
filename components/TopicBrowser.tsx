"use client";

import { useId, useMemo, useState } from "react";
import type { TopicSummary } from "@/lib/summaries";
import { TopicCard } from "./TopicCard";

export function TopicBrowser({ topics }: { topics: TopicSummary[] }) {
  const [query, setQuery] = useState("");
  const inputId = useId();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter((t) =>
      [t.title, t.short, t.area ?? "", ...t.parts].some((text) => text.toLowerCase().includes(q)),
    );
  }, [query, topics]);

  const concepts = filtered.filter((t) => t.kind === "concept");
  const cases = filtered.filter((t) => t.kind === "case-study");

  return (
    <div>
      <div className="max-w-xl">
        <label htmlFor={inputId} className="block text-sm font-semibold text-slate-800">
          Find a topic
        </label>
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try cache, queue, or payment"
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm placeholder:text-slate-500 focus:border-sky-700"
          autoComplete="off"
        />
        <p className="mt-2 text-sm text-slate-600" aria-live="polite">
          {query ? `${filtered.length} of ${topics.length} topics match.` : `${topics.length} topics to explore.`}
        </p>
      </div>

      {concepts.length > 0 ? (
        <section aria-labelledby="concepts-heading" className="mt-10">
          <h2 id="concepts-heading" className="text-2xl font-bold text-slate-900">
            Building blocks
          </h2>
          <p className="mt-1 text-slate-700">The basic ideas that every big system is made of.</p>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {concepts.map((t) => (
              <TopicCard key={t.slug} topic={t} />
            ))}
          </ul>
        </section>
      ) : null}

      {cases.length > 0 ? (
        <section aria-labelledby="cases-heading" className="mt-14">
          <h2 id="cases-heading" className="text-2xl font-bold text-slate-900">
            Real world stories
          </h2>
          <p className="mt-1 text-slate-700">Famous puzzles from shops, video apps, and banks, solved with the building blocks.</p>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cases.map((t) => (
              <TopicCard key={t.slug} topic={t} />
            ))}
          </ul>
        </section>
      ) : null}

      {filtered.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-slate-700">
          Nothing matches that yet. Try a shorter word.
        </p>
      ) : null}
    </div>
  );
}
