import { aiChallenge } from '../data/aiChallenge';

const PROMPTS_DOC =
  'https://github.com/erelado/ai-conversation-journey-investigator/blob/main/docs/PROMPTS.md';

function modelKey(model: string): string {
  const s = model.toLowerCase();
  if (s.includes('gemini')) return 'gemini';
  if (s.includes('chatgpt') || s.includes('gpt')) return 'chatgpt';
  if (s.includes('claude')) return 'claude';
  return '';
}

function ModelTag({ model }: { model: string }) {
  return <span className={`model-tag ${modelKey(model)}`}>{model}</span>;
}

export function AiChallenge() {
  return (
    <div className="ai-challenge">
      {aiChallenge.map((p) => (
        <details key={p.id} className="exchange">
          <summary>{p.label}</summary>
          <p className="ex-meta">
            <span>Models</span>
            {p.exchanges.map((e) => (
              <ModelTag key={e.model} model={e.model} />
            ))}
            {p.followUp && <ModelTag model={p.followUp.exchange.model} />}
          </p>
          <pre className="prompt-text">{p.prompt}</pre>
          {p.exchanges.map((e) => (
            <details key={e.model} className="response">
              <summary>
                <ModelTag model={e.model} /> <span className="resp-word">response</span>
              </summary>
              <pre className="response-text">{e.response}</pre>
            </details>
          ))}

          {p.followUp && (
            <div className="followup">
              <p className="followup-note">
                <span className="followup-badge">model vs. model</span>
                {p.followUp.note}
              </p>
              <pre className="prompt-text">{p.followUp.prompt}</pre>
              <details className="response">
                <summary>
                  <ModelTag model={p.followUp.exchange.model} />{' '}
                  <span className="resp-word">challenges back</span>
                </summary>
                <pre className="response-text">{p.followUp.exchange.response}</pre>
              </details>
            </div>
          )}
        </details>
      ))}
      <p className="ai-note">
        Excerpts of the real responses. Full answers in{' '}
        <a href={PROMPTS_DOC} target="_blank" rel="noreferrer">
          docs/PROMPTS.md
        </a>
        .
      </p>
    </div>
  );
}
