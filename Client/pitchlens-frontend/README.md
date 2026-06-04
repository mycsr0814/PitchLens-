# PitchLens — 발표 피드백 AI

PPT 슬라이드와 슬라이드별 녹음 파일을 업로드하면,  
**OpenAI Whisper**로 음성을 전사하고 **GPT-4o**로 상세 피드백을 생성합니다.

---

## 프로젝트 구조

```
src/
├── styles/
│   └── global.css          # 전역 CSS 변수 및 폰트
│
├── utils/                  # 순수 함수 유틸리티 (API 호출)
│   ├── apiKeys.js          # OpenAI 키 세션 스토리지 관리
│   ├── pptParser.js        # PPTX → 슬라이드 텍스트 파싱 (JSZip)
│   ├── whisper.js          # Whisper API 음성 전사
│   └── feedbackGenerator.js# GPT-4o 피드백 생성
│
├── hooks/
│   └── useAnalysis.js      # 전체 분석 파이프라인 상태 관리 훅
│
├── components/             # UI 컴포넌트 (각 역할별 분리)
│   ├── ApiKeySetup.jsx     # OpenAI API 키 입력 화면
│   ├── PPTUploader.jsx     # PPTX 파일 드래그&드롭 업로더
│   ├── SlideAudioList.jsx  # 슬라이드별 녹음 파일 할당 UI
│   ├── ProgressOverlay.jsx # 분석 중 진행 상태 오버레이
│   ├── SlideFeedbackCard.jsx # 슬라이드 개별 피드백 카드
│   └── OverallFeedback.jsx # 종합 피드백 & 점수 차트
│
├── pages/
│   └── MainPage.jsx        # 메인 페이지 (뷰 전환 관리)
│
├── App.jsx                 # 루트 컴포넌트
└── index.js                # 진입점
```

---

## 분석 파이프라인

```
PPTX 업로드
    │
    ▼
[pptParser.js] JSZip으로 슬라이드 XML 파싱
    │
    ▼
슬라이드별 녹음 파일 할당 (drag & drop / 클릭)
    │
    ▼
[whisper.js] 슬라이드별 Whisper API 순차 전사
    │
    ▼
[feedbackGenerator.js] GPT-4o 슬라이드별 피드백 생성
    │
    ▼
[feedbackGenerator.js] GPT-4o 종합 피드백 생성
    │
    ▼
결과 표시 (OverallFeedback + SlideFeedbackCard)
```

---

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm start
```

### 3. 브라우저에서 사용

1. `http://localhost:3000` 접속
2. OpenAI API 키 입력 (세션에만 저장, 서버 전송 없음)
3. `.pptx` 파일 업로드
4. 각 슬라이드에 녹음 파일(mp3/wav/m4a 등) 할당
5. **분석 시작** 클릭

---

## 필요 조건

- **OpenAI API 키** — Whisper + GPT-4o 사용
- Node.js 16+
- 모던 브라우저 (Chrome 권장)

---

## 지원 파일 형식

| 종류 | 형식 |
|------|------|
| 발표 자료 | `.pptx` |
| 녹음 | `mp3`, `wav`, `m4a`, `ogg`, `webm` 등 |

---

## 피드백 항목

### 슬라이드별
- 점수 (0~100)
- 한 줄 요약
- 강점 / 개선점
- 전달력 분석 (발화 속도 · 내용 커버율 · 명확성)
- 핵심 팁

### 종합
- 전체 점수 + 슬라이드별 점수 바 차트
- 전체 강점 / 개선 우선순위
- 발표 흐름 분석
- 다음 연습 액션 아이템
