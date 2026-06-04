// src/components/PresentationRecorder.jsx
// 슬라이드 뷰어 + 슬라이드별 녹음 컨트롤
//
// props:
//   slides    [{ index, imageUrl, text }]
//   title     string
//   onComplete(audioBlobs: Blob[])  — 모든 슬라이드 녹음 완료 콜백
//   onCancel  ()                    — 업로드 화면으로 돌아가기

import { useState, useCallback, useRef, useEffect } from 'react';
import { useSlideRecorder } from '../hooks/useSlideRecorder';

export default function PresentationRecorder({ slides, title, onComplete, onCancel }) {
  const totalSlides = slides.length;

  const {
    currentSlide, isRecording, elapsedTime, recordings,
    startRecording, goNext, goPrev, finish, reset,
  } = useSlideRecorder(totalSlides);

  const [started, setStarted]     = useState(false);
  const [micError, setMicError]   = useState(null);
  const [finishing, setFinishing] = useState(false);
  const [slideDurations, setSlideDurations] = useState(() => new Array(totalSlides).fill(0));
  const slideEnterTimeRef = useRef(null);
  const mainRef = useRef(null);

  const accumulateDuration = useCallback((slideIdx) => {
    if (!slideEnterTimeRef.current) return;
    const dur = (Date.now() - slideEnterTimeRef.current) / 1000;
    setSlideDurations(prev => {
      const updated = [...prev];
      updated[slideIdx] = (updated[slideIdx] || 0) + dur;
      return updated;
    });
    slideEnterTimeRef.current = null;
  }, []);

  // 슬라이드 전환 시 스크롤 상단으로 초기화
  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [currentSlide]);

  const slide  = slides[currentSlide];
  const isLast = currentSlide === totalSlides - 1;

  const handleStart = useCallback(async () => {
    setMicError(null);
    try {
      await startRecording();
      slideEnterTimeRef.current = Date.now();
      setStarted(true);
    } catch (e) {
      const name = e?.name || '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setMicError('마이크 권한이 필요합니다. 설정 → 앱 → PitchLens → 권한에서 마이크를 허용하거나, 웹에서는 브라우저 주소창 옆의 권한을 확인해 주세요.');
      } else if (name === 'NotFoundError') {
        setMicError('마이크를 찾을 수 없습니다. 기기 연결을 확인해 주세요.');
      } else {
        setMicError('마이크를 사용할 수 없습니다. 권한·기기 설정을 확인해 주세요.');
      }
    }
  }, [startRecording]);

  const handleNext = useCallback(async () => {
    if (!isRecording) return;
    accumulateDuration(currentSlide);
    await goNext();
    slideEnterTimeRef.current = Date.now();
  }, [isRecording, goNext, currentSlide, accumulateDuration]);

  const handlePrev = useCallback(async () => {
    if (currentSlide === 0 || !isRecording) return;
    accumulateDuration(currentSlide);
    await goPrev();
    slideEnterTimeRef.current = Date.now();
  }, [currentSlide, isRecording, goPrev, accumulateDuration]);

  const handleFinish = useCallback(async () => {
    if (!isRecording || finishing) return;
    accumulateDuration(currentSlide);
    setFinishing(true);
    try {
      const audioBlobs = await finish();
      onComplete(audioBlobs);
    } catch {
      setFinishing(false);
    }
  }, [isRecording, finishing, finish, onComplete, currentSlide, accumulateDuration]);

  const handleCancel = useCallback(() => {
    reset();
    onCancel();
  }, [reset, onCancel]);

  const formatTime = (s) => {
    const m   = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  return (
    <div style={s.wrap}>

      {/* 헤더 */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <MicIcon />
          <span style={s.logoText}>PITCH<span style={{ color: 'var(--gold)' }}>LENS</span></span>
          <div style={s.divider} />
          <span style={s.titleText}>{title}</span>
        </div>
        <div style={s.slideCounter}>
          <span style={s.slideNum}>{currentSlide + 1}</span>
          <span style={s.slideTotal}>&nbsp;/ {totalSlides}</span>
        </div>
        <button style={s.cancelBtn} onClick={handleCancel}>✕ 취소</button>
      </header>

      {/* 슬라이드 이미지 영역 */}
      <main ref={mainRef} style={s.main}>
        <div style={s.slideFrame}>
          <img
            src={slide.imageUrl}
            alt={`슬라이드 ${currentSlide + 1}`}
            style={s.slideImg}
          />
          {/* 녹음 중 표시 오버레이 */}
          {isRecording && (
            <div style={s.recBadge}>
              <div style={s.recDot} />
              REC
            </div>
          )}
        </div>
      </main>

      {/* 컨트롤 바 */}
      <div style={s.controlBar}>

        {/* 이전 버튼 */}
        <button
          style={{ ...s.navBtn, ...(currentSlide === 0 || !started ? s.disabled : {}) }}
          disabled={currentSlide === 0 || !started}
          onClick={handlePrev}
        >
          ← 이전
        </button>

        {/* 중앙 상태 */}
        <div style={s.center}>
          {!started ? (
            <>
              <button style={s.startBtn} onClick={handleStart}>
                <span style={s.redDot} />
                녹음 시작
              </button>
              {micError && <div style={s.micError}>{micError}</div>}
            </>
          ) : (
            <div style={s.recStatus}>
              <div style={s.recPulse} />
              <span style={s.recTime}>{formatTime(elapsedTime)}</span>
              <span style={s.recLabel}>
                {recordings[currentSlide]?.length > 0 ? '이어서 녹음 중' : '녹음 중'}
              </span>
            </div>
          )}
        </div>

        {/* 다음 / 완료 버튼 */}
        {started ? (
          isLast ? (
            <button
              style={{ ...s.finishBtn, ...(finishing ? s.disabled : {}) }}
              disabled={finishing}
              onClick={handleFinish}
            >
              완료 ✓
            </button>
          ) : (
            <button style={s.navBtn} onClick={handleNext}>
              다음 →
            </button>
          )
        ) : (
          <div style={{ minWidth: 96 }} />
        )}
      </div>

      {/* 슬라이드 진행 바 */}
      <div style={s.progressBar}>
        {slides.map((_, i) => (
          <div key={i} style={s.segWrap}>
            <div style={{
              ...s.seg,
              background:
                i === currentSlide
                  ? (isRecording ? 'var(--gold)' : 'var(--border2)')
                  : recordings[i]?.length > 0
                    ? 'var(--teal)'
                    : 'var(--border)',
              boxShadow: i === currentSlide && isRecording ? '0 0 6px var(--gold)' : 'none',
            }} />
            {slideDurations[i] > 0 && (
              <span style={s.segTime}>{Math.round(slideDurations[i])}s</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
      <rect x="11" y="2" width="10" height="16" rx="5" fill="var(--gold)" opacity="0.9"/>
      <path d="M6 16a10 10 0 0020 0" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <line x1="16" y1="26" x2="16" y2="30" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="11" y1="30" x2="21" y2="30" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

const s = {
  wrap:       { display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' },

  header:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 28px', height: 56, borderBottom: '1px solid var(--border)',
                background: 'rgba(8,10,14,0.92)', backdropFilter: 'blur(12px)',
                flexShrink: 0, gap: 16 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 },
  logoText:   { fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: 2, color: 'var(--text)', flexShrink: 0 },
  divider:    { width: 1, height: 16, background: 'var(--border2)', flexShrink: 0 },
  titleText:  { fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text2)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  slideCounter: { display: 'flex', alignItems: 'baseline', flexShrink: 0 },
  slideNum:   { fontSize: 20, fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--font-mono)' },
  slideTotal: { fontSize: 13, color: 'var(--text2)', fontFamily: 'var(--font-mono)' },
  cancelBtn:  { background: 'none', border: '1px solid var(--border2)', borderRadius: 8,
                padding: '6px 14px', color: 'var(--text2)', fontSize: 12,
                cursor: 'pointer', flexShrink: 0 },

  main:       { flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                padding: '20px 28px', overflowY: 'auto' },
  slideFrame: { position: 'relative', width: '100%', maxWidth: 1100,
                borderRadius: 10, overflow: 'hidden',
                boxShadow: '0 12px 48px rgba(0,0,0,0.7)' },
  slideImg:   { display: 'block', width: '100%', height: 'auto' },
  recBadge:   { position: 'absolute', top: 12, right: 12,
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,77,109,0.85)', backdropFilter: 'blur(6px)',
                borderRadius: 6, padding: '4px 10px',
                fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700,
                color: '#fff', letterSpacing: 1 },
  recDot:     { width: 7, height: 7, borderRadius: '50%', background: '#fff',
                animation: 'pulse 1s infinite' },

  controlBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 28px', borderTop: '1px solid var(--border)',
                background: 'rgba(8,10,14,0.96)', backdropFilter: 'blur(12px)',
                flexShrink: 0, gap: 12 },
  center:     { flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 6 },

  startBtn:   { display: 'flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, #ff4d6d, #ff6b8a)',
                color: '#fff', border: 'none', borderRadius: 12,
                padding: '11px 28px', fontSize: 15, fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 0 24px rgba(255,77,109,0.3)',
                letterSpacing: 0.5 },
  redDot:     { width: 10, height: 10, borderRadius: '50%', background: '#fff', flexShrink: 0 },

  recStatus:  { display: 'flex', alignItems: 'center', gap: 10 },
  recPulse:   { width: 10, height: 10, borderRadius: '50%', background: 'var(--red)',
                animation: 'pulse 1.2s infinite', flexShrink: 0 },
  recTime:    { fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text)' },
  recLabel:   { fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--font-mono)' },
  micError:   { fontSize: 12, color: 'var(--red)', fontFamily: 'var(--font-mono)', textAlign: 'center' },

  navBtn:     { minWidth: 96, background: 'var(--surface2)', border: '1px solid var(--border2)',
                borderRadius: 10, padding: '10px 20px', color: 'var(--text)',
                fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  finishBtn:  { minWidth: 96, background: 'linear-gradient(135deg, var(--teal), #00a88d)',
                color: '#000', border: 'none', borderRadius: 10,
                padding: '10px 20px', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 0 20px var(--teal-glow)' },
  disabled:   { opacity: 0.35, cursor: 'not-allowed' },

  progressBar: { display: 'flex', gap: 3, padding: '5px 28px 7px',
                 background: 'var(--bg2)', flexShrink: 0 },
  segWrap:     { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 0 },
  seg:         { height: 3, width: '100%', borderRadius: 2, transition: 'background 0.3s, box-shadow 0.3s' },
  segTime:     { fontSize: 9, color: 'var(--text3)', fontFamily: 'var(--font-mono)', lineHeight: 1 },
};
