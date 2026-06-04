// src/hooks/useSlideImagesFromUrl.js
// detail.pptUrl 에서 슬라이드 이미지를 로드하는 훅
// PDF  → pdfjs 로컬 렌더링 (페이지 단위로 즉시 반영)
// PPT·PPTX → 미리보기 API 요청

import { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

const PREVIEW_API_BASE = process.env.REACT_APP_FEEDBACK_API_URL;
const TIMEOUT_MS       = 30_000; // 30초 초과 시 포기

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('이미지 로드 시간 초과')), ms),
    ),
  ]);
}

export function useSlideImagesFromUrl(pptUrl) {
  const [images, setImages]   = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pptUrl) return;

    let cancelled = false;
    setLoading(true);
    setImages([]);

    (async () => {
      try {
        // S3에서 파일 다운로드 (CORS 허용 필요)
        const response = await withTimeout(fetch(pptUrl), TIMEOUT_MS);
        if (!response.ok) throw new Error('파일 다운로드 실패');

        const blob = await response.blob();
        const ext  = pptUrl.split('?')[0].split('.').pop().toLowerCase();

        if (ext === 'pdf') {
          // PDF: 페이지 한 장씩 렌더링 → 현재 슬라이드 이미지가 즉시 표시됨
          const buf = await blob.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: buf }).promise;

          for (let i = 1; i <= pdf.numPages; i++) {
            if (cancelled) break;

            const page   = await pdf.getPage(i);
            const vp     = page.getViewport({ scale: 1.8 });
            const canvas = document.createElement('canvas');
            canvas.width  = vp.width;
            canvas.height = vp.height;
            await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

            // 페이지마다 즉시 state 업데이트 → 첫 장부터 바로 보임
            if (!cancelled) setImages(prev => [...prev, dataUrl]);
          }
        } else if (ext === 'pptx' || ext === 'ppt') {
          // PPT/PPTX: 미리보기 API에 전송
          const file     = new File([blob], `file.${ext}`, { type: blob.type });
          const formData = new FormData();
          formData.append('file', file);

          const res = await withTimeout(
            fetch(`${PREVIEW_API_BASE}/api/v1/slides/preview`, { method: 'POST', body: formData }),
            TIMEOUT_MS,
          );
          if (!res.ok) throw new Error('미리보기 API 오류');

          const data   = await res.json();
          const loaded = (data.slides || [])
            .map(s => s.image_url || (s.image_base64 ? `data:image/png;base64,${s.image_base64}` : null))
            .filter(Boolean);

          if (!cancelled) setImages(loaded);
        }
      } catch (e) {
        // 이미지 로드 실패 / 시간 초과 → 피드백 패널만 표시
        console.warn('슬라이드 이미지 로드 실패:', e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [pptUrl]);

  return { images, loading };
}
