// src/utils/api.js
// 백엔드 FastAPI 서버 통신 클라이언트

export const API_BASE = process.env.REACT_APP_API_URL;

const TOKEN_KEY    = 'pitchlens_token';
const NAME_KEY     = 'pitchlens_name';
const EMAIL_KEY    = 'pitchlens_email';
const USER_ID_KEY  = 'pitchlens_user_id';

// ── JWT 토큰 관리 ─────────────────────────────────────────
export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(NAME_KEY);
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(USER_ID_KEY);
}

export function isLoggedIn() {
  return !!getToken();
}

export function getUserName()  { return localStorage.getItem(NAME_KEY)   || ''; }
export function getUserEmail() { return localStorage.getItem(EMAIL_KEY)  || ''; }
export function getUserId()    { return localStorage.getItem(USER_ID_KEY) ? Number(localStorage.getItem(USER_ID_KEY)) : null; }

function isLikelyNetworkFailure(e) {
  const msg = String(e?.message || e || '');
  return (
    msg.includes('Failed to fetch') ||
    msg.includes('NetworkError') ||
    msg.includes('Load failed')
  );
}

function describeUrl(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url;
  }
}

function connectionError(label, url, e) {
  if (!isLikelyNetworkFailure(e)) return e;

  const target = describeUrl(url);
  return new Error(`Failed to fetch ${label} (${target}). 서버 실행 상태, 방화벽, CORS를 확인하세요.`);
}

async function fetchWithContext(url, options, label) {
  try {
    return await fetch(url, options);
  } catch (e) {
    throw connectionError(label, url, e);
  }
}

// ── 공통 JSON 요청 헬퍼 ───────────────────────────────────
async function post(path, body) {
  const url = `${API_BASE}${path}`;
  const res = await fetchWithContext(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(body),
  }, `백엔드 서버`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || err?.message || `서버 오류: ${res.status}`);
  }
  return res.json();
}

// ── 인증 ─────────────────────────────────────────────────

export async function login(email, password) {
  const url = `${API_BASE}/api/v1/users/login`;
  const res = await fetchWithContext(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }, '로그인 서버');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || err?.message || '로그인에 실패했습니다.');
  }
  const data = await res.json();
  const raw = data.token || '';
  setToken(raw.startsWith('Bearer ') ? raw.slice(7) : raw);
  if (data.name)    localStorage.setItem(NAME_KEY,     data.name);
  if (email)        localStorage.setItem(EMAIL_KEY,    email);
  if (data.userId)  localStorage.setItem(USER_ID_KEY, String(data.userId));
  return data;
}

export async function register(name, email, password) {
  const url = `${API_BASE}/api/v1/users/signup`;
  const res = await fetchWithContext(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  }, '회원가입 서버');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || err?.message || '회원가입에 실패했습니다.');
  }
  return res.text();
}

// ── Whisper 전사 ──────────────────────────────────────────
// POST /transcribe  { audio_key }
// → { text, duration, segments }
export async function transcribeAudio(audioKey) {
  const data = await post('/transcribe', { audio_key: audioKey });
  return {
    text:     data.text     || '',
    duration: data.duration ?? 0,
    segments: data.segments ?? [],
  };
}

// ── 발표 세션 생성 ────────────────────────────────────────
// POST /api/v1/presentations  { title }
// → { presentationId }
export async function createFeedbackSession(title) {
  return post('/api/v1/presentations', { title });
}

// ── PPT 업로드 URL 발급 ───────────────────────────────────
// POST /api/v1/presentations/{id}/ppt-url → { pptUploadUrl, pptKey }
export async function getPptUploadUrl(presentationId, contentType) {
  const url = `${API_BASE}/api/v1/presentations/${presentationId}/ppt-url`;
  const res = await fetchWithContext(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ contentType }),
  }, 'PPT 업로드 서버');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || `PPT URL 발급 실패: ${res.status}`);
  }
  return res.json();
}

// ── S3 직접 업로드 ────────────────────────────────────────
export async function uploadToS3(presignedUrl, file, contentType) {
  const res = await fetchWithContext(presignedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  }, 'S3 업로드 주소');
  if (!res.ok) throw new Error(`S3 업로드 실패: ${res.status}`);
}

// ── 슬라이드별 오디오 업로드 (S3 presigned URL 방식) ──────
// 1) POST /api/v1/presentations/{id}/audio-url { slideIndex, contentType } → { audioUploadUrl, audioKey }
// 2) PUT {audioUploadUrl} — S3 직접 업로드
export async function uploadSlideAudio(audioFile, presentationId, slideIndex) {
  // codec 정보(;codecs=opus 등) 제거 — 음성 서버가 base MIME만 인식하는 경우 대비
  const contentType = (audioFile.type || 'audio/webm').split(';')[0];

  const url = `${API_BASE}/api/v1/presentations/${presentationId}/audio-url`;
  const res = await fetchWithContext(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ slideIndex, contentType }),
  }, '오디오 업로드 서버');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || `오디오 URL 발급 실패: ${res.status}`);
  }
  const { audioUploadUrl } = await res.json();

  await uploadToS3(audioUploadUrl, audioFile, contentType);
}

