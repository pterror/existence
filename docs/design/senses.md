# docs/design/senses.md

Design notes on sensory prose — what the game world produces in each sensory channel, and how state shapes what surfaces to attention.

This feeds the prose compositor system (see docs/research/prose-construction.md) and the trigger model (see docs/design/triggers.md).

---

## Core principles

**Noticeability, not intensity.** The threshold for prose mentioning a sensory fact is not that it's strong — it's that it's *noticeable*. Salience, not magnitude. Petrichor isn't intense but it surfaces to attention. The smell of your own apartment after days away is subtle but tells you something.

**Noticeability is relational.** The same sensory fact is more or less noticeable depending on the character's current state. This is not a fixed property of the stimulus — it's a relationship between stimulus and state.

**Agency is on a gradient.** When a stimulus is ambiguous or NT state doesn't clearly determine a response, the player gets a choice. But trauma can override that choice — the response fires regardless of player intent, probability scaling with trauma intensity, resolved by PRNG (deterministic/replayable but not guaranteed). NT state mediates the baseline: high cortisol/NE primes threat response, making involuntary firing more likely even without trauma. Full voluntary control at one end, fully involuntary at the other — NT state and trauma determine where on that spectrum a given moment lands.

**Senses are the surface; meaning is relational and historical.** What a character notices, and what it means when they do, depends on who they are and where they've been. Meeting someone from a different culture, noticing someone who stands out, navigating a language barrier — these are sensory experiences with a relational and cultural layer underneath. The prose has to know both. A flag ("is deaf", "speaks accented English", "grew up elsewhere") is not enough — the character's history and identity shape what the sensory fact costs them, what it means, how they carry it. This applies across all senses: the condition is the surface, the relationship to it is the substance.

NT modulation of noticeability:
- Hunger → food smells and sights surface that would otherwise be ignored
- NE high → everything more present; sensory input harder to screen out
- Adenosine high → sensory input flattens; things recede
- GABA low → can't filter; minor sensory facts intrude
- Dopamine low → things that would normally register (the coffee brewing) may not

---

## Smell

### What the game world produces

**Social signals** — carry information about another person, not just atmosphere:
- Cologne or perfume (noticeable amount)
- Tobacco smoke on someone's clothes or breath
- Alcohol breath (theirs or your own, morning after)
- Other breath (general proximity)
- Sweat (crowded transit in summer, after exertion)

