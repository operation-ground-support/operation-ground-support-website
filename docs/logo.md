# Logo

Two marks are in use while the bridge logo is still being drawn:

- **The road sign** (`src/assets/logo/sign.svg`), after the magnet on the van, is the wordmark in
  the masthead. It is black and white, and stays that way on the site's dark navy: the sign's black
  rim disappears into the background, so it reads as a white plate with black lettering. That is
  expected, not a rendering fault.
- **The favicon** (`public/favicon.svg`) is "OGS" in black on a white plate, inset in the site's
  navy, the letters lifted from the road sign's own D-DIN outlines so the two match. It is a
  placeholder until the bridge mark has an icon. `just favicons` renders `favicon.ico` (16, 32, and
  48 px) and `apple-touch-icon.png` from it, so change the SVG and rerun that rather than editing
  the bitmaps. At 16 px, the size tabs use on standard-resolution screens, three letters are about
  as much as fits, which is one more reason the bridge icon will do better.

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
