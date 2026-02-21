# Design Map

Survey of design completeness across all major systems. Distinct from STATUS.md
(which tracks implementation) — this tracks how clear and complete the *design
thinking* is, and where gaps in understanding will block future work.

Ratings:
- **Complete** — design is settled, documented, and well-understood. Could be
  implemented from the docs without significant new design work.
- **Solid** — main decisions made, documented. Some edge cases or approximation
  debts remain, but the core is clear.
- **Partial** — significant design work done, but meaningful gaps remain. Could
  start implementing but would hit unresolved questions.
- **Thin** — design exists in rough outline or scattered notes. Building from here
  requires substantial design work first.
- **None** — no design work done. Exists as an idea or a name.

---

## Simulation architecture / philosophy

**Design clarity:** Complete
**Docs:** docs/design/philosophy.md, docs/design/overview.md (core principles), CLAUDE.md
**Implementation:** Complete

Core principles (gradients not binaries, prose leads simulation follows,
player choices are explicit, no single path, simulation internals hidden) are
well-settled, documented in multiple places, and consistently applied.

**Open questions:** None significant. Occasional edge cases (what counts as a
player choice vs. world consequence) resolved case by case.

---

## Time / body mechanics

**Design clarity:** Solid
**Docs:** docs/design/overview.md (Time, The Body sections)
**Implementation:** Solid — continuous time, tiers, costs implemented

Well-documented design with good implementation. A few known approximation debts:
- Passive energy drains use `hours × 3` universal constant instead of per-body
  rates (standing all shift vs. sitting at desk, pregnancy, chronic pain)
- Time perception in prose (fidelity degradation by distance from last clock
  check) is documented and partially implemented

**Open questions:**
- Energy ceiling for chronic conditions: architecture exists (energyCeiling()),
  conditions are being added. Ceiling interactions with emotional state not fully
  designed.
- Inaction as a first-class experience (sitting and staring, not starting) is
  stated as a design goal but not designed in detail — what does the game show
  you during pure inaction?

---

## Neurochemistry

**Design clarity:** Solid
**Docs:** docs/design/overview.md, docs/design/emotions.md, STATUS.md
**Implementation:** Solid — 8 active + 1 accumulation + 18 placeholder systems

The 8 active systems are well-designed, calibrated to literature (with citations),
and producing the intended prose effects. Biological jitter is clean. The 18
placeholder systems sit at baseline 50 waiting for their game systems.

**Open questions:**
- What activates glutamate, endorphin, acetylcholine, endocannabinoid? These
  need their game systems designed before they can have target functions.
- Endocannabinoid is probably the most tractable near-term (food, cannabis, stress
  regulation). Oxytocin will need social system design work first.
- Some calibration debts remain (noted in TODO.md and research/calibration.md).
  These are implementation debts, not design gaps.
- Estradiol/progesterone/LH/FSH/allopregnanolone — require menstrual cycle or HRT
  system design before activation. No design work on either.

---

## Emotional architecture

**Design clarity:** Solid (5 implemented layers)
**Docs:** docs/design/emotions.md, STATUS.md
**Implementation:** Solid — layers 1–5b implemented

The layered architecture (NT drift → inertia → basic sentiments → sleep processing
→ accumulation + evolution) is well-designed and implemented. Citation tracking
for empirical claims is in-progress (research/calibration.md).

**Open questions:**
- Layer 6 (if there is one) — are there emotional mechanics not yet captured by
  the five layers? Possible candidate: acute emotional responses (crying, panic,
  dissociation as real-time states) vs. the current slow drift model.
- Trauma response: how does a traumatic event register differently from a bad day?
  The slow drift model isn't designed for acute intensity.
- Positive acute states: flow states, joy, moments of genuine connection. The
  current model produces NT levels; whether those levels produce recognizably
  positive experiences in prose is a content question, not answered yet.

---

## Sleep architecture

**Design clarity:** Complete
**Docs:** docs/design/overview.md, STATUS.md
**Implementation:** Complete — debt, cycles, melatonin, quality, alarm all done

One of the most thoroughly designed and implemented systems. Calibrated to PSG
literature with citations.

**Open questions:**
- Alarm negotiation is functional. Extended snooze sequences (snoozing many times,
  sleeping through the alarm entirely) could have more prose depth.
- Nightmares / disturbing dreams: not designed. Sleep processes emotions, but the
  contents of sleep experience aren't surfaced.
