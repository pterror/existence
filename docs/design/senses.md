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
- **Aversive involuntary responses** — nails on a chalkboard, certain frequencies, styrofoam squeaking. Nearly universal but varies in intensity. Full-body cringe, goosebumps, visceral aversion — the response is partly auditory, partly physical. Misophonia is the extreme end. Connects to the agency gradient: fully involuntary, no choice involved.

## Taste

### The basics

Food tastes good, bad, or somewhere in between, and the character notices:
- Too salty, too sour, too bitter, too sweet, too bland
- A mistake in cooking (too much vinegar, burnt edge, underseasoned)
- Favorite foods — genuinely pleasurable; the specific satisfaction of something you actually wanted
- Repetition degrading experience — rice and soy sauce is fine; rice and soy sauce every day because it's all you can afford is a small daily grinding. The food hasn't changed; the accumulation has. Connects taste directly to the financial simulation and the poverty of constrained options.

**Heat transformation** — cooking method changes the sensory experience fundamentally:
- Maillard reaction: browning, crust, grill char — deeply appealing, complex, almost universally liked
- Caramelisation: sugar browning, adjacent chemistry, similar appeal
- Burnt: the same process pushed too far — acrid, bitter, ruined; the line is thin and specific
- Boiled everything: what you do when you can't waste anything or lack equipment. Cheaper, safer, but misses the Maillard reaction entirely. A poverty note — dry heat and fat both cost something.
- **Rendering** — fat melting out of itself; waxy becomes liquid, leaves crackling behind
- **Reduction** — liquid cooking down, concentrating flavour; volume shrinks, intensity increases
- **Smoking** — low and slow, smoke penetrating; the flavour is almost a smell as much as a taste
- **Searing** — fast, high heat, aggressive surface crust; Maillard but compressed and violent
- **Braising** — long, wet, low heat; collagen breaking down to gelatin; tough cuts becoming tender
- **Steaming** — clean, preserves the ingredient's own flavour; nothing added, nothing transformed by browning
- **Frying** — fat as the cooking medium. Pan frying: shallow oil, Maillard on the contact surface. Deep frying: fully submerged, even crust all around, specific richness. Air frying: forced hot air, minimal oil, crispy but drier and less rich than deep frying — a different result despite the name.

Not an exhaustive list — cooking methods are many, and each produces a distinct sensory outcome. Each is also a class and equipment marker: smoking requires time and setup, braising requires time and the right cut, deep frying requires oil volume and temperature control. What methods a character uses reflects their resources, knowledge, and background.

**Food degradation** — food has states, and the wrong state is its own sensory experience:
- Soggy: something that should be crispy isn't. Cereal in milk too long, fries that sat, bread that absorbed moisture. The crunch was the point.
- Stale: slow moisture loss. Bread going tough, crackers losing snap, chips going soft. Opposite direction from soggy, similarly wrong.
- Slightly off: detectable but deniable. Milk that's borderline. The smell when you open something and you know immediately. Food that was fine yesterday and today is wrong in a way you can't place.
- Visibly spoiled: mould, discolouration, the obvious.
- The poverty angle: eating something borderline because throwing it out isn't an option. The calculus of risk vs. waste. The game should be honest about this.

