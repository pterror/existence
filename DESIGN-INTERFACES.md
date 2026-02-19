# Simulation Interfaces

Every simulation system exposes a stable interface that content and prose talk to. See [PHILOSOPHY.md](PHILOSOPHY.md) for the design principles. This document catalogs the target interfaces for all systems — what they expose, what's already clean, and what's currently an approximation debt.

Content and prose code should call these methods. Raw `State.get('x')` access from content.js is a smell — it means content knows about implementation details it shouldn't.

**Status notation:** ✓ Implemented and clean · ~ Approximation debt · ○ Not yet implemented

---

## Body (energy, hunger, stress)

The body is a constraint, not a resource. Content queries tiers, not numbers.

```js
// Queries
Body.energyTier()        // 'depleted' | 'exhausted' | 'tired' | 'okay' | 'rested' | 'alert'
Body.energy()            // raw 0–100, for State.set() calculations only
Body.energyCeiling()     // max energy possible (conditions, flare days) — currently always 100
Body.hungerTier()        // 'starving' | 'very_hungry' | 'hungry' | 'satiated' | 'full'
Body.stressTier()        // 'crisis' | 'high' | 'elevated' | 'normal' | 'calm'
Body.stress()            // raw 0–100
Body.passiveDrainRate()  // energy per hour — currently flat, should vary by job type + conditions

// Mutations
Body.adjustEnergy(delta)
Body.adjustStress(delta)
Body.setHunger(value)
Body.advanceHunger(hours)
```

**Status:** `energyTier()`, `hungerTier()`, `stressTier()` exist on State. `energyCeiling()` ○ not yet needed but the architecture should expect it. `passiveDrainRate()` ~ approximation (flat `hours × 3`). Raw `State.get('energy')` and `State.get('stress')` in content.js should be replaced with tier queries.

---

## Neurochemistry

28 NT systems (serotonin, dopamine, NE, GABA, adenosine, cortisol, melatonin, and others). The primary emotional substrate.

```js
// Queries
NT.get(system)            // current level 0–100 (e.g. 'serotonin', 'adenosine')
NT.moodTone()             // 'clear' | 'quiet' | 'heavy' | 'hollow' | 'fraying' | 'numb'
NT.lerp01(system, lo, hi) // 0–1 for weighted variant selection (lo = 0, hi = 1)
NT.effectiveInertia()     // current drift multiplier (personality + state penalties)
NT.regulationCapacity()   // inverse inertia for sleep processing

// Mutations
NT.adjustNT(system, delta)
NT.setTarget(system, value)
NT.adjustTarget(system, delta)
NT.adjustSentiment(target, quality, amount)  // accumulating sentiments
NT.sentimentIntensity(target, quality)       // lookup intensity
NT.processSleepEmotions(baseSentiments, qualityMult, sleepMinutes)
NT.processAbsenceEffects(sleepMinutes)
```

**Status:** ✓ All implemented on State. NT.get() = State.get(). moodTone(), lerp01(), effectiveInertia(), regulationCapacity() all exist. Adenosine is linear accumulation, not exponential. This interface is the best-factored one in the codebase.

---

## Sleep

Sleep is an action sequence with architecture. The alarm is a negotiation.

```js
// Queries
Sleep.isAsleep()              // bool
Sleep.sleepDebt()             // raw minutes (0–4800)
Sleep.sleepDebtTier()         // 'none' | 'mild' | 'moderate' | 'severe'
Sleep.currentInertia()        // 0–0.6 waking fog level
Sleep.melatoninLevel()        // 0–100
Sleep.daylightExposure()      // minutes accumulated this wake period
Sleep.alarmSet()              // bool
Sleep.alarmTime()             // minutes since midnight
Sleep.alarmWentOff()          // bool
Sleep.justWokeAlarm()         // bool: snooze/dismiss available
Sleep.snoozeCount()           // how many times snoozed this wake

// Mutations
Sleep.setAlarm(minutesSinceMidnight)
Sleep.clearAlarm()
Sleep.addDaylightExposure(minutes)
Sleep.logPhoneUseAtNight()    // melatonin suppression
Sleep.sleepCycleBreakdown(minutes) // {deepFraction, remFraction, cycles, inertia}
Sleep.wakeUp()

// Internal (called by sleep execute)
Sleep.computeQuality(state)   // multiplicative quality from stress/hunger/melatonin/etc.
```

