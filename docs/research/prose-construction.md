# RESEARCH-PROSE-CONSTRUCTION.md

Research into sentence construction for the prose compositor system. Three parallel investigations: linguistic/rhetorical toolkit, literary examples, and NLG aggregation literature.

---

## 1. The Core Problem

Sensory facts compound. The stomach gurgles while standing next to a busy road while it's cold. Pre-written prose pools can't scale to every combination; firing one observation at a time loses the simultaneous texture. The solution is a compositor that combines authored fragments — but to design that compositor, we need to understand what writers actually do when combining simultaneous observations.

---

## 2. Linguistic and Rhetorical Toolkit

### Fragment type vocabulary

The grammatical types a compositor needs to know about:

| Type | Description | Default behavior |
|------|-------------|-----------------|
| Independent clause | Subject + verb, stands alone | Root of sentence |
| Participial phrase | `-ing` phrase | Simultaneous with main clause by default |
| Absolute phrase | Noun + participle, not grammatically tied to main clause subject | Background condition; cinematic |
| Adverbial/subordinate clause | `while`, `as`, `because`, `although`, `when` | Explicit temporal or logical relation |
| Noun phrase fragment | No verb | Atemporal, static; dissociated register |
| Adjective phrase fragment | No noun or verb | Stripped, notational register |
| Appositive | Second NP that expands the first | After head noun, elaboration not addition |

### Coordination vs. subordination

**Coordination** (`and`, `but`, `so`) treats both elements as equally foregrounded. Flat, additive. Over-coordination (`and... and... and...`) sounds like a child's retelling.

**Subordination** demotes one clause to background. The main clause is the point; the subordinate clause is context. Key subordinators for simultaneity: `while` (same duration), `as` (precise moment, can imply causation).

For combining simultaneous observations, **participial phrases** do most of the work. They attach to the main clause, default to simultaneous, and add without requiring explicit temporal marking.

**Absolute phrases** (`her coat still on`, `the engine still running`) are the most powerful background-condition device. Not grammatically attached to the main clause subject — they float as independent conditions. Cinematic. High-register.

### Signaling simultaneity vs. sequence

- Participial phrases default to simultaneous
- `while`/`as` = explicit simultaneity
- `then`/`after`/`before` = explicit sequence
- Bare juxtaposition of clauses defaults to sequence — you must mark simultaneity explicitly

### Ordering principles

**Given-before-new (Halliday theme-rheme):** Established context precedes new information. The sentence begins with what the reader already has a foothold on and moves toward what's new.

**End-weight principle:** English sentences carry their stress at the end. Lighter elements before heavier ones. Short main clause + longer elaboration. Important item in final position unless deliberately foregrounding it.

**Participial attachment:** Trailing participials must share their subject with the main clause subject. Misattachment produces absurdity.

### Punctuation as structural operator

- **Comma** — weakest separator; joins modifier to main clause; separates list items
- **Semicolon** — parallel independent clauses, closely related; implies logical relation without naming it; slightly formal
- **Colon** — what follows specifies or explains what came before; asymmetric (first → second); can introduce a fragment
- **Em dash** — most versatile; interrupt, amplify, enclose appositive, mark pivot; less formal than semicolon; signals speed of thought or real-time interruption

### Asyndeton and polysyndeton

**Asyndeton** (no conjunction): `cold, gray, persistent` — fast, breathless, accumulative; implies more items exist; restraint, no editorializing between items.

**Polysyndeton** (repeated conjunction): `and the cold and the light and the sound` — deliberate, each item weighted individually; liturgical register; abundance or doom.

For a compositor: asyndeton = fast/overloaded/overwhelmed register; polysyndeton = heavy/deliberate/each-thing-felt.

### Fragment sentences

Fragments remove the perceiving subject or the assertion of time. Types:
- **NP fragment** (`The window. The street below.`) — series of things that exist; static; dissociated; camera cuts
- **Participial fragment** (`Standing in the dark.`) — action without claimed subject
- **Adjective fragment** (`Cold. Very quiet.`) — private notation; pre-linguistic

