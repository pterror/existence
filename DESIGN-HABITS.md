# Habits

The character has habits. The character acts. The player interrupts.

## The problem

Every day: wake, dress, shower, eat, commute, work, commute, eat, sleep. The player clicks the same actions in the same order. This isn't constrained agency — it's data entry. The daily routine should feel like living, not like operating a checklist.

The answer isn't to skip the routine (that removes the experience) or to add shortcut buttons (that dodges the problem). The answer is that the character is a person who develops habits, and habits are actions that happen without deciding.

## Core concept

A habit is an action the body does without the mind choosing. The decision was made days ago — now the action just happens. The only decision point is NOT doing it.

In the game: the character develops behavioral momentum from repeated patterns. When momentum is strong enough, the character proceeds through their pattern on their own. The prose narrates it happening. The player's agency is in *taking over* — interrupting to do something different.

The morning routine isn't a list of choices. It's the character's body doing what it does every morning. The player watches it unfold and can intervene at any point. If they don't, the routine flows through with state-aware prose. If they do, the character stops and the player has full control.

No friction on routine days — the character handles it. Full agency always — every action available at every interruption point. No constraint ever — the player can always take the wheel.

## How habits form

From observed play. No configuration, no declaring routines. The game learns what the player tends to do in a given context.

A habit isn't a sequence. It's an association: **in this context, I do this thing.** Each habit is independent.

- Morning → shower. Not "after getting dressed → shower."
- Home after work → eat. Not "after commuting → eat."
- Waking up → check phone. Not "after alarm → check phone."

Some mornings you shower first, some mornings you eat first. Both are habits. Morning means shower AND morning means eat — separately, not as an ordered chain. The order is incidental.

**Context is the full game state** — not a prescribed set of features, not a fixed number of previous actions. Everything available:

- Time relative to wake, time of day
- Location
- Daily flags (dressed, showered, ate, worked, etc.)
- Recent action history to arbitrary depth
- Internal state (energy, stress, mood, NT levels)
- World state (weather, fridge contents, phone battery, unread messages)
- Sentiment intensities (work dread, routine comfort, financial anxiety, etc.)

Different habits key off different parts of the state. A morning shower habit keys off time + showered flag. An anxious phone-check habit keys off stress + GABA. A post-work eating habit keys off location transition + hunger. The system doesn't prescribe which features matter — it discovers them from the data.

Sequences emerge naturally from context chaining — shower updates the state (showered=true), which changes the context, which makes dressing the strong prediction, which updates the state again. The chain flows without being stored as a list. And it's flexible — eat before showering one day, the contexts still resolve, just in a different order.

**An action can have multiple activations.** Showering fires in the morning (routine) AND when dirty (hygiene). These are different habits that resolve to the same action, triggered by different state conditions. The system discovers both from the data — different contexts, same action. The motivation behind the habit (which context triggered it) feeds into prose: "Shower. Same as yesterday." vs "You need a shower."

**Formation rate varies by character:**
- Routine-comfort characters form habits faster — the body learns readily
- Routine-irritation characters form habits slower — something resists the groove
- Future: autism increases formation rate and habit rigidity; ADHD decreases it and makes habits fragile

**The player shapes habits by playing.** Consistent play → strong habits → the character takes over. Variable play → weak habits → the player stays in control. A player who does different things each morning never builds strong habits for any single action in the morning context. The system stays quiet because there's nothing to learn.

## Habit strength

Strength is the reliability of the state→action prediction. Not about duration — something done without fail for 3 days is a habit forming faster than something done sporadically over 30. Consistency is the axis, not time.

A gradient, not a binary. Strength builds with consistency and fades with deviation.

**Low strength** (pattern emerging) — no behavioral change. Maybe subtle prose: "You find yourself reaching for your clothes before you've thought about it." The player still chooses every action. The game is just noticing.

**Medium strength** (pattern established) — the game suggests the habitual action for this context. It's the default, visually distinguished from other options. One keypress to confirm, or choose something else. The cognitive load of "what do I do next" disappears for routine actions.

**High strength** (deep habit) — the character does it. The prose narrates the action happening. The player can interrupt at any moment to take control. If they don't, the character moves on to whatever the next context calls for.

The transitions between these levels are smooth. The player never suddenly gets auto-play — it builds over days as the state→action association strengthens. And if the player starts doing something different in that context, strength drops back down.

## Interruption

Always available. Instant. Natural.

When the character is acting on a habit, the player can intervene. Interrupting surfaces the full action list — everything available, as always. The player picks what they want instead.

Interrupting doesn't feel like fighting a system. It feels like becoming present where you were on autopilot.

