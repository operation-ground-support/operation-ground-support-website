# Events

One YAML file per event, named for its date. Example:

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
```

Use an ISO 8601 timestamp with an offset (`-05:00` for CDT, `-06:00` for CST). Offsets avoid the
whole class of bugs where an event drifts an hour when the clocks change.

Old files can stay. Past events move into the collapsed "Past" list automatically, and a short
visible history of things that actually happened is worth more than an empty page.