- Dreams as an observation/narration mode: mentioned as a possibility nowhere,
  but adjacent to the inner voice system. Out of scope for now.

---

## Social model

**Design clarity:** Partial
**Docs:** STATUS.md, MEMORY.md
**Implementation:** Partial — social + social_energy tracked; 2 friends + 2 coworkers implemented

The social score decay and social energy split are implemented. Friend guilt,
contact timers, and message exchange are well-designed and built. Known design
debts are documented:

**Open questions (documented in TODO):**
- τ (isolation decay rate) not literature-derived. Approximation debt.
- Introversion scaling: no chargen parameter yet. Introverts should recover social
  energy faster in solitude; social interactions should deplete social_energy more.
- Trait loneliness floor: some characters are lonely even when well-connected.
  Requires chargen parameter.
- Parasocial attachment: designed in player-character.md as a simulation debt
  (social score partially maintained, connection quality not). No implementation.
- Family: not designed. Family relationships have a different structure from
  friendships (obligatory, harder to exit, different guilt/warmth dynamics).
- Romantic relationships: not designed at all.
- Casual acquaintances / community: not designed. The neighbor you nod to,
  the barista who knows your order — social texture without full relationship.
- Contact quality vs. contact quantity: parasocial consumption maintains the
  quantity dimension; quality requires genuine reciprocal contact. This
  distinction needs a mechanical home.

---

## Financial system

**Design clarity:** Solid
**Docs:** docs/design/overview.md, STATUS.md
**Implementation:** Solid — full cycle, backstory integration, NT connection

Financial backstory, closed-loop cycle, and NT integration (financial anxiety as
sentiment) are all designed and implemented.

**Open questions:**
- Bill amounts ($65 utilities, $45 phone) are approximations not derived from
  character's housing type, plan, or location. TODO.
- Paycheck structure doesn't vary by job type beyond fixed rates — no overtime,
  no tips (critical for food service), no commission.
- EBT/food stamps: partially designed, $204 approximation. The way EBT actually
  works at the store (SNAP-eligible items only, stigma, card reader UX) isn't
  designed.
- Debt and credit: no design. Many people's financial reality includes credit card
  debt, student loans, medical debt, payday loan traps. Entirely absent.
- Government assistance beyond EBT: housing assistance, LIHEAP (utility help),
  etc. Not designed.

---

## Health conditions

**Design clarity:** Partial
**Docs:** docs/design/health.md, STATUS.md
**Implementation:** Solid for implemented conditions; architecture is good

The constitutional vs. circumstantial distinction is clean and important (see
CLAUDE.md). Chargen model for constitutional conditions (probabilistic) vs.
circumstantial (derived from backstory) is established.

**Implemented:**
- Migraines (constitutional, probabilistic chargen)
- Dental pain (circumstantial — chargen model complete, awaiting backstory)
- Acute illness (flu/cold/GI — episodic, not constitutional)
- Nausea (general-purpose across systems)

**Open questions:**
- Dental chargen is designed but not yet connected to backstory system. The
  `economic_origin` → dental probability is specified but the backstory field
  that should drive it isn't there yet.
- What other chronic conditions are in scope? health.md has a fuller list.
  Color blindness, hearing loss are constitutional. Back pain, RSI, diabetes
  are circumstantial. ADHD, chronic fatigue, autoimmune conditions — some
  constitutional, some partially circumstantial.
- Menstrual cycle / hormonal cycle: not designed. Would activate the dormant
  estradiol/progesterone/LH/FSH/allopregnanolone systems. Many people's daily
  experience is substantially shaped by cycle phase.
- Chronic fatigue (ME/CFS, fibromyalgia): the energy ceiling architecture could
  support this, but the specific mechanics (PEM — post-exertional malaise,
  the way exertion takes days to pay back) aren't designed.
- ADHD: mentioned in health.md? Not sure. ADHD-adjacent mechanics (task
  initiation cost, hyperfocus, rejection sensitivity) would need specific design.
- Pain from injury / chronic pain: the dental pain architecture could generalize,
  but the chargen model (how injury history produces pain) isn't designed.

---

## Substances

**Design clarity:** Solid for caffeine; Thin/None for others
**Docs:** STATUS.md (caffeine section)
**Implementation:** Complete for caffeine; None for others

