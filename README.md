# Little Builders: system design, explained small

A small website that explains big system design ideas the way you would explain them to a five year old: with lunch
lines, toy boxes and cookie jars. Every drawing is a [Hairline](https://hairline.lucasmarkes.com/) figure, an
isometric line drawing that answers your pointer.

It covers 14 building blocks (capacity estimation, networking, storage, caching, queues, consensus, sharding,
transactions, streaming, resiliency, observability, domain design, migrations, and cost) and 6 real world case
studies (flash sales, order fulfillment, live leaderboards, video delivery, payment ledgers, and fraud detection).

## Run it

```bash
bun install
bun run dev        # http://localhost:3000
```

## Build the static site

```bash
bun run build      # writes plain HTML, CSS and JS to ./out
bun run start      # serves ./out locally
```

Every page is generated at build time (`output: "export"` in `next.config.mjs`), so there is no server code at
all. On Vercel, import the repository and keep the default Next.js settings. No environment variables are needed.

## The figures

- The home page's rack of server blades is `Cabinet` from [`@lucasmarkes/hairline`](https://www.npmjs.com/package/@lucasmarkes/hairline).
- Every lesson figure was drawn with the **hairline-create** skill (installed with `npx skills add lucasmarkes/hairline`,
  kept in `.claude/skills/hairline-create`). Each one is a single file in `hairline/figures/`, written in the skill's
  format and checked with its validator and its browser look.
- `scripts/figures.mjs` (run by Bun before `dev`, `build` and `typecheck`) wraps each figure file, unchanged, into an ES
  module next to the skill's kernel (`hairline/kernel.js`, also unchanged), and writes a registry so each figure is
  its own small chunk that loads only when it comes near the screen.
- `components/figures/Figure.tsx` mounts a figure the way the skill's bench page does: the stage, the read-out in
  the corner, and a play button that walks the figure's tour.

To change a figure, edit `hairline/figures/<name>.js` and check it with the skill:

```bash
node .claude/skills/hairline-create/look.mjs hairline/figures/<name>.js --answer x,y,z   # the skill's tools need Node
```

## Checks

```bash
bun run typecheck
bun run check:content    # no emojis, no em or en dashes, no markdown emphasis, no leftover TODOs
bun run build && bun run check:figures
```

`check:figures` runs every figure through the hairline-create validator, then opens every page in Chromium at laptop
and phone sizes: each figure must draw, answer a pointer on its first tour stop, return to rest when the pointer
leaves, and no page may scroll sideways or log an error. It runs on Node, because the skill's validator loads each
figure in a Node child process; everything else runs on Bun. It uses `playwright-core` and looks for Chromium at
`/opt/pw-browsers/chromium-1194`; set `CHROME_PATH` to point at another Chrome or Chromium binary.

## How it is organized

```
app/                        pages (home, one page per lesson, not found)
components/figures/         the Figure component and the generated figure modules
hairline/                   the skill's kernel and one file per figure
content/topics/             the words for each lesson, as typed data
content/index.ts            reading order
scripts/                    figure wrapper and checkers
.claude/skills/             the hairline-create skill
```
