/**
 * Whether the worklist markers render — `Todo` blocks and `PhotoSlot` frames.
 *
 * Three cases, and the difference between the last two is the whole point of this file:
 *
 * - `just dev` — on. Whoever is editing a page sees what is missing in the place it belongs,
 *   rather than in a checklist somewhere else.
 * - `just deploy-preview` — on, via `PUBLIC_SHOW_MARKERS=1`. The staging site is a reference copy
 *   shown to the people who are supposed to fill these gaps in; markers that disappear at exactly
 *   the moment the site gets shared are no use to them.
 * - `just build` — off. This is what CI runs and what publishes the live site.
 *
 * Off has to be the default rather than something the production build opts out of. The failure
 * mode is an internal note — "Most important gap on the site", naming a grant-diligence red flag —
 * appearing on the public site, and it would ship silently, because the whole nature of these
 * markers is that they are invisible in the build nobody looks at.
 *
 * Deliberately a separate flag rather than `astro build --mode staging`, which would flip
 * `import.meta.env.DEV` as a side effect: that also changes minification and drops Astro into a
 * development pipeline, so the staging site would stop being a faithful preview of production.
 * One variable changes, and it is this one.
 */
export const SHOW_MARKERS = import.meta.env.DEV || import.meta.env.PUBLIC_SHOW_MARKERS === '1'
