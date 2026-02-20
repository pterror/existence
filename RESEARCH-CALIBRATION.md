# Calibration Research

Empirical literature review findings for replacing approximation-debt constants in the simulation. Each section covers one debt, summarizes what the research supports, and gives calibration targets.

Research conducted 2026-02-20 via web search agents across PubMed, PMC, and published meta-analyses. Citations are provided but not independently verified — treat as directional rather than authoritative until spot-checked.

---

## Adenosine Accumulation Rate

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
- Ferracioli-Oda et al. 2013, *PLoS One* — melatonin meta-analysis
- Brzezinski et al. 2005, *Sleep Medicine Reviews* — melatonin meta-analysis
- Dijk & Czeisler 1999, *J Physiology* — forced desynchrony PSG (PMC2269279)
- Messineo et al. 2017, *Frontiers in Neurology* — white noise PSG (PMC5742584)
- Reichert et al. 2022, *PMC* — adenosine, caffeine, sleep-wake review (PMC9541543)

---

## Emotional Inertia Trait Weights

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
- Houben, Van Den Noortgate & Kuppens 2015, *Psychological Bulletin* — meta-analysis (PMC4705270)
- Kuppens et al. 2010, *Psychological Science* — self-esteem and affect autocorrelation (PMC2901421)
- Koval et al. 2012, *Psychological Medicine* — getting stuck in depression (PubMed 22671768)
- Wenzel et al. 2025, *JPSP* — neuroticism, reactivity, and recovery (PubMed 41264496)
- Raes & Williams 2010, *Cognition & Emotion* — rumination ESM (PMC2672047)
- Neural predictors of emotional inertia (PMC5629827)
- Dejonckheere et al. 2020, *PNAS* — neuroticism and emotional variability (PMC7196909)

---

## Social Need Model

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
- Tomova et al. 2020, *Nature Neuroscience* — 10h isolation = midbrain craving response
- Ding et al. 2025, *Nature* — hypothalamic social homeostasis circuit
- Buecker et al. 2020, *European J Personality* — Big Five × loneliness meta-analysis (N=93,668)
- Zelenski et al. 2020, *J Personality* — sociable behavior and fatigue lag (PMC7260435)
- Sandstrom & Dunn 2014, *Social Psychological and Personality Science* — weak ties and wellbeing
- Cacioppo & Cacioppo 2018 — loneliness and social threat detection
- PMC review — neural circuitry of social homeostasis (PMC8580010)

---

## Pending Research

The following calibration debts were identified but not yet researched:

- **NT rate constants table** — all 27 drift rate pairs [upRate, downRate] are chosen approximations. Real receptor binding kinetics per neurotransmitter.
- **Serotonin/dopamine/NE/GABA target function coefficients** — every coefficient connecting circumstances to NT targets is chosen. No single calibration source — needs ecophysiology literature per system.
- **Stress creep: 1 pt/hr above 50** — real mechanism is HPA sensitization, not linear scalar.
- **Energy drain: 3 pts/hr base, hunger multipliers 1.3×/1.8×** — chosen. Calibration: human performance / sustained operations literature.
- **Emotional inertia weights: state penalties** (adenosine > 60, stress > 60 reduce regulation capacity) — directions correct, magnitudes chosen.
- **Event probabilities** (0.03 weather, 0.10 workplace, etc.) — per-action rates, chosen. Hard to calibrate against real sources without converting to per-hour framing.
