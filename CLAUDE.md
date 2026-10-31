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
- **A person served appears in a photograph only with their consent.** Everyone identifiable must
  have agreed to appear on the public site, and a child needs a parent's or guardian's consent.
  Record it in a comment beside the `<Photo>`, or beside the photo's entry in an event file, with
  the date it was confirmed; if anyone in the
  frame has not agreed, crop them out or use another photo. The organization works with immigrant
  communities and families affected by ICE detentions, so being findable on a public website is
  a real risk, and only the person in the picture gets to take it. This is a safety constraint,
  not a style preference.

## Design constraints

The site is type-led on purpose. Do not introduce:

- a full-bleed hero, or any text set over a photograph
- icon triptychs or three-up feature cards. The one exception is the bridge diagram in
  `BridgeChain.astro`, allowed because it is a sequence (ordered steps joined by arrows), not a
  set of features. Do not reuse its shape for anything that is not a sequence
- a carousel, a parallax section, or an autoplaying video (actually, we may include two or three of these things, but there is a limited specialness budget)
- a third button treatment — solid (`.button`) and outline (`.button--quiet`) are the whole
  vocabulary. The homepage doors use those classes directly; the nav redraws the same pair at its
  own smaller size in `Header.astro`
- rounded "card" containers. The event cards in `EventList.astro` are square, and allowed because
  each one is a real, dated event, not a feature
- a photo slot that nobody has a photograph for — add the photograph when it exists, not a
  placeholder for it. An event card has no photo area until its file lists a photo

Photo-hungry layouts generate demand for roughly twenty images the organization does not have, and
that pressure is what pushes small nonprofits toward stock and synthetic filler. Eight to twelve
real photographs are enough for this whole site, and each one goes through `Photo.astro`, which
requires a caption so the image has to earn its place. An event's photos are the exception: they
are listed in its file and drawn by `EventList.astro`, whose schema requires the same alt text and
a caption saying what they show and when. They go in beside the event file through
`just add-event-photo`, which strips their location metadata as `just add-photo` does.

Colour, type, and spacing are tokens in `src/styles/global.css`. The site is dark on screen and
light in print, with no light screen theme and no toggle. The light values are under `@media print`
at the end of that file, and a new colour token needs one there too, or it prints as near-white on
white paper. Each accent has one job: signal orange for the primary act (Donate, an event's
sign-up), focus rings, the current-page mark, and event countdowns; cobalt for links and the
homepage's closing band; kraft for the transparency
bar and the bridge diagram's arrows. Text on orange is near-black, because white fails contrast
there. How the palette relates to the coming bridge logo is in `docs/logo.md`.

The fonts have fixed roles. The stencil face (`--font-headline`) sets the homepage's opening
tagline, its closing "Help us build the bridge", and the day numbers on event cards, and nothing
else. Every other heading,
button, and title is `--font-display` (Barlow Condensed), body text is `--font-sans`, and labels
and metadata are `--font-mono`.

## Structural invariants

- **Adding a page** means adding it to `PAGE_KEYS` and `routes` in `src/i18n/routes.ts` (both
  locales — `null` if untranslated), and passing `pageKey` plus `lastReviewed` to `Base.astro`.
  Both are enforced by the type checker.
- **Do not link to a page that does not exist.** `integrations/check-internal-links.mjs` fails the
  build. This is the guard against the nav rot that afflicts hand-maintained nonprofit sites.
- **Do not add a Spanish page by copying an English one.** Bilingual pages share a body component
  (`src/components/*Body.astro`, one per page) so the two versions cannot drift structurally.
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
- **No dev-only output.** Every build renders the same page. Missing facts hide their section
  (and show up in `just audit`); there are no in-page worklist markers.
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
- **A conditional element as spacing.** If a section's top margin comes from a block above it that
  can disappear (an empty event list, a missing fact), the page looks right until that block goes
  and then runs the heading into whatever is left. Give every section its own margin.
- **`astro build --outDir` on another filesystem** (e.g. `/tmp`) fails with `EXDEV`, because Astro
  renames files out of `.astro/`. Build inside the repo and copy.
- **A character outside a font's Google subset** renders in whatever system font has it. Astro
  downloads only the subsets listed in `astro.config.mjs`, and Google's Latin subset leaves out
  some common symbols: it has `↑` and `↓` but not `→`. This is why `BridgeChain.astro` draws its
  arrows in SVG.
- **A Google font with an optical-size axis** is served at its default size, which for Big
  Shoulders Stencil is the wider small-text cut, not the display cut the headline is meant to be.
  The `variableAxis` option in `astro.config.mjs` asks for the display end; remove it and the
  headline quietly gets wider.

## Known warnings

None. `The collection "events" does not exist or is empty` stopped appearing once the permanent
`_EXAMPLE_` file was added — `draft: true` keeps it off the page but it still counts as an entry.
If the warning comes back, the example was deleted: restore it rather than inventing an event.