Fragment strings signal numb, overwhelmed, dissociated, or static register. After several full sentences, a short fragment lands hard.

### Tone register map (summary)

| Construction | Register |
|-------------|---------|
| Fragment strings | Numb, overwhelmed, dissociated |
| Polysyndeton | Heavy, each item felt |
| Asyndeton (full clauses) | Breathless, cataloguing |
| Em dash | Pivot, interruption, real-time thought |
| Semicolon | Careful observation, parallel conditions |
| Colon | Specification, consequence, the point arriving |
| Absolute phrase | Cinematic, background condition foregrounded |
| Participial trailing | Incidental simultaneity, natural flow |
| Long accumulating sentence | Ecstatic, can't-stop-seeing |

---

## 3. Literary Examples

### The split/combine decision

**"What the mind registers as a single perceptual event gets one sentence; what requires a shift in attention gets a new one."**

This is the core principle. Observations fuse into one sentence when they form a single texture or the character can't separate them. They split when each requires its own cognitive arrival.

- Carver splits to create dread-gaps. The gap between sentences is where the weight lives.
- Chekhov splits to honor each small thing equally — no sentence dominates.
- Johnson combines with polysyndeton when the nervous system is flooded and can't prioritize.
- Dillard combines when observations form a single physical fact (e.g., everything that cold does to the body at once).

### Ordering within a sentence

**1. Large-to-small (spatial zoom):** Field before figure, figure before consequence. Dillard: sky → crow → shadow. Matches how the eye actually works.

**2. Involuntary-before-voluntary (attention order):** What hits you before what you look for. Cold before wallpaper. Sound-you-can't-un-notice before what you're examining. The body's involuntary registrations precede deliberate observation. Salter: cold (body) → visual discovery → auditory intrusion.

**3. Cause-to-consequence:** Robinson: wind shift → smell arrives → curtains move. The sentence moves through time and space in causal order.

**4. Outside-in:** Environment → body sensation → emotional interpretation. Didion: sun behind clouds → air goes heavy → felt as loneliness. Three clauses, each a step deeper inside.

**5. Inverted order (dissociation):** When the perceiver is overwhelmed or dissociated, ordering becomes arbitrary — body symptom then irrelevant detail then unrelated thought. The disorder of ordering performs the state.

### Distinguishing dominant from secondary observations

- **Position:** Dominant fact leads the sentence or occupies the main clause. Secondary facts become participials, appositives, or subordinate clauses.
- **Syntactic independence:** Main clause = figure; modifier clauses = ground.
- **The governing adjective:** An adjective applied to the first observation radiates outward and colors everything that follows. Robinson: "thin, exhausted light" → fields that are "permanent and abandoned" are borrowing their adjectives from the light.
- **Inversion for passivity/shock:** When the subject's volition is minimal (overwhelmed, dissociated, shutdown), the body-condition participials can dwarf the main clause. The elaboration outweighs the assertion.

### When two observations are equally salient

Five strategies from the literary record:

1. **Comma splice / run-on** — performs simultaneity; neither subordinate; Didion uses this
2. **Polysyndeton** (`and...and...`) — grammatically equal; McCarthy; flattened, post-conscious quality
3. **Colon** — formal acknowledgment that ordering is impossible; "Two things registered simultaneously:"
4. **Syntactic parallelism** — same structure, same length confirms equal status: `"The light was wrong. The air was wrong."` (Carver)
5. **Escape pivot** — when two observations can't be ordered, the character's mind escapes to memory or interpretation, resolving the tie by abandoning it

### Involuntary body sensations alongside environmental observations

**Body-as-frame:** Body sensation first, environment second. The hunger/pain/tension colors the environmental observation. The environment is perceived *through* the body state.

**Environment-triggers-body:** Environment first, involuntary response second. Johnson: *"A truck went by and she felt it in her teeth."* The body is porous, receiving the world.

