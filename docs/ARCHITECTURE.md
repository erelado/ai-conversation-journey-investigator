# Architecture

How this prototype would become a production feature on a cloud-communication platform. The
prototype simulates the event stream and freezes the prose; everything below is the real shape.

## Pipeline

```
FreeSWITCH / Asterisk / voice agent      [simulated in prototype]
            │  call + media + dialplan/bot events
            ▼
Event capture + correlation               [simulated]
   FreeSWITCH ESL - Asterisk AMI/ARI - bot framework (intents, tool calls)
   one correlation id stamped across telephony + bot + tool layers
            │
            ▼
Conversation state store                  [simulated]
   append-only event log keyed by conversation_id
            │
            ▼
Deterministic signal extraction           [REAL: src/lib/signalExtractor.ts]
            │
            ▼
Human-handoff trigger                      (fires the investigation asynchronously)
            │
            ▼
Handoff classifier (verdict + evidence)    [REAL: src/lib/classify.ts]
            │
            ▼
LLM phrasing of summary / recommendation   [frozen offline in prototype]
            │
            ▼
Analytics / alerts / review queue          [roadmap]
```

## Real-time vs. asynchronous

- **Real-time (in the call path):** only event capture and the handoff trigger. These must not add
  latency to the live call. They emit events to a bus; they never block the caller on analysis.
- **Asynchronous (out of band):** signal extraction, classification, and LLM phrasing run *after*
  the handoff fires, off the call path. The investigation is a post-event job, so a slow model or a
  busy queue degrades reporting, never the call.

This split is the reason the prototype's deterministic core is separate from the prose step: in
production the deterministic verdict can be produced immediately and cheaply, while the
natural-language layer (the only LLM call) is best-effort and retried on a queue.

## Event capture and correlation (the hard part)

The events live in different layers: FreeSWITCH ESL, Asterisk AMI/ARI, and the bot/orchestrator
(intents, tool calls, retries). The whole feature depends on a single **correlation id** stamped
across all of them. If the id is dropped anywhere, the timeline is partial, and the right
behaviour is to classify `insufficient_data`, not to guess. The prototype models exactly this: a
sparse timeline abstains.

## Scaling

- Classification is O(events) pure CPU; it scales horizontally as stateless workers behind the
  handoff-event queue. No per-call model call is required for the verdict.
- The LLM phrasing step is the cost/throughput bottleneck. Mitigate with: caching by verdict
  shape, batching, and phrasing only handoffs a human will actually review (sampling or
  on-demand) rather than every call.
- The event log is the storage driver; partition by time + tenant, with retention tied to policy.

## Privacy

Call data is sensitive (PII, payment, health, recordings). Constraints:
- Minimise what reaches the LLM step: send structured signals + redacted snippets, not raw audio
  or full transcripts. The deterministic verdict needs no PII.
- Tenant isolation: scope every read/write by tenant + conversation id (no cross-tenant leakage).
- Retention + right-to-erasure on the event log; encrypt at rest and in transit.
- Keep the model call inside the trust boundary (self-hosted or a contracted endpoint with no
  training on customer data); never ship keys to a client (the prototype is static and keyless by
  design for this reason).

## Failure handling

- **Partial timeline** → `insufficient_data` (built in).
- **LLM step fails/slow** → still return the deterministic verdict + evidence; the prose is marked
  pending and retried. The feature never hard-depends on the model.
- **Classifier uncertainty** → prefer abstention over a confident wrong cause; `evidence_strength`
  communicates how much the timeline actually supports the verdict.
- **Bus backpressure** → investigations queue and lag; the live call path is unaffected.

## What the prototype proves vs. defers

- **Proves:** the deterministic extraction → verdict → evidence mechanism, and the discipline to
  abstain, work over a 500-call corpus.
- **Defers:** real telephony/bot integration, the correlation-id plumbing, the live LLM phrasing
  step, the execution-quality axis, and production analytics/alerting.
