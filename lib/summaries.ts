import { topics } from "@/content";

export type TopicSummary = {
  slug: string;
  number: number;
  kind: "concept" | "case-study";
  area?: string;
  title: string;
  short: string;
  parts: string[];
};

export function getSummaries(): TopicSummary[] {
  const counters = { concept: 0, "case-study": 0 };
  return topics.map((t) => {
    counters[t.kind] += 1;
    return {
      slug: t.slug,
      number: counters[t.kind],
      kind: t.kind,
      area: t.area,
      title: t.title,
      short: t.short,
      parts: t.sections.map((s) => s.name),
    };
  });
}

/** Position of a topic inside its own group, for labels like "Case study 2 of 6". */
export function getPosition(slug: string) {
  const all = getSummaries();
  const me = all.find((s) => s.slug === slug);
  if (!me) return undefined;
  const total = all.filter((s) => s.kind === me.kind).length;
  return { number: me.number, total, kind: me.kind };
}
