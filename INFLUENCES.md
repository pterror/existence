# Influences, Prior Art, and Related Reading

Design reference for existence — games, academic work, and background reading
that inform or relate to what this project is trying to do.

---

## Games

### Closest in spirit

**Disco Elysium** (ZA/UM, 2019)
Inner voice as prose, psychology as gameplay, options gated by hidden skill checks.
The closest thing to "text carries everything" in a commercial game. Key difference:
stats are visible (the skill panel), it's entirely authored rather than procedural,
and the framing is investigation/RPG rather than survival/mundane life. The inner
voice system — multiple competing psychological voices surfacing as intrusive text —
is the strongest prior art for NT-shaded prose.

**Fallen London** (Failbetter Games, 2009–present)
Quality-based narrative: stats are called "qualities" and prose changes based on
their values. High prose quality, hidden consequence chains, skinner box underneath.
The "StoryNexus" engine they built from it is the closest existing tool to a
quality-gated prose system, though stats remain visible to the player.

**Depression Quest** (Zoe Quinn, 2013)
Options visibly crossed out by depression severity. Gestures at the same design
space — mental state gates what's available — with very thin tooling and authored
(not simulated) state. The crossing-out mechanic is explicit where existence keeps
it opaque; the effect is different.

**A Dark Room** (Michael Townsend / Amir Rajan, 2012)
Minimal UI, hidden mechanics, prose as primary readout. No simulation underneath
but shares the instinct that chrome gets in the way. The slow reveal of what the
game actually is has no equivalent here, but the austerity does.

**Façade** (Michael Mateas & Andrew Stern, 2005)
Drama management + real-time NLP + psychologically simulated characters. Academic
game that actually shipped. The drama manager (which decides what story beats to
surface when) is a different solution to a related problem: how does a simulation
know what to show? Prior art for the idea that generative systems can produce
emotionally coherent experiences.

### Related by mechanics or tone

**Galatea** (Emily Short, 2000)
Parser IF, single character interaction, extraordinary depth of character simulation
for its era. Emily Short's work generally is the craft reference for interactive
narrative — her blog is more useful than most academic papers.

**Howling Dogs** (Porpentine, 2012)
Twine hypertext, fragmentary prose, dissociation as form. Formally very different
but shares the instinct that psychological state can be rendered through prose
texture rather than UI.

**With Those We Love Alive** (Porpentine, 2014)
The game instructs you to draw sigils on your own skin as ritual markers —
body as literal interface. More developed than Howling Dogs in terms of using
prose texture to render psychological dissociation. The most formally interesting
of her work for existence's purposes. Accompanied by a score by Brenda Neotenomie.

**80 Days** (Inkle Studios, 2014)
High prose quality in a branching narrative, consequences that accumulate. The
writing is the benchmark for what good choice-based prose sounds like at scale.

**Dwarf Fortress** (Bay 12 Games, 2006–present)
The ur-example of hidden simulation producing emergent narrative. Neurochemistry
(stress, relationships, personality traits) affects dwarf behavior without the
player ever seeing the numbers directly. The lesson: simulation depth generates
story; the UI doesn't need to expose it.

**Caves of Qud** (Freehold Games, 2015–present)
Deep simulation, procedurally generated history and character backstory. The
character history system (which generates a meaningful past that affects starting
stats) is prior art for the backstory approach in existence.

---

## Academic Work

**TALE-SPIN** (James Meehan, 1977)
One of the first story generation systems. Characters had goals and simulated
problem-solving; stories emerged from their interactions. Foundational for the
idea that narrative can be generated from simulation rather than authored.

**Expressive Intelligence Studio** (UC Santa Cruz — Michael Mateas, Noah Wardrip-Fruin et al.)
The academic home of most serious interactive narrative research. Work on drama
management, procedural authorship, and the Facade system. Wardrip-Fruin's
*Expressive Processing* (2009) is the closest thing to a theoretical foundation
for this kind of work.

**Natural Language Generation (NLG) literature**
The pipeline in existence (observations → realization → surface text) maps onto
classical NLG architecture: content determination → document planning → surface
realization. The realization.js architecture specifically is a stripped-down
surface realizer. Relevant overview: Reiter & Dale, *Building Natural Language
Generation Systems* (2000) — dry but foundational.

**Emily Short's blog** (https://emshort.blog)
Practical interactive fiction craft from someone who has thought harder about
these problems than almost anyone. Especially relevant: writing on character
simulation, procedural generation of narrative, and quality-based narrative design.
Not academic but more useful than most papers.

**Interactive Storytelling / ICIDS conference proceedings**
Annual conference on interactive digital storytelling. Most directly relevant
work on drama management, player modeling, and procedural narrative tends to
appear here first.

---

## Background Reading — Simulation Systems

**Why We Sleep** (Matthew Walker, 2017)
Pop science but a useful overview of sleep architecture, adenosine mechanics,
REM vs deep sleep function, and sleep debt. Treat specific numbers with caution
(some have been disputed) but the qualitative model is sound. Informed the
sleep architecture in state.js.

