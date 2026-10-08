# Little Builders: System Design Made Simple

A small website that explains big system design ideas the way you would explain them to a five year old: with
playgrounds, toys, snacks, and simple moving pictures.

It covers 14 building blocks (capacity estimation, networking, storage, caching, queues, consensus, sharding,
transactions, streaming, resiliency, observability, domain design, migrations, and cost) and 6 real world case
studies (flash sales, order fulfillment, live leaderboards, video delivery, payment ledgers, and fraud detection).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build the static site

```bash
npm run build      # writes plain HTML, CSS and JS to ./out
npm start          # serves ./out locally
```

Every page is generated at build time (`output: "export"` in `next.config.mjs`), so there is no server code at
all. On Vercel, import the repository and keep the default Next.js settings. No environment variables are needed.

## Checks

```bash
npm run typecheck
npm run check:content    # no emojis, no em or en dashes, no markdown emphasis, no leftover TODOs
npm run build && npm run check:diagrams
```

`check:diagrams` opens every page in Chromium (laptop and phone sizes) and fails if any diagram has text that
overlaps other text, text that spills out of its box, arrows running through text or boxes, boxes overlapping, content
too close to the picture edge, or if a page scrolls sideways. It uses `playwright-core` and looks for Chromium at
`/opt/pw-browsers/chromium-1194`; set `CHROME_PATH` to point at another Chrome or Chromium binary.

## How it is organized

```
app/                       pages (home, one page per topic, not found)
components/diagrams/       one file of SVG diagrams per topic, plus the shared drawing kit (primitives.tsx)
content/topics/            the words for each topic, as typed data
content/index.ts           reading order
lib/                       types and small helpers
scripts/                   content and diagram checkers
```

To add a topic, create `content/topics/<slug>.ts`, add it to `content/index.ts`, and put its diagrams in a file
under `components/diagrams/` that is spread into `diagramRegistry` in `components/diagrams/index.tsx`.

Animations are plain SVG and CSS, and they switch off for anyone who has asked their device for reduced motion.
