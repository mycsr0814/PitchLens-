// src/components/HelpModal.jsx
import React, { useState } from 'react';

const STORAGE_KEY = 'pitchlens_help_seen';

export function shouldShowHelp() {
  try { return !localStorage.getItem(STORAGE_KEY); }
  catch { return false; }
}

export default function HelpModal({ onClose }) {
  const [page, setPage]         = useState(0); // 0=선택, 1-3=가이드
  const [dontShow, setDontShow] = useState(false);

  const handleClose = (forceMarkSeen = false) => {
    if (dontShow || forceMarkSeen) {
      try { localStorage.setItem(STORAGE_KEY, '1'); } catch {}
    }
    onClose();
  };

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && handleClose()}>
      <div style={s.modal}>
        <div style={s.glow} />
        <button style={s.closeBtn} onClick={() => handleClose()}>✕</button>

        {page === 0 ? (
          <ChoicePage
            dontShow={dontShow}
            setDontShow={setDontShow}
            onGuide={() => setPage(1)}
            onStart={() => handleClose()}
          />
        ) : (
          <GuidePage
            step={page - 1}
            onBack={() => setPage(p => p - 1)}
            onNext={() => setPage(p => p + 1)}
            onDone={() => handleClose(true)}
          />
        )}
      </div>
    </div>
  );
}

// ── 선택 화면 ────────────────────────────────────────────────
function ChoicePage({ dontShow, setDontShow, onGuide, onStart }) {
  return (
    <div style={s.choicePage}>
      <div style={s.choiceLogo}>
        PITCH<span style={{ color: 'var(--gold)' }}>LENS</span>
      </div>
      <div style={s.choiceTitle}>환영합니다!</div>
      <div style={s.choiceDesc}>
        PPT/PDF를 업로드하고 슬라이드별로 발표를 녹음하면<br />
        AI가 상세한 피드백을 즉시 제공합니다.
      </div>

      <div style={s.cards}>
        <button style={s.guideCard} onClick={onGuide}>
          <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
            <rect x="5" y="3" width="16" height="21" rx="2"
              fill="rgba(245,166,35,0.12)" stroke="var(--gold)" strokeWidth="1.5"/>
            <rect x="9" y="8" width="8" height="2" rx="1" fill="var(--gold)" opacity="0.8"/>
            <rect x="9" y="12" width="8" height="1.5" rx="0.75" fill="var(--gold)" opacity="0.5"/>
            <rect x="9" y="15.5" width="5" height="1.5" rx="0.75" fill="var(--gold)" opacity="0.5"/>
            <circle cx="24" cy="24" r="6" fill="rgba(245,166,35,0.15)" stroke="var(--gold)" strokeWidth="1.5"/>
            <path d="M21.5 24l2 2 3-3" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div style={s.cardTitle}>가이드 보기</div>
          <div style={s.cardDesc}>화면별 사용법을<br />단계적으로 안내합니다</div>
        </button>

        <button style={s.startCard} onClick={onStart}>
          <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="12" fill="var(--surface2)" stroke="var(--border2)" strokeWidth="1.5"/>
            <path d="M13 11l9 5-9 5V11z" fill="var(--text3)"/>
          </svg>
          <div style={{ ...s.cardTitle, color: 'var(--text2)' }}>바로 시작</div>
          <div style={{ ...s.cardDesc, color: 'var(--text3)' }}>이미 사용법을<br />알고 있다면</div>
        </button>
      </div>

      <label style={s.checkLabel}>
        <input
          type="checkbox"
          checked={dontShow}
          onChange={e => setDontShow(e.target.checked)}
          style={{ accentColor: 'var(--gold)', cursor: 'pointer' }}
        />
        다음 로그인 시 보지 않기
      </label>
    </div>
  );
}

// ── 가이드 화면 ──────────────────────────────────────────────
const GUIDE_DATA = [
  {
    badge: 'STEP 01 / 03',
    title: '발표 파일 업로드',
    desc: 'PPT, PPTX, PDF 파일을 업로드하여 슬라이드를 준비합니다.',
    tips: [
      '파일을 화면에 드래그하거나 클릭하여 업로드',
      'PPT · PPTX · PDF 형식 모두 지원',
      '업로드 후 슬라이드 미리보기로 내용 확인 가능',
    ],
    Illustration: UploadIllustration,
    color: 'var(--gold)',
    borderColor: 'rgba(245,166,35,0.35)',
  },
  {
    badge: 'STEP 02 / 03',
    title: '슬라이드별 발표 녹음',
    desc: '각 슬라이드를 화면에 보며 실제 발표하듯 마이크로 녹음합니다.',
    tips: [
      '슬라이드마다 독립적으로 녹음 가능',
      '결과가 마음에 들지 않으면 다시 녹음',
      '모든 슬라이드 완료 후 AI 분석 자동 시작',
    ],
    Illustration: RecordingIllustration,
    color: 'var(--teal)',
    borderColor: 'rgba(100,200,200,0.35)',
  },
  {
    badge: 'STEP 03 / 03',
    title: 'AI 피드백 확인',
    desc: '발표 내용의 발음, 속도, 슬라이드 일치도를 AI가 분석합니다.',
    tips: [
      '슬라이드별 내용 일치도(유사도) 점수 제공',
      '발화 속도(WPM)와 발표 내용 요약 포함',
      'PDF로 결과를 내보내어 저장 가능',
    ],
    Illustration: FeedbackIllustration,
    color: 'var(--gold)',
    borderColor: 'rgba(245,166,35,0.35)',
  },
];

