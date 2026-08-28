/**
 * Fails the build on any internal link that does not resolve to a page that was actually emitted.
 *
 * The reference site for this project (dallaslife.org) has three copies of its navigation with
 * different contents in each, a menu item literally titled "... - Old", and two different Form
 * 990s linked from two different places. That is what happens when pages get added faster than
 * they get retired, and no amount of discipline reliably prevents it over years and volunteers.
 *
 * Since this site is built from a repo, nav rot can be a build error instead of a discipline
 * problem. That is the single best reason to be on this stack rather than a hosted builder.
 *
 * Checks every `href` and `src` in the emitted HTML, not just the navigation, so a typo in a
 * one-off link inside a page is caught too. External links, mailto:, tel:, and fragments are
 * skipped — verifying those needs the network and would make builds flaky.
 */
import { readdir, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

/** Recursively collect every emitted file, relative to `root`, with POSIX separators. */
async function collectFiles(root, dir = root, out = new Set()) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) await collectFiles(root, full, out)
    else out.add(path.relative(root, full).split(path.sep).join('/'))
  }
  return out
}

const ATTR_RE = /(?:href|src)\s*=\s*"([^"]*)"/g

/** Links we deliberately do not verify. */
function isExternal(href) {
  return (
    href === '' ||
    href.startsWith('#') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('data:') ||
    href.startsWith('//') ||
    /^[a-z][a-z0-9+.-]*:/i.test(href)
  )
}

export function checkInternalLinks() {
  return {
    name: 'check-internal-links',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir)
        const emitted = await collectFiles(root)
        const htmlFiles = [...emitted].filter((f) => f.endsWith('.html'))

        /** A target resolves if it is a file, or a directory holding an index.html. */
        const resolves = (target) => {
          const clean = target.replace(/^\//, '')
          if (clean === '') return emitted.has('index.html')
          if (emitted.has(clean)) return true
          if (emitted.has(`${clean}/index.html`)) return true
          if (emitted.has(`${clean}.html`)) return true
          // Assets copied verbatim from /public that the crawler may reference with a trailing slash
          return existsSync(path.join(root, clean))
        }

        const broken = []
        for (const file of htmlFiles) {
          const html = await readFile(path.join(root, file), 'utf8')
          for (const match of html.matchAll(ATTR_RE)) {
            const raw = match[1]
            if (isExternal(raw)) continue
            if (!raw.startsWith('/')) continue // relative links are rare here; skip rather than guess a base
            const target = raw.split('#')[0].split('?')[0].replace(/\/$/, '')
            if (!resolves(target)) {
              broken.push({ from: `/${file.replace(/index\.html$/, '')}`, to: raw })
            }
          }
        }

        if (broken.length > 0) {
          const detail = broken
            .map((b) => `  ${b.to}  (linked from ${b.from})`)
            .sort()
            .join('\n')
          logger.error(`${broken.length} internal link(s) point at pages that do not exist:\n${detail}`)
          throw new Error(
            'Broken internal links. Either create the page or remove the link — a nav entry that ' +
              '404s is worse in front of a funder than one that is missing.',
          )
        }

        logger.info(`checked internal links across ${htmlFiles.length} pages — all resolve`)
      },
    },
  }
}
