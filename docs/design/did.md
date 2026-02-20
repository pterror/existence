# Dissociative Identity Disorder — Design Exploration

This is an exploration, not a specification. DID is the most complex condition the game could model because it doesn't just modify parameters — it changes who is experiencing the game.

## The Core Challenge

The player is one person at a keyboard. The character is a system — multiple alters sharing one body, one apartment, one phone, one life. How does the game make this feel real without turning it into a party management sim?

The answer has to be the prose. Text carries everything. If the game's voice changes — what it notices, what it cares about, how it describes the same room — that's the shift. No UI, no announcement, no "You are now Alex." Just: the world feels different. You might not know why. You might not know it happened until later.

## Play Modes

### Playing as one alter

The simplest model. The player is one specific alter. The others front when they front — the game simulates their decisions as NPC actions. When the player fronts again:

- Time has passed. Maybe minutes, maybe hours, maybe a day.
- The world has changed. Different clothes. The fridge is different. The apartment is cleaner or messier. You're somewhere you don't remember going.
- The phone has evidence. Sent messages, calls made, conversations with people. You read them like someone else's life, except it's your body's life.
- The action log recorded everything. On replay, those NPC actions play out. You can watch what happened. Or you can't, depending on the alter's relationship with memory.

This creates the blackout / lost time experience. It's the ultimate constrained agency — your body kept going without you. You live with the results.

**Needs:** An NPC decision system. Each alter has personality parameters that drive action selection from available interactions. How they spend time, whether they eat, whether they go to work, how they respond to messages. This is a significant system but it's also useful beyond DID — any "time passes without you" mechanic needs it.

### Playing as all alters

Harder. The player acts as whoever is fronting, but switching between alters shouldn't feel like switching characters. It should feel like... being a different version of yourself. The same body, the same apartment, but a different relationship to everything in it.

**How it should feel:**
- You wake up. The prose describes the morning. You do things. At some point — not at a point you chose — the quality of the experience changes. Different things matter. Different interactions feel natural. You might not notice the shift happened. You just... were doing something, and now you're doing something else, and the room feels different.
- This is how alter shifts often feel from the inside. Not a dramatic "someone else is driving." More like: your priorities shifted, your energy is different, the thing you were worried about isn't the thing you're worried about anymore. Sometimes you don't realize it happened until later.

**How the game does it:**
- Different alters have different prose voices. Not dramatically different — subtle. Word choice, sentence length, what gets noticed, what gets ignored.
- Different alters have different available interactions. One alter cooks. One doesn't. One cleans. One can't. One answers the phone. One avoids it. The interaction set shifts, and the player naturally does whatever's available without being told "you're someone else now."
- Different alters have different relationships. The friend who feels warm to one alter feels threatening to another. The coworker who's easy for one is exhausting for another. The same person, described differently.
- Different alters have different energy patterns. One has more capacity. One has less. The energy number might literally change on a switch — not because energy was added or removed, but because the alter's baseline relationship to the body's energy is different.

**The risk:** If the shifts are too subtle, the player doesn't notice and just thinks the game is inconsistent. If they're too obvious, it feels like a character swap. The middle ground is: the player feels something changed, doesn't know what, and over time starts to recognize the patterns. "Oh, when the prose gets shorter and I stop wanting to check the phone, that's... someone else."

### Co-fronting

Multiple alters present at once. Not a dialogue between characters — internal texture. The prose contains contradictions that aren't bugs:

- "You reach for the phone. You don't want to reach for the phone."
- "The message is from Sasha. She's your friend. She's not your friend. She's someone who knows a version of you that isn't this one."
- "You should eat. The idea of eating is impossible. Both of these are true at the same time."

Co-fronting isn't a mechanic. It's a prose mode. The game's voice becomes plural without announcing it. The available interactions might include conflicting options — comfort food and not eating, checking the phone and avoiding the phone. Not as a choice between alters, but as the genuine experience of wanting two contradictory things simultaneously.

## Memory

Memory between alters varies. This is a spectrum, not a binary:

**Full amnesia** — no knowledge of what happened while not fronting. The blackout experience. You check the phone to find out what you did. The apartment is evidence.

**Partial awareness** — vague impressions. "Something happened at work today. You're not sure what, but there's a feeling attached to it." The prose renders partial memory as emotional residue without factual content.

**Co-consciousness** — aware of what happened but it felt like watching, not doing. "You remember the conversation with Marcus. You remember what your mouth said. It wasn't what you would have said."

**Full sharing** — everyone knows everything. Less dramatic but still present — you have the memory but it doesn't feel like yours. The emotional coloring is different.

The game models this as: how much of the action log is visible/comprehensible to the current alter. Full amnesia means the player literally doesn't know what happened (actions between their fronting periods are hidden or rendered as gaps). Full sharing means the player sees everything but the prose frames it differently.

## The Phone, Specifically

The phone is the most loaded object for a system. It contains:
- Messages sent by alters you might not know about
- Conversations with people who know a version of you that isn't you
- Evidence of decisions and relationships you didn't choose
- Possibly different contacts for different alters
- Possibly a journal or notes between alters ("Hey, don't forget we have work tomorrow. — A")

The phone becomes internal communication infrastructure. Not a game mechanic — the thing a real system might actually use their phone for.

## The NPC Decision System

When an alter is fronting as an NPC (the player isn't controlling them), the game needs to decide what they do. This isn't full AI — it's personality-weighted action selection:

Each alter has:
- **Priorities** — what they care about (work, food, social, cleaning, isolation, creative output, etc.)
- **Avoidance** — what they won't do (check phone, go outside, talk to people, look at bank account)
- **Energy relationship** — how much capacity they have relative to the body's state
- **Social map** — who they have relationships with, who they avoid

The NPC system looks at available interactions, filters by the alter's avoidance list, weights by priorities, and picks. The selection consumes RNG deterministically. The same seed, the same alter, the same state = the same decisions.

This is a significant system. It's also reusable: any mechanic where "time passes and someone else was driving" (dissociation, blackout, autopilot, sleepwalking) could use the same infrastructure.

## What This Isn't

**Not a superpower.** DID in media is often treated as having "multiple personalities" that are useful or dramatic. In this game, it's a constraint. It's waking up and not knowing what happened. It's losing time. It's relationships you didn't build and consequences of decisions you didn't make. It's the specific loneliness of sharing a body.

**Not a plot device.** The game doesn't use DID to create mystery or drama. It models it as daily experience. Most days are ordinary. The dishes still need doing. Work still expects you. The difference is that "you" isn't always the same "you," and that's just... how it is.

**Not separate characters.** Even in the "play as all alters" mode, this is one game, one life, one body. The alters aren't party members. They're facets of one experience. The game's job is to make that feel true.

## Open Questions

- How does chargen work for a system? Do you create all alters? Does the game reveal them over time?
- How does the player discover they're playing a system, if that's not established upfront? Or is it always established?
- What's the right granularity for alter differences? Full separate personality parameters? Or more like "lenses" that modify how the same parameters are experienced?
- How do alter-specific relationships work? Does Sasha know there are multiple alters? Does she interact differently with different ones?
- What about integration? Is that something the game models? Is it an ending? Is it even desirable in the game's framing?
- How does the save system work? Is the "run" tied to one alter or the whole system?