function GuidePage({ step, onBack, onNext, onDone }) {
  const guide = GUIDE_DATA[step];
  const isLast = step === GUIDE_DATA.length - 1;

  return (
    <div style={s.guidePage}>
      <div style={{ ...s.guideBadge, color: guide.color, borderColor: guide.borderColor }}>
        {guide.badge}
      </div>

      <div style={s.illustWrap}>
        <guide.Illustration />
      </div>

      <div style={s.guideTitle}>{guide.title}</div>
      <div style={s.guideDesc}>{guide.desc}</div>

      <div style={s.tipList}>
        {guide.tips.map((tip, i) => (
          <div key={i} style={s.tipRow}>
            <div style={{ ...s.tipDot, background: guide.color }} />
            <span style={s.tipText}>{tip}</span>
          </div>
        ))}
      </div>

      <div style={s.guideFooter}>
        <button style={s.navBack} onClick={onBack}>← 이전</button>
        <div style={s.dots}>
          {GUIDE_DATA.map((_, i) => (
            <div key={i} style={i === step ? s.dotActive : s.dot} />
          ))}
        </div>
        {isLast ? (
          <button style={s.navDone} onClick={onDone}>시작하기 →</button>
        ) : (
          <button style={{ ...s.navNext, borderColor: guide.borderColor, color: guide.color }}
            onClick={onNext}>
            다음 →
          </button>
        )}
      </div>
    </div>
  );
}

// ── 일러스트레이션 ────────────────────────────────────────────

function UploadIllustration() {
  return (
    <svg style={{ width: '100%', display: 'block' }} viewBox="0 0 460 130" fill="none">
      {/* 앱 헤더 */}
      <rect width="460" height="28" rx="6" fill="#12151c"/>
      <circle cx="14" cy="14" r="4" fill="#3a3a3a"/>
      <circle cx="26" cy="14" r="4" fill="#3a3a3a"/>
      <circle cx="38" cy="14" r="4" fill="#3a3a3a"/>
      <rect x="96" y="9" width="80" height="10" rx="3" fill="rgba(245,166,35,0.25)"/>
      <rect x="354" y="9" width="50" height="10" rx="3" fill="#1d2130"/>
      <rect x="410" y="9" width="40" height="10" rx="3" fill="#1d2130"/>

      {/* 업로드 드롭존 */}
      <rect x="10" y="36" width="440" height="86" rx="10"
        fill="#0a0d14" stroke="#f5a623" strokeWidth="1.5" strokeDasharray="6,4"/>

      {/* 텍스트 힌트 (placeholder bars) */}
      <rect x="156" y="48" width="148" height="7" rx="2" fill="#1d2130"/>
      <rect x="182" y="59" width="96" height="5" rx="2" fill="#161923"/>

      {/* 업로드 화살표 */}
      <path d="M230 100V72M230 72l-14 14M230 72l14 14"
        stroke="#f5a623" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="212" y1="112" x2="248" y2="112"
        stroke="#f5a623" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>

      {/* 형식 배지 */}
      <rect x="176" y="116" width="108" height="12" rx="6"
        fill="rgba(245,166,35,0.1)" stroke="rgba(245,166,35,0.3)" strokeWidth="1"/>
      <rect x="190" y="119" width="80" height="6" rx="3" fill="rgba(245,166,35,0.35)"/>
    </svg>
  );
}

