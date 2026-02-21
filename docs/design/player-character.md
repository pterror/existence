# Player–Character Relationship

## The problem with options

Most games present a character as an object the player operates. "You are playing
as X." Here are X's stats. Here are X's options. Pick one. The player is a
decision-maker at a remove — they have information the character wouldn't have
(health bars, probability readouts, exhaustive option lists), and they use it to
optimize toward goals the game makes explicit.

This creates distance. The player's relationship to the character is managerial.
The emotional content of the fiction is something to be appreciated from outside,
not something to be inside of.

Existence already resists this. Hidden stats mean there's no optimization surface.
Opaque constraints mean the option list isn't exhaustive — things just aren't there
when they can't be. Second-person address collapses the naming gap. No explicit
goals means there's no external score to maximize.

But there's a further step: designing the game so the player isn't *choosing for*
the character but is *being* the character. Not "what would this person do?" but
"what do I do?" The distinction sounds small. The design implications aren't.

---

## Mechanisms that collapse the distance

**Hidden stats.** Already implemented. You can't see energy, stress, NT levels.
You feel them through what's available and how the prose reads. Same as real life:
you don't read your cortisol level, you feel tense.

**Opaque constraints.** Already implemented. Things just aren't there. No
explanation. No locked-door icon. The option space at any moment is the option
space — you don't know what's missing.

**No explicit goals.** Already implemented. The game doesn't tell you what to do
or what winning looks like. The day has to be lived, not optimized.

**Hidden backstory.** Not yet implemented — and should be opt-in, not mandatory.
Two valid modes, not a hierarchy:

*Visible backstory (sandbox mode):* The player knows who they are and where they
came from. They can watch cause and effect play out from a position of knowledge —
observe how the financial history shapes anxiety, how the personality parameters
bend the emotional drift. More like reading a novel with the character's history
in hand. A legitimate experience in its own right: the simulation is the thing,
and understanding it is part of the pleasure.

*Hidden backstory (immersion mode):* The player has no narrative access to the
history that generated the character. They can't think "my character has financial
anxiety, so I should prioritize money" — they just notice, over time, that certain
things create a specific kind of unease. The backstory drives the simulation
invisibly; the player experiences the outputs without the inputs. The principle
extended inward: not just "you can't see the simulation's numbers" but "you can't
see the history those numbers came from."

All modes run the same simulation. The difference is what the player is given to
start with, and when. Three options at chargen:

- **Never shown:** backstory generates and is immediately sealed. You begin with
  no narrative access and no memory of having had it. The most committed immersion
  mode.
- **Shown, then sealed:** you see the full history, then choose to let it go. A
  meaningfully different experience from never-shown — you *knew* and chose not to
  carry it forward. The act of sealing is itself part of the fiction.
- **Shown, kept:** sandbox mode. History in hand throughout. The simulation is
  the object of attention.

---

## The pretending-to-be-someone-else mode (player side)

One design direction: the player is explicitly framed as someone putting themselves
in the character's shoes. Not "you are this character" but "you are pretending to
be this character" — and the game holds you to it.

This sounds like it creates more distance, not less. But the mechanism is the
opposite: the game refuses to give you the god's-eye view that would let you play
*at* the character rather than *as* them. You don't get a summary of who they are
before you begin. You don't get their history. You learn it the way they would —
through what the apartment looks like, what the phone says, what their body feels
like when they wake up. You're not given a character sheet. You're given a morning.

The hidden backstory is what enforces this. Without knowing where the character
came from, the player can't construct an external model to optimize. They have to
just... be in it. The pretending becomes genuine because the information gap is real.

---

## Internal plurality

Amnesia and DID are the first two cases — both involve the character having less
access to their own history or inner landscape than the player would expect.
The broader plurality spectrum continues past DID: median systems, non-trauma
plurality, headmates of various origins, roleplay-derived presence. All require
the simulation to hold multiple possibilities rather than assuming a single unified
self is the baseline.

### Amnesia

