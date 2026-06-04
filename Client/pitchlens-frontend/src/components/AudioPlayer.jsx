// src/components/AudioPlayer.jsx
import { useState, useRef, useEffect } from 'react';

// blob 또는 url 중 하나를 전달. key 변경 시 remount로 상태 초기화 권장.
export default function AudioPlayer({ blob, url }) {
  const audioRef              = useRef(null);
  const fixingDuration        = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime]       = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!blob) return;
    const objUrl = URL.createObjectURL(blob);
    if (audioRef.current) {
      audioRef.current.src = objUrl;
      audioRef.current.load();
    }
    return () => URL.revokeObjectURL(objUrl);
  }, [blob]);

  if (!blob && !url) return null;

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.pause();
    else audio.play().catch(() => {});
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = pct * duration;
    setTime(pct * duration);
  };

  // MediaRecorder(WebM)는 헤더에 duration을 기록하지 않아 Infinity 반환.
  // 끝으로 seek → 브라우저가 실제 길이를 계산 → onseeked에서 확정.
  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!isFinite(audio.duration)) {
      fixingDuration.current = true;
      audio.currentTime = Number.MAX_SAFE_INTEGER;
    } else {
      setDuration(audio.duration);
    }
  };

  const handleSeeked = () => {
    const audio = audioRef.current;
    if (!audio || !fixingDuration.current) return;
    fixingDuration.current = false;
    setDuration(audio.duration);
    audio.currentTime = 0;
  };

  const fmt = (s) => {
    if (!isFinite(s) || s <= 0) return '0:00';
    const m   = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const pct = duration > 0 ? (time / duration) * 100 : 0;

  return (
    <div style={a.wrap}>
      <audio
        ref={audioRef}
        src={url || undefined}
        onTimeUpdate={() => audioRef.current && setTime(audioRef.current.currentTime)}
        onLoadedMetadata={handleLoadedMetadata}
        onSeeked={handleSeeked}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setTime(0);
          if (audioRef.current) audioRef.current.currentTime = 0;
        }}
      />
      <button style={a.playBtn} onClick={toggle} title={playing ? '일시정지' : '재생'}>
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>
      <div style={a.trackWrap} onClick={handleSeek}>
        <div style={a.track}>
          <div style={{ ...a.fill, width: `${pct}%` }} />
          <div style={{ ...a.thumb, left: `${pct}%` }} />
        </div>
      </div>
      <span style={a.time}>{fmt(time)} / {duration > 0 ? fmt(duration) : '...'}</span>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3 2l7 4-7 4V2z" fill="currentColor" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect x="2" y="2" width="3" height="8" rx="1" fill="currentColor" />
      <rect x="7" y="2" width="3" height="8" rx="1" fill="currentColor" />
    </svg>
  );
}

const a = {
  wrap:      { display: 'flex', alignItems: 'center', gap: 10 },
  playBtn:   { width: 30, height: 30, borderRadius: '50%',
               background: 'rgba(245,166,35,0.12)',
               border: '1px solid rgba(245,166,35,0.4)',
               color: 'var(--gold)', fontSize: 13,
               display: 'flex', alignItems: 'center', justifyContent: 'center',
               cursor: 'pointer', flexShrink: 0, padding: 0 },
  trackWrap: { flex: 1, padding: '8px 0', cursor: 'pointer' },
  track:     { height: 4, background: 'var(--border)', borderRadius: 2, position: 'relative' },
  fill:      { height: '100%', background: 'var(--gold)', borderRadius: 2,
               transition: 'width 0.1s linear' },
  thumb:     { position: 'absolute', top: '50%',
               transform: 'translate(-50%, -50%)',
               width: 10, height: 10, borderRadius: '50%',
               background: 'var(--gold)',
               boxShadow: '0 0 6px rgba(245,166,35,0.5)',
               pointerEvents: 'none' },
  time:      { fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text3)',
               flexShrink: 0, minWidth: 76, textAlign: 'right' },
};
