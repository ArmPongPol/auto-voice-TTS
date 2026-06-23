export type Priority = 'emergency' | 'urgent' | 'normal';
export type TabId = 'dashboard' | 'manual' | 'presets' | 'settings';

export interface Alert {
  id: number;
  text: string;
  priority: Priority;
  status: 'pending' | 'playing' | 'done' | 'acknowledged';
  source: string;
  addedAt: Date;
  playedAt?: Date;
}

let _id = 10;
export const uid = (): number => ++_id;
export const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
export const fmt = (d: Date): string =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

export const mkA = (text: string, pri: Priority, src = 'manual'): Alert => ({
  id: uid(),
  text,
  priority: pri,
  status: 'pending',
  source: src,
  addedAt: new Date(),
});

export const CATS = [
  { id: 'all',        label: 'ทั้งหมด' },
  { id: 'machine',    label: 'เครื่องจักร' },
  { id: 'safety',     label: 'ความปลอดภัย' },
  { id: 'production', label: 'การผลิต' },
  { id: 'personnel',  label: 'บุคลากร' },
];

export const PRESETS = [
  { id: 'p1',  cat: 'machine',    pri: 'emergency' as Priority, text: 'เครื่องจักรหมายเลข 3 หยุดทำงานนานกว่า 30 นาที กรุณาแจ้งช่างซ่อมบำรุงโดยด่วน' },
  { id: 'p2',  cat: 'machine',    pri: 'emergency' as Priority, text: 'สายพานลำเลียงหมายเลข 2 หยุดทำงาน กรุณาตรวจสอบทันที' },
  { id: 'p3',  cat: 'machine',    pri: 'urgent' as Priority,    text: 'เครื่องจักรหมายเลข 5 ทำงานผิดปกติ กรุณาตรวจสอบและรายงานผล' },
  { id: 'p4',  cat: 'machine',    pri: 'urgent' as Priority,    text: 'อุณหภูมิเครื่องจักรสูงเกินกำหนด กรุณาหยุดเครื่องและตรวจสอบระบบระบายความร้อน' },
  { id: 'p5',  cat: 'safety',     pri: 'emergency' as Priority, text: 'แจ้งเตือนฉุกเฉิน กรุณาหยุดการทำงานทั้งหมดและออกจากพื้นที่ทันที' },
  { id: 'p6',  cat: 'safety',     pri: 'urgent' as Priority,    text: 'กรุณาสวมอุปกรณ์ป้องกันส่วนบุคคลก่อนเข้าพื้นที่การผลิต' },
  { id: 'p7',  cat: 'safety',     pri: 'urgent' as Priority,    text: 'ตรวจพบสารเคมีรั่วไหล กรุณาหยุดการทำงานและแจ้งเจ้าหน้าที่ความปลอดภัย' },
  { id: 'p8',  cat: 'production', pri: 'urgent' as Priority,    text: 'สายการผลิต A มีของเสียเกินเกณฑ์ กรุณาตรวจสอบและปรับปรุงกระบวนการ' },
  { id: 'p9',  cat: 'production', pri: 'normal' as Priority,    text: 'ยอดการผลิตถึงเป้าหมายประจำวันแล้ว ขอบคุณทุกท่านสำหรับความร่วมมือ' },
  { id: 'p10', cat: 'production', pri: 'urgent' as Priority,    text: 'วัตถุดิบใกล้หมด กรุณาแจ้งแผนกจัดซื้อเพื่อดำเนินการสั่งซื้อด่วน' },
  { id: 'p11', cat: 'personnel',  pri: 'normal' as Priority,    text: 'ถึงเวลาเปลี่ยนกะบ่าย กรุณาส่งมอบงานให้เรียบร้อยและออกจากพื้นที่ผลิต' },
  { id: 'p12', cat: 'personnel',  pri: 'normal' as Priority,    text: 'ถึงเวลาพักกลางวัน 12:00 น. กรุณาหยุดพักและรับประทานอาหาร' },
  { id: 'p13', cat: 'personnel',  pri: 'urgent' as Priority,    text: 'กรุณาช่างซ่อมบำรุงทุกท่านมาที่สายการผลิต B โดยด่วน' },
];

export const PDATA: Record<Priority, { dot: string; bdg: string; label: string; npBadge: string; npLabel: string }> = {
  emergency: { dot: '#e23a3f', bdg: 'bdg bdg-e', label: 'ฉุกเฉิน',  npBadge: 'np-badge npb-e', npLabel: '🔴 ฉุกเฉิน' },
  urgent:    { dot: '#FFC85C', bdg: 'bdg bdg-u', label: 'เร่งด่วน', npBadge: 'np-badge npb-u', npLabel: '🟡 เร่งด่วน' },
  normal:    { dot: '#3a6df0', bdg: 'bdg bdg-n', label: 'ปกติ',     npBadge: 'np-badge npb-n', npLabel: '🔵 ปกติ' },
};

export const SRCLABEL: Record<string, string> = {
  auto:     'อัตโนมัติ',
  schedule: 'ตารางเวลา',
  manual:   'ด้วยตนเอง',
  preset:   'ปุ่มลัด',
};
