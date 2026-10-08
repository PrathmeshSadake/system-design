import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Figure } from "@/components/figures/Figure";
import { Rail } from "@/components/Rail";
import { getTopic, topics } from "@/content";
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

const two = (n: number) => String(n).padStart(2, "0");

export default async function TopicPage({ params }: Props) {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) notFound();

  const index = topics.findIndex((t) => t.slug === slug);
  const prev = topics[index - 1];
  const next = topics[index + 1];
  const pos = getPosition(slug)!;
  const label =
    pos.kind === "concept" ? `Lesson ${two(pos.number)} of ${pos.total}` : `${topic.area} story ${two(pos.number)} of ${pos.total}`;
  const parts = [
    ...topic.sections.map((s) => ({ id: s.id, name: s.name })),
    { id: "recap", name: "Quick recap" },
    { id: "words", name: "Grown-up words" },
  ];

  return (
    <div className="page">
      <div className="page-grid">
        <Rail items={parts} />

        <article className="col">
          <header>
            <nav aria-label="Breadcrumb" className="mono-label">
              <Link href="/" className="hover:text-[var(--color-ink)]">
                Home
              </Link>
              <span aria-hidden="true"> / </span>
              <span>{label}</span>
            </nav>
            <h1 className="page-h1">{topic.title}</h1>
            <p className="lede">{topic.bigIdea}</p>
          </header>

          {topic.sections.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="part">
              <div className="part-head">
                <span className="part-num" aria-hidden="true">
                  {two(i + 1)}
                </span>
                <h2 id={`${s.id}-h`} className="part-h2">
                  {s.name}
                </h2>
              </div>
              <p className="part-kid kid">{s.simple}</p>
              <div className="prose">
                {s.body.map((para, j) => (
                  <p key={j}>{para}</p>
                ))}
                {s.points ? (
                  <ul>
                    {s.points.map((pt, j) => (
                      <li key={j}>{pt}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
              {s.figure ? <Figure name={s.figure} /> : null}
              {s.remember ? (
                <div className="remember" role="note">
                  <p className="mono-label">Remember</p>
                  <p>{s.remember}</p>
                </div>
              ) : null}
            </section>
          ))}

          <section id="recap" aria-labelledby="recap-h" className="end">
            <h2 id="recap-h" className="part-h2">
              Quick recap
            </h2>
            <ol className="recap">
              {topic.recap.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ol>
          </section>

          <section id="words" aria-labelledby="words-h" className="part">
            <h2 id="words-h" className="part-h2">
              Grown-up words
            </h2>
            <p className="part-kid kid">and what they mean in plain words</p>
            <dl className="words">
              {topic.words.map((w) => (
                <div key={w.term}>
                  <dt>{w.term}</dt>
                  <dd>{w.meaning}</dd>
                </div>
              ))}
            </dl>
          </section>

          <nav aria-label="More lessons" className="pager">
            {prev ? (
              <Link href={`/topics/${prev.slug}/`}>
                <span className="mono-label">Previous</span>
                <span>{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/topics/${next.slug}/`}>
                <span className="mono-label">Next</span>
                <span>{next.title}</span>
              </Link>
            ) : (
              <Link href="/#lessons">
                <span className="mono-label">The end</span>
                <span>Back to every lesson</span>
              </Link>
            )}
          </nav>
        </article>
      </div>
    </div>
  );
}