Caffeine is thoroughly implemented — tolerance, withdrawal, receptor upregulation,
GI nausea, adenosine blocking, sleep interference, habit tracking. A model of how
to do substances right.

**Open questions:**
- Alcohol: has game-relevant effects (sleep quality, anxiety, social, depression
  next day), significant cultural presence in certain lives, and complex withdrawal
  dynamics. High-priority substance to design. No design work yet.
- Nicotine/cigarettes: appetite suppression, anxiety edge-reduction, social
  dimension (smoke breaks), withdrawal. Likely simpler than alcohol. No design.
- Cannabis: effects would interact with endocannabinoid system (dormant).
  Appetite, anxiety, focus, sleep effects. No design.
- Prescription medication: SSRIs, benzodiazepines, stimulants, sleep aids —
  all character-relevant but would require their own system design. The
  antipsychotic question (from player-character.md / did.md) is the highest-stakes
  one. No design for any.
- OTC medication: pain relievers are implemented (take_pain_reliever). Others
  (antihistamines — sedation + anticholinergic effects; decongestants — NE surge)
  are possible near-term additions.

---

## Habits system

**Design clarity:** Solid (Phase 1–2); Thin (Phase 3+)
**Docs:** docs/design/habits.md
**Implementation:** Solid — CART trees, two tiers (suggested/auto), auto-advance

Phase 1 (suggested habits) and Phase 2 (auto-advance) are designed and
implemented. Phase 3 (prose modulation — the character's prose changes to reflect
their habits) is deferred.

**Open questions:**
- Prose modulation: what does it look like when a character has been doing
  the same thing for 30 days? The habit is known, the routine is familiar —
  the prose should reflect that familiarity (less attention, more autopilot). Not
  designed in detail.
- Routine sentiment: stored at chargen but dormant. How does routine preference
  (high-routine characters find deviation more stressful) connect to the habit
  system? Not connected.
- Breaking habits: the system models formation and reinforcement. Breaking a habit
  is just low prediction confidence — but does something happen when a strong
  habit is disrupted repeatedly?

---

## Prose generation

**Design clarity:** Partial (architecture); Thin (full system)
**Docs:** docs/design/prose-generation.md (self-described "very incomplete"),
  docs/design/senses.md, docs/design/triggers.md
**Implementation:** Partial — NT shading done (67 sites converted), compositor rough

This is the biggest gap between design vision and documented understanding.
The three-layer NT shading pattern is well-designed and fully implemented.
The broader prose generation architecture — how the system decides what to say,
in what order, across a session — is not well-designed.

**What's documented:**
- NT-shading pattern: moodTone() coarse selector + weightedPick variants +
  deterministic modifiers. Complete and implemented.
- Observation model (senses.js): sources, salience, habituation, change detection.
  Design exists, implementation exists.
- Trigger model: triggers.md exists but is thin.

**Open questions (many):**
- Prose continuity: how does the game maintain coherence across a session? If
  you've mentioned the weather three times, the fourth mention should be different.
  No design.
- Inner voice / intrusive thoughts: typography is described (italic, intensity
  tiers, tremor animation). But what triggers inner voice? How does it relate to
  narration? Not designed beyond typography.
- The observation → prose pipeline: senses.js produces observations. How do they
  become prose? The compositor is rough. No clean design.
- Location description vs. idle thought vs. action result — these are currently
  independent systems. How they interleave across a session isn't designed.
- Prose memory: has the game mentioned X recently? Repetition avoidance beyond
  "don't reuse text" isn't designed.
- Silence and absence: what happens when there's genuinely nothing to say? Not
  designed.
- The relationship between prose length and state: exhausted characters should
  produce shorter, sparser description. Not designed as a system.

---

## Sensory model

**Design clarity:** Partial
**Docs:** docs/design/senses.md, STATUS.md (senses.js section in MEMORY.md)
**Implementation:** Partial — sources, salience, habituation, change detection done

senses.js has 21 observation sources, threshold model, habituation, change
detection. The selection model (which observations surface at any moment) is
implemented.

**Open questions:**
- Sound dimensions: `sound.quality` is a dead property — `augmentNT()` reads only
  `perceived_intensity` and `intelligible`. Orthogonal dimensions needed: pitch
  (high/low/variable), rhythm (steady/intermittent/irregular), texture
  (pure/complex). These would map to NE/GABA/adenosine flags. Not designed.
