import type { Analysis } from '../lib/types';

const CLASS_LABEL: Record<string, string> = {
  justified: 'Justified',
  potentially_avoidable: 'Potentially avoidable',
  insufficient_data: 'Insufficient data',
};

const CAUSE_LABEL: Record<string, string> = {
  business_system_failure: 'Business-system failure',
  intent_understanding_failure: 'Intent-understanding failure',
  policy_required: 'Policy-required handoff',
  undetermined: 'Undetermined',
};

function EvidenceList({ kind, title, items }: { kind: string; title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className={`evidence-block ${kind}`}>
      <p className="h">{title}</p>
      <ul>
        {items.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    </div>
  );
}

export function VerdictPanel({ a }: { a: Analysis }) {
  return (
    <div className={`verdict ${a.classification}`}>
      <div className="badges">
        <span className={`badge ${a.classification}`}>{CLASS_LABEL[a.classification]}</span>
        {a.cause_category !== 'undetermined' && (
          <span className="badge">{CAUSE_LABEL[a.cause_category]}</span>
        )}
        <span className={`badge strength-${a.evidence_strength}`}>
          evidence: {a.evidence_strength}
        </span>
      </div>

      <p className="summary">
        {a.summary}
        <span className="tag frozen">frozen LLM prose</span>
      </p>

      <EvidenceList kind="support" title="Supporting evidence" items={a.supporting_evidence} />
      <EvidenceList
        kind="contradict"
        title="Contradicting evidence"
        items={a.contradicting_evidence}
      />
      <EvidenceList kind="missing" title="Missing information" items={a.missing_information} />

      {a.recommended_action ? (
        <div className="recommendation">
          <span className="h">Recommended action: </span>
          {a.recommended_action}
        </div>
      ) : (
        <p className="none-needed">No corrective action required.</p>
      )}
    </div>
  );
}
