# TODO

## Backlog

- [ ] `data/` vendored name data is large (~20MB raw). Consider .gitignore raw data, keep only `js/names.js` generated output.
- [ ] SSA download script falls back to manual download when SSA blocks curl. Document this in README or script output.
- [ ] Chargen sandbox: sleepwear is randomly assigned during wardrobe screen. Could offer as separate choice.
- [ ] Legacy defaults in character.js still use original names (Dana/Marcus/etc.) as fallback. Only used if somehow no character is set.
- [ ] fflate is a dev dependency only (used by download script). Could pin or document.
- [ ] Phone check bank notification added a new `Timeline.chance(0.25)` RNG call, changing RNG consumption order. Existing saves with phone check actions will replay differently. Not a concern yet (dev only) but will matter once there are real players.
- [ ] Old localStorage saves (`existence_timeline`) are not migrated to IndexedDB. Players with existing saves will start fresh.
- [ ] No run end conditions defined yet. `Runs.finishRun(id)` exists but nothing calls it. Need content-driven endings.
- [ ] UI.init() is called multiple times when switching runs/threshold. Works but wasteful — could guard against re-init.
- [ ] Visual replay of finished runs uses recursive setTimeout chain — very long runs may have performance issues. Consider a skip/fast-forward mechanism.
- [ ] **Bug:** Awareness clicks (checking time/money) are not recorded as actions. On page refresh, `last_observed_time`/`last_observed_money` reset — losing direct observations. Fix: record `observe_time`/`observe_money` as actions so they replay correctly.
- [ ] Step-away link ("...") may be too subtle. Players may not discover it. Consider clearer affordance or tutorial mention.
- [ ] Sleepwear choice in chargen sandbox: still randomly assigned. Could offer as part of the single-page creation.
