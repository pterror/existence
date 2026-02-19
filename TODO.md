# TODO

## Backlog

### NT prose shading — remaining unconverted call sites
Three-layer prose shading pattern established (see DESIGN.md "Prose-neurochemistry interface"): moodTone() as coarse selector, weighted variant selection via NT values, deterministic modifiers. Converted: `idleThoughts()`, `apartment_bedroom` description, `lie_there` interaction, sleep prose (23 sites), `look_out_window` (7 sites). All `Timeline.pick()` call sites converted to `Timeline.weightedPick()` with NT shading. **67/67 complete.** Priority order:

**High impact (frequent / atmospheric):**
- ~~Sleep prose (falling-asleep + waking-up, ~23 pick sites)~~ — **DONE.** Pre-sleep NTs (adenosine, GABA, NE, serotonin) shade falling-asleep; post-sleep NTs (serotonin, NE, GABA, adenosine) shade waking. Key dimensions: adenosine→sleep inertia/crash, GABA→night anxiety/can't-settle, NE→hyper-alertness/sharp edges, serotonin→dread-vs-warmth.
- ~~`look_out_window`~~ — **DONE.** Dopamine→engagement with the scene, serotonin→emotional distance, GABA→oppressive weather, NE→sensory vividness, adenosine→soft focus.
- ~~`sit_at_table`~~ — **DONE.** Dopamine→nothing to reach for, serotonin→weight-vs-warmth, GABA→can't-settle, adenosine→heavy sitting, NE→sound awareness.
- ~~`go_for_walk`~~ — **DONE.** 12 branches (6 mood × 2 weather). Serotonin/dopamine→engagement, NE→sensory vividness/irritation, GABA→anxiety-walks-with-you, adenosine→body drag.
- ~~Other location descriptions (kitchen, bathroom, street, bus stop, workplace, corner store)~~ — **DONE.** All 7 locations have NE/adenosine/GABA deterministic modifiers.

**Medium impact (periodic):**
- ~~Work event text (work_task_appears, break_room_noise)~~ — **DONE.** NE→demand sharpness, adenosine→sound blur.
- ~~Event text generators (street_ambient, apartment_sound, someone_passes)~~ — **DONE.** NE→sensory detail/hyper-awareness, serotonin→social distance.
- Work interactions (do_work, work_break, talk_to_coworker) — no Timeline.pick sites, already single-string
- Phone interactions (check_phone, read_messages) — no Timeline.pick sites

**Low priority (infrequent / already thin):**
- ~~Friend/coworker message generators~~ — **DONE.** Friend messages: dopamine→gesture-doesn't-land, serotonin→check-in-as-weight/sincerity-unbearable. Coworker chatter: serotonin→warmth-lands, NE→chatter-grates, GABA→stress-contagion. Coworker interaction: serotonin→exchange-warmth, adenosine→drift-through, NE→tension-catching.
- Shopping interactions (buy_groceries, buy_cheap_meal, browse_store) — no Timeline.pick sites
- Utility interactions (shower, eat_food, drink_water, do_dishes) — no Timeline.pick sites

## Under Consideration

Everything below is drawn from the gap between DESIGN.md and what's built. Not committed to — just visible.

### System interfaces — all systems

Stable JS method signatures for every simulation system, following the model in [DESIGN-OBJECTS.md](DESIGN-OBJECTS.md). See **[DESIGN-INTERFACES.md](DESIGN-INTERFACES.md)** for the full catalog.

Currently, content.js reaches into `State.get('x')` raw scalars for most systems. Each system should expose a clean interface that hides implementation details from prose. When content reads `State.get('apartment_mess')` directly, it's coupled to the implementation. When it calls `Mess.tier()` or `Dishes.inSinkCount()`, it talks to the contract.

Interfaces are catalogued in order of implementation readiness:
1. **Domestic objects** — already in DESIGN-OBJECTS.md. Clothing, Dishes, Linens replace `apartment_mess`.
2. **Food** — `Food.fridgeTier()`, `Food.canEat()` wrappers over the current scalar.
3. **Finance** — `Finance.canAfford()`, `Finance.nextBillDue()`.
4. **Job** — `Job.isWorkday()`, `Job.isLate()`, `Job.latenessMinutes()`.
5. **Weather/Geo** — temperature, season, day length from latitude + date.
6. **Substances** — caffeine first.
7. **Health** — one condition to establish the pattern.