**Status:** ✓ Mostly implemented on State. sleepDebtTier(), sleepCycleBreakdown() exist. Individual scalar accessors are raw State.get() calls scattered through content.js — these should be consolidated. `currentInertia()` could replace the sleeping `sleep_inertia` scalar.

---

## Domestic Objects (Clothing, Dishes, Linens)

Mess is not a scalar — it's emergent from object states. Full design in [DESIGN-OBJECTS.md](DESIGN-OBJECTS.md).

```js
// Clothing
Clothing.itemsOnFloor(location)  // [] or [{id, name, type}] depending on implementation
Clothing.wearableItems()         // items that can be worn
Clothing.canGetDressed()         // bool
Clothing.dirtyCount()            // items needing wash
Clothing.outfitDescription()     // what's currently on
Clothing.floorDescription(loc)   // "the grey hoodie and yesterday's jeans" / "some clothes"
Clothing.wear(itemId?)
Clothing.undress(energy, mood)   // destination depends on state
Clothing.moveToBasket(itemId?)

// Dishes
Dishes.dirtyCount()
Dishes.inSinkCount()
Dishes.availableCount()
Dishes.canEat()                  // clean dish available
Dishes.sinkDescription()         // "three plates and a mug" / "a few dishes"
Dishes.use(type?)                // eating marks a dish dirty
Dishes.wash(count?)              // do_dishes

// Linens
Linens.bedState()                // 'made' | 'unmade' | 'messy'
Linens.towelState()              // 'clean_hanging' | 'damp_hanging' | 'on_floor'
Linens.makeBed()
Linens.useTowel()

// Derived (replaces apartment_mess scalar)
Mess.tier()                      // 'tidy' | 'lived_in' | 'cluttered' | 'messy' | 'chaotic'
Mess.bedroomClutter()            // Clothing.itemsOnFloor('bedroom').length
Mess.kitchenBacklog()            // Dishes.inSinkCount()
Mess.bathroomState()             // towel + bathroom floor items
```

**Status:** `apartment_mess` scalar ~ is an approximation debt. `messTier()` exists but derives from the scalar. Clothing/Dishes/Linens ○ not yet implemented. `Mess.tier()` replaces the scalar once object systems cover the ground.

---

## Finances

Money is real. Financial anxiety is a sentiment that connects to neurochemistry.

```js
// Queries
Finance.balance()              // current dollars (raw scalar is appropriate here)
Finance.moneyTier()            // 'broke' | 'scraping' | 'tight' | 'careful' | 'okay' | 'comfortable' | 'cushioned'
Finance.financialAnxiety()     // 0–1 (sentiment intensity)
Finance.canAfford(amount)      // bool
Finance.payRate()              // dollars per hour
Finance.rentAmount()           // monthly rent
Finance.isOverdrawn()          // bool
Finance.nextPaycheck()         // { amount, daysUntil }
Finance.nextBillDue()          // { name, amount, daysUntil }
Finance.daysWorkedThisPeriod() // for paycheck calculation

// Mutations
Finance.spend(amount)
Finance.receiveMoney(amount, source)
Finance.deductBill(amount, label)
Finance.logWorkDay()
```

**Status:** `moneyTier()`, `receiveMoney()`, `deductBill()` exist on State. `canAfford()` ○ (content uses raw comparisons). `nextPaycheck()`, `nextBillDue()` ○. `financialAnxiety()` ~ (accessed via State.get('financial_anxiety')). Pay rate, rent stored on character. `daysWorkedThisPeriod()` ~ computed from state scalar.

---

## Employment

Job standing is social, not mechanical. A single scalar misses the relational texture.

