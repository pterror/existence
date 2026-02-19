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

**Sleep model:**
- **Sleep debt** — cumulative deficit (cap 4800 min). Ideal 480 min/day. Full deficit accumulation, 33% excess repayment. Tiers: none/mild/moderate/severe. Feeds serotonin/dopamine targets (-8/-10 max), emotional inertia (+0.15 max), energy recovery penalty (1/(1+debt/1200)).
- **Sleep architecture** — `sleepCycleBreakdown(minutes)`: 90-min cycles, deep/REM ratio shifts across cycles. Adenosine clearing scales with deep sleep fraction. NE clearing scales with REM fraction × quality. Emotional processing quality = qualityMult × (0.4 + 0.6 × remFrac). Sleep inertia from cycle phase at wake (0–0.6).
- **Melatonin behavior** — daylight exposure tracking (outside 1.0, inside 0.15, reset on wake), phone screen suppression (-15 at night), indoor evening suppression (-3), daylight bonus (+10 at night if ≥120 min exposure). Melatonin affects fall-asleep delay (>60 → 0.7x, <20 → 1.4x).
- **Sleep quality** — seven multiplicative factors: stress, hunger, rain comfort, melatonin at onset (>60 → 1.05x, <25 → 0.85x), circadian alignment (daytime → 0.75x), crash sleep (adenosine >80 → 0.9x), caffeine interference (>30 → 0.65–1.0).
- **Neurochemistry** — stores quality, clears adenosine (scaled by deep sleep), nudges serotonin (good +3, poor -2), clears NE (scaled by REM × quality).

### Geography / Environment
Derived from character `latitude` (-90 to 90). Methods on State:
- `hemisphere()` — 'north' | 'south'
- `climateZone()` — 'tropical' | 'temperate' | 'polar'
- `season()` — 'spring' | 'summer' | 'autumn' | 'winter' (temperate), 'wet' | 'dry' (tropical)
- `dayLengthHours()` — hours of daylight, astronomical formula from lat + day of year
- `sunriseHour()`, `sunsetHour()` — fractional hours since midnight
- `isDaytime()`, `isSunrise()`, `isSunset()` — bool queries (sunrise/sunset within 30 min)
- Daylight exposure tracking uses actual astronomical sunrise/sunset window

Temperature:
- `temperature` state var (celsius). Updated continuously in `advanceTime` and on weather shift.
- `seasonalTemperatureBaseline()` — from latitude + season. lat 0 → 30°C, lat 42 → ~9°C mean, with seasonal ±amplitude.
- `diurnalTemperatureOffset()` — ±3°C tropical, ±5°C temperate. Coldest ~6am, warmest ~3pm. Cosine formula from hour.
- Combined: `temperature = seasonalBaseline + weatherOffset + diurnalOffset`. Recalculated every `advanceTime` call.
- `temperatureTier()` — 'bitter' | 'freezing' | 'cold' | 'cool' | 'mild' | 'warm' | 'hot'
- Used in street, bus_stop descriptions; move:street approaching prose.

Snow:
- Added to weather pool when `season() === 'winter'` and `seasonalTemperatureBaseline() <= 2°C`. Weight 2 (same as drizzle).
- `State.set('rain', ...)` remains false for snow.
- Snow prose in: street description (quiet, muffled), bus_stop (bench clearing), weather_shift event (inside: window light change; outside: street softens), move:street approaching prose.

### Health Conditions
Pattern established for character health conditions. First condition: migraines.

**Architecture:**
- `health_conditions: string[]` in state, set by `Character.applyToState()` from `character.conditions`
- `hasCondition(id)` query — all condition-gated behavior uses this
- `energyCeiling()` — returns max achievable energy (100 normally; 30–70 during migraine)
- `migraineTier()` — 'none' | 'building' | 'active' | 'severe'

**Migraines (first condition):**
- ~15% prevalence at chargen (+5% for high-neuroticism or precarious career)
- Trigger: probabilistic in `advanceTime`, risk score from adenosine + stress + sleep debt
- Intensity: 30–70 at onset, decays ~8 pts/hr after 2h active phase
- Effects: raises NE + lowers dopamine while active; bedroom description overridden for active/severe
- `take_pain_reliever` interaction at apartment_bathroom: -35 intensity, available when migraineTier ≠ 'none'
- `go_for_walk` blocked at 'severe' tier
- Postdrome/aura ○

