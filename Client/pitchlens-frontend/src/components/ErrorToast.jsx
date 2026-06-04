// src/components/ErrorToast.jsx
// API 연동 실패 등 오류 상황을 토스트 + 모달로 표시합니다.

import React, { useEffect, useState } from 'react';

function extractUrls(message) {
  return Array.from(new Set(String(message || '').match(/https?:\/\/[^\s)]+/g) || []));
}

function configuredServerText() {
  return [
    ['백엔드', process.env.REACT_APP_API_URL],
    ['AI 피드백', process.env.REACT_APP_FEEDBACK_API_URL],
    ['음성 분석', process.env.REACT_APP_VOICE_API_URL],
  ]
    .filter(([, url]) => !!url)
    .map(([label, url]) => `${label}: ${url}`)
    .join('\n');
}

function connectionDetail(message) {
  const urls = extractUrls(message);
  if (urls.length > 0) {
    return `실패한 주소: ${urls.join(', ')}\n\n현재 앱 설정:\n${configuredServerText()}`;
  }
  return `현재 앱 설정:\n${configuredServerText()}`;
}

// ── 오류 타입별 메시지 분류 ───────────────────────────────
export function classifyError(message) {
  if (!message) return null;

  // 네트워크/서버 연결 실패
  if (
    message.includes('Failed to fetch') ||
    message.includes('NetworkError') ||
    message.includes('ERR_CONNECTION_REFUSED') ||
    message.includes('ECONNREFUSED')
  ) {
    return {
      type: 'connection',
      title: '백엔드 서버에 연결할 수 없습니다',
      desc: '서버 주소, 방화벽, CORS 설정을 확인해주세요.',
      detail: connectionDetail(message),
      guide: [
        '실패한 주소의 포트가 서버에서 열려 있는지 확인하세요',
        'Android 에뮬레이터에서 로컬 PC 서버를 쓸 때는 localhost 대신 10.0.2.2를 사용하세요',
        '.env 변경 후 npm run build → npx cap sync android → Android 앱 재설치를 실행하세요',
      ],
      icon: '🔌',
      color: 'var(--red)',
    };
  }

  // 인증 오류 (API 키)
  if (
    message.includes('401') ||
    message.includes('Unauthorized') ||
    message.includes('API 키') ||
    message.includes('api_key') ||
    message.includes('authentication')
  ) {
    return {
      type: 'auth',
      title: 'API 키가 올바르지 않습니다',
      desc: 'OpenAI API 키를 확인해주세요.',
      detail: '키가 만료되었거나 잘못 입력되었을 수 있습니다.',
      guide: [
        '처음부터 버튼을 눌러 API 키를 다시 입력하세요',
        'platform.openai.com에서 키가 유효한지 확인하세요',
        '크레딧이 남아있는지 확인하세요',
      ],
      icon: '🔑',
      color: 'var(--gold)',
    };
  }

  // 크레딧/요금 초과
  if (
    message.includes('quota') ||
    message.includes('exceeded') ||
    message.includes('billing') ||
    message.includes('insufficient_quota')
  ) {
    return {
      type: 'quota',
      title: 'OpenAI 크레딧이 부족합니다',
      desc: 'API 사용 한도를 초과했습니다.',
      detail: 'platform.openai.com에서 크레딧을 충전해주세요.',
      guide: [
        'platform.openai.com/settings/billing 접속',
        'Add credits로 크레딧 충전',
        '충전 후 다시 시도하세요',
      ],
      icon: '💳',
      color: 'var(--gold)',
    };
  }

  // 파일 오류
  if (
    message.includes('파싱') ||
    message.includes('pptx') ||
    message.includes('PPT') ||
    message.includes('슬라이드')
  ) {
    return {
      type: 'file',
      title: 'PPT 파일을 처리할 수 없습니다',
      desc: '파일이 손상되었거나 지원하지 않는 형식입니다.',
      detail: message,
      guide: [
        '.pptx 형식으로 저장 후 다시 시도하세요',
        '파일이 암호화되어 있지 않은지 확인하세요',
        '다른 PPT 파일로 테스트해보세요',
      ],
      icon: '📄',
      color: 'var(--red)',
    };
  }

  // 서버 오류 (500)
  if (message.includes('500') || message.includes('서버 오류')) {
    return {
      type: 'server',
      title: '서버 내부 오류가 발생했습니다',
      desc: '백엔드 서버에서 오류가 발생했습니다.',
      detail: message,
      guide: [
        '잠시 후 다시 시도해주세요',
        '백엔드 담당자에게 문의하세요',
      ],
      icon: '⚙️',
      color: 'var(--red)',
    };
  }

  // 기타 오류
  return {
    type: 'unknown',
    title: '오류가 발생했습니다',
    desc: message,
    detail: null,
    guide: ['다시 시도하거나 처음부터 시작해주세요'],
    icon: '⚠️',
    color: 'var(--red)',
  };
}

