import { PDATA, type Priority } from '@/lib/data';

export function Badge({ p }: { p: Priority }) {
  const d = PDATA[p] || PDATA.normal;
  return <span className={d.bdg}>{d.label}</span>;
}

export function PriDot({ p }: { p: Priority }) {
  const color = (PDATA[p] || PDATA.normal).dot;
  return (
    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
  );
}

export function Waveform({ active }: { active: boolean }) {
  return (
    <div className={`wf${active ? ' live' : ''}`}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <div key={i} className="wb" />
      ))}
    </div>
  );
}
