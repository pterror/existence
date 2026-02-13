# What's Implemented

Current state of the codebase. Keep this up to date — see CLAUDE.md workflow rules.

## Simulation

### State Variables (all hidden)
- **energy** (0–100) — tiers: depleted / exhausted / tired / okay / rested / alert
- **stress** (0–100) — tiers: calm / baseline / tense / strained / overwhelmed
- **hunger** (0–100) — tiers: satisfied / fine / hungry / very_hungry / starving
- **social** (0–100) — tiers: isolated / withdrawn / neutral / connected / warm
- **job_standing** (0–100) — tiers: at_risk / shaky / adequate / solid / valued
- **money** (float) — tiers: broke / scraping / tight / careful / okay / comfortable
- **time** — continuous minutes since game start, never resets

### Neurochemistry (Layer 1 of DESIGN-EMOTIONS.md)
28 neurochemical systems modeled as hidden state variables (0–100 scale). Each drifts toward a target value via exponential approach with asymmetric up/down rates (biological half-lives). Deterministic biological jitter (incommensurate sine waves, no PRNG consumed) creates "some days are harder" variability.

**Active systems (8)** — have target functions fed by current game state:
- **serotonin** — fed by sleep quality, social, hunger/tryptophan. Days half-life.
- **dopamine** — fed by energy, stress depletion. ~12-24h half-life.
- **norepinephrine** — fed by stress, sleep quality. Hours half-life.
- **gaba** — fed by chronic stress (slow). ~12-24h half-life.
- **cortisol** — diurnal rhythm (peaks 8AM, nadir midnight) + stress. Fast response.
- **melatonin** — diurnal (rises in darkness, suppressed by light).
- **ghrelin** — maps to hunger state.
- **histamine** — diurnal wakefulness signal.
- **testosterone** — diurnal rhythm (peaks 7AM, nadir evening).

**Accumulation system (1):**
- **adenosine** — linear accumulation during wakefulness (~4/hr), cleared proportionally by sleep.

**Placeholder systems (18)** — initialized at baseline 50, drift toward 50 with jitter. Will gain active feeders as their game systems are built:
glutamate, endorphin, acetylcholine, endocannabinoid, dht, estradiol, progesterone, allopregnanolone, lh, fsh, oxytocin, prolactin, thyroid, insulin, leptin, dhea, hcg (default 0), calcitriol.

**Sleep neurochemistry effects:** sleep interaction stores quality, clears adenosine proportionally, nudges serotonin (good sleep +3, poor -2) and norepinephrine (good sleep -4, poor +3).

### Emotional Inertia (Layer 2 of DESIGN-EMOTIONS.md)
Per-character trait controlling how sticky moods are. Only affects the four mood-primary systems (serotonin, dopamine, NE, GABA) — physiological rhythms are unaffected by personality.

**Personality parameters** (generated at character creation, stored in state):
- **neuroticism** (0–100) — strongest predictor of inertia. Adds extra stickiness in "toward worse mood" direction only.
- **self_esteem** (0–100) — low self-esteem increases inertia in all directions.
- **rumination** (0–100) — high rumination increases inertia in all directions.

**Inertia formula:** `rate = baseRate / effectiveInertia(system, isNegative)`. Base inertia range 0.6 (fluid) to 1.4 (sticky), plus up to +0.2 from neuroticism negative bonus, plus state modifiers (adenosine > 60, poor sleep quality, stress > 60). At personality 50/50/50 → inertia 1.0 → identical to pre-inertia behavior (legacy save compatibility).

**"Worse direction" per system:** serotonin falling, dopamine falling, NE rising, GABA falling.

### Derived Systems
- **Mood tone** — primarily from neurochemistry (serotonin, dopamine, NE, GABA) with physical state overrides → numb / fraying / heavy / hollow / quiet / clear / present / flat. Same 8 tones, now with inertia instead of instant derivation.
- **Prose-neurochemistry shading** — three-layer pattern: moodTone() as coarse selector, weighted variant selection via `State.lerp01()` + `Timeline.weightedPick()`, deterministic modifiers (adenosine fog, NE+low-GABA restlessness). Converted in 3 sites: idle thoughts, bedroom description, lie_there interaction. ~65 call sites remaining. See DESIGN.md "Prose-neurochemistry interface" for the full pattern.
- **Time period** — deep_night / early_morning / morning / late_morning / midday / afternoon / evening / night
- **Observation fidelity** — time and money awareness degrade with distance from last check (exact → rounded → vague → sensory/qualitative)
- **Season** — derived from latitude + start_timestamp. Tropical: wet/dry. Temperate: four seasons. Hemisphere from sign.
- **Weather** — overcast / clear / grey / drizzle. 3% shift chance per action. Affects prose, not mechanics.

### Daily Flags (reset on wake)
dressed, showered, ate_today, at_work_today, called_in, alarm_set, alarm_went_off, work_nagged_today

### Phone State
Battery (dual-rate drain: 1%/hr standby, 15%/hr screen-on; tiers: dead/critical/low/fine), silent mode, inbox (messages accumulate whether or not you look). Charges at 30%/hr during sleep at home and via charge_phone interaction. Starting battery 80–100% (chargen RNG). Message sources: friends (flavor-driven frequency), work nag (30min late), bill notifications (every 7 days).

