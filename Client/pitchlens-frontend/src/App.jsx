// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import './styles/global.css';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MainPage from './pages/MainPage';
import MyPage from './pages/MyPage';
import { isLoggedIn, removeToken, getPresentationDetail } from './utils/api';
import { usePDFLoader } from './hooks/usePDFLoader';
import { useAnalysis, ANALYSIS_STATUS } from './hooks/useAnalysis';

export default function App() {
  const [loggedIn, setLoggedIn]           = useState(isLoggedIn());
  const [showRegister, setShowRegister]   = useState(false);
  const [page, setPage]                   = useState('main'); // 'main' | 'mypage'
  const [mainView, setMainView]           = useState('upload'); // 'upload' | 'recording' | 'results'
  const [transcripts, setTranscripts]     = useState({});
  const [feedbackReady, setFeedbackReady] = useState(false);
  const [slideBlobs, setSlideBlobs]       = useState([]);

  const pdfLoader = usePDFLoader();
  const analysis  = useAnalysis();

  const { reset: resetPdf }      = pdfLoader;
  const { reset: resetAnalysis } = analysis;

  // 분석 완료 → 결과 뷰 전환 + 트랜스크립트 fetch
  useEffect(() => {
    if (analysis.status !== ANALYSIS_STATUS.DONE) return;
    setMainView('results');
    setFeedbackReady(true); // 마이페이지에 있을 경우 토스트 표시
    if (!analysis.presentationId) return;
    getPresentationDetail(analysis.presentationId)
      .then(detail => {
        const map = {};
        (detail.slides || []).forEach(s => {
          if (s.transcriptText) map[s.slideIndex] = s.transcriptText;
        });
        setTranscripts(map);
      })
      .catch(() => {});
  }, [analysis.status, analysis.presentationId]); // eslint-disable-line

  const handleReset = useCallback(() => {
    resetPdf();
    resetAnalysis();
    setMainView('upload');
    setTranscripts({});
    setFeedbackReady(false);
    setSlideBlobs([]);
  }, [resetPdf, resetAnalysis]);

  const handleLogout = () => {
    removeToken();
    setLoggedIn(false);
    setShowRegister(false);
    setPage('main');
    handleReset();
  };

  if (!loggedIn) {
    if (showRegister) {
      return (
        <RegisterPage
          onSuccess={() => setShowRegister(false)}
          onBack={() => setShowRegister(false)}
        />
      );
    }
    return (
      <LoginPage
        onSuccess={() => setLoggedIn(true)}
        onRegister={() => setShowRegister(true)}
      />
    );
  }

  const isAnalyzing = [
    ANALYSIS_STATUS.UPLOADING,
    ANALYSIS_STATUS.TRANSCRIBING,
    ANALYSIS_STATUS.GENERATING,
  ].includes(analysis.status);

  return (
    <>
      {/* 피드백 완료 알림 토스트 (마이페이지에서만 표시) */}
      {feedbackReady && page === 'mypage' && (
        <FeedbackReadyToast
          onView={() => { setPage('main'); setFeedbackReady(false); }}
          onDismiss={() => setFeedbackReady(false)}
        />
      )}

      {page === 'mypage'
        ? <MyPage
            onBack={() => setPage('main')}
            onLogout={handleLogout}
            isAnalyzing={isAnalyzing}
            progress={analysis.progress}
            progressLabel={analysis.progressLabel}
          />
        : <MainPage
            onLogout={handleLogout}
            onMyPage={() => setPage('mypage')}
            pdfLoader={pdfLoader}
            analysis={analysis}
            transcripts={transcripts}
            slideBlobs={slideBlobs}
            onBlobsReady={setSlideBlobs}
            mainView={mainView}
            setMainView={setMainView}
            onReset={handleReset}
          />
      }
    </>
  );
}

// 피드백 완료 토스트 알림
function FeedbackReadyToast({ onView, onDismiss }) {
  return (
    <div style={{
      position: 'fixed', bottom: 32, right: 24, zIndex: 9000,
      background: 'var(--surface)',
      border: '1px solid rgba(32,201,151,0.5)',
      borderRadius: 14, padding: '18px 20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(32,201,151,0.08)',
      display: 'flex', flexDirection: 'column', gap: 14,
      maxWidth: 280,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'rgba(32,201,151,0.15)',
          border: '1px solid rgba(32,201,151,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, color: 'var(--teal)', flexShrink: 0,
        }}>✓</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
            피드백 완료!
          </div>
          <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>
            AI 발표 분석이 완료되었습니다.
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onView}
          style={{
            flex: 1,
            background: 'linear-gradient(135deg, var(--teal), #00a88d)',
            border: 'none', borderRadius: 8,
            padding: '9px 12px',
            color: '#000', fontSize: 13, fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          피드백 보기
        </button>
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: '1px solid var(--border2)',
            borderRadius: 8, padding: '9px 12px',
            color: 'var(--text2)', fontSize: 13,
            cursor: 'pointer',
          }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}
