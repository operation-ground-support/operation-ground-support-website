# Operation Ground Support — website

A static site for [operation-ground-support.org](https://operation-ground-support.org). Built with
[Astro](https://astro.build), which compiles a folder of components and Markdown into a folder of
plain HTML.

## Running it

```sh
nix develop          # node, npm, just, and the image tools
just install         # once, and after any lockfile change
just dev             # http://localhost:4321, live reload
just lan # binds to every interface, so you can open it on a mobile device

just dev-status
just dev-logs
just dev-stop # to actually stop the Astro 7 dev server
```

Or without staying in the shell: `nix develop -c just dev`.

```sh
just build           # → dist/
just check           # type-check, including .astro files and content frontmatter
just audit           # what content is missing or stale
just ci              # everything the CI workflow runs
just --list          # the rest
```

## If you have written Rust but not a website

A few mappings that make the rest of this legible:

| Rust | here |
| --- | --- |
| `Cargo.toml` | `package.json` |
| `Cargo.lock` | `package-lock.json` — commit it, `just install` respects it exactly |
| `cargo build` | `just build`, output in `dist/` instead of `target/` |
| `cargo check` | `just check` |
| a `struct` with `#[derive(Deserialize)]` | a zod schema in `src/content.config.ts` |
| `serde` failing on bad input | the build failing on a malformed content file |
| `Option<T>` | `T | null` in `src/data/org.ts`, and the same discipline applies |
| a trait bound that won't compile | a missing translation in `src/i18n/ui.ts` |

The one genuinely unfamiliar idea is that a `.astro` file has two parts separated by `---`: the
top half is TypeScript that runs **at build time only**, and the bottom half is the HTML it
produces. Nothing in the top half ships to the browser. There is no client-side framework here and
no hydration; the only JavaScript that reaches a visitor is the twenty lines in `EventList.astro`.

## Layout

```
astro.config.mjs        site config: i18n, fonts, integrations
integrations/           build-time guards (see below)
tools/audit.mjs         `just audit`
src/
  data/org.ts           every organizational fact, in one place
  i18n/routes.ts        the route table; untranslated pages are an explicit `null`
  i18n/ui.ts            interface strings, en + es
  content.config.ts     schemas for the content collections
  content/
    needs/              dated "what we need right now" lists   ← edited weekly
    updates/            short posts                            ← edited weekly
    events/             distributions and drives               ← edited weekly
  layouts/Base.astro    the page shell
  components/           shared pieces
  pages/                one file per URL; `es/` holds the Spanish routes
  styles/global.css     design tokens and base styles
```

`src/content/` is the part a non-developer edits. Everything else is code. That split is
deliberate: when a git-backed CMS is added (Sveltia or Decap), it points at `src/content/` and
nothing has to move.

## The build refuses to ship certain mistakes

- A content file that does not match its schema fails the build.
- An internal link pointing at a page that does not exist fails the build
  (`integrations/check-internal-links.mjs`). The reference site this project was modelled against
  has three copies of its navigation with different contents in each, and a menu item titled
  "... – Old". Over years and volunteers, no amount of discipline prevents that; a build error does.
- A new page cannot be added without a `lastReviewed` date, because `Base.astro` requires the
  prop. `just audit` reports pages that have aged out.
- A missing Spanish translation is an explicit `null` in `src/i18n/routes.ts`. The link still
  appears in the Spanish nav, pointing at the canonical English URL and marked "EN" — what never
  happens is English content served under an `/es/` path, which would put English text inside
  `<html lang="es">` and break both screen readers and search indexing.

## Ground rules for content

These are not stylistic preferences. Each one is something a grant reviewer checks.

1. **Never publish a number nobody counted.** `org.metrics` requires a `basis` field — the sentence
   saying what was counted and how — because "roughly 40 bags a week, counted at the door" is more
   persuasive than "4,000 families served" precisely because it sounds like someone counted.
2. **Never generate an image that implies an event occurred.** No AI or stock photographs of
   people, shelves, volunteers, or distributions. Generating the logo, icons, patterns, or a map is
   fine; generating evidence is not. One synthetic photo discredits every other claim on the page.
3. **Never photograph the people served.** This is a safety question given who walks through that
   door, not only a dignity one. Volunteers can appear with a signed release. Rooms, hands,
   shelves, boxes, doors, and the parking lot are the visual vocabulary — and unglamorous
   specificity is more convincing than smiling-recipient photography, which reads as marketing.
4. **`null` beats a plausible guess.** A missing fact renders as nothing and shows up in
   `just audit`. A fabricated one survives until a funder probes it.

`just add-photo <source> <name>` resizes a photograph and strips its EXIF metadata. Phone photos
carry GPS coordinates; publishing them from this address would be a real disclosure.

## Deploying

`dist/` is plain HTML and works unchanged on Cloudflare Pages, Netlify, GitHub Pages, or a bare
bucket. See [docs/operations.md](docs/operations.md) for the DNS sequence, the scheduled rebuild,
and the account-ownership checklist.
