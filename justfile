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

# Install dependencies exactly as locked. Run after cloning or after pulling a lockfile change.
install:
  npm ci

# Placeholder markers (`Todo` and `PhotoSlot`) are visible in the dev server and invisible in a
# production build, so `just dev` shows the worklist in place, in context.

# Live-reloading dev server on http://localhost:4321
dev *ARGS:
  npm run dev -- {{ARGS}}

# Fails on: a content file that does not match its schema, a type error, and any internal link
# pointing at a page that does not exist.

# Dev server reachable from other devices on the LAN
lan:
  #!/usr/bin/env bash
  set -euo pipefail
  ip=$(ip -4 -o addr show scope global | awk '$2 !~ /^(docker|br-|virbr)/ {print $4}' | cut -d/ -f1 | head -n1)
  echo "  On this machine:  http://localhost:4321"
  echo "  On your phone:    http://${ip}:4321"
  echo
  npm run dev -- --host

# Stop the background dev server
dev-stop:
  npx astro dev stop

# Is a dev server running, and where
dev-status:
  npx astro dev status

# Tail the background dev server's output
dev-logs *ARGS:
  npx astro dev logs {{ARGS}}

# Build the static site into `dist/`
build:
  npm run build

# Serve the built `dist/` exactly as a host would, to check the real output
preview: build
  npm run preview

# Type-check the site, including `.astro` files and content frontmatter
check:
  npm run check

# Report missing facts, stale pages, and untranslated pages. See `tools/audit.mjs`.
audit *ARGS:
  node tools/audit.mjs {{ARGS}}

# Everything CI runs. Use before pushing.
ci: check build
  node tools/audit.mjs

# Regenerate the TypeScript types for content collections after editing `src/content.config.ts`
sync:
  npm run sync

# The needs list is the single most valuable object on the site: a mission statement never gets
# reposted, but a dated needs list gets forwarded by newsletters and neighborhood groups, and it
# is what tells a visitor the organization is not dormant. Copy, do not edit in place — the old
# files are the record that this has been happening.

# Start a new dated needs list by copying the most recent one
new-needs:
  #!/usr/bin/env bash
  set -euo pipefail
  today=$(date +%F)
  latest=$(ls -1 src/content/needs/*.yaml | sort | tail -n1)
  target="src/content/needs/${today}.yaml"
  if [ -e "$target" ]; then echo "$target already exists"; exit 1; fi
  sed "s/^date: .*/date: ${today}/" "$latest" > "$target"
  echo "created $target from $(basename "$latest")"

# Start a new update post
new-update TITLE:
  #!/usr/bin/env bash
  set -euo pipefail
  today=$(date +%F)
  slug=$(echo "{{TITLE}}" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-|-$//g')
  target="src/content/updates/${today}-${slug}.md"
  if [ -e "$target" ]; then echo "$target already exists"; exit 1; fi
  cat > "$target" <<MARKDOWN
  ---
  title: {{TITLE}}
  date: ${today}
  summary: One sentence, shown on the index page and in the RSS feed.
  lang: en
  draft: true
  ---

  Three sentences about a specific week beats an announcement. What came in, what went out, what
  ran short.

  Remove \`draft: true\` to publish.
  MARKDOWN
  sed -i 's/^  //' "$target"
  echo "created $target"

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
  rm -rf dist .astro node_modules/.astro

# Print the dev shell's PATH, e.g. for pointing an editor's tooling at it
sh_path:
  nix develop --command printenv PATH
