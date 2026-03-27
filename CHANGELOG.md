# Changelog

## [1.0.0] — Initial release

- `xmlCommenter.commentTag` — toggle `<!-- -->` on open + close tags independently
- `xmlCommenter.commentBlock` — toggle `<!-- -->` around the full block
- Supports XML, HTML, XHTML, SVG
- Correctly handles nested same-name tags
- Both commands are full toggles (idempotent on double-press)
- All edits are atomic — single undo step per command