**Interaction-tied** — inseparable from a specific action or state:
- Vomit (after being sick)
- Coffee brewing
- Old food or trash in the apartment (when it's crossed a threshold)
- The smell of your own bed after sleeping too long in it
- Cleaning products — bleach, disinfectant; clinical, effortful

**Locational/ambient** — ambient to being somewhere:
- Freshly baked bread or fresh fruit (market, supermarket)
- Dumpsters / refuse (alley, back of building)
- Rain / petrichor (outside, just after rain starts or stops)
- Exhaust / bus fumes (transit, busy road)
- Mildew (bathroom, old building)
- Fresh air contrast when stepping outside from a stuffy interior

### Still to think about
- How smell interacts with memory (Proustian — certain smells are character-specific loaded)
- Character sentiments toward specific smells (someone who loves petrichor vs. finds it oppressive)
- Smell as absence (the apartment smells wrong — something missing, or something added)

---

## Sight

### Two layers

**World-side:** what's visually noticeable out there — light quality, glare, movement, people who stand out in context.

**Character-side:** how this character's visual system works — shapes not just noticeability but the entire baseline rendering of the world. Not occasional events; the constant.

### What the game world produces (world-side)

**Light:**
- Quality: time of day (golden hour, flat noon, dusk, 3am dark), weather (grey flat light vs. harsh sun)
- Glare: windshields, wet pavement, screens, water surfaces
- Screen light in a dark room — too bright, specific colour temperature

**Movement:**
- Things catching peripheral attention: someone passing, a bird, a car pulling out
- Stillness that should be movement (empty street at a time it shouldn't be)

**People who stand out in context:**
- Noticeability here is context-dependent and character-dependent — what's unusual in this space, for this character
- Examples: visible disability, pregnancy, very old age, unusual height, albinism, racial visibility depending on context
- Not a fixed property of the person — a function of who's noticing and where

**Visual noise / clutter:**
- Mess in the apartment (visual disorder)
- A busy environment where too much is competing for attention

### Character's visual system (character-side)

These are constitutional conditions — assigned at chargen, grounded in prevalence. They shape all visual prose for this character, not just notable moments.

- **Myopia** — distance blurs; close vision fine; glasses/contacts as daily object
- **Presbyopia** — age-related; close things blur; reading glasses
- **Astigmatism** — blurring, distortion, halos around lights especially at night
- **Deuteranopia / other colour blindness** — red-green or other channel absent; changes every colour description
- **Monochromatism (achromatopsia)** — complete colour blindness; world in greyscale
- **Tetrachromatism** — four cone types instead of three; perceives colour distinctions others don't
- **Visual snow syndrome** — static overlay on vision, always present; busy environments intensify it
- **Glaucoma** — peripheral vision loss, tunnel vision; mostly age/circumstance-related (see circumstantial note)
- **Blindness** — partial or full; prose renders accordingly

**Sensory overload:** for visual snow, or characters with sensory processing differences, a visually busy environment is not just busy — it's actively overwhelming. Distinct from NT-modulated noticeability.

### Cultural/relational conditions

Some conditions that touch on senses are actually cultural and relational — the prose has to know which.

**Deaf / Deaf community:** Not just "can't hear" — what is this character's relationship to sound and to Deaf culture? Grew up signing (BSL, ASL, other)? Oral deaf? Cochlear implant with complicated feelings? Late-deafened? Deaf (capital D, cultural identity) vs. deaf (audiological condition). Affects communication, social costs, which spaces are designed for them. Belongs in identity/culture system as much as senses.

**Language barriers:** A character navigating a language they don't speak fluently — ambient speech becomes texture not content, signs become visual noise, half-understood conversation is actively exhausting. What is their relationship to the language? First-generation immigrant? Grew up bilingual but thinks in one? Accent that marks them in certain spaces? Not just a sensory parameter — cultural and relational.

Both follow the same pattern: the condition shapes sensory experience, but the full picture requires knowing the character's history and identity, not just a flag.

### NT modulation
- NE high → movement in periphery intrudes; edges sharpen; visual detail too present
- Adenosine high → colours flatten, edges soften, things recede
- Dissociation → visual input arriving but not landing; objects losing significance
- Low dopamine → things that would normally catch attention don't register

### Floaters, afterimages, light sensitivity

Character-side phenomena, not world-side:

- **Floaters** — vitreous floaters; nearly universal but mostly filtered out. Surface to attention against bright uniform backgrounds (sky, white wall, screen). A nice example of noticeability-is-relational: always there, usually invisible.
- **Afterimages** — complementary colour image persisting after staring at something bright. Universal.
- **Light sensitivity (photophobia)** — constitutional for some characters; circumstantial for others (migraine, hangover, certain medications). At its worst, bright light is actively painful.

### What surfaces to attention (world-side, continued)

**Light conditions:**
- Dense fog — limits the visual field structurally; the world ends earlier than expected
- Streetlights at night — pools of orange/white light, the specific quality of artificial light on wet pavement
- Shade under a tree — coolness implied by the visual, dappled movement
- Dark alley — limited visibility plus immediate threat assessment

**Visually significant things:**
- Sculptures, art installations, landmarks (natural or artificial) — catch attention because they're visually distinct from context
- Seasonal: cherry blossoms, autumn leaves, flower gardens — distinct enough to surface unprompted
- Parades, public events — visual density, movement, colour

**Threat detection:**
- Someone following behind you — starts as a visual pattern, something unresolved in peripheral vision (same person appearing twice, a gait that matches yours too closely). Becomes a threat response.
- The response is not fixed: NT state (high cortisol/NE primes it), trauma (can trigger involuntary response regardless of player intent, probability by PRNG), and absent either, the player gets a choice. The same visual fact reads completely differently depending on who's noticing and where — a function of history, context, and current state.

### Still to think about
- How character sentiments affect what they visually notice (someone who loves architecture notices buildings)
- Glasses/contacts as daily objects with states (lost, dirty, forgotten, broken)
- How visual conditions interact with environments (astigmatism + night driving; myopia + unfamiliar space)
- Environment as visual context (urban/rural, architecture era, season) — this is world design but meets senses at the point of what's salient

## Sound

### What the game world produces

**Ambient indoor — present but filtered:**
- Appliances: fridge hum, coil whine from electronics, heating/AC
- Building: pipes, elevator, neighbors (footsteps, music, voices through walls)
- Own space: TV on in another room, radio, the specific quality of silence in a familiar room

**Ambient outdoor:**
- Traffic: general road noise, passing trucks (felt as much as heard — physical pressure, brief vibration)
- Weather: rain on windows, wind
- Nature: birds (time of day, season)
- People: street conversations, music from a passing car

**Overwhelming environments** — where sound is the dominant physical fact, changes behavior:
- Busy road: a passing truck makes conversation impossible for three seconds; you lean in to talk
- Concert: bass felt in the sternum, crowd heat and press, sound as a physical environment not just a perception

**Latent-until-noticed** — always present, surfaces when state crosses a threshold:
- Coil whine (electronics)
- Fridge hum
- HVAC / building ventilation
- Tinnitus (for characters who have it — always there, louder in quiet)

**Social/communicative:**
- Phone notifications
- Alarm
- Someone's phone on speaker nearby (public)
- Overheard conversation (transit, café)

**Silence** — the absence of expected sound is itself a sensory fact:
- 3am quiet
- Coming home to an empty apartment
- The moment after a loud environment

### NT modulation
- NE high → sounds intrude; edges sharpen; small sounds too present; harder to screen out
- GABA low → can't filter; the fridge hum, the coil whine, all of it competing
- Adenosine high → sounds recede; things that would normally register don't
- Dissociation → sounds present but not landing, arriving from a distance

### Still to think about
- Sound as physical sensation (bass, passing trucks) — overlaps with touch/proprioception
- Character sentiments toward specific sounds (someone who finds rain calming vs. oppressive)
- The specific texture of silence for a character who lives alone vs. one used to noise

## Taste
*— not yet covered*

## Touch / Tactile
*— not yet covered*

## Thermoception
*— not yet covered*

## Proprioception
*— not yet covered*

## Interoception
*— not yet covered*

## Nociception (pain)
*— not yet covered*