**Grammatical equality (dissociation):** Body sensation and external observation given identical syntactic weight. Body becomes an object in the world alongside other objects. `"His hands were numb. The coffee was hot. He couldn't feel it."` — three sentences, each grammatically identical. Disturbing equivalence.

**Intrusion syntax (em dash):** The involuntary body sensation interrupts an environmental observation mid-sentence. Salter: *"He was looking at the lake — his stomach had started again, that tightening — and the light on the water was very beautiful."* The em dashes enact the intrusion. Character was observing; body interrupted; observation resumed.

**The parenthetical:** Body sensation in parentheses — acknowledged but bracketed, kept out of the main syntax. Character trying to manage involuntary awareness, to keep going.

### NT state → sentence structure mapping (from literary evidence)

**Calm:** Long sentences, subordination, cause-effect sequencing. Adjectives earned by context. Attention directed, not flooded. Robinson: zooming participials, modifying clauses syntactically placed correctly.

**Anxious/Overwhelmed:** Short declaratives, fragmentation, sentences that don't reach predicates, details accumulating without hierarchy. Didion (*Play It As It Lays*): fragment strings with no main verbs. Or Johnson's full-flood polysyndeton — grammatical control while semantic content is insane (the horror of calm syntax around chaotic content).

**Dissociated:** Grammatical equality between body and environment. Observations with no causal connection given identical sentence structure. No final interpretation clause — the chain ends on raw fact, not on what the character made of it.

**Depression/flatness:** Correct sentences that deflate at the end. Carver: observation `and` failure-to-act. *"His feet were cold and he didn't move them."* The observation and the non-response, joined by `and`. That's the whole sentence.

**Heightened/ecstatic:** Long sentences that keep going past completion. Participials accumulate; none is redundant; the sentence keeps finding more to add. The perceiver can't let the observation close. Robinson.

### The final clause as state indicator

What the sentence ends on reveals what the character did with the perception:
- Ends on **interpretation** = calm enough to interpret
- Ends on **raw observation** = too flooded to interpret
- Ends on **failure-to-act** = depression/withdrawal
- Ends on **body sensation** = that sensation has won

This is a direct encoding of NT state in sentence structure — without naming the state.

---

## 4. NLG Aggregation Literature

### The pipeline and where aggregation fits

