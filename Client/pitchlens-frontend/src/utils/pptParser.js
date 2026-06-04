// src/utils/pptParser.js
// PPT 업로드 및 오디오 업로드 — 백엔드 API 연동

import { API_BASE, getToken } from './api';

// ── PPT 업로드 및 파싱 ────────────────────────────────────
// POST /upload/ppt (multipart)
// → { slides, ppt_file_key, title, total_slides }
export async function parsePPTX(file, onProgress) {
  const name = file.name.toLowerCase();
  if (!name.endsWith('.pptx') && !name.endsWith('.ppt')) {
    throw new Error('.ppt 또는 .pptx 파일만 지원합니다.');
  }

  onProgress?.(0.2);

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload/ppt`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken()}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || 'PPT 업로드에 실패했습니다.');
  }

  onProgress?.(1);
  return await res.json(); // { slides, ppt_file_key, title, total_slides }
}

// ── 오디오 업로드 ─────────────────────────────────────────
// POST /upload/audio (multipart)
// → { audio_key }
export async function uploadAudio(audioFile, onProgress) {
  onProgress?.(0.2);

  const formData = new FormData();
  formData.append('file', audioFile);

  const res = await fetch(`${API_BASE}/upload/audio`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken()}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || `오디오 업로드 실패: ${res.status}`);
  }

  onProgress?.(1);
  return (await res.json()).audio_key;
}
