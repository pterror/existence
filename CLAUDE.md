# CLAUDE.md

Behavioral rules for Claude Code in the existence repository.

## Project Overview

Text-based HTML5 game. "Power anti-fantasy" — constrained agency without judgment. No stats visible. All state hidden. Prose carries everything.

## Architecture

```
js/
  names.js      # Generated name frequency data (US Census + SSA). Built by scripts/build-names.js
  runs.js       # IndexedDB storage layer for multi-run support
  timeline.js   # Seeded PRNG (xoshiro128**), dual streams, action log, delegates save to Runs
  events.js     # In-memory event history (record/query semantic events, reconstructed during replay)
  state.js      # Hidden state engine: energy, money, stress, hunger, time, social, job_standing
  character.js  # Character schema, Character.get() accessor, applyToState()
  world.js      # Location graph, movement with time cost, event triggers
  content.js    # All prose, interaction definitions, event text, idle thoughts
  chargen.js    # Random generation, sandbox UI flow, name sampling
  ui.js         # DOM rendering, fade transitions, idle timer
  game.js       # Async init, threshold screen, step-away, look-back, orchestration
css/
  style.css     # Typography, layout, atmosphere
index.html      # Single page, minimal markup
serve.js        # Bun static file server
scripts/
  download-names.sh  # Downloads raw Census + SSA data into vendor/
  build-names.js     # Processes raw data into js/names.js
DESIGN.md       # Simulation design vision — what the game should become
STATUS.md       # What's actually implemented right now
```

## Development

```bash
nix develop     # Enter dev shell
bun serve.js    # Serve on http://localhost:3000
```

No build step. Plain JS loaded via script tags.

## Core Rules

- **Note things down immediately:** problems, tech debt, or issues spotted MUST be added to TODO.md backlog
- **Capture fundamental principles.** When a design principle is discovered, clarified, or corrected — whether in conversation or during implementation — write it into CLAUDE.md (short rule) and DESIGN.md (full explanation) immediately. Principles are more important than code. Don't let them live only in chat history.
- **Do the work properly.** Don't leave workarounds or hacks undocumented.

## Design Principles

**No visible quantification.** No numbers, meters, labels, or system voice. Ever. The player never sees the simulation.

**Opaque constraints.** The player never sees the full action space or why things aren't available. Things just aren't there when they can't be.

**Gradients, not binaries.** State shapes experience continuously. Nothing switches on or off at a threshold. There's always something you can do at every point along every spectrum — it just changes in character, cost, and texture. The simulation never dead-ends at an extreme.

**Text carries everything.** Prose tone, word choice, what's mentioned and what isn't = the "UI". The same moment reads differently depending on hidden state.

**Structure serves the moment.** Sometimes choices, sometimes description, sometimes events happening to you. Not locked to one interaction pattern.

**Simulated persistence.** Objects in the world that have state in real life should have state in the simulation. A phone has an inbox — messages arrive whether or not you look, and checking shows what's accumulated. Ignoring things has weight. This isn't UI chrome; it's the simulation being honest.

**One timeline.** No save scumming. Autosave on every action. You live with what happened. Closing and reopening picks up where you left off.

**Deterministic replay.** All RNG through seeded PRNG (`Timeline.random`). No `Math.random`, no `Date.now` in simulation. Given the same seed and action sequence, the game produces the exact same world state.

**The world is real.** The simulation models real-world mechanics. Derive behavior from parameters, don't hardcode assumptions. Geography derives from latitude: sign gives hemisphere, magnitude gives climate zone (tropical < 23.5°, temperate 23.5–66.5°), day length varies accordingly. Seasons depend on hemisphere and climate. Store latitude, derive everything else. The initial focus is surviving in a generic culture, but the simulation's bones should be honest about how the world works.

**Handle absence, don't patch symptoms.** The game runs in a browser tab. If the player walks away, the game shouldn't generate content into nothing. Handle absence properly (step-away, auto-pause, tab detection) and downstream problems like event accumulation dissolve. Deliberate inaction — the player choosing not to act — is a different thing entirely and should be a real, supported experience.

