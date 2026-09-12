# Email authentication (SPF, DKIM, DMARC)

The domain is registered with **Squarespace Domains LLC**, DNS is answered by Google Cloud DNS
(`ns-cloud-d1`–`d4.googledomains.com`, inherited from Google Domains), and mail is **Google
Workspace**. Records are edited at Squarespace → Domains → `operation-ground-support.org` → DNS →
DNS Settings → Custom Records.

All three of these records are public by design. Nothing on this page is a secret, and none of it
needs to be handled carefully.

## The plain-language version

Email was designed in the 1980s with no way to check who actually sent a message. Anyone can put
`info@operation-ground-support.org` in the From line of an email the way anyone can write any
return address on an envelope. Nothing about the mail system stops them.

These three DNS records are the fix that was bolted on later. Think of DNS as the public directory
for the domain — anyone in the world can look up what it says. So the organization publishes three
notes in that directory, and receiving mail servers read them:

- **SPF** is the guest list: *"only these servers are allowed to send mail as us."*
- **DKIM** is the wax seal: *"real mail from us carries a signature only we can produce, and here
  is how to check it."*
- **DMARC** is the standing instruction: *"if a message fails both of the above, here is what we
  want you to do about it, and please tell us it happened."*

Two things go wrong without them. Someone can send a convincing fake donation appeal that appears
to come from this organization, and genuine mail from the organization is more likely to land in
spam, because a domain that publishes nothing looks like a domain nobody is maintaining.

This matters more than usual here. A nonprofit asking for money is a well-known phishing target,
and the people this organization serves are exactly the people least able to absorb being scammed.

## What is in place

As of 2026-09-12:

| Record | Host | Status |
| --- | --- | --- |
| SPF | `@` | live |
| DMARC | `_dmarc` | live, monitoring only |
| DKIM | `google._domainkey` | **not yet — needs the Workspace admin** |

### SPF — live

```
v=spf1 include:_spf.google.com ~all
```

A TXT record at the domain root listing who may send mail as this domain. `include:_spf.google.com`
defers to Google's own published list of sending servers, so it keeps working when Google changes
their IPs. `~all` is a *softfail*: anything not on the list is suspicious but should still be
delivered. That is the right setting while DMARC is in monitoring mode — the stricter `-all`
(hardfail) comes later, if at all.

**The trap:** a domain may have **exactly one** SPF record. Two is a permanent error, not a merge —
receivers are required to treat it as `permerror` and most give up checking entirely. So when a
donation processor, a mailing-list tool, or a contact-form service needs to send mail as this
domain, its `include:` is added *inside the existing record*:

```
v=spf1 include:_spf.google.com include:example-processor.com ~all
```

This is the single most common way small organizations silently break their own mail. It usually
happens six months later, to someone who was not part of setting this up, which is why it is
written down here. There is also a hard limit of 10 DNS lookups per SPF evaluation; each `include:`
costs at least one.

### DMARC — live, monitoring only

```
v=DMARC1; p=none; rua=mailto:dmarc@operation-ground-support.org; fo=1
```

A TXT record at `_dmarc`. It ties SPF and DKIM together and says what to do when both fail.

- `p=none` — **enforce nothing.** Deliver as normal, just send reports. This is deliberately the
  weakest setting and is safe to publish immediately, because it cannot break anything.
- `rua=` — where to send daily aggregate reports.
- `fo=1` — generate a failure report if *either* SPF or DKIM fails, rather than only when both do.
  More signal while working out what legitimately sends mail here.

`dmarc@operation-ground-support.org` must actually receive mail — an alias or a Google Group
pointing at whoever reads this is fine. Reports arrive as gzipped XML, one per day per receiving
provider, and are unreadable by hand. dmarcian and Postmark both have free tiers that turn them
into a table of "here is everything that sent mail as you last week." Sign up for one before the
reports start piling up.

## What is left: DKIM

DKIM cannot be done from the DNS panel alone, because Google has to generate the key. It needs
someone with **Super Admin** on the Google Workspace account (or a delegated role carrying the
Gmail settings privilege).

### How the key actually works

Google generates an RSA keypair inside Workspace. The **private** key stays on Google's
infrastructure and is used to sign every outbound message at their SMTP servers, after the message
leaves the sender's device. The **public** key is what gets published in DNS, so that any receiving
mail server can verify the signature.

This answers the question that the name "key" tends to raise: **no private key is ever handed to
anyone, downloaded, or installed in a mail app.** There is nothing to configure in Gmail, Outlook,
Thunderbird, or on anyone's phone. Google will not export the private key even to an administrator,
and nobody should go looking for it.

