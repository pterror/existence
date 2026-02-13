# TODO

## Backlog

- [ ] SSA download script falls back to manual download when SSA blocks curl. Document this in README or script output.
- [ ] Chargen sandbox: sleepwear is randomly assigned during wardrobe screen. Could offer as separate choice.
- [ ] Legacy defaults in character.js still use original names (Dana/Marcus/etc.) as fallback. Only used if somehow no character is set.
- [x] Phone system redesigned: phone events removed from world.js checkEvents, inbox generation (generateIncomingMessages) added to game.js action/move flow. checkPhoneContent no longer generates random messages — phone is now an interactive mode with persistent inbox. RNG consumption order changed. Breaks all existing saves. **Resolved by version bump to v2.**
- [x] Idle actions no longer trigger events (`Timeline.chance(0.3)` + `World.checkEvents()` removed). Existing saves with idle actions will replay differently (RNG consumption changed). Dev-only concern. **Resolved by version bump to v2.**
- [ ] Old localStorage saves (`existence_timeline`) are not migrated to IndexedDB. Players with existing saves will start fresh.
- [x] Continuous time + start_timestamp + sleep rewrite changes RNG consumption order. Existing IDB saves are incompatible (replay will diverge). No migration path — old runs will produce wrong state. **Resolved by version bump to v2.**
- [ ] No run end conditions defined yet. `Runs.finishRun(id)` exists but nothing calls it. Need content-driven endings.
- [x] Visual replay of finished runs uses recursive setTimeout chain — very long runs may have performance issues. Consider a skip/fast-forward mechanism. **Replaced with scrubber-based replay.**
- [x] **Bug:** Awareness clicks (checking time/money) are not recorded as actions. On page refresh, `last_observed_time`/`last_observed_money` reset — losing direct observations. Fix: record `observe_time`/`observe_money` as actions so they replay correctly.
- [x] Chargen: fold the two creation paths together. "Choose your own" should be the random path with a toggle that makes configurable options visible — not a separate screen. Random generates everything, toggle reveals the knobs.
- [x] Chargen: add location picker (latitude-based). Atmospheric options that imply latitude range. For tropical latitudes, season picker should show wet/dry instead of four seasons. Currently sandbox defaults to latitude 42 (NH temperate).
- [x] Step-away link ("...") may be too subtle. Players may not discover it. Consider clearer affordance or tutorial mention.
