import { topics } from "@/content";

/** Where a topic sits in its own group, for labels like "Story 2 of 6". */
export function getPosition(slug: string) {
  const me = topics.find((t) => t.slug === slug);
  if (!me) return undefined;
  const group = topics.filter((t) => t.kind === me.kind);
  return { number: group.indexOf(me) + 1, total: group.length, kind: me.kind };
}
