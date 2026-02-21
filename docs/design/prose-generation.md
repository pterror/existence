# Prose Generation

This document describes the intended prose generation architecture for existence. It is a living document — expect significant refinement as the system is built and tested.

## The problem with authored strings

The current content system authors complete sentences and phrases, selected at runtime via weighted picks. This fails at variety: a player who has played for several hours will begin to recognize phrases. Recognized text breaks the fiction — the simulation's job is to produce *experience*, and a sentence you've seen before produces recognition, not experience.

More variants per pool defers the problem but doesn't solve it. The ceiling is always the size of the authored pool.

## The approach: procedural generation

Sentences are *constructed* from components at runtime, not selected from authored pools. The components are small and authored — lexical sets, structural rules, literary moves — but the sentences they produce are not. The variety is combinatorial across components × state × probability weights, not bounded by pool size.

This does not require a runtime LLM call. The "intelligence" lives in the rules and the probability weights, not in a generative model.

## Core pieces

These were reverse-engineered from the Opus sample outputs. Expect this list to grow and change.

### 1. Observation sources

What can be noticed at any given moment. The system needs to know what's available to notice before it can construct a sentence about it.

Sources include:
- **Location objects** — what's in the current location (plate, window, blinds, counter)
- **Object state** — current state of tracked objects (dishes in sink, bed made/unmade, clothing on floor)
- **Body state** — what the body is reporting (cold, weight, hunger, fatigue)
- **Recent action** — what just happened (just ate, just woke up, just arrived)
- **Environment** — weather, light quality, time of day, sounds from outside
- **Other characters** — a coworker passing, sounds from adjacent space, ambient presence

Each source produces a semantic slot: *what* is being noticed, described in terms the realization rules can work with.

### 2. Sentence architectures

The structural shapes available for constructing a sentence. These are weighted by NT state — not switched on/off, but shifted in probability continuously.

Identified architectures (needs expansion):

- **Bare fragment** — pure NP, no verb. "Ceiling." "The plate." Used under dissociation, waking, overwhelm.
- **Short declarative** — [subject] [verb] [complement]. "Your hands are cold." "The clock said 7:41." High weight under anxiety and flat mood.
- **Observation + interpretive escape** — declarative followed by clause that interprets or reframes. "She pushed the chair back and it scraped, and the sound was just a sound." The escape is NT-weighted — present under calm, suppressed under overwhelm/dissociation.
- **Equal-weight juxtaposition** — multiple short declaratives, no hierarchy, no subordination. Body and environment get the same grammatical weight. Characteristic of dissociation.
- **Polysyndeton** — and...and...and. Performs cognitive flooding. High weight under overwhelm.
- **Apposition elaboration** — NP followed by elaborating phrase. "Ceiling. The texture of it, close and far at the same time."
- **Terminal list** — sentence or fragment ending in a bare NP list. "The bus stop sign, the curb, the smell of someone's heat coming through a vent." Trails off without interpretation.
- **Long subordinated** — subordinate clause + main clause + participial. Higher weight under calm/heightened states.

### 3. NT probability weights

The NT state shifts the probability distribution over architectures continuously. Not a hard mapping from state → architecture, but a weight function. The same state produces different architectures on different calls.

Key dimensions (working hypothesis — needs calibration):
- **GABA** — low GABA shifts toward fragmentation, short declaratives, loss of subordination
- **Norepinephrine** — high NE shifts toward short sharp sentences, body-first ordering, things arriving without invitation
- **Adenosine** — high adenosine shifts toward equal-weight juxtaposition, source ambiguity, bare fragments, apposition
- **Serotonin** — low serotonin shifts toward flat declaratives, terminal lists, absence of interpretive escape
- **Dopamine** — shapes whether the final clause reaches toward meaning or deflates

### 4. Literary moves

Specific high-value constructions that appear in good literary prose about inner life. These are moves, not architectures — they can appear within various architectures. Each is NT-weighted.

Identified moves (needs expansion):

- **Interpretive escape** — the sentence ends by stepping back from the observation and commenting on it. "The sound was just a sound." "The same volume as everything else." Characteristic of calm observation; suppressed under overwhelm/dissociation.
- **Body-as-subject** — the cold/hunger/fatigue *does something* rather than the body *feeling* something. "Cold sits on the back of the neck." Shifts agency from person to sensation. Higher weight when adenosine is high or serotonin low.
- **Source ambiguity** — the perceiving mind can't identify what it's hearing/sensing. "A truck or a dog." "The fridge, maybe, or the heat." Weighted by adenosine and dissociation.
- **Self-doubt qualifier** — the observation undercuts itself. "Wasn't there last week, or was." "Something like that." Weighted by flat mood, low serotonin.
- **Memory intrusion** — past state bleeds into present observation. "Smells different than you remember it smelling." Weighted by certain NT configurations — needs thought.
- **Body assembly** — the body locating itself piece by piece, without volition. "Hands on the sheet, and that's how the body finds itself, piece by piece, without anyone asking it to." Specific to waking/sleep inertia states.
- **Synesthetic collapse** — sensory modalities blur. "The overhead lights are the same volume as everything else." High weight under overwhelm.

