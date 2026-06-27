// The prompts used to challenge the idea, with verbatim excerpts of the real model responses.
// Prompt 2 includes a cross-examination: Claude's answer was fed back to ChatGPT to challenge it.
// These are quoted AI outputs (shown collapsed on the page); fuller answers are in docs/PROMPTS.md.

export interface AiExchange {
  model: string;
  response: string;
}

export interface AiFollowUp {
  note: string;
  prompt: string;
  exchange: AiExchange;
}

export interface AiPrompt {
  id: string;
  label: string;
  prompt: string;
  exchanges: AiExchange[];
  followUp?: AiFollowUp;
}

export const aiChallenge: AiPrompt[] = [
  {
    id: 'existing-solutions',
    label: 'Prompt 1 — Does this already exist?',
    prompt: `I'm scoping an AI feature for a cloud communication platform (VoIP, call centers, FreeSWITCH/Asterisk). Idea: after a conversation hands off from a bot to a human agent, automatically analyze that one conversation's event timeline (intents, tool calls, retries, errors, customer repeats) and produce an evidence-based explanation of WHY the handoff happened, classified as justified, potentially avoidable, or insufficient data.

What existing products or features already do this or something close? Name specific vendors/features, say what they actually do, and where this idea overlaps vs. differs. Be concrete and skeptical.`,
    exchanges: [
      {
        model: 'Gemini (3.5 Flash)',
        response: `Your proposed feature sits at the intersection of CCaaS Interaction Analytics (operations-focused) and LLM Observability/Tracing (engineering-focused). While many enterprise platforms track that a handoff happened, very few natively bucket the root cause into your exact framework (Justified, Potentially Avoidable, Insufficient Data) out of the box.

- LLM Eval & Observability (Braintrust, Galileo, Langfuse): perfectly built to analyze the technical timeline, but pure engineering infra. They do not hook into the telephony layer (SIP codes, FreeSWITCH/Asterisk event sockets) and require you to write the custom evaluation prompt.
- Conversational AI Platforms (Cognigy, Parloa, Kore.ai): capture the programmatic reason the bot gave up, but their analytics are prescriptive to the bot's own state machine; they rarely judge themselves on "justified vs avoidable."
- Enterprise CCaaS (NICE Enlighten, Genesys): analyze 100% of interactions but treat the bot as a black box; they look at the transcript, not the underlying system events.

Skeptical traps: the "ASR Illusion" (a customer repeating themselves is often ASR failure or bad audio, not bot logic, so you must ingest telephony QoS); the persona mismatch (managers want macro metrics, engineers use Langfuse/Datadog); and "Insufficient Data" will be your highest category, because users frequently just mash 0 or scream "Agent!".`,
      },
      {
        model: 'ChatGPT (GPT 5.5)',
        response: `The market already contains most of the underlying components. The closest products are Amazon Connect Customer and Microsoft Copilot Studio: Amazon has the closest technical evidence layer, Microsoft the closest escalation classification model.

I did not find a documented, out-of-the-box feature that consistently combines all of: starts automatically after every handoff; reconstructs the complete event timeline for that one conversation; separates the immediate trigger from the underlying cause; cites specific evidence (retries, failed tools, repeats, confidence drops, policy rules); classifies as justified / potentially avoidable / insufficient data; and works across multiple systems. That is the credible product gap.

Avoid: "No existing product explains why bot handoffs happen." Use: existing platforms report handoff rates, escalation topics, paths, or agent traces; the proposed feature combines those signals into a single evidence-based investigation for each handoff, distinguishes the trigger from the root cause, and judges justified / potentially avoidable / insufficient data. The clearest wedge is Amazon-style agent tracing plus Microsoft-style escalation classification, packaged as a vendor-neutral investigation workflow.`,
      },
      {
        model: 'Claude (Opus 4.8)',
        response: `Skeptical bottom line: no mainstream product does exactly what you describe, single-conversation, evidence-based root-cause classification of why a handoff fired, judged as justified / avoidable / insufficient data. But several categories do adjacent things, and parts of your idea are commoditized. The gap is real but narrower than it looks.

- Conversational / containment analytics (Cresta, Observe.AI, Cognigy, Genesys/NICE): operate at the cohort level and classify categories of escalation, they do not adjudicate the avoidability of one specific handoff with cited evidence.
- LLM/agent observability (LangSmith, Langfuse, Arize, Braintrust): closest to your method (timeline to reasoned verdict) but dev-facing, with no native handoff concept or justified/avoidable taxonomy.
- Auto-QA (MaestroQA, Klaus, Level AI): score agent performance against rubrics, not the bot's decision to hand off as a causal event.

"Insufficient data" is your moat and your risk. The avoidable/justified call is subjective; without a tight rubric it becomes an LLM opinion ops teams distrust the first time it is wrong. Your defensibility is forensic rigor + taxonomy + FreeSWITCH/Asterisk-native event grounding, not the LLM summarization itself.

One-line: existing tools tell you how often bots escalate and what category. None reliably tells you, for this conversation, whether the handoff should have happened and proves it from the event trail.`,
      },
    ],
  },
  {
    id: 'reframe',
    label: 'Prompt 2 — Is the framing even right?',
    prompt: `Act as a skeptical senior product manager. I'm building a tool that, after each bot-to-human handoff in a call center, explains WHY the handoff happened. My working assumption is that a human handoff means the automated journey failed. Attack that assumption directly: when is a handoff NOT a failure? Give concrete categories with examples, and tell me how that should change the product. Answer in copyable markdown.`,
    exchanges: [
      {
        model: 'Claude (Opus 4.8)',
        response: `Your framing has a measurement problem: if every handoff is a failure, your tool optimizes toward zero handoffs, and zero handoffs is a terrible goal. A bot that never escalates is a bot that traps frustrated people. Reframe the product around handoff quality, not handoff avoidance.

Where a handoff is not a failure: designed escalation (the bot triaged and routed, e.g. an identity-verified fraud claim); regulatory/liability boundaries (medical advice, debt settlement); capability ceiling correctly recognized (an early, clean handoff beats a late one after three failed loops); customer preference ("Agent." as the first message); and high-value/relationship moments (churn risk, upsell window).

Drop the binary. Replace "failure / not-failure" with a classification that separates avoidability from outcome: Avoidable, Justified, Mandatory, Preference, Insufficient data. Make "insufficient data" a first-class output, a tool that says "I can't tell why" is more trustworthy than one that hallucinates a reason. Optimize avoidable-handoff rate, not handoff rate.

The core reframe: a handoff is an investigation trigger, not a verdict. The strongest counterargument is that this gives the bot too many excuses, so the defense is calibration: "avoidable" must be honestly applied and "justified" must be policy- or capability-backed, with an audit trail so the justified bucket can itself be audited.`,
      },
    ],
    followUp: {
      note: 'Then I fed Claude’s answer back to ChatGPT and asked it to challenge another model, to pressure-test the reframe instead of taking one model’s word for it.',
      prompt: `I asked Claude and they answered. What do you think about that? Be skeptical and challenge them back.`,
      exchange: {
        model: 'ChatGPT (GPT 5.5)',
        response: `Claude's response is directionally strong, especially the reframe from handoff avoidance to handoff quality. But it resolves the original assumption too neatly. Several categories overlap, are difficult to prove from a single conversation, or could become excuses for poor automation.

- The taxonomy mixes different dimensions. Trigger, constraint, policy, business rationale, and execution quality should be separate fields, not competing categories. "I want an agent because you charged me twice" is simultaneously preference, a capability ceiling, a high-value moment, and possibly an avoidable failure.
- "Designed escalation" does not automatically mean success. A handoff can be appropriate while the journey is still a failure (wrong queue, no context passed, customer repeats three times). Evaluate two separate questions: was handing off appropriate, and was it executed effectively?
- "Mandatory" is harder to establish than implied. Don't infer legal necessity from conversation text; say "policy evidence unavailable" unless a referenced rule exists.
- "Capability ceiling" and "customer preference" can become convenient excuses; the immediate trigger is not the root cause.
- The response understates the causality problem: distinguish observed trigger, likely contributing factors, inferred root cause, and unknown.

For a 60 to 90 minute prototype, an investigation assistant (reconstruct the timeline, highlight evidence, propose hypotheses, leave judgment to the reviewer) is far more credible than an automated evaluator.`,
      },
    },
  },
];
