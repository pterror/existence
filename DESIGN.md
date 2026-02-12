# Simulation Design

The simulation behind the prose. None of this is visible to the player. Text carries everything.

## Core Principle

Prose leads, simulation follows. If the text needs a phone inbox to feel real, build the inbox. If a character's age changes what financial stress looks like, the simulation models that. Don't hollow out prose to match a thin sim — deepen the sim to support the prose.

## Age

Any age is valid in character creation. No restrictions. The world adapts.

Age doesn't gate — it shapes. A 10-year-old and a 45-year-old both exist in the same simulation, but almost everything about their daily texture is different: what work means, where money comes from, what the phone is for, what "constrained agency" feels like.

### Life stages (rough, not rigid)

**Child (under ~13)**
Work: mowing lawns, pet sitting, odd jobs for neighbors. Not employment — favors, hustle, helping out. No legal protections, no contracts, no invoices.
Money: could be pocket change, could be contributing to household survival. Don't assume comfort. A kid checking the fridge isn't always casual.
Phone: social (if they have one). Group chats, parents, maybe a game. Or no phone at all.
Constraints: adults decide things. School. Limited mobility. Agency is small and fiercely guarded.

**Teen (~14-17)**
Work: fast food, retail, babysitting, tutoring. Limited hours, limited pay. Maybe under-the-table work that pays better but has no safety net.
Money: first taste of earning. Might be spending money, might be rent contribution. Age doesn't determine which.
Phone: social gravity well. Also potentially the only private space they have.
Constraints: almost-adult responsibilities with child-level power. The gap is the thing.

**Young adult (~18-25)**
Work: entry-level, gig economy, freelancing, service industry. High turnover, low leverage. Or school and debt.
Money: bills arrive. Maybe for the first time, maybe not. The learning curve of fixed costs against variable income.
Phone: becomes the anxiety device. Bank app, work messages, bills, social obligations.
Constraints: freedom that turns out to be expensive.

**Adult (~26-50)**
Work: career if lucky, lateral moves if not. Freelance can mean independence or precarity depending on the month. Getting fired is harder to recover from as the number climbs.
Money: maybe stable, maybe not. Savings or debt. The distance between "fine" and "not fine" might be one bad month.
Phone: obligations. Calendar, work, bills, the people you're responsible for or to.
Constraints: locked in or starting over. Both are hard.

**Older adult (~50+)**
Work: what you have, or what you can find. Age discrimination is real and invisible. Starting over means competing with people half your age. Retirement is theoretical.
Money: fixed income, or dwindling savings, or still grinding. Health costs.
Phone: lifeline or burden. Friends text less. Some have died. The contacts list has ghosts in it.
Constraints: body, money, invisibility. Agency narrows in ways that aren't your fault.

These aren't categories to implement as enums. They're lenses for writing prose and tuning simulation parameters. A 30-year-old freelancer and a 30-year-old retail worker live in the same age band but different worlds.

## Employment

Employment isn't one system. It's a landscape shaped by age, skills, circumstances, and luck.

### Types

**Formal employment** — regular schedule, regular pay, a supervisor who notices when you're late. Stable but constraining. Losing it is a cliff.

**Freelance / commissions** — irregular work, irregular pay. You find gigs or they find you. The stress isn't being broke — it's not knowing when the next payment comes. A good month doesn't mean the next one will be.

**Gig work** — apps, deliveries, rides. Available on demand but pays badly and has no floor. You work when you can, earn what they decide.

**Informal work** — cash, no records, no protections. Mowing lawns, helping someone move, selling things. Available at any age. Often the only option.

**Unemployed** — looking or not looking. Both are exhausting in different ways. The phone is a job board and a source of rejection.

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

Freelancing and gig work mean income arrives unpredictably. The simulation should model:
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

### Thresholds

Financial anxiety isn't linear. Crossing certain thresholds changes the texture:
- Comfortable → tight: you start checking the bank app
- Tight → worried: you start doing math in your head at the store
- Worried → broke: you know the number without checking. It's always there.
- Broke → crisis: which bill do you skip this month

The simulation tracks money as a number. The prose reads the number through these lenses.

## Social

Friends aren't NPCs who dispense dialogue. They're people with patterns.

### Personality-driven behavior

Each friend has a flavor (from chargen) that shapes how they interact:

**sends_things** — constant low-effort contact. Memes, links, screenshots. Texts often, regardless of your state. The friend who's always there in the background. Doesn't require reciprocation.

**checks_in** — notices your absence. Texts more when you've gone quiet. "Hey, you good?" The frequency increases with your isolation. Can feel caring or suffocating depending on your state.

**dry_humor** — steady, their own rhythm. Texts when they have something. Not affected by your state. The friend who's easy to be around because they don't ask.

**earnest** — less frequent, more weight. Texts when they mean it. A message from an earnest friend lands differently than a meme from a sends_things friend.

### Social decay and recovery

Isolation builds over time without interaction. Friends respond to it differently (checks_in escalates, sends_things stays constant). Responding to a message improves social state. Ignoring messages lets it decay. Neither is judged.

## The Phone

The phone is the surface through which most of these systems become visible. It's not a UI element — it's a simulated object with real state.

### What the phone is

- An inbox that accumulates messages whether or not you look
- A bank app that shows you a number you wish were different
- A connection to people who care about you in ways you can't always receive
- A source of obligations (work messages, bills, notifications)
- Sometimes the only private space you have

### What the phone isn't

- A menu system
- A notification center with badges and counts
- A game UI element

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
