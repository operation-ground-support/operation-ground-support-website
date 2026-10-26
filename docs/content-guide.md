# Updating the site

For whoever keeps the site current. You do not need to understand the code — everything here lives
in `src/content/`, and every file is plain text.

You can edit these files on github.com directly: browse to the file, click the pencil icon, make
the change, and choose "Create a new branch and start a pull request". Someone reviews it and the
site updates itself a minute after it is merged.

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

The quickest way to start one is to copy the `_EXAMPLE_` file in that folder, rename it, and delete
its `draft: true` line when it is ready. Leave the example itself where it is — it is kept on
purpose, and the site's checks fail if it ever loses its own `draft: true`.

Do not round numbers up, and do not publish a figure nobody counted. "Roughly 40 bags in a typical
week" is more persuasive to a funder than "thousands served", because it sounds like someone was
counting.

## Events

One file per event in `src/content/events/`. Copy the `_EXAMPLE_` file there — it has every field
filled in and a comment on each — and delete its `draft: true` line once the event is confirmed.
`src/content/events/README.md` has the short version.

Past events move into a collapsed list automatically; leave them there, since a visible history of
things that actually happened is worth more than an empty page.

Commas are fine in a plain value. Two things are not: a colon followed by a space (`Note: bring
coats`) and a `#` after a space, which starts a comment and silently cuts the rest of the line off.
Put any value with either of those in `"quotes"`, or use the `>-` form the example uses for
descriptions. A file that does not parse makes the site refuse to build, and that refusal is
deliberate: a broken file stops the deploy instead of blanking a section of the live site.

## Facts about the organization

The EIN, board list, partners, address, and donation link all live in one file: `src/data/org.ts`.
It has comments explaining each field.

Anything currently set to `null` is a fact nobody has supplied yet, and the site hides that section
rather than showing an empty one. Run `just audit` (or ask whoever is maintaining the site) to see
the list. The largest gaps right now are at least one counted number, a scan of the IRS
determination letter, and the founding year — those are what a grant reviewer looks for first.

## Photographs

Send the original file to whoever maintains the site rather than adding it yourself; it needs its
location metadata stripped first. Phone photos record GPS coordinates, and publishing those from
this address would matter.

What is worth shooting, all of it doable with a phone in natural light: boxes staged for
distribution, hands sorting and packing, produce coming off a truck, soup going into the freezer,
coats on a rack, a folding table mid-setup, the van loaded for a run, a wide shot of a room with
nobody in it.

**Never photograph the people receiving goods.** Volunteers only, and ask them first. Shoot two
hundred frames, keep twelve.
