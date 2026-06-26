import { describe, expect, it } from 'vitest';
import scenarios from '../data/scenarios.json';
import type { Journey } from './types';
import { classify } from './classify';
import { extractSignals } from './signalExtractor';

const byId = (id: string): Journey => {
  const found = (scenarios as Journey[]).find((s) => s.conversation_id === id);
  if (!found) throw new Error(`fixture ${id} not found`);
  return found;
};

describe('classify, the four scenarios', () => {
  it('call-1001: repeated business-API failure is potentially avoidable, high confidence', () => {
    const v = classify(byId('call-1001'));
    expect(v.classification).toBe('potentially_avoidable');
    expect(v.cause_category).toBe('business_system_failure');
    expect(v.evidence_strength).toBe('high');
    expect(v.supporting_evidence.join(' ')).toMatch(/failed 2 time/);
  });

  it('call-1002: low-confidence intent + reported misunderstanding is an intent failure, medium', () => {
    const v = classify(byId('call-1002'));
    expect(v.classification).toBe('potentially_avoidable');
    expect(v.cause_category).toBe('intent_understanding_failure');
    expect(v.evidence_strength).toBe('medium');
    // honest counter-evidence: the bot did try to clarify
    expect(v.contradicting_evidence.length).toBeGreaterThan(0);
  });

  it('call-1003: policy-required handoff is justified with no corrective action implied', () => {
    const v = classify(byId('call-1003'));
    expect(v.classification).toBe('justified');
    expect(v.cause_category).toBe('policy_required');
  });

  it('call-1004: a dropped timeline abstains rather than inventing a cause', () => {
    const v = classify(byId('call-1004'));
    expect(v.classification).toBe('insufficient_data');
    expect(v.cause_category).toBe('undetermined');
    expect(v.supporting_evidence).toHaveLength(0);
    expect(v.missing_information.length).toBeGreaterThan(0);
  });
});

describe('classifier discipline', () => {
  it('a single tool failure is weaker evidence than a repeated one', () => {
    const single: Journey = {
      conversation_id: 'unit-single-failure',
      title: 'single failure',
      description: 'one tool timeout then handoff',
      events: [
        { timestamp: '00:00:01', type: 'intent_detected', data: { intent: 'x', confidence: 0.9 } },
        { timestamp: '00:00:02', type: 'tool_call_failed', data: { tool: 'api', error: 'timeout' } },
        { timestamp: '00:00:03', type: 'human_handoff' },
      ],
    };
    expect(classify(single).evidence_strength).toBe('medium');
  });

  it('policy beats a co-occurring tool failure (justified, not avoidable)', () => {
    const mixed: Journey = {
      conversation_id: 'unit-policy-precedence',
      title: 'policy + failure',
      description: 'a tool blips but policy still mandates a human',
      events: [
        { timestamp: '00:00:01', type: 'tool_call_failed', data: { tool: 'api', error: 'timeout' } },
        { timestamp: '00:00:02', type: 'policy_check', data: { policy: 'fraud', result: 'requires_human' } },
        { timestamp: '00:00:03', type: 'human_handoff' },
      ],
    };
    expect(classify(mixed).classification).toBe('justified');
  });

  it('a normal-confidence intent contributes no causal signal', () => {
    const s = extractSignals(byId('call-1004'));
    expect(s.lowConfidenceIntent).toBe(false);
    expect(s.causalSignalCount).toBe(0);
  });
});
