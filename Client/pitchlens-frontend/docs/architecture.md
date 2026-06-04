# Architecture

## 폴더 구조

```
src/
├── components/
│   ├── PresentationRecorder.jsx  # 슬라이드 뷰어 + 녹음 컨트롤 (전체화면)
│   ├── ProgressOverlay.jsx
│   └── ErrorToast.jsx
├── hooks/
│   ├── usePDFLoader.js       # PDF/PPTX/PPT → 슬라이드 이미지+텍스트
│   ├── useSlideRecorder.js   # 슬라이드별 MediaRecorder 관리
│   └── useAnalysis.js        # 분석 파이프라인 (업로드→전사→GPT)
├── pages/
│   ├── MainPage.jsx          # 뷰 전환: upload → recording → results
│   ├── LoginPage.jsx
│   └── RegisterPage.jsx
├── utils/
│   ├── api.js                # FastAPI 클라이언트 (인증/전사/분석)
│   └── pptParser.js          # 파일 업로드 유틸 (uploadAudio)
└── styles/global.css         # CSS 변수 (다크 테마, 골드/틸 포인트)
```

## 앱 흐름

```
upload → recording → results
```

1. **upload**: PDF/PPTX/PPT 업로드 → `usePDFLoader`로 슬라이드 이미지+텍스트 추출
2. **recording**: `PresentationRecorder` — 슬라이드별 녹음 (`useSlideRecorder`)
   - 다음: 현재 녹음 저장 → 다음 슬라이드 → 새 녹음 시작
   - 이전: 현재 + 이전 슬라이드 녹음 삭제 → 이전 슬라이드부터 재녹음
3. **results**: `useAnalysis.runAnalysis(audioBlobs, slides, title)` → 결과 표시
