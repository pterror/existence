# Emotional Architecture

How emotions work in the simulation. This document describes the mechanics underneath the mood system described in DESIGN.md. None of this is visible to the player. The player sees prose.

## The Problem with Derived Mood

The current implementation computes mood from state variables every time it's asked: low energy + high stress = numb, good energy + low stress = clear. Mood snaps instantly to match conditions. Eat a sandwich and your mood changes. This is wrong in every way that matters.

Real mood has inertia. Real mood is shaped by history, not just current conditions. Real emotions point at things — you don't just "feel resentful," you resent *someone* or *something*. And real emotional processing varies between people in ways that aren't reducible to demographics.

The emotional system has three layers.

## Layer 1: Neurochemical Baseline

The ambient floor. What mood is doing when nothing in particular is happening. This is the "some days are just harder and you can't name why" layer.

### What it is

Tonic neurotransmitter levels — serotonin, dopamine, norepinephrine — creating a background emotional climate. Not a single number. More like the weather system underneath the weather: the pressure system that determines whether today is grey or clear, independent of any specific event.

### What feeds it

- **Sleep quality** — the strongest lever. REM sleep strips emotional charge from memories in a norepinephrine-free neurochemical environment. The amygdala is literally depotentiated overnight. Good sleep genuinely resets emotional reactivity. Poor sleep preserves yesterday's emotions — the charge doesn't process, the reactivity stays amplified. Sleep-deprived people show ~60% greater amygdala reactivity to negative stimuli. This is the best-supported finding in mood science.

- **Hormonal state** — hormones don't raise or lower "mood level" directly. They change how emotional regulation works.
  - High progesterone: intrusive memories surface more readily, reappraisal strategies work less well, negative material sticks harder. Not "being moody" — a shift in processing style.
  - Low estradiol: negative information encoded more strongly. High estradiol: better top-down regulation, rumination less costly.
  - Testosterone: higher emotional reactivity AND reduced prefrontal regulation. Things hit harder, brakes work less.
  - Individual sensitivity varies enormously. Some people are highly hormone-sensitive; others barely notice cycle effects.

- **Cortisol rhythm** — cortisol peaks in the morning. Chronic stress flattens the rhythm. The body's chemical stress response isn't the same as the feeling of stress — you can feel calm and be chemically stressed, feel anxious with normal cortisol. The simulation models the chemical layer as an influence on mood, not as the mood itself.

- **Air pressure and light** — barometric pressure affects mood in roughly half of people. The mechanism involves serotonin turnover. The effect is subtle — a nudge, not an override. Sunlight exposure matters on longer timescales (seasonal, circadian). Both are per-character sensitivities, not universal.

- **Substances** — chemical mood alteration that bypasses the normal processing path. Described fully in DESIGN.md (Substances section). The key point: substances push on the baseline directly, and the cost is that the baseline shifts to accommodate them. The mood you had before the substance isn't there anymore.

- **Chronic stress, chronic conditions** — sustained pressure erodes the baseline over weeks. This operates on the slowest timescale — the trajectory that SSRIs take weeks to shift because the change requires downstream neuroplastic adaptation, not just a neurotransmitter adjustment.

### Timescales

The baseline operates on multiple nested timescales simultaneously:

- **Hours** — the current day's mood. Influenced by sleep quality, what happened this morning, tonic neurotransmitter levels. This is the layer that makes today feel different from yesterday even when the circumstances are the same.

- **Days to weeks** — the trajectory. Whether things are generally getting better or worse. Chronic stress pushes it down slowly. Consistent sleep, connection, and stability push it up slowly. A single good day doesn't fix a bad week. A single bad event doesn't ruin a stable period (though it registers).

- **Weeks to months** — the deep baseline. Where the body has settled. This is what shifts in clinical depression, what medication targets, what takes a long time to move in either direction.

A good analogy: ocean currents (deep baseline) underneath weather systems (trajectory) underneath today's weather (current mood). They interact but operate on different timescales, and the surface weather doesn't tell you much about the deep current.

### Individual variation

Not everyone's baseline moves the same way. Emotional inertia — how sticky moods are — is a per-character trait, not a demographic constant.

What predicts emotional inertia:

