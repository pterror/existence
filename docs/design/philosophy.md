# Simulation Philosophy

The principles behind how the simulation is built — above any specific system, applying to all of them.

---

## The simulation models real things

Not abstractions of real things. Not metaphors for real things. The things themselves, at whatever fidelity the implementation currently supports.

A dish you ate from is dirty. The shirt you wore yesterday is somewhere. Your serotonin level is shaped by sleep quality, tryptophan availability, and time. The rent is due on a specific day because that's when your landlord set it up, and that day is different from your neighbor's. None of this is arbitrary. None of it is decorative. The simulation is honest about how the world works, and when it can't be yet, it says so.

---

## Every system is an interface

No simulation system is its current implementation. Every system — neurochemistry, clothing, dishes, finances, relationships, job standing, weather — exposes a stable interface that content and prose can talk to. What sits behind the interface can vary: simpler implementations, richer ones, different models entirely.

**The interface is designed for maximum fidelity.** It expresses what the system would need to say if the implementation were as complete as possible. Simpler implementations approximate within that contract — they never constrain it downward. You can always write a fuller implementation behind the same interface. You can never add fidelity to an interface that was designed for coarseness without breaking everything that talks to it.

This matters in practice: when adding a new system, design the interface for what it would look like fully realized, then implement whatever fidelity makes sense now.

---

## Granularity is per-run

Different runs can have different implementation fidelity behind the same interfaces. A run created when clothing was tracked as counts uses a coarse clothing implementation. A run created after full per-item tracking was written uses the full one. Both load and replay correctly. The RunRecord stores which implementation each subsystem was created with.

Granularity never changes mid-run. It is fixed at run creation and stable forever after. The engine hotswaps implementations when switching between saves.

A simpler implementation is a legitimate permanent choice for a run — not a development placeholder to be replaced. What's not legitimate: an implementation that closes off full fidelity in the interface itself.

---

## Scalars are approximations; approximations are debts

A scalar standing in for something richer is a debt, not a design choice. `apartment_mess: 67` is a debt — it pretends to represent the state of specific objects (clothes, dishes, surfaces) that actually have independent states. The debt comes due when prose needs to say something specific the scalar can't support.

Some scalars are genuinely right: money is a scalar because money is fungible. Financial anxiety is a scalar because it's a real emergent feeling, not a stand-in for something else. These aren't debts.

The test: *does this scalar represent a real quantity, or is it standing in for something with more structure?* If the latter, it's a debt. Name it as such. Plan to pay it.

---

## Prose reveals; simulation enables

Prose is what the player experiences. The simulation is what makes the prose honest.

Prose that says "the shirt you've worn three days running" requires the simulation to actually know which shirt, how many days, and whether it's been washed. Prose that says "dishes in the sink" requires a real count of dirty dishes in a real location. When prose gets ahead of the simulation — when it claims specificity the simulation can't support — the fiction breaks. The player may not know why. But something feels off.

The solution is never to make the prose less specific. It's to deepen the simulation until the prose is telling the truth.

---

## The goal

A simulation detailed enough that every sentence the prose might want to say is something the simulation actually knows. Not soon. But that's the direction.
