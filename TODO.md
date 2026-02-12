# TODO

## Backlog

- [ ] SSA download script falls back to manual download when SSA blocks curl. Document this in README or script output.
- [ ] Chargen sandbox: sleepwear is randomly assigned during wardrobe screen. Could offer as separate choice.
- [ ] Legacy defaults in character.js still use original names (Dana/Marcus/etc.) as fallback. Only used if somehow no character is set.
- [ ] Phone system redesigned: phone events removed from world.js checkEvents, inbox generation (generateIncomingMessages) added to game.js action/move flow. checkPhoneContent no longer generates random messages — phone is now an interactive mode with persistent inbox. RNG consumption order changed. Breaks all existing saves.
- [ ] Idle actions no longer trigger events (`Timeline.chance(0.3)` + `World.checkEvents()` removed). Existing saves with idle actions will replay differently (RNG consumption changed). Dev-only concern.
- [ ] Old localStorage saves (`existence_timeline`) are not migrated to IndexedDB. Players with existing saves will start fresh.
- [ ] No run end conditions defined yet. `Runs.finishRun(id)` exists but nothing calls it. Need content-driven endings.
- [ ] Visual replay of finished runs uses recursive setTimeout chain — very long runs may have performance issues. Consider a skip/fast-forward mechanism.
- [x] **Bug:** Awareness clicks (checking time/money) are not recorded as actions. On page refresh, `last_observed_time`/`last_observed_money` reset — losing direct observations. Fix: record `observe_time`/`observe_money` as actions so they replay correctly.
- [x] Step-away link ("...") may be too subtle. Players may not discover it. Consider clearer affordance or tutorial mention.
