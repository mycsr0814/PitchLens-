# Rules

## 코딩 규칙

- 스타일: 인라인 CSS 객체로 작성, CSS 변수는 `global.css`에서만 정의
- 새 컴포넌트: 인라인 스타일 객체를 파일 하단 `const s = {...}` 형태로 분리
- 전역 상태 없음: 훅 조합으로 상태 관리 (`usePDFLoader` + `useSlideRecorder` + `useAnalysis`)

## 파일 처리 규칙

- **PDF**: 서버 불필요, pdfjs-dist 클라이언트 직접 렌더링
- **PPTX/PPT**: `localhost:3210/render-pdf` → PDF base64 반환 → pdfjs 렌더링
- 지원 확장자: `.pdf`, `.pptx`, `.ppt`

## 분석 파이프라인 규칙

- `useAnalysis.runAnalysis(audioBlobs, slides, pptTitle)` 시그니처 유지
- 슬라이드별 Blob 배열 → 순차 업로드+전사 → 단일 GPT 분석 요청
- 진행 상태: UPLOADING → TRANSCRIBING → GENERATING → DONE

## 녹음 규칙

- 이전 슬라이드 이동 시 현재 슬라이드 + 이전 슬라이드 녹음 모두 삭제 후 재녹음
- MediaRecorder mimeType은 브라우저 지원 여부 자동 감지 (`getSupportedMimeType`)
