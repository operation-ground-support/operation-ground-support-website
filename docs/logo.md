# Logo

Two marks are in use while the bridge logo is still being drawn:

- **The road sign** (`src/assets/logo/sign.svg`), after the magnet on the van, is the wordmark in
  the masthead.
- **The favicon** (`public/favicon.svg`) is a placeholder: a bridge abstracted to three strokes, a
  deck and two supports. It is scaffolding, not the logo.

When the real bridge mark exists, replace the favicon, swap the masthead import in `Header.astro`
if the bridge becomes the wordmark, and re-derive `--accent` and `--accent-deep` in `global.css`
from the mark. A wordmark PNG is not enough; ask the designer for:

- a horizontal lockup and a stacked lockup
- an icon-only mark that is still legible at 32px and at 16px
- a single-colour version, for print
- a favicon set derived from the icon
- the palette

A bridge is easy to draw and hard to draw simply; the failure mode is a mark with too many spans
that turns to mush when small. Push toward fewer, heavier strokes than feel right at full size.
