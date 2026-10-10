export type Section = {
  /** Used for the page anchor, for example "token-bucket". */
  id: string;
  /** The grown-up name of the idea, for example "HTTP/3 (QUIC)". */
  name: string;
  /** A short, kid friendly way to say the same thing. */
  simple: string;
  /** Plain paragraphs. No markdown, no emojis, no em dashes. */
  body: string[];
  /** Optional bullet points shown after the paragraphs. */
  points?: string[];
  /** The Hairline figure for this part: a file name in hairline/figures, without .js. */
  figure?: string;
  /** One sentence to remember. */
  remember?: string;
  /** When this idea is the right tool. */
  useWhen?: string[];
  /** When to leave it alone. */
  skipWhen?: string[];
  /** Questions interviewers ask, and the traps beside them. */
  questions?: string[];
  /** Key in content/lld-examples.json: runnable Java and JavaScript for this part. */
  example?: string;
};

export type Topic = {
  slug: string;
  kind: "concept" | "case-study" | "lld";
  title: string;
  /** Case studies only: the kind of business, for example "E-Commerce". */
  area?: "E-Commerce" | "Streaming" | "Finance";
  /** One line for the topic card on the home page. */
  short: string;
  /** The everyday picture that runs through the whole page. */
  bigIdea: string;
  sections: Section[];
  recap: string[];
  words: { term: string; meaning: string }[];
};
