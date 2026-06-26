import { useEffect, useState } from 'react';
import './App.css';
import { Investigator } from './components/Investigator';
import { CorpusRollup } from './components/CorpusRollup';
import { CorpusExplorer } from './components/CorpusExplorer';
import { AiChallenge } from './components/AiChallenge';
import { AiUsed } from './components/AiUsed';
import { DesignNote } from './components/DesignNote';
import { LimitationsChecklist } from './components/LimitationsChecklist';

const REPO_URL = 'https://github.com/erelado/ai-conversation-journey-investigator';
const CAVEMAN = 'https://github.com/JuliusBrussee/caveman';

function currentRoute(): 'home' | 'corpus' {
  return window.location.hash.replace(/^#\/?/, '') === 'corpus' ? 'corpus' : 'home';
}

function App() {
  const [route, setRoute] = useState<'home' | 'corpus'>(currentRoute());
  useEffect(() => {
    const onHash = () => {
      setRoute(currentRoute());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (route === 'corpus') return <CorpusExplorer />;

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
        <div className="hero-meta">
          <span className="scope">90-minute discovery &amp; prototype exercise</span>
          <span className="scope">June 2026</span>
        </div>
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
        <AiUsed tools={[{ label: 'none (interview notes)' }]} />
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
        <AiUsed tools={[{ label: 'none (my analysis)' }]} />
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
        <AiUsed
          tools={[
            { label: 'Gemini (3.5 Flash)' },
            { label: 'ChatGPT (GPT 5.5)' },
            { label: 'Claude (Opus 4.8)' },
          ]}
        />
        <p>
          I scanned the market across Gemini, ChatGPT, and Claude. The space is crowded with{' '}
          <strong>adjacent</strong> tools (LLM-observability, bot platforms, CCaaS QA), but the
          specific framing isn't shipped. The defensible wedge is a <em>combination</em>:
          event-timeline substrate, a per-handoff verdict, calibrated abstention, and being
          bot-agnostic. All three models independently named "insufficient data" the most honest,
          defensible feature.
        </p>
        <p>
          Then I asked Gemini and Claude, as skeptical product managers, to attack my assumption
          that a handoff means automation <em>failed</em>. Both rejected it: many handoffs are
          required by
          policy, requested by the customer, or the correct safe behaviour.
        </p>
        <AiChallenge />
      </section>

      <section>
        <p className="kicker">4 - The reframe</p>
        <h2>A handoff is not a failure</h2>
        <AiUsed tools={[{ label: 'Gemini (3.5 Flash)' }, { label: 'Claude (Opus 4.8)' }]} />
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
        <AiUsed
          tools={[
            { label: 'Claude Code (plan mode)' },
            { label: 'Caveman skill', href: CAVEMAN },
            { label: 'private skills' },
          ]}
        />
        <p>
          <strong>Built now</strong>, the decision axis over four scenarios and a synthetic corpus:
        </p>
        <ol className="built-now">
          <li>The decision axis: justified / potentially avoidable / insufficient data.</li>
          <li>Cause category plus supporting, contradicting, and missing evidence.</li>
          <li>A corpus of 500 synthetic calls plus four detailed walkthroughs.</li>
        </ol>
        <p>
          <strong>Roadmap</strong> (named, not built):
        </p>
        <ul className="roadmap">
          <li>The execution-quality axis (routing, context transfer, re-auth, repetition).</li>
          <li>Expected-handoff-rate per journey.</li>
          <li>The full cause taxonomy and production analytics.</li>
        </ul>

        <DesignNote title="How I designed the synthetic data (research, challenge, cut)">
          <p>
            Added after the skeleton worked, to be transparent about where the mock data came from.
          </p>
          <ul>
            <li>
              <strong>Why synthetic.</strong> No real call data, and four hard-coded cases would not
              show the engine works. I needed volume.
            </li>
            <li>
              <strong>Research.</strong> I listed what a real journey actually contains (intents,
              tool calls, retries, errors, policy checks, and the customer/bot turns around them) so
              the synthetic events match the shape a FreeSWITCH/Asterisk + bot stack emits.
            </li>
            <li>
              <strong>What it is built of.</strong> Four archetypes mapped to the verdicts (business
              failure, intent failure, policy, dropped telemetry), each with dialogue turns plus the
              system events the classifier reads, generated from a fixed seed so it is reproducible.
            </li>
            <li>
              <strong>How I challenged it.</strong> Random data would not produce a meaningful
              verdict spread, and uniform data would look fake. I weighted the archetype mix for a
              realistic distribution and varied confidence, failure counts, intents, and tools.
            </li>
            <li>
              <strong>What I cut.</strong> Contained (no-handoff) calls, since this is a handoff
              corpus, and over-long timelines that added noise without signal.
            </li>
            <li>
              <strong>What I added.</strong> Customer and bot message turns for realism, and an
              "insufficient data" archetype built as dropped telemetry rather than a tidy case.
            </li>
            <li>
              <strong>Result.</strong> 500 calls, one generator script, one seed. The four
              walkthroughs are the teaching examples on top.
            </li>
          </ul>
        </DesignNote>
      </section>

      <section>
        <p className="kicker">6 - At volume</p>
        <h2>Run over 500 synthetic calls</h2>
        <AiUsed tools={[{ label: 'Claude Code' }, { label: 'product-critic skill' }]} />
        <CorpusRollup />
        <p style={{ marginTop: '18px' }}>
          <a className="btn" href="#/corpus">
            Browse all 500 calls
          </a>
        </p>
      </section>

      <section id="prototype">
        <p className="kicker">7 - The prototype</p>
        <h2>Investigate one handoff</h2>
        <AiUsed tools={[{ label: 'Claude Code' }]} />
        <p>
          Pick a scenario. The timeline is simulated; the extracted signals and the verdict are
          computed live by the deterministic engine; only the summary prose is frozen offline.
        </p>
        <Investigator />

        <DesignNote title="How I designed this view (UX decisions)">
          <ul>
            <li>
              <strong>Goal.</strong> A reviewer should understand a verdict in seconds.
            </li>
            <li>
              <strong>Layout.</strong> Input on the left (timeline + extracted signals), output on
              the right (verdict, evidence, recommendation), matching the input-then-conclusion
              mental model.
            </li>
            <li>
              <strong>Honesty labels.</strong> Every block is tagged simulated, live, or frozen, so
              it is never unclear what the engine actually computed.
            </li>
            <li>
              <strong>Verdict legibility.</strong> Colour-coded classification, an evidence-strength
              badge, and evidence split into supporting, contradicting, and missing, so a clean
              escalation and a broken loop never look the same.
            </li>
            <li>
              <strong>Choices weighed.</strong> Tabs over a dropdown (all four scenarios visible at
              once); signal chips to make the deterministic step tangible; single column on narrow
              screens.
            </li>
            <li>
              <strong>Accessibility.</strong> Keyboard-operable tabs, focus styles, reduced-motion
              respected.
            </li>
          </ul>
        </DesignNote>
      </section>

      <section>
        <p className="kicker">8 - Architecture</p>
        <h2>How it would fit a production platform</h2>
        <AiUsed tools={[{ label: 'Claude Code' }]} />
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

      <section>
        <p className="kicker">9 - On the fly</p>
        <h2>What I refined after the first pass</h2>
        <AiUsed tools={[{ label: 'Claude Code' }, { label: 'qa-reviewer subagent' }]} />
        <p>
          Once the skeleton was green, I went back and added a reflection layer, the kind of polish
          you only do after the bones work:
        </p>
        <ul>
          <li>Per-step AI attribution, so it is clear which tool did what at each stage.</li>
          <li>
            Design notes on how the synthetic corpus was researched, challenged, and cut (section 5).
          </li>
          <li>Design notes on how the investigator view was shaped for clarity (section 7).</li>
          <li>
            The limitations turned into an interactive checklist plus what I would build with more
            time.
          </li>
          <li>
            An adversarial QA pass (a separate read-only reviewer) that found three real issues in
            the classifier, which I folded in.
          </li>
          <li>
            A <a href="#/corpus">corpus browser</a> to filter and inspect all 500 generated calls.
            This was a one-line ask near the end ("a way to view the generated data"); Claude Code
            built the whole subpage on its own.
          </li>
        </ul>
        <p>
          None of this was in the first build. It is the on-the-fly improvement that working with
          Claude Code makes cheap: get it green, then raise the bar.
        </p>
      </section>

      <section className="limits">
        <p className="kicker">10 - Limitations &amp; what's unproven</p>
        <h2>What still needs validation</h2>
        <AiUsed tools={[{ label: 'Claude Code' }]} />
        <p>
          The prototype proves the mechanism is possible, not that it is valuable. Open questions
          (tick the ones you think are already addressed):
        </p>
        <LimitationsChecklist />
        <p className="more-time-head">What is missing, and what I would build with more time:</p>
        <ul className="more-time">
          <li>
            The execution-quality axis: was the handoff itself done well (routing, context passed,
            re-auth, customer repetition).
          </li>
          <li>
            Real event capture from FreeSWITCH/Asterisk with one correlation id across telephony,
            bot, and tools.
          </li>
          <li>The live LLM phrasing step behind a server proxy, with caching and redaction.</li>
          <li>Expected-handoff-rate per journey, so "good" is measured per flow, not globally.</li>
          <li>A reviewer queue and alerting on clusters of avoidable handoffs.</li>
        </ul>
      </section>

      <footer>
        <p>
          Prototype built as a recruitment take-home exercise, June 2026. Data is synthetic: no
          real calls, no live LLM call, no telephony integration.
        </p>
        <p>
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            Source &amp; docs on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
