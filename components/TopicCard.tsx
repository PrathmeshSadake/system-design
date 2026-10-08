import Link from "next/link";
import type { TopicSummary } from "@/lib/summaries";

export function TopicCard({ topic }: { topic: TopicSummary }) {
  const isCase = topic.kind === "case-study";
  return (
    <li className="h-full">
      <Link
        href={`/topics/${topic.slug}/`}
        className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
      >
        <span className="flex items-center gap-3 text-sm font-semibold text-slate-600">
          <span
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm ${
              isCase ? "bg-amber-100 text-amber-900" : "bg-sky-100 text-sky-900"
            }`}
            aria-hidden="true"
          >
            {topic.number}
          </span>
          {isCase ? `${topic.area} story` : "Building block"}
        </span>
        <span className="mt-3 text-lg font-bold text-slate-900 group-hover:text-sky-800">{topic.title}</span>
        <span className="mt-2 text-[15px] leading-relaxed text-slate-700">{topic.short}</span>
        <span className="sr-only">Covers: </span>
        <span className="mt-4 flex flex-wrap gap-2">
          {topic.parts.map((p) => (
            <span key={p} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
              {p}
            </span>
          ))}
        </span>
      </Link>
    </li>
  );
}
