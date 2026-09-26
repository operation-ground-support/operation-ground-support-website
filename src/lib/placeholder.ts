/**
 * Placeholder copy — `(postal address TODO)` — standing in for a fact nobody has supplied yet.
 *
 * Placeholders are deliberate: they sit in the copy exactly where the fact will go, so the gap is
 * obvious on the page. But they are non-empty strings, so every `value ? … : …` in the codebase
 * reads them as answers. Anything that *consumes* a fact rather than displaying it — `just audit`,
 * the machine-readable identity in `Base.astro` — asks this instead, so the placeholders can stay
 * in the copy without the tooling believing them.
 *
 * Kept free of `import.meta.env` so plain Node can import it; `tools/audit.mjs` does.
 */
const PLACEHOLDER = /\b(TODO|FIXME)\b/i

export function isPlaceholder(value: unknown): boolean {
  return typeof value === 'string' && PLACEHOLDER.test(value)
}
