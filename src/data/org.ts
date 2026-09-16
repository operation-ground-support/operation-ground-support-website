/**
 * Single source of truth for organizational facts.
 *
 * Rules for this file:
 *
 *  1. Every field is either a real, verified fact or `null`. Never a plausible-looking guess.
 *     A funder doing diligence will check these, and one invented number discredits the rest.
 *  2. A `null` field makes its whole UI block disappear rather than rendering an empty shell.
 *  3. `just audit` lists every `null` that a grant reviewer would expect to find, so the gaps
 *     are a visible worklist instead of an invisible omission.
 *
 * Facts currently marked TODO are the ones that were missing from the Squarespace site and are
 * the actual reason the funding application read as thin. Filling them in matters more than
 * anything about the design.
 *
 * What belongs here versus in `i18n/ui.ts`: this file holds things that would change if the
 * organization changed. `ui.ts` holds things that would change if the site were redesigned. The
 * EIN *value* is a fact and lives here; the word "EIN" that labels it in the transparency bar is
 * furniture and lives there. When a fact is prose and so has to be said differently per language,
 * it is a `Localized` — the same type `ui.ts` uses, so the two files are one idea in two places
 * rather than two formats.
 */
import type { Localized } from '../i18n/routes'

export interface Person {
  name: string
  role: string
  /** Optional one-line bio. Two sentences maximum; a reviewer is scanning, not reading. */
  bio?: string
}

export interface Metric {
  /** The number itself, already formatted for display, e.g. "40" or "~1,200". */
  value: string
  /** What was counted, e.g. "bags of groceries distributed in a typical week". */
  label: string
  /** How it was counted. Specificity is the credibility; vague metrics read as marketing. */
  basis: string
  /** ISO date of the most recent count backing this number. */
  asOf: string
}

export interface Program {
  /** Short name, used as the heading. */
  name: string
  /** Two sentences at most — this is a list someone scans, not a page they read. */
  description: string
  /**
   * What kind of work it is, or who it runs through. Named partners double as verifiable
   * evidence: "Partner: North Texas Food Bank" is a claim a funder can check, which is the point.
   */
  tag: string
}

export interface Filing {
  year: number
  /** Path under /public, e.g. "/filings/form-990-2025.pdf", or an external URL. */
  href: string
}

