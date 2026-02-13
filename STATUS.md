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

### Basic Sentiments (Layer 2 of DESIGN-EMOTIONS.md)
Likes and dislikes generated at character creation. Array of `{target, quality, intensity}` objects stored on character and written to state. 8 categories per character:
- **Weather** — liked weather (comfort) and disliked weather (irritation) → serotonin target modifiers
- **Time of day** — morning or evening person → serotonin + dopamine target modifiers
- **Food comfort** — serotonin nudge on eating interactions
- **Rain sound** — serotonin nudge when viewing rain; sleep quality boost during drizzle
- **Quiet** — comfort (serotonin) or irritation (NE) when sitting at kitchen table
- **Being outside** — serotonin nudge on go_for_walk
- **Physical warmth** — extra stress relief on shower
- **Routine** — stored but dormant (no activation hook yet)

All effects scale linearly with intensity. Small background forces (max ±3.4 serotonin target shift from weather, vs ±20 from sleep quality). Sentiment-aware prose variants in eat_food, buy_cheap_meal, shower, sit_at_table, go_for_walk, look_out_window, sleep. Legacy saves without sentiments get empty array (zero effect).

### Sleep Emotional Processing (Layer 2 of DESIGN-EMOTIONS.md)
During sleep, each sentiment's intensity drifts back toward its character baseline (the chargen-generated value). Processing rate = 0.4 * sleepQuality * clamp(sleepMinutes/420, 0.3, 1.0). Good sleep (quality 1.0, 7+ hours) processes ~40% of deviation per night; poor sleep (quality 0.5, 3 hours) processes ~14%. Accumulated sentiments with no character match attenuate toward intensity 0. Called in the sleep interaction after stress reduction, before wakeUp(). No PRNG consumed.

### Accumulating Sentiments (Layer 2 of DESIGN-EMOTIONS.md)
Sentiments that build from repeated experience. The first dynamic sentiments — feelings that emerge from daily friction and connection, not character generation.

**Work sentiments:**
- `{target: 'work', quality: 'dread'}` — builds from can't-focus days (+0.02), work breaks when stressed (+0.005). Reduced by focused work (-0.01).
- `{target: 'work', quality: 'satisfaction'}` — builds from focused work (+0.015). Reduced by can't-focus days (-0.005).
- Independent — ambivalence is real. At workplace, dread lowers serotonin (-6) and dopamine (-5) targets; satisfaction raises them (+3, +4).

**Coworker sentiments (per-coworker):**
- `{target: 'coworker1'/'coworker2', quality: 'warmth'}` — builds from good-mood interactions (+0.02) and neutral coworker_speaks events (+0.008). High warmth gives extra social bonus (+2).
- `{target: 'coworker1'/'coworker2', quality: 'irritation'}` — builds from bad-mood interactions (+0.015) and bad-mood coworker_speaks events (+0.01). High irritation turns social stress relief into stress cost (+2 instead of -3).

**Contradictory experience:** Experiences that contradict an existing sentiment gently challenge it. Good coworker interactions cross-reduce irritation (-0.008 talk, -0.003 speaks); bad interactions cross-reduce warmth (-0.005 talk, -0.003 speaks). Relaxed work breaks (stress ≤ 30, existing dread > 0) cross-reduce dread (-0.005). Cross-reductions are 30–40% of primary amounts — they slow sentiment growth without preventing it. Ambivalence emerges naturally from mixed days.

**Feedback loops:** Chronic struggle at work → dread builds → worse NT state at work → harder to focus → more dread. Good sleep partially resets each night (~40% of deviation). If accumulation exceeds processing, sentiments grow over time. Contradictory experience provides a daytime counterforce — good days at work challenge dread from multiple directions (focused work + relaxed breaks).

**Prose:** Sentiment-weighted variants in doWorkProse (dread/satisfaction, 2 per job), coworkerChatter (irritation/warmth, 1-2 per flavor), coworkerInteraction (warmth/irritation, 1-2 per flavor). All follow `weightedPick` pattern.

**`State.adjustSentiment(target, quality, amount)`** — mutation function for accumulating sentiments. Finds-or-creates entry, clamps [0, 1]. No PRNG consumed.

