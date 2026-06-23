'use client';

import React, { useState, type Dispatch, type SetStateAction } from 'react';
import { getElevenLabsStatus, fetchVoices, setVoiceId, type ElevenLabsVoice } from '@/lib/alert-engine';
import { Ic } from './icons';

interface SettingsTabProps {
  volume: number;
  setVolume: Dispatch<SetStateAction<number>>;
  repeatCount: number;
  setRepeatCount: Dispatch<SetStateAction<number>>;
  isMuted: boolean;
  setIsMuted: Dispatch<SetStateAction<boolean>>;
  onTest: () => void;
  onTestVoice: (voiceId: string) => Promise<string | null>;
  onClearHistory: () => void;
}

export default function SettingsTab({
  volume, setVolume, repeatCount, setRepeatCount,
  isMuted, setIsMuted, onTest, onTestVoice, onClearHistory,
}: SettingsTabProps) {
  const { configured } = getElevenLabsStatus();
  const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY ?? '';
  const maskedKey = apiKey ? `${apiKey.slice(0, 8)}••••••••${apiKey.slice(-4)}` : '—';

  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  const [voiceFetchErr, setVoiceFetchErr] = useState('');
  const [selectedId, setSelectedId] = useState(() => {
    if (typeof localStorage === 'undefined') return '';
    return localStorage.getItem('elevenlabs_voice_id') ?? '';
  });
  const [voiceInput, setVoiceInput] = useState(selectedId);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, 'ok' | 'fail'>>({});

  const handleVoiceChange = (id: string) => {
    setSelectedId(id);
    setVoiceInput(id);
    setVoiceId(id);
  };

  const saveVoiceInput = () => {
    const id = voiceInput.trim();
    if (id) handleVoiceChange(id);
  };

  const loadVoiceList = () => {
    setLoadingVoices(true);
    setVoiceFetchErr('');
    fetchVoices().then((v) => {
      setLoadingVoices(false);
      if (v.length === 0) {
        setVoiceFetchErr('ไม่สามารถโหลดได้ — API key อาจไม่มีสิทธิ์ voices_read');
        return;
      }
      const sorted = [...v].sort((a, b) => {
        if (a.category === 'premade' && b.category !== 'premade') return -1;
        if (a.category !== 'premade' && b.category === 'premade') return 1;
        return 0;
      });
      setVoices(sorted);
    });
  };

  const handleTestVoice = async (e: React.MouseEvent, voiceId: string) => {
    e.stopPropagation();
    setTestingId(voiceId);
    const err = await onTestVoice(voiceId);
    setTestResults((r) => ({ ...r, [voiceId]: err ? 'fail' : 'ok' }));
    setTestingId(null);
    if (!err) handleVoiceChange(voiceId);
  };

  return (
    <div style={{ maxWidth: 580, display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── ElevenLabs status ── */}
      <div>
        <p className="slbl">ElevenLabs TTS</p>
        <div className="card" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {configured ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ok500)' }}>✓ เชื่อมต่อ ElevenLabs แล้ว</span>
                <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--n500)', background: 'var(--n50)', borderRadius: 5, padding: '2px 8px' }}>{maskedKey}</span>
              </div>

              {/* Manual voice ID input — always visible */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--n600)', marginBottom: 6 }}>Voice ID</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={voiceInput}
                    onChange={(e) => setVoiceInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveVoiceInput()}
                    placeholder="วาง Voice ID จาก elevenlabs.io เช่น JBFqnCBsd6RMkjVDRZzb"
                    style={{ flex: 1, fontSize: 12, fontFamily: 'var(--mono)', padding: '7px 10px', border: '1.5px solid var(--n200)', borderRadius: 7, outline: 'none', color: 'var(--n700)', background: 'var(--n0)' }}
                  />
                  <button className="btn btn-o btn-sm" onClick={saveVoiceInput} disabled={!voiceInput.trim()}>บันทึก</button>
                </div>
                {selectedId && (
                  <div style={{ fontSize: 11, color: 'var(--ok500)', marginTop: 5 }}>
                    ✓ ใช้งาน: <span style={{ fontFamily: 'var(--mono)' }}>{selectedId}</span>
                  </div>
                )}
                {!selectedId && (
                  <div style={{ fontSize: 11, color: 'var(--r500)', marginTop: 5 }}>⚠ ยังไม่ได้ตั้งค่า Voice ID — ใส่ ID หรือโหลดรายการด้านล่าง</div>
                )}
              </div>

              {/* Optional: load voice list */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--n600)' }}>รายการ Voice</span>
                  <button
                    className="btn btn-o btn-sm"
                    onClick={loadVoiceList}
                    disabled={loadingVoices}
                    style={{ fontSize: 11 }}
                  >
                    {loadingVoices ? 'กำลังโหลด…' : 'โหลดรายการ'}
                  </button>
                  {voiceFetchErr && <span style={{ fontSize: 11, color: 'var(--r500)' }}>{voiceFetchErr}</span>}
                </div>
                {voices.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 220, overflowY: 'auto' }}>
                    {voices.map((v) => (
                      <div key={v.voice_id} onClick={() => handleVoiceChange(v.voice_id)} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '6px 10px', borderRadius: 7, background: selectedId === v.voice_id ? 'var(--n100)' : 'transparent', border: `1px solid ${selectedId === v.voice_id ? 'var(--plum-ink)' : 'transparent'}` }}>
                        <input type="radio" name="voice" value={v.voice_id} checked={selectedId === v.voice_id} onChange={() => handleVoiceChange(v.voice_id)} style={{ accentColor: 'var(--plum-ink)', flexShrink: 0 }} onClick={(e) => e.stopPropagation()} readOnly />
                        <span style={{ fontSize: 13, color: 'var(--n700)', fontWeight: selectedId === v.voice_id ? 600 : 400, flex: 1 }}>{v.name}</span>
                        {testResults[v.voice_id] === 'ok' && <span style={{ fontSize: 11, color: 'var(--ok500)' }}>✓</span>}
                        {testResults[v.voice_id] === 'fail' && <span style={{ fontSize: 11, color: 'var(--r500)' }}>✗</span>}
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: v.category === 'premade' ? 'var(--ok50)' : 'var(--n100)', color: v.category === 'premade' ? 'var(--ok500)' : 'var(--n500)' }}>
                          {v.category === 'premade' ? 'ฟรี' : 'Pro'}
                        </span>
                        <button
                          onClick={(e) => handleTestVoice(e, v.voice_id)}
                          disabled={testingId !== null}
                          style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, border: '1px solid var(--n200)', background: 'var(--n0)', cursor: 'pointer', color: 'var(--n600)', flexShrink: 0 }}
                        >
                          {testingId === v.voice_id ? '…' : '▶'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--r500)' }}>✗ ยังไม่ได้ตั้งค่า API Key</div>
              <div style={{ fontSize: 12, color: 'var(--n700)', lineHeight: 1.7 }}>
                สร้างไฟล์ <code style={{ fontFamily: 'var(--mono)', background: 'var(--n100)', padding: '1px 5px', borderRadius: 4 }}>.env.local</code> ที่ root ของโปรเจกต์ แล้วใส่:
              </div>
              <pre style={{ fontSize: 11, fontFamily: 'var(--mono)', background: 'var(--n50)', border: '1px solid var(--n200)', borderRadius: 8, padding: '10px 14px', color: 'var(--n700)', lineHeight: 1.7, margin: 0 }}>
{`NEXT_PUBLIC_ELEVENLABS_API_KEY=sk_...`}
              </pre>
              <div style={{ fontSize: 11, color: 'var(--n500)' }}>
                รีสตาร์ท dev server หลังแก้ไขไฟล์ .env.local
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Audio settings ── */}
      <div>
        <p className="slbl">เสียงแจ้งเตือน</p>
        <div className="card" style={{ padding: '4px 20px' }}>
          <div className="srow">
            <div className="srow-l">
              <div className="srow-nm">ระดับเสียง</div>
              <div className="srow-ds">ปรับความดังของเสียงแจ้งเตือน</div>
            </div>
            <div className="srow-r">
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--n500)', fontFamily: 'var(--mono)', minWidth: 32, textAlign: 'right' }}>
                {Math.round(volume * 100)}%
              </span>
              <input type="range" min="0" max="1" step=".05" value={volume}
                onChange={(e) => setVolume(+e.target.value)} style={{ width: 110 }} disabled={isMuted} />
            </div>
          </div>
          <div className="srow">
            <div className="srow-l">
              <div className="srow-nm">จำนวนการทำซ้ำ</div>
              <div className="srow-ds">จำนวนครั้งที่เล่นซ้ำต่อ 1 การแจ้งเตือน</div>
            </div>
            <div className="srow-r">
              <div className="step">
                <button className="stepbtn" onClick={() => setRepeatCount((r) => Math.max(1, r - 1))}>−</button>
                <span className="stepval">{repeatCount}</span>
                <button className="stepbtn" onClick={() => setRepeatCount((r) => Math.min(5, r + 1))}>+</button>
              </div>
            </div>
          </div>
          <div className="srow">
            <div className="srow-l">
              <div className="srow-nm">ปิดเสียงทั้งหมด</div>
              <div className="srow-ds">คิวยังคงทำงาน แต่ไม่มีเสียงออกมา</div>
            </div>
            <div className="srow-r">
              <label className="tog">
                <input type="checkbox" checked={isMuted} onChange={(e) => setIsMuted(e.target.checked)} />
                <span className="tog-sl" />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ── System ── */}
      <div>
        <p className="slbl">ระบบ</p>
        <div className="card" style={{ padding: '4px 20px' }}>
          <div className="srow">
            <div className="srow-l">
              <div className="srow-nm">ทดสอบเสียง</div>
              <div className="srow-ds">เล่นประโยคตัวอย่างผ่าน ElevenLabs</div>
            </div>
            <button className="btn btn-o btn-sm" onClick={onTest} disabled={!configured}>
              <Ic.vol /> ทดสอบ
            </button>
          </div>
          <div className="srow">
            <div className="srow-l">
              <div className="srow-nm">ล้างประวัติ</div>
              <div className="srow-ds">ลบประวัติการแจ้งเตือนทั้งหมด</div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={onClearHistory}><Ic.trash /> ล้างประวัติ</button>
          </div>
        </div>
      </div>
    </div>
  );
}
