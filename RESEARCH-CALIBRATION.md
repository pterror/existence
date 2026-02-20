# Calibration Research

Empirical literature review findings for replacing approximation-debt constants in the simulation. Each section covers one debt, summarizes what the research supports, and gives calibration targets.

Research conducted 2026-02-20 via web search agents across PubMed, PMC, and published meta-analyses. Citations are provided but not independently verified — treat as directional rather than authoritative until spot-checked.

---

## Adenosine Accumulation Rate

**Applies to:** `tickNeurochemistry()` in `state.js` — the adenosine accumulation line.
**Status:** ✓ IMPLEMENTED 2026-02-20. Replaced linear 4 pts/hr with saturating exponential (τ=18h, ceiling=100). At 16h from cleared baseline → ~59.

**Current debt:** `4 pts/hr` linear accumulation (state.js). Acknowledged approximation debt.

### What the literature says

**Accumulation is a saturating exponential, not linear.**

The two-process model (Borbély/Achermann) describes Process S (the homeostatic sleep pressure signal, strongly tied to adenosine) as a saturating exponential during wakefulness with a time constant of ~18 hours. The decay constant during sleep is ~4 hours. These are fitted to slow-wave activity (SWA) data, not direct adenosine measurements, but Process S is widely understood as the macroscale signature of adenosine accumulation.

Direct microdialysis evidence:
- Porkka-Heiskanen et al. (2000): basal forebrain adenosine rose to ~140% of baseline over 6 hours of sleep deprivation in cats. 15–20% decline during spontaneous sleep episodes.
- Meta-analysis (2018, *J Circadian Rhythms*): pooled estimate ~74.7% above baseline during sleep deprivation across 9 studies (95% CI: 54.1–95.3%).

**Translating to the 0–100 scale:**

Using a saturating exponential with ~18h time constant:
`S(t) = 100 × (1 − exp(−t/18))`

At 16 hours awake: 100 × (1 − exp(−16/18)) ≈ **59**

The current 4 pts/hr linear gives 64 at 16 hours — close in the midrange, but:
- Linear understates early accumulation (hours 0–4)
- Linear overstates late accumulation (hours 12–16)

**The larger debt: cognitive load is ignored.** Adenosine is released in proportion to neuronal energy expenditure (ATP hydrolysis via ectonucleotidases CD39/CD73, plus astrocyte gliotransmission). High cognitive demand builds adenosine faster than passive wakefulness. The flat rate treats cognitive load as constant.

**Sleep clearance:** Depth-dependent. Adenosine kinase (primarily in glia) is the main clearance enzyme. SWA correlates with adenosine clearance. Adenosine deaminase variants that reduce adenosine metabolism specifically enhance deep sleep. The simulation's existing architecture (adenosine clearing faster during deep-sleep cycles) is biologically grounded.

**Sleep clearance time constant:** ~4 hours. After sleep deprivation, basal forebrain adenosine remained elevated throughout 3 hours of recovery sleep — BF clears slower than other regions.

### Calibration targets

Replace: `adenosine += 4` (linear) with:
```
adenosine += (ceiling - adenosine) / 18   // per hour; exponential approach
```
Where ceiling is set so that 16 hours awake → ~60. This is derivable from published data, not chosen.

Secondary debt to name explicitly: cognitive load modifier on accumulation rate (high-demand tasks → faster accumulation). Currently absent.

### Key sources
- Porkka-Heiskanen et al. 1997, *Science* 276:1265 — foundational
- Porkka-Heiskanen, Strecker & McCarley 2000, *Neuroscience* 99:507 — 140% BF, 15–20% spontaneous sleep
- Intracerebral Adenosine Meta-Analysis 2018, *J Circadian Rhythms* — 74.7% pooled increase (PMC6196573)
- Phillips, Klerman & Butler 2017, *PLoS Comput Biol* — full adenosine ODE model (PMC5675465)
- Two-Process Model review, Borbély 2022, *J Sleep Research* — 18h/4h time constants (PMC9540767)

---

## Sleep Quality Multipliers

**Applies to:** Sleep execute in `content.js` — all `qualityMult *=` lines in the `sleep` interaction.
**Status:** ✓ IMPLEMENTED 2026-02-20. All six factors recalibrated: overwhelmed 0.5→0.82×, strained 0.7→0.91×, starving 0.7→0.88×, very_hungry 0.85→0.94×, rain comfort 0.10→0.04, melatonin 1.05/0.85→1.03/0.90×. Circadian values unchanged (already within literature range). Adenosine crash penalty was already removed prior to this pass.

