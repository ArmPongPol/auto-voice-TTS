'use client';

import { Alert, PDATA, SRCLABEL, fmt } from '@/lib/data';
import { Badge, PriDot, Waveform } from './micro';
import { Ic } from './icons';

interface DashboardTabProps {
  queue: Alert[];
  currentId: number | null;
  isPlaying: boolean;
  isPaused: boolean;
  history: Alert[];
  onAck: (id: number) => void;
  onDel: (id: number) => void;
  onPause: () => void;
  onSkip: () => void;
}

export default function DashboardTab({
  queue, currentId, isPlaying, isPaused, history, onAck, onDel, onPause, onSkip,
}: DashboardTabProps) {
  const current = queue.find((a) => a.id === currentId);
  const pending = queue.filter((a) => a.status === 'pending');
  const npClass = `np np-${current ? current.priority : 'idle'}`;

  return (
    <div>
      <p className="slbl">กำลังประกาศ</p>
      <div className={npClass}>
        <div className="np-row">
          <Waveform active={isPlaying && !isPaused} />
          {current ? (
            <span className={(PDATA[current.priority] || PDATA.normal).npBadge}>
              {(PDATA[current.priority] || PDATA.normal).npLabel}
            </span>
          ) : (
            <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.08em' }}>รอแจ้งเตือน</span>
          )}
          {current && <span className="np-src">{SRCLABEL[current.source] ?? ''}</span>}
        </div>
        <div className={`np-txt${current ? '' : ' empty'}`}>
          {current ? current.text : 'ไม่มีการแจ้งเตือนในขณะนี้ — คิวว่างเปล่า'}
        </div>
        <div className="np-ctrls">
          <button className="npbtn npbtn-p" onClick={onPause} title={isPaused ? 'เล่นต่อ' : 'หยุดชั่วคราว'}>
            {isPaused ? <Ic.play /> : <Ic.pause />}
          </button>
          {current && (
            <button className="npbtn npbtn-s" onClick={() => onAck(current.id)} title="รับทราบ — ข้ามรายการนี้">
              <Ic.check />
            </button>
          )}
          {pending.length > 1 && (
            <button className="npbtn npbtn-s" onClick={onSkip} title="ข้ามไปรายการถัดไป">
              <Ic.skip />
            </button>
          )}
          {isPaused && <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginLeft: 4 }}>หยุดชั่วคราว</span>}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10, gap: 8 }}>
        <p className="slbl" style={{ marginBottom: 0 }}>คิวแจ้งเตือน</p>
        {pending.length > 0 && (
          <span style={{ background: 'var(--ember)', color: '#fff', borderRadius: 99, padding: '0 7px', fontSize: 10, fontWeight: 800, height: 18, display: 'flex', alignItems: 'center' }}>
            {pending.length}
          </span>
        )}
      </div>

      <div className="qlist">
        {pending.length === 0 && (
          <div className="empty">
            <div className="empty-ic">📭</div>
            <div className="empty-ttl">คิวว่างเปล่า</div>
            <div className="empty-ds">เพิ่มการแจ้งเตือนผ่าน &quot;แจ้งเตือนด้วยตนเอง&quot; หรือ &quot;ปุ่มลัด&quot;</div>
          </div>
        )}
        {pending.map((a) => (
          <div key={a.id} className={`qi${a.id === currentId ? ' cur' : ''}`}>
            <PriDot p={a.priority} />
            <div className="qi-body">
              <div className="qi-txt">{a.text}</div>
              <div className="qi-meta">
                <Badge p={a.priority} />
                <span style={{ fontSize: 11, color: 'var(--n500)', fontFamily: 'var(--mono)' }}>{fmt(a.addedAt)}</span>
                <span style={{ fontSize: 11, color: 'var(--n500)' }}>{SRCLABEL[a.source]}</span>
              </div>
            </div>
            <div className="qi-acts">
              <button className="smb ack" onClick={() => onAck(a.id)} title="รับทราบ"><Ic.check /></button>
              <button className="smb del" onClick={() => onDel(a.id)} title="ลบ"><Ic.trash /></button>
            </div>
          </div>
        ))}
      </div>

      {history.length > 0 && (
        <div className="mt-5">
          <p className="slbl">ประวัติล่าสุด</p>
          <div className="card" style={{ padding: '4px 18px' }}>
            {history.slice(0, 8).map((h, i) => (
              <div key={i} className="hist">
                <span className="hist-t">{h.playedAt ? fmt(h.playedAt) : '--:--'}</span>
                <PriDot p={h.priority} />
                <span className="hist-txt">{h.text}</span>
                <Badge p={h.priority} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
