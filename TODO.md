# TODO

## Backlog

- [ ] `data/` vendored name data is large (~20MB raw). Consider .gitignore raw data, keep only `js/names.js` generated output.
- [ ] SSA download script falls back to manual download when SSA blocks curl. Document this in README or script output.
- [ ] Chargen sandbox: player name is auto-generated (not choosable). Add a name input screen if desired.
- [ ] Chargen sandbox: sleepwear is randomly assigned during wardrobe screen. Could offer as separate choice.
- [ ] Legacy defaults in character.js still use original names (Dana/Marcus/etc.) as fallback. Only used if somehow no character is set.
- [ ] fflate is a dev dependency only (used by download script). Could pin or document.
