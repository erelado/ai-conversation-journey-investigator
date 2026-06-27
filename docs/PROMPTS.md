# Prompts that mattered

The prompts I used to challenge the idea, with excerpts of the real model responses. Prompt 2
includes a cross-examination: Claude's answer was fed back to ChatGPT to challenge it, so the
reframe was pressure-tested by a second model rather than taken on one model's word.

---

## Prompt 1 — Does this already exist?

> I'm scoping an AI feature for a cloud communication platform (VoIP, call centers,
> FreeSWITCH/Asterisk). Idea: after a conversation hands off from a bot to a human agent,
> automatically analyze that one conversation's event timeline (intents, tool calls, retries,
> errors, customer repeats) and produce an evidence-based explanation of WHY the handoff
> happened, classified as justified, potentially avoidable, or insufficient data.
>
> What existing products or features already do this or something close? Name specific
> vendors/features, say what they actually do, and where this idea overlaps vs. differs. Be
> concrete and skeptical.

Run across **Gemini (3.5 Flash)**, **ChatGPT (GPT 5.5)**, and **Claude (Opus 4.8)**. They
converged: the framing isn't shipped, but adjacent tooling is everywhere.

### Gemini (3.5 Flash) (excerpt)
> Your proposed feature sits at the intersection of CCaaS Interaction Analytics (operations-focused)
> and LLM Observability/Tracing (engineering-focused). While many enterprise platforms track that a
> handoff happened, very few natively bucket the root cause into your exact framework. LLM eval
> tools (Braintrust, Galileo, Langfuse) are pure engineering infra with no telephony layer;
> Conversational AI Platforms (Cognigy, Parloa, Kore.ai) are prescriptive to the bot's own state
> machine; Enterprise CCaaS (NICE Enlighten, Genesys) treat the bot as a black box.
>
> Skeptical traps: the "ASR Illusion" (customer repeats are often ASR/audio failure, not bot logic);
> the persona mismatch; and "Insufficient Data" will be your highest category, because users
> frequently just mash 0 or scream "Agent!".

### ChatGPT (GPT 5.5) (excerpt)
> The closest products are Amazon Connect Customer and Microsoft Copilot Studio: Amazon has the
> closest technical evidence layer, Microsoft the closest escalation classification model. I did not
> find a documented, out-of-the-box feature that consistently combines all of: starts automatically
> after every handoff; reconstructs the timeline; separates trigger from underlying cause; cites
> specific evidence; classifies justified / potentially avoidable / insufficient data; and works
> across multiple systems. That is the credible product gap.
>
> Avoid "No existing product explains why bot handoffs happen." The clearest wedge is Amazon-style
> agent tracing plus Microsoft-style escalation classification, packaged as a vendor-neutral
> investigation workflow.

### Claude (Opus 4.8) (excerpt)
> No mainstream product does exactly what you describe, single-conversation, evidence-based
> root-cause classification of why a handoff fired. Conversational/containment analytics (Cresta,
> Observe.AI, Cognigy, Genesys/NICE) classify categories of escalation, not the avoidability of one
> handoff; LLM observability (LangSmith, Langfuse, Arize) is closest to the method but dev-facing,
> no handoff concept; Auto-QA (MaestroQA, Klaus, Level AI) scores agents, not the bot's decision.
>
> "Insufficient data" is your moat and your risk. Your defensibility is forensic rigor + taxonomy +
> FreeSWITCH/Asterisk-native event grounding, not the LLM summarization itself.

**What I took from this.** Don't pitch "nobody explains handoffs." Pitch the combination:
event-timeline substrate + per-handoff verdict + calibrated abstention + bot-agnostic. Keep the
causal judgment in deterministic code; let an LLM only phrase prose.

---

## Prompt 2 — Is the framing even right?

> Act as a skeptical senior product manager. I'm building a tool that, after each bot-to-human
> handoff in a call center, explains WHY the handoff happened. My working assumption is that a
> human handoff means the automated journey failed. Attack that assumption directly: when is a
> handoff NOT a failure? Give concrete categories with examples, and tell me how that should
> change the product. Answer in copyable markdown.

### Claude (Opus 4.8) (excerpt)
> If every handoff is a failure, your tool optimizes toward zero handoffs, and zero handoffs is a
> terrible goal. A bot that never escalates traps frustrated people. Reframe around handoff quality,
> not handoff avoidance. A handoff is not a failure when it is a designed escalation, a
> regulatory/liability boundary, a correctly recognized capability ceiling, a customer preference,
> or a high-value relationship moment.
>
> Drop the binary; separate avoidability from outcome (Avoidable / Justified / Mandatory /
> Preference / Insufficient data). Make "insufficient data" a first-class output. Optimize
> avoidable-handoff rate, not handoff rate. The core reframe: a handoff is an investigation trigger,
> not a verdict. The defense against "too many excuses" is calibration plus an auditable trail.

### Cross-examination — I fed Claude's answer back to ChatGPT

> I asked Claude and they answered. What do you think about that? Be skeptical and challenge them
> back.

### ChatGPT (GPT 5.5) (excerpt)
> Claude's reframe (avoidance to quality) is directionally strong but resolves the assumption too
> neatly. The taxonomy mixes different dimensions, trigger, constraint, policy, business rationale,
> and execution quality should be separate fields, not competing categories. "Designed escalation"
> does not automatically mean success: a handoff can be appropriate while the journey still fails
> (wrong queue, no context passed), so evaluate two questions, was handing off appropriate, and was
> it executed effectively? "Mandatory" is hard to establish from text alone ("policy evidence
> unavailable"), and "capability ceiling" / "customer preference" can become convenient excuses.
>
> For a 60 to 90 minute prototype, an investigation assistant (reconstruct, highlight evidence,
> propose hypotheses, leave judgment to the reviewer) is far more credible than an automated
> evaluator.

**What I took from this.** A handoff is an event to classify, not blame, and the cross-examination
added the second axis: was the handoff well *executed*, separate from whether it was the right
*decision*. One model alone would have missed it. For the prototype I deliberately took ChatGPT's
"investigation assistant" advice: deterministic verdict + evidence, abstain when thin, no
overconfident automated judgement.
