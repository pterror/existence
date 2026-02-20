# Domestic Object Systems

The apartment contains real things. Those things have real state. The simulation tracks them — not as aggregate scalars, but as objects with histories.

This document applies the principles in [philosophy.md](philosophy.md) to the specific case of domestic objects. Read that first. A dish you ate from is dirty. The shirt you wore yesterday is on the chair. The towel from this morning is still damp. These facts exist whether or not the player looks.

This document describes the architecture for tracking domestic objects and the principles behind it.

---

## The Problem with Scalars

`apartment_mess: 67` is a lie. Not because 67 is wrong but because it implies the apartment has *a* mess level. It doesn't. It has specific things in specific states: four plates dirty in the sink, a pair of jeans on the bedroom floor, a damp towel draped on the tub. These are independent. Doing the dishes doesn't move the jeans. Picking up the floor doesn't clean the sink. A scalar erases that independence and forces prose to pretend at specificity it can't support.

The fix isn't better thresholds. It's tracking the things.

---

## Design Principle: Interface for Full Granularity, Implementations Vary

Each domestic object system exposes a stable interface designed for **full granularity** — the richest possible model of that system. Multiple implementations can exist behind the interface, from simple count-based approximations to full per-item tracking. Both are legitimate. Neither compromises the interface.

A coarse implementation is allowed to be permanently coarse. A full implementation is allowed to be permanently full. What's not allowed: designing the interface to the lowest common denominator, which would foreclose full precision from ever being expressed.

**In practice:** `Clothing.itemsOnFloor('bedroom')` returns a list of items. A coarse implementation returns generic placeholders ("a shirt", "a pair of jeans") synthesized from counts. A full implementation returns tracked named objects with their histories. Content calls the same method either way.

### Granularity is per-run

Each RunRecord stores which implementation each subsystem was created with. Loading a save instantiates the appropriate implementations. A run created under coarse clothing tracking stays coarse. A new run created after full tracking is written gets full. Both load correctly. There is no mid-run migration.

The engine hotswaps implementations between saves, not within them.

---

## What Replaces `apartment_mess`

`apartment_mess` goes away as a primary variable. Mess becomes emergent: the bedroom reads as cluttered because there are actual items on the floor; the kitchen reads as messy because there are actual dirty dishes in the sink.

`messTier()` either goes away entirely (prose queries each system directly) or becomes a derived summary over multiple systems (for interactions that need a quick holistic read, like `apartment_notice`). The tier function no longer has its own state — it computes from object systems.

Background entropy that isn't covered by tracked objects — dust, mail, general clutter — may remain as a residual light scalar, but it should be narrow and explicitly labeled as the residual it is, not a catch-all.

---

## System: Clothing

### The wardrobe

Generated at chargen. The character owns a set of clothing items across categories. Economic origin shapes quantity and variety: a precarious character has fewer items, less variety, more visible wear. A comfortable character has more, including things they rarely wear.

Each item has:
- `id` — unique identifier
- `type` — `top`, `bottom`, `dress`, `socks`, `underwear`, `shoes`, `outerwear`
- `name` — a specific description ("grey hoodie", "dark jeans", "white t-shirt")
- `condition` — `good`, `worn`, `faded`, `damaged`

### Item states and locations

At any moment each item has a **location** and a **wear state**:

**Locations:** `stored` (drawer/wardrobe), `accessible` (chair, hook, edge of bed — clean enough, within reach), `on_body`, `floor_bedroom`, `floor_bathroom`, `laundry_basket`, `washing` (if a washing mechanic exists)

**Wear states:** `clean`, `worn_once` (could wear again), `worn_out` (needs wash), `dirty`

The distinction between `worn_once` and `worn_out` matters: the hoodie you wore for an hour to the corner store is different from the work shirt you sweated in all day.

### Interface

```js
// Query
Clothing.itemsOnFloor(location)      // items with location === floor_*
Clothing.wearableItems()             // clean or worn_once, accessible or stored
Clothing.canGetDressed()             // bool — is there something to wear?
Clothing.dirtyCount()                // items needing washing
Clothing.outfitDescription()         // what you're currently wearing, for prose
Clothing.floorDescription(location)  // "the grey hoodie and yesterday's jeans" / "a few pieces of clothing"

// Mutation
Clothing.wear(itemId?)               // put on an item; marks as on_body + worn_once or worn_out by end of day
Clothing.undress(dropTo)             // end of day: moves worn items to floor/basket depending on character/mood
Clothing.dropItem(itemId, location)  // specific drop
Clothing.moveToBasket(itemId?)       // tidy up: move floor items to basket
Clothing.wash()                      // if washing mechanic exists: cleans dirty items

// Serialization
Clothing.serialize()                 // full: array of {id, location, wearState}; coarse: {floor_bedroom: 2, dirty: 4, ...}
Clothing.deserialize(data)
```

### Coarse implementation

Tracks counts per category: `{ on_floor_bedroom: 2, on_floor_bathroom: 0, dirty: 5, worn_today: 1 }`. `itemsOnFloor()` synthesizes generic items from counts. `floorDescription()` returns "some clothes" or "a few pieces of clothing." Can get dressed as long as `dirty < total_items`. No item identity.

