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

**Hidden backstory.** Not yet implemented. If the player doesn't know the
character's history, they can't optimize from it. They can't think "my character
has financial anxiety, so I should prioritize money." They just notice, over time,
that certain things create a specific kind of unease — the same way you'd notice
things about yourself without being able to narrate the cause. The backstory drives
the simulation invisibly. The player experiences the outputs without access to the
inputs.

This is the principle extended inward: not just "you can't see the simulation's
numbers" but "you can't see the history those numbers came from."

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
