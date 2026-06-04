# Servers

## FastAPI 백엔드 (`122.36.99.66:8080`)

| 엔드포인트 | 역할 |
|-----------|------|
| `POST /api/v1/users/login` | 로그인 → JWT 반환 |
| `POST /api/v1/users/signup` | 회원가입 |
| `POST /upload/audio` | 오디오 업로드 → `audio_key` 반환 |
| `POST /transcribe` | Whisper 전사 → `{ text, duration, segments }` |
| `POST /feedback/analyze` | GPT-4 분석 → 피드백 JSON |

## PPT 변환 서버 (`localhost:3210`)

위치: `3.27캡스톤 진행/server/pptConversionParsingServer.js`  
실행: `npm run ppt-server` (`3.27캡스톤 진행/` 에서)

| 엔드포인트 | 역할 |
|-----------|------|
| `GET /health` | 변환기 감지 상태 확인 |
| `POST /render-pdf` | PPT/PPTX → PDF base64 반환 (PowerPoint COM 또는 LibreOffice) |
| `POST /parse` | PPT/PPTX/PDF → 슬라이드 텍스트 배열 반환 |
| `POST /convert` | PPT → PPTX base64 반환 |

## 데이터 관리 서버 (`localhost:3211`)

위치: `3.27캡스톤 진행/server/dataManagementServer.js`  
실행: `npm run data-server`  
현재 미사용 (파일 스토리지 + SQLite 문서 관리)

## 환경변수 (`.env`)

```
REACT_APP_API_URL=http://122.36.99.66:8080
REACT_APP_PPT_CONVERTER_URL=http://localhost:3210
```
