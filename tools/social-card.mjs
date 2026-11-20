/**
 * `just social-card`: the picture a link to the site shows when it is pasted into a text message,
 * a social post, or a chat, rendered from the road sign in `src/assets/logo/sign.svg`.
 *
 * It has to be a bitmap: iMessage, Facebook, LinkedIn, Slack, and the rest do not accept an SVG
 * here. Without one, iMessage picks a photograph off the page instead, which is how a link to the
 * homepage came to be previewed as an event photo.
 *
 * 1200 × 630 is the shape all of them expect. The sign sits in the middle with wide margins on
 * navy, because some apps crop the picture to a square and the sign has to survive that.
 */
import { readFile } from 'node:fs/promises'
import sharp from 'sharp'

const SOURCE = 'src/assets/logo/sign.svg'
const TARGET = 'public/social-card.png'
/** The site's `--paper`. */
const NAVY = '#0d1129'
const WIDTH = 1200
const HEIGHT = 630
/** Narrower than the 630 px square a cropping app keeps, with room to spare on either side. */
const SIGN_WIDTH = 560

const svg = await readFile(SOURCE)
const { width: svgWidth } = await sharp(svg).metadata()

// Rendered straight at its final size from the vectors, not drawn small and scaled up.
const sign = await sharp(svg, { density: (72 * SIGN_WIDTH) / svgWidth })
  .resize({ width: SIGN_WIDTH })
  .png()
  .toBuffer()

await sharp({ create: { width: WIDTH, height: HEIGHT, channels: 3, background: NAVY } })
  .composite([{ input: sign, gravity: 'center' }])
  .flatten({ background: NAVY })
  .png({ compressionLevel: 9 })
  .toFile(TARGET)

console.log(`wrote ${TARGET} (${WIDTH} × ${HEIGHT})`)