### Sentiment Evolution (Layer 2 of DESIGN-EMOTIONS.md)
Three mechanics deepening how sentiments change over time:

**Regulation capacity** — `State.regulationCapacity()`. Inverse of emotional inertia, applied during sleep processing. Fluid characters (low neuroticism, high self-esteem, low rumination) process emotions faster; sticky characters process slower. Range 0.5–1.3. At 50/50/50 → 1.0 (legacy-safe). State penalties for adenosine > 60 and stress > 60.

**Entrenchment + intensity resistance** — rewritten `processSleepEmotions()` applies three multiplicative modifiers: intensity resistance (high-deviation sentiments resist processing, floor 0.3), quality factor (comfort 1.0, satisfaction 0.9, warmth 0.85, dread/irritation 0.6), and regulation capacity. Negative sentiments process 40% slower than comfort. Very strong feelings persist across multiple nights.

**Habituation** — comfort sentiments (eating, rain_sound, outside, warmth, quiet) lose small amounts of intensity each time they activate (-0.002 to -0.003). Sleep restores toward character baseline. Light use stays stable; heavy use fades slightly. Quiet irritation also habituates (-0.001). Weather/time-of-day prefs and work/coworker sentiments are NOT habituated.

### Friend Absence Effects (Layer 2 of DESIGN-EMOTIONS.md)
Friends who reach out and get silence back generate guilt over time. Per-friend contact timestamps track last message engagement.

**Mechanics:**
- `last_friend1_contact` / `last_friend2_contact` — game time of last engagement (reading a friend's message)
- Grace period: 1.5 days. After that, guilt accumulates each sleep cycle
- Growth rate: ~0.005–0.008 per night, scaling with absence duration (cap 1.6x at 14+ days)
- Unread messages from the ignored friend intensify guilt by 40%
- Seeing unread friend messages on phone screen nudges guilt by `guilt * 0.02` (proportional, only when guilt > 0.03)
- Reading a friend's message: resets contact timer, reduces guilt by 0.02

**Effects:**
- Friend guilt lowers serotonin target when at home (max ~6 points at extreme guilt toward both friends)
- Guilt-aware idle thoughts fire based on guilt intensity, independent of social tier (4 thoughts per friend flavor, 16 total)
- Sleep processing factor 0.7 — between comfort (1.0) and dread/irritation (0.6)
- Legacy saves: first sleep initializes contact times to current time, no guilt burst

**Friend messages tagged with source** — `phone_inbox` entries from friends carry `source: 'friend1'|'friend2'` for contact tracking.

### Derived Systems
- **Mood tone** — primarily from neurochemistry (serotonin, dopamine, NE, GABA) with physical state overrides → numb / fraying / heavy / hollow / quiet / clear / present / flat. Same 8 tones, now with inertia instead of instant derivation.
- **Prose-neurochemistry shading** — three-layer pattern: moodTone() as coarse selector, weighted variant selection via `State.lerp01()` + `Timeline.weightedPick()`, deterministic modifiers (adenosine fog, NE+low-GABA restlessness). **All 67 `Timeline.pick` call sites converted.** Covered: idle thoughts, bedroom description, lie_there, sleep prose (23 branches), look_out_window (7 branches), sit_at_table (6 branches), go_for_walk (12 branches), work events (4 branches), ambient events (5 branches), friend messages (4 flavors), coworker chatter (3 flavors), coworker interactions (3 flavors). No `Timeline.pick` calls remain. See DESIGN.md "Prose-neurochemistry interface" for the full pattern.
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
Two-phase system: falling-asleep (how sleep came) + waking-up (the gradient back to consciousness). Falling-asleep branches on pre-sleep energy, stress, quality, and duration, with NT shading: adenosine→crash depth, GABA→can't-settle anxiety, NE→hyper-alertness, serotonin→warmth of surrender (~22 variants). Waking-up branches on post-sleep energy, sleep quality, alarm vs natural wake, time of day (dark/late/morning), and mood, with NT shading: adenosine→sleep inertia, serotonin→dread-vs-ease, NE→sharp edges, GABA→night dread (~38 variants). Composed together as a single passage. No numeric hour counts — all qualitative.

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
- Sentiments: 8 categories of likes/dislikes (weather, time, food, rain, quiet, outside, warmth, routine), generated silently from charRng

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