- **Neuroticism** — the strongest predictor. Higher neuroticism means negative moods persist longer. Linked to weaker prefrontal-amygdala connectivity — less effective top-down regulation.
- **Self-esteem** — low self-esteem increases emotional inertia across all emotion types, not just negative ones.
- **Depression** — depressed individuals show higher emotional inertia during daily life. This is both symptom and mechanism — the stickiness is part of what makes depression depression.
- **Rumination tendency** — brooding and reflection both predict increased stress inertia. Individual variation within each sex is vastly larger than between-sex differences (effect sizes d=0.17-0.28 for sex differences in rumination — the distributions overlap almost completely).
- **Current state** — effective inertia changes with conditions. Sleep deprivation increases inertia. Acute threat temporarily decreases it (the system mobilizes even when normally sluggish).

The honest model: emotional inertia is a continuous per-character trait shaped by personality, self-concept, and current state. Not a demographic binary. The simulation generates this trait per character from their personality parameters, then modifies it based on current sleep quality, hormonal state, chronic stress level, and whether they're in crisis.

## Layer 2: Directed Sentiments

Emotions point at things. You don't just "feel resentful" — you resent your coworker, or your job, or yourself. You don't just "feel comfort" — you find comfort in a specific food, in rain, in a particular friend's voice. The emotional landscape is relational, not ambient.

### What a sentiment is

A sentiment is an emotional attachment between the character and a target:

- **Target** — what the feeling is directed at. A person (friend, coworker, parent, self). A concept (work, money, the future). An object (a food, rain, the phone). A trait (your body, your ability to focus, your voice). A place (the kitchen, the bus stop, the apartment). A time (mornings, the hour your shift starts).

- **Quality** — the emotional character of the attachment. Not just positive/negative but specific: warmth, resentment, dread, comfort, shame, guilt, grief, anxiety, pride, disgust, tenderness, irritation, longing. Each quality interacts differently with mood and has different dynamics — resentment builds slowly and resists resolution; dread intensifies as the target approaches; comfort attenuates with overuse; grief doesn't attenuate at all, it just changes shape.

- **Intensity** — how strong the attachment is. Continuous, not binary. Ranges from background coloring (slight preference for one food over another) to dominant force (the grief that rewrites every moment).

### How sentiments activate

A sentiment is dormant until its target is present in the current context. When you encounter the target — enter the location, interact with the person, do the activity, see the object — the sentiment activates and pushes on your current emotional state.

The same kitchen reads differently depending on what sentiments are attached to it:
- (kitchen, dread, moderate) — because of the dishes, or because of what happened there, or because cooking means deciding and deciding is too much today
- (cooking, comfort, strong) — the act itself is soothing, the kitchen is a good place
- (kitchen, neutral) — it's just a room

Multiple sentiments can activate simultaneously. Eating ramen when ramen carries comfort AND when the kitchen carries dread: both are present, both push, the surface mood reflects the combination. The prose carries the tension — the comfort of the food and the wrongness of the place.

### Where sentiments come from

- **Character generation** — personality-driven preferences and aversions. A character who finds comfort in specific foods, who dreads mornings, who has warmth toward rain. These are the baseline emotional landscape the character starts with. Not random — derived from personality parameters, upbringing, cultural context.

- **Accumulation during play** — repeated experiences build sentiments. A coworker who's consistently annoying doesn't trigger a "resentment event" — resentment accumulates from dozens of small interactions until the sentiment exists. The player doesn't see the counter. They notice that the prose around this coworker has changed, that something is tighter, that the interaction costs more than it used to.

- **Events** — some experiences create or intensify sentiments directly. Being yelled at by a boss. A friend who came through when things were bad. The first time a bill overdrafts. These attach emotional weight to their targets immediately, not gradually.

- **Trauma** — described in DESIGN.md's Trauma section. Trauma is a specific kind of sentiment: high-intensity, resistant to attenuation, often attached to targets that are orthogonal to the apparent source. The coworker who's genuinely kind but whose voice carries weight because of someone else. The time of day that's loaded. Trauma sentiments don't attenuate through normal processing — they're the ones sleep can't fully strip.

### How sentiments evolve

Sentiments are not static. They change over time through several mechanisms:

- **Sleep processing** — REM sleep attenuates the emotional charge of recent experiences. A bad interaction today stings. After sleep, the memory remains but the charge is reduced. This is the mechanism behind "sleep on it." Sentiments with moderate intensity are partially processed each night. Very high-intensity sentiments (trauma, deep grief) are resistant to overnight processing — they require many cycles, or they don't fully process at all.

