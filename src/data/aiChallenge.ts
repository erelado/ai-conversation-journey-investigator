// The prompts used to challenge the idea, with the FULL verbatim model responses.
// The responses are the real files in ./responses/*.md, imported raw so the page renders them
// in full (no editorialised excerpts). Prompt 2 includes a cross-examination: Claude's answer
// was fed back to ChatGPT to challenge it.

import p1gemini from './responses/prompt1-gemini.md?raw';
import p1chatgpt from './responses/prompt1-chatgpt.md?raw';
import p1claude from './responses/prompt1-claude.md?raw';
import p2claude from './responses/prompt2-claude.md?raw';
import p2chatgptChallenge from './responses/prompt2-chatgpt-challenge.md?raw';

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
      { model: 'Gemini (3.5 Flash)', response: p1gemini },
      { model: 'ChatGPT (GPT 5.5)', response: p1chatgpt },
      { model: 'Claude (Opus 4.8)', response: p1claude },
    ],
  },
  {
    id: 'reframe',
    label: 'Prompt 2 — Is the framing even right?',
    prompt: `Act as a skeptical senior product manager. I'm building a tool that, after each bot-to-human handoff in a call center, explains WHY the handoff happened. My working assumption is that a human handoff means the automated journey failed. Attack that assumption directly: when is a handoff NOT a failure? Give concrete categories with examples, and tell me how that should change the product. Answer in copyable markdown.`,
    exchanges: [{ model: 'Claude (Opus 4.8)', response: p2claude }],
    followUp: {
      note: 'Then I fed Claude’s answer back to ChatGPT and asked it to challenge another model, to pressure-test the reframe instead of taking one model’s word for it.',
      prompt: `I asked Claude and they answered. What do you think about that? Be skeptical and challenge them back.`,
      exchange: { model: 'ChatGPT (GPT 5.5)', response: p2chatgptChallenge },
    },
  },
];
