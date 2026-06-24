---
"agent-install": patch
---

Fix skill re-install wiping/not updating files when the discovered source path is the same as (or overlaps) the install destination (e.g. authoring skills directly in `.agents/skills`). The copy now stages overlapping sources and is a no-op when source and destination resolve to the same path, instead of deleting the source before copying.
