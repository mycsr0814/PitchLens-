import React from 'react';

export default function ProgressOverlay({ progress, label }) {
  const stages = [
    { label: '발표 자료 업로드',   done: progress >= 15,  active: progress > 0  && progress < 15  },
    { label: '녹음 파일 업로드',   done: progress >= 76,  active: progress >= 15 && progress < 76  },
    { label: '음성 분석',          done: progress >= 82,  active: progress >= 76 && progress < 82  },
    { label: 'AI 피드백 생성',     done: progress >= 100, active: progress >= 82 && progress < 100 },
  ];

  return (
    <div style={s.overlay}>
      <div style={s.card}>
        {/* 상단 스포트라이트 */}
        <div style={s.glow} />

        <div style={s.header}>
          <div style={s.headerDot} />
          <span style={s.headerLabel}>ANALYZING</span>
        </div>

        {/* 원형 프로그레스 */}
        <div style={s.circleWrap}>
          <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="80" cy="80" r="68" fill="none" stroke="var(--surface3)" strokeWidth="6" />
            <circle cx="80" cy="80" r="68" fill="none"
              stroke="url(#goldGrad)" strokeWidth="6"
              strokeDasharray={2 * Math.PI * 68}
              strokeDashoffset={2 * Math.PI * 68 * (1 - progress / 100)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--gold)" />
                <stop offset="100%" stopColor="var(--teal)" />
              </linearGradient>
            </defs>
          </svg>
          <div style={s.circleInner}>
            <div style={s.pct}>{progress}</div>
            <div style={s.pctLabel}>%</div>
          </div>
        </div>

        <div style={s.label}>{label || 'AI 분석 중...'}</div>

        {/* 스테이지 */}
        <div style={s.stages}>
          {stages.map((st, i) => (
            <div key={i} style={{ ...s.stage, ...(st.active ? s.stageActive : {}), ...(st.done ? s.stageDone : {}) }}>
              <div style={{ ...s.stageIcon, ...(st.active ? s.stageIconActive : {}), ...(st.done ? s.stageIconDone : {}) }}>
                {st.done ? '✓' : i + 1}
              </div>
              <span>{st.label}</span>
              {st.active && <span style={s.stagePulse}>●</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(8,10,14,0.92)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  card: { background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 24, padding: '40px 48px', textAlign: 'center', minWidth: 360, position: 'relative', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' },
  glow: { position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 300, height: 200, background: 'radial-gradient(ellipse, rgba(245,166,35,0.12) 0%, transparent 70%)', pointerEvents: 'none' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 28 },
  headerDot: { width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)', boxShadow: '0 0 8px var(--gold)', animation: 'pulse 1.5s ease infinite' },
  headerLabel: { fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--gold)', letterSpacing: 3 },
  circleWrap: { position: 'relative', width: 160, height: 160, margin: '0 auto 24px' },
  circleInner: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  pct: { fontSize: 44, fontFamily: 'var(--font-display)', color: 'var(--text)', lineHeight: 1, letterSpacing: 2 },
  pctLabel: { fontSize: 14, color: 'var(--text2)', fontFamily: 'var(--font-mono)' },
  label: { fontSize: 13, color: 'var(--text2)', marginBottom: 28, minHeight: 20, fontFamily: 'var(--font-mono)' },
  stages: { display: 'flex', flexDirection: 'column', gap: 6, text: 'left' },
  stage: { display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--text3)', padding: '8px 14px', borderRadius: 10, transition: 'all 0.2s' },
  stageActive: { color: 'var(--gold)', background: 'var(--gold-glow)' },
  stageDone: { color: 'var(--teal)' },
  stageIcon: { width: 24, height: 24, borderRadius: 6, background: 'var(--surface3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontFamily: 'var(--font-mono)', flexShrink: 0 },
  stageIconActive: { background: 'rgba(245,166,35,0.2)', color: 'var(--gold)' },
  stageIconDone: { background: 'rgba(0,201,167,0.2)', color: 'var(--teal)' },
  stagePulse: { marginLeft: 'auto', fontSize: 8, color: 'var(--gold)', animation: 'pulse 1s ease infinite' },
};
