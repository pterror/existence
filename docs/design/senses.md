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

**Constitutional conditions shape baseline rendering, not just notable moments.** A myopic character's prose about anything at distance is always different — not flagged as an event, just the world as they see it. Visual snow is always there. Low interoceptive awareness means hunger consistently fails to fire clearly. Anosmia means food smells simply don't exist. These conditions must be stored at chargen and wired into all prose for that character, not treated as occasional modifiers.

**The body knows before the mind.** Interoceptive signals precede conscious recognition. Anxiety is a tight chest before it's a thought. Hunger is irritability before it's noticed. NE is sharpened edges before "I feel alert." Prose should render the body first — don't name the emotion, render the signal the body is sending.

**Dose makes the poison.** Pleasant or interesting sensations become damaging at excess. Pineapple tingles then bleeds. Spice warms then burns. Sound at concert volume is immersive then harmful. Heat is comforting then scalding. This is not a special case — it's a general property of sensory systems. The threshold is personal and trained.

**Cross-sensory coupling is the norm, not the exception.** Many sensory experiences are inherently multi-channel: food involves taste + smell + texture + temperature + sometimes sound (the crunch, the sizzle). Corrugations are touch + sound simultaneously. A concert is sound + physical vibration + heat + visual density. The prose compositor must treat multi-channel as the default case, not a special one.

## The fragment spec — preventing ad-hoc mess

Every sensory fragment, regardless of which sense it belongs to, has the same shape. The sense is metadata, not architecture. Building separate systems per sense produces mess; a consistent spec and authoring discipline prevents it.

**Every sensory fragment carries:**
- `content` — the authored text (clause, phrase, or fragment)
- `grammatical_type` — main clause, participial, absolute, adverbial, fragment, appositive
- `rhetorical_tag` — cause, temporal, simultaneous, contrast, continuation
- `channels` — which senses involved (can be multiple — cross-sensory is normal)
- `trigger_conditions` — state thresholds, location, time, transition, co-occurrence (see docs/design/triggers.md)
- `character_conditions` — constitutional profile requirements (requires myopia, excludes anosmia, etc.)
- `nt_weights` — how NT state modulates availability and selection weight

The fragment spec is the anti-mess principle. Everything else is authoring. The quality ceiling is the authored pool — the compositor only combines what's there.

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

- **Bromelain (fresh pineapple)** — the enzyme digests soft tissue; the tongue and roof of the mouth go tingly and slightly raw after eating enough. The pineapple eating you back. Cooking or canning deactivates it — only fresh pineapple does this. Intermediate stage before bleeding: the tongue's surface proteins degrade — the tongue goes uncomfortably rough, sensitive, slightly raw; the smooth mucosal surface is compromised. Hard to describe because you don't normally have a reference for what your tongue's surface feels like from the inside. Tends to make you run your tongue against your teeth to check, which makes it worse. At further excess: actual bleeding, real tissue breakdown — the dose makes the poison. Same category as sour sweets stripping the tongue with citric acid, or coffee volume making the stomach protest. Pleasant or interesting sensations that become genuinely damaging at excess.
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

**Humidity changes everything** — a modifier on the whole thermal experience, not a separate channel:

*High humidity:*
- Sweat doesn't evaporate — cooling mechanism fails; you get hotter faster than temperature alone suggests
- Clothes stick, stay wet, chafe
- The air feels thick, slightly harder to breathe
- Hair changes (frizz, curl, volume — character and hair type dependent)
- Everything feels damp — surfaces, air, yourself
- High humidity heat exhaustion sneaks up differently from dry heat exhaustion

*Low humidity / arid:*
- Sweat evaporates immediately — may not notice water loss until dehydrated
- Skin dries out fast, cracks; lips chap; inside of nose dries and can crack and bleed (nosebleeds as a climate fact)
- Static electricity builds — door handles, synthetic fabrics, other people
- The cold in arid climates is different — dry, sharp, penetrates differently from damp cold

