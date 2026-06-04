import { useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

const PREVIEW_API_BASE = process.env.REACT_APP_FEEDBACK_API_URL;

async function countPptxSlides(file) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const text = new TextDecoder('latin1').decode(bytes);
  const matches = text.match(/ppt\/slides\/slide\d+\.xml/g);
  return matches ? new Set(matches).size : 1;
}

function makePlaceholderSlide(index, total) {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0d0f14';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#f5a623';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

  ctx.fillStyle = '#f5a623';
  ctx.font = 'bold 52px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`슬라이드 ${index + 1} / ${total}`, canvas.width / 2, canvas.height / 2 - 16);

  ctx.fillStyle = '#666';
  ctx.font = '26px sans-serif';
  ctx.fillText('슬라이드 이미지를 불러오지 못했습니다', canvas.width / 2, canvas.height / 2 + 36);

  return canvas.toDataURL('image/jpeg', 0.85);
}

async function renderPdfPages(arrayBuffer, onProgress) {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;
  const slides = [];

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.8 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    const imageUrl = canvas.toDataURL('image/jpeg', 0.85);

    const textContent = await page.getTextContent();
    const text = textContent.items.map((item) => item.str).join(' ').trim();

    slides.push({ index: i - 1, imageUrl, text });
    onProgress?.(i / totalPages);
  }

  return slides;
}

async function fetchSlidePreview(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);

  onProgress?.(0.15);

  const res = await fetch(`${PREVIEW_API_BASE}/api/v1/slides/preview`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || '슬라이드 미리보기를 불러오지 못했습니다.');
  }

  onProgress?.(0.7);

  const data = await res.json();
  const total = data.total_slides || data.slides?.length || 1;

  return {
    title: data.title || file.name.replace(/\.[^/.]+$/, ''),
    slides: (data.slides || []).map((slide, index) => ({
      index: slide.index ?? index,
      imageUrl:
        slide.image_url ||
        (slide.image_base64
          ? `data:image/png;base64,${slide.image_base64}`
          : makePlaceholderSlide(index, total)),
      text: slide.text || '',
    })),
  };
}

export function usePDFLoader() {
  const [slides, setSlides] = useState([]);
  const [title, setTitle] = useState('');
  const [pptFile, setPptFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadFile = useCallback(async (file, onProgress) => {
    const name = file.name.toLowerCase();
    const isPpt = name.endsWith('.ppt');
    const isPptx = name.endsWith('.pptx');
    const isPdf = name.endsWith('.pdf');

    if (!isPdf && !isPpt && !isPptx) {
      throw new Error('.pdf, .pptx, .ppt 파일만 지원합니다.');
    }

    setLoading(true);
    setError(null);
    setSlides([]);
    setPptFile(file);

    const fileTitle = file.name.replace(/\.[^/.]+$/, '');

    try {
      let loaded;
      let resolvedTitle = fileTitle;

      if (isPpt || isPptx) {
        try {
          const preview = await fetchSlidePreview(file, onProgress);
          loaded = preview.slides;
          resolvedTitle = preview.title;
        } catch (previewError) {
          console.error('Failed to load PPT/PPTX slide previews:', previewError);
          onProgress?.(0.1);
          const total = isPptx ? await countPptxSlides(file) : 1;
          onProgress?.(0.5);
          loaded = Array.from({ length: total }, (_, i) => ({
            index: i,
            imageUrl: makePlaceholderSlide(i, total),
            text: '',
          }));
          onProgress?.(1);
        }
      } else {
        const arrayBuffer = await file.arrayBuffer();
        onProgress?.(0.2);
        loaded = await renderPdfPages(arrayBuffer, (p) => {
          onProgress?.(0.2 + p * 0.8);
        });
      }

      setSlides(loaded);
      setTitle(resolvedTitle);
      setLoading(false);
      return { slides: loaded, title: resolvedTitle };
    } catch (e) {
      const msg = e.message || '파일 로드에 실패했습니다.';
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  }, []);

  const reset = useCallback(() => {
    setSlides([]);
    setTitle('');
    setPptFile(null);
    setError(null);
  }, []);

  return { slides, title, pptFile, loading, error, loadPDF: loadFile, loadFile, reset };
}
