/**
 * `just audit` — the content worklist.
 *
 * The design of this site deliberately hides missing facts rather than rendering empty shells, so
 * something has to make those gaps visible. This is that something. It reports:
 *
 *   1. Facts a grant reviewer expects to find that are still `null` in `src/data/org.ts`.
 *   2. Pages whose `lastReviewed` date has aged out, so a stale page is greppable rather than
 *      quietly rotting. A stale site is worse in front of a funder than a plain current one.
 *   3. Pages with no Spanish translation.
 *   4. How old the current needs list is, since a dated list is the site's proof of life.
 *
 * Exits non-zero only for staleness, not for missing facts — filling in a board roster is not
 * something a build should block on, but a page nobody has looked at in a year is a defect.
 * `--strict` makes everything fail, for use in CI once the gaps are actually closed.
 */
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { org, REQUIRED_FOR_FUNDERS } from '../src/data/org.ts'
import { routes, PAGE_KEYS, LOCALES } from '../src/i18n/routes.ts'

const STALE_AFTER_DAYS = 180
const NEEDS_STALE_AFTER_DAYS = 21
const strict = process.argv.includes('--strict')

const bold = (s) => `\x1b[1m${s}\x1b[0m`
const dim = (s) => `\x1b[2m${s}\x1b[0m`
const red = (s) => `\x1b[31m${s}\x1b[0m`
const yellow = (s) => `\x1b[33m${s}\x1b[0m`
const green = (s) => `\x1b[32m${s}\x1b[0m`

const daysSince = (date) => Math.floor((Date.now() - date.getTime()) / 86_400_000)

/** Read a dotted path like `location.street` out of the org object. */
function get(obj, dotted) {
  return dotted.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj)
}

/**
 * A placeholder counts as missing.
 *
 * Copy like `(postal address TODO)` is deliberate — it marks where a fact goes, in place, so it is
 * obvious on the page what is still owed. But it is a non-empty string, so every truthiness test
 * in the codebase reads it as an answer. That is how `(postal address TODO)` ended up published as
 * this organization's machine-readable street address, next to a real EIN.
 *
 * Treating the marker as the absence it represents is what lets the placeholders stay in the copy
 * without the tooling believing them.
 */
const PLACEHOLDER = /\b(TODO|FIXME)\b/i

function isMissing(value) {
  if (value == null) return true
  if (Array.isArray(value) && value.length === 0) return true
  if (typeof value === 'string' && value.trim() === '') return true
  if (typeof value === 'string' && PLACEHOLDER.test(value)) return true
  return false
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
  console.log(dim('          Get help must never be a fallback; the rest can wait.'))
  if (strict) problems += untranslated.length
}

// 4 -----------------------------------------------------------------------------------------
console.log(bold('\nNeeds list'))
// `_EXAMPLE_` reference files are excluded deliberately. `_` sorts after every digit, so an
// example file would win `.at(-1)`, `new Date('_EXAMPLE_...')` would be Invalid Date, and the
// staleness comparison against NaN is always false — the check would print "NaN days old" in
// green and never warn again. A proof-of-life check that silently stops checking is worse than
// not having one.
const needsFiles = (await readdir('src/content/needs'))
  .filter((f) => /\.ya?ml$/.test(f) && !/_EXAMPLE_/i.test(f))
  .sort()
const newest = needsFiles.at(-1)
if (!newest) {
  console.log(`  ${red('none')} — the homepage has nothing to show`)
  problems += 1
} else {
  const date = new Date(newest.replace(/\.ya?ml$/, ''))
  const age = daysSince(date)
  if (Number.isNaN(age)) {
    // Belt and braces: any filename that is not a date at all, rather than failing open.
    console.log(`  ${red(newest)} — filename is not a date, so freshness cannot be checked`)
    problems += 1
  } else {
  const label = `${age} day${age === 1 ? "" : "s"} old`
  const verdict = age > NEEDS_STALE_AFTER_DAYS ? red(label) : green(label)
  console.log(`  ${newest} — ${verdict}`)
  if (age > NEEDS_STALE_AFTER_DAYS) {
    console.log(dim('          This is the site\'s proof of life. Copy it to a new dated file and update it.'))
    problems += 1
  }
  }
}

// 5 -----------------------------------------------------------------------------------------
// `_EXAMPLE_` files are kept permanently as reference, so their presence is not the problem. The
// problem is one of them losing `draft: true` and rendering as if it were real, which for an
// event means sending someone to a distribution that is not happening. That is worth failing the
// build over rather than warning about, because the warning would be indistinguishable from the
// routine noise of a fixture that is supposed to be there.
console.log(bold('\nReference files'))
const exampleEvents = (await readdir('src/content/events')).filter((f) => /_EXAMPLE_/i.test(f))
const live = []
for (const f of exampleEvents) {
  const body = await readFile(path.join('src/content/events', f), 'utf8')
  if (!/^draft:\s*true\s*$/m.test(body)) live.push(f)
}
if (exampleEvents.length === 0) {
  console.log(dim('  none'))
} else if (live.length === 0) {
  console.log(green(`  ${exampleEvents.length} example file(s), all \`draft: true\``))
} else {
  for (const f of live) {
    console.log(`  ${red('publishing')} src/content/events/${f}`)
  }
  console.log(dim('          An example file is missing `draft: true` and will render as a real event.'))
  problems += live.length
}

console.log('')
if (problems > 0) {
  console.log(red(`${problems} item(s) need attention.\n`))
  process.exit(1)
}
console.log(green('Nothing stale.\n'))
