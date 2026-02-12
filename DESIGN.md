# Simulation Design

The simulation behind the prose. None of this is visible to the player. Text carries everything.

## Core Principle

Prose leads, simulation follows. If the text needs a phone inbox to feel real, build the inbox. If a character's age changes what financial stress looks like, the simulation models that. Don't hollow out prose to match a thin sim — deepen the sim to support the prose.

## What the Game Is

A day. Then another day. The experience of being alive inside constraints you didn't choose and can't fully see. You wake up, or you don't. You go to work, or you don't. You eat, or there's nothing in the fridge. The game doesn't tell you what to do. It doesn't tell you what you should have done. It shows you where you are and what's available, and the texture of that changes depending on everything underneath.

No win state. No fail state. No score. No judgment. Just the next moment, and the one after that.

## The Day

Time is the core constraint. Everything costs time. Getting dressed, eating, commuting, working, staring at your phone. You start each day with the same 24 hours and the same inability to do everything.

### Structure

A day starts when you wake up (alarm or not) and ends when you sleep (or pass out from exhaustion). What happens in between isn't prescribed — there's no required sequence. But the world has rhythms: work has hours, stores close, friends text during the day, the light changes.

### The alarm

The alarm is an adversary. It exists to tell you that lying here isn't an option. Except it is. Snooze is always available. The negotiation between the alarm and the bed is the first decision of every day, and some days you lose it.

### Time perception

You don't always know what time it is. Awareness of time degrades with distance from the last time you looked at a clock. The further you drift from a direct observation, the vaguer your sense becomes:
- Just looked: "9:15 AM"
- A while ago: "around 9:15"
- Longer: "sometime in the morning"
- Much longer: "The light has shifted. Morning still, probably."

This isn't a mechanic the player sees. It's how the prose renders time. Checking a clock (phone, microwave, alarm) resets the fidelity. Not checking lets it drift.

## The Body

The body is a constraint, not a resource to manage. Energy, hunger, and stress aren't stats the player optimizes — they're the physical reality that shapes what's possible and how everything feels.

### Energy

You start the day with whatever sleep gave you. Everything costs energy. Some things cost more when other states are bad (hungry and tired together is worse than either alone). Energy isn't a battery with a percentage — it's the difference between "I could do that" and "I can't right now."

Tiers: depleted → exhausted → tired → okay → rested → alert. Most of the game lives in the tired-to-exhausted range. "Alert" is rare and fleeting. "Depleted" means even thinking about doing things takes more than you have.

### Hunger

Hunger builds over time. Eating resets it. Not eating makes everything harder — energy drains faster, focus drops, the prose gets shorter and more distracted. The fridge might be empty. The store costs money. Eating might mean standing at the counter shoveling food too fast because your body stopped asking and started insisting.

### Stress

Stress accumulates from obligations, money anxiety, work pressure, being late, the apartment being a mess. It reduces from rest, social contact, small actions (doing the dishes, showering). High stress changes the prose tone — everything is tighter, louder, closer to the edge. It also self-reinforces: stress above a threshold creeps up on its own.

### Sleep

Sleep is the reset that isn't a full reset. You lie down, hours pass, you wake up with more energy than you had. How much depends on how depleted you were, how stressed, whether you ate. The alarm might wake you before you're done. You might sleep through it. Oversleeping is its own kind of failure that the game doesn't call failure.

### The body as prose