- Acoustic adjacency: not designed. Currently each location has independent sound
  sources. In reality, sound crosses rooms — the neighbor's TV, the upstairs
  footsteps, the street through windows. Weighted graph model (flooring, openness,
  voids) is in TODO but not designed.
- Long-term habituation: currently per-session. A familiar apartment should be
  more habituated than a new one. Not designed.
- Olfactory and proprioceptive channels: exist in senses.js? Not sure. Not
  prominent in current prose.

---

## Domestic objects

**Design clarity:** Solid
**Docs:** docs/design/objects.md
**Implementation:** Solid — dishes, linens, clothing all implemented as object systems

The shift from aggregate scalars to object state (mess as emergent from tracked
objects) is complete. Dishes, linens, clothing are all real objects with history.

**Open questions:**
- Fridge food is still a scalar (fridge_food integer). Item identity would enable
  things like "the thing in the back of the fridge you bought last week" or
  different eating interactions for different foods. Not designed.
- Mail: physical mail exists in real life (bills, notices). Not designed.
- Personal objects with histories: a book you're halfway through, a plant you're
  neglecting. Named objects with state that accumulates. Not designed.
- Objects as memory: your grandmother's lamp. The mug you got at that one place.
  Objects as emotional history. Not designed.

---

## World / locations

**Design clarity:** Partial
**Docs:** docs/design/overview.md (There is no single path section)
**Implementation:** Solid for 7 locations — home + street + bus_stop + corner_store + workplace × 2

7 locations are well-implemented with NT-shaded descriptions. The "no single path"
principle is applied to the home → work journey.

**Open questions:**
- More locations: laundromat (for characters without in-unit laundry), food bank,
  library, hospital, clinic, pharmacy, community center. Each represents a
  different class of life and is mentioned in the design vision.
- Location-specific acoustics: different locations have different acoustic
  characters (library vs. food service kitchen vs. open plan office). Not designed
  as a system.
- Neighborhood texture: the character's street, their building, what they can see
  from their window. Currently abstracted. Could be more specific.
- Transit: bus journey is treated as an instantaneous move. The wait, the ride,
  the people on the bus — these are time that happens somewhere. Not designed.
- The building: the character's apartment building contains other people (upstairs
  neighbor, the person you pass in the hallway). Currently invisible.

---

## Character generation

**Design clarity:** Solid
**Docs:** STATUS.md, MEMORY.md, chargen.js
**Implementation:** Solid — backstory, financial simulation, conditions (partial)

Backstory produces economic origin, career stability, life events → financial
parameters + personality nudges + starting sentiments.

**Open questions:**
- More backstory depth: family structure, education details, geographic history
  not yet feeding into parameters. Rent varies hugely by geography — the backstory
  doesn't yet account for this.
- Identity parameters: gender, sexuality, race/ethnicity — not at chargen. These
  are not stats; they're axes that shape what the character's world looks like
  (what's available, who they encounter, how they're treated). Not designed.
- Relationship history: who the two friends are, how you met, how long you've
  known them — generated at chargen as names and flavors, but backstory doesn't
  feed into relationship character yet.
- The hidden backstory modes (never shown / shown+sealed / shown+kept) are
  designed in player-character.md but not implemented.

---

## Identity, plurality, and player-character relationship

**Design clarity:** Partial (design extensive; implementation: zero)
**Docs:** docs/design/player-character.md, docs/design/did.md
**Implementation:** None — everything here is design documentation only

player-character.md is now extensively documented: distance collapse mechanisms,
hidden backstory modes, amnesia, DID (discovery, co-fronting, antipsychotics),
median systems, headmates (tulpas, endogenic, walk-ins, soulbonds, writer's
characters, roleplay bleed), parasocial, fan communities, RPF.

**Where design is solid:**
- The through-line principle (player has no more information than character)
- The three hidden-backstory modes
- DID discovery mechanics (action log gaps, masking as the tell, name-without-context)
- Antipsychotics as structural system change, not NT modifier

**Where design is thin:**
- Mechanically: how does DID chargen work? Prevalence, multi-alter parameter sets,
  which alter fronts at start, how switching is triggered.
- Co-fronting mechanics: two NT parameter sets simultaneously. Needs design.
- Parasocial: how does it interact with social_energy and social decay? Design note
  exists ("social score partially maintained, connection quality not") but not
  specified.
- Fan communities as social structure: social score contingent on shared object
  stability. How does rupture actually propagate mechanically?
