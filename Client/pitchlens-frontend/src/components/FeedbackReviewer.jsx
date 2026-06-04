// src/components/FeedbackReviewer.jsx
// 슬라이드별 피드백 뷰어
//
// props:
//   slides  [{ index, imageUrl, text }]   — usePDFLoader 슬라이드 배열
//   result  FeedbackResponse              — presentation-feedback API 응답
//   title   string
//   onBack  ()                            — 처음으로 돌아가기

import { useState, useRef, useEffect } from 'react';
import AudioPlayer from './AudioPlayer';
import { exportFeedbackToPdf } from '../utils/feedbackPdfExport';

export default function FeedbackReviewer({ slides, result, title, transcripts = {}, slideBlobs = [], onBack }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSummary, setShowSummary]   = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportError, setExportError]   = useState('');
  const mainRef = useRef(null);

  const handleExportPdf = () => {
    setExportError('');
    setExportingPdf(true);
    try {
      exportFeedbackToPdf({
        detail: { title, createdAt: new Date().toISOString(), feedbackResult: result },
        slides: result.slide_feedbacks ?? [],
        slideImages: slides.map(s => s.imageUrl ?? ''),
      });
    } catch (e) {
      setExportError(e.message);
    } finally {
      setExportingPdf(false);
    }
  };

  const totalSlides = slides.length;
  const isFirst     = currentSlide === 0 && !showSummary;
  const isLast      = currentSlide === totalSlides - 1;

  // slide_feedbacks 는 slide_index 기준 1-based
  const slideFeedback = result.slide_feedbacks?.find(
    f => f.slide_index === currentSlide + 1,
  );

  // 슬라이드·요약 전환 시 스크롤 상단 초기화
  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [currentSlide, showSummary]);

  const handleNext = () => {
    if (showSummary) return;
    if (isLast) { setShowSummary(true); return; }
    setCurrentSlide(n => n + 1);
  };

  const handlePrev = () => {
    if (showSummary) { setShowSummary(false); return; }
    if (currentSlide === 0) return;
    setCurrentSlide(n => n - 1);
  };

  return (
    <div style={s.wrap}>

      {/* 헤더 */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <ChartIcon />
          <span style={s.logoText}>
            PITCH<span style={{ color: 'var(--gold)' }}>LENS</span>
          </span>
          <div style={s.divider} />
          <span style={s.titleText}>{title}</span>
        </div>
        <div style={s.headerCenter}>
          {showSummary
            ? <span style={s.summaryBadge}>종합 피드백</span>
            : <>
                <span style={s.slideNum}>{currentSlide + 1}</span>
                <span style={s.slideTotal}>&nbsp;/ {totalSlides}</span>
              </>
          }
        </div>
        <div style={s.headerRight}>
          <button
            style={{ ...s.exportBtn, ...(exportingPdf ? s.exportBtnDisabled : {}) }}
            onClick={handleExportPdf}
            disabled={exportingPdf}
          >
            {exportingPdf ? 'PDF 준비 중...' : '피드백 PDF 내보내기 ↓'}
          </button>
          <button style={s.backBtn} onClick={onBack}>↺ 처음으로</button>
        </div>
      </header>

      {exportError && (
        <div style={s.errorBanner}>{exportError}</div>
      )}

      {/* 메인 콘텐츠 */}
      <main ref={mainRef} style={s.main}>
        {showSummary ? (
          <SummaryView result={result} />
        ) : (
          <div style={s.slideContent}>
            {/* 슬라이드 이미지 */}
            <div style={s.slideFrame}>
              <img
                src={slides[currentSlide].imageUrl}
                alt={`슬라이드 ${currentSlide + 1}`}
                style={s.slideImg}
              />
            </div>

            {/* 슬라이드별 피드백 패널 */}
            {slideFeedback
              ? <SlideFeedbackPanel
                  key={currentSlide}
                  feedback={slideFeedback}
                  slideNum={currentSlide + 1}
                  transcriptText={transcripts[currentSlide + 1]}
                  audioBlob={slideBlobs[currentSlide] ?? null}
                />
              : <div style={s.noFeedback}>이 슬라이드의 피드백 데이터가 없습니다.</div>
            }
          </div>
        )}
      </main>

      {/* 컨트롤 바 */}
      <div style={s.controlBar}>
        <button
          style={{ ...s.navBtn, ...(isFirst ? s.disabled : {}) }}
          disabled={isFirst}
          onClick={handlePrev}
        >
          ← {showSummary ? '슬라이드로' : '이전'}
        </button>

        {/* 슬라이드 진행 도트 (요약 화면에서는 숨김) */}
        {!showSummary && (
          <div style={s.dotRow}>
            {slides.map((_, i) => (
              <div
                key={i}
                style={{
                  ...s.dot,
                  background: i === currentSlide
                    ? 'var(--gold)'
                    : i < currentSlide ? 'var(--teal)' : 'var(--border2)',
                  transform: i === currentSlide ? 'scale(1.4)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        )}
        {showSummary && <div style={{ flex: 1 }} />}

        {showSummary ? (
          <div style={{ minWidth: 96 }} />
        ) : (
          <button style={s.nextBtn} onClick={handleNext}>
            {isLast ? '종합 피드백 →' : '다음 →'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── 슬라이드별 피드백 패널 ────────────────────────────────
function SlideFeedbackPanel({ feedback, slideNum, transcriptText, audioBlob }) {
  const { similarity_score, audio_summary, visual_feedback } = feedback;
  const sim   = Math.round((similarity_score ?? 0) * 100);
  const speed = audio_summary?.speed_label ?? '—';
  const wpm   = audio_summary?.wpm != null ? `${Math.round(audio_summary.wpm)} WPM` : null;
  const filler      = audio_summary?.filler_label ?? '—';
  const fillerCount = audio_summary?.filler_count ?? 0;
  const fillerRatio = audio_summary?.filler_ratio != null
    ? `${(audio_summary.filler_ratio * 100).toFixed(1)}%`
    : null;

  const simColor = sim >= 70 ? 'var(--teal)' : sim >= 40 ? '#f5a623' : '#ff4d6d';
  const speedColor = speed === '빠름' ? '#ff8c5a' : speed === '느림' ? '#7eb3ff' : 'var(--teal)';
  const fillerColor = filler === '많음' ? '#ff4d6d' : 'var(--teal)';

  return (
    <div style={p.panel}>
      <div style={p.panelTitle}>슬라이드 {slideNum} 피드백</div>

      {/* 녹음 재생 */}
      {audioBlob && (
        <div style={p.audioRow}>
          <span style={p.audioLabel}>내 목소리 듣기</span>
          <AudioPlayer blob={audioBlob} />
        </div>
      )}

      <div style={p.grid}>
        {/* 유사도 */}
        <div style={p.card}>
          <div style={p.cardLabel}>슬라이드 ↔ 발화 유사도</div>
          <div style={{ ...p.bigNum, color: simColor }}>{sim}%</div>
          <div style={p.barTrack}>
            <div style={{ ...p.barFill, width: `${sim}%`, background: simColor }} />
          </div>
        </div>

        {/* 발화 속도 */}
        <div style={p.card}>
          <div style={p.cardLabel}>발화 속도</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ ...p.bigNum, color: speedColor }}>{speed}</span>
            {wpm && <span style={p.subText}>{wpm}</span>}
          </div>
          <div style={{ ...p.badge, background: speedColor + '22', color: speedColor }}>
            {speed === '빠름' ? '속도를 늦춰보세요' : speed === '느림' ? '조금 빠르게 말해보세요' : '적절한 속도예요'}
          </div>
        </div>

        {/* 필러 단어 */}
        <div style={p.card}>
          <div style={p.cardLabel}>필러 단어</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ ...p.bigNum, color: fillerColor }}>{fillerCount}회</span>
            {fillerRatio && <span style={p.subText}>{fillerRatio}</span>}
          </div>
          <div style={{ ...p.badge, background: fillerColor + '22', color: fillerColor }}>
            {filler === '많음' ? '필러 단어를 줄여보세요' : '필러 단어가 적절해요'}
          </div>
        </div>

        {/* 전사 텍스트 */}
        {transcriptText && (
          <div style={{ ...p.card, gridColumn: '1 / -1' }}>
            <div style={p.cardLabel}>내가 한 말</div>
            <div style={p.transcriptText}>{transcriptText}</div>
          </div>
        )}

        {/* 시각적 피드백 */}
        {visual_feedback && (
          <div style={{ ...p.card, gridColumn: '1 / -1' }}>
            <div style={p.cardLabel}>슬라이드 시각 피드백</div>
            <div style={p.bodyText}>{visual_feedback}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 종합 피드백 화면 ──────────────────────────────────────
function SummaryView({ result }) {
  const {
    overall_similarity_score,
    overall_feedback,
    content_feedback,
    improvement_suggestions = [],
    slide_feedbacks = [],
  } = result;

  const overallSim = Math.round((overall_similarity_score ?? 0) * 100);
  const circumference = 2 * Math.PI * 50;

  // 슬라이드별 평균 속도/필러 집계
  const summaries = slide_feedbacks.map(f => f.audio_summary).filter(Boolean);
  const avgWpm = summaries.length
    ? Math.round(summaries.reduce((s, a) => s + (a.wpm || 0), 0) / summaries.length)
    : null;
  const totalFillers = summaries.reduce((s, a) => s + (a.filler_count || 0), 0);

  return (
    <div style={su.wrap}>

      {/* 종합 점수 카드 */}
      <div style={su.scoreCard}>
        <div style={su.scoreLeft}>
          <svg width="110" height="110" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border2)" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="50" fill="none"
              stroke="var(--gold)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - overallSim / 100)}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div style={su.scoreNum}>{overallSim}%</div>
          <div style={su.scoreLabel}>전체 유사도</div>
        </div>

        <div style={su.scoreRight}>
          {avgWpm != null && (
            <div style={su.statRow}>
              <span style={su.statKey}>평균 발화 속도</span>
              <span style={su.statVal}>{avgWpm} WPM</span>
            </div>
          )}
          <div style={su.statRow}>
            <span style={su.statKey}>총 필러 단어</span>
            <span style={{ ...su.statVal, color: totalFillers > 10 ? '#ff4d6d' : 'var(--teal)' }}>
              {totalFillers}회
            </span>
          </div>
          <div style={su.statRow}>
            <span style={su.statKey}>발표 슬라이드</span>
            <span style={su.statVal}>{slide_feedbacks.length}장</span>
          </div>
        </div>
      </div>

      {/* 종합 평가 */}
      <div style={su.card}>
        <div style={su.cardLabel}>종합 평가</div>
        <div style={su.bodyText}>{overall_feedback}</div>
      </div>

      {/* 내용 피드백 */}
      {content_feedback && (
        <div style={su.card}>
          <div style={su.cardLabel}>내용 피드백</div>
          <div style={su.bodyText}>{content_feedback}</div>
        </div>
      )}

      {/* 개선 제안 */}
      {improvement_suggestions.length > 0 && (
        <div style={su.card}>
          <div style={su.cardLabel}>개선 제안</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {improvement_suggestions.map((s, i) => (
              <div key={i} style={su.suggestion}>
                <div style={su.suggNum}>{i + 1}</div>
                <span style={su.suggText}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 슬라이드별 요약 카드 그리드 */}
      {slide_feedbacks.length > 0 && (
        <div style={su.card}>
          <div style={su.cardLabel}>슬라이드별 요약</div>
          <div style={su.slideGrid}>
            {slide_feedbacks.map(f => {
              const sim    = Math.round((f.similarity_score ?? 0) * 100);
              const simC   = sim >= 70 ? 'var(--teal)' : sim >= 40 ? '#f5a623' : '#ff4d6d';
              const speed  = f.audio_summary?.speed_label ?? '—';
              const speedC = speed === '빠름' ? '#ff8c5a' : speed === '느림' ? '#7eb3ff' : 'var(--teal)';
              const fillerCount = f.audio_summary?.filler_count ?? 0;
              const fillerC = f.audio_summary?.filler_label === '많음' ? '#ff4d6d' : 'var(--teal)';
              return (
                <div key={f.slide_index} style={su.slideCard}>
                  <div style={su.slideCardNum}>SLIDE {f.slide_index}</div>
                  <div style={{ ...su.slideCardScore, color: simC }}>{sim}%</div>
                  <div style={su.slideCardTrack}>
                    <div style={{ ...su.slideCardBar, width: `${sim}%`, background: simC }} />
                  </div>
                  <div style={su.slideCardChips}>
                    <span style={{ ...su.slideChip, color: speedC, borderColor: speedC + '55', background: speedC + '15' }}>
                      {speed}{f.audio_summary?.wpm != null && ` · ${Math.round(f.audio_summary.wpm)}wpm`}
                    </span>
                    <span style={{ ...su.slideChip, color: fillerC, borderColor: fillerC + '55', background: fillerC + '15' }}>
                      필러 {fillerCount}회
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── 아이콘 ────────────────────────────────────────────────
function ChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
      <rect x="3" y="18" width="6" height="11" rx="1.5" fill="var(--gold)" opacity="0.7"/>
      <rect x="13" y="10" width="6" height="19" rx="1.5" fill="var(--gold)" opacity="0.85"/>
      <rect x="23" y="4"  width="6" height="25" rx="1.5" fill="var(--gold)"/>
    </svg>
  );
}

// ── 스타일 ────────────────────────────────────────────────
const s = {
  wrap:        { display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' },

  header:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                 padding: '0 28px', height: 56, borderBottom: '1px solid var(--border)',
                 background: 'rgba(8,10,14,0.92)', backdropFilter: 'blur(12px)',
                 flexShrink: 0, gap: 16 },
  headerLeft:  { display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 },
  logoText:    { fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: 2,
                 color: 'var(--text)', flexShrink: 0 },
  divider:     { width: 1, height: 16, background: 'var(--border2)', flexShrink: 0 },
  titleText:   { fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text2)',
                 overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  headerCenter:{ display: 'flex', alignItems: 'baseline', flexShrink: 0 },
  slideNum:    { fontSize: 20, fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--font-mono)' },
  slideTotal:  { fontSize: 13, color: 'var(--text2)', fontFamily: 'var(--font-mono)' },
  summaryBadge:{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--gold)',
                 background: 'var(--gold-glow)', padding: '4px 12px', borderRadius: 20,
                 border: '1px solid rgba(245,166,35,0.3)' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  exportBtn:   { background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.3)',
                 borderRadius: 8, padding: '6px 14px', color: 'var(--gold)', fontSize: 12,
                 fontFamily: 'var(--font-mono)', cursor: 'pointer', flexShrink: 0 },
  exportBtnDisabled: { opacity: 0.45, cursor: 'not-allowed' },
  backBtn:     { background: 'none', border: '1px solid var(--border2)', borderRadius: 8,
                 padding: '6px 14px', color: 'var(--text2)', fontSize: 12,
                 cursor: 'pointer', flexShrink: 0 },
  errorBanner: { background: 'rgba(255,80,80,0.08)', borderBottom: '1px solid rgba(255,80,80,0.2)',
                 padding: '8px 28px', color: '#ff6b6b', fontSize: 12,
                 fontFamily: 'var(--font-mono)', flexShrink: 0 },

  main:        { flex: 1, overflowY: 'auto', padding: '24px 28px' },

  slideContent:{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1100, margin: '0 auto' },
  slideFrame:  { width: '100%', borderRadius: 10, overflow: 'hidden',
                 boxShadow: '0 12px 48px rgba(0,0,0,0.6)' },
  slideImg:    { display: 'block', width: '100%', height: 'auto' },
  noFeedback:  { textAlign: 'center', color: 'var(--text3)', fontSize: 13,
                 fontFamily: 'var(--font-mono)', padding: '20px 0' },

  controlBar:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                 padding: '12px 28px', borderTop: '1px solid var(--border)',
                 background: 'rgba(8,10,14,0.96)', backdropFilter: 'blur(12px)',
                 flexShrink: 0, gap: 12 },
  navBtn:      { minWidth: 96, background: 'var(--surface2)', border: '1px solid var(--border2)',
                 borderRadius: 10, padding: '10px 20px', color: 'var(--text)',
                 fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  nextBtn:     { minWidth: 120, background: 'linear-gradient(135deg, var(--teal), #00a88d)',
                 color: '#000', border: 'none', borderRadius: 10,
                 padding: '10px 20px', fontSize: 14, fontWeight: 700,
                 cursor: 'pointer', boxShadow: '0 0 20px var(--teal-glow)' },
  disabled:    { opacity: 0.35, cursor: 'not-allowed' },

  dotRow:      { display: 'flex', gap: 6, alignItems: 'center', flex: 1, justifyContent: 'center',
                 flexWrap: 'wrap' },
  dot:         { width: 7, height: 7, borderRadius: '50%',
                 transition: 'background 0.2s, transform 0.2s' },
};

// 슬라이드 피드백 패널 스타일
const p = {
  panel:      { background: 'var(--surface)', border: '1px solid var(--border2)',
                borderRadius: 14, padding: '20px 24px' },
  panelTitle: { fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--gold)',
                letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 },
  grid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 },
  card:       { background: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '14px 16px' },
  cardLabel:  { fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text3)',
                letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  bigNum:     { fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)', lineHeight: 1 },
  subText:    { fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)' },
  barTrack:   { height: 4, background: 'var(--border)', borderRadius: 2, marginTop: 10,
                overflow: 'hidden' },
  barFill:    { height: '100%', borderRadius: 2, transition: 'width 0.8s ease' },
  badge:          { display: 'inline-block', marginTop: 8, padding: '3px 10px',
                    borderRadius: 20, fontSize: 11, fontFamily: 'var(--font-mono)' },
  bodyText:       { fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 },
  transcriptText: { fontSize: 13, color: 'var(--text)', lineHeight: 1.8,
                    whiteSpace: 'pre-wrap', fontFamily: 'var(--font-body)' },
  audioRow:       { display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', marginBottom: 14,
                    background: 'var(--surface2)', border: '1px solid var(--border)',
                    borderRadius: 10 },
  audioLabel:     { fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--gold)',
                    letterSpacing: 1.5, textTransform: 'uppercase', flexShrink: 0 },
};

// 종합 피드백 스타일
const su = {
  wrap:        { maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 },

  scoreCard:   { display: 'flex', alignItems: 'center', gap: 32, padding: '28px 32px',
                 background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16 },
  scoreLeft:   { display: 'flex', flexDirection: 'column', alignItems: 'center',
                 gap: 6, position: 'relative', flexShrink: 0 },
  scoreNum:    { position: 'absolute', top: '38px', left: '50%', transform: 'translateX(-50%)',
                 fontSize: 22, fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--font-mono)' },
  scoreLabel:  { fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)',
                 marginTop: 4, letterSpacing: 1 },
  scoreRight:  { flex: 1, display: 'flex', flexDirection: 'column', gap: 10 },
  statRow:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                 padding: '8px 12px', background: 'var(--surface2)',
                 borderRadius: 8, border: '1px solid var(--border)' },
  statKey:     { fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--font-mono)' },
  statVal:     { fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)' },

  card:        { background: 'var(--surface)', border: '1px solid var(--border2)',
                 borderRadius: 14, padding: '20px 24px' },
  cardLabel:   { fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text2)',
                 letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 },
  bodyText:    { fontSize: 14, color: 'var(--text)', lineHeight: 1.8 },

  suggestion:  { display: 'flex', alignItems: 'flex-start', gap: 12 },
  suggNum:     { width: 24, height: 24, borderRadius: 6, background: 'var(--gold-glow)',
                 border: '1px solid rgba(245,166,35,0.3)', display: 'flex',
                 alignItems: 'center', justifyContent: 'center',
                 fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--gold)', flexShrink: 0 },
  suggText:    { fontSize: 14, color: 'var(--text)', lineHeight: 1.6, paddingTop: 2 },

  slideGrid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                    gap: 10, marginTop: 4 },
  slideCard:      { background: 'var(--surface2)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: '12px 14px',
                    display: 'flex', flexDirection: 'column', gap: 6 },
  slideCardNum:   { fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text3)', letterSpacing: 1.5 },
  slideCardScore: { fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)', lineHeight: 1 },
  slideCardTrack: { height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' },
  slideCardBar:   { height: '100%', borderRadius: 2, transition: 'width 0.6s ease' },
  slideCardChips: { display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  slideChip:      { fontSize: 10, fontFamily: 'var(--font-mono)', padding: '2px 7px',
                    border: '1px solid', borderRadius: 10 },
};
