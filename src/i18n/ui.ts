/**
 * Interface strings — navigation, labels, buttons, footer chrome. This file is limited to furniture.
 *
 * Page *prose* does not live here; it lives in the page files and in `src/content/`. This is only
 * for the repeated furniture, where duplicating the English into every page would guarantee the
 * two languages drift apart.
 *
 * `Localized<typeof en>` means a missing Spanish key is a type error rather than a silently
 * English word in the middle of a Spanish page. Note what it does *not* catch: that the two sides
 * actually say the same thing.
 */
import type { Locale, Localized } from './routes'

const en = {
  'nav.getHelp': 'Get help',
  'nav.donate': 'Donate',
  'nav.dropOff': 'Drop off',
  'nav.volunteer': 'Volunteer',
  'nav.about': 'About',
  'nav.updates': 'Updates',
  'nav.contact': 'Contact',
  'nav.skipToContent': 'Skip to content',
  /** Marker on a nav link whose page is only available in English. */
  'nav.inOtherLanguage': 'in English',
  'nav.langBadge': 'EN',

  'bar.ein': 'EIN',
  'bar.financials': 'Financials',
  'bar.determination': '501(c)(3) letter',
  'bar.candid': 'Candid profile',
  'bar.otherLanguage': 'Español',
  /**
   * Hover text on the language switch when this page has no counterpart and the switch goes to the
   * other language's home page instead. Looked up in the *target* language, since that is the
   * language of the person clicking it — so the English entry describes a Spanish-only page.
   */
  'bar.switchToHome': 'This page is only in Spanish. Go to the English home page.',

  'needs.heading': '',
  'needs.urgent': 'Most needed',
  'needs.notNeeded': 'Please hold off on',
  'needs.empty': 'The current needs list is being updated.',

  'updates.heading': 'Updates',
  'updates.none': 'No updates posted yet.',

  'events.heading': 'Upcoming',
  'events.past': 'Past Events',
  'events.none': 'Nothing is scheduled at the moment.',

  'metrics.asOf': 'as of',

  'footer.contact': 'Contact',
  'footer.transparency': 'Transparency',
  'footer.annualReport': 'Annual report',
  'footer.license': 'Text on this site is CC BY 4.0',

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
  'nav.skipToContent': 'Saltar al contenido',
  'nav.inOtherLanguage': 'en inglés',
  'nav.langBadge': 'EN',

  'bar.ein': 'EIN',
  'bar.financials': 'Finanzas',
  'bar.determination': 'Carta 501(c)(3)',
  'bar.candid': 'Perfil de Candid',
  'bar.otherLanguage': 'English',
  'bar.switchToHome': 'Esta página solo está en inglés. Ir al inicio en español.',

  'needs.heading': 'Lo que necesitamos ahora',
  'needs.urgent': 'Lo más necesario',
  'needs.notNeeded': 'Por ahora no recibimos',
  'needs.empty': 'La lista de necesidades se está actualizando.',

  'updates.heading': 'Novedades',
  'updates.none': 'Todavía no hay novedades.',

  'events.heading': 'Próximamente',
  'events.past': 'Anteriores',
  'events.none': 'No hay nada programado por el momento.',

  'metrics.asOf': 'al',

  'footer.contact': 'Contacto',
  'footer.transparency': 'Transparencia',
  'footer.annualReport': 'Informe anual',
  'footer.license': 'Los textos de este sitio son CC BY 4.0',

  'a11y.mainNav': 'Navegación principal',
  'a11y.transparencyBar': 'Transparencia de la organización',

  'cta.donate': 'Donar dinero',
  'cta.dropOff': 'Dejar artículos',
  'cta.volunteer': 'Ser voluntario',
  'cta.getHelp': 'Necesito ayuda',
}

export const ui = { en, es } as const satisfies Localized<Record<string, string>>

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