- **Repetition** — repeated activation without new input can either habituate (the annoyance fades because you're used to it) or entrench (the resentment deepens because it's confirmed daily). Which one depends on the quality of the sentiment and whether each activation adds new evidence or just repeats old evidence. Comfort habituates — the same food is slightly less comforting the hundredth time. Resentment entrenches — each small slight adds to the pile.

- **Contradictory experience** — a sentiment can be challenged by experiences that contradict it. Dread of work that's reduced by a genuinely good day. Warmth toward a friend that's complicated by a betrayal. The new experience doesn't replace the old sentiment — it creates tension. Both can coexist. The friend you love and resent. The job you dread and take pride in. Ambivalence is real and the model should hold it.

- **Absence** — not interacting with a target for a long time doesn't erase the sentiment, but it does change its character. The friend you haven't talked to: warmth doesn't disappear, but guilt accumulates alongside it. The job you left: the dread fades but the resentment might not. Absence changes the proportions without clearing the slate.

- **Regulation** — the character's ability to process and modulate their own emotional responses. This isn't a conscious choice the player makes — it's a character property that affects how quickly sentiments change. High regulation capacity (good sleep, stable baseline, low chronic stress) means sentiments are more responsive to new evidence. Low regulation capacity (sleep-deprived, depressed, hormonally disrupted) means sentiments are stickier and less responsive.

### Likes and dislikes

The lightest form of sentiment. A food you enjoy. A weather you prefer. A time of day that suits you. These are low-intensity sentiments with comfort or irritation quality. They affect prose — eating a food you like reads differently than eating whatever's available — and they provide small mood nudges when activated. They're not dramatic. They're the texture of having preferences, of being a specific person rather than a generic one.

Likes and dislikes are generated at character creation from personality and cultural parameters. They can shift during play but mostly don't — they're stable parts of who the character is.

## Layer 3: Surface Mood

What the character is experiencing right now. This is what the prose system reads. This is what `moodTone()` returns.

Surface mood emerges from the interaction of:

1. **Neurochemical baseline** — the ambient floor. Where today sits on the slow timescale.
2. **Active sentiments** — which emotional attachments are currently triggered by context. The sum of their pushes.
3. **Physical state** — energy, hunger, stress, social connection. The body's current condition.
4. **Current context** — where you are, what's around you, what time it is, what the weather is doing.

### The eight tones

Surface mood collapses into eight qualitative tones for prose selection. These aren't a spectrum — they're a landscape. The same "low" mood reads differently depending on what's driving it:

- **numb** — past the point of feeling. Not sad, not stressed — absent. The emotional system has shut down because there's nothing left to run it on. Deep baseline erosion + depletion.
- **fraying** — the edge. Everything too loud, too close, too much. High tension, active stress sentiments, the system overloaded. Can break through at any baseline level — you can be generally okay and still fray under acute pressure.
- **heavy** — gravity is personal. The body is a weight. Low baseline + physical depletion. Not dramatic, just hard. Everything takes more than you have.
- **hollow** — the shape where connection used to be. Low baseline + active disconnection/absence sentiments. Isolated, but it's not about being alone — it's about the quality of the absence.
- **quiet** — withdrawn but not in pain. The distance is familiar. Low social engagement without acute distress. Can be protective or can be the numbness before numb.
- **flat** — getting through it. The most common state. The baseline is neutral, nothing strongly activated, nothing strongly absent. Not good, not bad. Just here.
- **present** — actually here. Baseline elevated enough that engagement is possible without effort. Things register. Food has taste. The world has texture.
- **clear** — rare. Baseline high, active comfort sentiments, physical state good. The moment when you notice you feel okay and that noticing is itself unusual. You got here the slow way.

### How tones are selected

The tone isn't determined by a single axis. It's selected by the dominant emotional force in the current moment:

- If the emotional system is overloaded (acute stress sentiments dominate, regardless of baseline) → **fraying**
- If the baseline is deeply eroded and depletion is present → **numb**
- If the baseline is low and the body is the primary constraint → **heavy**
- If the baseline is low and disconnection sentiments dominate → **hollow**
- If social engagement is absent but distress isn't acute → **quiet**
- If the baseline is moderately elevated and engagement is natural → **present**
- If the baseline is high and sustained, with comfort sentiments active → **clear**
- Otherwise → **flat**

