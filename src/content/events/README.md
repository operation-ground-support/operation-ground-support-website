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
description:
  en: Drop coats at the tent in the lot; no need to come inside.
  es: Deje los abrigos en la carpa del estacionamiento; no hace falta entrar.
signUpUrl: https://example.org/signup
draft: true   # delete this line when the event is confirmed; until then it does not appear
```

Use an ISO 8601 timestamp with an offset (`-05:00` for CDT, `-06:00` for CST). Offsets avoid the
whole class of bugs where an event drifts an hour when the clocks change. The site always shows
the date and time in Dallas time, whatever offset you write.

Old files can stay. Past events move into the collapsed "Past" list automatically, and a short
visible history of things that actually happened is worth more than an empty page.
