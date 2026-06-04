// src/pages/MainPage.jsx
// 뷰 전환: 'upload' → 'recording' → 'results'
// 분석 상태(useAnalysis)와 PDF 상태(usePDFLoader)는 App.jsx에서 관리됨

import React, { useState, useRef, useEffect } from 'react';
import { ANALYSIS_STATUS } from '../hooks/useAnalysis';
import PresentationRecorder from '../components/PresentationRecorder';
import FeedbackReviewer from '../components/FeedbackReviewer';
import { ErrorToast, ErrorModal } from '../components/ErrorToast';
import useCompactLayout from '../hooks/useCompactLayout';
import HelpModal, { shouldShowHelp } from '../components/HelpModal';

export default function MainPage({
  onLogout, onMyPage,
  pdfLoader, analysis, transcripts,
  slideBlobs, onBlobsReady,
  mainView, setMainView, onReset,
}) {
  const [showModal, setShowModal]   = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showHelp, setShowHelp]     = useState(false);
  const fileInputRef = useRef();
  const compact = useCompactLayout();

  useEffect(() => {
    if (shouldShowHelp()) setShowHelp(true);
  }, []);

  const {
    slides, title: pdfTitle, pptFile,
    loading: pdfLoading, error: pdfError,
    loadPDF,
  } = pdfLoader;

  const {
    status, progress, progressLabel,
    result, error: analysisError,
    runAnalysis,
  } = analysis;

  const isAnalyzing = [
    ANALYSIS_STATUS.UPLOADING,
    ANALYSIS_STATUS.TRANSCRIBING,
    ANALYSIS_STATUS.GENERATING,
  ].includes(status);

  const error = pdfError || analysisError;

  const handleFile = async (file) => {
    if (!file) return;
    try {
      await loadPDF(file);
    } catch {
      setShowModal(true);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  // 녹음 완료 → 즉시 upload 뷰로 전환 후 분석을 백그라운드 실행
  const handleRecordingComplete = ({ slideBlobs: blobs }) => {
    onBlobsReady(blobs);
    setMainView('upload');
    runAnalysis(blobs.filter(Boolean), pdfTitle, pptFile)
      .catch(() => setShowModal(true));
  };

  const handleReset = () => {
    onReset(); // App의 handleReset이 setSlideBlobs([]) 포함
    setShowModal(false);
  };

  // ── 녹음 화면 ──────────────────────────────────────────────
  if (mainView === 'recording') {
    return (
      <>
        <ErrorToast message={error} onClose={() => {}} />
        {showModal && error && (
          <ErrorModal
            message={error}
            onClose={() => setShowModal(false)}
            onReset={handleReset}
          />
        )}
        <PresentationRecorder
          slides={slides}
          title={pdfTitle}
          onComplete={handleRecordingComplete}
          onCancel={handleReset}
        />
      </>
    );
  }

  // ── 결과 화면 ──────────────────────────────────────────────
  if (mainView === 'results' && result && slides.length > 0) {
    return (
      <FeedbackReviewer
        slides={slides}
        result={result}
        title={pdfTitle}
        transcripts={transcripts}
        slideBlobs={slideBlobs}
        onBack={handleReset}
      />
    );
  }

  // ── 업로드 화면 ────────────────────────────────────────────
  return (
    <div style={l.app}>
      <Header
        pdfTitle={slides.length > 0 ? pdfTitle : ''}
        totalSlides={slides.length}
        onReset={slides.length > 0 && !isAnalyzing ? handleReset : null}
        onMyPage={onMyPage}
        onLogout={onLogout}
        onHelp={() => setShowHelp(true)}
        compact={compact}
      />

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {/* 분석 진행 배너 (비차단 — 마이페이지 이동 가능) */}
      {isAnalyzing && (
        <div style={l.analysisBanner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={l.bannerSpinner} />
            <span style={l.bannerLabel}>{progressLabel || 'AI 피드백 생성 중...'}</span>
            <span style={l.bannerPct}>{progress}%</span>
            <button style={l.bannerMyPage} onClick={onMyPage}>
              마이페이지로 →
            </button>
          </div>
          <div style={l.bannerTrack}>
            <div style={{ ...l.bannerFill, width: `${progress}%` }} />
          </div>
        </div>
      )}

      <ErrorToast message={error} onClose={() => {}} />
      {showModal && error && (
        <ErrorModal
          message={error}
          onClose={() => setShowModal(false)}
          onReset={handleReset}
        />
      )}

      <main style={{ ...l.main, ...(compact ? l.mainCompact : {}) }}>
        <div style={{ animation: 'fadeUp 0.5s ease' }}>

          <StepWizard current={slides.length > 0 ? 1 : 0} />

          {slides.length > 0 ? (
            <>
              <div style={l.fileCard}>
                <SlideIcon />
                <div style={l.fileInfo}>
                  <div style={l.fileName}>{pdfTitle}</div>
                  <div style={l.fileMeta}>{slides.length}페이지 · 파싱 완료</div>
                </div>
                <button style={l.changeBtn} onClick={() => fileInputRef.current.click()}>변경</button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.ppt,.pptx"
                  style={{ display: 'none' }}
                  onChange={e => e.target.files[0] && handleFile(e.target.files[0])}
                />
              </div>
              <div style={l.thumbGrid}>
                {slides.map((slide, i) => (
                  <div key={i} style={l.thumbItem}>
                    <img src={slide.imageUrl} alt={`슬라이드 ${i + 1}`} style={l.thumbImg} />
                    <span style={l.thumbNum}>{i + 1}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div
              style={{
                ...l.dropZone,
                ...(pdfLoading ? l.dropZoneLoading : {}),
                ...(isDragOver ? l.dropZoneActive : {}),
              }}
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onClick={() => fileInputRef.current.click()}
            >
              {pdfLoading ? (
                <>
                  <Spinner />
                  <div style={l.dropText}>파일 변환 중...</div>
                  <div style={l.dropSub}>잠시만 기다려주세요...</div>
                </>
              ) : (
                <>
                  <UploadIcon active={isDragOver} />
                  <div style={l.dropText}>
                    {isDragOver ? '여기에 놓으세요' : '발표 파일을 드래그하거나 클릭하여 업로드'}
                  </div>
                  <div style={l.dropSub}>.pdf · .pptx · .ppt 지원</div>
                  <div style={l.badge}>STEP 01</div>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.ppt,.pptx"
                style={{ display: 'none' }}
                onChange={e => e.target.files[0] && handleFile(e.target.files[0])}
              />
            </div>
          )}
        </div>
      </main>

      {/* 하단 발표 시작 바 */}
      {slides.length > 0 && (
        <div style={l.bottomBar}>
          <div style={l.bottomInner}>
            <div style={l.bottomStatus}>
              {isAnalyzing ? (
                <>
                  <div style={{ ...l.readyDot, background: 'var(--gold)', boxShadow: '0 0 8px var(--gold)' }} />
                  <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                    AI 피드백 생성 중... {progress}%
                  </span>
                </>
              ) : (
                <>
                  <div style={l.readyDot} />
                  <span style={{ color: 'var(--teal)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                    발표 준비 완료 · {slides.length}페이지
                  </span>
                </>
              )}
            </div>
            <button
              style={{
                ...l.startBtn,
                ...(isAnalyzing ? l.startBtnDisabled : {}),
              }}
              onClick={() => !isAnalyzing && setMainView('recording')}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? '분석 중...' : '발표 시작 →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 공통 헤더 ─────────────────────────────────────────────
function Header({ pdfTitle, totalSlides, onReset, onMyPage, onLogout, onHelp, compact }) {
  return (
    <header style={{ ...l.header, ...(compact ? l.headerCompact : {}) }}>
      <div style={{ ...l.headerLeft, ...(compact ? l.headerLeftCompact : {}) }}>
        <div style={l.headerLogo}>
          <MicIcon />
          <span style={{ ...l.headerLogoText, ...(compact ? l.headerLogoTextCompact : {}) }}>
            PITCH<span style={{ color: 'var(--gold)' }}>LENS</span>
          </span>
        </div>
        {pdfTitle && !compact && (
          <div style={l.headerMeta}>
            <span style={l.metaDot} />
            <span style={l.metaText}>{pdfTitle}</span>
            <span style={l.metaDivider}>·</span>
            <span style={l.metaText}>{totalSlides}페이지</span>
          </div>
        )}
      </div>
      <div style={{ ...l.headerRight, ...(compact ? l.headerRightCompact : {}) }}>
        {onReset && (
          <button style={{ ...l.btnOutline, ...(compact ? l.btnOutlineCompact : {}) }} onClick={onReset}>
            {compact ? '처음부터' : '↺ 처음부터'}
          </button>
        )}
        {onMyPage && (
          <button style={{ ...l.btnOutline, ...(compact ? l.btnOutlineCompact : {}) }} onClick={onMyPage}>
            마이페이지
          </button>
        )}
        <button style={{ ...l.btnOutline, ...(compact ? l.btnOutlineCompact : {}), ...l.helpBtn }} onClick={onHelp} title="사용 가이드">
          ?
        </button>
        <button style={{ ...l.btnOutline, ...(compact ? l.btnOutlineCompact : {}) }} onClick={onLogout}>
          로그아웃
        </button>
      </div>
    </header>
  );
}

// ── 아이콘 ────────────────────────────────────────────────
function MicIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
      <rect x="11" y="2" width="10" height="16" rx="5" fill="var(--gold)" opacity="0.9"/>
      <path d="M6 16a10 10 0 0020 0" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <line x1="16" y1="26" x2="16" y2="30" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="11" y1="30" x2="21" y2="30" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

function SlideIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 44 44" fill="none">
      <rect x="4" y="6" width="36" height="26" rx="3" fill="var(--surface3)" stroke="var(--gold)" strokeWidth="1.5"/>
      <rect x="10" y="12" width="14" height="2" rx="1" fill="var(--gold)" opacity="0.8"/>
      <rect x="10" y="17" width="20" height="1.5" rx="0.75" fill="var(--text3)"/>
      <rect x="10" y="21" width="16" height="1.5" rx="0.75" fill="var(--text3)"/>
    </svg>
  );
}

function StepWizard({ current }) {
  const steps = ['파일 업로드', '발표 녹음', 'AI 분석'];
  return (
    <div style={w.wrap}>
      {steps.map((label, i) => (
        <React.Fragment key={i}>
          <div style={w.step}>
            <div style={{
              ...w.num,
              background: i < current ? 'var(--teal)' : i === current ? 'var(--gold)' : 'var(--surface2)',
              color: i <= current ? '#000' : 'var(--text3)',
              border: i === current
                ? '2px solid var(--gold)'
                : i < current
                ? '2px solid var(--teal)'
                : '2px solid var(--border2)',
              boxShadow: i === current ? '0 0 16px rgba(245,166,35,0.25)' : 'none',
            }}>
              {i < current ? '✓' : i + 1}
            </div>
            <span style={{
              ...w.label,
              color: i === current ? 'var(--text)' : i < current ? 'var(--teal)' : 'var(--text3)',
              fontWeight: i === current ? 600 : 400,
            }}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ ...w.line, background: i < current ? 'var(--teal)' : 'var(--border)' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function UploadIcon({ active }) {
  return (
    <svg width="48" height="48" viewBox="0 0 40 40" fill="none">
      <rect x="4" y="4" width="32" height="32" rx="8"
        fill={active ? 'rgba(245,166,35,0.08)' : 'var(--surface2)'}
        stroke={active ? 'var(--gold)' : 'var(--border2)'} strokeWidth="1.5"/>
      <path d="M20 26V14M20 14l-5 5M20 14l5 5"
        stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="30" x2="28" y2="30"
        stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" opacity={active ? 0.8 : 0.4}/>
    </svg>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      border: '3px solid var(--border2)',
      borderTopColor: 'var(--gold)',
      animation: 'spin 0.8s linear infinite',
    }} />
  );
}

// ── 스타일 ────────────────────────────────────────────────
const l = {
  app:            { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  header:         { display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 32px', height: 64, borderBottom: '1px solid var(--border)',
                    background: 'rgba(8,10,14,0.85)', backdropFilter: 'blur(12px)',
                    position: 'sticky', top: 0, zIndex: 50 },
  headerCompact:  { height: 76, minHeight: 76, alignItems: 'center',
                    flexDirection: 'row', gap: 10, padding: '0 18px' },
  headerLeft:     { display: 'flex', alignItems: 'center', gap: 20 },
  headerLeftCompact: { flex: 1, minWidth: 0, justifyContent: 'flex-start', gap: 10 },
  headerLogo:     { display: 'flex', alignItems: 'center', gap: 10 },
  headerLogoText: { fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: 3, color: 'var(--text)' },
  headerLogoTextCompact: { fontSize: 18, letterSpacing: 2 },
  headerMeta:     { display: 'flex', alignItems: 'center', gap: 8 },
  metaDot:        { width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', boxShadow: '0 0 6px var(--gold)' },
  metaText:       { fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text2)' },
  metaDivider:    { color: 'var(--text3)' },
  headerRight:    { display: 'flex', gap: 10 },
  headerRightCompact: { display: 'flex', gap: 6, flexShrink: 0 },
  btnOutline:     { background: 'none', border: '1px solid var(--border2)', borderRadius: 8,
                    padding: '7px 16px', color: 'var(--text2)', fontSize: 12,
                    fontFamily: 'var(--font-mono)', cursor: 'pointer' },
  btnOutlineCompact: { minHeight: 36, padding: '7px 9px', fontSize: 11, whiteSpace: 'nowrap' },
  helpBtn:        { width: 32, height: 32, padding: 0, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 14 },

  // 분석 진행 배너
  analysisBanner: { background: 'rgba(245,166,35,0.06)', borderBottom: '1px solid rgba(245,166,35,0.2)',
                    padding: '10px 24px 12px' },
  bannerSpinner:  { width: 14, height: 14, borderRadius: '50%',
                    border: '2px solid var(--border2)', borderTopColor: 'var(--gold)',
                    animation: 'spin 0.8s linear infinite', flexShrink: 0 },
  bannerLabel:    { fontSize: 13, color: 'var(--text2)', fontFamily: 'var(--font-mono)', flex: 1 },
  bannerPct:      { fontSize: 12, color: 'var(--gold)', fontFamily: 'var(--font-mono)' },
  bannerMyPage:   { background: 'none', border: '1px solid rgba(245,166,35,0.4)', borderRadius: 6,
                    padding: '4px 10px', color: 'var(--gold)', fontSize: 11,
                    fontFamily: 'var(--font-mono)', cursor: 'pointer' },
  bannerTrack:    { height: 2, background: 'var(--border)', borderRadius: 1, marginTop: 8 },
  bannerFill:     { height: '100%', borderRadius: 1,
                    background: 'linear-gradient(90deg, var(--gold), var(--teal))',
                    transition: 'width 0.5s ease' },

  main:           { flex: 1, maxWidth: 900, margin: '0 auto', padding: '40px 24px 120px', width: '100%' },
  mainCompact:    { padding: '24px 16px 120px' },

  dropZone:       { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
                    padding: '72px 32px', background: 'var(--surface)',
                    border: '1.5px dashed var(--border2)', borderRadius: 16,
                    cursor: 'pointer', textAlign: 'center',
                    transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s' },
  dropZoneLoading:{ cursor: 'default', pointerEvents: 'none' },
  dropZoneActive: { borderColor: 'var(--gold)', background: 'rgba(245,166,35,0.04)',
                    boxShadow: '0 0 0 3px rgba(245,166,35,0.10), inset 0 0 40px rgba(245,166,35,0.03)' },
  dropText:       { fontSize: 15, fontWeight: 600, color: 'var(--text)' },
  dropSub:        { fontSize: 13, color: 'var(--text2)' },
  badge:          { marginTop: 4, padding: '4px 12px', background: 'var(--gold-glow)',
                    border: '1px solid rgba(245,166,35,0.3)', borderRadius: 20,
                    fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--gold)', letterSpacing: 2 },

  fileCard:       { display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px',
                    background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 14 },
  fileInfo:       { flex: 1 },
  fileName:       { fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4 },
  fileMeta:       { fontSize: 12, color: 'var(--teal)', fontFamily: 'var(--font-mono)' },
  changeBtn:      { background: 'none', border: '1px solid var(--border2)', borderRadius: 8,
                    padding: '6px 14px', color: 'var(--text2)', fontSize: 12,
                    cursor: 'pointer', fontFamily: 'var(--font-mono)' },

  thumbGrid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))',
                    gap: 8, marginTop: 14 },
  thumbItem:      { position: 'relative', borderRadius: 8, overflow: 'hidden',
                    border: '1px solid var(--border2)', aspectRatio: '16/9' },
  thumbImg:       { display: 'block', width: '100%', height: '100%', objectFit: 'cover' },
  thumbNum:       { position: 'absolute', bottom: 5, right: 7,
                    fontSize: 10, fontFamily: 'var(--font-mono)',
                    color: 'rgba(255,255,255,0.75)', background: 'rgba(0,0,0,0.55)',
                    padding: '1px 5px', borderRadius: 4 },

  bottomBar:      { position: 'fixed', bottom: 0, left: 0, right: 0,
                    background: 'rgba(8,10,14,0.95)', backdropFilter: 'blur(16px)',
                    borderTop: '1px solid var(--border2)', zIndex: 60, padding: '14px 32px' },
  bottomInner:    { maxWidth: 900, margin: '0 auto', display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  bottomStatus:   { display: 'flex', alignItems: 'center', gap: 10 },
  readyDot:       { width: 8, height: 8, borderRadius: '50%', background: 'var(--teal)',
                    boxShadow: '0 0 8px var(--teal)' },
  startBtn:       { background: 'linear-gradient(135deg, var(--gold), var(--gold2))',
                    color: '#000', border: 'none', borderRadius: 10,
                    padding: '12px 32px', fontSize: 14, fontWeight: 700,
                    letterSpacing: 1, cursor: 'pointer', fontFamily: 'var(--font-body)',
                    boxShadow: '0 0 24px var(--gold-glow)' },
  startBtnDisabled: { background: 'var(--surface2)', color: 'var(--text3)',
                      boxShadow: 'none', cursor: 'not-allowed' },
};

const w = {
  wrap:  { display: 'flex', alignItems: 'center', marginBottom: 32 },
  step:  { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 100 },
  num:   { width: 36, height: 36, borderRadius: '50%',
           display: 'flex', alignItems: 'center', justifyContent: 'center',
           fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-mono)',
           transition: 'all 0.3s' },
  label: { fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: 0.5,
           textAlign: 'center', transition: 'color 0.3s' },
  line:  { flex: 1, height: 1, marginBottom: 24, transition: 'background 0.3s' },
};