Multiple forces can be present. The tone reflects the dominant one, but the prose can carry the undertone — "flat, but with tension underneath" or "present, but the grief is still there." The tone selects the primary prose variant; the secondary emotional forces shape individual word choices and what the character notices.

## How This Connects to Existing Systems

### Substances (DESIGN.md)

Substances push on Layer 1 (the baseline) directly, bypassing normal processing:
- Acute effect: override or modulate the baseline for the duration
- Comedown: the baseline drops below where it was
- Tolerance: the override narrows
- Withdrawal: an autonomous drag on the baseline
- Baseline shift: long-term use changes where "normal" is

Substances also generate sentiments: the comfort of the ritual, the dread of withdrawal, the craving that's an attachment to the substance itself.

### Endocrine system (DESIGN.md)

Hormonal state modifies Layer 1 mechanics: how fast the baseline moves, how effectively regulation works, whether intrusive sentiments are suppressed or amplified. The endocrine system doesn't create emotions — it changes the processing environment in which emotions happen.

### Trauma (DESIGN.md)

Trauma is a specific configuration of Layer 2 sentiments: high-intensity, resistant to sleep processing, attached to targets that may be non-obvious. Trauma sentiments activate when triggers are present and push strongly on surface mood. The resistance to processing means they don't attenuate normally — they persist across nights, across weeks, requiring many processing cycles or active therapeutic work (not yet modeled) to reduce.

### Identity and performance (DESIGN.md)