**No text reuse as a bandaid.** Seeing the same text twice is the game breaking the fiction. Text reuse is only acceptable when the repetition is genuinely realistic — a recurring sound, a repeated routine. Never to fill space, never because the pool ran out, never as a substitute for writing more content.

**Effects depend on internal state.** The same action at different moods produces different mechanical outcomes, not just different prose. Going for a walk doesn't always reduce stress. Lying in bed doesn't always help. The simulation is honest about when things help and when they don't — relief requires the internal conditions for relief.

**Neurochemistry has inertia.** Mood emerges from neurochemical levels that drift toward targets, not from instant state derivation. Eating a sandwich doesn't snap your mood — serotonin target shifts, and the actual level follows over hours. Drift uses exponential approach with asymmetric rates (falls faster than rises). Biological jitter uses deterministic sine waves (no PRNG) so adding systems later doesn't break replay. Sleep is the strongest lever on mood — quality affects serotonin synthesis and NE clearance.

**Emotional inertia is personal.** How sticky moods are varies per character. Neuroticism, self-esteem, and rumination are generated at character creation and stored as raw personality values in state. The drift engine computes `effectiveInertia()` from these each tick — no pre-computed inertia value. Only the four mood-primary systems (serotonin, dopamine, NE, GABA) are affected; physiological rhythms (cortisol, melatonin, etc.) ignore personality. Neuroticism adds extra stickiness in the "toward worse mood" direction only. Sleep deprivation, poor sleep quality, and chronic stress temporarily increase inertia for everyone.

## Code Conventions

**RNG discipline:**
- ALL randomness goes through `Timeline.random()` and friends
- Event text must be generated synchronously (consuming RNG), then displayed with `setTimeout` delays
- Interaction IDs must be unique across all locations (e.g., `check_phone_bedroom`, not `check_phone`)

**Replay correctness:**
- Replay skips availability checks — always executes recorded actions
- Idle events are recorded as actions so their RNG consumption replays correctly
- RNG consumption order must match exactly between live play and replay

**Prose:**
- No numbers, stats, or system voice in player-facing text
- State affects prose through qualitative tiers, not numeric thresholds exposed to the player
- The same moment reads differently depending on hidden state
- Prose leads, simulation follows. If the text needs a phone inbox to feel real, build the inbox. Don't hollow out prose to match a thin simulation — deepen the simulation to support the prose.

## Workflow

**Minimize file churn.** When editing a file, read it once, plan all changes, and apply them in one pass. Avoid read-edit-fail-read-fix cycles by thinking through the complete change before starting.

**Always commit when done.** When you finish a task, commit the work. Don't leave changes uncommitted. If a task has multiple logical pieces, commit each piece separately.

**Keep STATUS.md current.** Before every commit, check whether the work changes what's implemented — a new interaction, a new state variable, a new system, a structural change. If it does, update STATUS.md to match. STATUS.md is the ground truth for what the codebase actually does right now.

**Keep DESIGN.md and CLAUDE.md current.** When a conversation clarifies design direction, corrects a simplification, or adds nuance to how a system should work — capture it in DESIGN.md (full explanation) and CLAUDE.md (short rule) before committing. Design understanding evolves during implementation. Don't let the documents fall behind the thinking.

## Commit Convention

Use conventional commits: `type(scope): message`

Types:
- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code change that neither fixes a bug nor adds a feature
- `docs` - Documentation only
- `chore` - Maintenance (deps, CI, etc.)

Scope is optional (e.g., `state`, `content`, `ui`).

## Negative Constraints

Do not:
- Show any numbers, meters, or stats to the player
- Use `Math.random()` or `Date.now()` in simulation code
- Force the player through a prescribed sequence — the world responds, it doesn't herd
- Add game chrome, HUD elements, or anything that looks like a "game UI"
- Create save/load UI — the game just continues where you left off
- Announce actions ("I will now...") — just do them
- Use `--no-verify` — fix the issue or fix the hook
