import React, { useRef } from 'react';

export default function SlideAudioList({ slides, audioMap, onAssign, onRemove }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {slides.map(slide => (
        <SlideRow
          key={slide.index}
          slide={slide}
          audio={audioMap[slide.index]}
          onAssign={f => onAssign(slide.index, f)}
          onRemove={() => onRemove(slide.index)}
        />
      ))}
    </div>
  );
}

function SlideRow({ slide, audio, onAssign, onRemove }) {
  const inputRef = useRef();

  return (
    <div
      style={{ ...s.row, ...(audio ? s.rowDone : {}) }}
      onDragOver={e => e.preventDefault()}
      onDrop={e => {
        e.preventDefault();
        const f = e.dataTransfer.files[0];
        if (f?.type.startsWith('audio/')) onAssign(f);
      }}
    >
      {/* 번호 */}
      <div style={{ ...s.num, ...(audio ? s.numDone : {}) }}>
        {audio ? '✓' : slide.index + 1}
      </div>

      {/* 슬라이드 정보 */}
      <div style={s.info}>
        <div style={s.slideTitle}>{slide.title}</div>
        {slide.texts.length > 1 && (
          <div style={s.slidePreview}>{slide.texts.slice(1, 3).join(' · ')}</div>
        )}
      </div>

      {/* 오디오 영역 */}
      <div style={s.audioZone}>
        {audio ? (
          <div style={s.chip}>
            <span style={s.chipDot} />
            <span style={s.chipName}>{audio.name.length > 18 ? audio.name.slice(0, 18) + '…' : audio.name}</span>
            <span style={s.chipSize}>{(audio.size / 1024 / 1024).toFixed(1)}MB</span>
            <button style={s.removeBtn} onClick={onRemove} title="제거">✕</button>
          </div>
        ) : (
          <button style={s.addBtn} onClick={() => inputRef.current.click()}>
            <span style={s.addIcon}>🎤</span>
            <span>녹음 추가</span>
          </button>
        )}
        <input ref={inputRef} type="file" accept="audio/*" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files[0]; if (f) onAssign(f); }} />
      </div>
    </div>
  );
}

const s = {
  row: { display: 'flex', alignItems: 'center', gap: 14, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', transition: 'all 0.2s' },
  rowDone: { borderColor: 'rgba(0,201,167,0.35)', background: 'rgba(0,201,167,0.04)' },
  num: { width: 34, height: 34, borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text2)', flexShrink: 0, fontWeight: 500 },
  numDone: { background: 'rgba(0,201,167,0.15)', border: '1px solid rgba(0,201,167,0.4)', color: 'var(--teal)' },
  info: { flex: 1, minWidth: 0 },
  slideTitle: { fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 2 },
  slidePreview: { fontSize: 11, color: 'var(--text2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  audioZone: { flexShrink: 0 },
  chip: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,201,167,0.12)', border: '1px solid rgba(0,201,167,0.25)', borderRadius: 8, padding: '7px 12px', fontSize: 12 },
  chipDot: { width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)', flexShrink: 0, boxShadow: '0 0 6px var(--teal)' },
  chipName: { color: 'var(--text)', fontWeight: 500, fontFamily: 'var(--font-mono)', fontSize: 11 },
  chipSize: { color: 'var(--text2)', fontSize: 11 },
  removeBtn: { background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 11, padding: '0 2px', lineHeight: 1 },
  addBtn: { display: 'flex', alignItems: 'center', gap: 7, background: 'var(--surface2)', border: '1px dashed var(--border2)', borderRadius: 8, padding: '8px 14px', color: 'var(--text2)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s' },
  addIcon: { fontSize: 14 },
};