Both derive from geography, season, and weather — not a separate parameter to store, a modifier on everything else.

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

The sense of where your body is in space — position, movement, the felt sense of your own limbs without looking at them. Mostly invisible; surfaces to attention when something is off.

### When it surfaces

**Proprioceptive model failing:**
- Miscounting stairs — expecting a step that isn't there, or misjudging height. The lurch, the stomach drop. The body had a model of the stairs and reality didn't match it. One of the most universal sudden-shock experiences.
- Stepping off a moving walkway or escalator — the floor feeling wrong for a moment
- Getting off a boat — the ground still moving
- After alcohol — can't judge where the body is; the nose-touch test failing

**Physical state shaping movement:**
- Fatigue changing gait — shuffling, dragging, the effort of lifting feet
- Adenosine high — limbs feel heavy, further away than usual, movement costs more than expected
- Muscle soreness — awareness of specific muscles you don't normally notice; the body suddenly has regions
- Carrying weight — a heavy bag shifting centre of gravity, the body compensating without deciding to
- Illness — the loose, unreliable quality of a sick body, joints feeling wrong

**Limb falling asleep:**
- The strange absence before pins and needles — you have to look at it to use it
- The return of sensation — prickling, then normal, then you forget it happened

**Skill and familiarity:**
- Expert proprioception — a musician's fingers, a dancer's body awareness, a tradesperson's hands. The body knowing where it is with high precision.
- Unfamiliar body — after significant weight change, injury, growth spurt; the body behaving unexpectedly

**Physical pleasure and capability:**
- Going up stairs 2-3 at a time — small physical satisfaction; only happens when you have it in you. A mood and energy indicator.
- Narrow steps, ladder rungs — risk varies by coordination, foot size, footwear, fatigue; fear as a component

### Hand-eye coordination as a character variable
Affects physical interactions generally — catching something thrown, threading a needle, pouring without spilling. Varies by person, fatigue, age, practice. A character variable that modulates outcomes of physical tasks.

### Minor physical affordances and tactile pleasures
A category of small incidental physical interactions that aren't "actions" in the game sense but are part of the texture of being a body:
- Tactile objects: lego (the click, the specific texture of the studs), kinetic sand (deeply tactile, almost hypnotic), fidget spinners (weight, spin, resistance), spinning tops, trading cards (the feel of card stock)
- Some explicitly calming or regulating — fidget objects, kinetic sand; connects to sensory seeking (ADHD, anxiety)
- Physical social rituals: rock paper scissors, tag, telephone — partly physical, partly social
- The game should have room for this texture — small affordances of objects, brief physical pleasures that aren't major interactions

### NT modulation
- Adenosine high → proprioceptive precision drops; misjudging distances, catching things poorly
- Alcohol → proprioception directly disrupted; the body becomes unreliable
- Cortisol/anxiety → body held tense; proprioceptive awareness of that tension; braced posture
- Depression → the body feels distant, heavy, a thing being moved rather than inhabited

### Vestibular

The sense of balance, spatial orientation, and movement — processed in the inner ear. Closely linked to proprioception and vision; when they disagree, things go wrong.

### Disruption

**Spinning and stopping:**
- Fluid in the semicircular canals keeps moving after you stop — the world continues to turn
- Spinning in a chair, getting off a roundabout, pirouettes
- The specific pleasure some people take in this, the specific misery others do

**Motion sickness:**
- Vestibular and visual signals disagree — reading in a car, eyes say stationary, inner ear says moving
- The body interprets the conflict as possible poisoning and responds with nausea
- Also: boats, planes, VR headsets, the back seat vs. the front
- Varies enormously by person; gets worse with age for some; can be trained

**BPPV (benign paroxysmal positional vertigo):**
- Calcium crystals displaced in the inner ear; sudden, brief, violent dizziness triggered by specific head movements — lying down, rolling over in bed
- Very common, very disorienting, very treatable (specific head manoeuvres reposition the crystals)