export const org = {
  name: 'Operation Ground Support',
  /** Used where the full name will not fit, e.g. a favicon or a tight mobile header. */
  shortName: 'OGS',

  /** Main statement */
  mission:
    'Operation Ground Support is a 501(c)(3) nonprofit organization dedicated to serving our neighbors in Dallas.',

  /**
   * The formal tax classification, for the bottom of the homepage. 509(a)(2) is the public-support
   * test for organizations funded mainly by program revenue and contributions, as distinct from
   * 509(a)(1); stating it tells a grant reviewer the status was actually determined rather than
   * assumed. TODO: Spanish, in the end-of-project translation pass.
   */
  taxStatus:
    'Operation Ground Support is a 501(c)(3) tax-exempt public charity, classified under IRC Section 509(a)(2).',

  /**
   * An alternate one-line positioning statement
   */
  tagline: {
    en: "The bridge between need and what's already there to meet it.",
    es: 'Recolectamos y repartimos donaciones en Old East Dallas.',
  } as Localized,

  /* NOTE: The only thing I wanted to add to this lede is to add on "with dignity". The specific context given to me by Anne Winters is that it is very common for homeless or food-insecure people to be embarrased, and we want to treat them with some dignity. But in a short lede at the beginning of the website, it can be interpreted differently, and also it is ambiguous how this already long sentence flows */
  lede: "We support partners with community hubs across Dallas to deliver zero-barrier direct relief, lead collaborative homelessness summits, and build holistic stabilization, for our unhoused and food-insecure neighbors.",

  /**
   * What the organization actually does, in the order it was given by the board.
   *
   * This is the section that answers the question a funder asks after "is this real": *what do
   * you do, specifically*. Keep each one concrete enough to picture. A program that stops running
   * gets deleted from this list rather than left standing — a stale program list is the same
   * failure as a stale impact number, discovered the same way.
   */
  programs: [
    {
      name: 'Food Bank Referrals',
      description:
        "We connect people facing hunger directly to food banks and pantries near them, cutting through confusion about where to go and what's available.",
      tag: 'Referral network',
    },
    {
      name: 'Stocking Local Pantries',
      description:
        'We keep food pantries supplied so their staff and volunteers can stay focused on the ground — serving people face to face — instead of chasing down inventory.',
      tag: 'Supply, not just referral',
    },
    {
      name: 'NTFB Food Box Distribution',
      description:
        'Through our partnership with the North Texas Food Bank, we receive and distribute food boxes directly to families and individuals across the community.',
      tag: 'Partner: North Texas Food Bank',
    },
    {
      name: 'Community Meal Prep',
      description:
        "Excess donated produce and food don't go to waste — our volunteers turn them into prepared meals that go straight back out to people who need them.",
      tag: 'Rescue and prepare',
    },
    {
      name: 'Homelessness Summits',
      description:
        'We host summits that bring together service providers, city agencies, and neighbors to confront homelessness in Dallas head-on and coordinate real solutions.',
      tag: 'Convening and coordination',
    },
    {
      name: 'Community Feeding Events',
      description:
        'Regular on-the-ground events that put warm meals directly into the hands of people in our community — no paperwork, no barriers.',
      tag: 'Direct service',
    },
    {
      name: 'Clothing Distribution',
      description:
        'Donated clothing is sorted and distributed to individuals and families who need it, with a focus on dignity and choice.',
      tag: 'Direct service',
    },
    {
      name: 'Fresh Produce, Catering and Perishables',
      description:
        'We accept and redistribute fresh produce, surplus catering, bread, milk, and other perishable food donations from local businesses, farms, and events — moving them out fast before anything goes to waste.',
      tag: 'Food rescue',
    },
    {
      name: 'EETZ Food Rescue App',
      description:
        'We coordinate real-time pickup and delivery of surplus food through the EETZ app, matching what is available right now with who needs it before it spoils.',
      tag: 'Powered by EETZ',
    },
    {
      name: 'Inventory Management',
      description:
        'Every donation is tracked through the Operation Ground Support Inventory Management app, built with Noble Truth IT — giving us real-time visibility into what is on hand and where it needs to go next.',
      tag: 'Powered by Noble Truth IT',
    },
  ] as Program[],

  // ---------------------------------------------------------------------------------------------
  // Legitimacy. These are the fields a grant reviewer looks for first, and all of them are
  // currently missing from the live site.
  // ---------------------------------------------------------------------------------------------

  /** Federal EIN, formatted "12-3456789". Lights up the transparency bar and the footer. */
  ein: '42-1818184',
  /** Path under /public to a scan of the IRS 501(c)(3) determination letter. TODO. */
  determinationLetter: null as string | null,
  /** Candid/GuideStar profile URL. Free to claim; grantmakers check it directly. TODO. */
  candidUrl: null as string | null,
  /** Year the organization began operating, e.g. "2025". TODO. */
  founded: null as string | null,
  /** Public financial filings, newest first. TODO. */
  filings: [] as Filing[],
  /** Path under /public to an annual report, if one exists. TODO. */
  annualReport: null as string | null,

  // ---------------------------------------------------------------------------------------------
  // People. "A 501(c)(3) with no identifiable people" is the loudest red flag in diligence.
  // ---------------------------------------------------------------------------------------------

  board: [] as Person[],
  staff: [] as Person[],

  // ---------------------------------------------------------------------------------------------
  // Evidence of activity. Publish only what was actually counted. One honest, specific number
  // beats three round invented ones.
  // ---------------------------------------------------------------------------------------------

  metrics: [] as Metric[],

  // ---------------------------------------------------------------------------------------------
  // Contact and place.
  // ---------------------------------------------------------------------------------------------

  email: 'info@operation-ground-support.org',
  /** The number published on the current site; it reaches the Grace UMC office during hours. */
  phone: '214-824-2533',

  postal_address: {
    street: '(postal address TODO)',
    city: 'Dallas',
    state: 'TX',
    zip: '75246',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=4105+Junius+St+Dallas+TX+75246',
  },

  /** TODO
   * Drop-off logistics, in the order a person standing in the parking lot needs them.
   * Transcribed from the current Squarespace site. TODO: confirm these are still accurate,
   * and confirm whether holidays or church events close the door.
   */
  dropOff: {
    hours: [
      {
        days: { en: 'Monday\u2013Thursday', es: 'Lunes a jueves' },
        time: { en: '9:00am to 4:00pm', es: '9:00 a 16:00' },
      },
      {
        days: { en: 'Friday', es: 'Viernes' },
        time: { en: '9:00am to noon', es: '9:00 a 12:00' },
      },
    ] as { days: Localized; time: Localized }[],
    instructions: [
      'Park in the lot behind the church building.',
      'Enter through the back door of Grace United Methodist Church, which opens onto that lot.',
      'If the door is locked, ring the doorbell.',
    ] as string[],
  },

  // ---------------------------------------------------------------------------------------------
  // Money. Squarespace's /cart is vestigial and should not be linked.
  // ---------------------------------------------------------------------------------------------

  donate: {
    /** e.g. "Zeffy" (0% fees) or "Givebutter". TODO: pick one and set it up. */
    platform: null as string | null,
    url: null as string | null,
    /**
     * One sentence converting a gift into goods, e.g. "$25 fills one grocery bag."
     * Only publish this once someone has actually costed it out.
     */
    conversion: null as string | null,
  },

  /** Amazon/Target wish list or similar, if one exists. */
  registryUrl: null as string | null,

  /** Volunteer sign-up. Currently a Google Form on the live site. */
  signUpUrl: null as string | null,

  social: {
    facebook: null as string | null,
    instagram: null as string | null,
  },

  // ---------------------------------------------------------------------------------------------
  // Intake policy — the questions the people you serve are actually asking.
  //
  // These are left `null` because nobody but the board can answer them, and guessing would be
  // worse than silence. A page that says "no ID required" when a volunteer at the door does ask
  // for one causes someone to make a trip they could not afford; a page that says "we do not ask
  // about immigration status" when a form records it is a safety failure, not a copy error.
  //
  // Answer each one as a short sentence in plain language, then again in Spanish. Until then the
  // Get help page renders only the questions that have answers.
  // ---------------------------------------------------------------------------------------------

  intake: {
    /** Who can receive goods. e.g. "Anyone who needs them. We do not have a service area." */
    whoCanReceive: null as Localized | null,
    /** Whether identification is required, and what happens if someone has none. */
    idRequired: null as Localized | null,
    /** Whether income or need has to be documented. */
    proofOfNeed: null as Localized | null,
    /** Whether anyone is asked about immigration status. */
    immigrationStatus: null as Localized | null,
    /** What, if anything, is written down, who can see it, and how long it is kept. */
    recordsKept: null as Localized | null,
    /** How often a household may come. */
    howOften: null as Localized | null,
    /** Whether an appointment is needed, or whether people may simply arrive during hours. */
    appointment: null as Localized | null,
  },
} as const satisfies Record<string, unknown>