```js
// Queries
Job.type()             // 'office' | 'retail' | 'food_service' | 'gig' | 'freelance' | 'unemployed'
Job.standingTier()     // 'excellent' | 'good' | 'okay' | 'precarious' | 'probation'
Job.standing()         // raw 0–100 (for calculations only)
Job.shiftStart()       // minutes since midnight
Job.shiftEnd()         // minutes since midnight
Job.isWorkday()        // bool: is today a scheduled work day
Job.isLate()           // bool: past shift start without clocking in
Job.latenessMinutes()  // how late
Job.hasCalledIn()      // bool: called in sick today
Job.atWorkToday()      // bool: clocked in
Job.isCurrentlyAtWork() // bool: at workplace location during shift

// Mutations
Job.callIn()
Job.clockIn()
Job.clockOut()
Job.adjustStanding(delta)  // currently State.set('job_standing', ...)
```

**Status:** `jobTier()` exists on State. `isWorkday()`, `isLate()`, `latenessMinutes()` ~ computed inline in content.js. `callIn()`, `clockIn()`, `clockOut()` are interaction executes, not abstracted. `type()` from Character.get('job'). Standing recovery ○ (standing only decays, never improves).

---

## Relationships

Friends and coworkers have states that persist across sessions. Relationships are directional: who reaches out, who responds, who notices absence.

```js
// Friends (slot 0 or 1)
Friend.name(slot)
Friend.flavor(slot)         // 'sends_things' | 'dry_humor' | 'warm_quiet' | etc.
Friend.hasUnread(slot)      // bool
Friend.unreadCount(slot)    // count
Friend.messages(slot)       // message history array
Friend.contactAge(slot)     // minutes since last read/reply
Friend.guiltLevel(slot)     // 0–1 sentiment intensity
Friend.totalGuilt()         // max across friends (for prose)
Friend.sendMessage(slot)    // player initiates
Friend.readMessages(slot)   // marks read, resets timer
Friend.queueResponse(slot, delayMinutes)

// Coworkers (slot 0 or 1)
Coworker.name(slot)
Coworker.flavor(slot)
Coworker.warmth(slot)       // 0–1 accumulated sentiment
Coworker.irritation(slot)   // 0–1 accumulated sentiment
Coworker.isPresent()        // at work today (future: sick days, turnover)
Coworker.recentInteraction() // minutes since last exchange
```

**Status:** Friend messages implemented via phone UI. Contact timestamps `friend_contact` and guilt in State. `totalGuilt()` ~ computed inline. `messages(slot)` ✓ in phone state. Coworker warmth/irritation ✓ as sentiments. Coworker presence ○. Family ○ (not in simulation).

---

## Phone

A real device with physical and software state.

```js
// Device state
Phone.battery()          // 0–100
Phone.batteryTier()      // 'dead' | 'critical' | 'low' | 'okay' | 'charged'
Phone.model()            // device tier (flagship | mid | prepaid | old)
Phone.platform()         // 'ios' | 'android' — drives CSS class on overlay
Phone.isSilent()         // bool
Phone.isFaceDown()       // bool (temporary DND)
Phone.isCharging()       // bool

// Notifications
Phone.hasUnread()        // any unread messages/notifications
Phone.unreadCount()      // total

// Apps
Phone.app()              // 'home' | 'messages_list' | 'thread' | 'notes' | 'alarm' | null
Phone.viewingPhone()     // bool

// Mutations
Phone.drain(minutes)
Phone.charge(minutes)
Phone.toggleSilent()
Phone.putFaceDown()
Phone.pickUp()
Phone.openApp(name)
Phone.closePhone()
```

**Status:** Battery, silent, viewing_phone in State. `batteryTier()` ✓. `model()`, `platform()` ○ (phone OS flavor unimplemented). `isFaceDown()` ○. `isCharging()` ○. Notification count computed from message state. App navigation is transient state in UI, not recorded.

---

## Environment (Weather & Geography)

The world has rhythms the character didn't choose. Geography is latitude — everything else derives.

```js
// Geography (from character — immutable)
Geo.latitude()           // character's latitude — sign = hemisphere, magnitude = climate zone
Geo.hemisphere()         // 'north' | 'south' (derived)
Geo.climateZone()        // 'tropical' | 'temperate' | 'polar' (derived)
Geo.season()             // 'spring' | 'summer' | 'autumn' | 'winter' (derived from lat + date)

// Weather (mutable, event-driven)
Weather.current()        // 'clear' | 'overcast' | 'drizzle' | 'rain'
Weather.temperature()    // celsius — ○ not yet tracked
Weather.dayLength()      // hours of daylight today (derived from lat + date)
Weather.isDaytime()      // bool
Weather.isSunrise()      // bool: within 30 min of sunrise
Weather.isSunset()       // bool: within 30 min of sunset

// Mutations
Weather.set(condition)
Weather.setTemperature(celsius)
```

