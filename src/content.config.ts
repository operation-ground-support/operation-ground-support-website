/**
 * Content collections — the parts of the site that change often enough that they should not
 * require touching a `.astro` file.
 *
 * The split is deliberate. Page prose is written once and edited rarely, so it lives in the page
 * components. `updates` and `events` change weekly and are the material that proves to
 * a visitor (and to a grant reviewer) that the organization is alive, so they are plain data
 * files that a non-developer can edit. When a git-backed CMS is added later, point it at
 * `src/content/` and nothing else has to move.
 *
 * Every schema below is validated at build time, so a malformed file fails the build instead of
 * rendering a blank section.
 */
import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
// `z` re-exported from 'astro:content' is deprecated as of Astro 7; 'astro/zod' is the supported
// import and is the same zod instance Astro validates with.
import { z } from 'astro/zod'

/**
 * A string that may be translated. Write a plain string for English-only, or a mapping when a
 * Spanish version exists. Keeping the two next to each other is what stops them drifting apart.
 * Read it with `tr()` from `src/i18n/content.ts`, whose `Translatable` type is this shape.
 *
 *   - Rice
 *   - { en: Rice, es: Arroz }
 */
const localized = z.union([
  z.string(),
  z.object({
    en: z.string(),
    es: z.string().optional(),
  }),
])

/**
 * Short posts. Not a blog in the sense of essays — a distribution happened, a shelf is empty, a
 * partner joined. Three sentences is a perfectly good update.
 */
const updates = defineCollection({
  loader: glob({ base: './src/content/updates', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    /** Optional: one sentence for the index page and the RSS feed. Leave it out and the title stands alone. */
    summary: z.string().optional(),
    /** Which language this post is written in. Posts are not auto-translated. */
    lang: z.enum(['en', 'es']).default('en'),
    /** Set true to keep a draft in the repo without publishing it. */
    draft: z.boolean().default(false),
    /** Credit the photographer/author if it is not the organization generally. */
    byline: z.string().optional(),
  }),
})

/**
 * Distributions, drives, and volunteer days.
 *
 * Upcoming-vs-past is computed at build time, which means a static site goes stale between
 * builds. Two mitigations, both in `EventList.astro`: the rendered markup carries each event's
 * ISO timestamp so a few lines of client-side script can re-sort on load, and the deploy should
 * be rebuilt on a schedule (see `docs/operations.md`).
 */
const events = defineCollection({
  loader: glob({ base: './src/content/events', pattern: '**/*.{yaml,yml}' }),
  schema: ({ image }) =>
    z
      .object({
        title: localized,
        /** ISO 8601 with an offset, e.g. `2026-09-13T10:00:00-05:00`. Offsets avoid timezone bugs. */
        start: z.coerce.date().optional(),
        end: z.coerce.date().optional(),
        /**
         * The day alone, e.g. `2026-12-05`, for an event whose time is not set yet. Give either this
         * or `start`, never both. It has to be its own field: YAML reads a bare date as midnight UTC,
         * which is also what a 6 PM Dallas `start` comes out as, so a `start` with no time in it
         * could not be told apart from one with a time.
         */
        date: z.coerce.date().optional(),
        /** Where to go: the name of the place. Leave it out and the event shows no location at all. */
        location: localized.optional(),
        /** The street address, shown under the location. The same in every language. */
        address: z.string().optional(),
        description: localized.optional(),
        /** External sign-up link, if this event needs one. */
        signUpUrl: z.string().optional(),
        /** The sign-up button's text. Leave it out for "Volunteer". */
        signUpLabel: localized.optional(),
        /**
         * Photographs, as files beside this one, in a row across the top of the card; the more
         * there are, the smaller each is drawn. The same rules as every photo on the site: real
         * photographs only, and anyone identifiable has agreed to appear.
         */
        photos: z
          .array(
            z.object({
              src: image(),
              /** Describes the photo for someone who cannot see it. */
              alt: localized,
              /** Which part to keep when it is cropped, as a CSS `object-position`, e.g. `center 70%`. */
              focus: z.string().optional(),
            }),
          )
          .default([]),
        /** Optional: one line under the photos, saying what they show and when. */
        photoCaption: localized.optional(),
        /**
         * Keep a file in the repo without publishing it. Same field and same meaning as `updates`.
         *
         * Two uses: an event being drafted before it is confirmed, and the permanent `_EXAMPLE_`
         * reference files, which must never render — an example event on the live site sends
         * someone to a distribution that is not happening.
         */
        draft: z.boolean().default(false),
      })
      .refine((e) => (e.start === undefined) !== (e.date === undefined), {
        message: 'Give either `start` (with a time) or `date` (the day alone), not both and not neither.',
        path: ['start'],
      })
      .refine((e) => e.end === undefined || e.start !== undefined, {
        message: '`end` needs a `start`. An event with only a `date` has no time to end at.',
        path: ['end'],
      }),
})

export const collections = { updates, events }
