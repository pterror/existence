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

## Amnesia and DID

Two specific cases worth designing for separately.

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

## The through-line

All of these — hidden stats, opaque constraints, hidden backstory, amnesia, DID —
are expressions of the same design principle: **the player should have no more
information about the character than the character has about themselves.**

Most games give the player more. Existence gives the player the same. The goal
is that the player's experience of uncertainty, confusion, and gradual understanding
mirrors what it would actually feel like to be inside that life.

The "power anti-fantasy" framing is about constrained agency without judgment.
The player-character collapse is what makes the constraint feel real rather than
artificial — it's not a mechanic limiting you, it's just what the day is like.
