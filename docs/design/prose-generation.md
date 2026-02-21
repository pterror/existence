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

Dialogue is not narration. Different rules, different components. Speech by other characters — coworkers, friends — is constructed from voice parameters generated at chargen from backstory. Not authored per-character.

#### Universal spoken deviations

Most people's speech deviates from written standard English in ways that carry no regional signal — they're just how people actually talk. These are the baseline, present in everyone to varying degrees:

- **Case in compound subjects**: "me and Sarah went" not "Sarah and I went"
- **Who/whom**: almost no one uses *whom* in speech
- **Double negatives**: "didn't do nothing," "can't find it nowhere"
- **Gonna, wanna, kinda, sorta, tryna** — near-universal contractions
- **Subject dropping in casual frames**: "Gonna be late." "Didn't think so."
- **Quotative like**: "And I'm like, why would you even—"
- **Singular they** in all registers
- **Sentence-final prepositions**: "the thing I was thinking of"
- **"Different than"** (not "different from")

The degree to which these appear is a voice parameter — more compressed/casual speech uses them more freely. Higher education or self-consciousness about speech may suppress some of them in formal contexts but not informal ones.

#### Regional and dialect features

Layered on top of universal deviations, and derived from backstory (region, class, upbringing). These are *more* marked than the universal stuff and should be used carefully — they identify a speaker but shouldn't become caricature.

Examples (not exhaustive): "I seen it," "might could," "fixin to," "wicked cold," "youse," "she don't," double modals. The mechanism for generating these is: backstory produces a region parameter, region parameter maps to a small set of characteristic features, features are weighted into the speech construction.

#### Speech planning features

Real-time speech is constructed live and the seams show. These are not errors — they're information about the speaker's relationship to what they're saying.

- **Filled pauses**: "um," "uh," "umm," "like," "you know," "I mean," "so," "basically" — the sounds the mouth makes while the brain catches up. Slot mid-sentence or at clause boundaries. Frequency is a voice parameter; topic and emotional loading cluster them.
- **False starts**: "She — no, we were both there." "I thought — I don't know what I thought."
- **Repair**: "I told him. I said — I don't even remember what I said."
- **Trailing off**: "I just figured maybe..." — sentence doesn't resolve. The speaker chose not to finish.
- **Mid-sentence pivot**: "It was good, it was — I don't know, it was fine."
- **Brain catching up**: starts the sentence before knowing where it's going. "The thing with — yeah, the whole thing is just—"
- **Self-interruption / change of mind**: "I should probably — never mind."
- **Getting cut off**: sentence stops mid-construction, either by another speaker or by the speaker deciding not to say it.

**Clustering rules**: hesitation and false starts cluster around emotionally loaded content, topics the speaker hasn't decided they want to discuss, things being said to authority figures. Fluency is higher with close friends and on familiar topics. Emotional state from NT parameters affects baseline fluency — high stress produces more repair, more trails-off.

**Punctuation as phonetic notation**: em dash for interruption or mid-sentence pivot; ellipsis for trailing off or suspension; comma-then-restart for repair. These are not stylistic choices — they notate how the speech actually moved.

#### Pragmatic stance markers

Phrases that reveal the speaker's relationship to what they're saying and to the listener. Not filler, not grammatical features — social positioning moves that are deeply character-revealing.

- **Hedging**: "I think," "I'm pretty sure," "maybe," "kind of" — signals uncertainty or politeness; repeated use is a personality fingerprint
- **Defensiveness / pre-emption**: "to be fair," "I mean," "just saying," "no offense but," "don't get me wrong" — managing potential disagreement before it arrives
- **Solidarity markers**: "you know," "right?", "I know" — seeking confirmation, checking alignment
- **Candor signals**: "honestly," "tbh," "not gonna lie," "fwiw," "imho" — signals that what follows is more direct than usual, which implies the speaker usually isn't
- **Qualifiers**: "kind of," "sort of," "a little bit," "like" — softening an assertion

These are personality parameters, not just voice parameters. A character who habitually uses "to be fair" is showing something about how they handle conflict. Someone who signals candor constantly ("honestly," "tbh") is signaling that directness is notable for them — they're usually more guarded.

#### Personality in dialogue more broadly

Surface features (grammar, hesitation, region, stance markers) are the how of speech. But personality also shapes the *what* — which is a harder and less well-defined design space:

