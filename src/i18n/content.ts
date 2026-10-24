/**
 * Reading translatable text out of the content collections in `src/content/`.
 *
 * Kept separate from `ui.ts` because these operate on authored content, not interface chrome.
 */
import type { Locale } from './routes'

/**
 * Text in a content file that may or may not have been translated yet: a plain string for
 * English only, or `{ en, es? }`. Mirrors the `localized` schema in `content.config.ts`.
 *
 * Deliberately not the same type as `Localized` in `routes.ts`, which requires every locale, and
 * named differently so the two cannot be mistaken for each other. The difference is the point: an
 * event title nobody has translated yet should still appear, in English, whereas a nav label
 * or an organizational fact with no Spanish is a gap the type checker ought to refuse.
 */
export type Translatable = string | { en: string; es?: string }

/**
 * Resolve a translatable value. Falls back to English when a translation is missing, which is the
 * right behaviour *inside* content — an untranslated event title is far better than a hole in
 * the list. It is not the right behaviour for whole pages, which is why `routes.ts` uses an
 * explicit `null` there instead.
 */
export function tr(value: Translatable, locale: Locale): string {
  if (typeof value === 'string') return value
  return value[locale] ?? value.en
}