### Mood as its own system
Full emotional architecture designed in [DESIGN-EMOTIONS.md](DESIGN-EMOTIONS.md). Three layers: neurochemical baseline (ambient mood with inertia), directed sentiments (emotions attached to specific targets — people, concepts, objects, traits), surface mood (emergent from both + physical state + context). Implementation path:
1. ~~**Neurochemical baseline with inertia**~~ — **IMPLEMENTED.** 28 neurochemical systems with exponential drift, asymmetric rates, biological jitter. moodTone() now reads from serotonin/dopamine/NE/GABA. Sleep, stress, hunger, social feed active systems. Mood has inertia — no more instant-snap.
2. ~~**Emotional inertia as character trait**~~ — **IMPLEMENTED.** Personality params (neuroticism, self_esteem, rumination) generated at chargen, stored in state. `effectiveInertia()` modifies drift rate for mood-primary systems only. Neuroticism adds asymmetric negative stickiness. State modifiers (sleep deprivation, poor sleep, chronic stress) increase inertia for everyone.
3. ~~**Basic sentiments**~~ — **IMPLEMENTED.** 8 categories of likes/dislikes generated at chargen (weather, time, food, rain, quiet, outside, warmth, routine). Stored as `{target, quality, intensity}` array on character. Weather/time feed serotonin/dopamine targets continuously. Food, rain, outside, warmth, quiet produce discrete nudges in interactions. Sentiment-aware prose variants in 7 interactions. Routine stored but dormant.
4. ~~**Sleep emotional processing**~~ — **IMPLEMENTED.** `State.processSleepEmotions()` attenuates sentiment deviations from character baseline each night. Rate scales with sleep quality and duration (~40% per good night). No PRNG consumed. Activated by step 5 pushing intensities above baseline.
5. ~~**Accumulating sentiments**~~ — **IMPLEMENTED.** Work dread/satisfaction from do_work focus outcomes; coworker warmth/irritation from talk_to_coworker and coworker_speaks in different moods. `State.adjustSentiment()` mutation function. Work sentiments feed serotonin/dopamine targets at workplace. Coworker sentiments modify social/stress mechanical outcomes. Sleep processing attenuates toward 0. Prose variants in doWorkProse, coworkerChatter, coworkerInteraction.
5b. ~~**Sentiment evolution mechanics**~~ — **IMPLEMENTED.** Three mechanics deepening sentiment dynamics before trauma: regulation capacity (personality-dependent sleep processing efficiency, 0.5–1.3), entrenchment + intensity resistance (dread/irritation process 40% slower, high-intensity deviations resist processing), habituation of comfort sentiments (small decay on each activation, restored by sleep).
5c. ~~**Contradictory experience**~~ — **IMPLEMENTED.** Experiences that contradict existing sentiments gently challenge them. Coworker interactions cross-reduce warmth/irritation (30–40% of primary). Relaxed work breaks cross-reduce dread. Ambivalence emerges from mixed days.
5d. ~~**Friend absence effects**~~ — **IMPLEMENTED.** Per-friend contact timestamps track last message engagement. After 1.5-day grace period, guilt accumulates each sleep cycle (~0.005–0.008/night, scaling with duration). Unread messages intensify guilt. Phone screen guilt nudge. Reading resets timer and reduces guilt. Serotonin target penalty at home. Guilt-aware idle thoughts (16 new). Sleep processing factor 0.7.
6. **Trauma sentiments** — high-intensity, processing-resistant. Connected to trauma system.

**Neurochemistry incompleteness:** 28 of ~76+ human hormones modeled. See [REFERENCE-HORMONES.md](REFERENCE-HORMONES.md). Missing: CRH, ACTH, GnRH, aldosterone, estrone, estriol, androstenedione, NPY, substance P, orexins, CCK, enkephalin, adrenaline, and others. Add as their relevant game systems are built.

