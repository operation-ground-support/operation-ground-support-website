// @ts-check
import { defineConfig, fontProviders } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import { checkInternalLinks } from './integrations/check-internal-links.mjs'

// https://astro.build/config
export default defineConfig({
  // `site` is only used to build absolute URLs for the sitemap, RSS feed, and canonical tags.
  // It is the one place that knows the production hostname; nothing else should hardcode it.
  site: 'https://operation-ground-support.org',

  // The default 'directory' format emits `about/index.html` rather than `about.html`. That is the
  // form that works unchanged on Cloudflare Pages, Netlify, GitHub Pages, and a bare S3/GCS
  // bucket, which is the whole point of this stack.
  build: { format: 'directory' },
  trailingSlash: 'ignore',

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: {
      // English lives at the root (`/about`), Spanish under a prefix (`/es/quienes-somos`).
      prefixDefaultLocale: false,
    },
    // Astro's `fallback` option is deliberately NOT set. It would serve English content under an
    // `/es/` URL, which puts English text inside `<html lang="es">` — screen readers then read it
    // with Spanish phonetics, and search engines see two URLs with identical content.
    //
    // Untranslated pages are instead linked at their canonical English URL and marked "EN" in the
    // navigation. See `navLink` in `src/i18n/routes.ts`.
  },

  // Astro downloads these at build time and serves them from our own origin, so there is no
  // runtime request to Google and no third-party tracking surface. NOTE: this means a build
  // needs network access the first time; results are cached under `node_modules/.astro`.
  //
  // Four roles: a stencil face for the homepage's opening and closing headings and the day numbers
  // on event cards, a condensed
  // display face for every other heading and button, a sans for reading, and a mono for labels and
  // metadata. To try
  // another face in a role, change `name` (and `weights`, if it has fewer); a weight the face
  // lacks falls back to its nearest, never a synthesised bold.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Big Shoulders Stencil',
      cssVariable: '--font-headline',
      weights: [900],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['Impact', 'Arial Narrow', 'sans-serif'],
      // The family has an optical-size axis, and Google's default instance is its small-text end,
      // set wider and looser. 72 is the display end — what Google used to publish separately as
      // "Big Shoulders Stencil Display", which is no longer a name Astro can find.
      options: { experimental: { variableAxis: { opsz: ['72'] } } },
    },
    {
      provider: fontProviders.google(),
      name: 'Barlow Condensed',
      cssVariable: '--font-display',
      weights: [800],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['Arial Narrow', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Public Sans',
      cssVariable: '--font-sans',
      weights: [400, 500, 700],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['system-ui', 'Segoe UI', 'Helvetica Neue', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'IBM Plex Mono',
      cssVariable: '--font-mono',
      weights: [400, 500],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['ui-monospace', 'Menlo', 'Consolas', 'monospace'],
    },
  ],

  integrations: [
    sitemap(),
    // Fails the build on any internal link that does not resolve to an emitted page. This is the
    // "nav rot is a build error, not a discipline problem" guard.
    checkInternalLinks(),
  ],
})