- **Topic selection**: what the person brings up unprompted vs. what they avoid
- **Self-disclosure level**: how much they share about themselves, how quickly
- **Directness**: whether they answer questions directly or route around them
- **Over/under-explanation**: what they assume you know vs. what they spell out
- **Register flexibility**: when they shift between formal/casual, jokey/serious, and what triggers the shift
- **Response to disagreement**: engage, deflect, get defensive, get quiet
- **What they find worth remarking on**: what they notice and mention vs. what they let pass

These are harder to parameterize than stance markers but matter more for whether a character feels like a person. Character generation should eventually produce a personality sketch that constrains all of these, not just the surface features. For now: noted as an open design space.

#### Uncomfortable personality patterns

Sanitizing characters into supportive, well-meaning presences makes them feel like NPCs. Real people have less flattering patterns, and these are as much personality as anything else. The game doesn't judge — it renders.

- **Casual insensitivity**: says something that lands badly without noticing. Not malicious — just oblivious to how it registers
- **Intentional malicious ignorance**: deliberately fails to understand something because understanding it would require acknowledging something uncomfortable. "I just don't see why that's a big deal"
- **Passive aggression**: ostensibly fine, edge underneath. "No, it's fine." The surface is cooperative; the content isn't
- **One-upping**: responds to your situation by immediately relating it to their own worse situation. Often from anxiety, not malice
- **Deflection**: changes subject when things get uncomfortable, sometimes so smoothly they don't notice they're doing it
- **Weaponized concern**: "I'm just worried about you" functioning as criticism or control
- **Condescension**: over-explains things the listener knows, talks down without registering that they're doing it
- **Toxic positivity**: "at least—", "everything happens for a reason," "have you tried just—"
- **Unsolicited advice**: states the obvious solution as though it hadn't occurred to you

These patterns interact with relationship state and context — a coworker's casual insensitivity may have nothing to do with you personally. A friend who one-ups may be doing it from genuine anxiety. The simulation renders the behavior without explaining or excusing it.

#### Slang and vernacular

Generation-specific and subculture-specific vocabulary. Hard to author because it dates. Treat as a separate lightweight lexical layer — a small set of current-register words that can slot into constructions. Needs more thought; likely authoring rather than generation.

#### Humor: deadpan and sarcasm

Humor without an LLM is hard but not impossible for constrained forms.

**Deadpan** works by construction: state something absurd or extreme in a completely flat register, no signaling that it's funny. "you alive or did your apartment finally consume you" is deadpan — "finally consume you" is the move, stated as a natural continuation of a serious question. The construction is: [ordinary framing] + [extreme/absurd predicate stated without escalation]. The humor lives in the gap between the register and the content.

**Sarcasm** works by inversion: state the opposite of what's true using positive register. "Oh great" when something is bad. Constructable if you know the situation is negative and have a small set of positive-register frames to invert. Requires knowing the social relationship — sarcasm doesn't work between strangers.

**Wry observation**: noticing something absurd about a situation and stating it plainly. "the same volume as everything else" is wry — it names the overwhelm in a way that's also a little funny because of how accurate it is. This is the interpretive escape move applied to absurdity.

**Disbelief**: a specific speech act — understatement as response to something unexpected. "Wait, what." "No." "...seriously?" Short, often fragmentary, register-flat. Constructable from: situation flagged as unexpected + a small set of disbelief frames.

**Absurdism**: treating the mundane as cosmically significant, or the serious as trivial. "did your apartment finally consume you" — the realistic situation (hasn't replied in days, messy apartment) gets a surreal predicate that is logically parallel to the real one. Construction: take a known situation + substitute predicate from a set of surreal-but-parallel alternatives. The game has all the situational knowledge needed for this — it knows the apartment state, the absence duration, the relationship flavor.

The constraint on humor is not generative capacity but *world knowledge*. Jokes grounded in the game's own world — the apartment, the job, the absence, the financial situation — are fully constructable because the game knows all of that. Jokes requiring external world knowledge (current events, pop culture, things outside the simulation) are not. The line is the boundary of the simulation.

#### Text message register

Separate from spoken register — its own conventions:

- Lowercase throughout, or mostly
- No terminal punctuation (a period in a text reads as cold or passive-aggressive)
- Abbreviations where authentic to the character's generation/style
- Typos or autocorrect artifacts as texture (not modeled yet)
- The "..." as its own gesture — trailing, or ominous, depending on context
- Short messages are the default; length signals either effort or rambling

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