The character has a history — it generated their personality, their financial
position, their relationships — but they don't have access to it. The simulation
runs on backstory the character can't narrate. Why does this street feel like
something? Why does that name land differently? The player experiences the outputs
of a history without being told the history.

Mechanically: backstory generates parameters as normal. The prose never references
the backstory directly. The character's body and reactions carry it — NT targets
shaped by old sentiments, financial anxiety from old patterns — but no expository
access. The past is present without being legible.

### DID (Dissociative Identity Disorder)

More structurally complex. Different alters hold different memories, different
relationship knowledge, different internal states. The host might not know what
happened during another alter's time. The character "comes back" and hours have
passed. The action log is haunted — things were done that the current self doesn't
recognize.

Mechanically this would mean:
- Multiple personality parameter sets (each alter has different neuroticism,
  self-esteem, rumination → different effective inertia, different emotional
  processing during sleep)
- Different relationship knowledge per alter (one knows the coworkers by name,
  another experiences them as strangers)
- Time loss as a real game mechanic — the replay scrubber shows actions the
  current alter didn't perform; the player can watch what happened but the
  character can't
- Sentiments that differ per alter — one alter's accumulated work dread isn't
  accessible to another; switching states means the emotional landscape shifts

The existing replay architecture actually supports part of this already — the
action log is a complete record. The question is what the character has access to
within that record.

DID is a constitutional condition in the game's model (not circumstantial — it
arises from developmental factors, not purely from life events), which means it
could be assigned at chargen from prevalence data when that system is built out.

**Discovering alters**

In real experience this isn't a sudden reveal — it's a slow accumulation of
evidence. Unfamiliar handwriting. Objects you don't remember buying. People who
know your name and you don't know theirs. Time loss you've been explaining away.
The game's existing structure produces exactly this: the action log is a complete
record of what happened; the character only has access to some of it. Discovery
would emerge from the gaps — noticing the pattern of what's missing, finding
evidence in the apartment that doesn't match memory. It shouldn't be announced.
It should be something the player pieces together from the simulation's outputs,
the same way it happens in real life. The replay scrubber showing unfamiliar
actions is the mechanism; the realisation is the player's.

Critically: the fronting alter is almost certainly masking — even without knowing
they have DID. Covering the gap, deflecting, performing competence. This is the
default social survival response to confusion and disorientation. The prose
shouldn't signal distress at the unknown person; it should show the character
smoothly navigating around it — and the player notices the navigation itself is
strange. The mask is the tell, not the gap.

The rendering principle is **as invisible as possible.** Not a UI problem to solve
with indicators, but a prose problem to solve with consistency.

For contacts and saved names — another alter saved them, so the name is right
there in the phone, legible. The current alter just doesn't have the context for
who it is. You can see the name. It doesn't help. More unsettling than any
placeholder, because the information gap isn't in the data — it's in you.

For narration — no name slot at all. Just description, consistently: "the person
at the counter," "someone who called you by name," "the one who always nods."
No indicator that a name should be there. The absence only becomes visible in
retrospect, when the player notices they've been reading "the person at the front
desk" for three visits while other characters get names. The uncanny emerges from
the pattern, not from a marker.

**Co-fronting**

Two or more alters present simultaneously — not a clean switch but a blended
state where knowledge, emotional tone, and relational memory overlap and sometimes
contradict. Not averaging: co-fronting isn't a midpoint between two alters, it's
two voices with different information and different relationships to the same
situation, both present at once.

The current single-alter model assumes one personality parameter set driving the
simulation at a time. Co-fronting would require something more complex than a
weighted blend — specific things it produces that would need modelling:

- **Partial access:** one alter knows who this person is, the other doesn't. The
  result isn't `???` or full knowledge — it's almost-recognition. A name that's
  almost there. Familiarity without content. The prose renders this differently
  from clean absence.
- **Emotional contradiction:** one alter's sentiment toward a situation conflicts
  with another's. Not blended into a middle tone but genuinely split — ambivalence
  as simultaneous rather than sequential. The NT model would need to express two
  competing targets rather than one.
