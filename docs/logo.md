# Logo

Two marks are in use while the bridge logo is still being drawn:

- **The road sign** (`src/assets/logo/sign.svg`), after the magnet on the van, is the wordmark in
  the masthead. It is black and white, and stays that way on the site's dark navy: the sign's black
  rim disappears into the background, so it reads as a white plate with black lettering. That is
  expected, not a rendering fault.
- **The favicon** (`public/favicon.svg`) is a placeholder: a bridge abstracted to three strokes, a
  deck and two supports, in the site's orange on its navy. It is scaffolding, not the logo.

The bridge is also drawn on the homepage, as the "How the bridge works" diagram
(`src/components/BridgeChain.astro`). That is the site's illustration of the idea rather than a
mark, and it does not need to change when the logo does.

The palette no longer comes from a mark. It was set in the redesign (a navy ground, signal orange,
kraft, and cobalt) and lives as tokens in `src/styles/global.css`, so the designer should have
those. If the finished mark does call for a colour change, change the token there, both its screen
value and its light value under `@media print`, and nothing else.

When the real bridge mark exists, replace the favicon, and swap the masthead import in
`Header.astro` if the bridge becomes the wordmark. A wordmark PNG is not enough; ask the designer
for:

- a horizontal lockup and a stacked lockup
- an icon-only mark that is still legible at 32px and at 16px
- a version that reads on the site's dark navy, and a single-colour version for print
- a favicon set derived from the icon

A bridge is easy to draw and hard to draw simply; the failure mode is a mark with too many spans
that turns to mush when small. Push toward fewer, heavier strokes than feel right at full size.
