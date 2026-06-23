'use client';

import type { ReactElement } from 'react';
import { TabId } from '@/lib/data';
import { Ic } from './icons';

interface SidebarProps {
  tab: TabId;
  setTab: (tab: TabId) => void;
  isPlaying: boolean;
  isPaused: boolean;
  isMuted: boolean;
  pendingCount: number;
}

type Status = 'playing' | 'paused' | 'muted' | 'idle';

export default function Sidebar({ tab, setTab, isPlaying, isPaused, isMuted, pendingCount }: SidebarProps) {
  const status: Status = isMuted ? 'muted' : (isPlaying && !isPaused) ? 'playing' : isPaused ? 'paused' : 'idle';
  const statusLabel: Record<Status, string> = {
    playing: 'กำลังประกาศ',
    paused:  'หยุดชั่วคราว',
    muted:   'ปิดเสียง',
    idle:    'พร้อมใช้งาน',
  };
  const nav: { id: TabId; label: string; Icon: () => ReactElement }[] = [
    { id: 'dashboard', label: 'แผงควบคุม',         Icon: Ic.dashboard },
    { id: 'manual',    label: 'แจ้งเตือนด้วยตนเอง', Icon: Ic.mic },
    { id: 'presets',   label: 'ปุ่มลัด',             Icon: Ic.zap },
    { id: 'settings',  label: 'ตั้งค่า',             Icon: Ic.settings },
  ];
  return (
    <div className="sb">
      <div className="sb-logo">
        <div className="sb-mark">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
          </svg>
        </div>
        <div className="sb-name">Auto Voice Alert</div>
        <div className="sb-sub">ระบบแจ้งเตือนเสียงอัตโนมัติ</div>
      </div>
      <div className="sb-nav">
        {nav.map(({ id, label, Icon }) => (
          <button key={id} className={`nav-it${tab === id ? ' on' : ''}`} onClick={() => setTab(id)}>
            <Icon />
            <span>{label}</span>
            {id === 'dashboard' && pendingCount > 0 && (
              <span className="nav-count">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>
      <div className="sb-foot">
        <div className="sb-foot-lbl">สถานะระบบ</div>
        <div className="sb-foot-row">
          <div className={`sdot ${status}`} />
          <span className="stext">{statusLabel[status]}</span>
        </div>
      </div>
    </div>
  );
}