### Full implementation

Tracks each item individually. `itemsOnFloor()` returns the actual objects. `floorDescription()` returns "the grey hoodie and a pair of dark jeans." Prose can say "the shirt you've worn three days running." Undressing is specific: which items end up where depends on mood, energy, time.

### Undressing behavior

What you do with clothes at the end of the day is character-shaped. High energy, good mood: put them away or in the basket. Low energy, bad mood: wherever they land. The `undress()` call happens during sleep (clothes come off) and the destination reflects internal state at that moment. This is how the floor accumulates — not through passive entropy, but through the specific act of not having the bandwidth to put them away.

---

## System: Dishes

### The dish set

Generated at chargen. Single-person household: a modest set. A few plates, bowls, cups, mugs. Economic origin shapes quantity and condition. Precarious: mismatched, some cracked, fewer than you'd like. Comfortable: a full matching set.

Each item has: `id`, `type` (`plate`, `bowl`, `cup`, `mug`, `pot`, `pan`, `glass`), `condition`

### Item states

**States:** `clean_stored`, `clean_out` (on drying rack / counter, usable), `dirty` (used), `in_sink` (dirty + specifically in sink), `soaking`

### Interface

```js
// Query
Dishes.dirtyCount()                  // total dirty items
Dishes.inSinkCount()                 // items specifically in sink
Dishes.availableCount()              // clean items usable for eating
Dishes.canEat()                      // bool — is there a clean dish?
Dishes.sinkDescription()             // "three plates and a mug" / "a few dishes"

// Mutation
Dishes.use(type?)                    // eating: marks a dish dirty, puts it in sink
Dishes.wash(count?)                  // do_dishes: cleans dirty items
Dishes.rinse(itemId?)                // quick rinse: in_sink → clean_out, not fully clean

// Serialization
Dishes.serialize()
Dishes.deserialize(data)
```

### Eating without dishes

If `canEat()` is false, eating interactions shift: eating directly from the pot, eating over the sink, something bought in packaging that doesn't need a plate. The prose changes. The situation is real.

### Coarse implementation

Tracks `{ dirty: 3, in_sink: 2, clean: 4 }`. `sinkDescription()` returns "a few dishes" or "dishes from the last few days." No item identity.

### Full implementation

Tracks each item. `sinkDescription()` returns "the bowl from breakfast and two plates." Prose can reference specific items: "you move yesterday's mug to make room." Washing is specific: you do the plates first, the pot sits soaking.

---

## System: Linens

Simpler than clothing or dishes but follows the same pattern.

**Towels:** Each has a state: `clean_stored`, `clean_hanging`, `damp_hanging`, `on_floor`. After a shower, the towel used becomes `damp_hanging`. Left there it becomes `damp_forgotten`. Eventually `on_floor`. A fresh towel can be retrieved from storage.

**Bed:** State: `made`, `unmade`, `messy` (slept in multiple days without straightening). Making the bed is a small action with a small but real effect on how the bedroom reads.

The interface follows the same pattern: queries for state, mutations for actions, serialize/deserialize.

---

## Prose Integration

Location descriptions query the object systems directly:

```js
// Bedroom
const floor = Clothing.itemsOnFloor('bedroom');
const bedState = Linens.bedState();
// ... prose uses floor.length, floor description, bed state
```

The `apartment_notice` event queries across systems for an aggregate impression:

```js
const floorClutter = Clothing.itemsOnFloor('bedroom').length + Clothing.itemsOnFloor('bathroom').length;
const sinkBacklog = Dishes.inSinkCount();
// ... weight and pick notice text based on what's actually there
```

This means the event text can be specific: "The sink's been full since Tuesday" is possible if the system knows when those dishes arrived. At coarse granularity: "The dishes have been there for a while."

---

## Save Format

RunRecord gains a `subsystem_versions` field:

```js
{
  subsystem_versions: {
    clothing: 'coarse_v1',   // or 'full_v1'
    dishes: 'coarse_v1',
    linens: 'coarse_v1',
  }
}
```

State for each subsystem is serialized by its own `serialize()` method and stored under a matching key in the run state. On load, the engine reads `subsystem_versions`, instantiates the right implementations, and calls `deserialize()` on each.

Old saves that predate the object systems continue to work: they have neither `subsystem_versions` nor object state, so they get legacy stubs that return neutral values and do nothing.

---

## Implementation Path

1. **Define interfaces** — finalize the method signatures for Clothing, Dishes, Linens. These are stable contracts; changing them later is expensive.

2. **Coarse implementations** — enough to replace `apartment_mess` and make the prose work. RunRecord versioned from the start.

3. **Remove `apartment_mess`** — once object systems cover the same ground. `messTier()` becomes derived or removed.

4. **Full implementations** — one system at a time, starting with whichever the prose most needs. Clothing is probably first: getting dressed, the floor, the laundry situation.

5. **Laundry mechanic** — not designed here yet. Requires either an in-home option (hand-wash sink, drying rack over the tub) or an out-of-home one (laundromat, which doesn't exist yet). Stub for now: dirty clothes accumulate, the situation gets worse, the resolution is deferred.
