import React, { useRef, useState } from 'react';

export default function PPTUploader({ onFile, loading }) {
  const inputRef = useRef();
  const [drag, setDrag] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith('.pptx') && !name.endsWith('.ppt')) {
      alert('.ppt 또는 .pptx 파일만 지원합니다.');
      return;
    }
    onFile(file);
  };

  return (
    <div
      style={{ ...s.zone, ...(drag ? s.dragOver : {}) }}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
      onClick={() => !loading && inputRef.current.click()}
    >
      <input ref={inputRef} type="file" accept=".ppt,.pptx"
        style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />

      {loading ? (
        <div style={s.loadingWrap}>
          <Spinner />
          <div style={s.loadingText}>슬라이드 파싱 중...</div>
          <div style={s.loadingSub}>백엔드에서 python-pptx 처리 중입니다</div>
        </div>
      ) : (
        <div style={s.content}>
          <div style={s.iconBox}>
            <SlideIcon />
          </div>
          <div style={s.mainText}>발표 자료를 드래그하거나 클릭하세요</div>
          <div style={s.subText}>.ppt · .pptx 지원</div>
          <div style={s.badge}>STEP 01</div>
        </div>
      )}
    </div>
  );
}

function SlideIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <rect x="4" y="6" width="36" height="26" rx="3" fill="var(--surface3)" stroke="var(--gold)" strokeWidth="1.5"/>
      <rect x="10" y="12" width="14" height="2" rx="1" fill="var(--gold)" opacity="0.8"/>
      <rect x="10" y="17" width="20" height="1.5" rx="0.75" fill="var(--text3)"/>
      <rect x="10" y="21" width="16" height="1.5" rx="0.75" fill="var(--text3)"/>
      <path d="M20 32 L22 36 L24 32" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

function Spinner() {
  return <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--border2)', borderTopColor: 'var(--gold)', animation: 'spin 0.8s linear infinite' }} />;
}

const s = {
  zone: {
    border: '1.5px dashed var(--border2)', borderRadius: 16,
    padding: '56px 32px', textAlign: 'center', cursor: 'pointer',
    transition: 'all 0.25s', background: 'var(--surface)',
    position: 'relative', overflow: 'hidden',
  },
  dragOver: {
    border: '1.5px dashed var(--gold)',
    background: 'var(--surface2)',
    boxShadow: '0 0 40px var(--gold-glow)',
  },
  content: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  iconBox: { width: 80, height: 80, borderRadius: 20, background: 'var(--surface2)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  mainText: { fontSize: 16, fontWeight: 600, color: 'var(--text)' },
  subText: { fontSize: 13, color: 'var(--text2)' },
  badge: { marginTop: 8, padding: '4px 12px', background: 'var(--gold-glow)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 20, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--gold)', letterSpacing: 2 },
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  loadingText: { fontSize: 15, fontWeight: 600, color: 'var(--text)' },
  loadingSub: { fontSize: 12, color: 'var(--text2)' },
};
