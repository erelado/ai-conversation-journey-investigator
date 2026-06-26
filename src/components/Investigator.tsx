import { useState } from 'react';
import scenarios from '../data/scenarios.json';
import type { Journey } from '../lib/types';
import { analyze } from '../lib/analysis';
import { extractSignals } from '../lib/signalExtractor';
import { Timeline } from './Timeline';
import { SignalChips } from './SignalChips';
import { VerdictPanel } from './VerdictPanel';

const journeys = scenarios as Journey[];

export function Investigator() {
  const [id, setId] = useState(journeys[0].conversation_id);
  const journey = journeys.find((j) => j.conversation_id === id) ?? journeys[0];
  const signals = extractSignals(journey);
  const analysis = analyze(journey);

  return (
    <div>
      <div className="scenario-tabs" role="group" aria-label="Choose a scenario">
        {journeys.map((j) => (
          <button
            key={j.conversation_id}
            type="button"
            className="scenario-tab"
            aria-pressed={j.conversation_id === id}
            onClick={() => setId(j.conversation_id)}
          >
            {j.title}
          </button>
        ))}
      </div>
      <p className="scenario-desc">{journey.description}</p>

      <div className="investigator-grid">
        <div className="panel">
          <h3>
            Event timeline <span className="tag sim">simulated</span>
          </h3>
          <Timeline events={journey.events} />
          <h3 style={{ marginTop: '22px' }}>
            Extracted signals <span className="tag live">live</span>
          </h3>
          <SignalChips s={signals} />
        </div>
        <div className="panel">
          <h3>
            Verdict <span className="tag live">live</span>
          </h3>
          <VerdictPanel a={analysis} />
        </div>
      </div>
    </div>
  );
}
