// src/pages/MyPage.jsx
// 마이페이지: 프로필 + 발표 이력 + 상세 피드백 조회

import { useState, useEffect } from 'react';
import {
  getUserName, getUserEmail,
  getMyInfo, getMyPresentations, getPresentationDetail, deletePresentationById,
  deleteMyAccount, removeToken,
} from '../utils/api';
import useCompactLayout from '../hooks/useCompactLayout';
import { useSlideImagesFromUrl } from '../hooks/useSlideImagesFromUrl';
import AudioPlayer from '../components/AudioPlayer';
import { exportFeedbackToPdf } from '../utils/feedbackPdfExport';

export default function MyPage({ onBack, onLogout, isAnalyzing, progress, progressLabel }) {
  const [view, setView]           = useState('list');
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [detail, setDetail]       = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [name, setName]           = useState(getUserName());
  const [email, setEmail]         = useState(getUserEmail());
  const [withdrawing, setWithdrawing]     = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal]     = useState(false);
  const [pendingDeleteId, setPendingDeleteId]     = useState(null);
  const compact = useCompactLayout();

  useEffect(() => {
    (async () => {
      // name이 없으면 서버에서 조회해서 localStorage 갱신
      if (!getUserName()) {
        try {
          const info = await getMyInfo();
          if (info.name)  { localStorage.setItem('pitchlens_name',  info.name);  setName(info.name); }
          if (info.email) { localStorage.setItem('pitchlens_email', info.email); setEmail(info.email); }
        } catch { /* 백엔드 미지원 시 무시 */ }
      }

      try {
        const list = await getMyPresentations();
        setItems([...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openDetail = async (p) => {
    setDetailLoading(true);
    setDetail(null);
    setView('detail');
    try {
      const d = await getPresentationDetail(p.presentationId);
      setDetail(d);
    } catch (e) {
      setError(e.message);
      setView('list');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      await deleteMyAccount();
      removeToken();
      onLogout();
    } catch (e) {
      setError(e.message);
      setWithdrawing(false);
      setShowWithdrawModal(false);
    }
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    setPendingDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setDeletingId(pendingDeleteId);
    setShowDeleteModal(false);
    try {
      await deletePresentationById(pendingDeleteId);
      setItems(prev => prev.filter(p => p.presentationId !== pendingDeleteId));
    } catch (e) {
      setError(e.message);
    } finally {
      setDeletingId(null);
      setPendingDeleteId(null);
    }
  };

  if (view === 'detail') {
    return (
      <DetailView
        detail={detail}
        loading={detailLoading}
        onBack={() => { setView('list'); setDetail(null); }}
        onLogout={onLogout}
      />
    );
  }

  return (
    <div style={{ ...l.app, ...(compact ? l.appCompact : {}) }}>
      <PageHeader label="마이페이지" onBack={onBack} onLogout={onLogout} />

      {/* 분석 진행 배너 — 헤더 아래 일반 흐름으로 배치 */}
      {isAnalyzing && (
        <div style={l.analysisBanner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={l.bannerSpinner} />
            <span style={l.bannerLabel}>{progressLabel || 'AI 피드백 생성 중...'}</span>
            <span style={l.bannerPct}>{progress}%</span>
          </div>
          <div style={l.bannerTrack}>
            <div style={{ ...l.bannerFill, width: `${progress}%` }} />
          </div>
        </div>
      )}

      <main style={{ ...l.main, ...(compact ? l.mainCompact : {}) }}>
        {/* 프로필 */}
        <div style={{ ...l.profileCard, ...(compact ? l.profileCardCompact : {}) }}>
          <div style={{ ...l.avatar, ...(compact ? l.avatarCompact : {}) }}>{name ? name[0].toUpperCase() : 'U'}</div>
          <div style={l.profileInfo}>
            <div style={{ ...l.profileName, ...(compact ? l.profileNameCompact : {}) }}>{name || '사용자'}</div>
            <div style={{ ...l.profileEmail, ...(compact ? l.profileEmailCompact : {}) }}>{email}</div>
          </div>
          <button style={{ ...l.btnWithdraw, ...(compact ? l.btnWithdrawCompact : {}) }} onClick={() => setShowWithdrawModal(true)}>
            회원 탈퇴
          </button>
        </div>

        {/* 회원 탈퇴 확인 모달 */}
        {showWithdrawModal && (
          <div style={l.modalOverlay}>
            <div style={l.modalBox}>
              <div style={l.modalTitle}>회원 탈퇴</div>
              <div style={l.modalBody}>
                탈퇴하면 모든 발표 기록과 피드백이 영구 삭제됩니다.<br />
                정말로 탈퇴하시겠습니까?
              </div>
              <div style={l.modalActions}>
                <button
                  style={l.btnModalCancel}
                  onClick={() => setShowWithdrawModal(false)}
                  disabled={withdrawing}
                >
                  취소
                </button>
                <button
                  style={l.btnModalConfirm}
                  onClick={handleWithdraw}
                  disabled={withdrawing}
                >
                  {withdrawing ? '처리 중...' : '탈퇴 확인'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 발표 삭제 확인 모달 */}
        {showDeleteModal && (
          <div style={l.modalOverlay}>
            <div style={l.modalBox}>
              <div style={l.modalTitle}>발표 기록 삭제</div>
              <div style={l.modalBody}>
                이 발표 기록과 피드백이 영구 삭제됩니다.<br />
                정말로 삭제하시겠습니까?
              </div>
              <div style={l.modalActions}>
                <button
                  style={l.btnModalCancel}
                  onClick={() => { setShowDeleteModal(false); setPendingDeleteId(null); }}
                >
                  취소
                </button>
                <button style={l.btnModalConfirm} onClick={confirmDelete}>
                  삭제 확인
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 통계 카드 */}
        {!loading && items.length > 0 && (
          <div style={{ ...l.statsRow, ...(compact ? l.statsRowCompact : {}) }}>
            <StatCard
              label="총 발표"
              value={items.length}
              unit="회"
              color="var(--gold)"
              compact={compact}
            />
            <StatCard
              label="피드백 완료"
              value={items.filter(p => p.feedbackContent != null).length}
              unit="회"
              color="var(--teal)"
              compact={compact}
            />
            <StatCard
              label="최근 발표"
              value={compact ? fmtShortDate(items[0]?.createdAt) : fmtDate(items[0]?.createdAt)}
              unit=""
              color="var(--text2)"
              compact={compact}
              wide={compact}
            />
          </div>
        )}

        {/* 이력 헤더 */}
        <div style={{ ...l.sectionRow, ...(compact ? l.sectionRowCompact : {}) }}>
          <span style={l.sectionLabel}>발표 이력</span>
          {!loading && <span style={l.sectionCount}>{items.length}개</span>}
        </div>

        {error && <div style={l.errorBox}>{error}</div>}

        {loading && (
          <div style={l.list}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ ...l.card, cursor: 'default', pointerEvents: 'none' }}>
                <div style={l.cardLeft}>
                  <div style={{ ...l.skelLine, width: `${50 + i * 18}%` }} />
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <div style={{ ...l.skelLine, width: 72, height: 10 }} />
                    <div style={{ ...l.skelLine, width: 56, height: 10 }} />
                  </div>
                </div>
                <div style={l.cardActions}>
                  <div style={{ ...l.skelLine, width: 72, height: 30, borderRadius: 8 }} />
                  <div style={{ ...l.skelLine, width: 48, height: 30, borderRadius: 8 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && items.length === 0 && !error && (
          <div style={l.emptyBox}>
            <div style={l.emptyText}>아직 발표 기록이 없습니다.</div>
            <div style={l.emptySub}>새 발표를 시작해 보세요!</div>
          </div>
        )}

        <div style={l.list}>
          {items.map(p => (
            <div key={p.presentationId} style={{ ...l.card, ...(compact ? l.cardCompact : {}) }} onClick={() => openDetail(p)}>
              <div style={l.cardLeft}>
                <div style={{ ...l.cardTitle, ...(compact ? l.cardTitleCompact : {}) }}>{p.title}</div>
                <div style={{ ...l.cardMeta, ...(compact ? l.cardMetaCompact : {}) }}>
                  <span style={l.cardDate}>{fmtDateTime(p.createdAt)}</span>
                  {p.feedbackContent != null
                    ? <span style={l.badgeDone}>피드백 완료</span>
                    : <span style={l.badgePending}>분석 중</span>
                  }
                </div>
              </div>
              <div style={{ ...l.cardActions, ...(compact ? l.cardActionsCompact : {}) }}>
                <button
                  style={{ ...l.btnDetail, ...(compact ? l.btnActionCompact : {}) }}
                  onClick={(e) => { e.stopPropagation(); openDetail(p); }}
                >상세보기</button>
                <button
                  style={{ ...l.btnDelete, ...(compact ? l.btnActionCompact : {}) }}
                  onClick={(e) => handleDelete(p.presentationId, e)}
                  disabled={deletingId === p.presentationId}
                >
                  {deletingId === p.presentationId ? '...' : '삭제'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// ── 상세 보기 ─────────────────────────────────────────────
function DetailView({ detail, loading, onBack, onLogout }) {
  const compact = useCompactLayout();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSummary, setShowSummary]   = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportError, setExportError] = useState('');

  const fr = detail?.feedbackResult;

  // detail.slides가 비어있으면 feedbackResult.slideFeedbacks(camelCase) 또는
  // slide_feedbacks(snake_case) 에서 슬라이드 데이터를 보완한다
  const rawSlides = detail?.slides ?? [];
  const sfList    = fr?.slideFeedbacks ?? fr?.slide_feedbacks ?? [];
  const slides    = rawSlides.length > 0
    ? rawSlides
    : sfList.map(sf => ({
        slideIndex:     sf.slideIndex     ?? sf.slide_index,
        similarityScore: sf.similarityScore ?? sf.similarity_score,
        speedLabel:     sf.audioSummary?.speedLabel  ?? sf.audio_summary?.speed_label,
        wpm:            sf.audioSummary?.wpm          ?? sf.audio_summary?.wpm,
        fillerCount:    sf.audioSummary?.fillerCount  ?? sf.audio_summary?.filler_count,
        fillerRatio:    sf.audioSummary?.fillerRatio  ?? sf.audio_summary?.filler_ratio,
        fillerLabel:    sf.audioSummary?.fillerLabel  ?? sf.audio_summary?.filler_label,
        visualFeedback: sf.visualFeedback ?? sf.visual_feedback,
        transcriptText: null,
      }));

  // pptUrl 에서 슬라이드 이미지 로드 (PDF 로컬 렌더 / PPT·PPTX 미리보기 API)
  const { images: slideImages, loading: imagesLoading } = useSlideImagesFromUrl(detail?.pptUrl ?? null);

  const totalSlides = slides.length;
  const isFirst     = currentSlide === 0 && !showSummary;
  const isLast      = currentSlide === totalSlides - 1;
  const canExportPdf = !!fr && slides.length > 0 && !exportingPdf;

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

  const handleExportPdf = () => {
    setExportError('');
    setExportingPdf(true);
    try {
      exportFeedbackToPdf({ detail, slides, slideImages });
    } catch (e) {
      setExportError(e.message);
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div style={{ ...l.app, ...(compact ? l.appCompact : {}) }}>
      <PageHeader
        label={detail?.title || '발표 상세'}
        onBack={onBack}
        onLogout={onLogout}
      />

      <main style={{ ...l.main, ...(compact ? l.mainCompact : {}), paddingBottom: 100 }}>
        {loading && (
          <div style={l.centerMsg}>
            <Spinner />
            <span style={{ color: 'var(--text2)', fontSize: 13 }}>불러오는 중...</span>
          </div>
        )}

        {!loading && detail && (
          <>
            <div style={{ ...l.detailTopRow, ...(compact ? l.detailTopRowCompact : {}) }}>
              <span style={l.detailDate}>{fmtDate(detail.createdAt)}</span>
              <div style={{ ...l.detailActions, ...(compact ? l.detailActionsCompact : {}) }}>
                {fr && (
                  <button
                    type="button"
                    style={{
                      ...l.downloadLink,
                      ...l.pdfExportButton,
                      ...(!canExportPdf ? l.downloadDisabled : {}),
                    }}
                    onClick={handleExportPdf}
                    disabled={!canExportPdf}
                  >
                    {exportingPdf ? 'PDF 준비 중...' : '피드백 PDF 내보내기 ↓'}
                  </button>
                )}
                {detail.pptUrl && (
                  <a href={detail.pptUrl} target="_blank" rel="noreferrer" style={l.downloadLink}>
                    PPT 다운로드 ↓
                  </a>
                )}
              </div>
            </div>

            {exportError && <div style={l.errorBox}>{exportError}</div>}

            {/* 슬라이드 이미지 로딩 표시 */}
            {imagesLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
                            fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                <Spinner />
                슬라이드 이미지 불러오는 중...
              </div>
            )}

            {showSummary
              ? <SummarySection fr={fr} slides={slides} />
              : slides.length > 0
                ? <SlideCard
                    slide={slides[currentSlide]}
                    imageUrl={slideImages[currentSlide] ?? null}
                  />
                : <div style={l.pendingCard}>AI 분석이 아직 완료되지 않았습니다.</div>
            }
          </>
        )}
      </main>

      {/* FeedbackReviewer 와 동일한 하단 네비게이션 바 */}
      {!loading && detail && slides.length > 0 && (
        <div style={l.controlBar}>
          <button
            style={{ ...l.navBtn, ...(isFirst ? l.navDisabled : {}) }}
            disabled={isFirst}
            onClick={handlePrev}
          >
            ← {showSummary ? '슬라이드로' : '이전'}
          </button>

          {!showSummary && (
            <div style={l.dotRow}>
              {slides.map((_, i) => (
                <div
                  key={i}
                  style={{
                    ...l.dot,
                    background: i === currentSlide
                      ? 'var(--gold)'
                      : i < currentSlide ? 'var(--teal)' : 'var(--border2)',
                    transform: i === currentSlide ? 'scale(1.4)' : 'scale(1)',
                  }}
                  onClick={() => setCurrentSlide(i)}
                />
              ))}
            </div>
          )}
          {showSummary && <div style={{ flex: 1 }} />}

          {showSummary
            ? <div style={{ minWidth: 96 }} />
            : <button style={l.nextBtn} onClick={handleNext}>
                {isLast ? '종합 피드백 →' : '다음 →'}
              </button>
          }
        </div>
      )}
    </div>
  );
}

// ── 종합 피드백 섹션 ──────────────────────────────────────
function SummarySection({ fr, slides }) {
  if (!fr) return <div style={l.pendingCard}>AI 분석이 아직 완료되지 않았습니다.</div>;

  const overallSim    = Math.round((fr.overallSimilarityScore ?? 0) * 100);
  const circumference = 2 * Math.PI * 50;
  const wpmSlides     = slides.filter(s => s.wpm);
  const avgWpm        = wpmSlides.length
    ? Math.round(wpmSlides.reduce((a, s) => a + s.wpm, 0) / wpmSlides.length)
    : null;
  const totalFillers  = slides.reduce((a, s) => a + (s.fillerCount || 0), 0);

  const suggestions = Array.isArray(fr.improvementSuggestions)
    ? fr.improvementSuggestions
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* 종합 점수 카드 */}
      <div style={d.scoreCard}>
        <div style={d.scoreLeft}>
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
          <div style={d.scoreNum}>{overallSim}%</div>
          <div style={d.scoreLabel}>전체 유사도</div>
        </div>
        <div style={d.scoreRight}>
          {avgWpm != null && avgWpm > 0 && (
            <div style={d.statRow}>
              <span style={d.statKey}>평균 발화 속도</span>
              <span style={d.statVal}>{avgWpm} WPM</span>
            </div>
          )}
          <div style={d.statRow}>
            <span style={d.statKey}>총 필러 단어</span>
            <span style={{ ...d.statVal, color: totalFillers > 10 ? '#ff4d6d' : 'var(--teal)' }}>
              {totalFillers}회
            </span>
          </div>
          <div style={d.statRow}>
            <span style={d.statKey}>발표 슬라이드</span>
            <span style={d.statVal}>{slides.length}장</span>
          </div>
        </div>
      </div>

      {fr.overallFeedback && (
        <div style={d.card}>
          <div style={d.cardLabel}>종합 평가</div>
          <div style={d.bodyText}>{fr.overallFeedback}</div>
        </div>
      )}

      {fr.contentFeedback && (
        <div style={d.card}>
          <div style={d.cardLabel}>내용 피드백</div>
          <div style={d.bodyText}>{fr.contentFeedback}</div>
        </div>
      )}

      {fr.improvementSuggestions && (
        <div style={d.card}>
          <div style={d.cardLabel}>개선 제안</div>
          {suggestions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {suggestions.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={d.suggNum}>{i + 1}</div>
                  <span style={d.suggText}>{s}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={d.bodyText}>{fr.improvementSuggestions}</div>
          )}
        </div>
      )}

      {/* 슬라이드별 요약 그리드 */}
      {slides.length > 0 && (
        <div style={d.card}>
          <div style={d.cardLabel}>슬라이드별 요약</div>
          <div style={d.slideGrid}>
            {slides.map((slide, i) => {
              const sim    = Math.round((slide.similarityScore ?? 0) * 100);
              const simC   = sim >= 70 ? 'var(--teal)' : sim >= 40 ? '#f5a623' : '#ff4d6d';
              const speed  = slide.speedLabel ?? '—';
              const speedC = speed === '빠름' ? '#ff8c5a' : speed === '느림' ? '#7eb3ff' : 'var(--teal)';
              const fc     = slide.fillerCount ?? 0;
              const fillerC = slide.fillerLabel === '많음' ? '#ff4d6d' : 'var(--teal)';
              return (
                <div key={slide.slideIndex ?? i} style={d.slideCard}>
                  <div style={d.slideCardNum}>SLIDE {slide.slideIndex ?? i + 1}</div>
                  <div style={{ ...d.slideCardScore, color: simC }}>{sim}%</div>
                  <div style={d.slideCardTrack}>
                    <div style={{ ...d.slideCardBar, width: `${sim}%`, background: simC }} />
                  </div>
                  <div style={d.slideCardChips}>
                    <span style={{ ...d.slideChip, color: speedC, borderColor: speedC + '55', background: speedC + '15' }}>
                      {speed}{slide.wpm != null && ` · ${Math.round(slide.wpm)}wpm`}
                    </span>
                    <span style={{ ...d.slideChip, color: fillerC, borderColor: fillerC + '55', background: fillerC + '15' }}>
                      필러 {fc}회
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

// ── 슬라이드 카드 ─────────────────────────────────────────
function SlideCard({ slide, imageUrl }) {
  const sim         = Math.round((slide.similarityScore ?? 0) * 100);
  const simColor    = sim >= 70 ? 'var(--teal)' : sim >= 40 ? '#f5a623' : '#ff4d6d';
  const speed       = slide.speedLabel ?? '—';
  const speedColor  = speed === '빠름' ? '#ff8c5a' : speed === '느림' ? '#7eb3ff' : 'var(--teal)';
  const fillerCount = slide.fillerCount ?? 0;
  const fillerColor = slide.fillerLabel === '많음' ? '#ff4d6d' : 'var(--teal)';
  const wpm         = slide.wpm != null ? `${Math.round(slide.wpm)} WPM` : null;
  const fillerRatio = slide.fillerRatio != null ? `${(slide.fillerRatio * 100).toFixed(1)}%` : null;
  const transcript  = slide.transcriptText || slide.transcript || null;
  const audioUrl    = slide.audioUrl ?? null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 슬라이드 이미지 (FeedbackReviewer 동일) */}
      {imageUrl && (
        <div style={d.slideFrame}>
          <img
            src={imageUrl}
            alt={`슬라이드 ${slide.slideIndex}`}
            style={d.slideImg}
          />
        </div>
      )}

      {/* 피드백 패널 */}
      <div style={d.panel}>
        <div style={d.panelTitle}>슬라이드 {slide.slideIndex} 피드백</div>

        {/* 녹음 재생 */}
        {audioUrl && (
          <div style={d.audioRow}>
            <span style={d.audioLabel}>내 목소리 듣기</span>
            <AudioPlayer key={audioUrl} url={audioUrl} />
          </div>
        )}

        <div style={d.grid}>
          {/* 유사도 */}
          <div style={d.gridCard}>
            <div style={d.gridLabel}>슬라이드 ↔ 발화 유사도</div>
            <div style={{ ...d.bigNum, color: simColor }}>{sim}%</div>
            <div style={d.barTrack}>
              <div style={{ ...d.barFill, width: `${sim}%`, background: simColor }} />
            </div>
          </div>

          {/* 발화 속도 */}
          {slide.speedLabel && (
            <div style={d.gridCard}>
              <div style={d.gridLabel}>발화 속도</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ ...d.bigNum, color: speedColor }}>{speed}</span>
                {wpm && <span style={d.subText}>{wpm}</span>}
              </div>
              <div style={{ ...d.badge, background: speedColor + '22', color: speedColor }}>
                {speed === '빠름' ? '속도를 늦춰보세요' : speed === '느림' ? '조금 빠르게 말해보세요' : '적절한 속도예요'}
              </div>
            </div>
          )}

          {/* 필러 단어 */}
          <div style={d.gridCard}>
            <div style={d.gridLabel}>필러 단어</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ ...d.bigNum, color: fillerColor }}>{fillerCount}회</span>
              {fillerRatio && <span style={d.subText}>{fillerRatio}</span>}
            </div>
            <div style={{ ...d.badge, background: fillerColor + '22', color: fillerColor }}>
              {slide.fillerLabel === '많음' ? '필러 단어를 줄여보세요' : '필러 단어가 적절해요'}
            </div>
          </div>

          {/* 내가 한 말 */}
          {transcript && (
            <div style={{ ...d.gridCard, gridColumn: '1 / -1' }}>
              <div style={d.gridLabel}>내가 한 말</div>
              <div style={d.transcriptText}>{transcript}</div>
            </div>
          )}

          {/* 시각 피드백 */}
          {slide.visualFeedback && (
            <div style={{ ...d.gridCard, gridColumn: '1 / -1' }}>
              <div style={d.gridLabel}>슬라이드 시각 피드백</div>
              <div style={d.bodyText}>{slide.visualFeedback}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 공통 서브 컴포넌트 ────────────────────────────────────
function StatCard({ label, value, unit, color, compact, wide }) {
  return (
    <div style={{ ...l.statCard, ...(compact ? l.statCardCompact : {}), ...(wide ? l.statCardWide : {}) }}>
      <div style={{ ...l.statValue, ...(compact ? l.statValueCompact : {}), color }}>
        {value}
        {unit && <span style={l.statUnit}>{unit}</span>}
      </div>
      <div style={{ ...l.statLabel, ...(compact ? l.statLabelCompact : {}) }}>{label}</div>
    </div>
  );
}

function PageHeader({ label, onBack, onLogout }) {
  const compact = useCompactLayout();

  return (
    <header style={{ ...l.header, ...(compact ? l.headerCompact : {}) }}>
      <div style={{ ...l.headerLeft, ...(compact ? l.headerLeftCompact : {}) }}>
        <div style={l.headerLogo}>
          <MicIcon />
          <span style={{ ...l.headerLogoText, ...(compact ? l.headerLogoTextCompact : {}) }}>
            PITCH<span style={{ color: 'var(--gold)' }}>LENS</span>
          </span>
        </div>
        <div style={{ ...l.headerPage, ...(compact ? l.headerPageCompact : {}) }}>{label}</div>
      </div>
      <div style={{ ...l.headerRight, ...(compact ? l.headerRightCompact : {}) }}>
        <button style={{ ...l.btnOutline, ...(compact ? l.btnOutlineCompact : {}) }} onClick={onBack}>
          {compact ? '뒤로' : '← 돌아가기'}
        </button>
        <button style={{ ...l.btnOutline, ...(compact ? l.btnOutlineCompact : {}) }} onClick={onLogout}>로그아웃</button>
      </div>
    </header>
  );
}

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

function Spinner() {
  return (
    <div style={{
      width: 24, height: 24, borderRadius: '50%',
      border: '3px solid var(--border2)',
      borderTopColor: 'var(--gold)',
      animation: 'spin 0.8s linear infinite',
      flexShrink: 0,
    }} />
  );
}

// ── 유틸 ──────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
}

function fmtShortDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('ko-KR', {
    month: '2-digit', day: '2-digit',
  }).replace(/\s/g, '');
}

function fmtDateTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

// ── 스타일 ────────────────────────────────────────────────
const l = {
  app:     { minHeight: '100vh', display: 'flex', flexDirection: 'column' },

  // 분석 진행 배너
  analysisBanner: { background: 'rgba(245,166,35,0.06)', borderBottom: '1px solid rgba(245,166,35,0.2)',
                    padding: '10px 24px 12px' },
  bannerSpinner:  { width: 14, height: 14, borderRadius: '50%',
                    border: '2px solid var(--border2)', borderTopColor: 'var(--gold)',
                    animation: 'spin 0.8s linear infinite', flexShrink: 0 },
  bannerLabel:    { fontSize: 13, color: 'var(--text2)', fontFamily: 'var(--font-mono)', flex: 1 },
  bannerPct:      { fontSize: 12, color: 'var(--gold)', fontFamily: 'var(--font-mono)' },
  bannerTrack:    { height: 2, background: 'var(--border)', borderRadius: 1, marginTop: 8 },
  bannerFill:     { height: '100%', borderRadius: 1,
                    background: 'linear-gradient(90deg, var(--gold), var(--teal))',
                    transition: 'width 0.5s ease' },
  appCompact: {
    minHeight: '100svh',
  },
  header:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between',
             padding: '0 32px', height: 64, borderBottom: '1px solid var(--border)',
             background: 'rgba(8,10,14,0.85)', backdropFilter: 'blur(12px)',
             position: 'sticky', top: 0, zIndex: 50 },
  headerCompact: {
    height: 76,
    minHeight: 76,
    padding: '0 18px',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  headerLeft:     { display: 'flex', alignItems: 'center', gap: 20 },
  headerLeftCompact: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
  },
  headerLogo:     { display: 'flex', alignItems: 'center', gap: 10 },
  headerLogoText: { fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: 3, color: 'var(--text)' },
  headerLogoTextCompact: {
    fontSize: 18,
    letterSpacing: 2,
  },
  headerPage:     { fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text2)',
                    paddingLeft: 16, borderLeft: '1px solid var(--border2)' },
  headerPageCompact: {
    display: 'none',
    maxWidth: 132,
    paddingLeft: 0,
    borderLeft: 'none',
    color: 'var(--gold)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'right',
  },
  headerRight:    { display: 'flex', gap: 10 },
  headerRightCompact: {
    gap: 6,
    flexShrink: 0,
  },
  btnOutline:     { background: 'none', border: '1px solid var(--border2)', borderRadius: 8,
                    padding: '7px 16px', color: 'var(--text2)', fontSize: 12,
                    fontFamily: 'var(--font-mono)', cursor: 'pointer' },
  btnOutlineCompact: {
    flex: '0 0 auto',
    minHeight: 36,
    padding: '7px 10px',
    fontSize: 11,
    whiteSpace: 'nowrap',
  },

  main:    { flex: 1, maxWidth: 860, margin: '0 auto', padding: '40px 24px 80px', width: '100%' },
  mainCompact: {
    padding: '20px 20px 56px',
  },

  profileCard:  { display: 'flex', alignItems: 'center', gap: 20, padding: '24px 28px',
                  background: 'var(--surface)', border: '1px solid var(--border2)',
                  borderRadius: 16, marginBottom: 36 },
  profileCardCompact: {
    gap: 14,
    padding: '18px 18px',
    borderRadius: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  avatar:       { width: 52, height: 52, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--gold), var(--gold2))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, fontWeight: 700, color: '#000', flexShrink: 0 },
  avatarCompact:{ width: 50, height: 50, fontSize: 21 },
  profileInfo:  { flex: 1, minWidth: 0 },
  profileName:  { fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 4 },
  profileNameCompact: { fontSize: 17, lineHeight: 1.2 },
  profileEmail: { fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text2)' },
  profileEmailCompact: {
    fontSize: 12,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  btnWithdraw:  { background: 'none', border: '1px solid rgba(255,80,80,0.3)', borderRadius: 8,
                  padding: '7px 14px', color: '#ff6b6b', fontSize: 12,
                  fontFamily: 'var(--font-mono)', cursor: 'pointer', flexShrink: 0 },
  btnWithdrawCompact: {
    minHeight: 34,
    padding: '7px 12px',
    fontSize: 12,
  },

  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(4px)', zIndex: 200,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalBox:     { background: 'var(--surface)', border: '1px solid var(--border2)',
                  borderRadius: 16, padding: '32px 36px', maxWidth: 400, width: '90%' },
  modalTitle:   { fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 16 },
  modalBody:    { fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 28 },
  modalActions: { display: 'flex', gap: 10, justifyContent: 'flex-end' },
  btnModalCancel:  { background: 'none', border: '1px solid var(--border2)', borderRadius: 8,
                     padding: '9px 20px', color: 'var(--text2)', fontSize: 13,
                     fontFamily: 'var(--font-mono)', cursor: 'pointer' },
  btnModalConfirm: { background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.4)',
                     borderRadius: 8, padding: '9px 20px', color: '#ff6b6b', fontSize: 13,
                     fontFamily: 'var(--font-mono)', cursor: 'pointer', fontWeight: 600 },

  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12,
    marginBottom: 32,
  },
  statsRowCompact: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
    marginBottom: 26,
  },
  statCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border2)',
    borderRadius: 14,
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  statCardCompact: {
    minHeight: 112,
    padding: '18px 18px',
    borderRadius: 12,
    justifyContent: 'center',
  },
  statCardWide: {
    gridColumn: '1 / -1',
    minHeight: 96,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 700,
    fontFamily: 'var(--font-mono)',
    lineHeight: 1,
  },
  statValueCompact: {
    fontSize: 30,
    whiteSpace: 'nowrap',
  },
  statUnit: {
    fontSize: 14,
    fontWeight: 400,
    marginLeft: 4,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'var(--font-mono)',
    color: 'var(--text3)',
    letterSpacing: 1,
  },
  statLabelCompact: {
    fontSize: 12,
    color: 'var(--text2)',
    lineHeight: 1.25,
    whiteSpace: 'nowrap',
  },

  sectionRow:   { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionRowCompact: { marginBottom: 12 },
  sectionLabel: { fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--gold)',
                  letterSpacing: 2, textTransform: 'uppercase' },
  sectionCount: { fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text3)' },

  errorBox:  { background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.25)',
               borderRadius: 10, padding: '12px 16px', color: '#ff6b6b',
               fontSize: 13, fontFamily: 'var(--font-mono)', marginBottom: 16 },
  centerMsg: { display: 'flex', alignItems: 'center', gap: 12, padding: '48px 0',
               justifyContent: 'center' },
  emptyBox:  { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
               padding: '56px 32px', background: 'var(--surface)',
               border: '1.5px dashed var(--border2)', borderRadius: 16 },
  emptyText: { fontSize: 15, fontWeight: 600, color: 'var(--text)' },
  emptySub:  { fontSize: 13, color: 'var(--text2)' },

  skelLine: { height: 14, borderRadius: 6, background: 'var(--surface3)',
              animation: 'pulse 1.5s ease infinite' },

  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          padding: '18px 24px', background: 'var(--surface)',
          border: '1px solid var(--border2)', borderRadius: 14,
          cursor: 'pointer' },
  cardCompact: {
    alignItems: 'stretch',
    flexDirection: 'column',
    gap: 14,
    padding: '18px 18px',
    borderRadius: 12,
  },
  cardLeft:    { flex: 1, minWidth: 0 },
  cardTitle:   { fontSize: 15, fontWeight: 600, color: 'var(--text)',
                 marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  cardTitleCompact: {
    fontSize: 16,
    marginBottom: 10,
  },
  cardMeta:    { display: 'flex', alignItems: 'center', gap: 10 },
  cardMetaCompact: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardDate:    { fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text3)' },
  badgeDone:   { fontSize: 11, fontFamily: 'var(--font-mono)', padding: '3px 8px',
                 background: 'rgba(32,201,151,0.1)', border: '1px solid rgba(32,201,151,0.3)',
                 borderRadius: 20, color: 'var(--teal)' },
  badgePending:{ fontSize: 11, fontFamily: 'var(--font-mono)', padding: '3px 8px',
                 background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)',
                 borderRadius: 20, color: '#f5a623' },
  cardActions: { display: 'flex', gap: 8, flexShrink: 0 },
  cardActionsCompact: {
    width: '100%',
  },
  btnDetail:   { background: 'none', border: '1px solid var(--border2)', borderRadius: 8,
                 padding: '6px 14px', color: 'var(--text2)', fontSize: 12,
                 fontFamily: 'var(--font-mono)', cursor: 'pointer' },
  btnDelete:   { background: 'none', border: '1px solid rgba(255,80,80,0.3)', borderRadius: 8,
                 padding: '6px 14px', color: '#ff6b6b', fontSize: 12,
                 fontFamily: 'var(--font-mono)', cursor: 'pointer' },
  btnActionCompact: {
    flex: 1,
    minHeight: 40,
    padding: '8px 10px',
    fontSize: 12,
  },

  // 상세 보기
  detailTopRow:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                   marginBottom: 24 },
  detailTopRowCompact: { alignItems: 'stretch', flexDirection: 'column', gap: 12 },
  detailDate:    { fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text3)' },
  detailActions:  { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' },
  detailActionsCompact: { justifyContent: 'stretch' },
  downloadLink:  { fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--gold)',
                   textDecoration: 'none', border: '1px solid rgba(245,166,35,0.3)',
                   borderRadius: 8, padding: '6px 14px' },
  pdfExportButton: {
    background: 'rgba(245,166,35,0.08)',
    cursor: 'pointer',
  },
  downloadDisabled: {
    opacity: 0.45,
    cursor: 'not-allowed',
  },
  pendingCard:   { padding: '20px 24px', background: 'var(--surface)',
                   border: '1px solid var(--border2)', borderRadius: 12,
                   fontSize: 14, color: 'var(--text2)', textAlign: 'center', marginBottom: 24 },
  slideList: { display: 'flex', flexDirection: 'column', gap: 16 },

  // 슬라이드 네비게이션 바 (FeedbackReviewer 동일)
  controlBar: { position: 'fixed', bottom: 0, left: 0, right: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 28px', borderTop: '1px solid var(--border)',
                background: 'rgba(8,10,14,0.96)', backdropFilter: 'blur(12px)',
                gap: 12, zIndex: 50 },
  navBtn:     { minWidth: 96, background: 'var(--surface2)', border: '1px solid var(--border2)',
                borderRadius: 10, padding: '10px 20px', color: 'var(--text)',
                fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  nextBtn:    { minWidth: 120, background: 'linear-gradient(135deg, var(--teal), #00a88d)',
                color: '#000', border: 'none', borderRadius: 10,
                padding: '10px 20px', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 0 20px var(--teal-glow)' },
  navDisabled:{ opacity: 0.35, cursor: 'not-allowed' },
  dotRow:     { display: 'flex', gap: 6, alignItems: 'center', flex: 1,
                justifyContent: 'center', flexWrap: 'wrap' },
  dot:        { width: 7, height: 7, borderRadius: '50%', cursor: 'pointer',
                transition: 'background 0.2s, transform 0.2s' },
};

// 상세 보기 전용 스타일 (FeedbackReviewer 동일 디자인)
const d = {
  scoreCard:  { display: 'flex', alignItems: 'center', gap: 32, padding: '28px 32px',
                background: 'var(--surface)', border: '1px solid var(--border2)',
                borderRadius: 16, marginBottom: 16 },
  scoreLeft:  { display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 6, position: 'relative', flexShrink: 0 },
  scoreNum:   { position: 'absolute', top: '38px', left: '50%', transform: 'translateX(-50%)',
                fontSize: 22, fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--font-mono)' },
  scoreLabel: { fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)',
                marginTop: 4, letterSpacing: 1 },
  scoreRight: { flex: 1, display: 'flex', flexDirection: 'column', gap: 10 },
  statRow:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 12px', background: 'var(--surface2)',
                borderRadius: 8, border: '1px solid var(--border)' },
  statKey:    { fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--font-mono)' },
  statVal:    { fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)' },

  card:       { background: 'var(--surface)', border: '1px solid var(--border2)',
                borderRadius: 14, padding: '20px 24px', marginBottom: 16 },
  cardLabel:  { fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text2)',
                letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 },
  bodyText:   { fontSize: 14, color: 'var(--text)', lineHeight: 1.8 },

  // 슬라이드 이미지 (FeedbackReviewer 동일)
  slideFrame: { width: '100%', borderRadius: 10, overflow: 'hidden',
                boxShadow: '0 12px 48px rgba(0,0,0,0.6)' },
  slideImg:   { display: 'block', width: '100%', height: 'auto' },

  panel:      { background: 'var(--surface)', border: '1px solid var(--border2)',
                borderRadius: 14, padding: '20px 24px' },
  panelTitle: { fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--gold)',
                letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 },
  grid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 },
  gridCard:   { background: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '14px 16px' },
  gridLabel:  { fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text3)',
                letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  bigNum:     { fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)', lineHeight: 1 },
  subText:    { fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)' },
  barTrack:   { height: 4, background: 'var(--border)', borderRadius: 2, marginTop: 10, overflow: 'hidden' },
  barFill:    { height: '100%', borderRadius: 2, transition: 'width 0.8s ease' },
  badge:      { display: 'inline-block', marginTop: 8, padding: '3px 10px',
                borderRadius: 20, fontSize: 11, fontFamily: 'var(--font-mono)' },
  transcriptText: { fontSize: 13, color: 'var(--text)', lineHeight: 1.8,
                    whiteSpace: 'pre-wrap', fontFamily: 'var(--font-body)' },
  audioRow:       { display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', marginBottom: 14,
                    background: 'var(--surface2)', border: '1px solid var(--border)',
                    borderRadius: 10 },
  audioLabel:     { fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--gold)',
                    letterSpacing: 1.5, textTransform: 'uppercase', flexShrink: 0 },

  // SummarySection — 종합 피드백 개선 제안 + 슬라이드 그리드
  suggNum:       { width: 24, height: 24, borderRadius: 6,
                   background: 'var(--gold-glow)', border: '1px solid rgba(245,166,35,0.3)',
                   display: 'flex', alignItems: 'center', justifyContent: 'center',
                   fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--gold)', flexShrink: 0 },
  suggText:      { fontSize: 14, color: 'var(--text)', lineHeight: 1.6, paddingTop: 2 },
  slideGrid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                   gap: 10, marginTop: 4 },
  slideCard:     { background: 'var(--surface2)', border: '1px solid var(--border)',
                   borderRadius: 10, padding: '12px 14px',
                   display: 'flex', flexDirection: 'column', gap: 6 },
  slideCardNum:  { fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text3)', letterSpacing: 1.5 },
  slideCardScore:{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)', lineHeight: 1 },
  slideCardTrack:{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' },
  slideCardBar:  { height: '100%', borderRadius: 2, transition: 'width 0.6s ease' },
  slideCardChips:{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  slideChip:     { fontSize: 10, fontFamily: 'var(--font-mono)', padding: '2px 7px',
                   border: '1px solid', borderRadius: 10 },
};
