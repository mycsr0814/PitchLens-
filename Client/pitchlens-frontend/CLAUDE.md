# PitchLens — CLAUDE.md

PPT/PPTX/PDF 업로드 → 슬라이드별 발표 녹음 → Whisper 전사 → GPT-4 피드백

## 기술 스택

- React 18 + CRA / pdfjs-dist 3.x / MediaRecorder API
- 백엔드: FastAPI (`122.36.99.66:8080`), PPT 변환 서버 (`localhost:3210`)
- 인증: JWT (localStorage)

## 보조 문서

| 문서 | 내용 |
|------|------|
| [docs/architecture.md](docs/architecture.md) | 폴더 구조, 앱 흐름 |
| [docs/servers.md](docs/servers.md) | API 엔드포인트, 환경변수 |
| [docs/rules.md](docs/rules.md) | 코딩 규칙, 파일 처리, 분석 파이프라인 |