**Current debts:** Six multiplicative factors in `content.js` sleep execute, all chosen. Current code uses `qualityMult *= factor` for each.

### Stress

| Tier | Current | Literature | Confidence |
|---|---|---|---|
| `strained` | 0.70× | 0.90–0.93× | Moderate |
| `overwhelmed` | 0.50× | 0.80–0.85× | Moderate |

**Evidence:** Renner et al. 2022 (*Cerebral Cortex*, PMC9758584) — PSG with pre-sleep stressor: sleep efficiency dropped ~10–13% relative (from ~79% to ~69–71%). SWS reduced ~20–25%. Effect sizes: η² = 0.10–0.22.

The Berset et al. 2007 review of 63 PSG studies found stress effects are real but not universal — 41% showed efficiency decreases, 59% no change. The strongest signal is on awakenings/WASO and latency, not architecture (SWS/REM). The current 0.5× for `overwhelmed` implies pathological sleep degradation not seen in healthy-population PSG.

**Stacking concern:** `overwhelmed (0.5) × starving (0.7) × daytime (0.75) = 0.26×` — implausible. With calibrated values: `0.82 × 0.88 × 0.77 = 0.56×` — very bad but not absurd.

### Hunger

| Tier | Current | Literature | Confidence |
|---|---|---|---|
| `very_hungry` | 0.85× | 0.93–0.95× | Low (thin PSG data) |
| `starving` | 0.70× | 0.87–0.90× | Low |

**Evidence:** Direct PSG data on acute hunger is sparse. Severe caloric restriction (800 kcal/day for 4+ weeks) increases sleep latency and reduces SWS in the limited studies available. Acute single-night hunger is less studied. Important complication: ghrelin (elevated when hungry) *promotes* SWS, partially offsetting the arousal/discomfort effect. The dominant mechanism for single-night hunger is likely increased WASO from discomfort, not SWS/REM suppression. Current values substantially overstate the effect.

### Melatonin

| State | Current | Literature | Confidence |
|---|---|---|---|
| High melatonin bonus | 1.05× | 1.02–1.04× | Moderate |
| Low melatonin penalty | 0.85× | 0.88–0.92× | Moderate |

**Evidence:** Exogenous melatonin meta-analyses (Ferracioli-Oda et al. 2013, *PLoS One*; Brzezinski et al. 2005): sleep efficiency improvement ~2.2 percentage points (95% CI 0.2–4.2). From 85% baseline: 87.2/85 ≈ 1.026×. Melatonin does **not** increase SWS — it affects sleep onset and continuity via temperature/circadian signaling, not homeostatic pressure. The 1.05× bonus is at the high end; the 0.85× penalty is aggressive.

**Important:** Melatonin's primary effect is on sleep latency, not sleep architecture. If `qualityMult` downstream affects SWS-related outcomes, the melatonin factor is mechanistically misrouted.

### Circadian misalignment

| Window | Current | Literature | Confidence |
|---|---|---|---|
| Daytime (10:00–16:00) | 0.75× | 0.75–0.80× | **High** |
| Early morning (06:00–10:00) | 0.90× | 0.88–0.92× | Moderate |

**Evidence:** Forced desynchrony protocol (Dijk & Czeisler 1999, *J Physiology*, PMC2269279) — 482 sleep episodes across all circadian phases. Sleep efficiency: ~92.6% at optimal phase vs. ~73.0% at worst phase (ratio: 73/93 ≈ **0.785**). The current 0.75× is close to the empirically derived value for sleeping at the absolute worst circadian phase.

**These are the best-calibrated of the six factors.** The direction and magnitude both have direct PSG support from controlled protocols.

Important nuance: homeostatic pressure (high adenosine) partially compensates for circadian misalignment on SWS but not on REM. The simulation decouples these via the adenosine and circadian factors separately — structurally correct.

### Rain/sound comfort

| State | Current | Literature | Confidence |
|---|---|---|---|
| Rain comfort max bonus | +0.10 | +0.03–0.05 | Moderate |

