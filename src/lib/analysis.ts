// Joins the two layers the UI renders:
//   - the live, deterministic verdict from classify()  (the "real" engine)
//   - the frozen, LLM-phrased prose from analyses.json  (offline, keyless)
// Keeping them separate in code mirrors the honesty contract shown on the page.

import analysesData from '../data/analyses.json';
import type { Analysis, Journey, NarrativeLayer } from './types';
import { classify } from './classify';

const narratives = analysesData.analyses as NarrativeLayer[];

export function getNarrative(conversationId: string): NarrativeLayer | undefined {
  return narratives.find((n) => n.conversation_id === conversationId);
}

export function analyze(journey: Journey): Analysis {
  const verdict = classify(journey);
  const narrative = getNarrative(journey.conversation_id);
  return {
    ...verdict,
    summary: narrative?.summary ?? '',
    recommended_action: narrative?.recommended_action ?? null,
  };
}
