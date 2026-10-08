import Link from "next/link";
import { TopicBrowser } from "@/components/TopicBrowser";
import { getSummaries } from "@/lib/summaries";

const steps = [
  {
    title: "Start with a picture",
    text: "Each topic begins with an everyday story, like a lunch line or a toy box.",
  },
  {
    title: "Look at the drawings",
    text: "Simple diagrams show how the pieces connect. Some of them even move.",
  },
  {
    title: "Learn the grown-up words",
    text: "At the end of each page, the real names are matched to their simple meanings.",
  },
];

export default function HomePage() {
  const summaries = getSummaries();
  const first = summaries[0];
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="pb-12 pt-12 sm:pt-16" aria-labelledby="hero-heading">
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-800">System design for curious minds</p>
        <h1 id="hero-heading" className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
          Big computer ideas, told with small words.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-700">
          The apps you use every day are run by huge teams of computers working together. Here you will learn how they
          share the work, remember things, and keep going when something breaks, using playgrounds, toys, and snacks
          instead of hard words.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/topics/${first.slug}/`}
            className="rounded-full bg-sky-800 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-sky-900"
          >
            Start with lesson one
          </Link>
          <Link
            href="#topics"
            className="rounded-full border border-slate-300 bg-white px-5 py-3 text-base font-semibold text-slate-800 hover:bg-slate-50"
          >
            See every topic
          </Link>
        </div>
        <ol className="mt-12 grid gap-4 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-slate-200 bg-white p-5">
              <span className="text-sm font-semibold text-slate-500">Step {i + 1}</span>
              <h2 className="mt-1 text-lg font-bold text-slate-900">{s.title}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-700">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>
      <section id="topics" aria-label="All topics" className="border-t border-slate-200 pt-12">
        <TopicBrowser topics={summaries} />
      </section>
    </div>
  );
}
