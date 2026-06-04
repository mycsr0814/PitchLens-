import useCompactLayout from '../hooks/useCompactLayout';
import { formatDate } from '../utils/format';
import { detail } from '../styles/detailStyles';

function formatSuggestions(text) {
  if (!text) return '';
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed.map((s, i) => `${i + 1}. ${s}`).join('\n');
    }
  } catch {
    /* plain text */
  }
  return String(text);
}

function ScoreBar({ value }) {
  const pct = Math.round((Number(value) || 0) * 100);
  const color = pct >= 70 ? 'var(--teal)' : pct >= 50 ? 'var(--gold)' : 'var(--red)';
  return (
    <div style={detail.barWrap}>
      <div style={{ ...detail.barFill, width: `${pct}%`, background: color }} />
    </div>
  );
}

function FeedbackSection({ label, text }) {
  if (!text) return null;
  return (
    <div style={detail.fbSection}>
      <div style={detail.fbLabel}>{label}</div>
      <div style={detail.fbText}>{text}</div>
    </div>
  );
}

function StatChip({ label, value }) {
  return (
    <div style={detail.chip}>
      <span style={detail.chipLabel}>{label}</span>
      <span style={detail.chipVal}>{value}</span>
    </div>
  );
}

function SlideCard({ slide }) {
  const score = slide.similarityScore ?? null;
  const scoreColor =
    score == null ? 'var(--text3)' : score >= 0.7 ? 'var(--teal)' : score >= 0.5 ? 'var(--gold)' : 'var(--red)';

  return (
    <div style={detail.slideCard}>
      <div style={detail.slideHeader}>
        <span style={detail.slideIndex}>SLIDE {slide.slideIndex}</span>
        {score != null && (
          <span style={{ ...detail.scoreBadge, color: scoreColor, borderColor: scoreColor }}>
            유사도 {Math.round(score * 100)}%
          </span>
        )}
      </div>

      <div style={detail.slideBody}>
        {slide.speedLabel && (
          <div style={detail.statRow}>
            <StatChip label="속도" value={slide.speedLabel} />
            {slide.wpm != null && <StatChip label="WPM" value={`${Number(slide.wpm).toFixed(0)}`} />}
            {slide.durationSec != null && (
              <StatChip label="녹음" value={`${Number(slide.durationSec).toFixed(1)}s`} />
            )}
            {slide.fillerLabel && <StatChip label="필러" value={slide.fillerLabel} />}
          </div>
        )}

        {slide.transcriptText && (
          <div style={detail.transcriptBox}>
            <div style={detail.transcriptLabel}>전사 텍스트</div>
            <div style={detail.transcriptText}>{slide.transcriptText}</div>
          </div>
        )}

        {slide.visualFeedback && (
          <div style={detail.feedbackBlock}>
            <div style={detail.feedbackBlockLabel}>슬라이드 피드백</div>
            <div style={detail.feedbackBlockText}>{slide.visualFeedback}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PresentationDetailView({ detail: data, loading, onBack }) {
  const compact = useCompactLayout();
  const fr = data?.feedbackResult;

  return (
    <div style={{ ...detail.wrap, ...(compact ? detail.wrapCompact : {}) }}>
      <div style={detail.topBar}>
        <button type="button" onClick={onBack} style={detail.backBtn}>
          ← 목록으로
        </button>
      </div>

      {loading && <p style={detail.loading}>피드백을 불러오는 중...</p>}

      {!loading && data && (
        <>
          <header style={detail.header}>
            <p style={detail.eyebrow}>PRESENTATION DETAIL</p>
            <h1 style={detail.title}>{data.title || '(제목 없음)'}</h1>
            <div style={detail.metaRow}>
              <span>{data.userName} · {data.userEmail}</span>
              <span>{formatDate(data.createdAt)}</span>
            </div>
            {data.pptUrl && (
              <a href={data.pptUrl} target="_blank" rel="noreferrer" style={detail.downloadLink}>
                PPT 다운로드 ↓
              </a>
            )}
          </header>

          {fr ? (
            <section style={detail.summaryCard}>
              <h2 style={detail.sectionTitle}>종합 피드백</h2>
              <div style={detail.scoreRow}>
                <span style={detail.scoreLabel}>전체 유사도</span>
                <ScoreBar value={fr.overallSimilarityScore} />
                <span style={detail.scoreNum}>
                  {Math.round((Number(fr.overallSimilarityScore) || 0) * 100)}점
                </span>
              </div>
              <FeedbackSection label="전체 피드백" text={fr.overallFeedback} />
              <FeedbackSection label="내용 피드백" text={fr.contentFeedback} />
              <FeedbackSection
                label="개선 제안"
                text={formatSuggestions(fr.improvementSuggestions)}
              />
            </section>
          ) : (
            <div style={detail.pendingCard}>저장된 종합 피드백이 없습니다.</div>
          )}

          {data.slides?.length > 0 && (
            <section style={detail.slideSection}>
              <h2 style={detail.sectionTitle}>슬라이드별 분석</h2>
              <div style={detail.slideList}>
                {data.slides.map((slide) => (
                  <SlideCard key={slide.slideIndex} slide={slide} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