function RecordingIllustration() {
  return (
    <svg style={{ width: '100%', display: 'block' }} viewBox="0 0 460 130" fill="none">
      {/* 앱 헤더 */}
      <rect width="460" height="28" rx="6" fill="#12151c"/>
      <circle cx="14" cy="14" r="4" fill="#3a3a3a"/>
      <circle cx="26" cy="14" r="4" fill="#3a3a3a"/>
      <circle cx="38" cy="14" r="4" fill="#3a3a3a"/>
      <rect x="150" y="9" width="160" height="10" rx="3" fill="#1d2130"/>

      {/* 슬라이드 패널 (왼쪽) */}
      <rect x="10" y="36" width="205" height="86" rx="8" fill="#0a0d14" stroke="#2a2e3a" strokeWidth="1"/>
      <rect x="20" y="47" width="96" height="7" rx="2" fill="rgba(245,166,35,0.3)"/>
      <rect x="20" y="59" width="175" height="4" rx="2" fill="#1d2130"/>
      <rect x="20" y="67" width="145" height="4" rx="2" fill="#1d2130"/>
      <rect x="20" y="75" width="160" height="4" rx="2" fill="#1d2130"/>
      <rect x="20" y="83" width="110" height="4" rx="2" fill="#1d2130"/>
      {/* 슬라이드 번호 */}
      <rect x="175" y="106" width="32" height="10" rx="3" fill="rgba(0,0,0,0.65)"/>
      <rect x="181" y="109" width="20" height="4" rx="1" fill="rgba(255,255,255,0.35)"/>

      {/* 녹음 패널 (오른쪽) */}
      <rect x="225" y="36" width="225" height="86" rx="8" fill="#0a0d14" stroke="#2a2e3a" strokeWidth="1"/>

      {/* 슬라이드 진행 표시 */}
      <rect x="237" y="44" width="90" height="8" rx="3" fill="rgba(100,200,200,0.18)"/>
      <rect x="241" y="46" width="82" height="4" rx="1" fill="rgba(100,200,200,0.4)"/>

      {/* 파형 */}
      <rect x="238" y="73" width="5" height="22" rx="2.5" fill="#64c8c8" opacity="0.35"/>
      <rect x="247" y="64" width="5" height="40" rx="2.5" fill="#64c8c8" opacity="0.55"/>
      <rect x="256" y="69" width="5" height="30" rx="2.5" fill="#64c8c8" opacity="0.7"/>
      <rect x="265" y="57" width="5" height="54" rx="2.5" fill="#64c8c8"/>
      <rect x="274" y="65" width="5" height="38" rx="2.5" fill="#64c8c8" opacity="0.8"/>
      <rect x="283" y="70" width="5" height="28" rx="2.5" fill="#64c8c8" opacity="0.6"/>
      <rect x="292" y="75" width="5" height="18" rx="2.5" fill="#64c8c8" opacity="0.4"/>
      <rect x="301" y="77" width="5" height="14" rx="2.5" fill="#64c8c8" opacity="0.25"/>

      {/* 녹음 버튼 */}
      <circle cx="390" cy="83" r="22" fill="#1a1d24" stroke="#2a2e3a" strokeWidth="1.5"/>
      <circle cx="390" cy="83" r="13" fill="#e63946"/>
      <rect x="385" y="78" width="10" height="10" rx="2" fill="#fff" opacity="0.9"/>
    </svg>
  );
}

function FeedbackIllustration() {
  return (
    <svg style={{ width: '100%', display: 'block' }} viewBox="0 0 460 130" fill="none">
      {/* 앱 헤더 */}
      <rect width="460" height="28" rx="6" fill="#12151c"/>
      <circle cx="14" cy="14" r="4" fill="#3a3a3a"/>
      <circle cx="26" cy="14" r="4" fill="#3a3a3a"/>
      <circle cx="38" cy="14" r="4" fill="#3a3a3a"/>
      <rect x="96" y="9" width="120" height="10" rx="3" fill="rgba(245,166,35,0.2)"/>
      <rect x="378" y="9" width="72" height="10" rx="3"
        fill="rgba(245,166,35,0.1)" stroke="rgba(245,166,35,0.3)" strokeWidth="0.8"/>

      {/* 전체 점수 카드 */}
      <rect x="10" y="36" width="440" height="32" rx="8" fill="#0a0d14" stroke="#2a2e3a" strokeWidth="1"/>
      <rect x="20" y="42" width="64" height="5" rx="2" fill="#2a2e3a"/>
      <rect x="20" y="51" width="220" height="8" rx="4" fill="#1d2130"/>
      <rect x="20" y="51" width="176" height="8" rx="4" fill="rgba(245,166,35,0.65)"/>
      <rect x="392" y="40" width="50" height="18" rx="5"
        fill="rgba(245,166,35,0.1)" stroke="rgba(245,166,35,0.35)" strokeWidth="1"/>
      <rect x="400" y="46" width="34" height="6" rx="2" fill="rgba(245,166,35,0.5)"/>

      {/* 슬라이드별 피드백 행 1 */}
      <rect x="10" y="76" width="440" height="16" rx="6" fill="#0a0d14" stroke="#1d2130" strokeWidth="1"/>
      <rect x="18" y="81" width="36" height="6" rx="2" fill="#1d2130"/>
      <rect x="62" y="81" width="148" height="6" rx="3" fill="rgba(245,166,35,0.55)"/>
      <rect x="380" y="81" width="64" height="6" rx="2" fill="#1d2130"/>

      {/* 슬라이드별 피드백 행 2 */}
      <rect x="10" y="96" width="440" height="16" rx="6" fill="#0a0d14" stroke="#1d2130" strokeWidth="1"/>
      <rect x="18" y="101" width="36" height="6" rx="2" fill="#1d2130"/>
      <rect x="62" y="101" width="190" height="6" rx="3" fill="rgba(100,200,200,0.5)"/>
      <rect x="380" y="101" width="64" height="6" rx="2" fill="#1d2130"/>

      {/* 슬라이드별 피드백 행 3 */}
      <rect x="10" y="116" width="440" height="10" rx="5" fill="#0a0d14" stroke="#1a2030" strokeWidth="1"/>
      <rect x="18" y="119" width="36" height="4" rx="1.5" fill="#161923"/>
      <rect x="62" y="119" width="116" height="4" rx="2" fill="rgba(245,166,35,0.3)"/>
      <rect x="380" y="119" width="64" height="4" rx="1.5" fill="#161923"/>
    </svg>
  );
}

