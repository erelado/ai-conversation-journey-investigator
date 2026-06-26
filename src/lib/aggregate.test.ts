import { describe, expect, it } from 'vitest';
import { computeStats, corpus } from './aggregate';

describe('corpus + aggregate roll-up', () => {
  const stats = computeStats();

  it('the corpus holds ~500 synthetic calls', () => {
    expect(corpus.length).toBe(500);
  });

  it('every call carries dialogue turns and a handoff', () => {
    for (const j of corpus) {
      expect(j.events.some((e) => e.type === 'customer_message')).toBe(true);
      expect(j.events.some((e) => e.type === 'human_handoff')).toBe(true);
    }
  });

  it('classification counts sum to the total', () => {
    const c = stats.byClassification;
    expect(c.justified + c.potentially_avoidable + c.insufficient_data).toBe(stats.total);
  });

  it('all three verdicts appear (the engine is not a one-label stamp)', () => {
    expect(stats.byClassification.justified).toBeGreaterThan(0);
    expect(stats.byClassification.potentially_avoidable).toBeGreaterThan(0);
    expect(stats.byClassification.insufficient_data).toBeGreaterThan(0);
  });

  it('strength counts sum to the total', () => {
    const s = stats.byStrength;
    expect(s.high + s.medium + s.low).toBe(stats.total);
  });
});
