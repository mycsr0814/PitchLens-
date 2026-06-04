import React from 'react';

export default function OverallFeedback({ overall, slideFeedbacks }) {
  if (!overall) return null;
  const avgScore = Math.round(slideFeedbacks.reduce((s, f) => s + (f.score || 0), 0) / slideFeedbacks.length);
  const finalScore = overall.overallScore ?? avgScore;
  const grade = finalScore >= 80 ? 'S' : finalScore >= 70 ? 'A' : finalScore >= 60 ? 'B' : 'C';
  const gradeColor = finalScore >= 80 ? 'var(--teal)' : finalScore >= 70 ? 'var(--gold)' : finalScore >= 60 ? '#F5A623' : 'var(--red)';

  return (
    <div style={s.wrap}>
      {/* 상단 글로우 */}
      <div style={s.topGlow} />

      {/* 종합 점수 헤더 */}
      <div style={s.scoreHeader}>
        <div style={s.gradeCircle}>
          <div style={{ ...s.grade, color: gradeColor }}>{grade}</div>
        </div>
        <div style={s.scoreInfo}>
          <div style={s.scoreLabel}>OVERALL SCORE</div>
          <div style={s.scoreNum}>
            <span style={{ ...s.scoreVal, color: gradeColor }}>{finalScore}</span>
            <span style={s.scoreMax}>/100</span>
          </div>
          <div style={s.headline}>{overall.headline}</div>
        </div>
      </div>

      {/* 슬라이드별 점수 바 */}
      <div style={s.chartWrap}>
        <div style={s.chartLabel}>SLIDE SCORES</div>
        <div style={s.bars}>
          {slideFeedbacks.map((fb, i) => {
            const h = Math.max(4, ((fb.score || 0) / 100) * 72);
            const c = fb.score >= 80 ? 'var(--teal)' : fb.score >= 60 ? 'var(--gold)' : 'var(--red)';
            return (
              <div key={i} style={s.barCol}>
                <div style={s.barScore}>{fb.score}</div>
                <div style={{ ...s.bar, height: h, background: c, boxShadow: `0 0 8px ${c}40` }} />
                <div style={s.barIdx}>{i + 1}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 강점 / 개선점 */}
      <div style={s.twoCol}>
        <div style={s.box}>
          <div style={{ ...s.boxTitle, color: 'var(--teal)' }}>✦ 전체 강점</div>
          {(overall.topStrengths || []).map((t, i) => (
            <div key={i} style={s.boxItem}><span style={{ color: 'var(--teal)' }}>+</span> {t}</div>
          ))}
        </div>
        <div style={s.box}>
          <div style={{ ...s.boxTitle, color: 'var(--gold)' }}>✦ 개선 우선순위</div>
          {(overall.topImprovements || []).map((t, i) => (
            <div key={i} style={s.boxItem}><span style={{ color: 'var(--gold)' }}>!</span> {t}</div>
          ))}
        </div>
      </div>

      {/* 흐름 분석 */}
      {overall.flowAnalysis && (
        <div style={s.flow}>
          <div style={s.flowTitle}>📈  FLOW ANALYSIS</div>
          <p style={s.flowText}>{overall.flowAnalysis}</p>
        </div>
      )}

      {/* 다음 액션 */}
      {overall.nextSteps?.length > 0 && (
        <div style={s.actions}>
          <div style={s.actionsTitle}>🎯  NEXT PRACTICE</div>
          <div style={s.actionList}>
            {overall.nextSteps.map((step, i) => (
              <div key={i} style={s.actionItem}>
                <div style={s.actionNum}>{i + 1}</div>
                <span style={s.actionText}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  wrap: { background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 20, padding: '32px 28px', marginBottom: 28, position: 'relative', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  topGlow: { position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 400, height: 200, background: 'radial-gradient(ellipse, rgba(245,166,35,0.1) 0%, transparent 70%)', pointerEvents: 'none' },
  scoreHeader: { display: 'flex', alignItems: 'center', gap: 24, marginBottom: 28 },
  gradeCircle: { width: 88, height: 88, borderRadius: '50%', background: 'var(--surface2)', border: '2px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  grade: { fontFamily: 'var(--font-display)', fontSize: 52, lineHeight: 1, letterSpacing: 2 },
  scoreInfo: { flex: 1 },
  scoreLabel: { fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text2)', letterSpacing: 3, marginBottom: 4 },
  scoreNum: { display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 },
  scoreVal: { fontFamily: 'var(--font-display)', fontSize: 56, lineHeight: 1, letterSpacing: 2 },
  scoreMax: { fontSize: 18, color: 'var(--text2)' },
  headline: { fontSize: 15, fontWeight: 500, color: 'var(--text)', lineHeight: 1.5 },
  chartWrap: { marginBottom: 24 },
  chartLabel: { fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text2)', letterSpacing: 2, marginBottom: 12 },
  bars: { display: 'flex', gap: 6, alignItems: 'flex-end', height: 96 },
  barCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 },
  barScore: { fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text2)' },
  bar: { width: '100%', borderRadius: 4, transition: 'height 0.6s ease' },
  barIdx: { fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text3)' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 },
  box: { background: 'var(--bg2)', borderRadius: 12, padding: '16px 18px' },
  boxTitle: { fontSize: 10, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 },
  boxItem: { fontSize: 13, color: 'var(--text)', lineHeight: 1.7, marginBottom: 4 },
  flow: { background: 'var(--bg2)', borderRadius: 12, padding: '16px 18px', marginBottom: 12 },
  flowTitle: { fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text2)', letterSpacing: 2, marginBottom: 10 },
  flowText: { fontSize: 13, color: 'var(--text)', lineHeight: 1.8 },
  actions: { background: 'linear-gradient(135deg, rgba(245,166,35,0.06), rgba(0,201,167,0.04))', border: '1px solid rgba(245,166,35,0.15)', borderRadius: 12, padding: '16px 18px' },
  actionsTitle: { fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--gold)', letterSpacing: 2, marginBottom: 14 },
  actionList: { display: 'flex', flexDirection: 'column', gap: 10 },
  actionItem: { display: 'flex', alignItems: 'flex-start', gap: 12 },
  actionNum: { width: 24, height: 24, borderRadius: 6, background: 'rgba(245,166,35,0.2)', border: '1px solid rgba(245,166,35,0.3)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, flexShrink: 0, marginTop: 1 },
  actionText: { fontSize: 13, color: 'var(--text)', lineHeight: 1.6 },
};
