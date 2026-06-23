'use client';

import { useState } from 'react';
import { Priority } from '@/lib/data';
import { Ic } from './icons';

interface ManualTabProps {
  onAdd: (text: string, pri: Priority, src?: string) => void;
  onPlayNow: (text: string, pri: Priority) => void;
}

interface PriOpt {
  id: Priority;
  ico: string;
  nm: string;
  ds: string;
}

export default function ManualTab({ onAdd, onPlayNow }: ManualTabProps) {
  const [text, setText] = useState('');
  const [pri, setPri] = useState<Priority>('normal');

  const opts: PriOpt[] = [
    { id: 'normal',    ico: '🔵', nm: 'ปกติ',    ds: 'ข้อมูลทั่วไป' },
    { id: 'urgent',    ico: '🟡', nm: 'เร่งด่วน', ds: 'ต้องการความสนใจ' },
    { id: 'emergency', ico: '🔴', nm: 'ฉุกเฉิน',  ds: 'ดำเนินการทันที' },
  ];

  const handleAdd  = () => { if (text.trim()) { onAdd(text.trim(), pri);     setText(''); } };
  const handlePlay = () => { if (text.trim()) { onPlayNow(text.trim(), pri); setText(''); } };

  return (
    <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <label className="flbl">ระดับความสำคัญ</label>
        <div className="pri-grid">
          {opts.map((o) => (
            <div key={o.id} className={`pri-opt${pri === o.id ? ` ps-${o.id}` : ''}`} onClick={() => setPri(o.id)}>
              <div className="pri-ico">{o.ico}</div>
              <div className="pri-nm">{o.nm}</div>
              <div className="pri-ds">{o.ds}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <label className="flbl">ข้อความแจ้งเตือน (ภาษาไทย)</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="พิมพ์ข้อความแจ้งเตือน เช่น เครื่องจักรหมายเลข 3 หยุดทำงาน กรุณาตรวจสอบทันที..."
          rows={5}
        />
        <div className="char-c">{text.length} ตัวอักษร</div>
      </div>
      <div className="gap-4">
        <button className="btn btn-p" onClick={handleAdd} disabled={!text.trim()}>
          <Ic.plus /> เพิ่มในคิว
        </button>
        <button className="btn btn-o" onClick={handlePlay} disabled={!text.trim()}>
          <Ic.play /> เล่นทันที
        </button>
      </div>
      <div className="warn-banner">
        <span>💡</span>
        <span>ระบุข้อมูลให้ครบถ้วน เช่น หมายเลขเครื่องจักร ตำแหน่ง และการดำเนินการที่ต้องการ เพื่อให้ผู้รับฟังสามารถดำเนินการได้ทันที</span>
      </div>
    </div>
  );
}