**What interruption looks like in prose:**
- Habit engaging: "You're already reaching for your clothes—"
- Player chooses to check phone instead: "—but your hand goes to the phone instead."
- Player chooses to sit down: "—but you stop. Stand there."

## State awareness

Habits aren't blind. The character's body knows when something's wrong.

**Habits don't fire when conditions prevent them:**
- Fridge empty → no eating habit → player gets control
- Too exhausted → shower habit doesn't engage → player gets control
- Called in sick → commute habit doesn't engage
- Already dressed → dressing habit skips, next context takes over

**Habits respond to internal state:**
- High stress or extreme mood → habit still fires but prose expands (the action is automatic but the character is feeling it)
- Very low energy → habit is fragile, may not engage (the body tries but can't start)
- Disrupted sleep → morning habits are weaker, easier to interrupt

**Events during habits:**
- Phone buzzes → noted in prose, next habit continues (unless player intervenes)
- Alarm → establishes the "just woke up" context that morning habits key off
- Hunger pang, exhaustion wave → could prevent a habit from engaging

## Habitless play

Some characters (or players) won't develop strong habits. This should work naturally without configuration.

**By play style:** A player who varies their routine — different order each morning, sometimes skips things, sometimes does extra — never builds strong patterns. The habit system stays quiet. Every action is still manually chosen. This is a valid way to play.

**By character:** A routine-irritation character resists habit formation. Their body doesn't settle into grooves easily. Even with consistent player input, habits form slowly and stay weak. The character stays in "player directs everything" mode longer, maybe permanently.

**By intervention:** A player who occasionally deviates keeps habit strength from reaching auto-advance. They get the prose hints ("your hand already knows") and the suggested defaults, but never the full autopilot. Light touch.

The system adapts to how the game is being played. A methodical player gets a character who runs on autopilot. An exploratory player keeps full manual control. Neither needs to configure anything.

## Prose during habits

Habit prose follows the existing NT shading pattern but adds a repetition dimension.

**Habitual + neutral state:** Terse. The character isn't paying attention. "Shower. Something from the fridge. Bus." The action is a sentence, not a paragraph. This is what habit feels like — you stop noticing.

**Habitual + extreme state:** Full. The routine is happening but the character is feeling it. "The shower runs. You stand in it. The water's fine. Everything's fine. You can't remember if you used soap." The habit carries you through but the internal state colors everything.

**Habitual + disrupted:** The routine tries and fails. "You reach for the cereal but the shelf is empty. You stand there, hand still out." The autopilot disengages.

**First time / low habit:** Always full prose. The character is present in the action, noticing things. The paragraph-length descriptions the game already has.

**The habit dimension doesn't replace NT shading — it modulates prose density.** High habit strength compresses routine actions. Low habit strength or extreme internal state expands them. The game spends its words where the character's attention is.

**Decision path shapes prose.** When a habit fires, the system knows WHY — which state features drove the prediction. A morning-routine shower and a need-to-be-clean shower are the same action but different experiences. The decision path tells the prose system the motivation, which determines the narration.

## Relationship to existing systems

**Routine sentiment:** The dormant `routine` sentiment activates naturally. Consistent patterns + routine-comfort → serotonin/dopamine target boost (the comfort of predictability). Consistent patterns + routine-irritation → NE nudge (the trapped-in-a-loop feeling). Overall habit consistency feeds the routine sentiment's target function.

**Emotional inertia:** Characters with high inertia (neurotic, ruminative) have habits that are harder to break — the body's momentum mirrors the mind's stickiness. Characters with low inertia have lighter habits.

**Sleep processing:** A disrupted routine (travel, illness, schedule change) could generate a "disruption" sentiment that processes during sleep. The discomfort of the pattern being broken — or the relief of it, depending on who you are.

**Future neurodivergence:** Autism makes habits structurally important — not just comfortable but necessary. Breaking routine has real cost (stress, NE spike, overwhelm). ADHD makes habits fragile — the body knows the sequence but executive dysfunction can't start it. The habit system is the foundation both build on.

## Computation

The habit system is a classification problem: given the full game state, predict the player's next action. Each past action is a data point — a (state snapshot, action taken) pair. The current moment has a state snapshot. The system predicts what the player would do, and the confidence of that prediction is the habit strength.

### Per-action decision trees

Train a separate binary decision tree for each action: "in this state, would the player do X?" Each tree learns its own relevant features from the data.

The shower tree might learn:
```
time_since_wake < 60min?
├── yes: showered_today = false? → YES (morning routine)
└── no: time_since_last_shower > 12hrs?
    ├── yes → YES (needs cleaning)
    └── no → NO
```

The check_phone tree might learn:
```
stress_tier > tense?
├── yes: location = bedroom? → YES (anxious phone check)
└── no: time_since_last_phone_check > 120min?
    ├── yes → YES (periodic check)
    └── no → NO
```

Each tree discovers which features matter for that action. Multiple leaf nodes can predict YES — multiple activations for the same action, each with its own conditions.

### Features (state snapshot at each moment)

Not a prescribed set — everything available in the game state:
- Time since wake (continuous)
- Time of day (continuous)
- Location (categorical)
- Daily flags: dressed, showered, ate_today, at_work_today, called_in (binary)
- Last action (categorical)
- Time since last instance of each action (continuous — "haven't showered in 18 hours" captures daily patterns without fixed windows)
- Energy, stress, hunger, social tiers (ordinal)
- Mood tone (categorical)
- Key NT levels — serotonin, dopamine, NE, GABA, adenosine, cortisol (continuous)
- Weather (categorical)
- Money tier (ordinal)
- Sentiment intensities — work dread, routine comfort, financial anxiety, friend guilt (continuous)
- Fridge food, phone battery, unread message count (continuous)

"Time since last X" is a powerful feature — it captures patterns at any timescale without fixed lookback windows. "Time since last shower = 22 hours" encodes daily showering. "Time since last phone check = 3 minutes" encodes compulsive checking.

### Training data

Collected during replay (which already happens on load) and during live play. At each action, capture the full state snapshot paired with the action taken. No new persistence — state is reconstructed from the action log every session, same as the Events module.

Recency weighting: recent examples matter more than old ones. Exponential decay so habits can change — a new pattern overwrites an old one as old data fades.

### Prediction

For the current state, run all action classifiers. Each returns P(action | state). The action with the highest probability above a confidence threshold = the habit prediction. The probability is the habit strength.

Multiple actions above threshold = competing habits. The character hesitates — "you reach for your clothes, then glance at your phone." Player gets control.

### Decision path as motivation

The path through the decision tree tells the prose system WHY the habit fired — which features drove the prediction. Morning branch → "Shower. Same as yesterday." Hygiene branch → "You need a shower." Both true → stronger activation, both motivations shade the prose.

### Implementation

A CART decision tree from scratch: ~150–200 lines of JS. No libraries, no build step. The algorithm: for each feature, find the split that maximizes information gain; recurse; stop at max depth. Prediction is walking the tree — microseconds.

Training ~33 small trees (max depth 4–5) on a few hundred data points: milliseconds. Retrain on session start and periodically during play. Random forest (multiple trees per action with bagging) is more robust and straightforward to extend from the single-tree implementation.

### Replay correctness

Auto-executed habit actions are recorded in the action log like any other action, with a source marker: `{ type: 'interaction', id: 'shower', source: 'habit' }`. During replay, both habit-fired and player-chosen actions execute identically. The habit detection reconstructs from the action log during replay. Deterministic given the same action sequence.

No save format changes. Habit state is ephemeral — derived from the action log whenever needed.

### Graceful degradation

First few days: not enough data. Trees are unreliable or can't be trained. No habits fire. The game plays exactly as it does now — full manual control. Habits emerge only when the data supports them.

## What this doesn't solve

**Content depth.** Habits reduce friction but don't create prose. The game still needs enough variants that habitual actions don't produce the same text every time. The NT shading infrastructure is there. The content work is separate.

**Action space.** The game has 33 interactions. Even with habits, the daily loop is narrow. More locations, more interactions, more things to do in the evening — these make habits meaningful because the player is choosing a pattern from genuine alternatives, not defaulting to the only option.

**Substance habits.** Caffeine, nicotine, compulsive phone use — these are habits with neurochemical reinforcement. The basic habit system models behavioral momentum. Substance habits add craving, withdrawal, tolerance. That's a deeper layer built on top of this one.

## Implementation path

1. **Decision tree engine** — CART implementation in JS. Train, predict, extract decision path. ~200 lines.
2. **Feature extraction** — capture state snapshots at each action during replay and live play. Wire up time-since-last-X from the action log. ~100 lines.
3. **Prediction + habit strength** — run classifiers at each decision point. Map probability to the three strength tiers (prose hint / suggested default / auto-advance).
4. **Prose awareness** — habit strength modulates prose density. Decision path feeds motivation to prose. Wire up the routine sentiment.
5. **Suggested defaults** — medium-strength habits surface the predicted action as the default. One-key confirm. All other actions still visible and available.
6. **Auto-advance** — high-strength habits fire automatically with narrated prose. Player can interrupt. Full action list on interruption.
7. **State-aware gating** — habits check availability before firing. Empty fridge, exhaustion, extreme mood prevent engagement. The character pauses and the player gets control.