**Vertigo:**
- The room spinning when you're not moving; specifically rotational, distinct from dizziness/lightheadedness
- Several causes (BPPV, Ménière's, vestibular neuritis, migraine); deeply unpleasant

**Alcohol:**
- Directly disrupts vestibular processing — the spins when lying down, the foot on the floor to stop the room moving, the inability to walk straight

### Heights and visual vertigo

- The body calculating that a fall is possible and responding before any conscious decision — the involuntary step back from an edge
- Visual vertigo at heights — dizziness triggered by looking down, even without motion
- The vestibular anxiety that fires regardless of what you know intellectually

### Rides

The vestibular system pushed deliberately:

- **Rollercoasters** — G-forces pressing into the seat or pulling out of it; weightlessness at the top of a drop; the body reading it as falling even while strapped in; knowing you're safe and the vestibular system not caring
- **Spinning rides** (teacups, waltzers) — sustained rotation; nausea that follows; tolerance varies enormously and declines with age for many
- **Drop towers** — pure freefall; the stomach-lift of weightlessness; very short, very intense
- **Carnival rides** — often less engineered; the specific anxiety of watching it rattle, the risk calculation
- **The aftermath** — getting off and the ground still moving, needing a moment, residual nausea, walking differently for a few minutes

**The anticipation:** the queue, watching others, the fear-that-is-also-excitement, the decision point. The social pressure to participate.

**The fun/fear split:** the same vestibular disruption, same threat response, same cortisol spike. Whether it reads as fun or terrifying is partly individual, partly context, partly current state — a character who's already anxious may find it intolerable where they'd otherwise enjoy it. This is the agency gradient applied to sensation: not a fixed property of the ride, a relationship between the ride and the character's state.

### NT modulation
- Anxiety/cortisol already elevated → vestibular threats read as more threatening; spinning less fun, heights more frightening
- Adenosine high → balance slightly worse; uneven ground requires more attention
- Alcohol → direct vestibular disruption (see above)

### Character-side conditions
- **Ménière's disease** — episodes of severe vertigo, tinnitus, hearing loss; unpredictable; chronic
- **Vestibular migraine** — migraine presenting primarily as vertigo rather than headache
- **Chronic vestibular dysfunction** — balance impaired as a baseline; compensated by vision and proprioception; surfaces in the dark or on uneven ground

### Character-side conditions
- **Dyspraxia / developmental coordination disorder** — difficulty with motor coordination and proprioceptive integration; everyday physical tasks require more conscious attention
- **Proprioceptive seeking** — some people actively seek deep pressure and proprioceptive input (weighted blankets, tight clothing, physical impact); common in autism and sensory processing differences

## Interoception

The sense of the internal state of the body — what's happening inside, not outside. The mechanism by which NT state becomes felt experience: anxiety isn't a number, it's a racing heart and a tight stomach; depression isn't low serotonin, it's heaviness and a body that costs more to move.

### Interoceptive awareness varies enormously

Some people read their body clearly — notice hunger before irritability, tension before it becomes a headache. Others have low awareness — don't register hunger until ravenous, don't notice anxiety until already in a spiral, don't feel thirst until they have a headache. Partly constitutional, partly trainable, strongly correlated with alexithymia, autism, and ADHD. Low interoceptive awareness also connects to hygiene (not noticing discomfort that would normally prompt action — see appearance section in TODO.md).

This variation colours every signal below — the same physiological event may or may not surface to conscious awareness depending on the character.

### Hunger and fullness

Not one signal but several arriving at different times:
- Stomach emptiness, blood sugar dropping, hormonal satiation (already in the game)
- The signals don't always agree
- Hunger ignored long enough becomes nausea — stomach produces acid with nothing to digest
- Emotional hunger vs. physical hunger — the same reaching feeling, hard to distinguish from the inside
- Appetite suppressed by depression, stress, illness — not feeling hungry when you should

### Thirst

- Often arrives late — mild dehydration already present before thirst is noticeable
- Frequently confused with hunger — eating when you needed water
- The specific headache of dehydration; dry mouth before it

### Needing the bathroom

- Urgency as a spectrum — background awareness → can't ignore → can't wait
- Anxiety directly affects GI motility (gut-brain axis) — stress makes it worse
- The decision calculus of how long you can hold it vs. how inconvenient stopping is

### Heartbeat

- Normally unfelt — surfaces when elevated (exercise, fear, caffeine, anxiety), irregular, or in silence at night
- Palpitations — the heart doing something unexpected; usually harmless, often alarming
- The heartbeat felt in a bruise or a headache
- **Dehydration:** blood volume drops, heart beats faster to compensate — moving less blood per beat more frequently. Lying down doing nothing, heart going faster than it should.
- **Orthostatic hypotension:** standing up too fast when dehydrated or hot — blood pressure drops, heart races to catch up, brief dizziness or grey-out. Very common, usually harmless, occasionally you have to grab something.

### Blood pressure

- **High:** mostly unfelt — the "silent killer." Occasionally: headache at the back of the skull, visual disturbance, feeling of pressure. Often no symptoms until something goes wrong.
- **Low:** dizziness on standing, fatigue, cold extremities, feeling faint. More immediately felt than high.
- **Post-hot-shower drop:** vessels dilated, blood pressure falls, standing up too fast suddenly risky.
- **The compensation loop:** heart rate, blood pressure, fluid volume, and temperature regulation in constant negotiation — dehydration, heat, standing, caffeine, alcohol all shift the balance; usually invisible, occasionally not.

### Blood sugar

- **Post-meal spike and crash:** simple carbs → brief good feeling → the drop. The afternoon slump after lunch has a real physiological mechanism.
- **Hypoglycaemia (low blood sugar):** shakiness, sweating disproportionate to temperature, racing heart, irritability, difficulty thinking (the brain runs almost exclusively on glucose — when it drops, cognition degrades fast), urgent specific hunger. Overlaps heavily with anxiety symptoms — racing heart, sweating, shakiness, feeling wrong. A character may not know which one they're having. The game doesn't need to tell them either.
- **Hyperglycaemia (high blood sugar):** excessive thirst, frequent urination (drink more → urinate more loop), fatigue, difficulty concentrating, blurred vision, specific brain fog — not adenosine fog, different in quality; thick, hard to push through. Connects to diabetes condition in TODO.md.

### Breathing

Normally automatic and unfelt — surfaces when something changes:
- Exertion making it audible and effortful
- Anxiety producing shallow, fast breathing — often without noticing; you realise you've been breathing wrong for a while
- Holding breath without deciding to — common during concentration or stress
- The deliberate breath when trying to calm down — one of the few direct voluntary levers on the autonomic nervous system; works because it does
- Breathing through a blocked nose — the specific effortfulness, the mouth drying out
- The breath after crying — the ragged, involuntary quality of it settling
- Chest cold or asthma — breathing that costs something, that has resistance

### Nausea

Already partially in the game (nausea state, vomiting event). The felt texture:
- Waves rather than constant — comes and goes, peaks
- The saliva that arrives just before vomiting — the body preparing
- The specific wrongness that isn't quite pain and isn't quite anything else
- Sources: motion (vestibular mismatch), smell, anxiety, eating wrong, medication, illness, alcohol
- The decision about whether to fight it or go with it
- Dry heaving when there's nothing left — the motion without the relief

### Fatigue and body heaviness

Fatigue is a spectrum with distinct qualities — not interchangeable:
- **Sleepy fatigue** (adenosine) — the pull toward horizontal, eyes heavy, the world softening
- **Physical fatigue** — muscles used up; the specific burn in legs after a long walk, arms after carrying; different from sleepy
- **Mental fatigue** — cognitive load exhausted; can be mentally exhausted and unable to sleep; different texture from sleepy or physical
- **Chronic fatigue** — illness, depression, ME/CFS; the fatigue that sleep doesn't fix, that doesn't obey normal rules; waking already tired
- **Fever heaviness** — the specific weight of a sick body, the effort of lifting limbs
- **The body that costs more than expected** — reaching for something and it's further than it should be; stairs that are steeper than they were yesterday

### Anxiety and NT signals as interoception

The neurochemistry becoming bodily experience — the body knowing before the conscious mind catches up:
- **Cortisol high:** tight chest, shoulders held up, jaw clenched without deciding to, stomach clenched
- **NE high:** heart faster, senses sharpened, the body ready for something that may or may not exist
- **Low GABA:** restlessness, can't settle, the body won't stay still, something climbing the inside of the skin
- **The sequence:** physical symptoms arrive first — the chest tightens, the heart rate changes — and only then comes the conscious recognition of anxiety. The body is not reporting on an emotion; it is the emotion, arriving somatically first.

### Character-side conditions
- **Alexithymia** — difficulty identifying and describing internal states; interoceptive signals present but hard to read or name; correlated with autism
- **Diabetes (type 1 and 2)** — blood sugar regulation impaired; hypoglycaemia and hyperglycaemia as recurring felt experiences; connects to TODO.md diabetes entry
- **POTS (postural orthostatic tachycardia syndrome)** — heart rate spikes dramatically on standing; dizziness, fatigue, brain fog; often comorbid with hypermobility and autoimmune conditions

### NT modulation
- Anxiety/cortisol → racing heart, tight stomach, shallow breathing, GI disruption
- Depression → hunger signals wrong or absent, fatigue, body feels distant and heavy
- Adenosine → fatigue signals intensified, everything costs more
- Dopamine low → interoceptive signals may not motivate action — feel hungry, don't eat anyway

## Nociception (pain)

Pain is not one thing — it has distinct qualities that carry different information about source and type.

### Acute pain

- Sharp, sudden, localised — a cut, a burn, stubbing a toe. Clear signal, clear source.
- The reflex before the pain — hand off the hot pan, then the pain arrives
- The moment of impact where you don't know yet how bad it is — the held breath before assessment
- Pain delay in serious injury — nerve endings damaged; the moment feels wrong before it hurts, then it catches up

### Chronic pain

Fundamentally different from acute — not a signal about damage happening now, but the pain system itself dysregulated:
- Aching, dull, persistent — background noise that doesn't stop
- Reshapes everything around it — what you can do, how long, what you're planning around
- Fatigue from pain — being in pain is exhausting even when nothing else is happening
- The psychological weight of pain that doesn't end — hope, accommodation, despair
- The way you stop mentioning it because there's nothing new to say

### Pain qualities

Each a different signal, different source:
- **Burning** — chemical, thermal, nerve
- **Stabbing** — sharp, localised, acute
- **Aching** — diffuse, muscular, chronic
- **Throbbing** — follows heartbeat; inflammation, infection, bruise
- **Shooting** — travels along a nerve path; sciatica, trapped nerve, referred pain
- **Pressing** — headache, sinus, internal pressure
- **Cramping** — muscle or visceral; menstrual cramps, stitch while running, charley horse at 3am waking you from sleep

### Chemical irritants on skin

- **Capsaicin** — activates TRPV1 (heat receptor) in skin; genuine burning sensation without actual heat. Handling chillies without gloves then touching your face — or eyes, which is significantly worse. Fat-soluble, so water doesn't help much; milk or oil works better. The same mechanism as in the mouth (see taste section). Spiciness in food is a spectrum with different qualities at each level, not just more of the same: mild (warmth, background) → noticeable → hot (sweat, nose running, heat becomes the main event) → very hot (pain dominant, endorphin release — the high chilli-heads chase; body treating it as genuine threat) → extreme (Carolina Reaper etc.: beyond pleasure for most, hiccups, vomiting, body trying to expel it; at this concentration capsaicin is a medical-grade topical analgesic). Afterburn: capsaicin lingers, peaks after swallowing, follows the food down. Next morning is its own experience. Tolerance is trained and personal — derives from food background (characters have histories).
- **Menthol** — activates TRPM8 (cold receptor); genuine cooling sensation without actual temperature change. Tiger balm, IcyHot, deep heat — the counter-irritant mechanism: replacing one sensation with another. Pain relief partly by distraction, partly by competing sensory signal.
- Other irritants: plant sap (some highly caustic — giant hogweed causes severe burns on UV exposure), contact allergens, cleaning chemicals on bare hands

### Small foreign bodies — disproportionate irritation

A category of minor pain disproportionate to size, defined by persistence and difficulty of removal:
- **Splinters** — embedded in skin, often invisible, have to find by feel or light angle; the specific frustration of something that small being that stubborn
- **Sugarcane fibers / fine plant hairs** — the tiny fibers around the stem that embed in fingers; too many to remove individually, too fine to easily see, persistent collective irritation
- **Ingrown hairs** — inflammation around a hair growing the wrong direction; tender, localised, satisfying or deeply unsatisfying to address depending on outcome
- **Stray hairs stabbing in** — a hair landing point-first on skin, falling into an eye, getting between teeth; disproportionate response to something weightless

The common thread: small, hard to locate, persistent, often requiring more effort to remove than seems reasonable. The frustration is part of the experience.

### The social dimension of pain

- Chronic pain invisible to others — fibromyalgia, endometriosis, back pain, migraines
- Not being believed — particularly for conditions that are invisible, common in women, or recently named
- Performing wellness when you're not — the energy cost of pretending, of not making others uncomfortable
- Pain tolerance as variable — constitutional, contextual (adrenaline can suppress acute pain), cultural

### Character-side conditions
- **Fibromyalgia** — widespread chronic pain, fatigue, cognitive fog; mechanically real but often disbelieved; predominantly affects women
- **Endometriosis** — chronic pelvic pain, severe menstrual pain; average 7–10 years to diagnosis; invisible, often dismissed
- **Chronic back/joint pain** — circumstantial (injury, occupation, age); reshapes daily movement and capacity
- **CIP (congenital insensitivity to pain)** — cannot feel pain; sounds like a superpower, is actually dangerous; wounds go unnoticed, damage accumulates
- **Hyperalgesia/allodynia** — pain system upregulated; things that shouldn't hurt do, or hurt more than they should; associated with fibromyalgia, nerve damage, opioid overuse

### NT modulation
- Cortisol/stress → pain threshold lowers; things hurt more when already stressed
- Adrenaline/NE high → acute pain suppressed (injury during high arousal noticed later)
- Depression → pain perception heightened; the system more sensitive, less buffered
- Adenosine high → dull aching quality to fatigue that borders on pain

---

## System inventory — what needs to be built

Going through all the senses and asking what each sensation requires beyond the base fragment system produces a clean inventory. Most sensory facts need nothing special. A small set of recurring system types covers the rest.

### The base system handles everything routine

Fragment library + compositor + trigger conditions + NT weighting. Most ambient sensory facts, most state-triggered fragments, most location/time/transition-triggered content — all of this needs no special machinery beyond what the compositor already provides. Author the fragments, define the conditions, done.

### System 1: Character sensory profile

Constitutional conditions stored at chargen, consulted by the compositor when selecting and combining fragments. Almost every sense has at least one condition that requires this.

Two modes:
- **Suppression** — anosmia suppresses smell fragments entirely; deafness suppresses sound fragments; CIP suppresses pain fragments
- **Replacement** — myopia doesn't just suppress distant-scene fragments, it replaces them with blur variants. Color blindness substitutes different color language. Low interoceptive awareness replaces clear hunger/thirst signals with absence or wrongness.

Replacement means we need **fragment variants keyed to constitutional conditions** — not just flags that suppress, but alternative authored text that renders the world as this character actually experiences it.

Conditions requiring this system: myopia, presbyopia, astigmatism, color blindness variants, visual snow, floaters, anosmia, ageusia, phantogeusia, tinnitus, deafness, low interoceptive awareness, CIP, hyperalgesia, dyspraxia, misophonia, BPPV, proprioceptive seeking, vestibular chronic dysfunction, Raynaud's, anhidrosis.

### System 2: Tolerance / trained response variables

Responses that change through play — learned, not constitutional:
- **Spice tolerance** — scalar, increases with exposure, degrades with absence; affects which spice-tier fragments are available and how they read
- **Vestibular tolerance** — scalar, affects how spinning/ride fragments read; varies by character background
- **Acquired tastes** — plug into the existing sentiment system; taste sentiments that shift from aversive toward positive through repeated positive-context exposure

Spice tolerance and vestibular tolerance are new scalar variables. Acquired tastes are sentiment system entries — same infrastructure, different targets.

### System 3: Persistent body state variables

Ongoing conditions with their own dynamics — not events, not NT systems, but continuous variables that drift and reshape capacity:
- **Chronic pain level** — distinct from acute nociception; continuous, affects energy/capacity/mood; has its own fatigue effects; doesn't resolve between actions
- **Vestibular disruption level** — after spinning, after alcohol, after a bad BPPV episode; decays over time back to baseline
- **Tinnitus intensity** — character-variable baseline, modulated by ambient noise level; a constitutional baseline that the environment raises and lowers

Same architecture as NT systems — continuous variables with drift toward targets. Different in that they're body-state rather than neurochemical.

### System 4: Object state for consumables and body

Simulated persistence applied to food and to the character's own body:
- **Food freshness / degradation** — food has states (fresh, soggy, stale, slightly off, spoiled); affects taste fragments and whether eating is safe; food objects track their own state over time
- **Foreign bodies in character** — a splinter, embedded plant fibers, an ingrown hair; temporary body state that produces ongoing nociceptive fragments until resolved by an interaction

Food state is already needed for the food system broadly. Foreign bodies are a small new object-state concept: something embedded in the character's body that generates sensory fragments until removed.

### System 5: Agency gradient machinery

Already designed (see CLAUDE.md, docs/design/senses.md core principles), not yet built. Covers:
- Contact with hot surfaces — reflex fires before player can act (zero agency, spinal arc)
- Threat response to being followed — player choice unless trauma or NT state overrides
- Aversive involuntary responses — nails on chalkboard, misophonia triggers
- Trauma-triggered sensory responses — probability by PRNG, scales with trauma intensity

### What existing systems just need fragments authored against them

These systems already exist — sensory prose just needs fragments that reference them as trigger conditions and NT weights:
- Hunger, nausea, adenosine, cortisol, NE, GABA, serotonin, dopamine
- Health states (fever, acute illness)
- Weather, location, time of day, season
- Social state, guilt, sentiment levels

### Summary

| System | Status | Notes |
|--------|--------|-------|
| Fragment library + compositor | New | Core; everything depends on this |
| Character sensory profile + variants | New | Chargen; constitutional conditions |
| Tolerance variables (spice, vestibular) | New scalars | Spice degrades with absence |
| Acquired taste sentiments | Existing (sentiment system) | New entries, same infrastructure |
| Persistent body state (chronic pain, vestibular disruption, tinnitus) | New | NT-system architecture |
| Object state: food freshness | Partially exists | Needs full state machine |
| Object state: foreign bodies | New (small) | Temporary body state |
| Agency gradient machinery | Designed, not built | Covers reflexes + trauma override |
| Everything else | Existing systems | Just needs fragment authoring |
