import type { CSSProperties } from "react";
import Link from "next/link";
import { HeroFigure } from "@/components/HeroFigure";
import { caseStudies, concepts } from "@/content";
import type { Topic } from "@/lib/types";

const at = (i: number) => ({ "--i": i }) as CSSProperties;
const two = (n: number) => String(n).padStart(2, "0");

function Rows({ items }: { items: Topic[] }) {
  return (
    <ol className="lesson-list">
      {items.map((t, i) => (
        <li key={t.slug}>
          <Link href={`/topics/${t.slug}/`} className="lesson-row">
            <span className="lesson-num" aria-hidden="true">
              {two(i + 1)}
            </span>
            <span className="lesson-title">
              {t.title}
              {t.area ? <span className="block text-[12.5px] font-normal text-[var(--color-muted)]">{t.area}</span> : null}
            </span>
            <span className="lesson-short">{t.short}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export default function HomePage() {
  const first = concepts[0];
  return (
    <div className="mx-auto max-w-[1080px] px-[var(--gutter)] pb-20">
      <section aria-labelledby="hero" className="rise grid justify-items-center pt-[clamp(48px,9vh,96px)] text-center">
        <p className="mono-label" style={at(0)}>
          System design for curious kids
        </p>
        <h1 id="hero" className="hero-title mt-5" style={at(1)}>
          Big computer systems, explained <em>small.</em>
        </h1>
        <p className="hero-sub" style={at(2)}>
          How apps share the work, remember things and keep going when something breaks, told with lunch lines, toy
          boxes and cookie jars. Every drawing answers your pointer.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3" style={at(3)}>
          <Link className="btn btn-primary" href={`/topics/${first.slug}/`}>
            Start lesson one
          </Link>
          <Link className="btn" href="#lessons">
            See all twenty
          </Link>
        </div>
        <div className="hero-art" style={at(4)}>
          <HeroFigure />
        </div>
      </section>

      <section id="lessons" aria-labelledby="lessons-h" className="mx-auto mt-16 max-w-[880px]">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 id="lessons-h" className="text-[20px] font-medium tracking-[-0.015em]">
            Lessons
          </h2>
          <p className="mono-label">{concepts.length} building blocks</p>
        </div>
        <Rows items={concepts} />
      </section>

      <section id="stories" aria-labelledby="stories-h" className="mx-auto mt-20 max-w-[880px]">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 id="stories-h" className="text-[20px] font-medium tracking-[-0.015em]">
            Real world stories
          </h2>
          <p className="mono-label">{caseStudies.length} case studies</p>
        </div>
        <Rows items={caseStudies} />
      </section>
    </div>
  );
}