### Finance accessors
- Billing cycle offsets now stored in state (set by `applyToState()`) — content no longer calls `Character.get('..._day_offset')`
- `nextPaycheckDays()` — days until next paycheck (0 = today)
- `nextBillDue()` → `{ name, amount, daysUntil }` — soonest upcoming bill across rent/utilities/phone
- TODO.md: noted paycheck structure + bill amounts as approximation debts that should derive from job type, season, usage, plan

### Substances (caffeine)
- **caffeine_level** (0–100 state var) — one cup ≈ 50 units. Half-life 5h, metabolized in `advanceTime`.
- `caffeineTier()` — 'none' | 'low' | 'active' | 'high'
- `consumeCaffeine(amount)` — updates caffeine_level, small acute NE bump
- `adenosineBlock()` — 0–1 receptor block factor. High caffeine = adenosine still accumulates but isn't felt. Crash hits when caffeine clears.
- `caffeineSleepInterference()` — quality multiplier (0.65–1.0) for sleep execute
- `make_coffee` interaction at kitchen — available unless caffeineTier is 'high'. Prose shades on mood + adenosine + caffeine.

### Emotional Inertia (Layer 2 of DESIGN-EMOTIONS.md)
Per-character trait controlling how sticky moods are. Only affects the four mood-primary systems (serotonin, dopamine, NE, GABA) — physiological rhythms are unaffected by personality.

**Personality parameters** (generated at character creation, stored in state):
- **neuroticism** (0–100) — strongest predictor of inertia. Adds extra stickiness in "toward worse mood" direction only.
- **self_esteem** (0–100) — low self-esteem increases inertia in all directions.
- **rumination** (0–100) — high rumination increases inertia in all directions.

**Inertia formula:** `rate = baseRate / effectiveInertia(system, isNegative)`. Base inertia range 0.6 (fluid) to 1.4 (sticky), plus up to +0.2 from neuroticism negative bonus, plus state modifiers (adenosine > 60, poor sleep quality, stress > 60). At personality 50/50/50 → inertia 1.0.

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

All effects scale linearly with intensity. Small background forces (max ±3.4 serotonin target shift from weather, vs ±20 from sleep quality). Sentiment-aware prose variants in eat_food, buy_cheap_meal, shower, sit_at_table, go_for_walk, look_out_window, sleep.

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

**Regulation capacity** — `State.regulationCapacity()`. Inverse of emotional inertia, applied during sleep processing. Fluid characters (low neuroticism, high self-esteem, low rumination) process emotions faster; sticky characters process slower. Range 0.5–1.3. At 50/50/50 → 1.0. State penalties for adenosine > 60 and stress > 60.

**Entrenchment + intensity resistance** — rewritten `processSleepEmotions()` applies three multiplicative modifiers: intensity resistance (high-deviation sentiments resist processing, floor 0.3), quality factor (comfort 1.0, satisfaction 0.9, warmth 0.85, dread/irritation 0.6), and regulation capacity. Negative sentiments process 40% slower than comfort. Very strong feelings persist across multiple nights.

**Habituation** — comfort sentiments (eating, rain_sound, outside, warmth, quiet) lose small amounts of intensity each time they activate (-0.002 to -0.003). Sleep restores toward character baseline. Light use stays stable; heavy use fades slightly. Quiet irritation also habituates (-0.001). Weather/time-of-day prefs and work/coworker sentiments are NOT habituated.

### Friend Absence Effects (Layer 2 of DESIGN-EMOTIONS.md)
Friends who reach out and get silence back generate guilt over time. Per-friend contact timestamps track last message engagement.

