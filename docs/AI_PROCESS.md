# AI process

How AI tools were used, iteration by iteration. Each tool has a visible contribution, not a
decorative list. Prompts and raw answers are in `PROMPTS.md`.

| Stage | Tool | Role | Visible impact |
|---|---|---|---|
| Hypothesis challenge | Gemini / ChatGPT / Claude | Existing-solutions scan + stakeholder critique | Confirmed the wedge is a *combination*; surfaced `insufficient_data` as the honest differentiator |
| Product criticism | ChatGPT / Claude | Skeptical product reviewer | Produced the central reframe (handoff = classify, not blame) |
| Implementation | Claude Code | Built the static prototype | Generated the deterministic engine, corpus generator, and page under direction |
| QA | Separate context (subagent) | Adversarial reviewer | Reviewed the four verdicts; led to a calibration fix (see Iteration 5) |

---

## Iteration 1: Frame the observation as a hypothesis

No AI yet. Turned an interview observation ("we log that a handoff happened, not why") into a
written hypothesis with named users and five unvalidated assumptions, so the rest of the process
could attack something concrete.

## Iteration 2: Does this already exist?

**Tool and role.** Gemini, ChatGPT, Claude, existing-solutions scan.

**Important criticism.**
- The space is crowded with *adjacent* tools (LLM observability, enterprise bot platforms, CCaaS
  QA). Don't claim "nobody explains handoffs."
- All three independently named "insufficient data" the most honest, defensible feature.
- LLMs are unreliable causal narrators (Claude cited LLM-RCA research), keep the judgment in code.

**My evaluation.** Valid. The idea isn't novel as a capability; it's defensible as a combination.

**My decision.** Position on the combination (event-timeline substrate + per-handoff verdict +
calibrated abstention + bot-agnostic). Keep classification deterministic; let an LLM only phrase
prose.

**Impact on the prototype.** Set the architecture: `signalExtractor.ts` + `classify.ts` are real
code; `analyses.json` is frozen prose. `insufficient_data` is a first-class output.

## Iteration 3: Is the framing even right?

**Starting assumption.** Every human handoff represents a failed automated journey.

**Tool and role.** ChatGPT and Claude, acting as skeptical product reviewers.

**Important criticism.**
- Many handoffs are required by policy, requested by the customer, or correct safe behaviour.
- A handoff has two axes: was escalation the right *decision*, and was it well *executed*?
- Separate root cause from handoff quality.

**My evaluation.** The criticism is valid and materially changes the product definition.

**My decision.** Treat a handoff as an event to *classify*, not blame. Adopt the two-axis insight.

**Impact on the prototype.** Classifications became `justified` / `potentially_avoidable` /
`insufficient_data`. The execution-quality axis was named and deliberately scoped to roadmap.

## Iteration 4: Build (Claude Code)

**Role.** Implementation under direction, I set the contract, scenarios, and scope; Claude Code
generated the engine, the seeded 500-call corpus generator, the tests, and the page. My role was
review and direction, not typing every line.

**Impact.** A green, tested prototype: deterministic engine + four walkthroughs + a live roll-up
over 500 synthetic calls, with real-vs-simulated labelled throughout.

## Iteration 5: Adversarial QA (separate context)

**Role.** A separate reviewer context audited the four verdicts: does each conclusion follow from
the timeline, are there unsupported causal claims, is there missing contradictory evidence, would
`insufficient_data` be safer.

**Impact.** See the commit that follows this report, one calibration fix was folded in based on
the review. (Documented here once the fix lands so this reflects what actually happened.)
