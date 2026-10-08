import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DiagramView } from "@/components/diagrams";
import { topics, getTopic } from "@/content";
import { getPosition } from "@/lib/summaries";

export const dynamicParams = false;

export function generateStaticParams() {
  return topics.map((t) => ({ slug: t.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) return {};
  return { title: topic.title, description: topic.short };
}

export default async function TopicPage({ params }: Props) {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) notFound();

  const index = topics.findIndex((t) => t.slug === slug);
  const prev = topics[index - 1];
  const next = topics[index + 1];
  const pos = getPosition(slug)!;
  const eyebrow =
    pos.kind === "concept"
      ? `Building block ${pos.number} of ${pos.total}`
      : `${topic.area} story, ${pos.number} of ${pos.total}`;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <nav aria-label="Breadcrumb" className="pt-8 text-sm text-slate-600">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="underline decoration-slate-300 underline-offset-4 hover:text-slate-900">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-slate-800">
            {topic.title}
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl pb-8 pt-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-800">{eyebrow}</p>
        <h1 className="mt-2 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">{topic.title}</h1>
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-900">The big picture</h2>
          <p className="mt-2 text-lg leading-relaxed text-slate-800">{topic.bigIdea}</p>
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-12">
        <aside className="mb-10 lg:col-start-2 lg:row-start-1 lg:mb-0">
          <nav
            aria-labelledby="toc-heading"
            className="rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24"
          >
            <h2 id="toc-heading" className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              On this page
            </h2>
            <ol className="mt-3 space-y-2 text-[15px]">
              {topic.sections.map((s, i) => (
                <li key={s.id} className="flex gap-2">
                  <span className="w-5 shrink-0 text-slate-500" aria-hidden="true">
                    {i + 1}.
                  </span>
                  <a href={`#${s.id}`} className="text-slate-800 underline decoration-slate-300 underline-offset-4 hover:text-sky-800">
                    {s.name}
                  </a>
                </li>
              ))}
              <li className="flex gap-2">
                <span className="w-5 shrink-0" aria-hidden="true" />
                <a href="#recap" className="text-slate-800 underline decoration-slate-300 underline-offset-4 hover:text-sky-800">
                  Quick recap
                </a>
              </li>
              <li className="flex gap-2">
                <span className="w-5 shrink-0" aria-hidden="true" />
                <a href="#words" className="text-slate-800 underline decoration-slate-300 underline-offset-4 hover:text-sky-800">
                  Grown-up words
                </a>
              </li>
            </ol>
          </nav>
        </aside>

        <article className="min-w-0 max-w-3xl lg:col-start-1 lg:row-start-1">
          {topic.sections.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-heading`} className="border-t border-slate-200 py-10 first:border-t-0 first:pt-0">
              <p className="text-sm font-semibold text-slate-500">Part {i + 1}</p>
              <h2 id={`${s.id}-heading`} className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                {s.name}
              </h2>
              <p className="mt-2 text-lg text-sky-900">{s.simple}</p>
              <div className="mt-5 space-y-4 text-[17px] leading-8 text-slate-800">
                {s.body.map((para, j) => (
                  <p key={j}>{para}</p>
                ))}
              </div>
              {s.points ? (
                <ul className="mt-5 list-disc space-y-2 pl-6 text-[17px] leading-7 text-slate-800 marker:text-slate-400">
                  {s.points.map((pt, j) => (
                    <li key={j}>{pt}</li>
                  ))}
                </ul>
              ) : null}
              {s.diagrams?.map((d) => <DiagramView key={d} name={d} />)}
              {s.remember ? (
                <aside className="mt-6 rounded-xl border-l-4 border-emerald-600 bg-emerald-50 px-5 py-4" aria-label="Remember">
                  <p className="text-sm font-semibold text-emerald-900">Remember</p>
                  <p className="mt-1 text-[17px] leading-7 text-slate-800">{s.remember}</p>
                </aside>
              ) : null}
            </section>
          ))}

          <section id="recap" aria-labelledby="recap-heading" className="border-t border-slate-200 py-10">
            <h2 id="recap-heading" className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Quick recap
            </h2>
            <ol className="mt-5 list-decimal space-y-3 pl-6 text-[17px] leading-7 text-slate-800 marker:font-semibold marker:text-slate-500">
              {topic.recap.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ol>
          </section>

          <section id="words" aria-labelledby="words-heading" className="border-t border-slate-200 py-10">
            <h2 id="words-heading" className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Grown-up words
            </h2>
            <p className="mt-2 text-slate-700">The real names you will hear, and what they mean in plain words.</p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              {topic.words.map((w) => (
                <div key={w.term} className="rounded-xl border border-slate-200 bg-white p-4">
                  <dt className="font-semibold text-slate-900">{w.term}</dt>
                  <dd className="mt-1 text-[15px] leading-relaxed text-slate-700">{w.meaning}</dd>
                </div>
              ))}
            </dl>
          </section>

          <nav aria-label="More topics" className="grid gap-4 border-t border-slate-200 pt-10 sm:grid-cols-2">
            {prev ? (
              <Link href={`/topics/${prev.slug}/`} className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-sm">
                <span className="block text-sm text-slate-600">Previous</span>
                <span className="mt-1 block font-bold text-slate-900">{prev.title}</span>
              </Link>
            ) : (
              <span className="hidden sm:block" />
            )}
            {next ? (
              <Link href={`/topics/${next.slug}/`} className="rounded-2xl border border-slate-200 bg-white p-5 text-right hover:border-slate-300 hover:shadow-sm">
                <span className="block text-sm text-slate-600">Next</span>
                <span className="mt-1 block font-bold text-slate-900">{next.title}</span>
              </Link>
            ) : (
              <Link href="/#topics" className="rounded-2xl border border-slate-200 bg-white p-5 text-right hover:border-slate-300 hover:shadow-sm">
                <span className="block text-sm text-slate-600">You made it to the end</span>
                <span className="mt-1 block font-bold text-slate-900">Back to all topics</span>
              </Link>
            )}
          </nav>
        </article>
      </div>
    </div>
  );
}