// ── 슬라이드별 전사 + 분석 저장 ──────────────────────────
// POST /transcribe/slide  { audio_key, feedback_id, slide_index }
// → { text, duration, speed_label, wpm, filler_label, filler_count, filler_ratio }
// TODO: 백엔드에 이 엔드포인트 구현 필요
//       Whisper 전사 + 속도/필러 분석 후 audio_analysis 테이블에 저장
export async function transcribeSlide(audioKey, feedbackId, slideIndex) {
  const data = await post('/transcribe/slide', {
    audio_key:   audioKey,
    feedback_id: feedbackId,
    slide_index: slideIndex,
  });
  return {
    text:     data.text     || '',
    duration: data.duration ?? 0,
  };
}

// ── presentation-feedback 서비스 호출 ────────────────────
// POST /api/v1/feedback  { feedback_id, use_vision }
// → FeedbackResponse (schemas.py 참조)
const FEEDBACK_API_BASE = process.env.REACT_APP_FEEDBACK_API_URL;

export async function generateFeedback(feedbackId, useVision = true) {
  const base = FEEDBACK_API_BASE;
  if (!base) {
    throw new Error('REACT_APP_FEEDBACK_API_URL이 비어 있습니다. .env 확인 후 재빌드하세요.');
  }
  let res;
  try {
    const url = `${base}/api/v1/feedback`;
    res = await fetchWithContext(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback_id: feedbackId, use_vision: useVision }),
    }, 'AI 피드백 서버');
  } catch (e) {
    if (isLikelyNetworkFailure(e)) {
      throw new Error(
        [
          'Failed to fetch',
          `AI 피드백 서버 (${base})에 연결하지 못했습니다.`,
          'Spring(:8080)과 별도로 FastAPI 피드백 서버(보통 :8001)·방화벽·보안그룹을 확인하세요.',
        ].join(' '),
      );
    }
    throw e;
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || err?.message || '피드백 생성에 실패했습니다.');
  }
  return res.json(); // FeedbackResponse
}

// ── 회원 탈퇴 ─────────────────────────────────────────────
// DELETE /api/v1/users
export async function deleteMyAccount() {
  const url = `${API_BASE}/api/v1/users`;
  const res = await fetchWithContext(url, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getToken()}` },
  }, '회원 서버');
  if (!res.ok) throw new Error('회원 탈퇴에 실패했습니다.');
  return res.json();
}

// ── 내 정보 조회 ──────────────────────────────────────────
// GET /api/v1/users/me → { userId, email, name, role }
export async function getMyInfo() {
  const url = `${API_BASE}/api/v1/users/me`;
  const res = await fetchWithContext(url, {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  }, '회원 서버');
  if (!res.ok) throw new Error('사용자 정보를 불러오지 못했습니다.');
  return res.json();
}

// ── 음성 학습 서버 ────────────────────────────────────────
const VOICE_API_BASE = process.env.REACT_APP_VOICE_API_URL;

// POST /api/v1/voice/analyze  { user_id, feedback_id }
export async function analyzeVoice(userId, feedbackId) {
  const url = `${VOICE_API_BASE}/api/v1/voice/analyze`;
  const res = await fetchWithContext(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, feedback_id: feedbackId }),
  }, '음성 분석 서버');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || err?.message || `음성 분석 서버 오류: ${res.status}`);
  }
  return res.json();
}

// ── 마이페이지 ────────────────────────────────────────────
// GET /api/v1/presentations → [{ presentationId, title, feedbackContent, createdAt }]
export async function getMyPresentations() {
  const url = `${API_BASE}/api/v1/presentations`;
  const res = await fetchWithContext(url, {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  }, '발표 목록 서버');
  if (!res.ok) throw new Error('발표 목록을 불러오지 못했습니다.');
  return res.json();
}

// GET /api/v1/presentations/{id}/url → { presentationId, title, pptUrl, createdAt, feedbackResult, slides }
export async function getPresentationDetail(id) {
  const url = `${API_BASE}/api/v1/presentations/${id}/url`;
  const res = await fetchWithContext(url, {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  }, '발표 상세 서버');
  if (!res.ok) throw new Error('발표 상세 정보를 불러오지 못했습니다.');
  return res.json();
}

// DELETE /api/v1/presentations/{id}
export async function deletePresentationById(id) {
  const url = `${API_BASE}/api/v1/presentations/${id}`;
  const res = await fetchWithContext(url, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getToken()}` },
  }, '발표 삭제 서버');
  if (!res.ok) throw new Error('발표 삭제에 실패했습니다.');
  return res.json();
}
