# TODO

## Backlog

### NT prose shading — remaining unconverted call sites
Three-layer prose shading pattern established (see DESIGN.md "Prose-neurochemistry interface"): moodTone() as coarse selector, weighted variant selection via NT values, deterministic modifiers. Converted: `idleThoughts()`, `apartment_bedroom` description, `lie_there` interaction, sleep prose (23 sites), `look_out_window` (7 sites). ~19 `Timeline.pick()` call sites remain unconverted. Priority order:

**High impact (frequent / atmospheric):**
- ~~Sleep prose (falling-asleep + waking-up, ~23 pick sites)~~ — **DONE.** Pre-sleep NTs (adenosine, GABA, NE, serotonin) shade falling-asleep; post-sleep NTs (serotonin, NE, GABA, adenosine) shade waking. Key dimensions: adenosine→sleep inertia/crash, GABA→night anxiety/can't-settle, NE→hyper-alertness/sharp edges, serotonin→dread-vs-warmth.
- ~~`look_out_window`~~ — **DONE.** Dopamine→engagement with the scene, serotonin→emotional distance, GABA→oppressive weather, NE→sensory vividness, adenosine→soft focus.
- ~~`sit_at_table`~~ — **DONE.** Dopamine→nothing to reach for, serotonin→weight-vs-warmth, GABA→can't-settle, adenosine→heavy sitting, NE→sound awareness.
- ~~`go_for_walk`~~ — **DONE.** 12 branches (6 mood × 2 weather). Serotonin/dopamine→engagement, NE→sensory vividness/irritation, GABA→anxiety-walks-with-you, adenosine→body drag.
- Other location descriptions (kitchen, bathroom, street, bus stop, workplace, corner store)

**Medium impact (periodic):**
- Work interactions (do_work, work_break, talk_to_coworker)
- Phone interactions (check_phone, read_messages)
- Event text generators (street_ambient, apartment_sound, coworker_speaks)

**Low priority (infrequent / already thin):**
- Shopping interactions (buy_groceries, buy_cheap_meal, browse_store)
- Utility interactions (shower, eat_food, drink_water, do_dishes)
- Friend/coworker message generators (4 friend flavors, 3 coworker flavors)

## Under Consideration

Everything below is drawn from the gap between DESIGN.md and what's built. Not committed to — just visible.

### Mood as its own system
Full emotional architecture designed in [DESIGN-EMOTIONS.md](DESIGN-EMOTIONS.md). Three layers: neurochemical baseline (ambient mood with inertia), directed sentiments (emotions attached to specific targets — people, concepts, objects, traits), surface mood (emergent from both + physical state + context). Implementation path:
1. ~~**Neurochemical baseline with inertia**~~ — **IMPLEMENTED.** 28 neurochemical systems with exponential drift, asymmetric rates, biological jitter. moodTone() now reads from serotonin/dopamine/NE/GABA. Sleep, stress, hunger, social feed active systems. Mood has inertia — no more instant-snap.
2. ~~**Emotional inertia as character trait**~~ — **IMPLEMENTED.** Personality params (neuroticism, self_esteem, rumination) generated at chargen, stored in state. `effectiveInertia()` modifies drift rate for mood-primary systems only. Neuroticism adds asymmetric negative stickiness. State modifiers (sleep deprivation, poor sleep, chronic stress) increase inertia for everyone.
3. **Basic sentiments** — likes/dislikes from chargen. Comfort foods, weather preferences. Small nudges.
4. **Sleep emotional processing** — overnight attenuation. Better sleep = more reset.
5. **Accumulating sentiments** — coworker resentment, job dread, built from repeated experience.
6. **Trauma sentiments** — high-intensity, processing-resistant. Connected to trauma system.

**Neurochemistry incompleteness:** 28 of ~76+ human hormones modeled. See [REFERENCE-HORMONES.md](REFERENCE-HORMONES.md). Missing: CRH, ACTH, GnRH, aldosterone, estrone, estriol, androstenedione, NPY, substance P, orexins, CCK, enkephalin, adrenaline, and others. Add as their relevant game systems are built.

### Social initiation
Currently friends only send messages to you. No way to text back, call, or initiate contact. Relationships are one-directional. DESIGN.md describes friends who respond differently to your withdrawal and engagement.

### Bills and financial cycle
Money currently only decreases from purchases. No rent, utilities, phone bill, or income. DESIGN.md describes bills arriving on schedule, irregular income for some employment types, and the collision between fixed obligations and variable income. Paycheck deposits. The overdraft. Which bill to skip this month.

### More employment types
Only formal employment exists (office, retail, food_service). DESIGN.md describes: freelance/commissions (irregular work, irregular pay), gig work (apps, deliveries), informal work (cash, no records), unemployed (looking or not), can't work (disability, caregiving, age). Each reshapes what "work" means.

### Ending conditions
Runs never finish. No mechanism for a life ending or the game concluding. What triggers an ending? What does "finished" mean for a game with no win/fail state?

