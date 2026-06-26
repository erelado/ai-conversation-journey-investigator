import type { JourneyEvent } from '../lib/types';

const LABELS: Record<string, string> = {
  call_started: 'Call started',
  customer_message: 'Customer',
  bot_message: 'Bot',
  intent_detected: 'Intent detected',
  clarification_requested: 'Clarification requested',
  route_selected: 'Route selected',
  tool_call: 'Tool call',
  tool_call_failed: 'Tool call failed',
  customer_repeated_request: 'Customer repeated request',
  customer_reported_misunderstanding: 'Customer reported misunderstanding',
  identity_verified: 'Identity verified',
  policy_check: 'Policy check',
  human_approval_required: 'Human approval required',
  human_handoff: 'Human handoff',
};

function meta(e: JourneyEvent): string {
  const d = e.data;
  if (!d) return '';
  if (e.type === 'customer_message' || e.type === 'bot_message') return `"${d.text}"`;
  if (e.type === 'intent_detected') return `${d.intent} - conf ${d.confidence}`;
  if (e.type === 'tool_call' || e.type === 'tool_call_failed') {
    return [d.tool, d.error].filter(Boolean).join(' - ');
  }
  if (e.type === 'route_selected') return String(d.route);
  if (e.type === 'policy_check') return `${d.policy} - ${d.result}`;
  return Object.values(d).join(' - ');
}

export function Timeline({ events }: { events: JourneyEvent[] }) {
  return (
    <ol className="timeline">
      {events.map((e, i) => {
        const cls =
          e.type === 'tool_call_failed' ? 'fail' : e.type === 'human_handoff' ? 'handoff' : '';
        const detail = meta(e);
        return (
          <li key={i} className={`timeline-event ${cls}`}>
            <span className="ts">{e.timestamp}</span>
            <span>
              <span className="type">{LABELS[e.type] ?? e.type}</span>
              {detail && <span className="meta">, {detail}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