### Habit system
Full design in [DESIGN-HABITS.md](DESIGN-HABITS.md). The character develops behavioral momentum from observed play patterns. Implementation path:
1. ~~**Decision tree engine + feature extraction + training + prediction**~~ — **IMPLEMENTED.** CART decision trees learn action patterns from ~34 features. One-vs-rest binary trees per action. Recency-weighted training. Trained after replay, retrained every 10 actions.
2. ~~**Suggested defaults**~~ — **IMPLEMENTED.** Medium-strength habit predictions (>0.5, modulated by routine sentiment) surface as subtle visual distinction on action buttons. Competing habits suppress suggestion.
3. ~~**Auto-advance**~~ — **IMPLEMENTED.** Predictions at ≥0.75 confidence trigger auto-advance: approaching prose (deterministic, no RNG) + highlighted action + 2500ms delay + auto-fire. Player clicks any action to interrupt. Chains naturally (morning routine flows automatically). Source-weighted training (auto=0.1). Phone mode suppressed. 30 interaction + 7 movement approaching prose functions.
4. **Prose modulation** — habit strength modulates prose density (high habit → terse, low habit → full). Needs content variants.
5. **Decision path → prose motivation** — tree path tells prose system WHY the habit fired (morning routine vs hygiene need). Needs auto-advance prose system.
6. **Routine sentiment activation** — overall habit consistency feeds routine comfort/irritation NT targets.

### Social initiation
~~Friends only send messages to you~~ — **MOSTLY IMPLEMENTED.** `reply_to_friend` phone interaction: player replies, friend responds after 30–90 min. `message_friend` phone interaction: player reaches out first when no unread messages from that friend, picks friend by guilt/contact recency. Both reduce guilt 0.06, reset contact timer, queue response. NT-shaded prose per flavor (separate prose tables for initiating vs replying).

**Still missing:** Calling (vs texting), the different way each friend responds to prolonged vs brief absence, reaching out when no guilt exists (purely wanting to connect).

### Financial cycle — remaining depth
~~Basic financial cycle (paycheck, rent, utilities, phone)~~ — **IMPLEMENTED.** Life history backstory generates starting money, pay rate, rent. Bills auto-deduct monthly. Paycheck varies with attendance.

**Still arbitrary (should become derived):**
- **Bill types are hardcoded.** The simulation assumes everyone has the same three bills (rent/utilities/phone) plus a biweekly paycheck. This should derive from life situation: someone on gig work gets irregular payments not a biweekly; someone in shared housing has different rent + possibly no utility bill; someone on prepaid has no phone contract. The `nextBillDue()` / `nextPaycheckDays()` interfaces are right, but their backing data is hardcoded instead of being derived from character situation. Future: bill manifest generated from housing type, employment type, phone plan, etc. at chargen.
- Paycheck: flat biweekly amount. Should vary by hours worked, overtime, deductions (taxes, insurance).
- Utilities ($65 flat) — should derive from season (heating/cooling), apartment size, actual usage
- Phone bill ($45 flat) — should derive from plan type (prepaid vs contract), data usage
- Rent bracket — should derive from housing type (apartment/room/family), not just origin
- Personality parameters — currently random 0–100, should partially derive from upbringing events
- Friend flavors — currently random, should connect to backstory (who stays after life events?)

**Not yet implemented:**
- Debt mechanics (negative balance, overdraft fees)
- "Choose which bill to skip" interaction
- Eviction / disconnection consequences for repeated failed bills
- Spending habits shaped by personality/origin (automatic spending)
- Variable pay rates by age/experience
- Non-formal income patterns (gig work, cash, irregular)

### More employment types
Only formal employment exists (office, retail, food_service). DESIGN.md describes: freelance/commissions (irregular work, irregular pay), gig work (apps, deliveries), informal work (cash, no records), unemployed (looking or not), can't work (disability, caregiving, age). Each reshapes what "work" means.

### Ending conditions
Runs never finish. No mechanism for a life ending or the game concluding. What triggers an ending? What does "finished" mean for a game with no win/fail state?

### Leisure and downtime interactions
**Partially implemented.** Four interactions added: lie_there (stay in bed, bedroom), look_out_window (bedroom), sit_at_table (kitchen), go_for_walk (street). All have mood-dependent effects — the same action produces different mechanical outcomes depending on internal state. Still missing: TV, music, reading, mindless phone scrolling — the media/distraction layer. Also no sitting on the couch (no living room), no aimless browsing, no "do nothing" as a distinct street/bus-stop option.

