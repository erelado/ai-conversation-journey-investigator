# Discovery journey

Working notes, written as I go.

## 1. Where the idea came from

In the interview we talked about bot-to-human fallback, monitoring, and logging, what happens
when an automated flow can't complete a customer request.

Something stuck with me. A system can log *that* a human handoff occurred. The event by itself
doesn't explain *why*. To understand the cause you usually have to stitch together IVR
selections, detected intents, transcripts, tool calls, latency, retries, and system errors from
several different places.

I want to treat this as a hypothesis to test, not a feature to assume.

## 2. Initial hypothesis

**Observation.** Logging captures that a handoff *happened*; it doesn't explain the *journey*
that caused it.

**Hypothesis.** Cloud communication platforms can *measure* human handoffs, but they don't give
product/operations teams a clear, evidence-based explanation of *why* a given conversation
reached a human.

**Who I think has the pain.**
- Conversation / automation owners tuning IVR + bot flows.
- Operations / QA leads who have to explain spikes in handoffs.
- (Maybe) product, deciding what to automate next.

**The problem today.** Answering "why this handoff?" means manually correlating intents, tool
calls, retries, errors, and customer behaviour across systems. Slow, inconsistent, and it
doesn't scale past spot-checking a few calls.

**Assumptions I have NOT validated yet.**
1. Teams actually want *per-conversation* root cause, not just aggregate dashboards.
2. The event timeline carries *enough signal* to explain a handoff.
3. An *evidence-based* explanation is more trusted/actionable than a confidence score.
4. Handoff is the right *trigger* to investigate (vs. other failure signals).
5. The cost of investigating per-conversation is worth the operational payoff.

## 3. Does this already exist?

I ran one scan prompt across Gemini, ChatGPT, and Claude (prompt + raw answers in `PROMPTS.md`).
They converged: the space is crowded with *adjacent* tools, but the specific framing isn't
shipped. Four categories each do *part* of it:

| Category | Examples | What they do | Gap vs. this idea |
|---|---|---|---|
| LLM / agent observability | LangSmith, Arize, Datadog, Langfuse | Capture the exact event trace (intents, tool calls, retries, errors, latency) | Built for engineers; no contact-center semantics; blind to telephony events |
| Enterprise bot platforms | Cognigy, Kore.ai, Dialogflow CX, Decagon | Per-conversation logs + escalation-reason tagging *at trigger time* | Single-vendor / own-bot only; log the trigger, don't reconstruct the cause post-hoc |
| CCaaS quality / analytics | NICE, Genesys, Verint, CallMiner, Observe.AI | 100%-coverage auto-QA, "avoidable transfer" flags | Transcript-based, not the execution timeline; score human agents, not the bot's decision |
| Handoff summaries | Salesforce, Twilio, Genesys | Summarize context for the receiving agent | Answer "what happened so far?", not "was it preventable?" |

The models were blunt: don't claim "nobody explains handoffs." The defensible wedge is a
*combination*, not a new capability:
1. **Event-timeline substrate** (tool calls / retries / errors), not transcript-only.
2. **Per-handoff verdict**, the classification taxonomy is genuinely uncommon.
3. **Calibrated abstention**, all three independently named "insufficient data" the most honest,
   defensible feature. (LLM root-cause research shows models are unreliable narrators; refusing
   to invent a reason is the wedge, not a hedge.)
4. **Bot-agnostic / platform-level**, fits a FreeSWITCH/Asterisk platform hosting many tenants.

Prior art noted, not ignored: patents US 11,928,010 and US 10,516,779, both different from an
operator-facing per-handoff verdict. No novelty claimed beyond the combination above.

This also told me *how* to build it: keep the causal judgment in deterministic code, and let an
LLM phrase only the prose. That sidesteps the unreliable-narrator failure mode.

## 4. Is the framing right? The reframe

I asked two models, as skeptical product managers, to attack my assumption that *a handoff means
automation failed*. Both rejected it and pushed further than my own first reframe.

A handoff is often **not** a failure: the customer asked for a human; policy/regulation requires
one; the action is out of scope; human judgment is the point; the bot safely escalated under
uncertainty; identity couldn't be verified; the journey is a planned qualify-then-transfer; a
business system failed and the handoff was the correct *recovery*.

The deeper insight (this changed the model): a handoff has **two independent axes**:
1. Was escalation the right *decision*? (justified / potentially_avoidable / caller-driven)
2. Was the handoff well *executed*? (clean context transfer vs. cold transfer + re-auth)

A clean designed escalation and a broken NLU loop must never look the same. A correct-but-sloppy
handoff is often the cheapest CSAT fix, and is invisible if you only ask "did the bot fail?"

**Decision.** A handoff is not a failure. It is an event to be **classified**, not blamed.

```
        "Handoff = failure"
                 │
                 ▼   challenged by AI review
  "Handoff = classify it: was it the right decision, and was it executed well?"
```

## 5. Scope decision

Building the full two-axis model (both axes, the full cause taxonomy, execution-quality scoring)
inside the time box would be scope-greed, and it would dilute the demo. I cut to the core
hypothesis:

| Build now (prototype) | Roadmap (named, not built) |
|---|---|
| The *decision* axis: `justified` / `potentially_avoidable` / `insufficient_data` | The *execution-quality* axis (routing, context transfer, re-auth, repetition) |
| `cause_category` + supporting / contradicting / missing evidence | Expected-handoff-rate per journey |
| Four hand-authored scenarios | The full cause taxonomy |

This is deliberate scope management, not missing work.

**Explicitly excluded from the prototype:** real FreeSWITCH/Asterisk integration, audio
streaming, speech-to-text, a full voice agent, live CRM, aggregate analytics, automatic IVR
modification, continuous production monitoring.

## 6. Prototype hypothesis

One question the prototype tests:

> Can a structured journey timeline be converted into a useful, cautious, and evidence-based
> explanation of a handoff, including the discipline to say "not enough data"?

The third and fourth scenarios (a justified handoff, and a dropped timeline) are the important
ones: they prove the system isn't just calling every transfer a failure.

## 7. What I built

The smallest real thing: a deterministic signal extractor + classifier (`src/lib`) over the four
scenarios, backed by a corpus of 500 synthetic calls so the engine is exercised at volume rather
than on toys. The page walks this same story and ends in the interactive investigator.

Real vs. simulated, stated everywhere: extraction + classification + evidence run live and are
unit-tested; only the summary prose is frozen offline; the telephony event stream is simulated.

## 8. What adversarial QA changed

I ran a read-only `qa-reviewer` in a separate context against the four verdicts. It found real
issues: the rules claimed "the handoff followed..." without checking a handoff existed; the
`causalSignalCount` abstain-invariant was computed but never enforced; and a retry (genuine
recovery) wasn't surfaced as counter-evidence. I folded all three in, and deliberately deferred
one suggestion (treating `intent: "unknown"` as a signal would have erased the abstention
scenario). Details in `AI_PROCESS.md`.

## 9. What remains unproven

The prototype proves the mechanism is *possible*. It does not prove it is *valuable*. Before
building further, validate with real users:
- Do ops/automation owners act on a per-handoff explanation (vs. aggregate dashboards)?
- Is the production event stream rich enough (logs are often partial)?
- Is `evidence_strength` trusted more than a confidence score?
- Does `insufficient_data` read as honesty, or as "the tool didn't work"?
- What is the real cost/benefit of per-conversation investigation vs. sampling?

That is the submission: I noticed something, formed a hypothesis, used AI to challenge it, changed
my framing, cut the scope, built the smallest proof, tested where it could fail, and stated what
remains unknown.
