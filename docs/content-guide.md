# Updating the site

For whoever keeps the site current. You do not need to understand the code — everything here lives
in `src/content/`, and every file is plain text.

You can edit these files on github.com directly: browse to the file, click the pencil icon, make
the change, and choose "Create a new branch and start a pull request". Someone reviews it and the
site updates itself a minute after it is merged.

## The needs list — do this weekly

This is the most valuable thing on the site. A mission statement never gets forwarded; a dated
needs list gets reposted by church newsletters and neighborhood groups. It is also what someone
checks to see whether the organization is still active, so an old date does real damage.

Files live in `src/content/needs/`, one per date. **Copy the newest one to a new file named for
today** rather than editing it — the old files are the record that this has been happening.

From a terminal, `just new-needs` does the copying for you.

```yaml
date: 2026-09-14

categories:
  - name: { en: Hygiene supplies, es: Artículos de higiene }
    items:
      - { en: Deodorant, es: Desodorante }
      - name: { en: Diapers, es: Pañales }
        urgent: true
        note: { en: "sizes 4 and 5", es: "tallas 4 y 5" }

notNeeded:
  - { en: Adult clothing, es: Ropa de adulto }
```

Three things to get right:

- **Change the `date` at the top** to match the filename. This is what the site displays.
- **Mark only two or three things `urgent: true`.** If everything is urgent, nothing is, and the
  marker stops meaning anything to a reader.
- **Fill in `notNeeded` when something is overflowing.** It feels like an odd thing to publish, and
  it is one of the strongest signals on the whole site — it shows someone is actually looking at
  the shelves rather than posting a generic wish list.

Any value containing a comma must be in `"quotes"`, or the file will not parse and the site will
refuse to build. That refusal is deliberate: a broken file stops the deploy instead of blanking a
section of the live site.

## Updates

Short posts, in `src/content/updates/`. One file each, named `YYYY-MM-DD-a-short-title.md`.

```markdown
---
title: 120 bags out the door in August
date: 2026-09-02
summary: One sentence, shown on the index page and in the RSS feed.
lang: en
draft: false
---

Three sentences about a specific week beats an announcement. What came in, what went out, what ran
short.
```

Set `draft: true` to keep something in the repo without publishing it. Set `lang: es` for a post
written in Spanish.

Do not round numbers up, and do not publish a figure nobody counted. "Roughly 40 bags in a typical
week" is more persuasive to a funder than "thousands served", because it sounds like someone was
counting.

## Events

One file per event in `src/content/events/`. See `src/content/events/README.md` for the format.
Past events move into a collapsed list automatically; leave them there, since a visible history of
things that actually happened is worth more than an empty page.

## Facts about the organization

The EIN, board list, address, hours, donation link, and the answers on the Get help page all live
in one file: `src/data/org.ts`. It has comments explaining each field.

Anything currently set to `null` is a fact nobody has supplied yet, and the site hides that section
rather than showing an empty one. Run `just audit` (or ask whoever is maintaining the site) to see
the list. The largest gaps right now are the board roster, the EIN, and at least one counted
number — those three are what a grant reviewer looks for first.

## Photographs

Send the original file to whoever maintains the site rather than adding it yourself; it needs its
location metadata stripped first. Phone photos record GPS coordinates, and publishing those from
this address would matter.

What is worth shooting, all of it doable in one afternoon with a phone in natural light: the stairs
down to the basement, full shelves and empty ones, boxes staged for distribution, hands sorting and
packing, the back door and the doorbell, the parking lot, coats on a rack, a folding table
mid-setup, the exterior of the church, a wide shot of the room with nobody in it.

**Never photograph the people receiving goods.** Volunteers only, and ask them first. Shoot two
hundred frames, keep twelve.