### Cooking and food variety
Only "eat from fridge" and "buy cheap meal." No cooking (time + energy + ingredients), no meals that feel different, no dietary texture. DESIGN.md describes food as deeply personal — comfort food, cultural food, what's in the fridge vs what you need.

### ~~Alarm negotiation~~
~~The alarm fires as an event but there's no snooze, no "turn it off and go back to sleep," no choosing not to set one. DESIGN.md describes the alarm as a negotiation between the person who set it and the person who hears it.~~ — **IMPLEMENTED.** snooze_alarm and dismiss_alarm interactions. Snooze escalates (fog → negotiation → guilt), dismiss varies by snooze count. Sleep debt, melatonin, circadian alignment, REM cycle model all integrated into sleep. See "Deep sleep model" in STATUS.md.

### Sleep prose
**Largely implemented.** Sleep prose now has two phases: falling-asleep (how sleep came) and waking-up (the gradient back to consciousness). Waking prose branches on post-sleep energy, sleep quality, alarm vs natural, time of day, mood, sleep debt, and sleep inertia — ~44 waking + ~22 falling-asleep variants. Alarm negotiation implemented (snooze/dismiss). Slept-through-alarm awareness. Still missing: insomnia/not-sleeping as a distinct experience, dreaming.

### Domestic object systems
Full design in [DESIGN-OBJECTS.md](DESIGN-OBJECTS.md). Mess is not a scalar — it's emergent from the states of real objects. The current `apartment_mess` variable is an acknowledged approximation debt. See [PHILOSOPHY.md](PHILOSOPHY.md) for the interface/granularity model that applies here.

**Current state (approximation debt):** `apartment_mess` scalar shapes prose at 4 tiers in bedroom, kitchen, bathroom. `messTier()` in state.js. `apartment_notice` event is NT-shaded. Prose works but is fundamentally limited — "dishes in the sink" comes from a number, not dishes.

**Implementation path (from DESIGN-OBJECTS.md):**
1. ~~**Define interfaces**~~ — **DONE.** See [DESIGN-INTERFACES.md](DESIGN-INTERFACES.md).
2. ~~**Coarse implementations**~~ — **DONE.** `js/dishes.js`, `js/linens.js`, `js/clothing.js` — count-based backends. Wired in context.js + game.js. content.js updated throughout.
3. ~~**Remove `apartment_mess`**~~ — **DONE.** `apartment_mess` scalar removed from state.js. `messTier()` moved into content.js, computed from Dishes + Linens + Clothing. Bedroom, kitchen, apartment_notice all use local `messTier()`. Four tiers: tidy / cluttered / messy / chaotic.
4. **Full implementations** — per-item tracking, one system at a time. Clothing first (wardrobe generated at chargen, items with location/wear states, undressing shaped by mood/energy).
5. **Laundry mechanic** — currently stubbed as 3 interactions (start_laundry / move_to_dryer / fold_laundry) in apartment_bedroom, assuming in-unit machines. This is an approximation debt: laundry path should derive from housing situation (in-unit machines → current flow; building laundry room → separate location; laundromat → travel + location; hand-wash → sink interaction). Multiple paths, not one universal. Housing type not yet a backstory parameter.

**Prose that becomes possible at full granularity:** "the shirt you've worn three days running," "three plates and a mug since Tuesday," specific items on specific surfaces, eating without a clean dish to use.

### Weather depth
Only 4 weather states, no temperature, no seasonal variation, no weather affecting what you wear or how movement feels. DESIGN.md describes weather as atmosphere — the grey day that sits on you, rain changing what the street feels like.

### Clothing and getting dressed
Currently: outfit sets selected at chargen, 3 prose variants each (default/low_mood/messy). No item tracking, no laundry, no choosing what to wear. This is superseded by the domestic object systems design — see above and [DESIGN-OBJECTS.md](DESIGN-OBJECTS.md). Getting dressed becomes: `Clothing.canGetDressed()` gates availability, `Clothing.wear()` picks and marks an item, outfit prose derives from what was actually put on.

### More phone interactions
~~Phone is check-only.~~ **Real phone UI incoming.** Phone now renders as a full HTML5 overlay: home screen (time, battery, Messages badge), messages list (per-contact rows, unread dots), threaded conversation view (bubble layout, sent/received), in-thread compose. Navigation (home→list→thread→back) is transient state, not recorded. Only actions with game effect (reply, message_friend, put_phone_away) go through the normal action pipeline.

