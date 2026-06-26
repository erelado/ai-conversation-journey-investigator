// Deterministic handoff classifier.
//
// Given a journey, decide WHETHER the handoff was justified or potentially avoidable, or
// abstain when the timeline is too thin. The verdict, its cause, its evidence strength, and
// the supporting/contradicting/missing-evidence lists are all derived here, in code. The
// natural-language summary/recommendation are NOT produced here; they are frozen offline
// (see analyses.json) and merged in for display.
//
// Precedence matters: a policy-mandated handoff is justified even if a tool also blipped, so
// we check justification before failure causes.

import type { CauseCategory, Classification, EvidenceStrength, StructuredVerdict } from './types';
import type { Journey } from './types';
import { extractSignals, type Signals } from './signalExtractor';

function build(
  journey: Journey,
  classification: Classification,
  cause_category: CauseCategory,
  evidence_strength: EvidenceStrength,
  supporting_evidence: string[],
  contradicting_evidence: string[],
  missing_information: string[],
): StructuredVerdict {
  return {
    conversation_id: journey.conversation_id,
    classification,
    cause_category,
    evidence_strength,
    supporting_evidence,
    contradicting_evidence,
    missing_information,
  };
}

export function classify(journey: Journey): StructuredVerdict {
  const s: Signals = extractSignals(journey);

  // 1. Justified, the handoff was required, not the result of a breakdown.
  if (s.policyRequiresHuman || s.humanApprovalRequired) {
    const supporting = ['A policy check returned "requires human".'];
    if (s.identityVerified) {
      supporting.push('The customer identity was verified before the escalation.');
    }
    supporting.push('The handoff followed the policy decision, not an automation error.');
    return build(
      journey,
      'justified',
      'policy_required',
      'high',
      supporting,
      [],
      ['Whether complete context was passed to the human agent is not shown.'],
    );
  }

  // 2. Potentially avoidable, a business system failed and forced the escalation.
  if (s.toolFailureCount > 0) {
    const supporting = [
      `A business tool failed ${s.toolFailureCount} time(s): ${s.failedTools.join(', ')}.`,
    ];
    if (s.customerRepeated) {
      supporting.push('The customer repeated the request after the failure.');
    }
    supporting.push('The handoff followed the failed tool call(s).');
    // Corroboration (repeated failure) raises confidence; a single blip is weaker.
    const strength: EvidenceStrength = s.toolFailureCount >= 2 ? 'high' : 'medium';
    return build(
      journey,
      'potentially_avoidable',
      'business_system_failure',
      strength,
      supporting,
      [],
      ['The timeline does not show whether a fallback or callback option was offered.'],
    );
  }

  // 3. Potentially avoidable, the bot misunderstood the customer.
  if (s.lowConfidenceIntent || s.customerReportedMisunderstanding) {
    const supporting: string[] = [];
    if (s.lowConfidenceIntent) {
      supporting.push(`Intent confidence was low (${s.intentConfidence}).`);
    }
    if (s.customerReportedMisunderstanding) {
      supporting.push('The customer said the system had misunderstood them.');
    }
    const contradicting: string[] = [];
    if (s.clarificationRequested) {
      // The bot tried to recover before routing, honest counter-evidence.
      contradicting.push('The bot did request clarification before routing; it did not give up immediately.');
    }
    return build(
      journey,
      'potentially_avoidable',
      'intent_understanding_failure',
      'medium',
      supporting,
      contradicting,
      ['The corrected intent after the handoff is not recorded, so the misread cannot be confirmed.'],
    );
  }

  // 4. Insufficient data, abstain rather than invent a cause.
  const missing = [
    'No tool calls, policy checks, or customer turns were captured between the intent and the handoff.',
  ];
  if (!s.handoffPresent) {
    missing.push('No handoff event is present in the timeline.');
  }
  return build(journey, 'insufficient_data', 'undetermined', 'low', [], [], missing);
}
