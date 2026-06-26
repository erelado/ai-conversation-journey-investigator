import type { ReactNode } from 'react';

// A collapsible "how this was designed" block. Added after the skeleton was working, to be
// reflective about the process without cluttering the main flow.
export function DesignNote({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="design-note">
      <summary>{title}</summary>
      <div className="design-note-body">{children}</div>
    </details>
  );
}
