import { useEffect, useState } from 'react';
import type { CorpusStats } from '../lib/aggregate';

const CLASS_LABEL: Record<string, string> = {
  justified: 'Justified',
  potentially_avoidable: 'Potentially avoidable',
  insufficient_data: 'Insufficient data',
};
const CAUSE_LABEL: Record<string, string> = {
  business_system_failure: 'Business-system failure',
  intent_understanding_failure: 'Intent-understanding failure',
  policy_required: 'Policy-required',
  undetermined: 'Undetermined',
};
const COLORS: Record<string, string> = {
  justified: 'var(--justified)',
  potentially_avoidable: 'var(--avoidable)',
  insufficient_data: 'var(--insufficient)',
  high: 'var(--high)',
  medium: 'var(--medium)',
  low: 'var(--low)',
};

function Bars({
  rows,
  total,
}: {
  rows: { key: string; label: string; count: number }[];
  total: number;
}) {
  return (
    <div className="bars">
      {rows.map((r) => (
        <div className="bar-row" key={r.key}>
          <span className="bar-label">{r.label}</span>
          <span className="bar-track">
            <span
              className="bar-fill"
              style={{
                width: `${total ? (r.count / total) * 100 : 0}%`,
                background: COLORS[r.key] ?? 'var(--accent)',
              }}
            />
          </span>
          <span className="bar-count">{r.count}</span>
        </div>
      ))}
    </div>
  );
}

export function CorpusRollup() {
  // The 500-call corpus is heavy; load it (and run the roll-up) as its own lazy chunk
  // so the initial bundle stays lean.
  const [stats, setStats] = useState<CorpusStats | null>(null);

  useEffect(() => {
    let alive = true;
    void import('../lib/aggregate').then((m) => {
      if (alive) setStats(m.computeStats());
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!stats) return <p>Computing verdicts over the corpus...</p>;

  const classRows = Object.entries(stats.byClassification).map(([key, count]) => ({
    key,
    label: CLASS_LABEL[key] ?? key,
    count,
  }));
  const causeRows = Object.entries(stats.byCause)
    .filter(([key]) => key !== 'undetermined')
    .map(([key, count]) => ({ key, label: CAUSE_LABEL[key] ?? key, count }));
  const strengthRows = (['high', 'medium', 'low'] as const).map((key) => ({
    key,
    label: key[0].toUpperCase() + key.slice(1),
    count: stats.byStrength[key],
  }));

  return (
    <div>
      <p>
        The engine runs over a corpus of <strong>{stats.total} synthetic calls</strong> (each with
        customer/bot turns and system events). The distribution below is computed live in your
        browser by the same deterministic classifier used in the walkthroughs, not hand-entered.
      </p>
      <div className="rollup-grid">
        <div className="rollup-card">
          <p className="label">By classification</p>
          <Bars rows={classRows} total={stats.total} />
        </div>
        <div className="rollup-card">
          <p className="label">By cause (excludes undetermined)</p>
          <Bars rows={causeRows} total={stats.total} />
        </div>
        <div className="rollup-card">
          <p className="label">By evidence strength</p>
          <Bars rows={strengthRows} total={stats.total} />
        </div>
      </div>
    </div>
  );
}