None of these are numbers the player sees. They show up as: which interactions are available (can't do dishes if energy is too low), how the prose reads (the same room described differently at different energy levels), what idle thoughts surface (hunger thoughts when starving, exhaustion thoughts when depleted).

## Health

Health is terrain, not a problem to solve. A chronic condition isn't a debuff — it's the ground you walk on. The game models health as constraints that shape daily texture, not as obstacles on a path to "better."

### Physical health

**Chronic conditions** — diabetes, chronic pain, autoimmune disorders, migraines, asthma. These aren't events. They're daily. You manage them or you don't, and managing them costs time, money, energy, and attention. A good day means the condition is background. A bad day means it's everything.

**Injury** — temporary or permanent. A broken wrist changes what you can do for weeks. Chronic back pain changes it forever. The simulation adjusts what's available, how long things take, what the prose notices.

**Illness** — getting sick, the days of not being able to do anything, the slow return. Not dramatic — just the reality of being in a body that sometimes stops cooperating.

**Disability** — mobility, sensory, cognitive. Not a problem the game solves. A reality the game models. A wheelchair user's apartment is different from a walking person's. A blind person's phone is different. The world is built for a default body and everyone else negotiates.

### Mental health

**Conditions** — depression, anxiety, bipolar, PTSD, OCD. These aren't moods. They're the lens everything comes through. The game already simulates something like depression through energy/stress/social, but as a health condition it's not "low energy" — it's the specific way getting out of bed takes everything you have for reasons that have nothing to do with sleep.

**Anxiety** — beyond stress. The constant hum, the avoidance, the physical symptoms. The difference between "stressed about work" and "unable to open the email because opening the email means knowing."

### Neurodivergence

**ADHD** — executive dysfunction, time blindness, hyperfocus, the gap between wanting to do something and being able to start. The game's "can't focus at work" already touches this. As a trait, it's not situational — it's structural. Some days the medication works, some days it doesn't, some days you forgot to take it.

**Autism** — sensory processing, social interaction patterns, the importance of routine, the cost of masking. The world is loud and bright and expects a specific kind of social performance. Meeting those expectations is work the game can model.

These aren't illnesses to treat. They're ways of being that interact with a world not designed for them.

### Medication

Medication is its own system. Taking it costs time and sometimes money. Not taking it has consequences that vary from immediate to slow-building. Running out means a pharmacy trip, which means money and energy and time. Some medication has side effects (drowsiness, appetite changes, emotional blunting). The negotiation between the condition and the treatment is daily and rarely simple.

### Health as character property

Health conditions are part of who the character is (like age and job type). They're set at creation or develop during play. They modify simulation parameters:
- Energy baseline and recovery rate
- Stress baseline
- What interactions are available
- Time and energy cost of actions
- What the prose notices (pain, fatigue, sensory detail, cognitive fog)
- What objects matter (medication, mobility aids, specific foods)
- What the phone is for (pharmacy notifications, appointment reminders, health tracking)

### Good days and bad days

Chronic conditions aren't constant. They fluctuate. Some days you almost forget. Some days it's the only thing. The simulation should model this variation — not as random good/bad dice rolls, but as the interaction between the condition, sleep, stress, medication adherence, and the specific demands of the day.

## Drawn Lots

Health is the biggest category, but the game should be able to model any constraint life hands you. These are things that shape your daily existence without being your fault or your choice:

- **Caregiving** — responsible for someone else (aging parent, sick family member, child). Your time and energy aren't fully yours.
- **Housing instability** — not everyone has an apartment. Couch surfing, shelter, car, street. The "home base" looks different.
- **Addiction and recovery** — the daily negotiation. Meetings, cravings, medication, the phone numbers you shouldn't call.
- **Legal constraints** — probation, immigration status, criminal record affecting employment. Invisible walls.
- **Grief** — recent loss. The phone contact that's still there. The empty chair.
- **Language barriers** — navigating a world in a language that isn't yours.

Not all of these need to be implemented. But the architecture should allow for them. They're all the same design pattern: a character property that modifies simulation parameters and prose selection. A constraint that's always there, shaping what's possible and how things feel.

## The Space

### The apartment

Three rooms: bedroom, kitchen, bathroom. Small. The mess accumulates by itself — dishes, clothes, general entropy. Cleaning costs energy. Not cleaning costs nothing immediately but changes how the space feels, which changes how the prose reads, which changes how the player feels.

The apartment is the baseline. You wake up here, you come back here. Its state is a mirror: clean apartment when you're managing, messy when you're not, and it can go either way independently of how you're actually doing.

### The world outside

The street. The corner store. The bus stop. Work. The world is small on purpose. These aren't locations in a game map — they're the places a constrained life actually touches. Going places costs time and energy. The bus ride to work is 20 minutes you spend being a body in transit.

The corner store is where money becomes food. The transaction is straightforward but the math is constant: can you afford this, is it enough, when did you last buy groceries.

### Movement

Going from one place to another takes time and has transition prose. The prose reflects your state — walking to the bus stop when exhausted reads differently than walking there when okay. Movement isn't fast travel. It's the effort of going somewhere.

## Work

Work is the thing you have to do whether or not you can. The specific shape depends on employment type.

### The daily grind (formal employment)

You have a shift. You're expected to be there. Being late has consequences (job standing drops). Being there means doing tasks — the number expected depends on the job. Tasks cost energy and time. Breaks exist. Coworkers exist. The supervisor exists as a presence whether or not they speak.

The experience of work isn't "complete tasks, earn points." It's: you're here, the clock moves, you do what you can, some days you can focus and some days you can't. Inability to focus doesn't mean you chose not to — it means the energy or stress or hunger wouldn't let you. The game doesn't distinguish between "won't" and "can't."

### Coworkers

Two coworkers, each with a personality flavor:
- **warm_quiet** — offers coffee, half-smiles, doesn't push. Easy to be near.
- **mundane_talker** — weather, shows, complaints. Background noise that's sometimes comforting.
- **stressed_out** — their own problems, visible and leaking. Sometimes solidarity, sometimes exhausting.

Talking to a coworker is a social interaction. It costs energy but reduces stress and improves social state. The prose varies by their flavor and your mood — the same coworker reads differently when you're fraying versus when you're clear.

### Employment types

(See Employment section — formal, freelance, gig, informal, unemployed, can't work. Each reshapes what "work" means in the daily experience.)

## Money

Money is a number the player only vaguely knows. Like time, financial awareness degrades with distance from direct observation. You checked your bank app yesterday and had around $40. Today you bought groceries. How much do you have now? The prose reflects your fidelity:
- Just checked: "$32"
- A while ago: "around thirty dollars"
- Longer: "not much — under forty, maybe"
- Much longer: "enough for now" or "not enough"

### Spending

Every purchase is a decision the player feels. Groceries cost $8-14. A cheap meal costs $3-5. These aren't big numbers but they're most of what you have. The interaction is available if you can afford it; if you can't, it's just not there (opaque constraints — you don't see "insufficient funds," the option is simply absent).

### Income

(See Income & Financial Insecurity section — irregular income, the stress of gaps between payments, the difference between a paycheck and a hope.)

### Bills and obligations

(See Income & Financial Insecurity section — bills arrive on schedule, the collision with irregular income.)

### Financial thresholds

Financial anxiety isn't linear. Crossing thresholds changes the texture:
- Comfortable → tight: you start checking the bank app
- Tight → worried: you start doing math in your head at the store
- Worried → broke: you know the number without checking. It's always there.
- Broke → crisis: which bill do you skip this month

## People

### Friends

Two friends, each with a personality flavor that determines how they relate to you. They're not quest-givers or content dispensers. They're people who exist whether or not you engage with them.

**sends_things** — constant low-effort contact. Memes, links, screenshots. Texts often, regardless of your state. The friend who's always there in the background. Doesn't require reciprocation.

**checks_in** — notices your absence. Texts more when you've gone quiet. "Hey, you good?" The frequency increases with your isolation. Can feel caring or suffocating depending on your state.

**dry_humor** — steady, their own rhythm. Texts when they have something. Not affected by your state. The friend who's easy to be around because they don't ask.

**earnest** — less frequent, more weight. Texts when they mean it. A message from an earnest friend lands differently than a meme from a sends_things friend.

### Social decay

Isolation builds over time without interaction. It's not a punishment — it's physics. You don't talk to people, the distance grows, everything feels further away. Friends respond differently to your withdrawal (checks_in escalates, sends_things stays constant, dry_humor doesn't notice, earnest worries silently).

Responding improves things. Ignoring doesn't make it worse immediately — but time does. Neither is judged.

### Coworkers and supervisor

Coworkers are social proximity, not chosen relationships. The supervisor is an authority relationship. These people exist at work. They have patterns. You interact with them or you don't. (See Work section.)

## The Phone

The phone is the surface through which most systems become visible. It's not a UI element — it's a simulated object with real state.

### What the phone is

- An inbox that accumulates messages whether or not you look
- A bank app that shows you a number you wish were different
- A connection to people who care about you in ways you can't always receive
- A source of obligations (work messages, bills, notifications)
- A clock you can check
- Sometimes the only private space you have

### Phone state

- Inbox: messages arrive over time, accumulate as unread, are discovered when you check
- Silent mode: controls whether notifications interrupt you
- Battery: drains over time, dies, needs charging
- The act of checking is itself meaningful — compulsive checking vs avoidance are both expressions of state

### Message sources

Messages come from the simulation, not from dice rolls:
- **Friends**: personality-driven frequency, social-state-modulated
- **Work**: event-triggered (late, deadline, client, supervisor — depends on employment type)
- **Financial**: event-triggered (purchase confirmation, deposit, low balance, bill due)
- **Bills**: scheduled (monthly cycle)

Each message has text generated at arrival time. The phone holds it until you look.

## Objects

The phone is the most complex object, but it's not the only thing in the world with state. Objects that exist in real life have presence in the simulation.

### The alarm clock

State: set or not, what time. The alarm is a relationship — you set it hoping tomorrow-you will obey it. Tomorrow-you might not. Snoozing is always available. Turning it off is always available. The alarm doesn't judge.

### The fridge

State: how much food, slowly degrading. The fridge is the answer to "should I eat" and sometimes the answer is empty. Groceries restock it. Time empties it. An empty fridge at 2 AM is a specific kind of loneliness.

### Clothes

State: what you're wearing, whether you got dressed. Getting dressed is a transition from "not yet participating in the day" to "technically ready." The outfit reflects mood — low mood means the easy clothes, the ones that don't require decisions.

### The shower

Using it costs energy but reduces stress. Not using it costs nothing mechanically but the prose knows. Showering is the thing you know you should do and sometimes can't. Not "won't" — can't. The game doesn't distinguish.

## The Inner Life

### Mood

Mood isn't a single axis. It's a compound state derived from energy, stress, hunger, and social connection:

- **numb** — depleted and stressed. The absence of the energy for feeling.
- **fraying** — high stress. Everything too loud, too close, too much.
- **heavy** — low energy. Gravity is personal today.
- **hollow** — isolated and stressed. The shape where something used to matter.
- **quiet** — isolated but not stressed. Used to the silence.
- **clear** — rested and calm. Rare. You notice it.
- **present** — okay energy, manageable stress. Here, actually here.
- **flat** — default. Getting through it.

Mood selects prose variants. The same action, the same location, the same moment — described differently depending on where you are inside.

### Observation fidelity

You don't have perfect information about your own life. Time drifts. Money is approximate. This isn't a fog-of-war mechanic — it's the experience of not always knowing exactly what's going on because you're tired and distracted and hungry.

Observation fidelity degrades with distance from direct observation and sharpens when you look. This affects both the awareness display (the peripheral sense of time and money) and the prose.

## Weather

Weather is atmosphere, not a system. It changes slowly (3% chance per action). It affects prose tone — overcast days read differently than clear ones. Rain changes what the street feels like. Weather doesn't gate actions or cause mechanical effects. It's just there, like weather.

States: clear, overcast, drizzle, grey. Subtle gradations, not dramatic events.

## Age

Any age is valid in character creation. No restrictions. The world adapts.

Age doesn't gate — it shapes. A 10-year-old and a 45-year-old both exist in the same simulation, but almost everything about their daily texture is different: what work means, where money comes from, what the phone is for, what "constrained agency" feels like.

### Life stages (rough, not rigid)

**Child (under ~13)**
Work: mowing lawns, pet sitting, odd jobs for neighbors. Not employment — favors, hustle, helping out.
Money: could be pocket change, could be contributing to household survival. Don't assume comfort.
Phone: social (if they have one). Group chats, parents, maybe a game. Or no phone at all.
Constraints: adults decide things. School. Limited mobility. Agency is small and fiercely guarded.

**Teen (~14-17)**
Work: fast food, retail, babysitting, tutoring. Limited hours, limited pay. Maybe under-the-table work.
Money: first taste of earning. Might be spending money, might be rent contribution. Age doesn't determine which.
Phone: social gravity well. Also potentially the only private space they have.
Constraints: almost-adult responsibilities with child-level power. The gap is the thing.

**Young adult (~18-25)**
Work: entry-level, gig economy, freelancing, service industry. High turnover, low leverage.
Money: bills arrive. The learning curve of fixed costs against variable income.
Phone: the anxiety device. Bank app, work messages, bills, social obligations.
Constraints: freedom that turns out to be expensive.

**Adult (~26-50)**
Work: career if lucky, lateral moves if not. Freelance can mean independence or precarity depending on the month.
Money: maybe stable, maybe not. The distance between "fine" and "not fine" might be one bad month.
Phone: obligations.
Constraints: locked in or starting over. Both are hard.

**Older adult (~50+)**
Work: what you have, or what you can find. Age discrimination is real and invisible.
Money: fixed income, or dwindling savings, or still grinding. Health costs.
Phone: lifeline or burden. Friends text less. The contacts list has ghosts in it.
Constraints: body, money, invisibility. Agency narrows in ways that aren't your fault.

These aren't categories to implement as enums. They're lenses for writing prose and tuning parameters. A 30-year-old freelancer and a 30-year-old retail worker live in the same age band but different worlds.

## Employment

Employment isn't one system. It's a landscape shaped by age, circumstances, and luck.

### Types

**Formal employment** — regular schedule, regular pay, a supervisor who notices when you're late. Stable but constraining. Losing it is a cliff.

**Freelance / commissions** — irregular work, irregular pay. You find gigs or they find you. The stress isn't being broke — it's not knowing when the next payment comes.

**Gig work** — apps, deliveries, rides. Available on demand but pays badly and has no floor.

**Informal work** — cash, no records, no protections. Mowing lawns, helping someone move, selling things. Available at any age. Often the only option.

**Unemployed** — looking or not looking. Both are exhausting in different ways.

**Can't work** — disability, caregiving, age, circumstances. Income from assistance, family, nothing. The simulation doesn't judge why.

### Employment affects everything

- What "going to work" means (or that it doesn't exist as a concept)
- What work messages look like (supervisor, client, app notification, neighbor asking for help)
- Income pattern (regular, irregular, absent)
- The flavor of financial anxiety
- What the phone is for

## Income & Financial Insecurity

Money isn't a score. It's a source of anxiety or relief, and the simulation should model what makes it feel that way.

### Irregular income

Freelancing and gig work mean income arrives unpredictably:
- Payments arriving at irregular intervals (not a biweekly paycheck)
- Amounts varying (a good commission vs a small one)
- Gaps between payments (the silence is the stress)
- The emotional difference between "expecting a payment" and "hoping for one"

### Bills and obligations

Bills arrive on schedule whether or not income does. The collision between regular obligations and irregular income is where financial insecurity lives.
- Rent: monthly, non-negotiable, the biggest number
- Utilities: monthly, variable, always a little more than last time
- Phone bill: monthly, you need it, it costs more than it should
- Food: continuous, flexible but non-optional

## What the Game Doesn't Have

This is as important as what it does have.

**No objectives.** Nothing tells you what to do today. Nothing evaluates whether you did it right.

**No visible numbers.** The player never sees energy: 23 or money: $14.50. They see prose that reflects those values through qualitative lenses.

**No judgment.** Staying in bed all day isn't failure. Going to work isn't success. Calling in sick isn't giving up. Eating cereal for dinner isn't sad. The game describes. It doesn't evaluate.

**No progression.** There's no skill tree, no leveling up, no unlocks. Day 30 has the same mechanics as day 1. What changes is the state — your money, your relationships, your job standing, the mess in your apartment. Whether that's "better" or "worse" is not for the game to say.

**No tutorial.** The game doesn't explain itself. Interactions appear when they're available and disappear when they're not. The player learns by existing in the space, not by being taught.

**No win state. No fail state.** The game continues. It might end — that's a design question. But it doesn't end because you "won" or "lost." It ends because a life ended, or because you stepped away.
