# CLAUDE.md

Behavioral rules for Claude Code in the existence repository.

## Project Overview

Text-based HTML5 game. "Power anti-fantasy" — constrained agency without judgment. No stats visible. All state hidden. Prose carries everything.

## Architecture

```
js/
  timeline.js   # Seeded PRNG (xoshiro128**), action log, localStorage autosave, deterministic replay
  state.js      # Hidden state engine: energy, money, stress, hunger, time, social, job_standing
  world.js      # Location graph, movement with time cost, event triggers
  content.js    # All prose, interaction definitions, event text, idle thoughts
  ui.js         # DOM rendering, fade transitions, idle timer
  game.js       # Orchestration, replay, action/move/idle handlers
css/
  style.css     # Typography, layout, atmosphere
index.html      # Single page, minimal markup
serve.js        # Bun static file server
```

## Development

```bash
nix develop     # Enter dev shell
bun serve.js    # Serve on http://localhost:3000
```

No build step. Plain JS loaded via script tags.

## Core Rules

- **Note things down immediately:** problems, tech debt, or issues spotted MUST be added to TODO.md backlog
- **Do the work properly.** Don't leave workarounds or hacks undocumented.

## Design Principles

**No visible quantification.** No numbers, meters, labels, or system voice. Ever. The player never sees the simulation.

**Opaque constraints.** The player never sees the full action space or why things aren't available. Things just aren't there when they can't be.

**Text carries everything.** Prose tone, word choice, what's mentioned and what isn't = the "UI". The same moment reads differently depending on hidden state.

**Structure serves the moment.** Sometimes choices, sometimes description, sometimes events happening to you. Not locked to one interaction pattern.

**One timeline.** No save scumming. Autosave on every action. You live with what happened. Closing and reopening picks up where you left off.

**Deterministic replay.** All RNG through seeded PRNG (`Timeline.random`). No `Math.random`, no `Date.now` in simulation. Given the same seed and action sequence, the game produces the exact same world state.

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

## Workflow

**Minimize file churn.** When editing a file, read it once, plan all changes, and apply them in one pass. Avoid read-edit-fail-read-fix cycles by thinking through the complete change before starting.

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
