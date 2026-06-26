import { useState } from 'react';

// Open questions the prototype does not answer. Rendered as an interactive checklist:
// nothing is pre-checked, because none of these are proven yet. A reviewer can tick the ones
// they consider addressed.
const UNPROVEN = [
  'Teams act on a per-handoff explanation, rather than only aggregate dashboards.',
  'Production event streams are rich enough (real logs are often partial).',
  '"Evidence strength" is trusted more than a confidence score.',
  '"Insufficient data" reads as honesty, not as the tool failing.',
  'Per-conversation investigation beats sampling on cost vs. benefit.',
];

export function LimitationsChecklist() {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  return (
    <ul className="checklist">
      {UNPROVEN.map((item, i) => (
        <li key={i}>
          <label className={checked[i] ? 'done' : ''}>
            <input
              type="checkbox"
              checked={Boolean(checked[i])}
              onChange={() => setChecked((c) => ({ ...c, [i]: !c[i] }))}
            />
            <span>{item}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}