- **Inter-alter negotiation:** co-fronting is sometimes how alters communicate or
  work out who handles what. One surfaces to manage something the other can't.
  The internal experience isn't necessarily smooth — it can be effortful,
  disorienting, or collaborative depending on system dynamics.
- **Instability:** co-fronting states are often less stable than single-fronting.
  More susceptible to full switches. The simulation would need to reflect that
  increased volatility.

Co-fronting connects directly to the antipsychotic question — one of the things
suppressed is exactly this capacity. The medication making the system "quieter"
means this blended, negotiated state becomes less available. Alters that were
co-fronting to cooperate lose that channel. Whether that reads as calm or as
loss depends entirely on the system.

**Median systems**

Between singular and fully plural. Not one unified self, but not distinct separate
alters with clean switches either — a spectrum of presence along a continuum. Parts
bleed into each other. Boundaries are permeable. There may be a dominant core that
most experience comes from, with other parts influencing rather than fronting fully.

Specific characteristics that need modelling differently from DID:

*No clean switches* — parts don't take over, they shade the experience. The
dominant voice is still present but coloured differently. More like weather
affecting a landscape than one person leaving and another arriving.

*Shared memory with different emotional ownership* — the memory is accessible to
all parts but the relationship to it differs. One part's significant moment is
another part's neutral data. Not amnesia — emotional foreignness to your own past.

*Parts as aspects rather than persons* — some median systems describe parts as
facets of a self rather than independent beings. A part that handles social
situations, one that manages stress, one present for creative work. Less distinct
personalities, more modes that have developed enough coherence to be distinguishable.

*Instability of the core* — the "main" self isn't always clearly located. Some
days the core feels solid; other days it's unclear who's actually running things.

Mechanically this is the most interesting case for the simulation because it maps
most directly onto what the NT system already models — continuous variables rather
than discrete states. The mood-primary systems drifting, personality parameters
shaping inertia, emotional tone varying day to day — these already produce something
like "the landscape is coloured differently today." Median experience might be less
a separate system to build and more an honest description of what the simulation is
already doing for everyone, taken seriously. The question is whether the prose and
available actions reflect that the variation has internal structure — that today's
colouring isn't random drift but a recognisable part coming through.

*Coalescence from prior plurality* — median systems can form from more distinct
plural systems moving toward less boundaried states over time. Parts that used to
fully switch now bleed; walls between them became permeable rather than removed.
The parts didn't disappear — they became less separated. Residual emotional
differentiation remains, shared memory is more accessible, but the distinct
presences are still traceable in the texture of experience.

This is distinct from clinical integration ("becoming one person"), which is
contested as a treatment goal for exactly this reason — many systems resist it not
because they haven't done the work but because parts don't want to stop existing,
and singularity imposed on a functional plural system causes its own harm.
Coalescence is movement along the spectrum, not arrival at an endpoint.

Two variants: coalescence from trauma-origin plurality (DID/OSDD system becoming
more median, parts still carrying different emotional ownership of the past) and
coalescence from non-trauma plurality (endogenic or tulpa systems where parts
became less distinct through closeness or shared experience rather than therapeutic
intervention). Mechanically both suggest parameter sets that are partly blended,
partly distinct — and the degree of blending as a variable that can itself shift.

**Headmates who aren't alters**

The DID model covers one origin of plurality. The broader plurality community
includes systems that didn't form through trauma at all — and the game's
no-judgment principle applies here more visibly than almost anywhere else. The
simulation shouldn't treat plurality as inherently a disorder.

Some distinct categories:

*Tulpas* — deliberately created through sustained focused practice. The tulpa
develops their own personality, perspective, and agency over time. Origin is
intentional rather than trauma-response, with roots in Tibetan Buddhist practice
adopted and developed independently by the modern tulpa community. The relationship
with the host is typically known and cooperative from the start — no discovery arc,
no amnesia, often high inter-headmate communication.

*Endogenic systems* — plural without a trauma history. The clinical model ties
plurality to trauma (DID/OSDD), but many people identify as plural without that
origin. Contested in psychology; real as a self-identification. The plurality is
simply how they are.

