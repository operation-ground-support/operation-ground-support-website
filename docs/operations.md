# Operations

Sequencing notes for putting this site in front of the domain. The order matters more than the
individual steps — do one thing at a time so that when something breaks you know what caused it.

## Before anything else

Two things that are worth doing regardless of what happens to this site.

**Email authentication.** Anyone can send mail that appears to come from
`@operation-ground-support.org` unless the domain publishes records saying who may. For an
organization that emails donors and asks for money, being spoofable is a live risk — "urgent
donation appeal" phishing from a nonprofit's own domain is a known pattern. SPF and DMARC are now
published; DKIM still needs someone with Google Workspace admin access. See `dns.md`, which also
carries the schedule for tightening the DMARC policy and the one trap that breaks SPF later.

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

Cloudflare Pages, connected to the GitHub repo:

- Build command: `npm ci && npm run build`
- Output directory: `dist`
- Node version: 22

Netlify and GitHub Pages take the same two settings. Nothing in this project depends on a host's
runtime, which is the point.

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