**Status:** `Weather.current()` = State.get('weather') ✓. Temperature ○ (not tracked). Season ○ (not derived). Day length ○ (not computed). Latitude in character state. Hemisphere/climate derived helpers exist in some form but not as a clean module. Sunrise/sunset times ○.

---

## Food & Nutrition

Eating costs something (a dish, time, money, energy). Not eating costs more.

```js
// Queries
Food.fridgeTier()        // 'empty' | 'sparse' | 'stocked'
Food.fridgeUnits()       // rough count (current: integer 0–5+)
Food.canEat()            // fridge food + clean dish available
Food.canBuyGroceries()   // store accessible + money available
Food.nutritionQuality()  // 0–1 — ○ dietary adequacy not tracked yet

// Mutations
Food.consumeFromFridge(units)
Food.buyGroceries(units, cost)
Food.buyMeal(cost)       // external food — doesn't consume fridge
```

**Status:** `fridge_food` scalar ✓. `fridgeTier()` ○ (content uses raw State.get('fridge_food') > n comparisons). `canEat()` ~ (compound check in content). Nutrition quality ○. Cooking ○.

---

## Substances

Each substance has an acute effect curve, a comedown, tolerance, and withdrawal. None currently implemented.

```js
// Caffeine (most common — coffee, tea)
Caffeine.level()          // 0–100 in bloodstream
Caffeine.tolerance()      // 0–1
Caffeine.isWithdrawing()  // bool: below habitual baseline
Caffeine.consume(amount)
Caffeine.metabolize(hours)

// Alcohol
Alcohol.bac()             // blood alcohol 0–0.4
Alcohol.isIntoxicated()
Alcohol.isDrunk()
Alcohol.consume(units)
Alcohol.metabolize(hours)

// Nicotine
Nicotine.craving()        // 0–1
Nicotine.isWithdrawing()
Nicotine.consume()
Nicotine.metabolize(hours)

// Cannabis, prescription drugs, others follow same pattern
```

**Status:** ○ No substances implemented. Caffeine is the entry point — meaningful daily mechanics (alertness boost, sleep interference, withdrawal headache) without requiring deep system design.

---

## Health & Conditions

Health is terrain. Conditions shape daily texture (ambient) and sometimes hard walls (concrete).

```js
// Queries
Health.conditions()        // [] of condition IDs active this run
Health.hasCondition(id)    // bool
Health.energyCeiling()     // max energy today (flare days, chronic drain)
Health.passiveDrain()      // extra energy cost per hour beyond baseline
Health.isGoodDay(id)       // some conditions vary — ○ not yet
Health.isCapable(task)     // hard capability wall for some tasks
Health.medications()       // [{id, dueIn}] — ○ not yet
Health.medicationDue()     // bool

// Mutations
Health.takeMedication(id)
Health.triggerFlare(id)    // bad day — ○ not yet
```

**Status:** ○ No health conditions exist in the simulation. Energy ceiling is always 100. This is a significant scope item — start with one condition (chronic pain or migraine) to establish the pattern before generalizing.

---

## Character / Identity

The character schema is the immutable substrate for a run. Everything that was true before play began.

```js
// Queries
Character.get(key)          // any attribute — current accessor pattern ✓
Character.name()            // full name string
Character.firstName()       // for prose
Character.age()             // numeric
Character.job()             // 'office' | 'retail' | 'food_service'
Character.origin()          // economic origin tier
Character.latitude()        // for geography
Character.personality()     // { neuroticism, self_esteem, rumination }
Character.wardrobe()        // clothing items — ○ coarse for now (chargen outfit sets)
Character.dishSet()         // dishes — ○ not tracked per-item yet
Character.backstory()       // generated life history object

// Identity (○ not yet affecting simulation)
Character.gender()
Character.sexualOrientation()
Character.race()
Character.isNeurodivergent()
Character.neurodivergenceType()  // 'adhd' | 'autism' | null
```

