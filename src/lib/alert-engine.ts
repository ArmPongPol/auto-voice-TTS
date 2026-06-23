// Client-side only — do not import in server components
let ctx: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;
let cancelCurrentFetch: (() => void) | null = null;

function getCtx(): AudioContext {
  const Ctx = (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!ctx) ctx = new (window.AudioContext || Ctx!)();
  return ctx;
}

function resumeCtx(): void {
  try {
    const c = getCtx();
    if (c.state === 'suspended') c.resume();
  } catch { /* noop */ }
}

export type Priority = 'emergency' | 'urgent' | 'normal';

type Note = { f: number; t: number };
const CHIME_PATTERNS: Record<Priority, Note[]> = {
  emergency: [{ f: 880, t: 0 }, { f: 1100, t: 0.2 }, { f: 880, t: 0.4 }, { f: 1100, t: 0.6 }],
  urgent:    [{ f: 660, t: 0 }, { f: 880, t: 0.22 }],
  normal:    [{ f: 660, t: 0 }],
};

export function playChime(priority: Priority, vol: number): Promise<void> {
  return new Promise((resolve) => {
    try {
      const c = getCtx();
      c.resume().then(() => {
        const now = c.currentTime;
        const master = c.createGain();
        master.gain.value = Math.max(0.01, vol * 0.42);
        master.connect(c.destination);

        const notes = CHIME_PATTERNS[priority] || CHIME_PATTERNS.normal;
        notes.forEach((n) => {
          const o = c.createOscillator();
          const g = c.createGain();
          o.connect(g);
          g.connect(master);
          o.type = 'sine';
          o.frequency.value = n.f;
          g.gain.setValueAtTime(0, now + n.t);
          g.gain.linearRampToValueAtTime(0.9, now + n.t + 0.04);
          g.gain.exponentialRampToValueAtTime(0.001, now + n.t + 0.38);
          o.start(now + n.t);
          o.stop(now + n.t + 0.4);
        });
        setTimeout(resolve, (notes[notes.length - 1].t + 0.55) * 1000);
      }).catch(() => resolve());
    } catch {
      resolve();
    }
  });
}

const VOICE_LS_KEY = 'elevenlabs_voice_id';

function getVoiceId(): string {
  // localStorage may be a partial shim during SSR — guard against missing methods.
  try {
    return localStorage.getItem(VOICE_LS_KEY) ?? '';
  } catch {
    return '';
  }
}

export function setVoiceId(id: string): void {
  try {
    localStorage.setItem(VOICE_LS_KEY, id);
  } catch { /* not available during SSR */ }
}

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category?: string;
}

export async function fetchVoices(): Promise<ElevenLabsVoice[]> {
  const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  if (!apiKey) return [];
  try {
    const res = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': apiKey },
    });
    if (!res.ok) return [];
    const data = await res.json() as { voices?: ElevenLabsVoice[] };
    return data.voices ?? [];
  } catch {
    return [];
  }
}

/** Returns null on success, or an error message string on failure. */
export async function speak(text: string, vol: number, voiceOverride?: string): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  if (!apiKey) return 'API key ไม่ได้ตั้งค่า — เพิ่ม NEXT_PUBLIC_ELEVENLABS_API_KEY ใน .env.local';

  const voiceId = voiceOverride ?? getVoiceId();
  if (!voiceId) return 'ยังไม่ได้เลือก Voice — ไปที่ Settings เพื่อเลือก';

  // Abort any in-flight fetch from a previous call
  cancelCurrentFetch?.();

  const controller = new AbortController();
  cancelCurrentFetch = () => controller.abort();

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          language_code: 'th',
          model_id: 'eleven_v3',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
        signal: controller.signal,
      },
    );

    cancelCurrentFetch = null;

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error('[ElevenLabs] error body:', body);
      if (res.status === 402) {
        if (typeof localStorage !== 'undefined') localStorage.removeItem(VOICE_LS_KEY);
        return 'Voice นี้ต้องการ plan แบบชำระเงิน — เลือก Voice ใหม่ใน Settings';
      }
      return `ElevenLabs error ${res.status}: ${body.slice(0, 200)}`;
    }

    const arrayBuffer = await res.arrayBuffer();
    const c = getCtx();
    await c.resume();

    let audioBuffer: AudioBuffer;
    try {
      audioBuffer = await c.decodeAudioData(arrayBuffer);
    } catch {
      return 'ไม่สามารถ decode ไฟล์เสียงได้';
    }

    await new Promise<void>((resolve) => {
      const gain = c.createGain();
      gain.gain.value = Math.max(0.01, vol);
      gain.connect(c.destination);

      const source = c.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(gain);
      source.onended = () => {
        if (currentSource === source) currentSource = null;
        resolve();
      };
      currentSource = source;
      source.start();
    });

    return null; // success
  } catch (err) {
    cancelCurrentFetch = null;
    if (err instanceof Error && err.name === 'AbortError') return null; // cancelled — not an error
    return `TTS error: ${err instanceof Error ? err.message : String(err)}`;
  }
}

export function cancelSpeech(): void {
  cancelCurrentFetch?.();
  cancelCurrentFetch = null;
  if (currentSource) {
    try { currentSource.stop(); } catch { /* already stopped */ }
    currentSource = null;
  }
}

export function pauseSpeech(): void {
  try { getCtx().suspend(); } catch { /* noop */ }
}

export function resumeSpeech(): void {
  try { getCtx().resume(); } catch { /* noop */ }
}

export function getElevenLabsStatus(): { configured: boolean; voiceId: string } {
  return {
    configured: !!process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
    voiceId: getVoiceId(),
  };
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', resumeCtx, { once: true });
}
