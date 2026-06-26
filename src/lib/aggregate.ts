// Runs the deterministic classifier over the whole synthetic corpus and rolls the
// verdicts up into counts. This proves the engine works at volume, not just on the four
// curated walkthroughs, and gives the page a lightweight distribution view. (Full
// production analytics remain roadmap; this is a count, not a dashboard.)

import corpusData from '../data/corpus.json';
import type { CauseCategory, Classification, EvidenceStrength, Journey } from './types';
import { classify } from './classify';

export const corpus = corpusData as Journey[];

export interface CorpusStats {
  total: number;
  byClassification: Record<Classification, number>;
  byCause: Record<CauseCategory, number>;
  byStrength: Record<EvidenceStrength, number>;
}

export function computeStats(journeys: Journey[] = corpus): CorpusStats {
  const stats: CorpusStats = {
    total: journeys.length,
    byClassification: { justified: 0, potentially_avoidable: 0, insufficient_data: 0 },
    byCause: {
      business_system_failure: 0,
      intent_understanding_failure: 0,
      policy_required: 0,
      undetermined: 0,
    },
    byStrength: { high: 0, medium: 0, low: 0 },
  };
  for (const j of journeys) {
    const v = classify(j);
    stats.byClassification[v.classification] += 1;
    stats.byCause[v.cause_category] += 1;
    stats.byStrength[v.evidence_strength] += 1;
  }
  return stats;
}
