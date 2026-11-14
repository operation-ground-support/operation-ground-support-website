# Operations

Sequencing notes for putting this site in front of the domain. The order matters more than the
individual steps — do one thing at a time so that when something breaks you know what caused it.

## Before anything else

Two things that are worth doing regardless of what happens to this site.

**Email authentication.** Anyone can send mail that appears to come from
`@operation-ground-support.org` unless the domain publishes records saying who may. For an
organization that emails donors and asks for money, being spoofable is a live risk — "urgent
donation appeal" phishing from a nonprofit's own domain is a known pattern. SPF, DKIM, and DMARC
are all published, and since 2026-09-15 all three pass and align on live mail. See `dns.md`, which
carries the schedule for tightening the DMARC policy — the next step is due from 2026-10-10 — and
the one trap that breaks SPF later.

**Google for Nonprofits.** Verified US 501(c)(3)s get Google Workspace free, which may be most or
all of the ~$15/month currently being paid. Verification runs through Goodstack and typically takes
2–14 working days. Each product then has to be activated separately; verification alone does not
switch them on. Ad Grants (up to $10,000/month in search ads) requires Google Analytics installed
on the site *before* applying, a valid SSL certificate, and a 5% click-through rate to stay in
good standing — which also means the site should not go offline mid-rebuild.

## Where things currently point

Nameservers are Google Cloud DNS (`ns-cloud-d1`–`d4.googledomains.com`). A records point at
Squarespace (`198.185.159.144/145`, `198.49.23.144/145`), `www` is a CNAME to
`ext-sq.squarespace.com`, and mail goes to Google Workspace.

Nameservers say where DNS is *managed*, not who the domain is *registered* with. Google sold its
registrar business to Squarespace in 2023, and `whois` confirms the registrar is now Squarespace
Domains LLC — the `googledomains.com` nameservers are inherited infrastructure, not a second
vendor. The registrar is where nameserver changes happen; records themselves are edited in the
Squarespace domain dashboard.

## The staging site

The live site and the staging copy are two branches of one Cloudflare Pages project,
`operation-ground-support`. Its `main` branch is production, served at
**https://operation-ground-support.org**. Its `staging` branch is served at
**https://staging.operation-ground-support.pages.dev**: a link to send a board member reviewing
copy, or a funder who asked to see progress, before a change goes live.

```sh
nix develop -c just deploy-preview   # build this working tree and publish it as `staging`
```

The upload comes from a working tree, which is the right trade for a staging copy and the wrong
one for the live site; see Governance below. **It must never be published to `main`**: that is the
live site, and the upload carries a `noindex` header (below) that would quietly take the real site
out of search results. The recipe names the `staging` branch for that reason.

Once the project builds from the GitHub repository, any branch pushed there gets a preview of its
own at `<branch>.operation-ground-support.pages.dev` in the same way.

### Keeping it out of search results

A second copy of a nonprofit's site, indexed under a Cloudflare address, is a live credibility
problem: someone searching the organization's name finds a draft, and cannot tell it from the real
thing. So `just deploy-preview` writes a `_headers` file into the upload:

```
/*
  X-Robots-Tag: noindex, nofollow
```

Two details worth knowing before changing this.

Cloudflare adds that header itself to preview deployments, which every branch but `main` is. The
recipe writes it too, so the staging copy stays out even if that default changes.

And it is a header rather than `Disallow: /` in `robots.txt`, which is the intuitive fix and the
wrong one. Disallowing stops a crawler from fetching the page at all, so it never reads the
instruction not to index it, and the URL can still appear in results as a bare link. Allowing the
crawl and answering with `noindex` is what actually removes it.

The file is written into `dist-preview/`, a copy, never into `dist/`. A `noindex` header that
followed the build into the production deploy would be invisible and would quietly delist the real
site.

### Why Pages and not Workers

Cloudflare's own documentation now says to start new projects on Workers rather than Pages. For
this site the older product is still the right one, for a specific reason: a Workers custom domain
requires the domain to be an active Cloudflare zone, while Pages accepts a subdomain whose DNS
lives anywhere. That is exactly the difference between "add one CNAME at Squarespace" and "move
the nameservers first" — and the whole point of the staging site is to not need the cutover yet.

Pages remains available on all plans and nothing here depends on it. The deployable artifact is
still a folder of static files; `wrangler` is a build-time tool in the flake, like `node`.