**Future phone apps (not yet implemented):**
- **Notes** — player can write/read notes; each note saved as a state object; writing/deleting are recorded actions; pure navigation within the app is not
- **Alarm** — in-phone alarm clock UI replacing the current interaction-based set/skip flow; multiple alarms, snooze management; setting/cancelling alarms are recorded actions
- **Calendar** — view upcoming events, work schedule; possibly editable reminders; editing entries is a recorded action
- **Timer / Stopwatch** — utility app; could feed game mechanics (timed tasks, pomodoro-style focus); start/stop recorded only if they have game effect
- **General principle**: each in-phone app manipulation that has game effect is a recorded action. Pure navigation within an app is not.

**Personalization layer (not yet implemented):** Phone background (wallpaper image or color), lock screen photo, ringtone/notification sounds — cosmetic player choices that make the phone feel owned. Set via a Settings app. Each change is a recorded action (it changes persistent state, the replay should show it). The right wallpaper is a tiny assertion of selfhood.

~~**`toggle_phone_silent` temporarily inaccessible**~~ — **FIXED.** Silence toggle on home screen (tap to mute); "silent" indicator in status bar on all screens (tap to unmute).

**Face-down DND** — some phones (and some people) use placing the phone face-down as a temporary "don't interrupt me" gesture. Could be a location-specific interaction (put_phone_facedown at kitchen table, desk, bedside, bathroom counter before shower) that suppresses notifications until the player picks it back up. Different texture from full silent mode — not a setting, just a posture. The phone is still there, still accumulating messages; you're just choosing not to see them right now.

**Shower as a phone-free moment** — the shower is one of the few natural pauses from the phone. Some people bring it in anyway (waterproof case, propped on the shelf, half-watching something). Most don't. Either way there's a texture here: the 10 minutes where you can't check it even if you want to, and what that feels like depending on whether there's something you're waiting for or avoiding. Could feed into compulsive-checking patterns — coming out of the shower and immediately reaching for the phone is a specific gesture worth capturing.

**Still missing:** Calling (vs texting), the different way each friend responds to prolonged vs brief absence, reaching out when no guilt exists (purely wanting to connect). Compulsive checking vs avoidance as distinct behavioral patterns.

**Phone OS flavor** — the UI currently has no platform identity. Characters could have iOS or Android phones (generated at chargen), and the UI would reflect that: different typography weight, bubble alignment conventions, status bar layout, notification shade vs control center, app icon grid vs app drawer. Further flavor: older iOS versions (skeuomorphic textures, different type scale), Android manufacturer skins (Samsung One UI density, older HTC Sense warmth). Platform should be generated from economic origin and backstory (flagship → comfortable+, mid-range → careful, prepaid/old → tight/broke), stored on character, and drive the CSS class applied to the phone overlay.

**Phone condition** — the phone has a physical state separate from battery: age, model tier, and damage. A cracked screen is the obvious one — rendered as a CSS overlay (SVG crack pattern, or a few sharp lines across the glass) that's just always there. Generated from economic origin and life events (tight budget + a year of use → decent chance of a crack that never got fixed because the repair costs more than a month of groceries, or because being without your phone for two days while it's in the shop is its own impossible cost). Condition affects texture, not function — the phone works, the crack is just part of what it is now. Screen protector as a middle layer: cheaper than a repair, still broken, still there. Could extend to: a slow phone (loading spinners between screens), a phone that drops calls, a dying battery that won't hold charge past noon. Each a small daily friction that accumulates. Signal is another layer — bad wifi at home (cheap ISP, router in the wrong room, building interference), weak 4G in dead spots on the commute, a prepaid plan that throttles after the data cap. Messages send slowly or fail with an indicator (not silently — apps show the failure). The phone shows one bar. A failed message sits there with a retry option; tapping resend is its own small moment.

### Age-specific content
age_stage is a number (22–48 default range) but no prose varies by age. DESIGN.md describes radically different daily textures for children, teens, young adults, adults, older adults — different work, different money sources, different phone use, different constraints.

### Family relationships
No family exists in the simulation. DESIGN.md describes: supportive / conditional / hostile / absent parents. Financial cutoff. Housing contingent on family. The phone call you dread. Siblings. The weight of family as unchosen.

