/**
 * The site's route table, keyed by page rather than by URL.
 *
 * Why a table instead of just writing links inline: it makes the language switcher possible
 * (given the current page and a target locale, look up the URL), and it makes an untranslated
 * page an explicit `null` rather than a link that quietly 404s or silently serves English.
 *
 * Because `routes` is typed as an exhaustive `Record<PageKey, Record<Locale, ...>>`, adding a
 * page or a locale without filling in every cell is a type error. Broken links are then caught
 * a second time at build by `integrations/check-internal-links.mjs`.
 */

export const LOCALES = ['en', 'es'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

export const PAGE_KEYS = [
  'home',
  'getHelp',
  'donate',
  'dropOff',
  'volunteer',
  'about',
  'updates',
  'contact',
] as const
export type PageKey = (typeof PAGE_KEYS)[number]

/**
 * `null` means "no translation exists yet". The page is still linked from the Spanish nav — it
 * just points at the English URL and says so (see `navLink`). Hiding the link instead would mean
 * a Spanish speaker cannot discover that the organization takes volunteers at all, which is worse
 * than reading about it in a second language.
 *
 * Spanish slugs are Spanish words on purpose. For the people this site serves, `/es/ayuda` is a
 * usable URL to say out loud or write down; `/es/get-help` is not.
 */
export const routes: Record<PageKey, Record<Locale, string | null>> = {
  home: { en: '/', es: '/es' },
  getHelp: { en: '/get-help', es: '/es/ayuda' },
  // `donate` is money and `dropOff` is goods. They are separate pages because they are separate
  // acts with separate audiences: giving money is one click from anywhere, while dropping off
  // goods needs an address, hours, and a list of what is short.
  //
  // They must not both be called some synonym of "give". A visitor cannot guess which of "Give"
  // and "Donate" holds the payment form, and on a nonprofit site "Donate" overwhelmingly means
  // money — so the goods page takes the concrete verb the organization already uses for it.
  donate: { en: '/donate', es: null },
  dropOff: { en: '/drop-off', es: null },
  volunteer: { en: '/volunteer', es: null },
  about: { en: '/about', es: null },
  updates: { en: '/updates', es: null },
  contact: { en: '/contact', es: '/es/contacto' },
}

export const NAV_ORDER: PageKey[] = [
  'getHelp',
  'dropOff',
  'about',
  'updates',
  'contact',
  'volunteer',
  'donate',
]

// only have these two emphasized in the way they are
export const NAV_EMPHASIS: Partial<Record<PageKey, 'solid' | 'outline'>> = {
  donate: 'solid',
  volunteer: 'outline',
}

export function path(key: PageKey, locale: Locale): string | null {
  return routes[key][locale]
}

export interface NavLink {
  key: PageKey
  href: string
  /**
   * The language of the page at `href` — the value for `hreflang`, not for `lang`. `lang` on the
   * anchor would claim its own label is English, and the label stays in the reader's language;
   * it is only the destination that differs.
   *
   * When this differs from the requested locale the link is a fallback, and both the markup and
   * the visible label have to say so.
   */
  lang: Locale
  isFallback: boolean
}

/**
 * The URL to use for `key` when rendering in `locale`, falling back to English.
 *
 * The distinction that matters: this returns the *canonical English URL* (`/volunteer`), never an
 * English page served under an `/es/` path. A silent rewrite would put English text inside
 * `<html lang="es">`, which makes screen readers pronounce it with Spanish phonetics, creates two
 * URLs with identical content for search engines, and reads to the visitor as a broken
 * translation rather than an absent one.
 *
 * Callers must render `lang`/`hreflang` on the anchor and show a visible marker when
 * `isFallback` — see `Header.astro`. A fallback that is not labelled is the bad pattern.
 */
export function navLink(key: PageKey, locale: Locale): NavLink {
  const own = routes[key][locale]
  if (own !== null) return { key, href: own, lang: locale, isFallback: false }

  const fallback = routes[key][DEFAULT_LOCALE]
  if (fallback === null) {
    // The default locale must be complete; there is nothing left to fall back to.
    throw new Error(`route "${key}" has no ${DEFAULT_LOCALE} URL to fall back to`)
  }
  return { key, href: fallback, lang: DEFAULT_LOCALE, isFallback: true }
}

/** The locale a URL belongs to, derived from its first path segment. */
export function localeFromUrl(url: URL): Locale {
  const first = url.pathname.split('/').filter(Boolean)[0]
  return (LOCALES as readonly string[]).includes(first ?? '') ? (first as Locale) : DEFAULT_LOCALE
}

/**
 * Where the language switcher should go from the current page.
 *
 * If this page has a counterpart in `to`, that is the answer. Otherwise the switcher lands on the
 * target language's home page, which is the conventional behaviour and better than a disabled
 * control — a visitor who asked for Spanish should end up somewhere Spanish.
 *
 * Pass the current page's own key; there is no reverse lookup by URL, because that would guess
 * wrong on dynamic routes like `/updates/some-post`.
 */
export function switchLocale(key: PageKey, to: Locale): { href: string; isHomeFallback: boolean } {
  const direct = routes[key][to]
  if (direct !== null) return { href: direct, isHomeFallback: false }

  const home = routes.home[to]
  if (home === null) throw new Error(`locale "${to}" has no home page`)
  return { href: home, isHomeFallback: true }
}