### Leisure and downtime interactions
**Partially implemented.** Four interactions added: lie_there (stay in bed, bedroom), look_out_window (bedroom), sit_at_table (kitchen), go_for_walk (street). All have mood-dependent effects — the same action produces different mechanical outcomes depending on internal state. Still missing: TV, music, reading, mindless phone scrolling — the media/distraction layer. Also no sitting on the couch (no living room), no aimless browsing, no "do nothing" as a distinct street/bus-stop option.

### Cooking and food variety
Only "eat from fridge" and "buy cheap meal." No cooking (time + energy + ingredients), no meals that feel different, no dietary texture. DESIGN.md describes food as deeply personal — comfort food, cultural food, what's in the fridge vs what you need.

### Alarm negotiation
The alarm fires as an event but there's no snooze, no "turn it off and go back to sleep," no choosing not to set one. DESIGN.md describes the alarm as a negotiation between the person who set it and the person who hears it.

### Sleep prose
**Partially implemented.** Sleep prose now has two phases: falling-asleep (how sleep came) and waking-up (the gradient back to consciousness). Waking prose branches on post-sleep energy, sleep quality, alarm vs natural, time of day, and mood — ~40 total variants. Still missing: snooze/alarm negotiation (see "Alarm negotiation" above), insomnia/not-sleeping as a distinct experience, dreaming.

### Apartment mess as autonomous force
apartment_mess exists as a state variable but doesn't grow on its own or meaningfully shape prose beyond event notices. DESIGN.md describes entropy that accumulates by itself — the apartment as a mirror of how you're managing.

### Weather depth
Only 4 weather states, no temperature, no seasonal variation, no weather affecting what you wear or how movement feels. DESIGN.md describes weather as atmosphere — the grey day that sits on you, rain changing what the street feels like.

### Clothing and getting dressed
Outfit prose is static per set. No weather-appropriate clothing, no choosing what to wear, no laundry. DESIGN.md describes getting dressed as a transition from "not yet participating in the day" — the outfit reflecting mood, the easy clothes when you can't decide.

### More phone interactions
Phone is check-only. No scrolling, no specific apps, no compulsive checking vs avoidance as distinct behaviors. DESIGN.md describes the phone as "sometimes the only private space you have" — a richer object than a message viewer.

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
The bus ride is 20 minutes of transition text. Could be its own texture — the specific experience of being a body in transit, the other people, the route, the weather through the window.

### Night shifts and non-standard schedules
All three jobs are day shifts. DESIGN.md doesn't prescribe this. Being awake at 3 AM when the world is asleep is a specific texture.

### Existing systems that need deepening

**Money is a one-way drain.** No income, no bills, no financial cycle. Money only decreases from purchases. At $0, food interactions vanish and nothing replaces them — that's the simulation running out of content, not modeling reality. The fix is the full financial cycle (income, bills, the collision between them) *and* a continuous gradient of what money buys at every level. The experience of money also depends on the person — origin, habits, what scarcity means to someone who grew up with it vs someone who didn't. See "Gradients, not binaries" in DESIGN.md.

**Job standing is mechanical, not social.** Currently: late > 15min = -5 standing. No recovery, no social dynamics, no variation by job type. Standing should be relational — shaped by coworker relationships, patterns (not single events), what the specific job values, whether someone saw you, whether someone covered for you. Being friendly with people at work should matter. Standing should be able to improve, not just decay. See the expanded Work section in DESIGN.md.

**Phone power system could deepen.** Battery now drains by screen time and charges during sleep / via charge_phone interaction. Future: phone model/age affecting battery capacity and drain rate, charge rate varying by charger type (wall vs USB vs car), battery health degrading over the life of the phone. Doesn't meaningfully affect gameplay but deepens the simulation — an old phone with a bad battery is a different daily texture than a new one.

**Idle timer goes silent after 2 thoughts.** Fires at 30s, then 60s, then nothing. Is the silence a problem or a feature? The mind doesn't stop — but the game leaving you alone when you stop engaging could be powerful. Or it could feel like the game broke. This is a design question: should prolonged inaction produce more thoughts (the mind spiraling, the ceiling, the weight of not starting), or should the silence itself be the experience? Probably depends on mood — numb silence feels different from anxious silence.

**Event accumulation and the idle/absence problem.** The event caps (2 per type, then silence) were a bandaid for events piling up during unattended play. The real fix is upstream: handle player absence properly. If nobody's at the screen, the game shouldn't be generating content into nothing — step-away, auto-pause, tab detection. If absence is handled, the accumulation problem dissolves. Deliberate inaction (the player choosing not to act, the weight of not starting) is a different thing entirely and should be supported as a real experience.

Separately, body-state events (hunger, exhaustion) should fire on state *transitions* — you discover you're hungry once, when it crosses into a new tier. After that, the ongoing reality is carried by prose texture, not repeated announcements. Ambient events (pipes, street noise) should habituate — you stop noticing after time in the same place.

Event text should never be reused as a bandaid for not having enough content. Seeing the same text twice is the game breaking the fiction. Reuse is only appropriate when the repetition is genuinely realistic — a sound that recurs, a routine that repeats. Never to fill space.