*Walk-ins* — headmates experienced as having arrived at some point rather than
always having been present. The system composition changes over time.

*Soulbonds* — headmates perceived as connected to fictional characters or real
people. A distinct presence with their own perspective that originated outside
the person.

*Writer's characters as headmates* — overlaps with soulbonds but from the opposite
direction. Soulbonds typically arrive (a character from outside comes to live in
the system); a writer's character-headmate emerges from the inside out. You create
them, author them, give them voice — and at some point the distinction between
"character I'm writing" and "presence in my head" becomes unclear or dissolves.

Common among writers and not always framed as plurality: "my character told me
what they wanted to do," "I couldn't make them do that," "they surprised me."
Usually treated as metaphor for the creative process. At some point on that
spectrum it stops being metaphor.

Specific things this raises:

The authorship question — did you create them or discover them? Many writers
describe finding a character rather than inventing one, especially characters who
develop strong independent voices. The line between authored and emergent is
genuinely unclear, and may not resolve.

Fictional origin, real presence — the character carries context from a world that
doesn't exist. They know things about that world and don't know things about the
real one. The disjunction between their origin-context and the present reality is
its own kind of experience, distinct from any other headmate type.

Writer's block as inter-headmate conflict — if a character-headmate doesn't want
to go where the narrative is going, is that a creative problem or a relational one?

The ethics of authoring someone you live with — if a character becomes a genuine
presence, what does it mean to write them badly, kill them off, let readers
misinterpret them? The creative relationship becomes something else.

Mechanically: fictional-origin context means a headmate whose frame of reference
is a different world entirely — something the simulation doesn't currently model
anywhere. Their partial knowledge of the real world isn't amnesia or alter-boundary;
it's ontological. They're oriented toward a world that isn't here.

*Roleplay immersion and character bleed* — adjacent to writer's-character headmates
but the mechanism runs in the opposite direction. A writer authors a character who
develops independent presence (character comes toward the writer). A roleplayer
performs a character who starts to bleed into the default self (roleplayer goes
toward the character). The result can be similar; the directionality differs.

Character bleed: the character's emotional state persisting after the scene ends,
their speech patterns surfacing in ordinary conversation, their perspective
intruding on the roleplayer's own reactions. At high intensity or over long
duration it can feel less like playing a character and more like hosting one —
the question of who's running things becoming genuinely unclear.

The social dimension distinguishes this from solo writing: roleplay exists in
relation to other characters and other players. The relational context anchors
the presence more strongly than solo authorship would. The character has a history
of interactions, relationships, conflicts — a weight of accumulated presence that
wasn't generated alone and can't be dissolved alone either.

Mechanically, non-trauma plurality requires a different chargen model — not
assigning from trauma-derived prevalence data, and potentially allowing the player
to construct or acknowledge headmates rather than discover them. The co-fronting,
partial knowledge, and emotional-contradiction mechanics from the DID section may
all apply, but without the hidden-discovery narrative arc and without the amnesia
dynamics.

The antipsychotic question cuts differently here too. If the plurality isn't
pathological, the medical system's framing is wrong in a different way than the
DID misdiagnosis case — not "treating the wrong condition" but "treating something
that isn't a condition." The suppression of inter-headmate communication is the
same mechanical effect; the context around it is completely different.

**Antipsychotics and inter-alter communication**

This is contested and requires careful handling. Some people with DID report that
antipsychotics (especially older typicals, but also some atypicals) suppress or
blur communication between alters without integrating the system — a chemical wall
rather than resolution. The internal world becomes quieter, but not in a good way:
the communication that was enabling cooperation between alters is lost. Alters
that were coordinating, sharing information, negotiating — that capacity diminishes.

This is distinct from what the medications are prescribed for. DID is frequently
misdiagnosed as schizophrenia; the antipsychotics are treating a misdiagnosis.
A medication working correctly from a clinical standpoint and being actively
harmful to the person's internal system aren't mutually exclusive. The harm isn't
a side effect in the usual sense — it's the primary effect landing on the wrong
target.

