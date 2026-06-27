# Prompts that mattered

The prompts I used to challenge the idea. The **full, verbatim** model responses live in
[`src/data/responses/`](../src/data/responses) and are rendered in full (collapsed) on the live
site. Prompt 2 includes a cross-examination: Claude's answer was fed back to ChatGPT to challenge
it, so the reframe was pressure-tested by a second model rather than taken on one model's word.

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

Full answers:
- **Gemini (3.5 Flash)** — [`prompt1-gemini.md`](../src/data/responses/prompt1-gemini.md)
- **ChatGPT (GPT 5.5)** — [`prompt1-chatgpt.md`](../src/data/responses/prompt1-chatgpt.md)
- **Claude (Opus 4.8)** — [`prompt1-claude.md`](../src/data/responses/prompt1-claude.md)

They converged: the framing isn't shipped, but adjacent tooling is everywhere (LLM observability,
conversational-AI platforms, CCaaS analytics). The defensible wedge is the *combination*:
event-timeline substrate + per-handoff verdict + calibrated abstention + bot-agnostic. Keep the
causal judgment in deterministic code; let an LLM only phrase prose.

---

## Prompt 2 — Is the framing even right?

> Act as a skeptical senior product manager. I'm building a tool that, after each bot-to-human
> handoff in a call center, explains WHY the handoff happened. My working assumption is that a
> human handoff means the automated journey failed. Attack that assumption directly: when is a
> handoff NOT a failure? Give concrete categories with examples, and tell me how that should
> change the product. Answer in copyable markdown.

Full answer: **Claude (Opus 4.8)** — [`prompt2-claude.md`](../src/data/responses/prompt2-claude.md)

### Cross-examination — I fed Claude's answer back to ChatGPT

> I asked Claude and they answered. What do you think about that? Be skeptical and challenge them
> back.

Full answer: **ChatGPT (GPT 5.5)** —
[`prompt2-chatgpt-challenge.md`](../src/data/responses/prompt2-chatgpt-challenge.md)

**What I took from this.** A handoff is an event to classify, not blame, and the cross-examination
added the second axis: was the handoff well *executed*, separate from whether it was the right
*decision*. One model alone would have missed it. For the prototype I deliberately took ChatGPT's
"investigation assistant" advice: a deterministic verdict + evidence, abstain when the data is thin,
no overconfident automated judgement.
