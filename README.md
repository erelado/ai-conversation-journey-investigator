# AI Conversation Journey Investigator

From a handoff *event* to an explainable customer *journey*.

A small, AI-driven feature prototype for a cloud-communication platform (VoIP / call centers,
FreeSWITCH / Asterisk). Built as a 90-minute discovery-and-prototype exercise: the value is the
product thinking and the use of AI tools to get there, the interactive demo is evidence.

## The idea in one line
A platform can record *that* a conversation handed off to a human. It rarely explains *why*.
This prototype takes one completed journey's event timeline and produces a cautious,
evidence-based explanation of the handoff, and refuses to guess when the data is thin.

## Prototype scope
- **Build:** deterministic signal extraction + handoff classification
  (`justified` / `potentially_avoidable` / `insufficient_data`) with supporting/contradicting
  evidence, over four hand-authored scenarios and a corpus of 500 synthetic calls.
- **Roadmap (named, not built):** handoff *execution* quality, expected-handoff-rate per journey,
  the full cause taxonomy. See `docs/DISCOVERY_JOURNEY.md`.

## What is real vs. simulated
- **Real, runs live:** signal extraction + classification (`src/lib`) and its tests; the UI.
- **Frozen offline:** the natural-language summary / recommendation prose (an LLM's job in prod).
- **Simulated:** the telephony event stream (synthetic fixtures). No FreeSWITCH/Asterisk, ASR,
  or live CRM here.

## Run
```bash
npm install
npm run dev      # local
npm test         # unit tests
npm run build    # production build
```

## The deeper documents
- `docs/DISCOVERY_JOURNEY.md`, the full narrative: observation → hypothesis → AI challenge →
  reframe → scope → prototype → validation plan.
- `docs/AI_PROCESS.md`, how AI tools were used, iteration by iteration.
- `docs/PROMPTS.md`, the prompts that mattered, with raw cross-model answers.
- `docs/ARCHITECTURE.md`, how this would integrate into a production platform.
