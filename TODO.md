# TODO

## Backlog

## Under Consideration

Everything below is drawn from the gap between DESIGN.md and what's built. Not committed to — just visible.

### Mood as its own system
Currently mood tone is derived from state (energy + stress + hunger + social). DESIGN.md describes mood as independent with inertia — it doesn't snap to match conditions. Mood should have its own value that drifts under pressure from state, endocrine rhythms, weather, substances, actions, and inaction. "You can be rested and fed and still heavy."

### Social initiation
Currently friends only send messages to you. No way to text back, call, or initiate contact. Relationships are one-directional. DESIGN.md describes friends who respond differently to your withdrawal and engagement.

### Bills and financial cycle
Money currently only decreases from purchases. No rent, utilities, phone bill, or income. DESIGN.md describes bills arriving on schedule, irregular income for some employment types, and the collision between fixed obligations and variable income. Paycheck deposits. The overdraft. Which bill to skip this month.

### More employment types
Only formal employment exists (office, retail, food_service). DESIGN.md describes: freelance/commissions (irregular work, irregular pay), gig work (apps, deliveries), informal work (cash, no records), unemployed (looking or not), can't work (disability, caregiving, age). Each reshapes what "work" means.

### Ending conditions
Runs never finish. No mechanism for a life ending or the game concluding. What triggers an ending? What does "finished" mean for a game with no win/fail state?

### Leisure and downtime interactions
No TV, music, reading, sitting around, staring at the ceiling, mindless phone scrolling, going for a walk. The daily loop has work and maintenance but no texture of how people actually spend unstructured time. Inaction itself should be an option — not rest, just... not starting anything.

### Cooking and food variety
Only "eat from fridge" and "buy cheap meal." No cooking (time + energy + ingredients), no meals that feel different, no dietary texture. DESIGN.md describes food as deeply personal — comfort food, cultural food, what's in the fridge vs what you need.

### Alarm negotiation
The alarm fires as an event but there's no snooze, no "turn it off and go back to sleep," no choosing not to set one. DESIGN.md describes the alarm as a negotiation between the person who set it and the person who hears it.

### Sleep prose
Sleep quality affects energy recovery mechanically but there's no "how you slept" prose on waking. DESIGN.md describes: falling asleep not being instant, duration varying, waking up as a gradient (fog, snooze, not yet a person), oversleeping, not sleeping.

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