That is worth stating plainly because it is the opposite of PGP or S/MIME, where the key lives on
the endpoint and identifies a *person*. DKIM identifies the *domain*, one layer down, and it is
invisible to everyone who uses the mailbox. No one's workflow changes.

The consequence to remember: Google can only sign mail that goes **through** Google. If a donation
platform or form service sends mail as this domain from its own servers, that mail is unsigned by
this key and needs its own DKIM setup from that provider — plus its `include:` in the SPF record
above.

`google` in `google._domainkey` is the **selector**. Selectors exist so a key can be rotated:
publish a second key under a new selector, switch Google to it, then retire the old record once no
in-flight mail is still signed with it.

### What to ask the Workspace admin for

Send them this:

> In the Google Workspace admin console, please turn on DKIM for
> `operation-ground-support.org` and send me the DNS record it generates. The steps are:
>
> 1. admin.google.com → **Apps → Google Workspace → Gmail → Authenticate email**
> 2. Select `operation-ground-support.org` from the domain dropdown
> 3. Click **Generate new record**, and keep the defaults: **2048-bit** key, prefix/selector
>    `google`
> 4. Send me the two values it displays — the **DNS host name** (should be `google._domainkey`)
>    and the **TXT record value** (a long string starting `v=DKIM1; k=rsa; p=MII...`)
>
> Then **stop and wait.** I will add the record to DNS and confirm it is resolving. Once I do,
> go back to that same screen and click **Start authentication** — that is the step that actually
> switches signing on, and it fails if the DNS record is not visible yet.
>
> Both values are public information that get published in DNS, so there is nothing sensitive to
> protect in sending them. There is no private key involved on your end and nothing to install in
> anyone's email app.

If they come back offering a file to download or something described as a private key, something
has gone wrong — Google does not produce one for DKIM.

### Adding it

Squarespace → DNS Settings → Custom Records, type `TXT`, host `google._domainkey`, value as
supplied. Paste it without adding surrounding quotes.

The value is roughly 400 characters, which exceeds the 255-character limit on a single TXT string;
the DNS panel is expected to split it automatically and the record still reads as one value. If
Squarespace rejects it outright, have the admin regenerate at 1024-bit instead. That is weaker but
universally accepted, and it can be rotated up later.

Then confirm it resolves, tell the admin to click **Start authentication**, and check that the
console reports *"Authenticating email with DKIM"*.

If Workspace hosts any other domains or domain aliases, each one needs its own DKIM key. This is
per-domain, not per-account.

## Tightening the DMARC policy

`p=none` protects nobody on its own — it only produces reports. The point of starting there is to
find every legitimate sender *before* asking receivers to reject anything.

1. **2026-09-12** — SPF and DMARC `p=none` published. *(done)*
2. **Once DKIM is live** — read the aggregate reports weekly. The question being answered is: is
   everything that legitimately sends mail as this domain passing SPF or DKIM? Expect surprises;
   form handlers, calendar invites, and mailing-list tools all turn up here.
3. **From 2026-10-10, once a full clean fortnight has passed** — move to
   `p=quarantine; pct=100`. Failing mail goes to spam rather than the inbox. Still reversible in
   minutes.
4. **Roughly a month after that, if nothing broke** — move to `p=reject`.

**Do not skip to `p=reject`.** The failure mode is a small organization silently no longer
delivering its own donation receipts, and discovering it only when someone complains. The whole
reason this is staged is that the reports tell you what breaks before it breaks.

Revisit step 3 whenever a new sending service is added. A new mail source under `p=reject` with no
SPF include and no DKIM key is mail that vanishes.

## Verifying from the command line

```sh
d=operation-ground-support.org
dig +short TXT $d                        # SPF, alongside the site-verification string
dig +short TXT _dmarc.$d                 # DMARC
dig +short TXT google._domainkey.$d      # DKIM public key
dig +short MX $d                         # should be the five aspmx.l.google.com hosts
```

DNS changes are not instant. These nameservers publish a 300-second TTL, so a few minutes is
normal; if a record has not appeared after an hour, it was not saved correctly. `dig` reads from a
local resolver that may be caching — `dig +short TXT $d @8.8.8.8` asks a public resolver directly,
which is the better check after a change.

The real end-to-end test is a delivered message. Send one to a Gmail address, open it, and use
**Show original**: SPF, DKIM, and DMARC should each read `PASS`.