Mechanically this is a different kind of simulation layer than anything currently
modeled. Substances currently affect NT levels and drift rates. Antipsychotics
in a DID context would affect something structural — not just how the NTs move,
but which alter has access to which memories, which relationships, which parts of
the apartment feel familiar. A substance that reshapes the topology of who is
present, rather than the quality of presence. That needs its own design pass when
the DID system is built — it can't be approximated as a simple NT modifier.

---

## External attachment without reciprocity

A different design space from internal plurality: relationships and attachments
that are real on one side and absent or mediated on the other. No internal
structure to the self is implied — this is about the shape of connection to things
outside. The emotional mechanics overlap with real social connection (NT targets,
contact timers, guilt, loneliness) but the structure is systematically asymmetric
in ways the current social model doesn't yet capture.

*Parasocial relationships* — an attachment to someone who doesn't know you exist.
The relationship is real on one side and absent on the other. You accumulate
knowledge of them, emotional history with them, a felt sense of knowing them —
none of it reciprocated or even registered.

The game partially models the relevant machinery already — contact timers, guilt
accumulation, serotonin target influence from social connection. A parasocial
relationship uses similar emotional mechanics but the "contact" is entirely
mediated and one-directional. No messages arrive. No guilt accumulates from their
side. The absence doesn't compound the same way because there's no expectation of
reciprocation to violate — but the attachment affects NT state regardless.

Specific things it produces that differ from real friendship:

*Intimacy without exposure* — you know a great deal about them, they know nothing
about you. No vulnerability on your side, no risk of rejection. Part of the appeal;
part of what makes it structurally different from friendship even when it feels similar.

*Grief at asymmetry* — moments where the one-sidedness becomes impossible to
ignore. They mention their actual friends, their actual relationships. The gap
between felt closeness and structural reality surfaces briefly and is then
suppressed or rationalised.

*Community as partial substitute* — fans of the same person, same creator, same
character. Real relationships mediated through the shared parasocial object.
The community can be genuine; the centre of it is still one-directional.

*Loss without acknowledged relationship* — if the person dies, retires, does
something that breaks the attachment. Grief that has no social legitimacy because
the relationship wasn't recognised as real. Nowhere to put it.

Simulation note: parasocial attachment probably buffers against isolation without
fully filling the social need — producing a specific low-grade deficit that's
hard to name. Social score partially maintained, connection quality not. The gap
between those two things is where the feeling lives.

*Fan communities* — where the one-directional parasocial attachment gets a social
structure around it. The parasocial relationship is you and the object; the fan
community is you, the object, and everyone else who relates to it the same way.
Distinct from pure parasocial in that the relationships inside the community are
real and do fill the social need — but they're organised around and often dependent
on the shared object.

Things fan communities produce that parasocial relationships alone don't:

Real relationships mediated through shared attachment — friendships that are
genuine but contingent. What happens when you fall out of the fandom, or the
creator does something that breaks the attachment for you but not for your friends?

Identity as fan — for many people fandom is identity-constitutive, not just
descriptive. Leaving can feel like losing part of yourself, not just an interest.

Fan labour — fanfic, fanart, analysis, community moderation, event organisation.
Real creative and emotional work done in service of something the creator may not
even know exists. The labour is real; recognition is absent or asymmetric.

Fandom as found family — particularly for people isolated in other parts of their
life. The community fills social needs that geography or circumstance makes
otherwise difficult. The fandom may be the primary social world.

Purity culture and internal conflict — fan communities develop their own norms
and enforce them intensely. Who's a real fan, who's problematic, what's acceptable
to enjoy. The community that provides belonging also polices it.

Creator-fandom rupture — the creator does something that breaks the community.
The shared object becomes contested or lost. The social structure built around it
destabilises. Grief for the community compounds grief for the object.

