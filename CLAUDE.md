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
- **Do not answer the Get help questions on the organization's behalf.** `org.intake` is `null`
  because only the board can say whether ID is required or whether anyone is asked about
  immigration status. Guessing wrong causes someone to make a trip they cannot afford, or worse.

## Design constraints

The site is type-led on purpose. Do not introduce:

- a full-bleed hero, or any text set over a photograph
- icon triptychs or three-up feature cards
- a carousel, a parallax section, or an autoplaying video
- a second button style, or rounded "card" containers
- a photo slot that nobody has a photograph for — use `PhotoSlot.astro`, which shows a shot brief
  in dev and renders nothing in production

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
  (`GetHelpBody.astro`, `ContactBody.astro`) so the two versions cannot drift structurally.
- **Never enable Astro's i18n `fallback`.** Untranslated pages are linked at their English URL via
  `navLink()` and marked "EN". Serving English under an `/es/` path would put English text inside
  `<html lang="es">`. Get help is the one page that must always be a real translation, never a
  fallback.
- **Do not add an eighth top-level nav item.** Seven pages is the budget. Thin content spread wide
  looks far worse than rich content kept narrow, and this organization does not yet have enough
  content to fill what it has.
- **`src/content/` is the non-developer's territory.** Anything edited weekly belongs there, not in
  a `.astro` file. A git-backed CMS will be pointed at that directory.

## Known warnings

`The collection "events" does not exist or is empty` during a build is expected until a real event
file is added. It is not a defect, and it should not be silenced by inventing an event.