## Cutover, as three separate operations

Never do more than one of these at a time.

1. **Move DNS to Cloudflare, changing nothing else.** Cloudflare imports the existing zone
   automatically, but the import is not guaranteed complete. Before switching nameservers, verify
   by hand that all five Google MX records are present with correct priorities, along with the
   site-verification TXT and the new SPF/DKIM/DMARC records. Then switch. The site stays on
   Squarespace, mail keeps working, and the only thing that changed is who answers DNS queries.
   Wait a couple of days.
2. **Repoint the site** by changing the A records and the `www` CNAME to Cloudflare Pages. If
   something breaks now, you know exactly which change did it.
3. **Transfer the registrar**, if you decide to. Any time; there is a 60-day lock afterward.

Lower TTLs to 300 seconds a day before step 1 so a mistake rolls back in minutes. Export the full
zone file first — that export is the undo button.

## Hosting

This is the *production* path, for after the cutover. It is separate from the staging site above,
and it should stay separate: a deploy that publishes the live site belongs behind the review gate
on `main`, not behind a command anyone can run from a laptop.

Cloudflare Pages, connected to the GitHub repo:

- Build command: `npm run build` (Pages installs the dependencies itself first)
- Output directory: `dist`
- Node version: none set in the dashboard. Pages reads it from `.node-version` in the repository,
  as the dev shell and CI do; a `NODE_VERSION` setting in the dashboard could override that file
  and let production drift from what was tested.

Netlify and GitHub Pages take the same two settings. Nothing in this project depends on a host's
runtime, which is the point.

`public/_redirects` sends the Squarespace site's old addresses (`/home`, `/contact-us`,
`/sign-up`) to their new pages. Cloudflare Pages and Netlify read it; on GitHub Pages it is ignored
and those links would 404.

## Scheduled rebuilds

Events are sorted into upcoming and past when the site is built, so a site that has not been
rebuilt in a month will describe a past event as upcoming. `EventList.astro` corrects this in the
browser, but the no-JavaScript rendering should not drift far. Set a nightly build hook — on
Cloudflare Pages, a Deploy Hook plus a scheduled trigger; on GitHub Actions, a `schedule:` cron
that hits the hook. Once a day is plenty.

## Governance

The requirement is that one person does the work while two others hold final authority. Separate
*access* from *authority*: broad access is needed to build anything, and authority comes from a
review gate rather than from withholding permissions.

Protect `main`, require a pull request with one approving review, add a `CODEOWNERS` file naming
the two admins, and — this is the part people miss — enable the setting that prevents
administrators from bypassing those rules. Without it an Owner can push straight to `main` and the
gate is decorative. Branch protection is free on public repositories; a public repo is defensible
for a nonprofit marketing site, since there is nothing secret in it and it can attract volunteer
developers. The rule either way is that no secrets are ever committed.

| Service | The developer | The two admins |
| --- | --- | --- |
| Domain registrar | Access | Account owners |
| Google Workspace | Super Admin | Super Admin |
| GitHub org | Owner | Owner |
| Cloudflare | Super Admin | Super Admin |
| Donation processor | **No access** | Admin |
| Password manager | Admin | Admin |

Keeping whoever builds the systems off the donation processor is a standard internal control. It
costs nothing and a funder doing diligence notices its absence.

Recovery matters more than passwords. The common nonprofit disaster is not a breach; it is a
volunteer who set up 2FA on a phone, left, and took the only access with them. Every critical
account needs at least two humans with independent admin access and its MFA recovery codes in a
shared vault. For the registrar, Google Workspace, and the password manager itself, print the
recovery codes and give them to the board chair in a sealed envelope. It feels antiquated and it is
the thing that actually works, because it survives one person's laptop, phone, and involvement.

## The risk that actually kills projects like this

Not the technology — the bus factor. The usual bad outcome for a developer-built nonprofit site is
that it is lovely, it is in git, the technical volunteer moves on, and it silently goes stale. A
stale site is worse in front of a funder than a plain current one.

So either the Markdown-and-pull-request workflow in
[docs/content-guide.md](content-guide.md) is genuinely learnable by someone else at the
organization — test this by having them do it once, unaided — or wire in a git-backed CMS
(Sveltia or Decap) so a non-technical person can post an update without a terminal. `src/content/`
is already structured for that. Decide before the site launches, not after.
