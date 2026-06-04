// src/hooks/useAnalysis.js
// 발표 분석 파이프라인 상태 관리
//
// 흐름:
//   runAnalysis(slideBlobs, pptTitle, pptFile)
//     1. POST /api/v1/presentations              → presentationId
//     2. POST /api/v1/presentations/{id}/ppt-url → pptUploadUrl → S3 PUT
//     3. 슬라이드별: POST /{id}/audio-url → audioUploadUrl → S3 PUT
//     4. POST localhost:8001/api/v1/feedback     → FeedbackResponse

import { useState, useCallback } from 'react';
import { uploadSlideAudio, createFeedbackSession, generateFeedback, getPptUploadUrl, uploadToS3, analyzeVoice, getUserId } from '../utils/api';

export const ANALYSIS_STATUS = {
  IDLE:         'idle',
  UPLOADING:    'uploading',
  TRANSCRIBING: 'transcribing',
  GENERATING:   'generating',
  DONE:         'done',
  ERROR:        'error',
};

export function useAnalysis() {
  const [status, setStatus]               = useState(ANALYSIS_STATUS.IDLE);
  const [progress, setProgress]           = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [result, setResult]               = useState(null);
  const [error, setError]                 = useState(null);
  const [presentationId, setPresentationId] = useState(null);

  // slideBlobs : Blob[]  — 슬라이드별 병합 녹음 (useSlideRecorder.finish() 의 slideBlobs)
  // pptTitle   : string
  // pptFile    : File    — 원본 PPT/PDF 파일 (S3 업로드용)
  const runAnalysis = useCallback(async (slideBlobs, pptTitle, pptFile) => {
    setError(null);
    setResult(null);

    try {
      const total = slideBlobs.length;

      // ── 1. 발표 세션 생성 → feedback_id ──────────────────
      setStatus(ANALYSIS_STATUS.UPLOADING);
      setProgress(3);
      setProgressLabel('발표 세션 생성 중...');

      const { presentationId: feedback_id } = await createFeedbackSession(pptTitle);
      setPresentationId(feedback_id);

      // ── 1-b. PPT/PDF → S3 업로드 (presigned URL) ─────────
      setProgress(8);
      setProgressLabel('발표 자료 업로드 중...');

      const pptContentType = pptFile.type || 'application/octet-stream';
      const { pptUploadUrl } = await getPptUploadUrl(feedback_id, pptContentType);
      await uploadToS3(pptUploadUrl, pptFile, pptContentType);

      // ── 2. 슬라이드별 오디오 presigned URL 발급 → S3 PUT ─
      for (let i = 0; i < total; i++) {
        setStatus(ANALYSIS_STATUS.UPLOADING);
        setProgress(Math.round(15 + (i / total) * 60));
        setProgressLabel(`녹음 업로드 중... (${i + 1} / ${total})`);

        const rawMime = slideBlobs[i].type || 'audio/webm';
        const baseMime = rawMime.split(';')[0];
        const ext = baseMime === 'audio/ogg' ? 'ogg' : baseMime === 'audio/mp4' ? 'mp4' : 'webm';
        const file = new File(
          [slideBlobs[i]],
          `slide_${i + 1}.${ext}`,
          { type: baseMime },
        );
        await uploadSlideAudio(file, feedback_id, i + 1);

      }

      // ── 3. 음성 학습 서버 → 음성 분석 ──────────────────────
      setStatus(ANALYSIS_STATUS.TRANSCRIBING);
      setProgress(76);
      setProgressLabel('음성 분석 중...');

      try {
        await analyzeVoice(getUserId(), feedback_id);
      } catch (e) {
        console.warn('음성 분석 실패 (계속 진행):', e.message);
      }

      // ── 4. presentation-feedback 서비스 → GPT 피드백 ────
      setStatus(ANALYSIS_STATUS.GENERATING);
      setProgress(82);
      setProgressLabel('AI 피드백 생성 중...');

      const feedbackResult = await generateFeedback(feedback_id, true);

      setProgress(100);
      setResult(feedbackResult);   // FeedbackResponse 형태
      setStatus(ANALYSIS_STATUS.DONE);
    } catch (e) {
      setError(e.message);
      setStatus(ANALYSIS_STATUS.ERROR);
      throw e;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus(ANALYSIS_STATUS.IDLE);
    setProgress(0);
    setProgressLabel('');
    setResult(null);
    setError(null);
    setPresentationId(null);
  }, []);

  return {
    status, progress, progressLabel,
    result, error, presentationId,
    runAnalysis, reset,
  };
}