// ── 토스트 알림 ───────────────────────────────────────────
export function ErrorToast({ message, onClose }) {
  const [visible, setVisible] = useState(false);
  const info = classifyError(message);

  useEffect(() => {
    if (message) {
      setVisible(true);
      // 연결 오류는 자동으로 닫히지 않음, 나머지는 6초 후 자동 닫기
      if (info?.type !== 'connection') {
        const t = setTimeout(() => { setVisible(false); setTimeout(onClose, 300); }, 6000);
        return () => clearTimeout(t);
      }
    }
  }, [message, info?.type, onClose]);

  if (!message || !info) return null;

  return (
    <div style={{ ...s.toast, ...(visible ? s.toastVisible : s.toastHidden) }}>
      <div style={{ ...s.toastBar, background: info.color }} />
      <div style={s.toastIcon}>{info.icon}</div>
      <div style={s.toastBody}>
        <div style={s.toastTitle}>{info.title}</div>
        <div style={s.toastDesc}>{info.desc}</div>
      </div>
      <button style={s.toastClose} onClick={() => { setVisible(false); setTimeout(onClose, 300); }}>✕</button>
    </div>
  );
}

// ── 상세 오류 모달 ────────────────────────────────────────
export function ErrorModal({ message, onClose, onReset }) {
  const info = classifyError(message);
  if (!message || !info) return null;

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        {/* 상단 글로우 */}
        <div style={{ ...s.modalGlow, background: `radial-gradient(ellipse, ${info.color}22 0%, transparent 70%)` }} />

        {/* 아이콘 */}
        <div style={{ ...s.modalIconWrap, borderColor: `${info.color}40`, background: `${info.color}12` }}>
          <span style={s.modalIcon}>{info.icon}</span>
        </div>

        {/* 제목 */}
        <div style={s.modalTitle}>{info.title}</div>
        <div style={s.modalDesc}>{info.desc}</div>

        {/* 상세 오류 */}
        {info.detail && (
          <div style={s.detailBox}>
            <div style={s.detailLabel}>오류 상세</div>
            <div style={s.detailText}>{info.detail}</div>
          </div>
        )}

        {/* 해결 가이드 */}
        <div style={s.guideBox}>
          <div style={s.guideLabel}>해결 방법</div>
          {info.guide.map((g, i) => (
            <div key={i} style={s.guideItem}>
              <div style={{ ...s.guideNum, color: info.color }}>{i + 1}</div>
              <span>{g}</span>
            </div>
          ))}
        </div>

        {/* 버튼 */}
        <div style={s.btnRow}>
          {onReset && (
            <button style={s.btnReset} onClick={onReset}>↺ 처음부터</button>
          )}
          <button style={{ ...s.btnClose, borderColor: `${info.color}50`, color: info.color }} onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  // 토스트
  toast: { position: 'fixed', top: 80, right: 24, zIndex: 200, display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 14, padding: '14px 16px', maxWidth: 380, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', transition: 'all 0.3s ease', overflow: 'hidden' },
  toastVisible: { opacity: 1, transform: 'translateX(0)' },
  toastHidden:  { opacity: 0, transform: 'translateX(120%)' },
  toastBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  toastIcon: { fontSize: 22, flexShrink: 0 },
  toastBody: { flex: 1, minWidth: 0 },
  toastTitle: { fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3 },
  toastDesc: { fontSize: 12, color: 'var(--text2)', lineHeight: 1.4 },
  toastClose: { background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 13, padding: '0 2px', flexShrink: 0 },

  // 모달
  overlay: { position: 'fixed', inset: 0, background: 'rgba(8,10,14,0.88)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 24 },
  modal: { background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 20, padding: '36px 32px', maxWidth: 440, width: '100%', position: 'relative', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.5)', animation: 'fadeUp 0.3s ease' },
  modalGlow: { position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 300, height: 200, pointerEvents: 'none' },
  modalIconWrap: { width: 72, height: 72, borderRadius: '50%', border: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
  modalIcon: { fontSize: 30 },
  modalTitle: { fontSize: 18, fontWeight: 700, color: 'var(--text)', textAlign: 'center', marginBottom: 8, fontFamily: 'var(--font-body)' },
  modalDesc: { fontSize: 13, color: 'var(--text2)', textAlign: 'center', marginBottom: 20, lineHeight: 1.6 },
  detailBox: { background: 'var(--bg2)', borderRadius: 10, padding: '12px 14px', marginBottom: 16 },
  detailLabel: { fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 },
  detailText: { fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text2)', lineHeight: 1.5, wordBreak: 'break-all' },
  guideBox: { background: 'var(--bg2)', borderRadius: 10, padding: '14px 16px', marginBottom: 24 },
  guideLabel: { fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 },
  guideItem: { display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8, fontSize: 13, color: 'var(--text)', lineHeight: 1.5 },
  guideNum: { width: 20, height: 20, borderRadius: 5, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, flexShrink: 0, marginTop: 1 },
  btnRow: { display: 'flex', gap: 10 },
  btnReset: { flex: 1, padding: '12px', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 10, color: 'var(--text2)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' },
  btnClose: { flex: 1, padding: '12px', background: 'none', border: '1px solid', borderRadius: 10, fontSize: 13, cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font-body)' },
};