### Apartment State
fridge_food (integer, depletes on eating, restocked by groceries), apartment_mess (0–100, grows passively)

## Locations (7)

```
apartment_bedroom ─── apartment_kitchen ─── street ─── bus_stop ─── workplace
       │                     │                │
apartment_bathroom ──────────┘          corner_store
```

Travel times: 1min within apartment, 2min apartment↔street, 3min street↔bus_stop, 4min street↔corner_store, 20min bus_stop↔workplace.

## Interactions (33)

### Bedroom (9)
sleep, get_dressed, set_alarm, skip_alarm, charge_phone, check_phone_bedroom, lie_there, look_out_window, (alarm event wakes you)

### Kitchen (5)
eat_food, drink_water, do_dishes, check_phone_kitchen, sit_at_table

### Bathroom (2)
shower, use_sink

### Street (3)
check_phone_street, sit_on_step, go_for_walk

### Bus Stop (1)
wait_for_bus

### Workplace (4)
do_work, work_break, talk_to_coworker, check_phone_work

### Corner Store (3)
buy_groceries, buy_cheap_meal, browse_store

### Phone Mode (3, available anywhere)
read_messages, toggle_phone_silent, put_phone_away

### Global (1, available anywhere with phone)
call_in (call in sick — morning only, work hours)

## Events (13 types)

- **alarm** — fires at alarm_time in bedroom
- **late_anxiety** — stress when late for work (capped at 2 surfaces)
- **hunger_pang** — when hunger > 65 (capped at 2)
- **exhaustion_wave** — when energy < 15 (capped at 2)
- **weather_shift** — random weather change
- **coworker_speaks** — samples coworker, uses chatter table
- **work_task_appears** — job-specific
- **break_room_noise** — job-specific ambient
- **apartment_sound** — pipes, fridge, footsteps
- **apartment_notice** — mess awareness (capped at 2)
- **street_ambient** — cars, buses, sirens
- **someone_passes** — people on street

## Content

### Jobs (3)
**office** — 9am–5pm, 4 tasks expected, cubicle/open-plan prose
**retail** — 10am–6pm, 5 tasks expected, floor/register/stockroom prose
**food_service** — 7am–3pm, 6 tasks expected, kitchen/counter prose

Each has: workplace description (dynamic), do_work prose (6 variants), work_break prose (3 variants), work_task event text, ambient event text.

### Relationships
**Friends (2 per character, 4 flavors):** sends_things, checks_in, dry_humor, earnest. Each has normal messages, isolated messages, idle thoughts.

**Coworkers (2 per character, 3 flavors):** warm_quiet, mundane_talker, stressed_out. Each has chatter and interaction prose.

**Supervisor (1):** named, referenced in work prose.

### Idle Thoughts
Dynamic generation based on mood (8 categories × ~7 general variants + 2–4 NT-weighted variants each), hunger (starving/very_hungry), energy (depleted), social isolation (friend-specific thoughts). NT values (serotonin, dopamine, NE, GABA, adenosine, cortisol) continuously weight variant selection via `State.lerp01()` and `Timeline.weightedPick()`. Recency tracking avoids repeats.

### Sleep Prose
Two-phase system: falling-asleep (how sleep came) + waking-up (the gradient back to consciousness). Falling-asleep branches on pre-sleep energy, stress, quality, and duration (~14 variants). Waking-up branches on post-sleep energy, sleep quality, alarm vs natural wake, time of day (dark/late/morning), and mood (~28 variants). Composed together as a single passage. No numeric hour counts — all qualitative.

### Outfit Prose
6 outfit sets, each with 3 variants: default / low_mood / messy. 6 sleepwear options. All complete prose sentences.

## Character Generation

Single-screen UI with:
- Job dropdown (3 options)
- Age input (numeric, default random 22–48)
- Location dropdown (4 options: tropical, NH temperate, NH cold, SH temperate)
- Season dropdown (dynamic based on location's climate zone)
- Sleepwear dropdown (6 options)
- Wardrobe dropdown (6 outfit sets)
- Friend/coworker/supervisor names (editable, with reroll)
- Player first/last name (editable, with reroll)
- Name sampling from weighted US Census + SSA data (100 first names, 100 surnames)
- Personality parameters: neuroticism, self_esteem, rumination (0–100 each, generated silently, not exposed in UI)

## Infrastructure

### Save System
IndexedDB. RunRecord: `{ id, seed, character, actions, status, createdAt, lastPlayed, version }`. Debounced writes (500ms), flush on beforeunload.

### Multi-Run
Threshold screen lists all runs. Click to resume. "Another life" starts fresh. Step-away link pauses current run and returns to threshold.

### Deterministic Replay
Dual PRNG streams (charRng for chargen, rng for gameplay) derived from master seed via splitmix32. Changing chargen never breaks gameplay replay. Actions logged as `{ type, id/destination, timestamp }`.

### In-Game Look-Back
Replay scrubber with significance heatmap. Scene segmentation (by movement). Snapshot system for fast seeking. Autoplay with variable speed. Keyboard navigation (arrows, ctrl+arrows, space).

### UI
Fade transitions on all text changes. Awareness bar (time + money, clickable to focus). Idle timer (30s → 60s → silent). Phone buzz on new messages. Tab-visibility-aware.