**Evidence:** Messineo et al. 2017 (*Frontiers in Neurology*, PMC5742584) — white noise PSG crossover: sleep onset latency 19→13 min (38% reduction), but sleep efficiency 88%→87.5% (not significant, p=0.989). Jiang et al. 2025 meta-analysis (34 RCTs): white noise improved PSQI scores, most clearly for sleep latency in high-noise environments.

**The mechanism is noise masking, not intrinsic soothing.** The benefit is largest in noisy environments (urban, traffic) and absent or negative in already-quiet environments. The current implementation gives this bonus to any rain-liking character regardless of environment. The +0.10 also converts a latency benefit into a quality multiplier inflating it further — the actual efficiency effect is small and often not significant.

Future: condition this on environmental noise tier (urban vs. rural) when environment granularity is added.

### Adenosine crash (high adenosine at sleep onset)

| State | Current | Literature | Confidence |
|---|---|---|---|
| `adenosine > 80` | 0.90× penalty | **Direction is wrong** | **High** |

**Evidence:** High adenosine *drives more SWS*, not less. The adenosine A1 receptor system is the primary mechanism of SWA rebound after sleep deprivation. SWA during SWS after prolonged waking increases to >350% of baseline. Shift worker PSG confirms: daytime sleep after night shifts shows preserved N3 SWS and elevated SWA intensity despite circadian misalignment.

**Recommendation: remove this factor entirely.** The downsides of crash sleep (sleep inertia, missed REM due to short duration) are already modeled in `sleepCycleBreakdown()`. A quality penalty for high adenosine is mechanistically backward and double-counts effects handled elsewhere. If the intent is to capture that crash sleep often occurs at bad times/positions, those effects belong in the circadian and context factors.

### Key sources (sleep quality)
- Renner et al. 2022, *Cerebral Cortex* — PSG with pre-sleep stressor (PMC9758584)
- Berset et al. 2007, *Behavioral Sleep Medicine* — 63-study PSG review (PMC4266573)
- Åkerstedt et al. 2012, *Sleep* — naturalistic stress-sleep (PMC4202771)
- Ferracioli-Oda et al. 2013, *PLoS One* — melatonin meta-analysis (PMID 23691095, PMC3656905)
- Brzezinski et al. 2005, *Sleep Medicine Reviews* — melatonin meta-analysis (PMID 15649737)
- Dijk & Czeisler 1999, *J Physiology* — forced desynchrony PSG (PMC2269279)
- Messineo et al. 2017, *Frontiers in Neurology* — white noise PSG (PMC5742584)
- Reichert et al. 2022, *PMC* — adenosine, caffeine, sleep-wake review (PMC9541543)

---

## Emotional Inertia Trait Weights

**Applies to:** `effectiveInertia()` and `regulationCapacity()` in `state.js`.
**Status:** ✓ IMPLEMENTED 2026-02-20. Weights corrected to `rumination: 0.40, neuroticism: 0.32, self_esteem: 0.28`. Negative-direction asymmetry extended to both neuroticism and rumination.

**Current debt:** Weights `neuroticism: 0.5, self_esteem: 0.3, rumination: 0.2` in `effectiveInertia()` (state.js). Chosen without empirical basis.

### What the literature says

**The current ordering is empirically backwards.** Meta-analytic correlations with negative emotion (NE) inertia from Houben et al. 2015 (*Psychological Bulletin*, PMC4705270):

| Trait | Meta-analytic r (NE inertia) | Meta-analytic r (PE inertia) |
|---|---|---|
| Rumination | **r = 0.26** [0.15–0.36] | r = 0.16 |
| Neuroticism | r = 0.21 [0.04–0.37] | r = 0.13 |
| Self-esteem (low) | r = 0.14–0.20 | r ≈ similar (symmetric) |

Rumination is the strongest predictor of NE inertia, not the weakest.

**From the Houben meta-analysis Study 2** (simultaneous regression on NE inertia including all three):
- Rumination: β = 0.05 (p < 0.001) — largest
- Self-esteem: β = −0.04 (p = 0.011)
- Depressive symptoms (as neuroticism proxy): β = 0.03 (p = 0.029)

**Wenzel et al. 2025 (*JPSP*, N=1,118, N_obs=96,699):** Neuroticism associated with all three components: more frequent/intense negative events, increased NA reactivity, AND decreased recovery from negative events. Poor recovery (not reactivity alone) is what drives mean NA elevation — because reactivity without recovery accumulates. This supports the inertia framing.

