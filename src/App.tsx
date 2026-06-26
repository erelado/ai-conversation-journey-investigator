import './App.css';
import { Investigator } from './components/Investigator';
import { CorpusRollup } from './components/CorpusRollup';

const REPO_URL = 'https://github.com/erelado/ai-conversation-journey-investigator';

function App() {
  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">Prototype - Explainable human-handoff analysis</p>
        <h1>AI Conversation Journey Investigator</h1>
        <p className="lede">
          A platform can record <em>that</em> a conversation handed off to a human. It rarely
          explains <em>why</em>. This turns one journey's event timeline into a cautious,
          evidence-based explanation, and refuses to guess when the data is thin.
        </p>
        <span className="scope">90-minute discovery &amp; prototype exercise</span>
        <div className="actions">
          <a className="btn primary" href="#prototype">
            Explore the prototype
          </a>
          <a className="btn" href="#origin">
            Follow the discovery
          </a>
          <a className="btn" href={REPO_URL} target="_blank" rel="noreferrer">
            View source
          </a>
        </div>
      </header>

      <section id="origin">
        <p className="kicker">1 - Where it came from</p>
        <h2>An observation in the interview</h2>
        <p>
          We talked about bot-to-human fallback, monitoring, and logging. Something stuck: a system
          logs <strong>that</strong> a handoff happened, but the event alone doesn't explain the
          journey that caused it. Today, answering "why this handoff?" means manually correlating
          intents, tool calls, retries, errors, and customer behaviour across several systems.
        </p>
        <p>I treated this as a hypothesis to test, not a feature to assume.</p>
      </section>

      <section>
        <p className="kicker">2 - The gap</p>
        <h2>What the system knows vs. what the team needs</h2>
        <div className="compare">
          <div className="card">
            <p className="label">What the system records</p>
            <p className="big">"A handoff happened."</p>
          </div>
          <div className="card">
            <p className="label">What the team still needs</p>
            <p className="big">"Why did it happen, and was it avoidable?"</p>
          </div>
        </div>
      </section>

      <section>
        <p className="kicker">3 - AI-assisted challenge</p>
        <h2>Does it exist? Is the framing right?</h2>
        <p>
          I scanned the market across Gemini, ChatGPT, and Claude. The space is crowded with{' '}
          <strong>adjacent</strong> tools (LLM-observability, bot platforms, CCaaS QA), but the
          specific framing isn't shipped. The defensible wedge is a <em>combination</em>:
          event-timeline substrate, a per-handoff verdict, calibrated abstention, and being
          bot-agnostic. All three models independently named "insufficient data" the most honest,
          defensible feature.
        </p>
        <p>
          Then I asked two of them, as skeptical product managers, to attack my assumption that a
          handoff means automation <em>failed</em>. Both rejected it: many handoffs are required by
          policy, requested by the customer, or the correct safe behaviour.
        </p>
      </section>

      <section>
        <p className="kicker">4 - The reframe</p>
        <h2>A handoff is not a failure</h2>
        <div className="reframe">
          <div className="from">Handoff = failure</div>
          <div className="arrow">↓ challenged by AI review</div>
          <div className="to">Handoff = an event to classify, not blame</div>
        </div>
        <p style={{ marginTop: '16px' }}>
          The deeper model has two axes: was escalation the right <em>decision</em>, and was it
          well <em>executed</em>? A clean designed escalation and a broken NLU loop must never look
          the same.
        </p>
      </section>

      <section>
        <p className="kicker">5 - Scope cut</p>
        <h2>The smallest honest proof</h2>
        <div className="scope-grid">
          <div className="card">
            <p className="label">Built now</p>
            <ul>
              <li>The decision axis: justified / potentially avoidable / insufficient data</li>
              <li>Cause + supporting / contradicting / missing evidence</li>
              <li>A corpus of 500 synthetic calls + four detailed walkthroughs</li>
            </ul>
          </div>
          <div className="card">
            <p className="label">Roadmap (named, not built)</p>
            <ul>
              <li>The execution-quality axis (routing, context transfer, re-auth)</li>
              <li>Expected-handoff-rate per journey</li>
              <li>The full cause taxonomy and production analytics</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <p className="kicker">6 - At volume</p>
        <h2>Run over 500 synthetic calls</h2>
        <CorpusRollup />
      </section>

      <section id="prototype">
        <p className="kicker">7 - The prototype</p>
        <h2>Investigate one handoff</h2>
        <p>
          Pick a scenario. The timeline is simulated; the extracted signals and the verdict are
          computed live by the deterministic engine; only the summary prose is frozen offline.
        </p>
        <Investigator />
      </section>

      <section>
        <p className="kicker">8 - Architecture</p>
        <h2>How it would fit a production platform</h2>
        <pre className="pipeline">
          {`FreeSWITCH / Asterisk / Voice agent   `}
          <span className="sim">[simulated]</span>
          {`
        ↓
Conversation events                   `}
          <span className="sim">[simulated]</span>
          {`
        ↓
Conversation state store              `}
          <span className="sim">[simulated]</span>
          {`
        ↓
Deterministic signal extraction       `}
          <span className="real">[real]</span>
          {`
        ↓
Human-handoff trigger
        ↓
Handoff classifier (verdict+evidence) `}
          <span className="real">[real]</span>
          {`
        ↓
LLM phrasing of summary               `}
          <span className="sim">[frozen offline]</span>
          {`
        ↓
Analytics / alerts / review           `}
          <span className="sim">[roadmap]</span>
        </pre>
      </section>

      <section className="limits">
        <p className="kicker">9 - Limitations &amp; what's unproven</p>
        <h2>What still needs validation</h2>
        <ul>
          <li>Whether teams act on a per-handoff explanation (vs. aggregate dashboards).</li>
          <li>Whether production event streams are rich enough (logs are often partial).</li>
          <li>Whether "evidence strength" is trusted more than a confidence score.</li>
          <li>Whether "insufficient data" reads as honesty or as the tool not working.</li>
          <li>The real cost/benefit of per-conversation investigation vs. sampling.</li>
        </ul>
      </section>

      <footer>
        Prototype built as a recruitment take-home exercise. Data is synthetic; no real calls, no live LLM
        call, no telephony integration. <a href={REPO_URL}>Source &amp; docs on GitHub</a>.
      </footer>
    </div>
  );
}

export default App;