**Emotional inertia**
Kuppens et al. have published on emotional inertia (how sticky mood is over time)
as a trait variable. The Houben et al. (2015) study specifically on rumination,
neuroticism, and self-esteem as predictors of inertia is cited in the codebase.
Search: "emotional inertia rumination neuroticism" for the cluster of work.

**Perceptual habituation / orienting response**
The habituation + change-detection model in senses.js maps onto well-established
perceptual psychology. Sokolov's orienting response research (1960s) is the
classical foundation. More accessible: any cognitive psychology textbook chapter
on attention.

**Acoustic physics**
No single reference — the acoustic adjacency model (flooring, openness, voids)
is applied physics more than academic work. Architectural acoustics textbooks
cover reverberation time (RT60), absorption coefficients by material, and sound
transmission between spaces.

---

## Atmosphere — Music and Lyrics

Tonal references: not templates to copy or over-optimize toward, but useful for
calibrating the emotional register the prose is working in. Survey, don't absorb.

### ROMA (ROMALOID)

ROMA releases under a free-use license — lyrics can be copied directly into the
repo. Links for attribution:
- Artist: https://www.youtube.com/@ROMALOID / https://open.spotify.com/artist/1GBhDrmf2fvZOEjKLUobEF
- Burnout (ft. Kasane Teto): https://www.youtube.com/watch?v=J5SbnFwKaHc / https://open.spotify.com/track/5J7kW6hFnHcUayCv0vg4Iu
- Drive (stems/lyrics): https://drive.google.com/drive/folders/1vHlfnv2acgIKGSX15HejEu7K6LYYOsno

**BURNOUT — ROMA ft. Kasane Teto** (`atmosphere/burnout-roma.txt`)
Somatic language for stress and exhaustion ("a stone that's crushing me on top
of my chest"), dissociation as fading ("1000 miles an hour I come back home and I
/ fade, fade"), motivational collapse ("I don't wanna try"). Most relevant:
"I take the pain and lock it deeply / cause I deserve it" — the self-suppression
and internalized shame loop that the game's "no judgment" principle is specifically
responding to. The game doesn't tell the character they deserve it; it just shows
what the days look like.

### Porter Robinson

*nurture* (2021) is the most directly relevant — an album about depression and
creative block rendered with emotional precision rather than spectacle. Small
moments carry disproportionate weight. "Musician" is about being shaped into what
someone else had in mind; "Mirror" is self-criticism as an inescapable loop.
The whole album models the experience of being unable to produce the self you
intended to be — which maps directly onto existence's "power anti-fantasy" framing.

### Mitski

The specific skill: domestic scenes (washing dishes, sitting at a table, lying in
bed) rendered with emotional weight that isn't explained or justified. The mundane
is allowed to be enormous. "Working for the Knife" (*Laurel Hell*, 2022) — labor,
exhaustion, creative suppression. "The Deal" — obligation vs desire with no
resolution offered. "Nobody" — loneliness as absurdist comedy. Her albums
*Puberty 2*, *Be the Cowboy*, and *Laurel Hell* are all relevant to the register
existence works in moment-to-moment.

### Vocaloid / UTAU

**Ghost and Pals** — English-language vocaloid producer. Extremely precise about
self-suppression and the gap between internal and external state. "Alter Ego",
"Theorem of the Heart". The masked/performed self vs the interior one is a
persistent theme.

**Kikuo** — dissociation, the body rendered as strange and unreliable. Emotionally
unsettling without being melodramatic. "I'm Sorry, I'm Sorry" is the canonical
reference point.

**Maretu** — burnout, perfectionism, self-criticism as a loop. "Coin Locker Baby",
"Magical Doctor". Similar territory to ROMA but more abrasive.

### Adjacent artists (same register)

**Japanese Breakfast** (Michelle Zauner) — grief and mundane detail woven together,
*Soft Sounds from Another Planet* especially. **Soccer Mommy**, **Big Thief /
Adrianne Lenker** — domestic precision, body, relationships rendered without
sentimentality. All work in the same territory of mundane-rendered-heavy.

---

## On the LLM Development Model

This project is developed with an LLM (Claude) as a research collaborator —
holding design context, researching real-world mechanics, authoring lexical sets,
and maintaining consistency across a large codebase. This development model doesn't
have good prior art yet. The closest analogies are pair programming and having a
generalist research assistant, but neither captures what it actually is.

Worth noting: most of the simulation fidelity in this project (neurochemistry
calibration, sleep architecture, acoustic physics, emotional inertia weights) was
reached by researching the actual literature and deriving from it, rather than
inventing plausible-sounding numbers. That research capacity — quickly surveying
a domain, finding the relevant findings, and translating them into simulation
parameters — is what makes the LLM collaboration specifically useful here. It
compresses weeks of background reading into hours.