**Empirically-derived weights** (scaling meta-analytic r values to sum to 1):
- Rumination r = 0.26 → **weight ≈ 0.40**
- Neuroticism r = 0.21 → **weight ≈ 0.32**
- Self-esteem r = 0.18 (midpoint) → **weight ≈ 0.28**

### Asymmetry findings

**Neuroticism: strong asymmetry toward negative — well supported.**
- NE inertia r = 0.21; PE inertia r = 0.13 (meaningfully weaker)
- NE variability b = 0.10; PE variability b = 0.03–0.04 (near zero)
- The simulation's existing rule (neuroticism adds stickiness only in the "toward worse" direction) is empirically correct.

**Self-esteem: valence-symmetric — differs from neuroticism.**
- Kuppens et al. 2010 found low self-esteem elevated inertia for *both* positive and negative emotions at similar magnitudes (happy β = −0.07, excited β = −0.08, anxious β = −0.14, depressed β = −0.11).
- Self-esteem should affect emotional rigidity generally, not asymmetrically toward negative.

**Rumination: asymmetric toward negative (like neuroticism).**
- Mechanistically: repetitive processing of negative content actively maintains negative cognition.
- Houben meta-analysis: NE inertia r = 0.26 vs. PE inertia r = 0.16.
- Should follow the same asymmetry pattern as neuroticism in `effectiveInertia()`.

### Caveats

- The three traits correlate with each other (neuroticism-rumination r ≈ 0.4–0.6; low SE-rumination r ≈ 0.3–0.5). Their joint contributions involve suppression effects. No published study puts all three into one model predicting ESM-derived affect autocorrelation at sufficient sample size to trust relative betas precisely.
- The weights from meta-analytic r values are derived from separate studies aggregated — not from a single clean multi-predictor model.
- The proposed weight reordering (rumination first) is well-supported directionally; the exact magnitudes remain approximation debts with better grounding than before.

### Key sources
- Houben, Van Den Noortgate & Kuppens 2015, *Psychological Bulletin* — meta-analysis (PMID 25822133; no PMC deposit — note: PMC4705270 is Koval et al. 2016, a different paper)
- Kuppens et al. 2010, *Psychological Science* — self-esteem and affect autocorrelation (PMC2901421)
- Koval et al. 2012, *Psychological Medicine* — getting stuck in depression (PubMed 22671768)
- Wenzel et al. 2025, *JPSP* — neuroticism, reactivity, and recovery (PubMed 41264496)
- Raes & Williams 2010, *Cognition & Emotion* — rumination ESM (PMC2672047)
- Neural predictors of emotional inertia (PMC5629827)
- Dejonckheere et al. 2020, *PNAS* — neuroticism and emotional variability (PMC7196909)

---

## Social Need Model

**Applies to:** Social decay block in `tickNeurochemistry()` in `state.js`, the `social` state variable, and new `social_energy` variable.
**Status:** ✓ IMPLEMENTED 2026-02-20. 10-action threshold removed; linear 2 pts/hr replaced by asymptotic decay (τ=66h, ~7 pts/10h from social=50). Neuroticism scales rate ±35%. `social_energy` variable added: depleted by adjustSocial (0.5× coefficient), recovers at 3 pts/hr during solitude, fully reset by sleep. socialEnergyTier() exported. Habits feature extraction updated. Remaining approximation debts: τ not derived from literature; trait loneliness floor absent (needs chargen param); introversion scaling absent (needs chargen param).

**Current debt:** `social` state variable decays at 2 pts/hr after 10 idle actions without meaningful interaction. Both the rate and threshold are chosen without empirical basis. The model also conflates two distinct systems.

### What the literature says

**The "10 idle actions" threshold has no empirical basis and is the wrong model.** Social need accumulates continuously from first isolation, sub-linearly (fast early, decelerating asymptote). No clean onset point exists.

**The two-process model (empirically supported):**

Two genuinely separate systems the simulation currently conflates:

1. **Social need** — homeostatic drive. Accumulates with isolation, decelerating curve. Reduced by meaningful contact; partially reduced by superficial contact. Quality matters more than quantity.
2. **Social energy** — depleted by any social interaction; recovers during solitude and sleep; introversion amplifies depletion. Peaks 2–3 hours after sociable behavior (Zelenski et al. 2020, PMC7260435).

These can be simultaneously high: the introverted person who desperately wants connection but finds every interaction exhausting. That tension is a real psychological state.