- Non-trauma plurality: chargen model is described as "different" but not designed.

**Extension points (no design work at all):**
- Chronic illness and disability beyond what's in health.md
- Gender and transition (external legibility, social navigation load)
- Race and social navigation (reading/being read, code-switching)
- Class performance (code-switching across class contexts)
- Religion and apostasy (meaning structure, community, leaving)

---

## Relationships

**Design clarity:** Partial (friends); Thin/None (others)
**Docs:** STATUS.md (friend mechanics), player-character.md (parasocial, fan communities)
**Implementation:** Solid for 2 friends; Partial for coworkers; None for others

**Friends:**
Two friends implemented with message exchange, guilt, contact timers, reply/initiate
mechanics, flavor-differentiated prose. Solid design and implementation.

**Open questions:**
- More than 2 friends: the current model assumes exactly 2 friends and hard-codes
  slots. Expanding to variable friend count needs design.
- Friend relationships with depth: the current model has flavor but not history.
  Things you've talked about, inside references, the arc of a friendship over time.
- Friendship in stress: what happens to a friendship during a hard period? Are
  there mechanics for friends pulling away, or the character being unreachable?

**Family:** Not designed. Family has a different structure from friendship —
  usually obligatory, harder to exit, different guilt dynamics, often complicated
  by class/identity. High-value design area.

**Romantic:** Not designed at all. The loneliness model doesn't distinguish
  between single/partnered. Entirely out of scope currently.

**Coworkers:** 2 per job type, warmth/irritation sentiments, chatter mechanics.
  Functional but thin — coworkers don't feel like people, just sentiment vectors.

**Acquaintances / community:** Not designed. The neighbor, the barista, the
  person you see at the bus stop every day — recognized but nameless, weak ties
  that are part of social texture. No design.

---

## Content volume

**Design clarity:** N/A
**Docs:** content.js (7,500+ lines)
**Implementation:** Substantial but always incomplete

Interactions, idle thoughts, event text, location descriptions, approaching prose
— all exist and grow. Content is never "done."

**Known thin areas:**
- Weekend / non-work day content: most interactions are designed around work days.
  What does a Saturday with nothing to do look like?
- Late-night content: the 2–4 AM space is thin.
- Payday content: the paycheck arrives; there could be more to do with that money.
- Friend relationship depth: friend messages are flavor-driven but don't reference
  shared history or the character's current situation.
- Employer / supervisor interactions beyond the nag message.
- The EBT store experience: shopping on SNAP has specific texture (eligible items,
  card reader, sometimes judgement from people in line) that isn't in the content.

---

## Technical architecture

**Design clarity:** Complete
**Docs:** CLAUDE.md (architecture section)
**Implementation:** Complete — PRNG, replay, IndexedDB, multi-run all solid

No significant design gaps. Known implementation debts (fragment system retirement,
acoustic adjacency when designed) are tracked in TODO.md.

---

## Summary

Systems by design clarity:

| System | Design | Implementation |
|---|---|---|
| Architecture / philosophy | Complete | Complete |
| Time / body | Solid | Solid |
| Neurochemistry | Solid | Solid |
| Emotional architecture | Solid | Solid |
| Sleep | Complete | Complete |
| Financial | Solid | Solid |
| Domestic objects | Solid | Solid |
| Habits | Solid (phase 1-2) | Solid |
| Social model | Partial | Partial |
| Health conditions | Partial | Partial |
| World / locations | Partial | Solid for 7 |
| Character generation | Solid | Solid |
| Sensory model | Partial | Partial |
| Substances | Solid (caffeine) / None (others) | Solid (caffeine) |
| Relationships | Partial (friends) / None (others) | Partial |
| Prose generation | Partial (NT shading) / Thin (architecture) | Partial |
| Identity / plurality | Partial | None |
| Technical architecture | Complete | Complete |

**Biggest design gaps (where building would require design work first):**
1. Prose generation architecture — how the system maintains coherence and continuity
2. Acoustic space — sound dimensions and adjacency model
3. Relationships — family, romantic, community (acquaintances)
4. Substances — alcohol, nicotine, prescription medication
5. Identity / plurality — mechanically thin despite extensive conceptual design

**Richest design areas relative to implementation:**
- player-character.md (extensive docs, zero implementation)
- Financial system (solid design, most of it built — further expansion needs
  upstream design work on debt, credit, assistance)
