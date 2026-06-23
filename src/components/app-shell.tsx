'use client';

import type { ReactNode } from 'react';
import { useAlerts } from './alert-provider';
import Sidebar from './sidebar';
import Topbar from './topbar';

export default function AppShell({ children }: { children: ReactNode }) {
  const { toasts } = useAlerts();
  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Topbar />
        <div className="page">{children}</div>
      </div>
      <div className="toasts">
        {toasts.map((t) => (
          <div key={t.id} className="toast">{t.msg}</div>
        ))}
      </div>
    </div>
  );
}
