/**
 * `just audit` — the content worklist.
 *
 * The design of this site deliberately hides missing facts rather than rendering empty shells, so
 * something has to make those gaps visible. This is that something. It reports:
 *
 *   1. Facts a grant reviewer expects to find that are still `null` — or still a placeholder —
 *      in `src/data/org.ts`.
 *   2. Pages whose `lastReviewed` date has aged out, so a stale page is greppable rather than
 *      quietly rotting. A stale site is worse in front of a funder than a plain current one.
 *   3. Pages with no Spanish translation.
 *   4. `_EXAMPLE_` reference files that have lost `draft: true` and would publish.
 *
 * Exits non-zero for staleness and for a publishing example, not for missing facts — filling in a
 * board roster is not something a build should block on, but a page nobody has looked at in a
 * year is a defect, and so is an example event on the live site. `--strict` makes everything
 * fail, for use in CI once the gaps are actually closed.
 */
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { org, REQUIRED_FOR_FUNDERS } from '../src/data/org.ts'
import { routes, PAGE_KEYS, LOCALES } from '../src/i18n/routes.ts'
import { isPlaceholder } from '../src/lib/placeholder.ts'

const STALE_AFTER_DAYS = 180
const strict = process.argv.includes('--strict')

const bold = (s) => `\x1b[1m${s}\x1b[0m`
const dim = (s) => `\x1b[2m${s}\x1b[0m`
const red = (s) => `\x1b[31m${s}\x1b[0m`
const yellow = (s) => `\x1b[33m${s}\x1b[0m`
const green = (s) => `\x1b[32m${s}\x1b[0m`

const daysSince = (date) => Math.floor((Date.now() - date.getTime()) / 86_400_000)

/** Read a dotted path like `postal_address.street` out of the org object. */
function get(obj, dotted) {
  return dotted.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj)
}

/** A placeholder counts as missing — see `src/lib/placeholder.ts`. */
function isMissing(value) {
  if (value == null) return true
  if (Array.isArray(value) && value.length === 0) return true
  if (typeof value === 'string' && value.trim() === '') return true
  return isPlaceholder(value)
}

let problems = 0

// 1 -----------------------------------------------------------------------------------------
console.log(bold('\nFacts funders look for'))
const missing = REQUIRED_FOR_FUNDERS.filter((f) => isMissing(get(org, f.path)))
if (missing.length === 0) {
  console.log(green('  all present'))
} else {
  for (const f of missing) {
    console.log(`  ${yellow('missing')} ${bold(f.path)}`)
    console.log(dim(`          ${f.why}`))
  }
  if (strict) problems += missing.length
}

// 2 -----------------------------------------------------------------------------------------
console.log(bold('\nPage freshness'))
async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) await walk(full, out)
    else if (entry.name.endsWith('.astro')) out.push(full)
  }
  return out
}

const pages = await walk('src/pages')
const stale = []
for (const file of pages) {
  const source = await readFile(file, 'utf8')
  const match = source.match(/lastReviewed=["'](\d{4}-\d{2}-\d{2})["']/)
  if (!match) continue // dynamic routes derive it from content dates
  const age = daysSince(new Date(match[1]))
  if (age > STALE_AFTER_DAYS) stale.push({ file, date: match[1], age })
}
if (stale.length === 0) {
  console.log(green(`  ${pages.length} pages, none older than ${STALE_AFTER_DAYS} days`))
} else {
  for (const s of stale) {
    console.log(`  ${red('stale')}   ${s.file} ${dim(`last reviewed ${s.date}, ${s.age} days ago`)}`)
  }
  problems += stale.length
}

// 3 -----------------------------------------------------------------------------------------
console.log(bold('\nTranslations'))
const untranslated = []
for (const key of PAGE_KEYS) {
  for (const locale of LOCALES) {
    if (locale === 'en') continue
    if (routes[key][locale] === null) untranslated.push(`${key} (${locale})`)
  }
}
if (untranslated.length === 0) {
  console.log(green('  every page exists in every locale'))
} else {
  console.log(`  ${yellow('untranslated')} ${untranslated.join(', ')}`)
  console.log(dim('          These link to the English page, marked "EN" in the nav. Usable, not translated.'))
  if (strict) problems += untranslated.length
}

// 4 -----------------------------------------------------------------------------------------
// `_EXAMPLE_` files are kept permanently as reference, so their presence is not the problem. The
// problem is one of them losing `draft: true` and rendering as if it were real — for an event,
// sending someone to a distribution that is not happening; for an update, announcing one. That is
// worth failing the build over rather than warning about, because the warning would be
// indistinguishable from the routine noise of a fixture that is supposed to be there.
console.log(bold('\nReference files'))
const examples = []
for (const dir of ['src/content/events', 'src/content/updates']) {
  for (const f of await readdir(dir)) {
    if (/_EXAMPLE_/i.test(f)) examples.push(path.join(dir, f))
  }
}
const live = []
for (const file of examples) {
  // Matches `draft: true` in YAML and in Markdown frontmatter alike.
  if (!/^draft:\s*true\s*$/m.test(await readFile(file, 'utf8'))) live.push(file)
}
if (examples.length === 0) {
  console.log(dim('  none'))
} else if (live.length === 0) {
  console.log(green(`  ${examples.length} example file(s), all \`draft: true\``))
} else {
  for (const file of live) console.log(`  ${red('publishing')} ${file}`)
  console.log(dim('          An example file is missing `draft: true` and will render as if it were real.'))
  problems += live.length
}

console.log('')
if (problems > 0) {
  console.log(red(`${problems} item(s) need attention.\n`))
  process.exit(1)
}
console.log(green('Nothing stale.\n'))