### Content warnings and consent
No content level configuration. DESIGN.md describes: baseline tier (everyday struggles), full tier (DV, abuse, addiction, etc.), fine-grained toggles per category. Configuration before character generation, revisitable between runs.

### Health system
No health conditions exist. DESIGN.md describes: chronic conditions (diabetes, chronic pain, migraines, etc.), injury, illness, disability. Two kinds of effect — texture (how things feel) and concrete (what's physically possible). Good days and bad days. Medication as its own system.

### Mental health as distinct from state
Stress and energy model some of this but DESIGN.md describes depression, anxiety, bipolar, PTSD, OCD as structural conditions — not "low energy" but "the specific way getting out of bed takes everything you have."

### Neurodivergence
ADHD (executive dysfunction, time blindness, hyperfocus), autism (sensory processing, masking cost, routine importance). Not illnesses — ways of being that interact with a world not designed for them.

### Substance system
No substances exist. DESIGN.md describes: caffeine (mood/energy floor, withdrawal headache), nicotine (cycle of withdrawal and relief), alcohol (the curve — push, plateau, cost), cannabis, prescription drugs, harder substances. Each with: acute effect, comedown, tolerance, withdrawal, baseline shift.

### Drawn lots
No drawn lots exist. DESIGN.md describes: foster care, domestic violence, CPS, childbearing, fetal alcohol syndrome, instability, caregiving, housing instability, addiction/recovery, legal constraints, grief, language barriers. Each as daily texture, not backstory tags.

### Identity and social landscape
No identity dimensions affect the simulation. DESIGN.md describes: gender (misogyny as ambient texture, not events), trans experience (visibility, HRT, passing, nonbinary), race/ethnicity (ambient response, code-switching, microaggressions), sexuality (the closet as energy cost, being out), body (weight, height, appearance as social objects).

### Performance and masking cost
DESIGN.md describes a shared pattern across identity dimensions: masking (autism/ADHD), code-switching (race/culture), the closet (sexuality), boymoding/girlmoding (trans), body management. All modeled as ambient energy drain that varies by context. Some spaces let you drop it.

### Endocrine and biological systems
Hormonal profile, menstrual cycles, cortisol rhythms, metabolism, drug metabolism (CYP enzyme variation), nutrient processing. Autonomous forces on mood that operate on their own schedule.

### Dietary needs
Condition-driven (diabetes, celiac, allergies), pregnancy, religious/cultural (halal, kosher, fasting), eating disorders. Poverty making all of it worse — the specialized diet costs more.

### Economic dimensions beyond money
Origin (where you started vs where you are), social capital (who you know), cultural capital (what you know how to do in context), educational background, geographic reality (food deserts, transit deserts). The daily tax of poverty — being poor is expensive in time and energy.

### Trauma system
Not a condition — a lens. Loaded moments, avoidance, involuntary reactions, absences (interactions that should be there but aren't). Triggers orthogonal to relationships. The prose contracting, going flat, pulling away.

### Upbringing
Working / indifferent / overwhelmed / resentful / abusive. Shapes what the character expects from people, what care looks like to them, what they flinch at.

### Distance and absence in relationships
Online friends, long-distance relationships, sick people remotely. The phone as the relationship's entire infrastructure. Not all relationships are local.

### Observation fidelity in prose
The system exists mechanically but could shape prose more. "Around thirty dollars" vs "$32." "Sometime in the morning" vs "9:15 AM." The experience of not always knowing exactly what's going on because you're tired and distracted.

### Narration voice variation
DESIGN.md describes the narration itself changing based on character — personality affecting sentence rhythm, neurodivergence changing attention structure, trauma changing what's loaded. Not just mood-variant prose but character-variant prose.

### The world outside the routine
Only 7 locations. No park, no library, no friend's place, no laundromat, no clinic, no shelter. The world is small on purpose but could be slightly larger — each new place being a specific texture of constrained life.

### Coworker depth
Coworkers have flavor-driven chatter but no ongoing relationship state. No coworker who notices you've been off. No coworker drama that exists whether or not you engage.

### Bus ride as experience
~~The bus ride is 20 minutes of transition text.~~ — **Improved.** `wait_for_bus` and both bus ride directions (`bus_stop→workplace`, `workplace→bus_stop`) now use full mood-branched `Timeline.weightedPick()` prose with NT shading (adenosine, NE, GABA, serotonin). Wait covers all 6 moods × snow/drizzle/clear. Rides vary by rush hour vs off-peak, energy level, weather through the window, what the day was.

**Still missing:** Ambient events during the ride (someone's music, overheard conversation, the specific route), in-ride interactions (checking phone on the bus, noticing something out the window).

### Night shifts and non-standard schedules
All three jobs are day shifts. DESIGN.md doesn't prescribe this. Being awake at 3 AM when the world is asleep is a specific texture.

### Existing systems that need deepening

~~**Money is a one-way drain.**~~ — **FIXED.** Financial cycle implemented: paychecks (biweekly, attendance-based), rent/utilities/phone (monthly auto-deduct), life history backstory. Partial fix: food_service workers can now eat at work once per shift (`eat_at_work`). **Gradient at $0:**
- `drink_water` exists and gives -3 hunger — not satisfying but it's real; prose should acknowledge it more when used as a hunger-management strategy, not just hydration
- Dry pantry — fridge can be empty but most people have shelf-stable things (ramen, rice, crackers, a tin of beans). A separate `pantry_food` pool, stocked at different rate than fridge, distinct from "there is no food here." This is the most honest next step.
- Office/retail workers at work: break room has something (vending machine costs money; but coworker might offer something, or there's communal food). Not designed yet.
- Asking a friend for money / asking them to grab something: phone interaction, not yet built.
- Food bank: real option, needs a location or a travel path.
- The character who is genuinely out of all options — broke, empty fridge, empty pantry, not at work — is experiencing something real. That experience needs prose weight, not just absence of actions.

**Job standing is mechanical, not social.** Decay: late > 15min = -5, calling in = -8. Recovery added: on-time arrival +2, focused task completion +1. Still no social dynamics (coworker relationships don't affect standing), no variation by job type, no pattern-based assessment (single incident treated same as chronic pattern). Standing should be relational — shaped by what the specific job values, whether someone saw you, whether someone covered for you. See the expanded Work section in DESIGN.md.

**Phone power system could deepen.** Battery now drains by screen time and charges during sleep / via charge_phone interaction. Future: phone model/age affecting battery capacity and drain rate, charge rate varying by charger type (wall vs USB vs car), battery health degrading over the life of the phone. Doesn't meaningfully affect gameplay but deepens the simulation — an old phone with a bad battery is a different daily texture than a new one.

~~**Idle timer goes silent after 2 thoughts.**~~ — **FIXED.** Delays now escalate (30s → 60s → 2min → 5min → 20min plateau) and continue indefinitely. AFK protection: if no user input (mouse/key/click) for 5 minutes, the timer drops silently without rescheduling. Tab-hidden protection was already in place. Result: deliberate inaction gets continuing thoughts with natural spacing; walking away gets 2–3 thoughts then silence.

**Event accumulation and the idle/absence problem.** The event caps (2 per type, then silence) were a bandaid for events piling up during unattended play. The real fix is upstream: handle player absence properly. If nobody's at the screen, the game shouldn't be generating content into nothing — step-away, auto-pause, tab detection. If absence is handled, the accumulation problem dissolves. Deliberate inaction (the player choosing not to act, the weight of not starting) is a different thing entirely and should be supported as a real experience.

~~Separately, body-state events (hunger, exhaustion) should fire on state *transitions* — you discover you're hungry once, when it crosses into a new tier.~~ — **FIXED.** `hunger_pang` and `exhaustion_wave` now fire deterministically on tier crossings: hungry→very_hungry→starving, exhausted→depleted. No RNG consumed (removed two `Timeline.chance()` calls from the hot event path). Resets when eating/resting. **Still needs:** late_anxiety and apartment_notice use the old count-cap pattern (`surfaced_late`, `surfaced_mess`) — those should also become transition-based. Ambient events (pipes, street noise) should habituate — you stop noticing after time in the same place.

Event text should never be reused as a bandaid for not having enough content. Seeing the same text twice is the game breaking the fiction. Reuse is only appropriate when the repetition is genuinely realistic — a sound that recurs, a routine that repeats. Never to fill space.
