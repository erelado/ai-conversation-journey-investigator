import type { Signals } from '../lib/signalExtractor';

export function SignalChips({ s }: { s: Signals }) {
  const chips: { label: string; on: boolean }[] = [
    { label: `intent confidence: ${s.intentConfidence ?? 'n/a'}`, on: s.hasIntent },
    { label: 'low confidence', on: s.lowConfidenceIntent },
    { label: `tool failures: ${s.toolFailureCount}`, on: s.toolFailureCount > 0 },
    { label: 'customer repeated', on: s.customerRepeated },
    { label: 'reported misunderstanding', on: s.customerReportedMisunderstanding },
    { label: 'policy requires human', on: s.policyRequiresHuman },
    { label: 'identity verified', on: s.identityVerified },
    { label: `causal signals: ${s.causalSignalCount}`, on: s.causalSignalCount > 0 },
  ];
  return (
    <ul className="signals">
      {chips.map((c) => (
        <li key={c.label} className={`signal ${c.on ? 'on' : ''}`}>
          {c.label}
        </li>
      ))}
    </ul>
  );
}