Masking, code-switching, the closet, body management — these are ongoing energy drains that feed into Layer 1 (chronic baseline erosion) and generate Layer 2 sentiments (the resentment of having to perform, the relief of spaces where you don't, the dread of contexts that demand the most performance).

### Health conditions (DESIGN.md)

Physical and mental health conditions modify all three layers:
- Layer 1: depression erodes the baseline directly, chronic pain creates sustained negative pressure, medication affects neurotransmitter dynamics
- Layer 2: conditions generate sentiments (dread of flare days, grief for lost capacity, resentment of limitations)
- Layer 3: conditions change how surface mood is selected (depression makes the lower tones stickier, anxiety makes fraying more accessible)

## What This Means for Implementation

This document describes the target architecture. Implementation should be incremental:

1. **Mood as stored value with inertia** — the simplest version of Layer 1. A single value that drifts toward a target derived from physical state, with asymmetric rates (falls faster than rises) and deterministic jitter for biological weather. This alone replaces the current instant-derivation and gives mood the inertia DESIGN.md calls for.

2. **Emotional inertia as character trait** — generated at character creation, modifiable by current state. Controls how fast mood moves. Some characters are emotionally sticky, others are more fluid.

3. **Basic sentiments** — likes and dislikes generated at character creation. Comfort foods, weather preferences, time-of-day preferences. Small mood nudges when activated. The lightest version of Layer 2.

4. **Sleep emotional processing** — overnight attenuation of recent emotional charge. Better sleep = more processing. This connects Layer 1 dynamics to the existing sleep system.

5. **Accumulating sentiments** — sentiments that build from repeated experience. Coworker relationships that develop emotional weight. The job that becomes dreadful through daily friction. Layer 2 becoming dynamic rather than static.

6. **Trauma sentiments** — high-intensity, processing-resistant. Connected to the trauma system described in DESIGN.md.

Each step builds on the previous. The first step can be implemented now. The later steps require systems that don't exist yet (richer character generation, event systems, relationship depth).

## Implementation Notes

### Layer 1: Neurochemical Baseline (implemented)

The neurochemical baseline is realized as 28 hidden state variables in `js/state.js`, each on a 0–100 scale. The core mechanic is **exponential drift toward target**:

```
target = targetFunction() + biologicalJitter()
rate = (level > target) ? downRate : upRate   // asymmetric
decay = exp(-rate * hours)
level = clamp(target + (level - target) * decay, 0, 100)
```

**Active feeders (9 systems):** serotonin (sleep quality, social, hunger), dopamine (energy, stress), norepinephrine (stress, sleep quality), GABA (chronic stress), cortisol (diurnal + stress), melatonin (diurnal), ghrelin (hunger), histamine (diurnal wakefulness), testosterone (diurnal). Each has biologically-derived rate constants (per-hour, from half-lives).

**Adenosine** uses linear accumulation during wakefulness, cleared by sleep.

**Biological jitter:** two incommensurate sine frequencies per system with unique phase seeds. Produces ±3.5 range noise. No PRNG consumed — deterministic from game time alone. This makes "some days harder" without coupling to action sequence.

**PRNG safety:** drift is called from `advanceTime()`, which runs during both live play and replay with the same time deltas. Target functions use deterministic Math.sin jitter, not PRNG. Adding new systems later won't shift the PRNG sequence.

**`moodTone()` rewrite:** primary inputs are now serotonin, dopamine, norepinephrine, GABA. Physical state (stress, energy) still acts as override for extreme conditions. Same 8 tone strings, all content.js callsites unchanged. Mood now has inertia — eating a sandwich doesn't instantly change your mood.

**Sleep effects:** sleep interaction stores `last_sleep_quality`, clears adenosine proportionally, and applies discrete serotonin/NE nudges based on quality.

**Placeholder systems (18):** initialized at baseline 50, drift toward 50 with jitter. Will gain feeders as their game systems are built (menstrual cycle, HRT, substances, etc.).

**Reference material:** `RESEARCH-HORMONES.md` (research summaries), `REFERENCE-HORMONES.md` (full human hormone list).

### Layer 2 step: Emotional Inertia as Character Trait (implemented)

Per-character emotional inertia makes mood stickiness personal. Some characters are emotionally fluid (moods shift quickly), others get stuck (moods persist). This is the "individual variation" described in Layer 1 above.

**Which systems:** Only the four mood-primary systems read by `moodTone()`: serotonin, dopamine, norepinephrine, GABA. Physiological rhythms (cortisol, melatonin, histamine, etc.) are unaffected — personality doesn't change your cortisol cycle.

**Personality parameters:** Three raw values generated at character creation and stored in state (not pre-computed inertia):
- `neuroticism` (0–100) — strongest predictor. Adds extra stickiness in the "toward worse mood" direction only.
- `self_esteem` (0–100) — low self-esteem increases inertia across all directions.
- `rumination` (0–100) — high rumination increases inertia across all directions.

**How inertia applies:** `rate = baseRate / effectiveInertia(system, isNegative)`. The `effectiveInertia()` function computes from raw personality each tick — no lossy pre-computation. The `system` parameter is unused for now (all four systems get the same formula) but the signature supports per-system differentiation as a formula edit, not a refactor.

**Inertia range:**
- Base: 0.6 (fluid, all traits at 0/100/0) to 1.4 (sticky, all traits at 100/0/100)
- Neuroticism negative bonus: up to +0.2 when drifting toward worse mood
- State modifiers: adenosine > 60 (sleep deprivation), last_sleep_quality < 0.5 (poor sleep), stress > 60 (chronic stress) — each adds up to ~+0.2
- A fluid character's mood shifts ~67% faster than default; a very sticky character's ~40% slower

**"Worse direction" per system:** serotonin falling (low = depressed), dopamine falling (low = anhedonia), NE rising (high = agitation), GABA falling (low = anxiety).

**Legacy compatibility:** Characters without personality (old saves) get 50/50/50 → inertia exactly 1.0 → identical drift behavior.

**Replay safety:** No PRNG consumed. Personality stored in state (restored on load via `loadState()` defaults merge). Drift is deterministic from state values + time delta.

### Layer 2 step: Basic Sentiments (implemented)

The lightest form of directed sentiments — likes and dislikes generated at character creation. Each is a `{target, quality, intensity}` object stored in an array on the character. The same data structure that accumulating sentiments (step 5) and trauma sentiments (step 6) will use later.

**Data structure:** Array of sentiment objects on the character, persisted in the run record, written to state via `applyToState()`:
```javascript
sentiments: [
  { target: 'weather_clear', quality: 'comfort', intensity: 0.7 },
  { target: 'weather_grey', quality: 'irritation', intensity: 0.4 },
  { target: 'time_morning', quality: 'comfort', intensity: 0.6 },
  { target: 'eating', quality: 'comfort', intensity: 0.55 },
  ...
]
```

**Sentiment palette (8 categories, ~15 charRng calls):**
- Weather like (`weather_{type}`, comfort, 0.05–0.85) and weather dislike (`weather_{other}`, irritation, 0.05–0.6)
- Time of day (`time_morning` or `time_evening`, comfort, 0.1–0.8)
- Food comfort (`eating`, comfort, 0.02–0.8)
- Rain sound (`rain_sound`, comfort, 0.02–0.9)
- Quiet (`quiet`, comfort 65% / irritation 35%, 0.1–0.7)
- Being outside (`outside`, comfort, 0.02–0.7)
- Physical warmth (`warmth`, comfort, 0.02–0.8)
- Routine (`routine`, comfort 60% / irritation 40%, 0.1–0.6) — dormant, no activation hook yet

Every character gets all 8 categories. Even very low intensity (0.02) is stored — the math handles it.

**Activation model — two patterns:**

1. **Target modifiers** (feed into NT target functions, always active):
   - Weather → serotonin target: comfort `+intensity * 4`, irritation `-intensity * 3`
   - Time of day → serotonin target: preferred hours `+intensity * 4`, anti-preferred `-intensity * 3`
   - Time of day → dopamine target: preferred hours `+intensity * 3`, anti-preferred `-intensity * 2`
   - Morning person prefers 6–11, anti-prefers 21+. Evening person prefers 18–23, anti-prefers 6–9.

2. **Discrete nudges** (in interaction execute functions):
   - Food comfort → `adjustNT('serotonin', fc * 3)` on eat_food, `fc * 2` on buy_cheap_meal
   - Rain sound → `adjustNT('serotonin', rc * 2)` on look_out_window during drizzle; `qualityMult += rc * 0.1` on sleep during drizzle
   - Outside → `adjustNT('serotonin', oc * 2)` on go_for_walk
   - Warmth → `adjustStress(-wc * 3)` on shower
   - Quiet comfort → `adjustNT('serotonin', qc * 2)` on sit_at_table; irritation → `adjustNT('norepinephrine', qi * 2)`

**Effect scale:** All effects are small background forces. Weather serotonin shift max ±3.4 (compare: sleep quality moves target ±20). Discrete nudges max ~2.4 serotonin.

**Prose:** Sentiment-aware `weightedPick` variants added to eat_food, buy_cheap_meal, shower, sit_at_table, go_for_walk, look_out_window, sleep. Existing variants preserved; new entries weighted by sentiment intensity.

**The sentiments array in state is mutable.** Step 3 generates static preferences, but future steps will mutate in-place:
- Step 4 (sleep processing): overnight attenuation of recent intensity changes
- Step 5 (accumulating sentiments): repeated interactions build or intensify
- Step 6 (trauma sentiments): high-intensity, processing-resistant entries

**Legacy compatibility:** Characters without `sentiments` → `applyToState()` writes `[]` → `sentimentIntensity()` returns 0 → zero target modification, zero nudges.

**Replay safety:** Generation uses charRng only, character stored verbatim. Target modifications and discrete nudges are deterministic from state (no PRNG consumed). New `weightedPick` entries follow the same single-RNG-call pattern.

### Layer 2 step: Sleep Emotional Processing (implemented)

REM sleep attenuates the emotional charge of recent experiences — "sleep on it" made mechanical. During sleep, each sentiment's intensity drifts back toward its **character baseline** (the chargen-generated value stored on the character object).

**Why character baseline:** The character record already holds the original sentiments verbatim (never regenerated, stored in IndexedDB). This is the natural baseline. Accumulated sentiments (step 5, future) that don't exist on the character have baseline 0 — sleep attenuates them toward absence, which is correct.

**Processing formula:**
```
durationFactor = clamp(sleepMinutes / 420, 0.3, 1.0)
processingRate = 0.4 * qualityMult * durationFactor

For each sentiment in state:
  baseIntensity = matching character sentiment's intensity, or 0 if no match
  deviation = intensity - baseIntensity
  intensity -= deviation * processingRate
```

**Processing rates by sleep quality:**
- Good sleep (quality 1.0, 7+ hours): ~40% of deviation processed per night
- Poor sleep (quality 0.5, 7 hours): ~20%
- Poor sleep (quality 0.5, 3 hours): ~14%
- A moderate emotional charge fades over 2–3 good nights

**Timing in sleep execute:** After `advanceTime()` and stress reduction (so NT drift during sleep uses pre-processed sentiments), before fridge decay and `wakeUp()`. The effect manifests in waking hours.

**Current effect:** Zero. All sentiments are at their chargen baseline, so deviations are zero. The mechanism is in place for step 5 (accumulating sentiments) to push intensities above baseline, at which point sleep will partially reset them.

**Replay safety:** No PRNG consumed. Processing is deterministic from state values + sleep parameters. On replay, `applyToState()` writes original sentiments, then sleep interactions re-process them identically.
