// src/hooks/useSlideRecorder.js
// 슬라이드별 MediaRecorder 관리
//
// 흐름:
//   startRecording() → goNext() / goPrev() → ... → finish()
//
// 이전 슬라이드 이동 시:
//   현재 슬라이드 녹음 저장 → 이전 슬라이드로 이동 → 이어서 녹음
//   (이전 녹음은 유지, 새 세그먼트가 추가됨)
//
// finish() 반환값:
//   { slideBlobs: (Blob|null)[], mergedBlob: Blob }
//   slideBlobs — 슬라이드별 세그먼트 병합 Blob (분석용, null = 미녹음)
//   mergedBlob — 전체 일렬 연결 Blob (저장/재생용)

import { useState, useRef, useCallback, useEffect } from 'react';

function getSupportedMimeType() {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];
  return candidates.find(t => MediaRecorder.isTypeSupported(t)) || '';
}

export function useSlideRecorder(totalSlides) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isRecording, setIsRecording]   = useState(false);
  const [elapsedTime, setElapsedTime]   = useState(0);
  // recordings[i] = Blob[] (세그먼트 배열) | null
  const [recordings, setRecordings] = useState(() => new Array(totalSlides).fill(null));

  // Refs for async-safe access
  const currentSlideRef  = useRef(0);
  const recordingsRef    = useRef(new Array(totalSlides).fill(null));
  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);
  const streamRef        = useRef(null);
  const timerRef         = useRef(null);
  const mimeTypeRef      = useRef('');
  const recordingStartRef = useRef(null); // 전체 녹음 시작 타임스탬프

  // ── 타이머 (전체 녹음 시작부터 단일 카운트) ──────────────
  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    recordingStartRef.current = null;
  }, []);

  const startTimer = useCallback(() => {
    recordingStartRef.current = Date.now();
    setElapsedTime(0);
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.round((Date.now() - recordingStartRef.current) / 1000));
    }, 500);
  }, []);

  // ── 마이크 스트림 ─────────────────────────────────────────
  const getStream = useCallback(async () => {
    if (streamRef.current) return streamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    return stream;
  }, []);

  // ── 현재 녹음 중지 → Blob 반환 ────────────────────────────
  const stopCurrentRecording = useCallback(() => {
    return new Promise((resolve) => {
      const mr = mediaRecorderRef.current;
      if (!mr || mr.state === 'inactive') { resolve(null); return; }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current || 'audio/webm' });
        chunksRef.current = [];
        resolve(blob);
      };
      mr.stop();
    });
  }, []);

  // ── 새 녹음 세그먼트 시작 (타이머는 건드리지 않음) ────────
  const startNewRecording = useCallback(async () => {
    const stream = await getStream();
    if (!mimeTypeRef.current) mimeTypeRef.current = getSupportedMimeType();
    chunksRef.current = [];
    const mr = new MediaRecorder(stream, mimeTypeRef.current ? { mimeType: mimeTypeRef.current } : {});
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.start(100);
    mediaRecorderRef.current = mr;
    setIsRecording(true);
  }, [getStream]);

  // ── 슬라이드 상태 동기 업데이트 ──────────────────────────
  const setSlide = (n) => {
    currentSlideRef.current = n;
    setCurrentSlide(n);
  };

  // 슬라이드 idx에 blob 세그먼트 추가 (기존 세그먼트 유지)
  const saveRecording = (idx, blob) => {
    if (!blob) return;
    recordingsRef.current = [...recordingsRef.current];
    if (!recordingsRef.current[idx]) {
      recordingsRef.current[idx] = [blob];
    } else {
      recordingsRef.current[idx] = [...recordingsRef.current[idx], blob];
    }
    setRecordings([...recordingsRef.current]);
  };

  // ── 공개 API ─────────────────────────────────────────────

  // 처음 녹음 시작 (STEP 1) — 타이머는 여기서 한 번만 시작
  const startRecording = useCallback(async () => {
    startTimer();
    await startNewRecording();
  }, [startTimer, startNewRecording]);

  // 다음 슬라이드: 현재 녹음 저장 → 다음 슬라이드 → 새 녹음
  const goNext = useCallback(async () => {
    const blob = await stopCurrentRecording();
    saveRecording(currentSlideRef.current, blob);
    setSlide(currentSlideRef.current + 1);
    setIsRecording(false);
    await startNewRecording();
  }, [stopCurrentRecording, startNewRecording]); // eslint-disable-line

  // 이전 슬라이드: 현재 녹음 저장 → 이전 슬라이드 → 이어서 녹음 (이전 녹음 유지)
  const goPrev = useCallback(async () => {
    if (currentSlideRef.current === 0) return;
    const blob = await stopCurrentRecording();
    saveRecording(currentSlideRef.current, blob);
    setSlide(currentSlideRef.current - 1);
    setIsRecording(false);
    await startNewRecording();
  }, [stopCurrentRecording, startNewRecording]); // eslint-disable-line

  // 완료: 마지막 슬라이드 저장 → 슬라이드별 병합 + 전체 병합 → 반환
  const finish = useCallback(async () => {
    stopTimer();
    const blob = await stopCurrentRecording();
    saveRecording(currentSlideRef.current, blob);
    setIsRecording(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    const mime = mimeTypeRef.current || 'audio/webm';

    // 슬라이드별 세그먼트 병합
    const slideBlobs = recordingsRef.current.map(segments =>
      segments?.length ? new Blob(segments, { type: mime }) : null,
    );

    // 전체 일렬 병합 (녹음 순서대로)
    const allSegments = recordingsRef.current.flatMap(segs => segs || []);
    const mergedBlob = new Blob(allSegments, { type: mime });

    return { slideBlobs, mergedBlob };
  }, [stopTimer, stopCurrentRecording]); // eslint-disable-line

  // 전체 리셋
  const reset = useCallback(() => {
    stopTimer();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    currentSlideRef.current = 0;
    recordingsRef.current = new Array(totalSlides).fill(null);
    chunksRef.current = [];
    setCurrentSlide(0);
    setIsRecording(false);
    setElapsedTime(0);
    setRecordings(new Array(totalSlides).fill(null));
  }, [stopTimer, totalSlides]);

  // 언마운트 정리
  useEffect(() => () => {
    stopTimer();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
  }, []); // eslint-disable-line

  return {
    currentSlide,
    isRecording,
    elapsedTime,       // 현재 슬라이드의 누적 총 녹음 시간 (초)
    recordings,        // (Blob[]|null)[] — 슬라이드별 세그먼트 배열
    startRecording,
    goNext,
    goPrev,
    finish,
    reset,
  };
}
