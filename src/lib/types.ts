// The prototype contract. These types are the single source of truth for the
// input (a simulated journey) and the output (a structured, evidence-based verdict).
//
// What is real vs. simulated:
//   - The `events` arrays are SIMULATED (hand-authored fixtures standing in for a
//     FreeSWITCH/Asterisk + bot event stream).
//   - The structured `Verdict` (classification, cause, evidence) is produced by REAL
//     deterministic code at runtime (see signalExtractor.ts / classify.ts).
//   - The natural-language `summary` / `recommended_action` are FROZEN offline prose
//     (an LLM's job in production), merged in from analyses.json. Never generated live.

export type EventType =
  | 'call_started'
  | 'customer_message'
  | 'bot_message'
  | 'intent_detected'
  | 'clarification_requested'
  | 'route_selected'
  | 'tool_call'
  | 'tool_call_failed'
  | 'customer_repeated_request'
  | 'customer_reported_misunderstanding'
  | 'identity_verified'
  | 'policy_check'
  | 'human_approval_required'
  | 'human_handoff';

export interface JourneyEvent {
  timestamp: string; // "HH:MM:SS"
  type: EventType;
  data?: Record<string, unknown>;
}

export interface Journey {
  conversation_id: string;
  title: string; // short label for the scenario picker
  description: string; // one line describing the situation
  events: JourneyEvent[];
}

// --- Output contract ---

export type Classification =
  | 'justified' // escalation was the correct decision
  | 'potentially_avoidable' // better automation might have kept it contained
  | 'insufficient_data'; // the timeline is too sparse to form a hypothesis

export type EvidenceStrength = 'high' | 'medium' | 'low';

export type CauseCategory =
  | 'business_system_failure'
  | 'intent_understanding_failure'
  | 'policy_required'
  | 'undetermined'; // used with insufficient_data

// Produced live by the deterministic engine.
export interface StructuredVerdict {
  conversation_id: string;
  classification: Classification;
  cause_category: CauseCategory;
  evidence_strength: EvidenceStrength;
  supporting_evidence: string[];
  contradicting_evidence: string[];
  missing_information: string[];
}

// The frozen, LLM-phrased prose layer (offline). recommended_action is null when
// no corrective action is warranted (e.g. a justified handoff).
export interface NarrativeLayer {
  conversation_id: string;
  summary: string;
  recommended_action: string | null;
}

// What the UI renders: the live verdict + the frozen prose, clearly separated.
export interface Analysis extends StructuredVerdict, Omit<NarrativeLayer, 'conversation_id'> {}