**Status:** `Character.get(key)` ✓ handles all current access. Job, origin, latitude, personality all accessible. Wardrobe currently outfit sets (prose strings), not item arrays. Identity dimensions ○ stored but don't affect prose or mechanics.

---

## Time & Calendar

Time is continuous. The world has rhythms that aren't the character's.

```js
// Queries
Time.now()            // minutes since game start
Time.hour()           // 0–23.99 (fractional)
Time.minuteOfDay()    // 0–1439
Time.dayOfWeek()      // 'monday' | 'tuesday' | etc.
Time.timePeriod()     // 'early_morning' | 'morning' | 'afternoon' | 'evening' | 'night' | 'deep_night'
Time.getTimeString()  // '9:15 AM' — ✓ exists
Time.daysSinceStart() // for billing cycles, absence durations

// Mutations
Time.advance(minutes)  // State.advanceTime() ✓
```

**Status:** `timePeriod()`, `getTimeString()`, `advanceTime()` ✓ all exist on State. `dayOfWeek()` ~ computed inline from time. `daysSinceStart()` ~ computed from timestamps. Calendar is mostly clean; the gap is it's on State rather than a dedicated accessor.

---

## Habits

Decision trees trained on observed play. Full design in [DESIGN-HABITS.md](DESIGN-HABITS.md).

```js
Habits.predict(actionId)      // { strength: 0–1, tier: 'none'|'suggested'|'auto', path: [] }
Habits.train(actionId, source) // 'player' | 'suggested' | 'auto'
Habits.getSuggested()         // [{ actionId, strength }]
Habits.getAutoAdvance()       // { actionId, strength } | null
Habits.featureVector()        // current state as ML features
```

**Status:** ✓ All implemented in habits.js. This interface is the cleanest in the codebase — already factored correctly.

---

## World & Location

The location graph and movement. Small but should be explicit.

```js
World.location()              // current location ID
World.connections()           // [{id, label, timeCost}] reachable from here
World.canReach(locationId)    // bool — time, energy, context gates
World.move(locationId)        // records action, advances time, triggers events
World.locationName(id)        // display name
World.isIndoor(id)            // bool — affects daylight exposure, weather exposure
World.isHome(id)              // bool — affects guilt serotonin penalty
World.isWorkplace(id)         // bool — affects work sentiment targets
```

**Status:** `World.connections()`, `World.move()` ✓ exist. Location predicates (isIndoor, isHome, isWorkplace) ~ computed inline in content/state. `canReach()` is encoded in individual interaction `available` checks rather than abstracted.

---

## Mess (derived from object systems)

Once Clothing, Dishes, and Linens are implemented, `apartment_mess` goes away. `messTier()` becomes derived.

```js
Mess.tier()            // 'tidy' | 'lived_in' | 'cluttered' | 'messy' | 'chaotic' (replaces messTier())
Mess.bedroomScore()    // floor items count → contribution to tier
Mess.kitchenScore()    // in-sink + dirty dishes → contribution
Mess.bathroomScore()   // towel state + floor → contribution
```

**Status:** `messTier()` ~ exists but derives from `apartment_mess` scalar. Becomes derived from Clothing + Dishes + Linens once those are implemented.

---

## Implementation Priority

Systems closest to implementation-ready (interface designed, approximation debt named):

1. **Domestic objects** — Clothing, Dishes, Linens with coarse implementations. See [DESIGN-OBJECTS.md](DESIGN-OBJECTS.md). Replaces `apartment_mess`.
2. **Food** — `fridgeTier()` wrapper, `canEat()` as proper method.
3. **Finance** — `canAfford()`, `nextBillDue()`, cleaner accessor pattern.
4. **Job** — `isWorkday()`, `isLate()`, `latenessMinutes()` as proper methods.
5. **Weather/Geo** — temperature, season, day length from latitude + date.
6. **Substances** — caffeine first. Meaningful daily mechanics, well-bounded scope.
7. **Health** — one condition (chronic pain or migraine) to establish the pattern.
