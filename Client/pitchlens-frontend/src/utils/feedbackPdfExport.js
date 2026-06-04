function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function safeFilename(title) {
  const name = String(title || 'PitchLens-Feedback')
    .replace(/[\\/:*?"<>|]/g, '')
    .trim();
  return `${name || 'PitchLens-Feedback'}-피드백`;
}

function pct(value) {
  return `${Math.round((value ?? 0) * 100)}%`;
}

function pctNum(value) {
  return Math.max(0, Math.min(100, Math.round((value ?? 0) * 100)));
}

function getSuggestions(feedbackResult) {
  const raw = feedbackResult?.improvementSuggestions ?? feedbackResult?.improvement_suggestions;
  if (Array.isArray(raw)) return raw;
  if (!raw) return [];
  return [raw];
}

function getValue(source, camelKey, snakeKey) {
  return source?.[camelKey] ?? source?.[snakeKey];
}

function getAudioValue(slide, camelKey, snakeKey) {
  return getValue(slide, camelKey, snakeKey)
    ?? slide?.audioSummary?.[camelKey]
    ?? slide?.audio_summary?.[snakeKey];
}

function buildStat(label, value, accent = false) {
  const toneClass = accent === true ? 'accent' : accent ? String(accent) : '';
  return `
    <div class="stat ${toneClass}">
      <div class="stat-label">${escapeHtml(label)}</div>
      <div class="stat-value">${escapeHtml(value)}</div>
    </div>
  `;
}

function buildTextBlock(title, body) {
  if (!body) return '';
  return `
    <div class="text-block">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(body)}</p>
    </div>
  `;
}

function buildSummaryTextSection(title, body, tone = '') {
  if (!body) return '';
  return `
    <section class="card ${tone}">
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(body)}</p>
    </section>
  `;
}

function buildSuggestions(suggestions) {
  if (!suggestions.length) return '';
  return `
    <section class="card suggestions-card">
      <h2>개선 제안</h2>
      <ol class="suggestions">
        ${suggestions.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
      </ol>
    </section>
  `;
}

function buildSlideSection(slide, imageUrl, index, totalSlides) {
  const slideIndex = getValue(slide, 'slideIndex', 'slide_index') ?? index + 1;
  const similarity = getValue(slide, 'similarityScore', 'similarity_score');
  const speedLabel = getAudioValue(slide, 'speedLabel', 'speed_label') ?? '—';
  const wpm = getAudioValue(slide, 'wpm', 'wpm');
  const fillerCount = getAudioValue(slide, 'fillerCount', 'filler_count') ?? 0;
  const fillerRatio = getAudioValue(slide, 'fillerRatio', 'filler_ratio');
  const transcript = getValue(slide, 'transcriptText', 'transcript_text')
    ?? getValue(slide, 'transcript', 'transcript');
  const visualFeedback = getValue(slide, 'visualFeedback', 'visual_feedback');
  const similarityNum = pctNum(similarity);

  return `
    <section class="report-page slide-page">
      <div class="page-brand">
        <div class="brand-mark">PITCH<span>LENS</span></div>
        <div class="page-chip">Feedback Report</div>
      </div>

      <div class="hero slide-hero">
        <div class="hero-copy">
          <div class="eyebrow">SLIDE ${escapeHtml(slideIndex)} / ${escapeHtml(totalSlides)}</div>
          <h1>슬라이드 ${escapeHtml(slideIndex)} 피드백</h1>
          <div class="hero-sub">발표 흐름, 전달력, 시각 자료를 한 장에서 확인하세요.</div>
        </div>
        <div class="score-box">
          <span>${escapeHtml(pct(similarity))}</span>
          <small>유사도</small>
        </div>
      </div>

      <div class="score-meter">
        <div class="score-meter-fill" style="width: ${similarityNum}%"></div>
      </div>

      ${imageUrl ? `
        <div class="media-card">
          <img class="slide-image" src="${escapeHtml(imageUrl)}" alt="슬라이드 ${escapeHtml(slideIndex)}" />
        </div>
      ` : ''}

      <div class="metric-grid">
        ${buildStat('슬라이드 ↔ 발화 유사도', pct(similarity), true)}
        ${buildStat('발화 속도', `${speedLabel}${wpm != null ? ` · ${Math.round(wpm)} WPM` : ''}`, 'teal')}
        ${buildStat('필러 단어', `${fillerCount}회${fillerRatio != null ? ` · ${(fillerRatio * 100).toFixed(1)}%` : ''}`, 'pink')}
      </div>

      ${buildTextBlock('내가 한 말', transcript)}
      ${buildTextBlock('슬라이드 시각 피드백', visualFeedback)}
    </section>
  `;
}

function buildSummarySection({ detail, slides, feedbackResult }) {
  const overallScore = feedbackResult.overallSimilarityScore ?? feedbackResult.overall_similarity_score;
  const suggestions = getSuggestions(feedbackResult);
  const wpmSlides = slides.filter(slide => getAudioValue(slide, 'wpm', 'wpm'));
  const avgWpm = wpmSlides.length
    ? Math.round(wpmSlides.reduce((sum, slide) => sum + getAudioValue(slide, 'wpm', 'wpm'), 0) / wpmSlides.length)
    : null;
  const totalFillers = slides.reduce((sum, slide) => sum + (getAudioValue(slide, 'fillerCount', 'filler_count') || 0), 0);
  const overallNum = pctNum(overallScore);

  return `
    <section class="report-page summary-page">
      <div class="page-brand">
        <div class="brand-mark">PITCH<span>LENS</span></div>
        <div class="page-chip">Final Summary</div>
      </div>

      <div class="hero summary-hero">
        <div class="hero-copy">
          <div class="eyebrow">OVERALL FEEDBACK</div>
          <h1>종합 피드백</h1>
          <div class="hero-sub">
            ${escapeHtml(detail.title || '발표 피드백')} · 분석일 ${escapeHtml(formatDate(detail.createdAt))} · 총 ${escapeHtml(slides.length)}장
          </div>
        </div>
        <div class="score-box">
          <span>${escapeHtml(pct(overallScore))}</span>
          <small>전체 유사도</small>
        </div>
      </div>

      <div class="score-meter">
        <div class="score-meter-fill" style="width: ${overallNum}%"></div>
      </div>

      <div class="metric-grid">
        ${buildStat('전체 유사도', pct(overallScore), true)}
        ${buildStat('평균 발화 속도', avgWpm != null ? `${avgWpm} WPM` : '—', 'teal')}
        ${buildStat('총 필러 단어', `${totalFillers}회`, 'pink')}
      </div>

      ${buildSummaryTextSection('종합 평가', feedbackResult.overallFeedback ?? feedbackResult.overall_feedback, 'highlight-card')}
      ${buildSummaryTextSection('내용 피드백', feedbackResult.contentFeedback ?? feedbackResult.content_feedback)}
      ${buildSuggestions(suggestions)}
    </section>
  `;
}

function buildReportHtml({ detail, slides, slideImages }) {
  const feedbackResult = detail.feedbackResult || {};

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(safeFilename(detail.title))}</title>
  <style>
    @page { size: A4; margin: 10mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: #111827;
      background: #f3f5f8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans KR", "Apple SD Gothic Neo", sans-serif;
      line-height: 1.6;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .report-page {
      position: relative;
      min-height: 277mm;
      padding: 12mm 13mm;
      overflow: hidden;
      page-break-after: always;
      break-inside: avoid;
      background:
        radial-gradient(circle at 95% 0%, rgba(245, 166, 35, 0.18), transparent 28%),
        radial-gradient(circle at 0% 100%, rgba(15, 191, 165, 0.12), transparent 30%),
        linear-gradient(180deg, #ffffff 0%, #f7f9fc 100%);
    }
    .summary-page {
      page-break-after: auto;
    }
    .report-page::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 5px;
      background: linear-gradient(180deg, #f5a623, #0fbfa5);
    }
    .page-brand {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .brand-mark {
      color: #111827;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 3px;
    }
    .brand-mark span {
      color: #b87913;
    }
    .page-chip {
      color: #7c8798;
      border: 1px solid #d8dee8;
      border-radius: 999px;
      padding: 4px 10px;
      background: rgba(255, 255, 255, 0.72);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .hero {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 18px;
      margin-bottom: 10px;
      padding: 18px 20px;
      border: 1px solid #dfe5ef;
      border-radius: 18px;
      background:
        linear-gradient(135deg, rgba(17, 24, 39, 0.96), rgba(38, 48, 67, 0.92)),
        linear-gradient(135deg, #ffffff, #f8fafc);
      box-shadow: 0 12px 28px rgba(17, 24, 39, 0.10);
    }
    .hero-copy {
      min-width: 0;
    }
    .eyebrow {
      color: #f5a623;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 2px;
      margin-bottom: 5px;
    }
    h1 {
      margin: 0;
      color: #ffffff;
      font-size: 30px;
      line-height: 1.2;
      letter-spacing: -0.02em;
    }
    .hero-sub {
      color: #c9d1df;
      font-size: 12px;
      margin-top: 6px;
    }
    .score-box {
      min-width: 104px;
      text-align: right;
      padding-left: 16px;
      border-left: 1px solid rgba(255, 255, 255, 0.18);
    }
    .score-box span {
      display: block;
      color: #f5a623;
      font-size: 38px;
      font-weight: 900;
      line-height: 1;
    }
    .score-box small {
      color: #c9d1df;
      font-size: 11px;
      font-weight: 700;
    }
    .score-meter {
      height: 8px;
      overflow: hidden;
      border-radius: 999px;
      background: #e2e8f0;
      margin-bottom: 13px;
      box-shadow: inset 0 1px 2px rgba(17, 24, 39, 0.08);
    }
    .score-meter-fill {
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, #f5a623, #0fbfa5);
    }
    .media-card {
      border: 1px solid #dfe3ea;
      border-radius: 16px;
      padding: 8px;
      margin-bottom: 12px;
      background: linear-gradient(180deg, #ffffff, #f3f6fb);
      box-shadow: 0 10px 24px rgba(17, 24, 39, 0.08);
    }
    .slide-image {
      width: 100%;
      max-height: 118mm;
      object-fit: contain;
      border-radius: 11px;
      display: block;
      background: #f8f9fb;
    }
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 13px;
    }
    .stat,
    .card,
    .text-block {
      border: 1px solid #dce3ee;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.9);
      break-inside: avoid;
      box-shadow: 0 8px 20px rgba(17, 24, 39, 0.06);
    }
    .stat {
      position: relative;
      padding: 14px 15px 13px;
      overflow: hidden;
    }
    .stat::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: #94a3b8;
    }
    .stat.accent::before {
      background: linear-gradient(90deg, #f5a623, #f9c85f);
    }
    .stat.teal::before {
      background: linear-gradient(90deg, #0fbfa5, #60d5c5);
    }
    .stat.pink::before {
      background: linear-gradient(90deg, #ff4d6d, #ff8a9b);
    }
    .stat-label {
      color: #697386;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1px;
      margin-bottom: 6px;
      text-transform: uppercase;
    }
    .stat-value {
      color: #15171c;
      font-size: 20px;
      font-weight: 800;
    }
    .stat.accent .stat-value {
      color: #b87913;
    }
    .stat.teal .stat-value {
      color: #0a8f7b;
    }
    .stat.pink .stat-value {
      color: #d9365b;
    }
    .text-block,
    .card {
      padding: 16px 18px;
      margin-bottom: 12px;
    }
    .text-block h3,
    .card h2 {
      margin: 0 0 8px;
      color: #111827;
      font-size: 15px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .text-block h3::before,
    .card h2::before {
      content: "";
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: #f5a623;
      flex: 0 0 auto;
    }
    .text-block p,
    .card p {
      margin: 0;
      white-space: pre-wrap;
      color: #263244;
      font-size: 13px;
    }
    .highlight-card {
      background:
        linear-gradient(180deg, rgba(245, 166, 35, 0.12), rgba(255, 255, 255, 0.92)),
        #ffffff;
      border-color: rgba(245, 166, 35, 0.34);
    }
    .suggestions-card {
      background:
        linear-gradient(180deg, rgba(15, 191, 165, 0.11), rgba(255, 255, 255, 0.92)),
        #ffffff;
      border-color: rgba(15, 191, 165, 0.3);
    }
    .suggestions {
      margin: 0;
      padding-left: 22px;
      color: #263244;
      font-size: 13px;
    }
    .suggestions li + li {
      margin-top: 8px;
    }
  </style>
</head>
<body>
  ${slides.map((slide, index) => buildSlideSection(slide, slideImages[index], index, slides.length)).join('')}
  ${buildSummarySection({ detail, slides, feedbackResult })}
</body>
</html>`;
}

export function exportFeedbackToPdf({ detail, slides, slideImages = [] }) {
  if (!detail?.feedbackResult) {
    throw new Error('AI 분석이 완료된 발표만 PDF로 내보낼 수 있습니다.');
  }

  const oldFrame = document.getElementById('pitchlens-feedback-print-frame');
  if (oldFrame) oldFrame.remove();

  const printFrame = document.createElement('iframe');
  printFrame.id = 'pitchlens-feedback-print-frame';
  printFrame.title = safeFilename(detail.title);
  printFrame.style.position = 'fixed';
  printFrame.style.right = '0';
  printFrame.style.bottom = '0';
  printFrame.style.width = '0';
  printFrame.style.height = '0';
  printFrame.style.border = '0';
  printFrame.style.opacity = '0';
  printFrame.style.pointerEvents = 'none';

  document.body.appendChild(printFrame);

  const printWindow = printFrame.contentWindow;
  const printDocument = printFrame.contentDocument || printWindow?.document;
  if (!printWindow || !printDocument) {
    printFrame.remove();
    throw new Error('인쇄 화면을 준비할 수 없습니다. 브라우저를 새로고침한 뒤 다시 시도해 주세요.');
  }

  printDocument.open();
  printDocument.write(buildReportHtml({ detail, slides, slideImages }));
  printDocument.close();

  let didPrint = false;
  const printReport = () => {
    if (didPrint) return;
    didPrint = true;
    printDocument.title = safeFilename(detail.title);
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 100);
  };

  const cleanup = () => {
    setTimeout(() => {
      if (printFrame.parentNode) printFrame.remove();
    }, 500);
  };

  printWindow.addEventListener('afterprint', cleanup, { once: true });

  const images = Array.from(printDocument.images || []);
  if (!images.length) {
    printReport();
    return;
  }

  Promise.all(images.map(image => (
    image.complete
      ? Promise.resolve()
      : new Promise(resolve => {
          image.onload = resolve;
          image.onerror = resolve;
        })
  ))).then(printReport);

  setTimeout(printReport, 2000);
}
