'use client';

import {
  createContext, useContext, useState, useRef, useEffect,
  type ReactNode, type Dispatch, type SetStateAction,
} from 'react';
import { Alert, Priority, mkA, uid, sleep } from '@/lib/data';
import { playChime, speak, pauseSpeech, resumeSpeech, cancelSpeech, fetchVoices, setVoiceId, getElevenLabsStatus } from '@/lib/alert-engine';

interface Toast {
  id: number;
  msg: string;
}

interface AlertContextValue {
  queue: Alert[];
  currentId: number | null;
  isPlaying: boolean;
  isPaused: boolean;
  isMuted: boolean;
  volume: number;
  repeatCount: number;
  history: Alert[];
  toasts: Toast[];
  pendingCount: number;
  setVolume: Dispatch<SetStateAction<number>>;
  setRepeatCount: Dispatch<SetStateAction<number>>;
  setIsMuted: Dispatch<SetStateAction<boolean>>;
  addAlert: (text: string, pri: Priority, src?: string) => void;
  playNow: (text: string, pri: Priority) => void;
  ackAlert: (id: number) => void;
  delAlert: (id: number) => void;
  togglePause: () => void;
  toggleMute: () => void;
  skipCurrent: () => void;
  testVoice: () => Promise<void>;
  testSpecificVoice: (voiceId: string) => Promise<string | null>;
  clearHistory: () => void;
}

const AlertCtx = createContext<AlertContextValue | null>(null);

export function useAlerts(): AlertContextValue {
  const ctx = useContext(AlertCtx);
  if (!ctx) throw new Error('useAlerts must be used within an AlertProvider');
  return ctx;
}