**Onset timescales:**

Tomova et al. 2020 (*Nature Neuroscience*): 10 hours of total social isolation produced midbrain dopaminergic craving responses similar in pattern to 10 hours of food fasting. Self-reported loneliness and social craving measurably elevated. This is the empirical floor — effects detectable at 10 hours.

Ding et al. 2025 (*Nature*): hypothalamic social homeostasis circuit. Social need accumulates continuously during isolation and dissipates gradually during reunion (not instantly). The dose-response to isolation duration was graded and continuous — no threshold effect.

**Accumulation rate:**

No clean "X points per hour of isolation" exists in literature. The relationship is:
- Non-linear (slow build that asymptotes)
- Dominated by perceived quality of last contact, not duration of absence
- Moderated strongly by personality

If meaningful distress starts ~60–70 on a 0–100 scale, a baseline character might accumulate ~5–10 points over a typical 10-hour day without meaningful interaction. The current 2 pts/hr gives 20 points — likely too fast.

**Current 2 pts/hr is too fast by roughly 2–4×.**

**Personality modulation (Buecker et al. 2020 meta-analysis, N=93,668):**
- Neuroticism: r = +0.358 with loneliness → faster accumulation, higher peak sensitivity
- Extraversion: r = −0.370 with loneliness → introversion modulates social *energy* cost more than social *need* rate
- Together: personality should modulate rate by roughly ±30–40%

**Relief:**

- Meaningful contact: immediate onset, persists 2–5 hours post-contact (ESM literature)
- Superficial contact (cashier, neighbor): real but small relief — r ≈ 0.15–0.25 with momentary wellbeing (Sandstrom & Dunn 2014)
- At high chronic loneliness: ambiguous interactions may *increase* need rather than reduce it (Cacioppo hypervigilance mechanism — lonely brains detect social threats at ~116ms vs. 252ms for non-lonely)

**Social fatigue timescales:**

Zelenski et al. 2020 (PMC7260435): sociable behavior predicted fatigue peaking 2–3 hours later. True for everyone, magnitude moderated by introversion. Mood benefit (positive affect during interaction) and fatigue cost (2–3 hours later) are genuinely separate, coexisting effects.

### Design implications

- Split `social` into two variables: `social_need` (homeostatic drive) and `social_energy` (depleted by interaction, recovered by solitude/sleep)
- Remove the 10-action threshold entirely; make accumulation continuous from first isolation
- Use sub-linear (asymptotic) accumulation, not linear
- Superficial contact provides partial relief (~10–20% of meaningful contact)
- Negative/ambiguous contact at high loneliness may increase need — model via quality detection
- Introversion → scales social energy depletion per interaction (not social need accumulation rate)
- Neuroticism → scales social need accumulation rate and peak sensitivity
- Trait loneliness (a character property) should set a floor below which `social_need` doesn't fully return to zero — this is a chargen parameter to add

### Key sources
- Tomova et al. 2020, *Nature Neuroscience* — 10h isolation = midbrain craving response (PMID 33230328)
- Ding et al. 2025, *Nature* — hypothalamic social homeostasis circuit (PMID 40011768)
- Buecker et al. 2020, *European J Personality* — Big Five × loneliness meta-analysis (N=93,668) (DOI 10.1002/per.2229; no PMID — journal not indexed in MEDLINE)
- Zelenski et al. 2020, *J Personality* — sociable behavior and fatigue lag (PMC7260435)
- Sandstrom & Dunn 2014, *Personality and Social Psychology Bulletin* — weak ties and wellbeing (PMID 24769739)
- Cacioppo & Cacioppo 2018 — loneliness and social threat detection
- PMC review — neural circuitry of social homeostasis (PMC8580010)

---

## Stress Creep and HPA Axis Self-Reinforcement

**Applies to:** `tickNeurochemistry()` in `state.js` — the `stress += hours * 1` block (line ~451).
**Status:** Research complete 2026-02-20. Not yet implemented.

**Current debt:** `if (s.stress > 50) { s.stress = Math.min(100, s.stress + hours * 1); }` — a linear rate above a scalar threshold. Both the rate (1 pt/hr) and the threshold (50) are chosen. The approximation debt comment at the site correctly names this as the wrong model — confirmed by the research below.

---

### Question 1: Timescales of HPA sensitization

