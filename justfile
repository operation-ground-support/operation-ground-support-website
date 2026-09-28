# Development commands for the Operation Ground Support website.
#
# Everything runs inside the nix dev shell, which supplies node, npm, and the image tools:
#
#     nix develop            # then `just dev`, `just build`, ...
#     nix develop -c just dev  # one-shot, without staying in the shell
#
# `npm` is only a build-time dependency. What actually gets deployed is the static `dist/`
# directory, which is plain HTML and works unchanged on Cloudflare Pages, Netlify, GitHub Pages,
# or a bare bucket. That is the whole point of this stack: nothing here is portable *in theory*,
# it is portable because the artifact is a folder of files.

alias d := dev
alias b := build
alias c := check
alias a := audit

# List the available commands
default:
  @just --list

# Install dependencies exactly as locked. Every recipe below does this on its own when it is
# needed, so this is only for forcing a clean reinstall.
install:
  npm ci

# Astro and everything else in `package.json` live in `node_modules/`, which is not committed and
# not supplied by the nix shell — the same relationship as a crate and `~/.cargo/registry`. Unlike
# cargo, npm does not fetch on demand, so a fresh clone or a new machine fails with `astro: command
# not found`. This runs `npm ci` when `node_modules/` is missing, or older than the lockfile (after
# a pull or a branch switch that changed it), and does nothing otherwise. npm writes
# `node_modules/.package-lock.json` at the end of every install, which is what it is compared to.
_deps:
  #!/usr/bin/env bash
  set -euo pipefail
  if [ ! -e node_modules/.package-lock.json ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
    npm ci
  fi

# Placeholder markers (`Todo` and `PhotoSlot`) are visible in the dev server and on the staging
# site, and invisible in a production build, so the worklist shows in place, in context. The rule
# for which build is which lives in `src/lib/markers.ts`.

# Live-reloading dev server on http://localhost:4321
dev *ARGS: _deps
  npm run dev -- {{ARGS}}

# Fails on: a content file that does not match its schema, a type error, and any internal link
# pointing at a page that does not exist.

# Dev server reachable from other devices on the LAN
lan: _deps
  #!/usr/bin/env bash
  set -euo pipefail
  ip=$(ip -4 -o addr show scope global | awk '$2 !~ /^(docker|br-|virbr)/ {print $4}' | cut -d/ -f1 | head -n1)
  echo "  On this machine:  http://localhost:4321"
  echo "  On your phone:    http://${ip}:4321"
  echo
  npm run dev -- --host

# Stop the background dev server
dev-stop: _deps
  npx astro dev stop

# Is a dev server running, and where
dev-status: _deps
  npx astro dev status

# Tail the background dev server's output
dev-logs *ARGS: _deps
  npx astro dev logs {{ARGS}}

# Build the static site into `dist/`
build: _deps
  npm run build

# Serve the built `dist/` exactly as a host would, to check the real output
preview: build
  npm run preview

# A copy of the site that works from a folder, with no server: `dist-offline/` plus a zip of it.
# For sending the whole site to a board member or a funder to look through offline.
share: build
  node tools/offline.mjs
  rm -f operation-ground-support-site.zip
  cd dist-offline && zip -qr ../operation-ground-support-site.zip .
  @echo "  operation-ground-support-site.zip — unzip it and open index.html"

# The name of the Cloudflare Pages project, which is also its hostname:
# https://operation-ground-support.pages.dev
cf_project := "operation-ground-support"

# One-time setup for `deploy-preview`. Opens a browser to log in to Cloudflare.
deploy-setup:
  wrangler login
  wrangler pages project create {{cf_project}} --production-branch=main

# A copy of the site at a Cloudflare address, for showing to a board member or a funder while the
# real domain still points at Squarespace. It touches no DNS record and no mail record.
#
# Deliberately a manual upload rather than Cloudflare's GitHub integration: the production site
# should be published through the review gate on `main` (see docs/operations.md), not from
# whatever happens to be in someone's working tree. That gate is the whole governance model, and
# a one-command deploy from a laptop quietly routes around it. This recipe is for the staging
# copy, which nobody's domain points at.

# Build and upload the staging site, and print the URL to send people
deploy-preview: _deps
  #!/usr/bin/env bash
  set -euo pipefail

  # Built with the worklist markers on — `Todo` blocks, `PhotoSlot` frames, the Board gap — which
  # an ordinary build strips. The staging site is shown to the people being asked to supply those
  # facts, so the markers are the most useful thing on it. See `src/lib/markers.ts`.
  #
  # Straight into `dist-preview/` via `--outDir`, never into `dist/`. Sharing an output directory
  # would mean an ordinary `just build` could be followed by a production deploy of whatever the
  # last preview left sitting there, and the markers name internal gaps in an organization's grant
  # diligence. `dist/` stays exactly what every other host would be handed.
  rm -rf dist-preview
  PUBLIC_SHOW_MARKERS=1 npm run build -- --outDir dist-preview

  # Keep the staging copy out of search results. Cloudflare adds this header to *preview*
  # deployments automatically but not to the project's main `.pages.dev` address, which is the
  # stable link this recipe produces — so it has to be set here.
  #
  # A header and not `Disallow: /` in robots.txt, which is the intuitive fix and the wrong one:
  # disallowing crawling stops a crawler from ever fetching the page, so it never sees the
  # instruction not to index it, and the URL can still turn up in results with no description.
  # Allowing the crawl and answering with `noindex` is what actually keeps it out. `_headers` is
  # read by Cloudflare Pages and by Netlify, and ignored as a stray file anywhere else.
  printf '%s\n' '/*' '  X-Robots-Tag: noindex, nofollow' > dist-preview/_headers

  # `--branch=main` matches the projects production branch, which is what earns the short stable
  # hostname; any other branch name would publish to a one-off preview URL instead.
  wrangler pages deploy dist-preview \
    --project-name={{cf_project}} \
    --branch=main \
    --commit-dirty=true

  echo
  echo "  Staging site: https://{{cf_project}}.pages.dev"
  echo "  Not indexed by search engines. Not the live site."

# Type-check the site, including `.astro` files and content frontmatter
check: _deps
  npm run check

# Report missing facts, stale pages, and untranslated pages. See `tools/audit.mjs`.
audit *ARGS:
  node tools/audit.mjs {{ARGS}}

# Everything CI runs. Use before pushing.
ci: check build
  node tools/audit.mjs

# Regenerate the TypeScript types for content collections after editing `src/content.config.ts`
sync: _deps
  npm run sync

# The needs list is the single most valuable object on the site: a mission statement never gets
# reposted, but a dated needs list gets forwarded by newsletters and neighborhood groups, and it
# is what tells a visitor the organization is not dormant. Copy, do not edit in place — the old
# files are the record that this has been happening.

# Phone photos carry GPS coordinates and timestamps. For a site serving people who have reason to
# be careful about being located, publishing that metadata is a real risk, and it is invisible
# unless something removes it deliberately.

# Resize a photograph, strip its metadata, and copy it into src/assets/photos/
add-photo SRC NAME:
  #!/usr/bin/env bash
  set -euo pipefail
  mkdir -p src/assets/photos
  target="src/assets/photos/{{NAME}}.jpg"
  magick "{{SRC}}" -auto-orient -resize '2400x2400>' -quality 88 -strip "$target"
  exiftool -all= -overwrite_original "$target" >/dev/null
  echo "wrote $target ($(du -h "$target" | cut -f1)), metadata stripped"

# Minify an SVG in place, for logo files
optimize-svg FILE:
  svgo --multipass "{{FILE}}"

# Remove build output and caches
clean:
  rm -rf dist dist-offline dist-preview operation-ground-support-site.zip .astro node_modules/.astro

# Print the dev shell's PATH, e.g. for pointing an editor's tooling at it
sh_path:
  nix develop --command printenv PATH
