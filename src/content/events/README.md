# Events

One YAML file per event, named for its date. The easiest start is to copy
`_EXAMPLE_2026-09-26-coat-drive.yaml`, which has every field filled in and commented. Keep the
example itself: it is a permanent reference, and its `draft: true` keeps it off the site.

The short version:

```yaml
# 2026-09-13-fall-coat-drive.yaml
title:
  en: Fall coat drive
  es: Colecta de abrigos de otoño
start: 2026-09-13T10:00:00-05:00
end: 2026-09-13T14:00:00-05:00
location:
  en: Grace UMC parking lot
  es: Estacionamiento de Grace UMC
address: 123 Example St, Dallas
description:
  en: Drop coats at the tent in the lot; no need to come inside.
  es: Deje los abrigos en la carpa del estacionamiento; no hace falta entrar.
signUpUrl: https://example.org/signup
signUpLabel:
  en: Sign up for this event
  es: Inscríbase para este evento
draft: true   # delete this line when the event is confirmed; until then it does not appear
```

Use an ISO 8601 timestamp with an offset (`-05:00` for CDT, `-06:00` for CST). Offsets avoid the
whole class of bugs where an event drifts an hour when the clocks change. The site always shows
the date and time in Dallas time, whatever offset you write.

**No time yet?** Write `date: 2026-09-13` in place of `start` and `end`. The card shows the day
and says the time is to be confirmed. Swap it for `start` once the time is set. Give one or the
other, never both; the site refuses to build otherwise, and says why.

**The button** says "Volunteer" and opens `signUpUrl`. When the form is for this event alone
rather than the general volunteer sign-up, set `signUpLabel` as above. An event with no
`signUpUrl` gets a "Follow updates" button instead, once there is at least one update posted.

**Photos** are optional: one or two, across the top of the card. Put each beside the event's file
with `just add-event-photo <photo> <name>`, starting the name with the event's date so the photo
sorts next to its file. That command also removes the location data phones record in every photo.
Then list them under `photos`, each with `alt` text, and add a `photoCaption` saying what they show
and when: a photo on an upcoming event is always of something earlier. The example file has the
full layout. Anyone recognisable must have agreed to be on the website (a child through a parent
or guardian); write who agreed and the date in a comment beside the photo.

Old files can stay. Past events move into the collapsed "Past" list automatically, and a short
visible history of things that actually happened is worth more than an empty page.