// ── 스타일 ──────────────────────────────────────────────────
const s = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(8,10,14,0.88)',
    backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 300, padding: 24,
  },
  modal: {
    background: 'var(--surface)', border: '1px solid var(--border2)',
    borderRadius: 20, padding: '32px 28px', maxWidth: 520, width: '100%',
    position: 'relative', overflow: 'hidden',
    boxShadow: '0 40px 80px rgba(0,0,0,0.5)', animation: 'fadeUp 0.3s ease',
  },
  glow: {
    position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
    width: 320, height: 200,
    background: 'radial-gradient(ellipse, rgba(245,166,35,0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  closeBtn: {
    position: 'absolute', top: 16, right: 16,
    background: 'none', border: 'none', color: 'var(--text3)',
    cursor: 'pointer', fontSize: 16, padding: '4px 6px', lineHeight: 1, borderRadius: 4,
  },

  // ── 선택 화면
  choicePage:  { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  choiceLogo:  { fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: 3, color: 'var(--text)', marginBottom: 12 },
  choiceTitle: { fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 8, fontFamily: 'var(--font-body)' },
  choiceDesc:  { fontSize: 13, color: 'var(--text2)', textAlign: 'center', lineHeight: 1.7, marginBottom: 24 },
  cards:       { display: 'flex', gap: 12, width: '100%', marginBottom: 20 },
  guideCard:   {
    flex: 1, background: 'rgba(245,166,35,0.05)', border: '1px solid rgba(245,166,35,0.35)',
    borderRadius: 14, padding: '20px 12px', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center',
  },
  startCard:   {
    flex: 1, background: 'var(--surface2)', border: '1px solid var(--border2)',
    borderRadius: 14, padding: '20px 12px', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center',
  },
  cardTitle:   { fontSize: 14, fontWeight: 600, color: 'var(--text)' },
  cardDesc:    { fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 },
  checkLabel:  {
    display: 'flex', alignItems: 'center', gap: 8,
    fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--font-mono)',
    cursor: 'pointer', userSelect: 'none',
  },

  // ── 가이드 화면
  guidePage:   { display: 'flex', flexDirection: 'column' },
  guideBadge:  {
    alignSelf: 'flex-start', fontSize: 11, fontFamily: 'var(--font-mono)',
    letterSpacing: 1.5, border: '1px solid', borderRadius: 20,
    padding: '3px 10px', marginBottom: 14,
  },
  illustWrap:  { borderRadius: 10, overflow: 'hidden', marginBottom: 16, border: '1px solid var(--border)' },
  guideTitle:  { fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 6 },
  guideDesc:   { fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 14 },
  tipList:     { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 },
  tipRow:      { display: 'flex', alignItems: 'center', gap: 10 },
  tipDot:      { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
  tipText:     { fontSize: 13, color: 'var(--text)', lineHeight: 1.5 },

  guideFooter: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 16, borderTop: '1px solid var(--border)',
  },
  dots:        { display: 'flex', gap: 6 },
  dot:         { width: 7, height: 7, borderRadius: '50%', background: 'var(--border2)' },
  dotActive:   { width: 7, height: 7, borderRadius: '50%', background: 'var(--gold)' },
  navBack:     { background: 'none', border: '1px solid var(--border2)', borderRadius: 8, padding: '8px 14px', color: 'var(--text2)', fontSize: 12, fontFamily: 'var(--font-mono)', cursor: 'pointer' },
  navNext:     { background: 'none', border: '1px solid', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontFamily: 'var(--font-mono)', cursor: 'pointer' },
  navDone:     { background: 'linear-gradient(135deg, var(--gold), var(--gold2))', color: '#000', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 700, letterSpacing: 0.5, cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: '0 0 16px var(--gold-glow)' },
};