### 5. Lexical sets

Small authored sets per semantic slot: how to refer to a thing, what verbs apply, what modifiers are available. The sets are small — maybe 4–8 items each — and items are weighted by NT state.

Example (sketch only):
```
fridge:
  subject_np: ['the fridge', 'something', 'a hum from the kitchen', 'it']
  predicate: ['hums', 'runs', 'has been going', 'sits there']
  modifier: [
    { text: 'steadily', weight: gaba_high },
    { text: 'at the wrong frequency', weight: ne_high },
    { text: 'from somewhere', weight: aden_high },
    { text: 'too loud', weight: gaba_low },
  ]
```

The lexical items don't carry the literary weight — the architecture and moves do. The sets don't need to be large or careful. They need to be *appropriate* — not wrong for the thing they describe.

### 6. Character voice (dialogue and ambient speech)

For speech by other characters — coworkers, friends — a separate set of parameters governs how their speech is constructed. This is not narration; it has different rules.

Voice parameters (working list):
- **Compression** — how much the speaker drops vs. retains. "Cold enough to make your teeth hurt" vs. "It's really cold out there today."
- **Subject dropping** — how often subjects are implicit rather than stated
- **Grammatical register** — which deviations from written standard are characteristic: "me and X," "I seen," double negatives, etc. These come from backstory (class, region, education)
- **Hesitation features** — false starts, repairs, trails-off, mid-sentence pivots. Cluster around emotionally loaded content.
- **Speech planning speed** — fluency varies by topic and relationship

Text message register is separate from spoken register — its own conventions (lowercase, no terminal punctuation, abbreviations).

Voice parameters should be generated at chargen from backstory, not authored per-character.

## What the system does NOT do

- Call an LLM at runtime
- Select from a pool of authored complete sentences
- Assemble pre-authored fragments via a compositor

The current `js/senses.js` fragment library and compositor is a prototype that explored this space. It will eventually be replaced or significantly rethought once this system is better specified.

## Open questions

- How are observation sources selected? What determines which slot(s) are available at any moment?
- How many observations per idle moment? Is there a budget?
- How do multiple observations combine — is this still a composition problem?
- How does the system avoid producing the same architecture repeatedly within a short window?
- Where does the inner voice fit — same system or separate?
- How do ongoing states (waking, mid-action) differ from idle observation moments?
- What does the authoring surface look like for lexical sets? How are they maintained?
- How does continuity work — does the system know what was just said and avoid repetition at the sentence level?

## Reference outputs

Opus 4.6 sample outputs used to ground this design. These are the quality bar and the reverse-engineering source.

**Indoor idle, calm:**
> The plate held a crescent of toast crust and a smear of something. Light from the window lay across the table in a flat band. She pushed the chair back and it scraped, and the sound was just a sound.

**Dissociated, bedroom:**
> The blinds cut the light into bars across the carpet. Your hands are cold. Something outside, a truck or a dog, and then it stops. The pillowcase smells different than you remember it smelling.

**Anxious, getting ready:**
> The clock on the microwave said 7:41. Keys on the counter where they shouldn't be. The zipper caught halfway and she worked it with both hands, standing in the hall, coat half on. Outside a bus went past without stopping.

**Overwhelmed, workplace:**
> The register beeps and someone is asking about returns and the milk steamer is going and a phone is ringing somewhere behind the wall and your hands are doing something with change, counting it out, and the overhead lights are the same volume as everything else.

**Coworker, warm_quiet, Ohio:**
> "Cold enough to make your teeth hurt out there."

**Friend text, dry humor:**
> you alive or did your apartment finally consume you

**Waking up, poor sleep:**
> Ceiling. The texture of it, close and far at the same time. Something in the room is humming — the fridge, maybe, or the heat — and the sound has edges before anything else does. Hands on the sheet, and that's how the body finds itself, piece by piece, without anyone asking it to.

**Walking, flat mood:**
> Cold sits on the back of the neck. A car passes with its headlights still on. The sidewalk has a crack that wasn't there last week, or was. The bus stop sign, the curb, the smell of someone's heat coming through a vent.
