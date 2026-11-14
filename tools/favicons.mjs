/**
 * `just favicons`: the bitmap icons, rendered from `public/favicon.svg`.
 *
 * Browsers that support SVG icons use the SVG itself. Everything else takes one of these:
 *
 *   - `favicon.ico`, holding 16, 32, and 48 px versions: older browsers, Windows, and the icon Google
 *     shows beside search results, which wants a multiple of 48 px.
 *   - `apple-touch-icon.png`, 180 px, for a site saved to an iPhone or iPad home screen. It must be
 *     opaque, because iOS fills transparent corners with black and then rounds the corners itself,
 *     so the icon is set on a full navy square with more margin than the tab icon has.
 *
 * Each `.ico` entry is a PNG, which every browser in use accepts. That keeps this to Sharp, already
 * a dependency, rather than another image tool.
 */
import { readFile, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const SOURCE = 'public/favicon.svg'
/** The site's `--paper`, the navy the icon is set in. */
const NAVY = '#0d1129'
const ICO_SIZES = [16, 32, 48]
const TOUCH_SIZE = 180

const svg = await readFile(SOURCE)

/** The SVG rendered straight at `size`, so each size is drawn from the vectors, not scaled down. */
const render = (size) => sharp(svg, { density: (72 * size) / 64 }).resize(size, size).png().toBuffer()

/** An `.ico` file: a 6-byte header, a 16-byte entry per image, then the images themselves. */
function ico(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // 1 = icon
  header.writeUInt16LE(images.length, 4)

  let offset = 6 + 16 * images.length
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size % 256, 0) // width; 0 would mean 256
    entry.writeUInt8(size % 256, 1) // height
    entry.writeUInt8(0, 2) // no palette
    entry.writeUInt8(0, 3) // reserved
    entry.writeUInt16LE(1, 4) // colour planes
    entry.writeUInt16LE(32, 6) // bits per pixel
    entry.writeUInt32LE(data.length, 8)
    entry.writeUInt32LE(offset, 12)
    offset += data.length
    return entry
  })
  return Buffer.concat([header, ...entries, ...images.map(({ data }) => data)])
}

const images = await Promise.all(ICO_SIZES.map(async (size) => ({ size, data: await render(size) })))
await writeFile('public/favicon.ico', ico(images))

// The tab icon at about 78% of the square, on navy, so iOS's rounded corners trim only navy.
const inner = Math.round(TOUCH_SIZE * 0.78)
await sharp({ create: { width: TOUCH_SIZE, height: TOUCH_SIZE, channels: 3, background: NAVY } })
  .composite([{ input: await render(inner), gravity: 'center' }])
  .flatten({ background: NAVY })
  .png()
  .toFile('public/apple-touch-icon.png')

console.log(`wrote public/favicon.ico (${ICO_SIZES.join(', ')} px) and public/apple-touch-icon.png (${TOUCH_SIZE} px)`)