The classical NLG pipeline (Reiter's "consensus architecture"): content determination → sentence planning → surface realization. Aggregation is a subtask of sentence planning: deciding how a set of propositions gets distributed across sentences and clauses.

Source: Gatt & Krahmer (2018), "Survey of the State of the Art in Natural Language Generation." *Journal of Artificial Intelligence Research* 61. arXiv:1703.09902. https://arxiv.org/abs/1703.09902

### Named aggregation operations

**Conjunction:** Two propositions with a shared argument joined with `and`. Requires syntactic tree manipulation (Shaw 1998): find shared nodes, eliminate duplicate, connect with coordinator. Produces flat, additive output — overused by systems that default to it.

**Subordination:** One proposition becomes a subordinate clause inside another. Requires knowing the rhetorical relation: CAUSE → `because`; CONCESSION → `although`; SEQUENCE → `then`/`after`. Without the relation, you can't choose the cue word. Source: Theune et al. (2006), "Performing aggregation and ellipsis using discourse structures." *Research on Language and Computation*. https://link.springer.com/article/10.1007/s11168-006-9024-9

**Set description:** Multiple propositions about multiple entities with a common predicate collapse into a list. Source: Dalianis (1999), *Computational Intelligence*. https://onlinelibrary.wiley.com/doi/abs/10.1111/0824-7935.00099

**Apposition/relative clause:** A property becomes a modifier inside an NP rather than a separate sentence.

**Key insight from Theune et al.:** The choice of aggregation operation is not arbitrary — it should follow from the rhetorical relation between propositions. Without an explicit relation, conjunction is the default fallback, but it produces flat, repetitive output.

### When to combine vs. keep separate

Three governing factors from the literature:

1. **Structural compatibility:** Grammar constrains which merges are legal. Conjunction reduction requires a shared argument. You cannot merge arbitrary propositions.

2. **Semantic proximity:** Propositions about the same entity in the same time frame combine more naturally. Edinburgh NLG course (2012) defines this as requiring a "focus domain" — same entity or event under discussion. https://www.inf.ed.ac.uk/teaching/courses/nlg/lectures/2012/NLG2012Lect10.pdf

3. **Rhetorical prominence:** High-importance information should be in main clauses, not subordinate ones. Embedding important information in a relative clause demotes it to background. This is a reason NOT to aggregate even when grammatically legal.

**Complexity ceiling:** Sentences above ~20–25 words impose cognitive processing costs. Systems that merge greedily until the result is too complex, then start a new sentence, produce better output than those without this check.

### Failure modes

From E2E NLG Challenge evaluations and naturalness evaluation work (Clinciu & Lemon 2019, https://www.sciencedirect.com/science/article/pii/S0885230819300919; arXiv:2006.13268, https://arxiv.org/abs/2006.13268):

- **Isochrony / monotonous rhythm:** Every sentence the same structure and length. Rule-based systems default to averaging. Human writers vary length dramatically — a 3-word sentence after two 20-word sentences creates emphasis.
- **Lack of semantic linking:** Propositions juxtaposed without surface markers of how they connect.
- **Canned text seams:** Fragment boundaries audible as unnatural register shifts.
- **Over-aggregation:** Packing too much into one sentence to avoid repetition. Grammatically valid but cognitively expensive.
- **Uniform information density:** Everything at the same level of detail and emphasis. Important things get more; background gets less.

Human judges detect these failures reliably even when automatic metrics (BLEU) look fine. The mechanical feel is a gestalt, not a single measurable property.

### Lightweight approaches that work

For constrained domains, fragment pools with grammatical type tagging produce output nearly indistinguishable from human-written text. The system in interactive fiction (e.g. Alabaster, ~400+ snippets): fragments tagged by type, small combination rules at the fragment level, no deep syntax tree manipulation.

Source: Sullivan (2009), "Generating narrative variation in interactive fiction." https://www.researchgate.net/publication/45598241_Generating_narrative_variation_in_interactive_fiction

**Rhetorical relation tagging on fragments:** The hardest part of aggregation (choosing the right cue word for subordination) becomes trivial if the fragment itself encodes its relation. A fragment tagged CAUSE can be glued with "because." The author makes the relational decision; the system just applies it.

**Sentence length budget per beat:** Don't combine more than N fragments per sentence, where N is determined by desired pacing. Short beats (action, revelation, emphasis) get N=1. Description or routine gets N=2–3. Hard limit on aggregation that produces rhythm variation without needing to reason about cognitive load.

### Information ordering

**Given-before-new (Halliday theme-rheme / topic-comment):** The most robust principle across the ordering literature. Theme (established/given) precedes rheme (new). Matches English default word order. Fragment that refers back to something already in play goes before fragment that introduces new element.

**Concrete before abstract, specific before general:** Figure-ground spatial research (Choi et al. 2019, *Language and Cognition*, https://schoi.sdsu.edu/docs/Choi_EtAl_Figure&Ground_Language&Cognition_2019.pdf) and perceptual ordering work consistently find foreground/specific elements should precede background/contextual ones.

**For perceptual/sensory description (VITRA system principles):**
- Foreground before background
- Motion/changing before static
- Figure before ground (agent in subject position, spatial reference after)
- Changed state before persistent state (difference from baseline gets described first)

### Surface realization

SimpleNLG (Reiter, University of Aberdeen): canonical lightweight realizer. Takes syntactic specification, handles inflection and linearization. ACL Anthology W09-0613. https://aclanthology.org/W09-0613.pdf

**For authored fragments:** if a human wrote the form, you don't need a realizer. You need aggregation decisions and stitching logic only. The realizer handles form; aggregation handles content arrangement. With authored fragments, form is already handled.

---

## 5. Cross-Sensory Is the Default Case

Many sensory experiences are inherently multi-channel: food involves taste + smell + texture + temperature + sometimes sound. Corrugations are touch + sound simultaneously. A concert is sound + vibration + heat + visual density. The compositor must treat multi-channel as normal, not special.

Each fragment carries a `channels` field (can list multiple senses). The compositor combines fragments from different channels in the same sentence when they share a moment — the same attention order and combination rules apply regardless of whether fragments are from the same sense or different ones.

## 6. Synthesis: Design for the Prose Compositor

### Fragment type vocabulary (minimum viable)

Authors tag each fragment at creation time. The compositor never infers from text.

**Grammatical type:** `main`, `participle`, `absolute`, `adverbial`, `fragment`, `appositive`

**Rhetorical tag:** `cause`, `concession`, `temporal`, `simultaneous`, `contrast`, `continuation`

**NT/state conditions:** what state must hold for this fragment to be available (e.g., adenosine > 60, moodTone = 'low')

### Combination rules

At the fragment level, not deep syntax:

| Combination | Join | Constraint |
|------------|------|-----------|
| main + participle | trailing comma | participial subject = main subject |
| main + absolute | comma before or after | none — absolute floats |
| main + adverbial (temporal) | leading or trailing | use rhetorical tag to pick `while`/`as`/`after` |
| main + main (contrast) | em dash or `but` | rhetorical tag = contrast |
| main + main (continuation) | semicolon or `,` + `and` | rhetorical tag = continuation |
| fragment × N | period-separated or comma-separated | asyndeton for fast; polysyndeton for heavy |
| two equal-salient mains | comma splice or `and...and` | deliberate; overwhelm register |

### Ordering rules

1. Involuntary body → deliberate visual → ambient/auditory (attention order)
2. Given/established → new/observed (theme-rheme)
3. Changed state → persistent state
4. Short main clause → longer elaboration (end-weight)
5. Most important item in final stress position unless deliberately foregrounded

### NT state → structure selection

The compositor selects a combination pattern based on NT state, then fills it with available fragments:

| NT state | Structure pattern |
|---------|-----------------|
| Calm | main + participials + subordination; cause→effect ordering |
| Anxious | short declaratives; asyndeton; no subordination |
| Dissociated | fragment strings; grammatical equality of body and environment; no interpretation in final clause |
| Overwhelmed | polysyndeton; run-on; four+ fragments |
| Heightened/ecstatic | long accumulating sentence; participials that keep adding |
| Depressed/flat | observation `and` failure-to-act; deflating final clause |

### Pacing budget

- 1 fragment standalone = emphasis, immediacy
- 2–3 = normal description
- 4+ = deliberate overwhelm (use with intention)

Never produce uniform sentence lengths. The system must be able to produce a one-fragment sentence.

### Failure modes to avoid (from NLG literature)

- Isochrony: varying length is mandatory, not optional
- Over-aggregation: build in a case where one fragment stands alone
- Canned seams: fragment pool must be large enough and fragments must genuinely fit their types
- Semantic distance: don't combine fragments about different entities or time points without a connective that marks the distance

### The key insight

The compositor doesn't need to understand grammar deeply. It needs:
- Typed, rhetorically-tagged fragments (authored)
- A small set of combination rules at the fragment level
- NT state → structure pattern selection
- An ordering algorithm

The quality ceiling is the quality and coverage of the authored pool, not the sophistication of the rules. If output feels assembled, the problem is almost always the pool.

---

## 6. Open Questions for Implementation

- What is the minimal fragment type vocabulary that covers the cases the game actually needs?
- How do ambient/always-present sensory facts (coil whine, fridge hum) differ architecturally from state-triggered facts (stomach gurgling from hunger)?
- Should fragments encode their own conditions, or should the compositor query state independently?
- How does the compositor handle the case where no fragments are available for the current state? (Silent is fine; a forced ill-fitting combination is not.)
- Where do sensory fragments live in the codebase — in `content.js` alongside other prose, or in their own module?
