import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import type { Analysis, Journey } from '../lib/types';
import { Timeline } from './Timeline';
import { VerdictPanel } from './VerdictPanel';

interface Row {
  journey: Journey;
  analysis: Analysis;
}

const PAGE_SIZE = 20;

const CLASS_OPTIONS = [
  ['all', 'All classifications'],
  ['justified', 'Justified'],
  ['potentially_avoidable', 'Potentially avoidable'],
  ['insufficient_data', 'Insufficient data'],
];
const CAUSE_OPTIONS = [
  ['all', 'All causes'],
  ['business_system_failure', 'Business-system failure'],
  ['intent_understanding_failure', 'Intent-understanding failure'],
  ['policy_required', 'Policy-required'],
  ['undetermined', 'Undetermined'],
];

export function CorpusExplorer() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [cls, setCls] = useState('all');
  const [cause, setCause] = useState('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([import('../data/corpus.json'), import('../lib/analysis')]).then(([c, a]) => {
      if (!alive) return;
      const list = (c.default as Journey[]).map((j) => ({ journey: j, analysis: a.analyze(j) }));
      setRows(list);
    });
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (cls !== 'all' && r.analysis.classification !== cls) return false;
      if (cause !== 'all' && r.analysis.cause_category !== cause) return false;
      if (q && !`${r.journey.conversation_id} ${r.journey.title}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [rows, cls, cause, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const reset =
    (fn: (v: string) => void) => (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
      fn(e.target.value);
      setPage(0);
    };

  return (
    <div className="page explorer">
      <p className="eyebrow">
        <a href="#/">&larr; Back to the walkthrough</a>
      </p>
      <h1>Corpus browser</h1>
      <p className="lede">
        All {rows ? rows.length : '500'} synthetic calls, each classified live by the deterministic
        engine. Filter, search, and open any call to see its event timeline, the verdict, and the
        raw JSON.
      </p>

      <div className="explorer-controls">
        <select value={cls} onChange={reset(setCls)} aria-label="Filter by classification">
          {CLASS_OPTIONS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <select value={cause} onChange={reset(setCause)} aria-label="Filter by cause">
          {CAUSE_OPTIONS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <input
          type="search"
          placeholder="Search id or title…"
          value={query}
          onChange={reset(setQuery)}
          aria-label="Search calls"
        />
      </div>

      {!rows ? (
        <p>Loading the corpus…</p>
      ) : (
        <>
          <p className="explorer-count">
            {filtered.length} call{filtered.length === 1 ? '' : 's'} match
          </p>

          <ul className="explorer-list">
            {pageRows.map(({ journey, analysis }) => {
              const open = openId === journey.conversation_id;
              return (
                <li key={journey.conversation_id} className="explorer-row">
                  <button
                    type="button"
                    className="explorer-rowhead"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : journey.conversation_id)}
                  >
                    <span className="mono">{journey.conversation_id}</span>
                    <span className="explorer-title">{journey.title}</span>
                    <span className={`badge ${analysis.classification}`}>
                      {analysis.classification.replace(/_/g, ' ')}
                    </span>
                    <span className={`badge strength-${analysis.evidence_strength}`}>
                      {analysis.evidence_strength}
                    </span>
                  </button>
                  {open && (
                    <div className="explorer-detail">
                      <div className="panel">
                        <h3>Event timeline</h3>
                        <Timeline events={journey.events} />
                      </div>
                      <div className="panel">
                        <h3>Verdict</h3>
                        <VerdictPanel a={analysis} />
                        <details className="raw-json">
                          <summary>Raw JSON</summary>
                          <pre>{JSON.stringify(journey, null, 2)}</pre>
                        </details>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {pageCount > 1 && (
            <div className="explorer-pager">
              <button
                type="button"
                className="btn"
                disabled={safePage === 0}
                onClick={() => setPage(safePage - 1)}
              >
                Prev
              </button>
              <span>
                Page {safePage + 1} of {pageCount}
              </span>
              <button
                type="button"
                className="btn"
                disabled={safePage >= pageCount - 1}
                onClick={() => setPage(safePage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