export default function AlertProvider({ children }: { children: ReactNode }) {
  const [queue,       setQueue]       = useState<Alert[]>([]);
  const [currentId,   setCurrentId]   = useState<number | null>(null);
  const [isPlaying,   setIsPlaying]   = useState(false);
  const [isPaused,    setIsPaused]    = useState(false);
  const [isMuted,     setIsMuted]     = useState(false);
  const [volume,      setVolume]      = useState(0.8);
  const [repeatCount, setRepeatCount] = useState(2);
  const [history,     setHistory]     = useState<Alert[]>([]);
  const [toasts,      setToasts]      = useState<Toast[]>([]);

  // Refs for async access — avoids stale closures in the queue processor
  const busyRef   = useRef(false);
  const cancelRef = useRef(false);
  const cidRef    = useRef<number | null>(null);
  const volRef    = useRef(volume);
  const rcRef     = useRef(repeatCount);
  const mutedRef  = useRef(isMuted);

  useEffect(() => { volRef.current  = volume;      }, [volume]);
  useEffect(() => { rcRef.current   = repeatCount; }, [repeatCount]);
  useEffect(() => { mutedRef.current = isMuted;    }, [isMuted]);

  // Auto-select first premade voice on startup if none saved yet
  useEffect(() => {
    const { configured, voiceId } = getElevenLabsStatus();
    if (!configured || voiceId) return;
    fetchVoices().then((voices) => {
      const premade = voices.find((v) => v.category === 'premade');
      if (premade) setVoiceId(premade.voice_id);
    });
  }, []);

  const addToast = (msg: string, dur = 2500) => {
    const id = uid();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), dur);
  };

  // Queue processor — stored in ref so the useEffect trigger always calls the latest version
  const playAlertRef = useRef<((alert: Alert) => Promise<void>) | null>(null);
  const playAlertFn = async (alert: Alert): Promise<void> => {
    busyRef.current   = true;
    cancelRef.current = false;
    cidRef.current    = alert.id;
    setCurrentId(alert.id);
    setIsPlaying(true);
    setQueue((q) => q.map((a) => a.id === alert.id ? { ...a, status: 'playing' } : a));

    const rc = rcRef.current;
    for (let i = 0; i < rc && !cancelRef.current; i++) {
      if (!mutedRef.current) {
        await playChime(alert.priority, volRef.current);
        if (!cancelRef.current) {
          const err = await speak(alert.text, volRef.current);
          if (err) { addToast(`🔇 ${err}`); break; }
        }
      } else {
        await sleep(100);
      }
      if (i < rc - 1 && !cancelRef.current) await sleep(1300);
    }

    if (!cancelRef.current) {
      setQueue((q) => q.map((a) => a.id === alert.id ? { ...a, status: 'done' } : a));
      setHistory((h) => [{ ...alert, playedAt: new Date() }, ...h.slice(0, 19)]);
    }
    busyRef.current   = false;
    cancelRef.current = false;
    cidRef.current    = null;
    setCurrentId(null);
    setIsPlaying(false);
  };
  // Keep the ref pointing at the latest closure so the queue trigger below
  // always calls the current version (updates after each commit).
  useEffect(() => { playAlertRef.current = playAlertFn; });

  useEffect(() => {
    if (!busyRef.current && !isPaused) {
      const next = queue.find((a) => a.status === 'pending');
      if (next) playAlertRef.current?.(next);
    }
  }, [queue, isPaused]);

  // ── Actions ────────────────────────────────────────────────────────────
  const addAlert = (text: string, pri: Priority, src = 'manual') => {
    setQueue((q) => [...q, mkA(text, pri, src)]);
    addToast('เพิ่มในคิวแล้ว ✓');
  };

  const playNow = (text: string, pri: Priority) => {
    const a = mkA(text, pri, 'manual');
    if (busyRef.current) {
      cancelRef.current = true;
      cancelSpeech();
      if (cidRef.current !== null) {
        const staleId = cidRef.current;
        setQueue((q) => q.map((x) => x.id === staleId ? { ...x, status: 'acknowledged' } : x));
      }
    }
    setQueue((q) => [a, ...q.filter((x) => x.status === 'pending'), ...q.filter((x) => x.status !== 'pending')]);
    addToast('กำลังเล่นทันที...');
  };

  const ackAlert = (id: number) => {
    if (cidRef.current === id) { cancelRef.current = true; cancelSpeech(); }
    setQueue((q) => q.map((a) => a.id === id ? { ...a, status: 'acknowledged' } : a));
  };

  const delAlert = (id: number) => {
    if (cidRef.current === id) { cancelRef.current = true; cancelSpeech(); }
    setQueue((q) => q.filter((a) => a.id !== id));
    addToast('ลบการแจ้งเตือนแล้ว');
  };

  const togglePause = () => {
    setIsPaused((p) => { if (!p) pauseSpeech(); else resumeSpeech(); return !p; });
  };

  const toggleMute = () => {
    setIsMuted((m) => { if (!m) cancelSpeech(); return !m; });
  };

  const skipCurrent = () => {
    if (cidRef.current !== null) {
      const staleId = cidRef.current;
      cancelRef.current = true;
      cancelSpeech();
      setQueue((q) => q.map((a) => a.id === staleId ? { ...a, status: 'acknowledged' } : a));
    }
  };

  const testVoice = async () => {
    await playChime('urgent', volRef.current);
    const err = await speak('ทดสอบระบบแจ้งเตือนเสียง พร้อมใช้งาน', volRef.current);
    if (err) addToast(`🔇 ${err}`);
    else addToast('ทดสอบเสร็จสิ้น ✓');
  };

  const testSpecificVoice = async (voiceId: string) => {
    await playChime('normal', volRef.current);
    const err = await speak('ทดสอบเสียง', volRef.current, voiceId);
    return err;
  };

  const clearHistory = () => { setHistory([]); addToast('ล้างประวัติแล้ว'); };

  const pendingCount = queue.filter((a) => a.status === 'pending').length;

  const value: AlertContextValue = {
    queue, currentId, isPlaying, isPaused, isMuted, volume, repeatCount, history, toasts, pendingCount,
    setVolume, setRepeatCount, setIsMuted,
    addAlert, playNow, ackAlert, delAlert, togglePause, toggleMute, skipCurrent,
    testVoice, testSpecificVoice, clearHistory,
  };

  return <AlertCtx.Provider value={value}>{children}</AlertCtx.Provider>;
}
