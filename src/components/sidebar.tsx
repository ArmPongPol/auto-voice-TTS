'use client';

import type { ReactElement } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAlerts } from './alert-provider';
import { Ic } from './icons';

type Status = 'playing' | 'paused' | 'muted' | 'idle';

const NAV: { href: string; label: string; Icon: () => ReactElement }[] = [
  { href: '/',         label: 'แผงควบคุม',         Icon: Ic.dashboard },
  { href: '/manual',   label: 'แจ้งเตือนด้วยตนเอง', Icon: Ic.mic },
  { href: '/presets',  label: 'ปุ่มลัด',             Icon: Ic.zap },
  { href: '/settings', label: 'ตั้งค่า',             Icon: Ic.settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isPlaying, isPaused, isMuted, pendingCount } = useAlerts();
  const status: Status = isMuted ? 'muted' : (isPlaying && !isPaused) ? 'playing' : isPaused ? 'paused' : 'idle';
  const statusLabel: Record<Status, string> = {
    playing: 'กำลังประกาศ',
    paused:  'หยุดชั่วคราว',
    muted:   'ปิดเสียง',
    idle:    'พร้อมใช้งาน',
  };
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
        {NAV.map(({ href, label, Icon }) => (
          <Link key={href} href={href} className={`nav-it${pathname === href ? ' on' : ''}`}>
            <Icon />
            <span>{label}</span>
            {href === '/' && pendingCount > 0 && (
              <span className="nav-count">{pendingCount}</span>
            )}
          </Link>
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
