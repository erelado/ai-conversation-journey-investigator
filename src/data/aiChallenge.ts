// The prompts used to challenge the idea, with verbatim excerpts of the real model responses.
// These are quoted AI outputs (shown collapsed on the page); the fuller answers are in
// docs/PROMPTS.md.

export interface AiExchange {
  model: string;
  response: string;
}

export interface AiPrompt {
  id: string;
  label: string;
  prompt: string;
  exchanges: AiExchange[];
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
        response: `While dozens of vendors pass a "warm handoff summary" to an agent at the moment of transfer, very few automatically perform a post-mortem classification on the systemic reason for the handoff (Justified vs. Avoidable). It is split across three categories: LLM/Conversational-AI observability (LangSmith, Arize, Phoenix) which track the technical timeline but are aimed at engineers; Enterprise CAIPs (Parloa, Cognigy, Dialogflow CX, Fini) which analyze conversational state but only for their own bots; and CCaaS QA / Interaction Analytics (NICE Enlighten, Genesys, Verint) which own the "avoidable transfer" reporting but historically via transcripts, not the live event timeline.

Your unique value proposition lies in telecom-aware LLM observability... root-cause analysis that neither standard LLM Ops tools nor standard CCaaS analytics can touch. In production, expect up to ~30% of complex voice cases to return Insufficient Data.`,
      },
      {
        model: 'ChatGPT (GPT 5.5)',
        response: `The market already contains most of the underlying components (transcripts, intent/journey analytics, handoff metrics, tool-call traces, automated evaluation, cross-interaction root cause). The closest products are Amazon Connect Customer and Microsoft Copilot Studio: Amazon has the closest technical evidence layer, Microsoft the closest escalation classification model.

I did not find a documented, out-of-the-box feature that consistently combines all of: starts automatically after every handoff; reconstructs the complete event timeline for that one conversation; separates the immediate trigger from the underlying cause; cites specific evidence (retries, failed tools, repeats, confidence drops, policy rules); classifies as justified / potentially avoidable / insufficient data; and works across multiple systems. That is the credible product gap.

Avoid: "No existing product explains why bot handoffs happen." Use: existing platforms report handoff rates, escalation topics, paths, or agent traces; this feature combines those signals into a single evidence-based investigation per handoff, distinguishes the trigger from the root cause, and judges whether the handoff was justified, potentially avoidable, or unsupported by sufficient data.`,
      },
      {
        model: 'Claude (Opus 4.8)',
        response: `Skeptical read: nothing on the market does exactly your framing (per-conversation, evidence-linked, event-timeline reconstruction with a justified / avoidable / insufficient-data verdict). But several categories do adjacent things, and a buyer will ask "isn't this just X?"

Conversation Intelligence / Auto-QA (Observe.AI, CallMiner, Cresta, Genesys) score the human agent after the fact, off the transcript, not the bot's decision off the event timeline. Bot platforms (Exotel, Decagon, Sierra) log "why it escalated" at trigger time, single-vendor only.

The verdict taxonomy and the event-timeline substrate are your only real differentiators. "Insufficient data" is your most defensible feature, not a hedge. Every adjacent product over-claims causal certainty; LLM-RCA research shows that's where they break.`,
      },
    ],
  },
  {
    id: 'reframe',
    label: 'Prompt 2 — Is the framing even right?',
    prompt: `Act as a skeptical senior product manager. I'm building a tool that, after each bot-to-human handoff in a call center, explains WHY the handoff happened. My working assumption is that a human handoff means the automated journey failed. Attack that assumption directly: when is a handoff NOT a failure? Give concrete categories with examples, and tell me how that should change the product. Answer in copyable markdown.`,
    exchanges: [
      {
        model: 'Gemini (3.5 Flash)',
        response: `A handoff is an outcome, not a diagnosis. In many cases, transferring the customer is the correct, safest, or explicitly intended behavior. Categories where a handoff is NOT a failure: the customer explicitly requested a human; policy or regulation requires human intervention (account closure, fraud, large refund); the action is intentionally outside the bot's scope; human judgment is part of the intended journey (bereavement, distress); the bot detected uncertainty and escalated safely; authentication/authorization could not complete; a service-level threshold was reached; the journey was designed as a hybrid (qualify-then-transfer); the handoff was triggered by urgency or risk; or a business system failed but the bot recovered correctly.

Change the classification model to top-level outcomes (justified / potentially_avoidable / correct_recovery_after_failure / insufficient_data) plus a separate cause_category. Separate root cause from handoff quality: a journey can contain an automation failure and still end with a well-executed handoff. The goal is not to eliminate human handoffs. The goal is to make every handoff understandable, appropriate, and actionable.`,
      },
      {
        model: 'Claude (Opus 4.8)',
        response: `"Handoff = failure" bakes the conclusion into the question and turns the tool into a blame detector. The honest version is two questions: was escalating the right call, and was it done well?

Where a handoff is NOT a failure: the customer asked for a human; policy/regulation requires one; capability boundary by design; safe abstention under uncertainty; risk/safety/distress; planned hybrid (qualify-then-transfer). Worth investigating instead: comprehension failures, premature surrender, friction-driven abandonment, coverage gaps, and the sneaky one, a correct handoff executed badly (no context passed, customer re-authenticates, agent starts cold).

What it changes: two axes, not one label (was escalation appropriate; was the transition clean); separate cause from assessment (root_cause != handoff_assessment); expected-handoff-rate per journey (some flows should be ~100% human); abstain honestly when the timeline is thin. The value isn't explaining failures, it's sorting handoffs into "fine," "fix the automation," and "fix the handoff."`,
      },
    ],
  },
];
