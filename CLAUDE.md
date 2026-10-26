# Working in this repo

Static site for a small Dallas nonprofit, built with Astro 7. Read `README.md` first for the
layout; this file covers the things that are easy to get wrong.

## Commands

Everything runs in the nix dev shell. There is no `node` on the host.

```sh
nix develop -c just dev      # dev server
nix develop -c just check    # type-check; must be 0 errors
nix develop -c just build    # also runs the internal-link guard
nix develop -c just audit    # content gaps and staleness
nix develop -c just ci       # all of the above
```

## Non-negotiable content rules

The organization was denied funding partly because its site read as thin and unverifiable. Every
rule below exists because a grant reviewer checks that specific thing.

- **Do not invent facts.** No board members, no founding dates, no impact numbers, no testimonials,
  no quotes, no hours. Unknown facts stay `null` in `src/data/org.ts`; the UI hides the section and
  `just audit` reports it. A fabricated figure survives right up until a funder probes it, and then
  it discredits everything else on the page.
- **Do not generate imagery that implies an event occurred.** The logo, icons, patterns, a service
  map, and charts of real data are fine to construct. AI or stock photographs of people, shelves,
  volunteers, or distributions are not, under any framing.
- **Never add a photograph of a person served.** The organization works with immigrant communities
  and families affected by ICE detentions. This is a safety constraint, not a style preference.

## Design constraints

The site is type-led on purpose. Do not introduce:

- a full-bleed hero, or any text set over a photograph
- icon triptychs or three-up feature cards
- a carousel, a parallax section, or an autoplaying video (actually, we may include two or three of these things, but there is a limited specialness budget)
- a third button treatment — solid (`.button`) and outline (`.button--quiet`) are the whole
  vocabulary. The homepage doors use those classes directly; the nav redraws the same pair at its
  own smaller size in `Header.astro`
- rounded "card" containers
- a photo slot that nobody has a photograph for — use `PhotoSlot.astro`, which shows a shot brief
  in dev and on the staging site, and renders nothing in production

Photo-hungry layouts generate demand for roughly twenty images the organization does not have, and
that pressure is what pushes small nonprofits toward stock and synthetic filler. Eight to twelve
real photographs are enough for this whole site, and each one goes through `Photo.astro`, which
requires a caption so the image has to earn its place.

Colour, type, and spacing are tokens in `src/styles/global.css`. When the bridge logo is finalised,
re-derive `--accent` and `--accent-deep` from the mark and change nothing else.

## Structural invariants

- **Adding a page** means adding it to `PAGE_KEYS` and `routes` in `src/i18n/routes.ts` (both
  locales — `null` if untranslated), and passing `pageKey` plus `lastReviewed` to `Base.astro`.
  Both are enforced by the type checker.
- **Do not link to a page that does not exist.** `integrations/check-internal-links.mjs` fails the
  build. This is the guard against the nav rot that afflicts hand-maintained nonprofit sites.
- **Do not add a Spanish page by copying an English one.** Bilingual pages share a body component
  (`HomeBody.astro`, `ContactBody.astro`) so the two versions cannot drift structurally.
- **Never enable Astro's i18n `fallback`.** Untranslated pages are linked at their English URL via
  `navLink()` and marked "EN". Serving English under an `/es/` path would put English text inside
  `<html lang="es">`.
- **The navigation is full at seven items.** Do not add an eighth. Thin content spread wide looks
  far worse than rich content kept narrow, and this organization does not yet have enough content
  to fill what it has.
- **Only two nav items are emphasised** (`NAV_EMPHASIS` in `routes.ts`): Donate solid, Volunteer
  outline, reusing the existing `.button` / `.button--quiet` pair.
- **`src/content/` is the non-developer's territory.** Anything edited weekly belongs there, not in
  a `.astro` file. A git-backed CMS will be pointed at that directory.
- **Worklist markers are off by default.** `Todo`, `PhotoSlot`, and anything else gated on
  `SHOW_MARKERS` (`src/lib/markers.ts`) render in `just dev` and `just deploy-preview`, never in
  `just build`. Gate new dev-only output on that flag, not on `import.meta.env.DEV`.
- **Placeholder copy is not a fact.** A value like `(postal address TODO)` is deliberate — it marks
  the gap on the page — but it is a truthy string. Anything that *consumes* a fact rather than
  displaying it (the audit, the JSON-LD in `Base.astro`) must test it with `isPlaceholder` from
  `src/lib/placeholder.ts`, or it will publish the placeholder as the answer.
- **`_EXAMPLE_` files are permanent references** in `events/` and `updates/`, and must stay
  `draft: true`; `just audit` fails the build if one does not.

## Things that fail silently

Each of these has turned up in this repo, and none of them produces an error.

- **`formatDate` renders in UTC**, which is right for date-only values (`2026-08-27`) and wrong for
  a moment in time. Anything with a clock time — events — must pass `timeZone: 'America/Chicago'`,
  or a 7 PM event shows tomorrow's date beside the correct time.
- **A prop named `as`** stops Astro wiring `interface Props` to `Astro.props`. The component's props
  then go unchecked with no error; the only symptom is a ts(6196) hint that `Props` is unused.
- **A dev-only element as spacing.** If a section's top margin comes from the `Todo` or `PhotoSlot`
  above it, dev looks right and production runs the heading into the block before it. Give every
  section its own margin.
- **`astro build --outDir` on another filesystem** (e.g. `/tmp`) fails with `EXDEV`, because Astro
  renames files out of `.astro/`. Build inside the repo and copy.

## Known warnings

None. `The collection "events" does not exist or is empty` stopped appearing once the permanent
`_EXAMPLE_` file was added — `draft: true` keeps it off the page but it still counts as an entry.
If the warning comes back, the example was deleted: restore it rather than inventing an event.
