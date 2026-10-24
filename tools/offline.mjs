/**
 * Turn `dist/` into a folder someone can unzip and open by double-clicking `index.html`.
 *
 * The only thing standing between the build and that is link shape. Astro emits root-absolute
 * paths (`href="/about"`), which a web server resolves against the site root but a browser opening
 * a `file://` URL resolves against the filesystem root — so every link and every font 404s. This
 * rewrites those to relative paths, and maps directory-style routes onto the `index.html` that
 * actually backs them, because `file://` has no server to do that mapping.
 *
 * Nothing else about the page changes. The fonts are self-hosted, and the one external script is
 * the Donorbox form on the Donate page, which needs a connection; without one, that page shows its
 * plain link to Donorbox instead. So an offline copy is not a degraded version of the site — it is
 * the same pages with the links pointed somewhere else.
 *
 * Absolute `https://` URLs are deliberately left alone: the canonical and Open Graph tags should
 * keep pointing at the real site even in a copy that is being emailed around.
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'

const SRC = 'dist'
const OUT = process.argv[2] ?? 'dist-offline'

/** Every file in `dir`, as paths relative to it. */
async function walk(dir, base = dir) {
  const out = []
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(full, base)))
    else out.push(path.relative(base, full))
  }
  return out
}

/**
 * Resolve a root-absolute URL onto a real file in the build.
 *
 * `/about` is a directory route backed by `about/index.html`; `/404` is backed by `404.html`.
 * Returning `null` means nothing in the build answers to that path, which is worth reporting
 * rather than silently emitting a broken relative link.
 */
function resolveTarget(url, files) {
  const [pathPart, tail = ''] = [url.split(/(?=[?#])/)[0], url.slice(url.split(/(?=[?#])/)[0].length)]
  const rest = pathPart.replace(/^\/+/, '').replace(/\/$/, '')
  if (rest === '') return { file: 'index.html', tail }
  for (const candidate of [rest, `${rest}/index.html`, `${rest}.html`]) {
    if (files.has(candidate)) return { file: candidate, tail }
  }
  return null
}

/** `a/b/c.html` is two directories deep, so it reaches the root with `../../`. */
function prefixFor(file) {
  const depth = file.split('/').length - 1
  return depth === 0 ? './' : '../'.repeat(depth)
}

async function main() {
  try {
    await fs.access(SRC)
  } catch {
    console.error(`No \`${SRC}/\` to bundle. Run \`just build\` first.`)
    process.exit(1)
  }

  await fs.rm(OUT, { recursive: true, force: true })
  await fs.cp(SRC, OUT, { recursive: true })

  const all = await walk(OUT)
  const files = new Set(all.map((f) => f.split(path.sep).join('/')))
  const rewritable = all.filter((f) => /\.(html|css)$/.test(f))

  const unresolved = new Map()
  let rewrites = 0

  for (const file of rewritable) {
    const key = file.split(path.sep).join('/')
    const prefix = prefixFor(key)
    const full = path.join(OUT, file)
    let text = await fs.readFile(full, 'utf8')

    // `href="/x"` and friends, plus `url("/x")` inside the inline <style> that carries @font-face.
    // A leading `//` is protocol-relative and belongs to some other origin, so it is excluded.
    const replace = (match, open, url, close) => {
      const resolved = resolveTarget(url, files)
      if (!resolved) {
        unresolved.set(url, (unresolved.get(url) ?? 0) + 1)
        return match
      }
      rewrites += 1
      return `${open}${prefix}${resolved.file}${resolved.tail}${close}`
    }

    text = text.replace(
      /(\b(?:href|src|action)=")(\/(?!\/)[^"]*)(")/g,
      (m, a, url, c) => replace(m, a, url, c),
    )
    text = text.replace(
      /(url\(\s*"?)(\/(?!\/)[^")]*)("?\s*\))/g,
      (m, a, url, c) => replace(m, a, url, c),
    )

    await fs.writeFile(full, text)
  }

  // A sitemap and an rss feed are addressed to crawlers and carry absolute production URLs.
  // In a folder being emailed to a person they are noise at best and confusing at worst.
  for (const junk of ['sitemap-index.xml', 'sitemap-0.xml', 'robots.txt']) {
    await fs.rm(path.join(OUT, junk), { force: true })
  }

  console.log(`\x1b[1mOffline bundle\x1b[0m → ${OUT}/`)
  console.log(`  ${rewrites} links rewritten across ${rewritable.length} files`)

  if (unresolved.size > 0) {
    console.log(`\x1b[33m  ${unresolved.size} path(s) had nothing to point at:\x1b[0m`)
    for (const [url, n] of unresolved) console.log(`    ${url} (${n}×)`)
    console.log('\x1b[2m    These stay absolute and will not work offline.\x1b[0m')
  }

  console.log(`\x1b[2m  Open ${OUT}/index.html directly in a browser to check it.\x1b[0m`)
}

await main()
