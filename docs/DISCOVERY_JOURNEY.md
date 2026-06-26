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

## Next

Before building anything, two checks:
1. Does this already exist? (I don't want to reinvent a shipped feature.)
2. Is the framing even right? I'm assuming a handoff means automation *failed*, I should
   pressure-test that before committing to it.
