/**
 * Interface strings — navigation, labels, buttons, footer chrome.
 *
 * Page *prose* does not live here; it lives in the page files and in `src/content/`. This is only
 * for the repeated furniture, where duplicating the English into every page would guarantee the
 * two languages drift apart.
 *
 * `Record<Locale, typeof en>` means a missing Spanish key is a type error rather than a silently
 * English word in the middle of a Spanish page.
 */
import type { Locale } from './routes'

const en = {
  'nav.getHelp': 'Get help',
  'nav.donate': 'Donate',
  'nav.dropOff': 'Drop off',
  'nav.volunteer': 'Volunteer',
  'nav.about': 'About',
  'nav.updates': 'Updates',
  'nav.contact': 'Contact',
  'nav.menu': 'Menu',
  'nav.skipToContent': 'Skip to content',
  /** Marker on a nav link whose page is only available in English. */
  'nav.inOtherLanguage': 'in English',
  'nav.langBadge': 'EN',

  'bar.ein': 'EIN',
  'bar.financials': 'Financials',
  'bar.determination': '501(c)(3) letter',
  'bar.candid': 'Candid profile',
  'bar.otherLanguage': 'Español',

  'needs.heading': 'What we need right now',
  'needs.updated': 'Updated',
  'needs.urgent': 'Most needed',
  'needs.notNeeded': 'Please hold off on',
  'needs.empty': 'The current needs list is being updated.',

  'updates.heading': 'Updates',
  'updates.readMore': 'Read more',
  'updates.none': 'No updates posted yet.',

  'events.heading': 'Upcoming',
  'events.past': 'Past',
  'events.none': 'Nothing scheduled at the moment.',

  'metrics.asOf': 'as of',
  'metrics.basis': 'How we count this',

  'footer.tagline': 'Collecting and distributing donated goods in Old East Dallas.',
  'footer.contact': 'Contact',
  'footer.transparency': 'Transparency',
  'footer.lastUpdated': 'Site last updated',

  'a11y.mainNav': 'Main navigation',
  'a11y.transparencyBar': 'Organizational transparency',

  'cta.donate': 'Donate money',
  'cta.dropOff': 'Drop off goods',
  'cta.volunteer': 'Volunteer',
  'cta.getHelp': 'I need help',
} as const

const es: Record<keyof typeof en, string> = {
  'nav.getHelp': 'Buscar ayuda',
  'nav.donate': 'Donar',
  'nav.dropOff': 'Dejar donaciones',
  'nav.volunteer': 'Voluntariado',
  'nav.about': 'Quiénes somos',
  'nav.updates': 'Novedades',
  'nav.contact': 'Contacto',
  'nav.menu': 'Menú',
  'nav.skipToContent': 'Saltar al contenido',
  'nav.inOtherLanguage': 'en inglés',
  'nav.langBadge': 'EN',

  'bar.ein': 'EIN',
  'bar.financials': 'Finanzas',
  'bar.determination': 'Carta 501(c)(3)',
  'bar.candid': 'Perfil de Candid',
  'bar.otherLanguage': 'English',

  'needs.heading': 'Lo que necesitamos ahora',
  'needs.updated': 'Actualizado',
  'needs.urgent': 'Lo más necesario',
  'needs.notNeeded': 'Por ahora no recibimos',
  'needs.empty': 'La lista de necesidades se está actualizando.',

  'updates.heading': 'Novedades',
  'updates.readMore': 'Leer más',
  'updates.none': 'Todavía no hay novedades.',

  'events.heading': 'Próximamente',
  'events.past': 'Anteriores',
  'events.none': 'No hay nada programado por el momento.',

  'metrics.asOf': 'al',
  'metrics.basis': 'Cómo lo contamos',

  'footer.tagline': 'Recolectamos y repartimos donaciones en Old East Dallas.',
  'footer.contact': 'Contacto',
  'footer.transparency': 'Transparencia',
  'footer.lastUpdated': 'Sitio actualizado por última vez',

  'a11y.mainNav': 'Navegación principal',
  'a11y.transparencyBar': 'Transparencia de la organización',

  'cta.donate': 'Donar dinero',
  'cta.dropOff': 'Dejar artículos',
  'cta.volunteer': 'Ser voluntario',
  'cta.getHelp': 'Necesito ayuda',
}

export const ui = { en, es } as const

export type UiKey = keyof typeof en

/** `const t = useTranslations(locale)` then `t('nav.donate')`. */
export function useTranslations(locale: Locale) {
  return function t(key: UiKey): string {
    return ui[locale][key]
  }
}

/** Locale-appropriate date formatting. Used everywhere a date is shown. */
export function formatDate(date: Date, locale: Locale, opts?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-US' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
    ...opts,
  }).format(date)
}
