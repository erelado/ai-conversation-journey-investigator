import { describe, expect, it } from 'vitest';
import scenarios from '../data/scenarios.json';
import type { Journey } from './types';
import { analyze } from './analysis';

const scenariosList = scenarios as Journey[];

describe('analyze, live verdict merged with frozen prose', () => {
  it('attaches a frozen summary to every scenario', () => {
    for (const journey of scenariosList) {
      const a = analyze(journey);
      expect(a.summary.length).toBeGreaterThan(0);
      expect(a.classification).toBeDefined();
    }
  });

  it('a justified handoff carries no recommended action', () => {
    const justified = scenariosList.find((s) => s.conversation_id === 'call-1003')!;
    expect(analyze(justified).recommended_action).toBeNull();
  });

  it('an avoidable handoff carries a recommended action', () => {
    const avoidable = scenariosList.find((s) => s.conversation_id === 'call-1001')!;
    expect(analyze(avoidable).recommended_action).not.toBeNull();
  });
});
