export interface Tool {
  label: string;
  href?: string;
}

export function AiUsed({ tools }: { tools: Tool[] }) {
  if (tools.length === 0) return null;
  return (
    <p className="ai-used">
      <span className="ai-used-key">AI used:</span>
      {tools.map((t, i) => (
        <span key={t.label} className="ai-used-tool">
          {i > 0 ? ', ' : ' '}
          {t.href ? (
            <a href={t.href} target="_blank" rel="noreferrer">
              {t.label}
            </a>
          ) : (
            t.label
          )}
        </span>
      ))}
    </p>
  );
}
