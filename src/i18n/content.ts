/**
 * Helpers for reading the `localized` union used across content collections.
 * Kept separate from `ui.ts` because these operate on authored content, not interface chrome.
 */
import type { Locale } from './routes'

export type Localized = string | { en: string; es?: string }

/**
 * Resolve a localized value. Falls back to English when a translation is missing, which is the
 * right behaviour *inside* content — an untranslated ingredient name is far better than a hole
 * in the list. It is not the right behaviour for whole pages, which is why `routes.ts` uses an
 * explicit `null` there instead.
 */
export function tr(value: Localized, locale: Locale): string {
  if (typeof value === 'string') return value
  return value[locale] ?? value.en
}

/** True when a value has no translation for `locale`. Used by `just audit`. */
export function isUntranslated(value: Localized, locale: Locale): boolean {
  if (locale === 'en') return false
  return typeof value === 'string' || value[locale] === undefined
}