Simulation note: fan community membership has real connection quality — unlike
pure parasocial consumption it does fill the social need. But the social score is
partially contingent on the shared object remaining intact. A rupture event can
collapse social connection rapidly in a way that has no good equivalent elsewhere
in the current model.

*Real person fiction (RPF)* — fan fiction written about real people rather than
fictional characters. Usually celebrities, musicians, athletes — people the writer
has a parasocial relationship with. RPF sits at the intersection of the two
previous entries: the subject of the parasocial attachment becomes the subject of
the fiction.

The epistemic situation is specific. The writer knows the version they're writing
is constructed — they don't have access to who this person actually is, only to
the public-facing persona accumulated through consumption. But writing someone
extensively, giving them voice, imagining their interiority, creates a felt sense
of knowing them that exceeds what pure consumption produces. The constructed
version can feel more intimate than the real one, because you built it.

The exposure asymmetry is different from both parasocial consumption and regular
fan fiction. Writing fiction about a fictional character carries no ethical
exposure to a real person. Watching a creator's content exposes nothing. RPF
produces something about a real person who could, in principle, find it — and
who didn't agree to be the subject. The writer typically knows this; it's usually
held in tension rather than resolved. Community norms around what's acceptable
(no real-person explicit content posted publicly, no "tinhatting" — treating
fiction as real) are partly responses to this exposure risk.

Shipping — romantic or romantic-coded RPF — adds another layer. The feelings
driving the fiction may be genuine: a parasocial attachment that has developed
enough emotional weight that the writer processes it through narrative. The
fictional version of the person becomes a stable object for attachment that
the real person can't be. Grief at asymmetry applies here in a specific form:
the fictional version is responsive, present, knowable; the real person is
structurally inaccessible.

The canon/fanon split applied to a real person: "canon" is the documented public
record; "fanon" is community consensus about who they are that may have little
to do with evidence. The gap between the two is where most RPF lives. The
community builds a shared constructed person — consistent enough across fics to
have accumulated lore, characterisation, internal relationships — that is
genuinely a collective fiction even when its subject is real.

Simulation note: for a character who writes RPF, the fiction-writing process is
itself emotional processing — not just exposure to parasocial content but active
production. The constructed intimacy of authorship means the parasocial attachment
may run deeper than consumption-only attachment while being even further from
anything reciprocal. It also means creative block or the writing going wrong can
be emotionally significant in ways that differ from other kinds of writing.

---

## The through-line

All of these — hidden stats, opaque constraints, hidden backstory, amnesia, DID,
parasocial relationships, RPF — are expressions of the same design principle: **the player should have no more
information about the character than the character has about themselves.**

Most games give the player more. Existence gives the player the same. The goal
is that the player's experience of uncertainty, confusion, and gradual understanding
mirrors what it would actually feel like to be inside that life.

The "power anti-fantasy" framing is about constrained agency without judgment.
The player-character collapse is what makes the constraint feel real rather than
artificial — it's not a mechanic limiting you, it's just what the day is like.

---

## Extension points (not yet explored)

This document covers what's been thought through. Areas where the design space
clearly continues but hasn't been mapped:

- **Chronic illness and disability** — constitutional conditions that shape daily
  capacity without being visible to the simulation or player as labels. Different
  from episodic conditions (migraine, pain flare) and from backstory-derived
  conditions. How invisible illness shapes what the day allows.
- **Gender and transition** — the gap between internal and performed self; the
  social legibility question; passing, being clocked, the weight of constant
  social navigation. Distinct from plurality but shares the "interior and exterior
  don't match" structure.
- **Race and social navigation** — similar structure: a dimension of self that is
  always being read by others, often incorrectly, requiring constant calibration.
  The cognitive and emotional load of that navigation as simulation state.
- **Class performance** — the work of appearing to belong to a different class
  than you were raised in, or of code-switching between contexts. Related to
  backstory but distinct.
- **Religion and apostasy** — faith as a structure that organises meaning and
  social belonging; leaving it as a specific kind of loss with no clean analogue.

Each of these opens more design space than this document can address. They're
named here so they aren't forgotten, not because they're close to implementation.
