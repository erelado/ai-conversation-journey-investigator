import { aiChallenge } from '../data/aiChallenge';

const PROMPTS_DOC =
  'https://github.com/erelado/ai-conversation-journey-investigator/blob/main/docs/PROMPTS.md';

export function AiChallenge() {
  return (
    <div className="ai-challenge">
      {aiChallenge.map((p) => (
        <details key={p.id} className="exchange">
          <summary>{p.label}</summary>
          <p className="ex-meta">Prompt sent to {p.exchanges.map((e) => e.model).join(', ')}:</p>
          <pre className="prompt-text">{p.prompt}</pre>
          {p.exchanges.map((e) => (
            <details key={e.model} className="response">
              <summary>{e.model}'s response</summary>
              <pre className="response-text">{e.response}</pre>
            </details>
          ))}
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