**The mechanisms operate on three distinct timescales, none of which are hours.**

**Acute cortisol response (minutes):**
After a psychological stressor, salivary cortisol peaks 10–20 minutes after stressor *cessation* (i.e., ~25–30 minutes from onset). Return to baseline: 45–60 minutes post-stressor for most participants. Cortisol plasma half-life: 70–120 minutes.

- Peak timing and recovery kinetics: Kirschbaum et al. TSST data, summarized in Kudielka et al. 2009 TSST review (PMC5314443). Absolute recovery at 60 min post-stressor: Strahler et al. 2020 (PMID 31711229, DOI 10.1210/clinem/dgz190).
- Cortisol half-life 70–120 min: Bright et al. 2019 (PMID 31749763, PMC6848065).

**Cross-sensitization (hours to days):**
A single acute stressor can sensitize HPA reactivity to subsequent novel stressors. Onset is within 24 hours (measurable the next day). Duration depends on the triggering stressor's length:
- 5-minute triggering stressor → sensitization present at 2 days, absent at 7 days.
- 2-hour triggering stressor → sensitization persists through 7 days.
- Key determinant of persistence: length of initial stressor, not intensity.

- Source: Belda et al. 2016, *Scientific Reports* (PMID 27511270; PMC4980629). Rodent model (IMO/open-field paradigm). Statistically significant ACTH enhancement: χ²(3)=17.4, p=0.001.

**Gland-mass changes (weeks):**
Structural HPA adaptation — changes in corticotroph and adrenal cortex cell mass — operates on a timescale of weeks. Cell half-lives: corticotrophs ~6 days, adrenal cortex ~12 days. Measurable hormonal dysregulation from gland mass changes appears after "a few weeks or longer" of sustained stress.

- Source: Karin et al. 2020, *Molecular Systems Biology* (PMID 32672906; PMC7364861; DOI 10.15252/msb.20209510). Mathematical modeling incorporating empirical half-life data.

**Chronic VCS recovery (days to weeks):**
After 1 week of twice-daily variable stressors, HPA hypoactivity emerged at 4–7 days post-stress (not immediately), and normalized at 30 days. This reveals a *delayed* hypoactivity phase — the system undershoots after chronic drive is removed before recovering.

- Source: Ostrander et al. 2006, *Endocrinology* (PMID 16396985; PMC1815381). Rodent model.

---

### Question 2: Shape of escalation

**Not linear. Not threshold-gated. Three distinct patterns depending on timescale:**

**Within-acute-episode:** Cortisol response is approximately bell-shaped — rapid rise from HPA activation (minutes), peak 10–30 minutes post-stressor, then exponential decay via glucocorticoid negative feedback. The decay is governed by the plasma half-life (~70–120 min). Rise and fall rates are nearly symmetric at the hormonal level in healthy individuals: reactivity slope β = 0.41; recovery slope β = −0.42 (Lier et al. 2023, PMID 36820051, PMC9937905, DOI 10.1016/j.bbih.2023.100598).

**Important: near-symmetric rise and fall** (not "builds faster than fades") is the healthy-individual pattern for acute cortisol. Impaired recovery (slower fall) is a marker of allostatic load and chronic stress history, not a universal property of the acute response.

**Within-day (hours):** No literature supports a self-reinforcing within-day escalation in the cortisol/HPA signal itself under normal psychological stress. However, **rumination creates functional within-day escalation via a behavioral mechanism**: repeated reactivation of the stress response through ruminative thought re-triggers HPA pulses, maintaining elevated cortisol above what a single acute stressor would produce. Quantified effect: at 1.5 SD above-average rumination combined with above-average stress, next-morning waking cortisol was ~23.6% higher (Zoccola et al. 2020, PMID 30961457, PMC6783329).

This is the mechanistic basis for whatever within-day self-reinforcement exists: **not the HPA axis escalating on its own, but rumination and lack of recovery maintaining repeated re-activation.**

**Cross-day/chronic (days to weeks):** Cross-sensitization shows progressive decline over days (not escalation): strong sensitization the day after, diminishing over 2–7 days. Gland-mass changes (true structural adaptation) show exponential trajectories — not linear, with a time constant measured in weeks.

**Recovery asymmetry (the real asymmetry):**

