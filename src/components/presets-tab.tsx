'use client';

import { useState } from 'react';
import { Priority, CATS, PRESETS } from '@/lib/data';
import { Badge } from './micro';
import { Ic } from './icons';

interface PresetsTabProps {
  onAdd: (text: string, pri: Priority, src: string) => void;
}

export default function PresetsTab({ onAdd }: PresetsTabProps) {
  const [cat, setCat] = useState('all');
  const list = cat === 'all' ? PRESETS : PRESETS.filter((p) => p.cat === cat);

  return (
    <div>
      <div className="cat-pills">
        {CATS.map((c) => (
          <button key={c.id} className={`cpill${cat === c.id ? ' on' : ''}`} onClick={() => setCat(c.id)}>
            {c.label}
          </button>
        ))}
      </div>
      <div className="pgrid">
        {list.map((p) => (
          <div key={p.id} className="pcard" onClick={() => onAdd(p.text, p.pri, 'preset')}>
            <div className="pcard-hd">
              <Badge p={p.pri} />
              <div className="pcard-add"><Ic.plus /></div>
            </div>
            <div className="pcard-txt">{p.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