**Texture** is distinct from taste but part of the eating experience:
- Fat texture (some people can't eat visible fat; the mouthfeel is the problem)
- Mushy vegetables, gritty, slimy, stringy, chewy, crunchy
- Temperature (cold chips, lukewarm soup — wrong temperature changes the whole thing)
- Texture aversions are often strong and non-negotiable; not preference but genuine sensory rejection

### What else the game world produces

Mostly tied to eating and drinking — but not entirely:

- **Morning mouth** — taste before the day starts, before food or drink
- **Dry mouth** — caffeine, dehydration, anxiety, certain medications
- **Metallic taste** — anxiety, blood (bitten cheek, split lip), some medications, low blood sugar
- **Medication aftertaste** — specific and often unpleasant; lingers
- **Smoke** — cigarettes, someone else's smoke
- **Tap water** — flat, slightly mineral, varies by place; bottled water tastes different; filtered water different again
- **Nausea making things aversive** — even neutral tastes become wrong

### Acquired tastes

Acquired tastes are the *opposite* of habituation. The comfort sentiment system diminishes with repeated exposure; acquired tastes invert — aversion becomes tolerance becomes preference through repeated exposure.

Examples: durian, bitter gourd, spice, red wine, beer, coffee, olives, blue cheese. What counts as "acquired" is relative to upbringing — someone who grew up eating bitter gourd doesn't experience it as acquired, it's just food.

The process is social as well as physiological — you're more likely to acquire a taste for something consumed in positive social contexts. The association attaches to the substance via the experience.

**Spice is a special case:** capsaicin tolerance is partly physiological — repeated exposure desensitises TRPV1 receptors. Spice "acquisition" is a literal change in how the body processes the stimulus, not just a preference shift. Reverses with extended absence — tolerance drops without maintenance.

Mechanically: acquired tastes need the sentiment system to handle both directions (habituation down, acquisition up). Food sentiments generated at chargen reflect upbringing and culture; acquired tastes are the mechanism by which those sentiments change through play.

### Cultural dimension

What tastes like home vs. what tastes foreign is an identity marker, not just a preference. A character eating food from their culture of origin in a context where it's not available experiences something different from just "eating familiar food." What tastes wrong (too sweet, too bland, wrong spices) is determined by what the character grew up with.

### NT modulation
- Adenosine high → taste flattens; everything slightly muted
- Hunger → taste sharpens; first bite when genuinely hungry is different from eating out of habit
- Depression/anhedonia → taste flattens; food loses its quality (this is a real symptom, not metaphor)
- Nausea → neutral tastes become aversive; the texture of things changes
- Anxiety → metallic edge; appetite suppressed

### Character-side conditions
- **Anosmia** (no smell) — guts taste significantly since smell and taste are deeply linked; most of what we call "taste" is actually retronasal smell
- **Ageusia** — no taste
- **Hypogeusia** — reduced taste
- **Phantogeusia** — taste that isn't there, often metallic or bitter; can be medication side effect, neurological, or COVID-related

### Chemical and thermal mouth sensations

Taste/touch overlap — physical sensations that happen inside the mouth during eating:

- **Bromelain (fresh pineapple)** — the enzyme digests soft tissue; the tongue and roof of the mouth go tingly and slightly raw after eating enough. The pineapple eating you back. Cooking or canning deactivates it — only fresh pineapple does this.
- **Scalding (coffee, tea, hot food)** — burning the tongue or roof of the mouth from not waiting. Inside, can't pull away, damage already done. The roof of the mouth goes slightly numb and peely for a day or two. Impatience made physical. Almost universal experience.
- **Capsaicin** — chemical irritant, not just heat perception; triggers the same TRPV1 receptors as actual heat; the burn is real even though nothing is hot. Builds tolerance with exposure (see acquired tastes).
- **Carbonation** — CO2 dissolving into carbonic acid on the tongue; the tingle is mild chemical irritation, not just bubbles

### Still to think about
- Full interaction with the food/cooking system
- Taste memory — specific tastes tied to specific memories (Proustian, same as smell)
- Texture as part of the eating experience (overlaps with touch)

## Touch / Tactile

*Revisit for fuller treatment — empathetic responses noted below, thermoception overlaps, pain overlaps with nociception.*

### Texture

**Pleasant textures:**
- Silkiness, smoothness — generally pleasant but too-smooth can be a trigger for some (velvet against the grain, peach skin, squeaky-clean glass); the mechanism isn't fully understood but the aversion is consistent
- Quality-associated textures: denim, leather — haptic vocabulary for material and craft; touching something well-made feels different
- Soft textures: cotton, fleece, pet fur (variable — a cat's belly vs. a dog's rough coat)
- Clean sheets — texture, temperature, and smell arrive together; the full state of the bed

**Aversive/interesting textures:**
- Grittiness, roughness, sandpaper — especially when abrasive enough to catch or hurt skin
- Corrugations and ridges — binder spines, cardboard, ribbed surfaces. Running a finger or nail along them produces tactile and sound simultaneously; the two channels are the same event and can't be cleanly separated. Cross-sensory by nature.
- Carpet burns — friction trauma from ordinary surfaces
- Wet socks — specific, immediately wrong
- Wet hands touching dry fibrous material (paper, cardboard) — instant aversion
- Sticky surfaces
- Seams in socks, tags in clothing — minor for most, unbearable for some; strong sensory processing dimension

**Heat conductivity:**
Metal, stone, wood, and fabric at the same ambient temperature feel completely different because of how fast they pull heat from skin. A marble floor in winter. A metal handrail. A wooden table. This is a property of the material, not the environment — worth framing as conductivity, not temperature.

**Weight and pressure:**
- Heavy blanket vs. thin one — weight as comfort or oppression depending on state
- The specific coldness of a toilet seat
- Tight clothing vs. loose

**Itchiness:**
- From fabric, dry skin, healing wounds, insect bites — varies in character; a healing itch is different from a fabric itch

**Sudden pain from ordinary objects:**
- Stubbing a toe, catching a nail, a paper cut — disproportionate response to minor contact; familiar enough to be almost comic, sharp enough to break concentration entirely

### Empathetic/vicarious responses
Watching someone get hit in the groin, seeing someone stub their toe, witnessing an injury — genuine involuntary physical response in the observer. Not your pain but your body responds anyway. Mirror neuron phenomenon. Connects to empathy, interoception, and the social dimension of sensory experience. Fully involuntary — agency gradient applies.

### NT modulation
- NE high → touch more present; fabric against skin more noticeable; minor irritations harder to ignore
- GABA low → sensory input harder to filter; texture aversions intensified
- Cortisol high → physical tension held in body; touch on tense muscles different from touch on relaxed ones
- Adenosine high → heaviness, the specific weight of tired limbs; surfaces feel further away
- Depression → touch can feel muted, distant, or conversely the only thing that lands

### Still to think about
- Thermoception (temperature as a sense) gets its own section — overlaps here but distinct enough
- Pain gets its own section (nociception)
- Sensory processing differences (autism, SPD) — some people have globally heightened or dampened tactile sensitivity; seams and tags are the common example but the pattern is broader
- Touch as social/relational (a hand on the shoulder, a hug, physical contact with another person) — different category from environmental touch

## Thermoception

Distinct from touch — not about surface contact but about the ambient thermal environment and the body's own thermal state and regulation.

### Ambient temperature

**Cold:**
- The specific chill of an unheated room
- Stepping outside into winter — air temperature vs. wind chill (wind strips the warm air layer from skin)
- Cold that's refreshing vs. cold that's numbing vs. cold that's dangerous
- Fingers going cold first — vasoconstriction pulls blood to the core; extremities are sacrificed

**Heat:**
- Summer heat that sits on you and doesn't release at night
- The first genuinely warm day in spring — same temperature as autumn but reads differently
- Heat that's pleasant vs. oppressive vs. dangerous
- Radiant heat (sun, fire, radiator) vs. ambient heat (hot room) — different in character

**Humidity changes everything:**
- Dry cold is different from damp cold — damp penetrates
- Dry heat is different from humid heat — humid heat prevents sweat from evaporating, the body's cooling mechanism fails
- The same 30°C reads completely differently with and without humidity

**Seasonal texture:**
- The specific quality of cold that means winter is actually here
- Summer heat accumulating through the day
- The smell of season change (overlaps with smell — petrichor, dry leaves, frost)

### The body as active regulator

Temperature isn't passively received — the body is constantly working:
- Shivering (involuntary heat generation)
- Sweating (the body running hot before conscious awareness catches up)
- Seeking shade, warmth, water — driven behaviour, not just preference
- The discomfort that makes you move before you've decided to

### Contact with hot surfaces

A spectrum with different qualities at each point:

- **Pleasantly hot** — a hot shower, warm water on cold hands, heat from a radiator. Sought, deliberate, comforting.
- **Uncomfortably hot** — the shower slightly too hot but you stay in anyway. The mug too warm to hold but you manage.
- **Reflex territory** — touching a hot pan, the kettle, a hob. The hand pulls back before the brain has processed it. Spinal reflex arc, not a decision. Zero agency — one of the clearest examples of the body acting without the player. Aftermath: adrenaline spike, shaking hands, checking whether you actually burned yourself, the specific anxiety of having nearly hurt yourself with something ordinary.
- **Sustained contact** — scalding water you can't immediately escape, open flame. Actual tissue damage. Keeps happening rather than resolving with a reflex.
- **Pain delay** — serious burns sometimes don't hurt immediately; nerve endings are damaged. The moment of contact feels wrong but not painful, then it catches up. That gap is its own experience.

### NT modulation
- High cortisol/stress → physical tension affects how temperature registers; cold feels colder
- Depression → thermal discomfort may not prompt action; staying cold or too hot without moving
- Adenosine high → less responsive to ambient discomfort; thermal signals don't surface as urgency
- Anxiety → hot flushes, sweating without thermal cause; the body generating heat from internal state

### Character-side conditions
- **Raynaud's phenomenon** — vasospasm in extremities triggered by cold or stress; fingers/toes go white then blue then red; painful. Constitutional or secondary to autoimmune conditions.
- **Anhidrosis** — inability to sweat; dangerous in heat; can be medication side effect or neurological
- **Heat intolerance / cold intolerance** — associated with thyroid conditions, MS, menopause, various medications
- **Fever** — not a chronic condition but a state; the specific wrongness of running hot from illness, chills despite warmth, the unreality of high fever

### Still to think about
- Thermoregulation and sleep (body temperature drops to initiate sleep — connects to sleep system)
- Acclimatisation — the body adjusting to a new climate over weeks; what was cold becomes normal

## Proprioception
*— not yet covered*

## Interoception
*— not yet covered*

## Nociception (pain)
*— not yet covered*
