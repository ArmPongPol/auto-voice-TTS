'use client';

import { usePathname } from 'next/navigation';
import { useAlerts } from './alert-provider';
import { Ic } from './icons';

const ROUTE_TITLE: Record<string, string> = {
  '/':         'แผงควบคุม',
  '/manual':   'แจ้งเตือนด้วยตนเอง',
  '/presets':  'ปุ่มลัด — เพิ่มการแจ้งเตือนด่วน',
  '/settings': 'ตั้งค่าระบบ',
};

export default function Topbar() {
  const pathname = usePathname();
  const { isMuted, volume, toggleMute, setVolume } = useAlerts();
  const title = ROUTE_TITLE[pathname] ?? '';

  return (
    <div className="topbar">
      <span className="topbar-title">{title}</span>
      <div className="topbar-ctrl">
        <button className={`ib${isMuted ? ' warn' : ''}`} onClick={toggleMute} title={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}>
          {isMuted ? <Ic.mute /> : <Ic.vol />}
        </button>
        <input
          type="range" min="0" max="1" step=".05"
          value={volume}
          onChange={(e) => setVolume(+e.target.value)}
          style={{ width: 80 }}
          disabled={isMuted}
          title="ระดับเสียง"
        />
      </div>
    </div>
  );
}