The most significant recovery asymmetry in the literature is not rise-vs-fall *within* an episode but the *post-chronic-stress* period. After chronic variable stress (1 week), the HPA axis took 30 days to fully normalize. The adaptation required ~4–5× longer to reverse than it took to establish (Ostrander et al. 2006, PMID 16396985). This is allostatic load in its operational sense: the system can't quickly undo structural changes that built over weeks.

**Positive feedback mechanisms (contextual, not universal):**

Under chronic stress conditions specifically, glucocorticoids can *increase* CRH expression in the central amygdala (rather than suppressing it via the usual negative feedback loop). This is a positive feedback arm that operates in chronically stressed states — documented in the Herman et al. 2016 HPA regulation review (PMID 27065163, PMC4867107). The CRH–norepinephrine–CRH loop is also cited as a potential self-reinforcing mechanism in hypercortisolism (directional only — no specific rate cited in the sources reviewed). These are structural changes, not within-hour dynamics.

**Does it saturate?** Yes. Saturation is built into the biology: adrenal cortex has a ceiling on ACTH-stimulated cortisol output; glucocorticoid negative feedback (fast, intermediate, and delayed) limits escalation. The Karin et al. 2020 mathematical model explicitly uses bounded exponentials. In a 0–100 simulation scale, a ceiling at 100 is structurally correct.

---

### Question 3: HPA sensitization vs. allostatic load — which is relevant within a day?

**They are distinct mechanisms and neither is the right model for within-day simulation.**

**HPA sensitization** is the phenomenon where prior stress exposure increases the *reactivity* of the HPA axis to subsequent novel stressors. Timescale: the enhanced reactivity emerges within hours, measurable the next day, and fades over days to weeks depending on initial stressor severity. The mechanism involves synaptic plasticity in PVN CRH neurons (increased excitatory input frequency ~100%, reduced inhibitory input frequency ~50% after 14-day CVS — Flak et al. 2009 cited in PMID 27054552, PMC4891782). This is a days-scale effect on *reactivity to new stressors*, not a within-day self-escalating process.

**Allostatic load** is the McEwen (1998) concept of cumulative physiological wear from repeated or sustained allostatic responses (PMID 9629234, DOI 10.1111/j.1749-6632.1998.tb09546.x). It is a weeks-to-years phenomenon — the chronic recalibration of biological setpoints from sustained stress. It explains why a person who has been stressed for months has different HPA dynamics than someone who is stressed today. It is not a within-day mechanism.

**What actually operates within a day:**
1. The acute HPA response: cortisol spike peaking at ~25 min post-stressor onset, returning to baseline within 60–90 minutes. No self-reinforcement from the HPA axis itself in this window.
2. Behavioral self-reinforcement via rumination: replaying or anticipating stressors re-triggers HPA pulses repeatedly. This *mimics* a self-escalating signal but is mediated by thought pattern, not HPA biology.
3. Sympatho-adrenal (SAM) axis response: faster, via norepinephrine. The HPA axis is the *slower* arm — it is not what drives minute-to-minute subjective stress escalation within a session.

**For a within-day simulation, the correct model is:**
- Stress state should reflect *accumulated unresolved acute activations*, not an autonomous self-escalating HPA rate.
- The self-reinforcing term is better attributed to the `rumination` personality parameter already in the simulation.
- A linear `+1 pt/hr above 50` is wrong in both mechanism and timescale.

---

### Question 4: Practical calibration targets

**The current `+1 pt/hr above 50` is the wrong model shape, not just a miscalibrated rate.**

The within-day mechanism to replace it with is **stress accumulation that decays without active recovery**, combined with **rumination-scaled re-activation resistance**. The self-reinforcing behavior should be:

- **Not a constant rate above a threshold** — no biological mechanism supports this within hours.
- **A resistance to decay** — the real phenomenon is that high stress *prolongs* recovery time (impairs glucocorticoid negative feedback via GR downregulation under chronic conditions) rather than adding a constant increment.
- **The threshold shape is directionally wrong**: HPA sensitization doesn't have a clean threshold at 50; reactivity increases continuously, with greater acceleration at higher chronic burden.

**What the literature supports as a within-day model:**

The appropriate shape is: stress decays toward baseline (via normal HPA negative feedback) at a rate that *decreases* as stress is high and rumination is high. At low stress, decay is fast (cortisol half-life ~80 min). At high stress + high rumination, decay is slower because ruminative re-activation continuously re-triggers the response. This is not self-escalation of a quiescent baseline — it is impaired recovery.

