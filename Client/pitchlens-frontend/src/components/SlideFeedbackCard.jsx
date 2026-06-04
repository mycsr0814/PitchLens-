import React, { useState } from 'react';

export default function SlideFeedbackCard({ slide, feedback, transcription }) {
  const [open, setOpen] = useState(false);
  const score = feedback?.score ?? 0;
  const grade = score >= 80 ? { color: 'var(--teal)',  label: 'GREAT',  bg: 'rgba(0,201,167,0.1)',  border: 'rgba(0,201,167,0.3)' }
              : score >= 60 ? { color: 'var(--gold)',  label: 'GOOD',   bg: 'var(--gold-glow)',      border: 'rgba(245,166,35,0.3)' }
              :               { color: 'var(--red)',   label: 'NEEDS WORK', bg: 'var(--red-glow)',   border: 'rgba(255,77,109,0.3)' };

  return (
    <div style={{ ...s.card, ...(open ? s.cardOpen : {}) }}>
      {/* 헤더 */}
      <div style={s.header} onClick={() => setOpen(o => !o)}>
        {/* 점수 배지 */}
        <div style={{ ...s.scoreBadge, background: grade.bg, border: `1px solid ${grade.border}` }}>
          <div style={{ ...s.scoreNum, color: grade.color }}>{score}</div>
          <div style={{ ...s.scoreGrade, color: grade.color }}>{grade.label}</div>
        </div>

        {/* 슬라이드 정보 */}
        <div style={s.slideInfo}>
          <div style={s.slideNum}>SLIDE {String(slide.index + 1).padStart(2, '0')}</div>
          <div style={s.slideTitle}>{slide.title}</div>
          {feedback?.summary && <div style={s.slideSummary}>{feedback.summary}</div>}
        </div>

        {/* 전사 시간 */}
        {transcription?.duration > 0 && (
          <div style={s.duration}>
            <span style={s.durationNum}>{Math.round(transcription.duration)}</span>
            <span style={s.durationUnit}>초</span>
          </div>
        )}

        <div style={{ ...s.chevron, transform: open ? 'rotate(180deg)' : 'none' }}>▼</div>
      </div>

      {/* 상세 내용 */}
      {open && (
        <div style={s.body}>
          {/* 전사 텍스트 */}
          <div style={s.section}>
            <div style={s.sectionTitle}><span style={s.sectionDot} />발표 스크립트</div>
            <div style={s.transcript}>{transcription?.text || '(녹음 없음)'}</div>
          </div>

          {/* 전달력 3분할 */}
          {feedback?.delivery && (
            <div style={s.section}>
              <div style={s.sectionTitle}><span style={s.sectionDot} />전달력 분석</div>
              <div style={s.delivGrid}>
                {[['발화 속도', feedback.delivery.pace], ['내용 커버율', feedback.delivery.coverage], ['명확성', feedback.delivery.clarity]].map(([k, v]) => (
                  <div key={k} style={s.delivItem}>
                    <div style={s.delivKey}>{k}</div>
                    <div style={s.delivVal}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 강점 / 개선점 */}
          <div style={s.twoCol}>
            {feedback?.strengths?.length > 0 && (
              <div style={s.listBox}>
                <div style={{ ...s.listTitle, color: 'var(--teal)' }}>✦ 강점</div>
                {feedback.strengths.map((t, i) => (
                  <div key={i} style={s.listItem}><span style={{ color: 'var(--teal)' }}>+</span> {t}</div>
                ))}
              </div>
            )}
            {feedback?.improvements?.length > 0 && (
              <div style={s.listBox}>
                <div style={{ ...s.listTitle, color: 'var(--gold)' }}>✦ 개선점</div>
                {feedback.improvements.map((t, i) => (
                  <div key={i} style={s.listItem}><span style={{ color: 'var(--gold)' }}>!</span> {t}</div>
                ))}
              </div>
            )}
          </div>

          {/* 코치 팁 */}
          {feedback?.tip && (
            <div style={s.tip}>
              <div style={s.tipIcon}>💡</div>
              <div>
                <div style={s.tipLabel}>COACH TIP</div>
                <div style={s.tipText}>{feedback.tip}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const s = {
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.2s' },
  cardOpen: { borderColor: 'var(--border2)' },
  header: { display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', cursor: 'pointer' },
  scoreBadge: { width: 64, borderRadius: 10, padding: '8px 6px', textAlign: 'center', flexShrink: 0 },
  scoreNum: { fontSize: 26, fontFamily: 'var(--font-display)', lineHeight: 1, letterSpacing: 1 },
  scoreGrade: { fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: 1, marginTop: 2 },
  slideInfo: { flex: 1, minWidth: 0 },
  slideNum: { fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text2)', letterSpacing: 2, marginBottom: 3 },
  slideTitle: { fontSize: 14, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 2 },
  slideSummary: { fontSize: 12, color: 'var(--text2)', fontStyle: 'italic' },
  duration: { flexShrink: 0, textAlign: 'right' },
  durationNum: { fontSize: 22, fontFamily: 'var(--font-display)', color: 'var(--text2)', letterSpacing: 1 },
  durationUnit: { fontSize: 11, color: 'var(--text3)', marginLeft: 2 },
  chevron: { fontSize: 10, color: 'var(--text3)', transition: 'transform 0.2s', flexShrink: 0 },
  body: { padding: '0 20px 20px', borderTop: '1px solid var(--border)' },
  section: { marginTop: 20 },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 },
  sectionDot: { display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 },
  transcript: { background: 'var(--bg2)', borderRadius: 10, padding: '14px 16px', fontSize: 13, lineHeight: 1.8, color: 'var(--text)', fontFamily: 'var(--font-body)' },
  delivGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 },
  delivItem: { background: 'var(--bg2)', borderRadius: 10, padding: '12px 14px' },
  delivKey: { fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  delivVal: { fontSize: 12, color: 'var(--text)', lineHeight: 1.5 },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 },
  listBox: { background: 'var(--bg2)', borderRadius: 10, padding: '14px 16px' },
  listTitle: { fontSize: 10, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 },
  listItem: { fontSize: 12, color: 'var(--text)', lineHeight: 1.6, marginBottom: 6 },
  tip: { display: 'flex', gap: 14, background: 'linear-gradient(135deg, rgba(245,166,35,0.08), rgba(0,201,167,0.05))', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 12, padding: '16px 18px', marginTop: 16 },
  tipIcon: { fontSize: 22, flexShrink: 0 },
  tipLabel: { fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--gold)', letterSpacing: 2, marginBottom: 6 },
  tipText: { fontSize: 13, color: 'var(--text)', lineHeight: 1.7 },
};