/**
 * Fields a grant reviewer expects to find, checked by `just audit`. The message is what the
 * audit prints, so write it as an instruction rather than a description.
 */
export const REQUIRED_FOR_FUNDERS: { path: string; why: string }[] = [
  { path: 'ein', why: 'Put the EIN in the footer so a reviewer can verify the 501(c)(3) without leaving the site.' },
  { path: 'determinationLetter', why: 'Scan the IRS determination letter to /public/filings/ and link it.' },
  { path: 'candidUrl', why: 'Claim the free Candid/GuideStar profile; grantmakers check it directly.' },
  { path: 'founded', why: 'State the founding year. Being new is fine; being undated is not.' },
  { path: 'board', why: 'List board members by name and role. No named people is the single loudest diligence red flag.' },
  { path: 'metrics', why: 'Publish at least one number that someone actually counted, with its basis and date.' },
  { path: 'location.street', why: 'A real street address makes the organization locatable.' },
  { path: 'donate.url', why: 'Set up a real donation processor (Zeffy takes 0%) and link it.' },
  { path: 'lede', why: 'Write the plain-language homepage sentence and get the board to approve it.' },
  { path: 'intake.idRequired', why: 'Answer whether ID is required. People skip a trip they cannot afford over this.' },
  { path: 'intake.immigrationStatus', why: 'Answer whether anyone is asked about immigration status. This is a safety answer, not a copy answer.' },
  { path: 'intake.recordsKept', why: 'Say what is written down, who sees it, and how long it is kept.' },
  { path: 'intake.whoCanReceive', why: 'Say plainly who can receive goods.' },
]