**Mechanics:**
- `friend_contact` — map of slot → game time of last engagement (reading a friend's message)
- Grace period: 1.5 days. After that, guilt accumulates each sleep cycle
- Growth rate: ~0.005–0.008 per night, scaling with absence duration (cap 1.6x at 14+ days)
- Unread messages from the ignored friend intensify guilt by 40%
- Seeing unread friend messages on phone screen nudges guilt by `guilt * 0.02` (proportional, only when guilt > 0.03)
- Reading a friend's message: resets contact timer, reduces guilt by 0.02
- **Replying to a friend** (`reply_to_friend` phone interaction): resets contact timer, reduces guilt by 0.06 (3× reading), +3 social. Generates friend's response immediately (RNG, stored in `pending_replies`), delivered after 30–90 min. Prose per flavor + NT-shaded (dopamine/serotonin). 3 RNG calls total.
- **Writing first** (`message_friend` phone interaction): available when a friend has no unread messages and no pending reply queued. Picks the friend with highest guilt (tie-breaks by least recent contact). Resets contact timer, reduces guilt by 0.06, +2 social. Response generated now, delivered after 30–90 min. Prose per flavor + NT-shaded (dopamine/serotonin). 3 RNG calls total. Separate initiation prose tables (`friendInitiateProse`, `friendInitiateMessages`) from reply prose — reaching out first reads differently from responding.

**Effects:**
- Friend guilt lowers serotonin target when at home (max ~6 points at extreme guilt toward both friends)
- Guilt-aware idle thoughts fire based on guilt intensity, independent of social tier (4 thoughts per friend flavor, 16 total)
- Sleep processing factor 0.7 — between comfort (1.0) and dread/irritation (0.6)

**Friend messages tagged with source** — `phone_inbox` entries from friends carry `source: 'friend1'|'friend2'` for contact tracking.

### Life History / Backstory Generation
Characters have compressed life histories generated at chargen. Two-phase: broad strokes (charRng, ~4 calls) then fine-grained simulation (post-finalization, deterministic).

**Generated parameters:**
- `economic_origin` — precarious / modest / comfortable / secure (where you started)
- `career_stability` — 0.0–1.0 (how steady adult life has been)
- `life_events` — 0–2 events with multi-dimensional impacts (medical_crisis, job_loss, family_help, small_inheritance, accident, legal_trouble, relationship_end)

**Financial outputs (from fine-grained simulation):**
- `starting_money` — integral of years working × accumulation rate + event impacts. Range: $0 (22yo precarious) to $40,000+ (48yo secure).
- `pay_rate` — biweekly take-home by job type (food_service $480, retail $520, office $600)
- `rent_amount` — monthly, from origin bracket × stability ($400–950)

**Non-financial outputs:**
- Financial anxiety sentiment (intensity from origin + stability + negative events)
- Personality adjustments (neuroticism, self_esteem nudges from life events)
- Work sentiment from career stability (dread if unstable, satisfaction if stable)
- Job standing from career stability (55–75 range)
- Life event sentiments (health anxiety, authority dread, family guilt)

**Bill day offsets:** paycheck_day_offset, rent_day_offset, utility_day_offset, phone_bill_day_offset — all generated at chargen, stored on character. Each character has their own financial rhythm.

### Financial Cycle
Closed-loop financial system: income, obligations, and the collision between them.

**Income:** Biweekly paycheck = `pay_rate * min(days_worked, 10) / 10`. Missing work reduces pay. Arrives as phone deposit notification. Small anxiety relief when paycheck arrives while broke.

**Bills (4, monthly on character-specific offsets):**
- Rent — from backstory
- Utilities — $65 (approximation)
- Phone — $45 (approximation)
- Auto-deducted. Success → notification with perceived balance. Failure → money → $0, "declined" notification, +8 stress, +0.03 financial anxiety.

**Work attendance tracking:** `days_worked_this_period` increments on workplace arrival (guarded by !at_work_today), resets on payday. Calling in sick reduces next paycheck.

**Money tiers (updated for larger balances):** broke ≤ $0 / scraping < $50 / tight < $200 / careful < $600 / okay < $1500 / comfortable < $5000 / cushioned ≥ $5000.

### Financial Anxiety (NT Integration)
Financial anxiety sentiment connects to neurochemistry:
- At home: `money_anxiety * 4` reduces serotonin target
- At work: `money_anxiety * 2` reduces dopamine target
- Money < $200: serotonin penalty scaling with deficit
- Money < $50: cortisol spike (+3)
- Accumulates from failed bills (+0.03), relief from paycheck when broke (-0.01)
- Sleep processing factor 0.6 (entrenches like dread)
- 5 money-anxiety idle thoughts, weighted by anxiety intensity

### Derived Systems
- **Mood tone** — primarily from neurochemistry (serotonin, dopamine, NE, GABA) with physical state overrides → numb / fraying / heavy / hollow / quiet / clear / present / flat. Same 8 tones, now with inertia instead of instant derivation.
- **Prose-neurochemistry shading** — three-layer pattern: moodTone() as coarse selector, weighted variant selection via `State.lerp01()` + `Timeline.weightedPick()`, deterministic modifiers (adenosine fog, NE+low-GABA restlessness). **All 67 `Timeline.pick` call sites converted.** Covered: idle thoughts, bedroom description, lie_there, sleep prose (23 branches), look_out_window (7 branches), sit_at_table (6 branches), go_for_walk (12 branches), work events (4 branches), ambient events (5 branches), friend messages (4 flavors), coworker chatter (3 flavors), coworker interactions (3 flavors). No `Timeline.pick` calls remain. See DESIGN.md "Prose-neurochemistry interface" for the full pattern.
- **Time period** — deep_night / early_morning / morning / late_morning / midday / afternoon / evening / night
- **Observation fidelity** — time and money awareness degrade with distance from last check (exact → rounded → vague → sensory/qualitative)
- **Season** — derived from latitude + start_timestamp. Tropical: wet/dry. Temperate: four seasons. Hemisphere from sign.
- **Weather** — overcast / clear / grey / drizzle / snow (winter+cold only). 3% shift chance per action. Affects prose, not mechanics.

### Daily Flags (reset on wake)
dressed, showered, ate_today, at_work_today, called_in, alarm_set, alarm_went_off, just_woke_alarm, snooze_count, daylight_exposure, work_nagged_today

### Phone State
Battery (dual-rate drain: 1%/hr standby, 15%/hr screen-on; tiers: dead/critical/low/fine), silent mode, inbox (messages accumulate whether or not you look). Charges at 30%/hr during sleep at home and via charge_phone interaction. Starting battery 80–100% (chargen RNG). Message sources: friends (flavor-driven frequency), work nag (30min late), paycheck deposits (biweekly), bill auto-pay notifications (rent/utilities/phone, monthly).

**Phone UI:** Full HTML5 phone overlay. Three screens: home (large time + date + Messages app badge), messages list (contacts ordered: friends by recency, then supervisor, then bank; unread dots, preview text), thread view (sent/received bubbles, compose row with Reply/Write when applicable). Navigation (home→list→thread→back) is transient state stored in `phone_screen` + `phone_thread_contact`. Opening a friend thread marks messages as read and applies guilt side-effects. Reply and Write actions go through the normal game pipeline (RNG consumed, action recorded, friend response queued). Old `read_messages` interaction kept for replay compat. All phone messages now carry `source` and `direction` fields (auto-stamped in `addPhoneMessage`).

### Apartment State

**Object systems (coarse_v1):** Mess is now emergent from tracked object states, not a single scalar. Three modules:

- **Dishes** (`js/dishes.js`) — tracks clean/in_sink counts. `eat_food` calls `Dishes.use()` (one dish goes to sink). `do_dishes` calls `Dishes.wash()` (sink cleared). Kitchen description uses `Dishes.sinkDescription()`: specific prose per count ("A dish in the sink." / "A couple of dishes." / "The sink is full."). `do_dishes` available when `Dishes.dirtyCount() > 0`.

- **Linens** (`js/linens.js`) — tracks bed state (`made`/`unmade`/`messy`) and towel state (`clean_hanging`/`damp_hanging`/`on_floor`). `shower` calls `Linens.useTowel()`. `sleep` calls `Linens.noteSlept()` — bed transitions, damp towel → on_floor. Bathroom description driven by towel state. Bedroom adds sentence when bed is made or messy.

- **Clothing** (`js/clothing.js`) — tracks floor items per location, basket, and worn count. `get_dressed` calls `Clothing.wear()`. `sleep` calls `Clothing.undress(energyTier, moodTone, location)` — worn items go to floor (depleted/numb) or basket (okay/clear). Bedroom description uses `Clothing.floorDescription('bedroom')` for floor clothes.

**Mess is now fully emergent.** `apartment_mess` scalar removed. `messTier()` moved from State into content.js, computed from Dishes + Linens + Clothing: dishes in sink (9pts each, max 5), bed state (messy=15, unmade=5, made=0), towel on floor (8pts), clothing floor items (8pts/bedroom, 5pts/bathroom). Four tiers: tidy (<20), cluttered (<45), messy (<70), chaotic (≥70).

**fridge_food** (integer) — depletes on eating, restocked by groceries. Still a scalar (appropriate — no item identity needed for food units).

**apartment_notice** — event fires randomly in apartment (6% per action, max 2/day). NT-shaded: low serotonin reads mess as evidence; high adenosine makes it blur; low dopamine surfaces the knowing-doing gap.

### Location Description NT Shading
Deterministic NT modifiers added to apartment locations and corner store (no RNG — location descriptions called from UI.render):
- **Kitchen** — adenosine > 65: "The light in here is doing more than its share." NE > 65 in morning: "Everything in here feels very present this early."
- **Bathroom** — adenosine > 70: "The light in here is harsh." NE > 65: "The faucet drip sounds too loud."
- **Corner store** — NE > 65: fluorescent hum + sensory overload. Adenosine > 65: aisles smear.

### World Predicates
`World.isHome()` and `World.isWorkplace()` added to world.js (alongside existing `isInside()`). Available for any code that needs semantic location queries without inspecting area strings directly.

## Locations (7)

```
apartment_bedroom ─── apartment_kitchen ─── street ─── bus_stop ─── workplace
       │                     │                │
apartment_bathroom ──────────┘          corner_store
```

Travel times: 1min within apartment, 2min apartment↔street, 3min street↔bus_stop, 4min street↔corner_store, 20min bus_stop↔workplace.

## Interactions (38)

### Bedroom (13)
sleep, get_dressed, set_alarm, skip_alarm, snooze_alarm, dismiss_alarm, charge_phone, check_phone_bedroom, lie_there, look_out_window, make_bed, tidy_clothes, (alarm event wakes you)

### Kitchen (5)
eat_food, drink_water, do_dishes, check_phone_kitchen, sit_at_table

### Bathroom (3)
shower, use_sink, rehang_towel; take_pain_reliever (migraines condition only)

### Street (3)
check_phone_street, sit_on_step, go_for_walk

### Bus Stop (1)
wait_for_bus

### Workplace (4)
do_work, work_break, talk_to_coworker, check_phone_work

### Corner Store (3)
buy_groceries, buy_cheap_meal, browse_store

### Phone Mode (5, triggered from phone UI)
read_messages (backward-compat replay only), reply_to_friend, message_friend, toggle_phone_silent (home screen mute + status bar silent indicator), put_phone_away

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
Two-phase system: falling-asleep (how sleep came) + waking-up (the gradient back to consciousness). Falling-asleep branches on pre-sleep energy, stress, quality, and duration, with NT shading: adenosine→crash depth, GABA→can't-settle anxiety, NE→hyper-alertness, serotonin→warmth of surrender, melatonin→onset delay (~22 variants). Waking-up branches on post-sleep energy, sleep quality, alarm vs natural wake, time of day (dark/late/morning), mood, sleep debt, and sleep inertia, with NT shading: adenosine→sleep inertia, serotonin→dread-vs-ease, NE→sharp edges, GABA→night dread, debt→cumulative exhaustion (~44 variants). Composed together as a single passage. No numeric hour counts — all qualitative.

### Alarm Negotiation Prose
Snooze and dismiss interactions with escalating prose. Snooze has three tiers: first press (fog, 4 variants), second press (negotiation, 3 variants), third+ (guilt, 4 variants). All NT-shaded (adenosine, serotonin). Dismiss varies by snooze count (0 = immediate, 1-2 = typical, 3+ = running late) and mood/energy. Slept-through-alarm awareness adds to waking prose when alarm fired but didn't wake you.

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
- Life history backstory: economic_origin, career_stability, 0–2 life_events (generated silently from charRng)
- Financial simulation: starting_money, pay_rate, rent_amount, financial_anxiety, personality adjustments, work sentiments, job standing (computed post-finalization)
- Bill day offsets: paycheck, rent, utility, phone bill (generated silently from charRng)

## Infrastructure

### Save System
IndexedDB. RunRecord: `{ id, seed, character, actions, status, createdAt, lastPlayed, version }`. Debounced writes (500ms), flush on beforeunload.

### Multi-Run
Threshold screen lists all runs. Click to resume. "Another life" starts fresh. Step-away link pauses current run and returns to threshold.

### Deterministic Replay
Dual PRNG streams (charRng for chargen, rng for gameplay) derived from master seed via splitmix32. Changing chargen never breaks gameplay replay. Actions logged as `{ type, id/destination, timestamp }`.

### In-Game Look-Back
Replay scrubber with significance heatmap. Scene segmentation (by movement). Snapshot system for fast seeking. Autoplay with variable speed. Keyboard navigation (arrows, ctrl+arrows, space).

### Habit System (Phase 1 + Auto-Advance)
CART decision tree engine learns action patterns from observed play. No RNG consumed — pure state reads + ML. Ephemeral — trained from the action log each session, no save format changes.

**Feature extraction:** ~34 features from current game state — energy/stress/hunger/social (continuous), key NT levels (serotonin, dopamine, NE, GABA, adenosine, cortisol), qualitative tiers and mood tone (categorical), daily flags (dressed, showered, ate, etc.), location, weather, sentiments (work dread, routine comfort), money, phone state, time since wake, last action.

**Training:** One-vs-rest binary trees per action. Recency-weighted (exponential decay, half-life ~7 in-game days). Trained after replay on session load, retrained every 10 actions during live play. Minimum 20 total examples + 3 positive per action to build a tree. Max depth 5.

**Prediction tiers:** For each available action (interactions + movement), run its tree on current features. Two thresholds, both modulated by routine sentiment:
- `>= 0.6` (suggested) — subtly brighter text, the player notices one option feels "closer"
- `>= 0.75` (auto) — character acts on their own after a delay

Competing habits (top two within 0.1) → no prediction. Movement predictions now surface in UI alongside interaction predictions.

**Auto-advance:** When prediction reaches auto tier, the system shows approaching prose (deterministic, no RNG — mood-toned text like "Clothes." or "You're reaching for your clothes before you've thought about it."), highlights the predicted action with `action--auto` / `movement-link--auto` CSS class, and starts a 2500ms timer. After the delay, the action fires automatically. The player can click any action at any point to interrupt. Auto-advance chains naturally: each auto-fired action re-renders, re-predicts, and chains if the next prediction is also auto-tier. Morning routines flow: get_dressed → shower → eat_food → move:street without the player clicking.

**Approaching prose:** 32 interaction + 7 movement connection prose functions in `Content.approachingProse`. All deterministic (moodTone + NT conditionals, no RNG consumed). Terse at neutral mood ("Shower."), body-aware when stressed ("Water. You need the water."), colored when low ("The bathroom. Automatic.").

**Continuous brightness:** Predicted action's text color interpolates smoothly with strength — barely above base at 0.6, approaching body text color at 1.0. No discrete CSS classes or threshold snaps. Actions lerp from #8a8078 to #c8c0b8; movement from #605850 to #a09890.

**Character influence:** Routine comfort sentiment lowers both thresholds (habits form easier). Routine irritation raises them (habits resist forming).

**Anti-snowball:** Training examples carry source tags — `'player'` (weight 1.0) when the action didn't match a visible prediction, `'suggested'` (weight 0.5) when it matched a suggestion, `'auto'` (weight 0.1) when auto-advance fired. Prevents the system from training on its own predictions and manufacturing the predictability it's trying to detect. Base prediction threshold is 0.6 (not 0.5) — borderline predictions stay quiet.

**Phone mode:** Auto-advance is suppressed while viewing phone — phone interactions are a focused mode.

**Deferred:** Prose modulation (habit strength → prose density), decision path → prose motivation, routine sentiment activation from habit consistency.

### UI
Fade transitions on all text changes. Awareness bar (time + money, clickable to focus). Idle timer (30s → 60s → 2min → 5min → 20min plateau; stops if no user input for 5 min). Phone buzz on new messages. Tab-visibility-aware.
