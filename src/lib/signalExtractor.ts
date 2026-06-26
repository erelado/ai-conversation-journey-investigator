// Deterministic signal extraction.
//
// This is the "real" half of the prototype: plain, testable code that reads a journey's
// event timeline and surfaces the causal signals a handoff verdict depends on. No LLM, no
// guessing. If the signals are too thin, the classifier downstream is expected to abstain.

import type { Journey } from './types';

export interface Signals {
  hasIntent: boolean;
  intentConfidence: number | null;
  lowConfidenceIntent: boolean;
  toolFailureCount: number;
  failedTools: string[];
  clarificationRequested: boolean;
  customerRepeated: boolean;
  customerReportedMisunderstanding: boolean;
  policyRequiresHuman: boolean;
  humanApprovalRequired: boolean;
  identityVerified: boolean;
  handoffPresent: boolean;
  /** How many independent causal indicators the timeline contains. Zero ⇒ abstain. */
  causalSignalCount: number;
}

// Below this, an intent match is treated as unreliable.
export const LOW_CONFIDENCE_THRESHOLD = 0.5;

export function extractSignals(journey: Journey): Signals {
  const events = journey.events;

  const intentEvent = events.find((e) => e.type === 'intent_detected');
  const intentConfidence =
    intentEvent && typeof intentEvent.data?.confidence === 'number'
      ? (intentEvent.data.confidence as number)
      : null;

  const failedToolEvents = events.filter((e) => e.type === 'tool_call_failed');
  const failedTools = failedToolEvents.map((e) => String(e.data?.tool ?? 'unknown'));

  const policyRequiresHuman = events.some(
    (e) => e.type === 'policy_check' && e.data?.result === 'requires_human',
  );

  const signals: Signals = {
    hasIntent: intentEvent !== undefined,
    intentConfidence,
    lowConfidenceIntent: intentConfidence !== null && intentConfidence < LOW_CONFIDENCE_THRESHOLD,
    toolFailureCount: failedToolEvents.length,
    failedTools,
    clarificationRequested: events.some((e) => e.type === 'clarification_requested'),
    customerRepeated: events.some((e) => e.type === 'customer_repeated_request'),
    customerReportedMisunderstanding: events.some(
      (e) => e.type === 'customer_reported_misunderstanding',
    ),
    policyRequiresHuman,
    humanApprovalRequired: events.some((e) => e.type === 'human_approval_required'),
    identityVerified: events.some((e) => e.type === 'identity_verified'),
    handoffPresent: events.some((e) => e.type === 'human_handoff'),
    causalSignalCount: 0,
  };

  // Count the independent indicators that could explain a handoff. A normal-confidence
  // intent and a bare handoff event carry no causal information on their own.
  signals.causalSignalCount = [
    signals.toolFailureCount > 0,
    signals.lowConfidenceIntent,
    signals.customerReportedMisunderstanding,
    signals.customerRepeated,
    signals.policyRequiresHuman,
    signals.humanApprovalRequired,
  ].filter(Boolean).length;

  return signals;
}