**Magnitude calibration:**
- Cortisol half-life (plasma): 70–120 min. In a 0–100 game-time stress scale at normal/low-stress baseline, stress should halve roughly every 1–2 hours of genuine rest, not faster.
- The rumination effect at 1.5 SD above average: ~23.6% higher next-morning cortisol (Zoccola et al. 2020, PMID 30961457). This is a next-day effect, not within-day, but is the only quantified rumination × stress interaction in the sources reviewed.
- Cross-sensitization after a major stressor: HPA reactivity to subsequent stressors elevated for up to 7 days (Belda et al. 2016, PMID 27511270). This argues for a multi-day "sensitized baseline" state following high-stress days, not a within-day constant.

**Proposed replacement model direction:**

Rather than `stress += hours * 1 when stress > 50`, consider:
1. Remove the self-reinforcing upward creep entirely for within-day.
2. Reduce the decay rate of stress when `rumination` is high — stress falls slower toward baseline for high-rumination characters, capturing the ruminative re-activation mechanism.
3. For the multi-day effect: track a slow-decaying "sensitization" state (separate from instantaneous `stress`) that elevates reactivity for subsequent stressors. This maps correctly to the days-timescale cross-sensitization literature.

The exact replacement coefficients remain approximation debts — the literature provides timescales and direction but not direct 0–100 scale calibration targets. Any replacement should be explicitly marked as derived-from-direction, not derived from a specific quantitative source.

---

### Key sources

- Herman et al. 2016, *Comprehensive Physiology* — HPA regulation review, acute vs. chronic circuitry, positive feedback mechanisms (PMID 27065163, PMC4867107)
- Karin et al. 2020, *Molecular Systems Biology* — mathematical model, corticotroph/adrenal half-lives 6/12 days, weeks-timescale dysregulation (PMID 32672906, PMC7364861, DOI 10.15252/msb.20209510)
- Belda et al. 2016, *Scientific Reports* — cross-sensitization onset/persistence, 2–7 day window (PMID 27511270, PMC4980629)
- Ostrander et al. 2006, *Endocrinology* — 30-day recovery after 1-week CVS, delayed hypoactivity at 4–7 days (PMID 16396985, PMC1815381)
- Lier et al. 2023, *Brain, Behavior and Immunity – Health* — rise/fall symmetry β=0.41/−0.42; CAR predicts impaired recovery (PMID 36820051, PMC9937905, DOI 10.1016/j.bbih.2023.100598)
- Zoccola et al. 2020, *Cognition and Emotion* — rumination × daily stress → 23.6% higher next-morning cortisol (PMID 30961457, PMC6783329)
- McEwen 1998, *Annals of the NY Academy of Sciences* — allostatic load definition, HPA wear-and-tear (PMID 9629234, DOI 10.1111/j.1749-6632.1998.tb09546.x)
- Strahler et al. 2020, *JCEM* — TSST cortisol peak at +10/+20 min post-cessation, baseline by +60 min (PMID 31711229, DOI 10.1210/clinem/dgz190)
- Bright et al. 2019, *PMC* — cortisol half-life 70–120 min (PMID 31749763, PMC6848065)
- Belda et al. 2015, *Stress* — cross-sensitization review, short stressors, behavioral persistence (PMID 26300109)
- Flak et al. 2009 [cited in PMID 27054552, PMC4891782] — synaptic plasticity in PVN CRH neurons after chronic stress (~100% mEPSC increase, ~50% mIPSC decrease)

---

## Pending Research

The following calibration debts were identified but not yet researched:

- **NT rate constants table** — all 27 drift rate pairs [upRate, downRate] are chosen approximations. Real receptor binding kinetics per neurotransmitter.
- **Serotonin/dopamine/NE/GABA target function coefficients** — every coefficient connecting circumstances to NT targets is chosen. No single calibration source — needs ecophysiology literature per system.
- **Energy drain: 3 pts/hr base, hunger multipliers 1.3×/1.8×** — chosen. Calibration: human performance / sustained operations literature.
- **Emotional inertia weights: state penalties** (adenosine > 60, stress > 60 reduce regulation capacity) — directions correct, magnitudes chosen.
- **Event probabilities** (0.03 weather, 0.10 workplace, etc.) — per-action rates, chosen. Hard to calibrate against real sources without converting to per-hour framing.
