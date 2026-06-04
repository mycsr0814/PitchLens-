# -*- coding: utf-8 -*-
"""캡스톤 본문(한글 붙여넣기용) 30매 분량 생성"""
from pathlib import Path

HEADER = """================================================================================
  한글 붙여넣기 안내
  1) 목차: 전기수 hwp 「목차」 페이지의 SenseVoca 항목 → 아래 「목 차」 블록으로 교체
  2) 본문: SenseVoca 본문 → 아래 「Ⅰ. 서론」~「Ⅳ. 참고문헌」으로 교체 (표지·주의사항 양식 유지)
  3) <표>, <그림>에 캡처·ERD·구성도 삽입 후 「참고」→「목차 및 표지」로 쪽번호 갱신 (○→실제 번호)
  4) 장(Ⅰ~Ⅳ)은 각각 새 페이지에서 시작
================================================================================

"""

TABLE_OF_CONTENTS = r"""
목     차


Ⅰ. 서 론

1. 프로젝트 명........................................................................○
2. 프로젝트 개요........................................................................○
  가. 개요........................................................................○
  나. 설계의 주안점........................................................................○
  다. 기대 효과........................................................................○
  라. 사용 기술........................................................................○
3. 팀원 구성 및 역할........................................................................○
4. 개발 일정........................................................................○
5. 요구사항 정의........................................................................○
6. 개발 목표........................................................................○


Ⅱ. 본 론

1. 배경 지식........................................................................○
  가. LLM(대규모 언어 모델)........................................................................○
    1) LLM이란?.......................................................................................○
    2) LLM의 주요 특징.......................................................................................○
    3) LLM의 장점.......................................................................................○
    4) LLM의 단점.......................................................................................○
    5) 본 프로젝트에서의 LLM 활용.......................................................................................○
  나. Transformer........................................................................○
    1) 인코더와 디코더 구조.......................................................................................○
    2) Transformer의 주요 개념.......................................................................................○
  다. 자연어 처리(NLP)........................................................................○
    1) 토큰화(Tokenization).......................................................................................○
    2) 프롬프트(Prompt).......................................................................................○
    3) 구조화 출력(Structured Output).......................................................................................○
  라. STT(음성 인식)........................................................................○
    1) STT의 개념.....................................................................................○
    2) STT의 작동 원리.....................................................................................○
    3) OpenAI Whisper.....................................................................................○
  마. 지도학습 기반 발화 분석........................................................................○
    1) 발화 속도(WPM).......................................................................................○
    2) 필러(추임새) 분석.......................................................................................○
    3) 로지스틱 회귀 분류.......................................................................................○
  바. AWS 및 클라우드 스토리지........................................................................○
    1) Amazon S3.....................................................................................○
    2) Presigned URL.....................................................................................○
    3) 클라우드에서의 마이크로서비스 배치.......................................................................................○
  사. 웹·모바일 클라이언트 기술........................................................................○
    1) React와 Capacitor.....................................................................................○
    2) MediaRecorder API.....................................................................................○
    3) REST·JWT.....................................................................................○

2. 시스템 구축 내용......................................................................○
  가. 시스템 전체 구성도......................................................................○
  나. 클라이언트 구조......................................................................○
    1) 로그인 / 회원가입.....................................................................................○
    2) 발표 자료 업로드.....................................................................................○
    3) 슬라이드별 녹음.....................................................................................○
    4) AI 피드백 결과.....................................................................................○
    5) 마이페이지.....................................................................................○
    6) 관리자 콘솔.....................................................................................○
  다. 메인 서버 구조(Spring Boot)......................................................................○
    1) Config.....................................................................................○
    2) Controller.....................................................................................○
    3) Entity·Repository.....................................................................................○
    4) Service.....................................................................................○
  라. AI 서버 구조......................................................................○
    1) 음성 분석 서버(DeliveryLearning).....................................................................................○
    2) 피드백 생성 서버(Presentation Feedback API).....................................................................................○
  마. 데이터베이스 설계......................................................................○
  바. 프론트엔드 모듈 구조......................................................................○
  사. 배포 및 운영 구성......................................................................○

3. 시스템 테스트 및 결과......................................................................○
  가. 테스트 환경 및 방법......................................................................○
  나. 기능 테스트 결과......................................................................○
  다. 성능·사용성 평가......................................................................○
  라. 개발 과정에서의 이슈 및 해결......................................................................○
  마. 사용자 시나리오 검증......................................................................○


Ⅲ. 결 론

1. 결론......................................................................○
  가. 발표 자료 업로드·슬라이드별 녹음......................................................................○
  나. 음성 분석(전사·속도·필러)......................................................................○
  다. AI 피드백......................................................................○
  라. 마이페이지·관리자 기능......................................................................○
2. 기대 효과......................................................................○
  가. 발표 연습......................................................................○
  나. 교육·캡스톤......................................................................○
  다. 기술·학과 연계......................................................................○
3. 개선 방안......................................................................○
4. 프로젝트 수행 소감 및 팀별 기여......................................................................○


Ⅳ. 참 고 문 헌......................................................................○


--------------------------------------------------------------------------------
  ※ 위 ○는 임시 표기입니다. 본문 붙여넣기·쪽 나눔 후 한글 「목차 및 표지」로 자동 갱신하세요.
  ※ 서론부터 쪽번호 1이 시작됩니다(학교 양식).
--------------------------------------------------------------------------------

"""

BODY = r"""
Ⅰ. 서    론


프로젝트 명
  AI 기반 발표 피드백·코칭 플랫폼, PitchLens(피치렌즈)


프로젝트 개요

가. 개요

대학 강의, 캡스톤 디자인 발표, 취업·창업 피칭, 학술대회 발표 등에서 발표 역량은 학습 성과와 실무 역량을 가르는 핵심 요소이다. 그러나 실제 교육 현장에서는 강사·동료가 모든 학습자의 발표를 반복적으로 청취하고, 슬라이드에 담긴 내용과 실제 발화 내용의 일치 여부, 말의 속도, 불필요한 추임새(필러), 논리 전개의 명확성 등을 슬라이드 단위로 정밀하게 피드백하기 어렵다. 실습 시간과 인력의 한계로 피드백은 주관적·일회성에 그치는 경우가 많으며, 학습자는 자신의 발표를 객관적으로 점검할 도구가 부족하다.

PitchLens(피치렌즈)는 이러한 문제를 해결하기 위해 설계된 통합 발표 코칭 플랫폼이다. 사용자는 PPT·PPTX·PDF 형식의 발표 자료를 업로드하고, 웹 브라우저(또는 Capacitor 기반 모바일 앱)에서 슬라이드별로 발표를 녹음한다. 이후 서버 파이프라인이 자동으로 음성 전사(STT), 말하기 속도·필러 분석(지도학습), 슬라이드·발화 일치도 평가 및 개선안 생성(LLM)을 수행한다.

첫째, OpenAI Whisper를 활용하여 슬라이드별 녹음을 텍스트로 전사한다. 둘째, 팀이 수집·라벨링한 발표 음성 데이터로 학습한 로지스틱 회귀 모델이 발화 속도(느림/보통/빠름)와 필러 사용(보통/많음)을 판별한다. 셋째, GPT-4o가 슬라이드 텍스트·전사문·음성 분석 지표·(선택)슬라이드 이미지를 바탕으로 슬라이드별·종합 피드백을 생성한다. 넷째, 관리자 콘솔을 통해 사용자·발표 세션·피드백 결과를 조회·관리할 수 있다. 이를 통해 학습자는 객관적 지표와 구체적 개선안을 바탕으로 자기주도적 발표 연습이 가능해진다.


나. 설계의 주안점

슬라이드 단위로 발표 자료와 녹음을 동기화하여, 슬라이드마다 독립적인 분석·피드백을 제공한다.
속도·필러 등 정량 지표는 학습된 ML 모델이 계산하고, 내용·구성·유사도는 LLM이 담당하도록 역할을 분리하여 교수 지도 요구(학습 기반 피드백)를 반영한다.
인증·발표 관리(Spring Boot), 음성 분석(FastAPI), 피드백 생성(FastAPI)을 마이크로서비스로 분리하여 확장·유지보수를 용이하게 한다.
AWS S3 Presigned URL을 통해 대용량 PPT·오디오를 클라이언트에서 직접 업로드하여 애플리케이션 서버의 부하를 줄인다.
JWT 인증, USER/ADMIN 역할 분리, 서비스 간 내부 API 시크릿으로 보안을 강화한다.
일반 사용자 앱(pitchlens-frontend)과 관리자 앱(pitchlens-admin)을 분리하고, Capacitor로 모바일 패키징을 지원한다.


다. 기대 효과

슬라이드별 유사도 점수·시각·내용 피드백을 제공하여 발표 준비 시간을 단축하고, 개선 포인트를 명확히 한다.
WPM·필러 비율 등 정량 지표로 반복 연습 시 개선 여부를 확인할 수 있다.
교육자·운영자에게 보조 평가·발표 데이터 관리 도구를 제공한다.
STT·ML·LLM·클라우드·웹 보안을 통합한 IT융합 실습 사례로, 컴퓨터정보·보안전공 교육 목표와 부합한다.


라. 사용 기술

개발 환경 : Windows 11
개발 도구 : Visual Studio Code, IntelliJ IDEA, Android Studio(Capacitor), Figma
개발 언어 : JavaScript, Java, Python
프레임워크 : React 18(Create React App), React 19(Vite), Spring Boot 3.2, FastAPI, Capacitor 7
데이터베이스 : Microsoft SQL Server
클라우드 : AWS S3 (리전 ap-northeast-2)
AI : OpenAI Whisper, GPT-4o, scikit-learn(LogisticRegression)


팀원 구성 및 역할

<표 — 아래 내용을 한글 표로 작성>

지도교수    임승철

이름      역할                    담당 (표에 넣을 때 2줄로 나누어 입력 권장)
이동재    Frontend & UI/UX        UX·화면 설계, 슬라이드 녹음·피드백 결과 UI
                                  사용자 앱·관리자 앱 React 개발, Capacitor 모바일
정인성    Backend & DB            Spring Boot 인증·발표·관리자 API, JWT·권한
                                  MSSQL·ERD 설계, S3 Presigned URL 업로드
차범진    AI Algorithm            PPT/PDF 슬라이드 추출, GPT-4o 피드백 API
                                  슬라이드별·종합 평가 로직, 결과 DB 저장
최성열    Speech Recognition      Whisper STT, DeliveryLearning 음성 분석 서버
                                  발화 속도·필러 ML 학습·추론, Audio_analysis 연동

※ 담당 칸은 가로가 좁으면 위 2줄을 한글 표 셀 안에서 Enter로 줄바꿈하세요. 구체적 구현 내용은 본론·결론 「팀별 기여」에 기술하였다.

본 프로젝트는 프론트엔드(이동재), 메인 서버·DB(정인성), AI 피드백 서버(차범진), 음성 학습 서버(최성열)로 역할을 분리하여 병렬 개발하였으며, 주간 회의를 통해 API 규격·DB 스키마·분석 파이프라인 순서를 통합하였다.


개발 일정

<표 — 팀 실제 일정에 맞게 수정>

단계              기간(예시)        주요 내용
기획·요구분석      2025.03~04       주제 확정, API·DB 설계, 화면 설계(Figma)
설계               2025.04~05       아키텍처·ERD, UI 프로토타입, S3·JWT 설계
구현 1             2025.05~07       Auth 서버, Presigned 업로드, 슬라이드별 녹음 UI
구현 2             2025.07~09       DeliveryLearning(STT·ML), Feedback API(GPT)
구현 3             2025.09~11       관리자 앱, Capacitor 빌드, E2E 통합 테스트
최종               2025.11~12       성능 조정, 보고서·발표 준비


요구사항 정의

기능 요구사항 : (1) 회원가입·로그인·JWT 인증, (2) PPT/PDF 업로드 및 S3 저장, (3) 슬라이드별 녹음·업로드, (4) 자동 STT·속도·필러 분석, (5) GPT 기반 슬라이드별·종합 피드백, (6) 마이페이지 이력 조회, (7) 관리자 통계·회원·발표 관리.
비기능 요구사항 : (1) 슬라이드 단위 분석 정확도, (2) 대용량 파일 업로드 시 서버 부하 최소화(Presigned URL), (3) USER/ADMIN 권한 분리, (4) 모바일 브라우저·앱에서 마이크 녹음 지원, (5) 분석 진행 상태 표시.
제약 사항 : OpenAI API 사용(네트워크·비용), LibreOffice 설치 여부에 따른 PPT 추출 품질 차이, Whisper 전사 품질이 필러·WPM에 영향을 미침.


개발 목표

- PPT/PDF 업로드 및 슬라이드별 웹 녹음 기능 구현
- Whisper STT와 지도학습 기반 속도·필러 분석 구현
- GPT-4o를 활용한 슬라이드별·종합 발표 피드백 제공
- Spring Boot JWT 인증·S3 연동·관리자 API 구현
- React 사용자·관리자 앱 및 Capacitor 모바일 빌드 지원
- 발표 연습 데이터의 안전한 저장·조회 및 운영자 모니터링 기능 확보



Ⅱ. 본    론


1. 배경 지식

가. LLM(대규모 언어 모델)

1) LLM이란?

대형 언어 모델(LLM, Large Language Model)은 인간의 자연어를 이해하고 생성할 수 있는 인공지능 모델로, 자연어 처리(NLP, Natural Language Processing) 분야에서 가장 중요한 기술 중 하나이다. LLM은 수십억에서 수백억 개의 파라미터를 갖는 대규모 인공 신경망을 통해 학습된 모델로, 주어진 텍스트 데이터를 바탕으로 언어를 이해하고, 문맥에 맞는 텍스트를 생성하는 데 강력한 능력을 가진다.

LLM은 "사전 훈련(Pre-training)"과 "미세 조정(Fine-tuning)"의 두 가지 주요 학습 과정으로 구분된다. 사전 훈련 과정에서 모델은 대량의 텍스트 데이터를 사용하여 일반적인 언어 패턴을 학습하고, 미세 조정 과정에서는 특정 작업에 맞추어 모델을 조정하여 높은 성능을 발휘한다. PitchLens에서는 발표 평가·개선안 생성이라는 특정 도메인에 맞게, 프롬프트 엔지니어링과 구조화된 JSON 출력 요구를 통해 모델 행동을 제한한다.

대형 언어 모델의 핵심 구조는 Transformer이며, Self-Attention 메커니즘을 통해 문장 내 단어·구 간의 관계를 병렬적으로 모델링한다. 이는 발표 대본과 슬라이드 텍스트를 비교·평가하는 피드백 생성 단계에서 문맥을 반영한 자연어 출력에 활용된다.


2) LLM의 주요 특징

대규모 데이터셋 학습 : LLM은 방대한 양의 텍스트 데이터를 학습하여 언어의 패턴과 구조를 이해한다. 뉴스, 책, 웹사이트, 대화형 텍스트 등 다양한 출처에서 수집된 데이터로 학습하며, 데이터와 연산 자원이 많을수록 성능이 향상된다.
Transformer 아키텍처 : LLM의 핵심 구조는 Transformer 모델이다. Self-Attention을 사용하여 문장 내 단어들 간의 관계를 모델링하며, 순차 처리가 아닌 병렬 처리로 효율적인 학습이 가능하다.
컨텍스트 기반 학습 : LLM은 단순한 단어의 나열이 아니라 문맥을 바탕으로 단어와 문장을 이해한다. PitchLens에서는 동일 슬라이드의 제목·본문·발표자 전사문을 함께 입력하여, "슬라이드에는 없는데 말한 내용"과 "슬라이드에 있는데 말하지 않은 내용"을 구분하는 데 문맥 이해가 필요하다.
다작업 처리 : 하나의 모델로 평가, 요약, 개선안 제시 등 복수 NLP 작업을 수행할 수 있어, 별도의 규칙 엔진 없이도 다양한 발표 상황에 대응할 수 있다.


3) LLM의 장점

높은 자연어 품질 : 발표 코칭에 필요한 설명·개선안을 문장 단위로 생성하기에 적합하다. 사용자가 읽기 쉬운 피드백 문장을 제공할 수 있다.
입력 유연성 : 슬라이드 텍스트, 전사문, 수치 지표(WPM, 속도·필러 라벨)를 한 번에 전달할 수 있다. 선택적으로 슬라이드 이미지를 Vision 입력으로 제공할 수 있다.
개발 생산성 : 슬라이드마다 다른 평가 규칙을 하드코딩하는 대신, 프롬프트와 예시로 동작을 조정할 수 있다.
교육 현장 적용성 : 강사가 반복적으로 작성하던 코멘트 유형(구성, 전달, 일치도)을 자동화하는 데 활용할 수 있다.


4) LLM의 단점

비용·의존성 : API 호출 비용과 외부 네트워크가 필요하다. 교육용 서비스에서는 사용량·예산 관리가 필요하다.
환각(Hallucination) : 사실과 다른 피드백이 생성될 수 있다. PitchLens는 속도·필러·WPM을 ML이 산출한 값으로 DB에 저장하고, GPT는 해당 수치를 "변경하지 말고 인용"하도록 프롬프트에 명시하여 환각 위험을 줄였다.
서식·구조 : 출력 형식을 JSON 등으로 제한해야 파싱·DB 저장이 가능하다. GPTService는 응답 JSON을 파싱하여 feedback_result, feedback_slide_result 테이블에 저장한다.
해석 가능성 : 왜 특정 유사도 점수가 나왔는지 완전한 설명은 어렵다. 따라서 정량 지표(ML)와 정성 피드백(LLM)을 병행 표시한다.


5) 본 프로젝트에서의 LLM 활용

PitchLens는 GPT-4o를 발표 내용·구성·슬라이드-발화 일치도 평가에 사용한다. Presentation Feedback API의 GPTService는 슬라이드별 추출 텍스트(SlideData), Whisper 전사문, Audio_analysis 테이블의 wpm, speed_label, filler_count, filler_ratio, filler_label, (선택)슬라이드 이미지(base64)를 입력한다.

LLM은 속도·필러를 직접 추정하지 않고, DeliveryLearning이 계산한 수치·라벨을 근거로 피드백 문장·유사도 점수·개선 제안을 생성한다. 이는 지도교수의 "학습 기반 속도·필러 판단 + AI 피드백" 요구와 일치한다. use_vision 옵션을 켜면 슬라이드 이미지를 함께 전달하여 시각적 구성·가독성에 대한 피드백 품질을 높인다. 또한 전사문에서 반복되는 n-gram을 통계적으로 탐지하여 "말버릇" 후보를 프롬프트에 포함함으로써, 하드코딩된 추임새 목록에만 의존하지 않는 보조 분석을 수행한다.


나. Transformer

Transformer 모델은 자연어 처리 분야에서 뛰어난 성능을 발휘하는 모델로, 기계 번역 작업을 위해 처음 개발되었다. 기존 RNN·LSTM의 직렬 처리 한계를 극복하고, 병렬 처리를 통해 학습 효율을 크게 향상시켰다. GPT-4o를 포함한 최신 LLM은 Transformer 기반 디코더 구조를 사용한다.

<그림 — Transformer 인코더-디코더 개념도>

1) 인코더와 디코더 구조

인코더(Encoder)는 입력 텍스트를 고차원 벡터 표현으로 변환한다. 텍스트는 임베딩(Embedding) 과정을 거쳐 벡터 형태로 변환되며, 여러 어텐션 레이어와 피드포워드 네트워크를 통해 문맥 정보가 담긴 표현을 생성한다.
디코더(Decoder)는 인코더 출력 또는 이전 토큰을 바탕으로 다음 토큰을 순차적으로 예측하여 최종 문장을 생성한다. PitchLens의 GPT-4o 호출은 디코더형 생성 모델에 해당하며, "발표 피드백 JSON" 형태의 출력을 생성한다.

2) Transformer의 주요 개념

임베딩(Embedding) : 자연어를 숫자 벡터로 변환하여 모델이 처리할 수 있게 한다.
포지셔널 인코딩(Positional Encoding) : 병렬 연산 시 단어 순서 정보를 보존한다. 발표 전사문에서 앞뒤 문맥 순서가 유지되어야 의미 있는 피드백이 가능하다.
셀프 어텐션(Self-Attention) : 문장 내 각 단어가 다른 단어와 어떻게 연관되는지 가중치를 계산한다. 슬라이드 키워드와 발화 키워드의 대응 관계 학습에 유리하다.
멀티-헤드 어텐션(Multi-Head Attention) : 여러 관점에서 동시에 문맥을 분석하여 풍부한 표현을 만든다.


다. 자연어 처리(NLP)

자연어 처리(NLP)는 인간 언어를 컴퓨터가 이해·생성할 수 있도록 하는 기술이다. PitchLens에서는 (1) 음성→텍스트(STT), (2) 텍스트 특징 추출·분류(ML), (3) 텍스트 평가·생성(LLM)의 세 단계로 NLP가 사용된다.

<그림 — PitchLens NLP 파이프라인>

1) 토큰화(Tokenization)

토큰화는 텍스트를 더 작은 의미 단위로 분할하는 과정이다. 영어는 공백 기준 단어 분할이 일반적이나, 한국어 Whisper 전사 결과는 띄어쓰기가 불완전한 경우가 많다. DeliveryLearning의 features.py와 GPTService의 _tokenize_korean은 연속 한글·영숫자 덩어리를 토큰으로 분리하여 WPM·필러·말버릇 n-gram 분석의 정확도를 높인다.

2) 프롬프트(Prompt)

프롬프트는 LLM에게 수행할 작업을 지시하는 입력이다. PitchLens는 "슬라이드 텍스트와 전사문의 일치도를 0~100으로 평가", "속도 라벨은 DB 값을 그대로 사용", "JSON 키 이름 고정" 등의 지시를 시스템·사용자 메시지에 포함한다. 이를 통해 출력의 일관성과 파싱 안정성을 확보한다.

3) 구조화 출력(Structured Output)

피드백 결과는 overall_score, slide_analyses[], summary 등의 필드로 JSON화하여 MSSQL에 저장한다. 클라이언트 FeedbackReviewer는 이 구조를 차트·카드 UI로 시각화한다.


라. STT(음성 인식)

1) STT의 개념

Speech-to-Text(STT)는 사용자의 음성 언어를 인식하여 텍스트 데이터로 변환하는 기술이다. 스마트폰 음성 입력, 화상 회의 자막, 콜센터 기록 등에 활용된다. PitchLens에서는 슬라이드별 녹음을 전사해야 슬라이드 텍스트와 비교·WPM·필러 분석이 가능하므로, 파이프라인의 필수 전처리 단계이다.

2) STT의 작동 원리(요약)

음성 신호 수집 → 디지털 변환 → 프레임 단위 특징 추출 → 음소·단어 후보 생성 → 언어 모델로 문장 복원. 딥러닝 기반 STT는 대량의 음성-텍스트 쌍으로 end-to-end 학습하여, 잡음·억양 변화에도 강건한 인식을 목표로 한다.

3) OpenAI Whisper

본 프로젝트는 OpenAI Whisper를 DeliveryLearning 서버에서 사용한다. Whisper는 다국어·잡음 환경에서 실용적 인식률을 제공하며, verbose_json 응답으로 세그먼트·재생 시간(duration) 정보를 확보하여 WPM 산출에 활용한다. 환경 설정에 따라 Whisper API(whisper-1) 또는 로컬 openai-whisper 모델을 선택할 수 있다.

한국어 전사 시 띄어쓰기가 불완전한 경우를 대비해, features.py에서 연속 한글·영숫자 덩어리를 토큰으로 분리하여 단어 수·필러 매칭 정확도를 높였다. 필러 탐지는 단순 부분 문자열 검색이 아니라, 경계 문자 규칙을 적용하여 「근데」 안의 「근」 등 오탐을 줄인다. FILLER_WORDS 사전에는 "음, 어, 그, 이제, 근데, 그러니까" 등 팀이 정의한 추임새가 포함된다.


마. 지도학습 기반 발화 분석

1) 발화 속도(WPM)

WPM(Words Per Minute)은 분당 단어(또는 어절) 수로, 발표 전달력의 대표 지표이다. 본 시스템은 전사 텍스트의 토큰 수와 Whisper가 반환한 duration_sec로 WPM을 산출한다. 일반적으로 대학 발표에서는 너무 빠르면 이해가 어렵고, 너무 느리면 집중이 떨어질 수 있어, "보통" 구간을 목표로 연습하도록 피드백한다.

2) 필러(추임새) 분석

필러는 발화 흐름을 끊는 짧은 표현이다. filler_count, filler_ratio를 계산하고, 2글자 이상 필러를 우선 매칭하여 오탐을 줄인다. filler_label은 "보통" 또는 "많음"으로 분류되어 UI와 GPT 프롬프트에 전달된다.

3) 로지스틱 회귀 분류

지도학습은 입력 특징에 대한 정답 라벨을 이용하여 모델 파라미터를 학습하는 방법이다. 팀은 voice/ 폴더에 녹음 파일과 speed_label(느림/보통/빠름), filler_label(보통/많음)을 수집하였다. train_models.py는 Whisper STT → build_feature_vector(WPM, filler_ratio, 단어별 빈도 등) → StandardScaler + LogisticRegression 파이프라인 2개(speed_model, filler_model)를 학습하고 joblib으로 저장한다.

추론 시 predict_models.transcribe_then_label_with_bundle이 전사·특징·예측을 수행하고, 결과는 Audio_analysis 테이블의 speed_label, filler_label, wpm 등 컬럼에 UPDATE된다. 이 설계는 "AI가 임의로 빠르다/느리다고 말하는 것"이 아니라, 팀이 라벨링한 데이터에 맞춘 분류기 결과를 제시한다는 점에서 교육적 신뢰성을 높인다.

<그림 — ML 학습·추론 파이프라인 도식>


바. AWS 및 클라우드 스토리지

1) Amazon S3

Amazon Simple Storage Service(S3)는 객체 스토리지 서비스로, 발표 PPT·슬라이드별 오디오 파일을 저장한다. 리전은 ap-northeast-2(서울)를 사용하여 국내 사용자의 업로드·다운로드 지연을 줄였다. 객체 키는 사용자·발표 세션·슬라이드 인덱스에 따라 구조화하여, Feedback·DeliveryLearning 서버가 동일 버킷을 참조한다.

2) Presigned URL

Presigned URL은 제한된 시간 동안 특정 S3 객체에 PUT/GET 할 수 있는 서명된 URL이다. Spring Auth 서버의 Feedback_service가 generatePptUploadUrl, generateAudioUploadUrl을 통해 URL을 발급하면, 클라이언트가 애플리케이션 서버를 거치지 않고 S3에 직접 PUT한다. 이는 대용량 업로드 시 메모리·대역폭 부담을 줄이고, URL 만료로 무단 업로드를 어렵게 하는 보안 패턴이다.

3) 클라우드에서의 마이크로서비스 배치

Auth(:8080), DeliveryLearning(:8765), Feedback API(:8001)는 논리적으로 분리된 프로세스이다. 운영 환경에서는 동일 VPC 또는 호스트에서 포트로 구분하여 기동하며, 각 서비스는 MSSQL과 S3, OpenAI API를 공유한다. 서비스 간 내부 호출 시 X-Delivery-Learning-Secret, Feedback API 측 내부 시크릿으로 무단 호출을 제한할 수 있다.


사. 웹·모바일 클라이언트 기술

1) React와 Capacitor

사용자 UI는 Create React App 기반 pitchlens-frontend(포트 3000), 관리자 UI는 Vite+React 기반 pitchlens-admin(포트 3001)으로 구현하였다. Capacitor 7로 Android/iOS WebView 앱을 패키징하며, 네이티브 마이크 권한을 통해 모바일에서도 슬라이드별 녹음이 가능하다. pdfjs-dist로 PDF 슬라이드를 캔버스에 렌더링하고, PPT/PPTX는 Feedback API 미리보기 또는 변환 결과를 사용한다.

2) MediaRecorder API

브라우저 MediaRecorder API로 webm/ogg 형식의 오디오를 녹음한다. useSlideRecorder 훅이 슬라이드 인덱스별 Blob을 관리하고, 분석 시 Presigned URL로 S3에 업로드한다.

3) REST·JWT

클라이언트는 JWT Bearer 토큰으로 Auth Server와 통신한다. 환경 변수 REACT_APP_API_URL, REACT_APP_FEEDBACK_API_URL, REACT_APP_VOICE_API_URL로 서버 주소를 분리 설정한다.



2. 시스템 구축 내용

가. 시스템 전체 구성도

<그림 — 전체 아키텍처 도식>

PitchLens는 사용자 클라이언트(React, Capacitor), 관리자 클라이언트(Vite+React), Auth Server(Spring Boot, :8080), DeliveryLearning(FastAPI, :8765), Presentation Feedback API(FastAPI, :8001), Microsoft SQL Server, AWS S3, OpenAI API로 구성된다.

<표 — 구성 요소·포트·역할>

구분                    포트      역할
pitchlens-frontend      3000      사용자 앱, 업로드·녹음·결과 UI
pitchlens-admin         3001      관리자 앱, 통계·회원·발표 관리
Auth Server             8080      JWT 인증, 발표 세션, Presigned URL, DB CRUD
DeliveryLearning        8765      Whisper STT, ML 속도·필러, Audio_analysis 갱신
Presentation Feedback   8001      슬라이드 추출, GPT-4o 피드백, 결과 저장
MSSQL                   1433      User, Feedback, Audio_analysis, feedback_result 등
AWS S3                  -         PPT·오디오 객체 저장
OpenAI API              -         Whisper·GPT-4o 호출

분석 파이프라인은 다음과 같다.

1) POST /api/v1/presentations — 발표 세션(feedback_id) 생성
2) POST .../ppt-url, .../audio-url — Presigned URL 발급 → 클라이언트 S3 PUT
3) POST /api/v1/voice/analyze (DeliveryLearning) — Whisper 전사·ML 예측·Audio_analysis 갱신
4) POST /api/v1/feedback (Feedback API) — 슬라이드 추출·GPT-4o 피드백·feedback_result 저장
5) GET /api/v1/presentations/{id} — 클라이언트 결과 화면·마이페이지 조회

<그림 — 시퀀스 다이어그램(업로드~피드백)>


나. 클라이언트 구조

1) 로그인 / 회원가입

<그림 — 로그인·회원가입 화면>

앱 실행 시 로그인 화면이 표시된다. 이메일·비밀번호를 입력하여 메인 기능으로 진입한다. 회원가입 화면에서는 이메일, 비밀번호, 이름을 입력하여 계정을 생성한다. Auth Server의 User_controller는 POST /api/v1/users/signup, POST /api/v1/users/login을 제공한다.

로그인 성공 시 User_service가 BCrypt로 검증된 사용자에 대해 Jwt_provider가 토큰을 발급하고, LoginResponse에 Bearer 토큰·userId·name·role이 포함된다. 클라이언트는 토큰을 localStorage에 저장하며, 이후 axios/fetch 요청 시 Authorization: Bearer 헤더를 첨부한다. POST /api/v1/users/logout 호출 시 토큰은 Token_blacklist에 등록되어 재사용이 차단된다. Security_config는 /api/v1/admin/** 경로에 ROLE_ADMIN을 요구한다.


2) 발표 자료 업로드

<그림 — 업로드 화면>

사용자는 PDF, PPTX, PPT를 선택하여 업로드한다. 먼저 POST /api/v1/presentations로 발표 제목과 함께 세션을 생성하고 feedback_id(presentationId)를 받는다. 이어서 POST /api/v1/presentations/{id}/ppt-url로 Presigned URL을 받아 S3에 파일을 PUT한다.

PDF는 pdfjs-dist로 브라우저에서 페이지별 슬라이드를 렌더링한다. PPT/PPTX는 Feedback API의 POST /api/v1/slides/preview로 슬라이드 미리보기 이미지·텍스트를 받는다. LibreOffice(soffice) 또는 PyMuPDF·python-pptx를 서버에서 사용하여 텍스트·이미지를 추출한다. 업로드·미리보기가 완료되면 PresentationRecorder 녹음 단계로 전환된다.


3) 슬라이드별 녹음

<그림 — PresentationRecorder 전체화면>

PresentationRecorder 컴포넌트와 useSlideRecorder 훅이 슬라이드별 녹음을 담당한다. 화면에는 현재 슬라이드 이미지, 슬라이드 번호, 녹음·재생·이전·다음 버튼이 배치된다. MediaRecorder API로 webm/ogg 형식 녹음을 수행한다.

이전 슬라이드로 이동 시 현재·이전 슬라이드 녹음을 삭제하고 재녹음하도록 하여, 슬라이드 인덱스와 오디오의 일대일 대응을 유지한다. 각 슬라이드 녹음 완료 시 POST /api/v1/presentations/{id}/audio-url로 Presigned URL을 받아 S3에 업로드하고, Audio_analysis 행이 slide_index별로 생성된다.

모든 슬라이드 녹음이 끝나면 useAnalysis.runAnalysis가 분석 파이프라인을 시작한다. ProgressOverlay에 UPLOADING → TRANSCRIBING → GENERATING → DONE 단계가 표시되어 사용자가 대기 시간을 인지할 수 있다.


4) AI 피드백 결과

<그림 — FeedbackReviewer 결과 화면>

분석 완료 후 FeedbackReviewer에서 종합 점수(overall_score), 슬라이드별 유사도(similarity_score), 시각·내용 피드백 문장, 음성 요약(WPM, speed_label, filler_label)을 카드·차트 형태로 확인한다. 슬라이드를 선택하면 해당 슬라이드의 전사문·피드백·개선 제안을 상세히 볼 수 있다.

피드백 데이터는 Auth Server GET /api/v1/presentations/{id} 응답에 feedback_result, slide_results, audio_analyses가 포함되어 전달된다. UI는 Figma 기반 디자인 시스템(색상·타이포·카드 레이아웃)을 따르며, 발표 연습 결과를 한눈에 파악할 수 있도록 시각화하였다.


5) 마이페이지

<그림 — MyPage 목록·상세>

마이페이지에서는 GET /api/v1/presentations로 과거 발표 목록을 조회한다. 항목을 선택하면 상세 화면에서 제목·생성일·슬라이드 수·종합 점수·슬라이드별 결과를 확인한다. feedbackPdfExport 유틸로 피드백 요약 PDF를 생성·공유할 수 있다. DELETE /api/v1/presentations/{id}로 발표 세션과 연관 S3 객체·DB 레코드를 삭제할 수 있다.


6) 관리자 콘솔

<그림 — Dashboard, Users, Presentations>

pitchlens-admin은 ADMIN 역할 JWT로만 /api/v1/admin/**에 접근한다. Admin_controller는 통계(stats), 사용자 목록·역할 변경, 전체 발표 목록·상세·강제 삭제 API를 제공한다. 대시보드에서는 가입자 수·발표 세션 수 등 집계를 확인한다. 768px 이하 뷰포트에서는 하단 탭 네비게이션·카드 UI가 적용되어 모바일 관리가 가능하다.


다. 메인 서버 구조(Spring Boot)

패키지 com.capstone.auth_server, 포트 8080, Java 21, Spring Boot 3.2.

1) Config

Spring Boot 기반으로 보안, JWT, CORS, S3, JPA를 구성한다.

1-1) Security_config·Jwt_authfilter
Spring Security를 STATELESS 세션으로 설정하고, CSRF·폼 로그인을 비활성화한다. /api/v1/users/signup, /api/v1/users/login은 permitAll, /api/v1/admin/**는 hasRole("ADMIN"), 그 외는 authenticated이다. Jwt_authfilter가 요청 헤더의 Bearer 토큰을 검증하고, Token_blacklist에 등록된 토큰은 거부한다.

1-2) Jwt_provider
사용자 ID, 이메일, role을 클레임에 담아 JWT를 생성·검증한다. 만료 시간은 application.yml에서 설정한다.

1-3) PasswordEncoder
BCryptPasswordEncoder로 회원가입 시 비밀번호를 해싱 저장하고, 로그인 시 matches로 검증한다.

1-4) S3·JPA 설정
AWS SDK를 이용해 Presigned URL을 생성한다. Spring Data JPA로 User, Feedback, Audio_analysis, feedback_result 엔티티를 MSSQL에 매핑한다.

<그림 — Spring Boot 패키지 구조>


2) Controller

2-1) User_controller (/api/v1/users)
POST /signup — 회원가입, 이메일 중복 시 예외
POST /login — JWT·userId·name·role 반환
GET /me — @AuthenticationPrincipal로 내 정보 조회
POST /logout — 토큰 블랙리스트 등록
DELETE /me — 회원 탈퇴

2-2) Feedback_controller (/api/v1/presentations)
POST / — 발표 세션 생성, presentationId 반환
POST /{id}/audio-url — slideIndex, contentType으로 오디오 Presigned URL
POST /{id}/ppt-url — PPT Presigned URL
GET / — 내 발표 목록
GET /{id} — 발표 상세(피드백·오디오 분석 포함)
DELETE /{id} — 발표 삭제

2-3) Admin_controller (/api/v1/admin)
GET /stats — 대시보드 통계
GET /users, PATCH /users/{id}/role — 회원·역할 관리
GET /presentations, GET /presentations/{id}, DELETE /presentations/{id} — 전체 발표 관리


3) Entity·Repository

User(users) : user_id, email, password(해시), name, role(USER/ADMIN)
Feedback : id, user_id, title, s3_ppt_key, created_at
Audio_analysis : feedback_id, slide_index, s3_audio_key, transcript_text, wpm, speed_label, filler_count, filler_ratio, filler_label
feedback_result : 종합 점수, summary, overall_comment
feedback_slide_result : slide_index, similarity_score, visual_feedback, content_feedback 등

<그림 — ERD(테이블 관계)>


4) Service

4-1) User_service
signup에서 이메일 중복 검사 후 BCrypt 해시 저장. login에서 인증 후 JWT 발급. logout에서 블랙리스트 추가.

4-2) Feedback_service
createPresentation으로 Feedback 행 생성. generatePptUploadUrl, generateAudioUploadUrl로 S3 키·Presigned URL 생성. Audio_analysis 행을 slide_index별로 upsert. getPresentationDetail에서 GPT 결과·전사·S3 URL을 DTO로 조합하여 반환.

4-3) Admin_service
전체 사용자·발표 통계, 역할 변경, 타 사용자 발표 강제 삭제. 운영·데모 시 데이터 정리에 사용.

발표 세션·S3 업로드 흐름 :
1) POST /api/v1/presentations → feedback_id
2) POST .../ppt-url → Presigned URL → 클라이언트 S3 PUT → s3_ppt_key 저장
3) 슬라이드별 POST .../audio-url → S3 PUT → Audio_analysis 행 생성
4) 클라이언트가 Voice·Feedback API 호출 후 상세 조회


라. AI 서버 구조

1) 음성 분석 서버(DeliveryLearning)

FastAPI, Uvicorn, 포트 8765, Python 3.

<표 — 주요 API>

메서드   경로                              설명
POST     /api/v1/voice/analyze             user_id, feedback_id — 소유권 검증 후 분석
POST     /api/v1/voice/analyze-by-feedback feedback_id만 — Feedback API 내부 재분석

voice_job.run_feedback_voice_analysis 처리 흐름 :
1) MSSQL에서 Feedback·Audio_analysis 조회, user_id 소유권 확인
2) S3에서 슬라이드별 오디오 다운로드(_download_audio_to_temp)
3) Whisper 전사(verbose_json, duration 확보)
4) build_feature_vector → joblib speed_model, filler_model 예측
5) Audio_analysis UPDATE(transcript_text, wpm, speed_label, filler_*)

환경 변수 : OPENAI_API_KEY, DATABASE_URL, AWS_*, MODEL_DIR, (선택) VOICE_API_SECRET.
선택적 X-Delivery-Learning-Secret 헤더로 외부 무단 호출을 제한한다.

<그림 — DeliveryLearning 내부 모듈 구성>


2) 피드백 생성 서버(Presentation Feedback API)

FastAPI, 포트 8001.

<표 — 주요 API>

메서드   경로                    설명
POST     /api/v1/feedback        GPT 피드백 생성·DB 저장
POST     /api/v1/slides/preview    PPT/PDF 슬라이드 미리보기

POST /api/v1/feedback 처리 :
1) feedback_id로 DB·S3에서 발표·Audio_analysis 로드
2) 전사 누락 슬라이드가 있으면 DeliveryLearning analyze-by-feedback 호출
3) S3에서 PPT 다운로드 → slide_extractor(LibreOffice, PyMuPDF, python-pptx)
4) GPTService.generate_feedback — 슬라이드별 SlideAnalysis, 종합 summary
5) feedback_result, feedback_slide_result INSERT/UPDATE

GPTService는 gpt-4o 모델을 사용하며, 슬라이드 텍스트·전사·AudioAnalysisRow·이미지 base64를 프롬프트에 조합한다. 응답 JSON을 파싱하여 유사도·시각·내용 피드백 필드를 검증한다. 말버릇 후보는 n-gram 반복 통계로 탐지하여 프롬프트에 보조 정보로 넣는다.

<그림 — Feedback API + GPTService 흐름>


마. 데이터베이스 설계

Microsoft SQL Server를 사용하며, Auth Server가 JPA Entity로 스키마를 관리한다. 사용자(users)와 발표(Feedback)는 1:N 관계이고, Feedback과 Audio_analysis는 1:N(slide_index 복합) 관계이다. feedback_result는 Feedback당 1건의 종합 결과를, feedback_slide_result는 슬라이드별 상세 피드백을 저장한다.

Feedback 테이블에는 s3_ppt_key, title, user_id, created_at이 저장된다. Audio_analysis에는 슬라이드별 s3_audio_key, transcript_text, wpm, speed_label, filler_count, filler_ratio, filler_label, analyzed_at이 저장된다. GPT 피드백 생성 후 feedback_result에 overall_score, summary, overall_comment 등이 저장되고, 슬라이드별 행이 feedback_slide_result에 INSERT된다.

DeliveryLearning·Feedback API는 SQLAlchemy text() 또는 별도 db_service 모듈로 동일 MSSQL에 직접 접근한다. 이는 마이크로서비스 간 "DB 공유" 패턴으로, 트랜잭션 경계는 서비스별로 분리되나 데이터 일관성은 feedback_id·slide_index 키로 유지한다. 삭제 시 Feedback_service가 연관 Audio_analysis, feedback_result, S3 객체 삭제 순서를 정의하여 고아 데이터를 방지한다.

<그림 — ERD 상세>


바. 프론트엔드 모듈 구조

pitchlens-frontend는 pages, components, hooks, utils로 구성된다. 주요 페이지는 Login, Signup, Home(업로드), PresentationRecorder, FeedbackReviewer, MyPage이다. hooks/useSlideRecorder.js는 슬라이드 인덱스·MediaRecorder·Blob URL을 관리한다. hooks/useAnalysis.js는 S3 업로드, Voice API, Feedback API 호출 순서와 progress 상태를 캡슐화한다.

components/ProgressOverlay.jsx는 분석 단계 메시지와 진행률 UI를 표시한다. utils/feedbackPdfExport.js는 html2canvas·jspdf 등을 활용해 결과 화면을 PDF로 보낸다. 환경 변수로 API 베이스 URL을 분리하여 개발(localhost)과 배포(공인 IP)를 전환한다.

pitchlens-admin은 src/pages/Dashboard.jsx, Users.jsx, Presentations.jsx와 adminApi.js로 구성된다. JWT role이 ADMIN인지 확인 후 API를 호출하며, 일반 사용자 토큰으로는 접근할 수 없다. 반응형 CSS로 모바일에서도 카드·탭 UI가 동작하도록 하였다.

<표 — 프론트엔드 주요 파일·역할>


사. 배포 및 운영 구성

개발 단계에서는 Windows PC에서 Auth·FastAPI·React dev server를 동시에 기동하였다. MSSQL은 로컬 또는 팀 공유 인스턴스를 사용하고, S3 버킷은 ap-northeast-2에 생성하였다. OpenAI API 키는 .env 파일로 관리하며, 저장소에 커밋하지 않도록 .gitignore에 등록하였다.

데모·시연 시 공인 IP(예: 122.36.99.66)의 8080 포트에 Auth Server를 배포하고, 클라이언트 REACT_APP_API_URL을 해당 주소로 설정하였다. FastAPI 서버는 동일 호스트의 8765, 8001 포트로 기동하거나, 터널링·리버스 프록시로 HTTPS를 적용할 수 있다. Capacitor android 프로젝트 빌드 시 network security config에서 API 도메인을 허용 목록에 추가하였다.

운영 시 고려 사항으로 (1) Whisper·GPT API 비용 상한, (2) S3 라이프사이클 정책(오래된 발표 자료 자동 삭제), (3) JWT 만료·갱신 정책, (4) 관리자 계정 분리 등이 있다. 본 캡스톤 범위에서는 프로토타입 수준의 단일 환경 배포를 완료하였으며, 상용화 시 Kubernetes·RDS·Secrets Manager 도입을 개선 방안에 포함한다.

<그림 — 배포 구성도>


3. 시스템 테스트 및 결과

가. 테스트 환경 및 방법

클라이언트 : Chrome 최신, Windows 10/11, Android 에뮬레이터(Capacitor)
서버 : Auth 8080, Feedback 8001, DeliveryLearning 8765, MSSQL, AWS S3(ap-northeast-2)
방법 : E2E(가입~업로드~녹음~피드백), Postman API 단위 검증, 관리자 CRUD·권한 테스트

나. 기능 테스트 결과

<표>

테스트 ID   시나리오                         기대 결과              결과
T-01       회원가입·로그인                  JWT 발급               통과
T-02       PDF 10슬라이드 녹음·분석         피드백 JSON·DB 저장    통과
T-03       PPTX 업로드                      동일 파이프라인         통과
T-04       Voice 실패 후 피드백             analyze-by-feedback    통과
T-05       ADMIN 통계·발표 삭제             권한·삭제              통과
T-06       로그아웃 후 토큰 재사용          401 거부               통과
T-07       USER가 /admin 접근               403 거부               통과

다. 성능·사용성 평가

슬라이드 수·음성 길이에 비례하여 STT·GPT 시간이 증가한다. 10슬라이드·슬라이드당 30초 녹음 기준 전체 분석에 수 분이 소요될 수 있어, ProgressOverlay 단계 표시가 필요하다. Presigned URL 직접 업로드는 Auth 서버 메모리 사용을 크게 줄였다. 모바일 WebView에서는 마이크 권한 UX를 별도 안내하였다.

라. 개발 과정에서의 이슈 및 해결

PPT 텍스트 추출 실패 : LibreOffice 미설치 환경에서 soffice 경로를 설정하고, 실패 시 PyMuPDF·python-pptx 폴백을 적용하였다.
한국어 전사 띄어쓰기 : 토큰화 규칙을 보강하여 WPM·필러 정확도를 개선하였다.
슬라이드·녹음 불일치 : 이전 슬라이드 이동 시 녹음 초기화 정책을 도입하였다.
GPT JSON 파싱 오류 : 프롬프트에 스키마 예시를 명시하고, 파싱 실패 시 재시도·로그를 추가하였다.

<그림 — 진행률 UI·결과 화면 캡처>


마. 사용자 시나리오 검증

시나리오 A(신규 사용자) : 회원가입 → PDF 업로드 → 5슬라이드 녹음 → 분석 완료 → 유사도 낮은 슬라이드 확인 → 재녹음 후 재분석. 재분석 후 유사도·필러 지표가 개선되는지 확인하였다.
시나리오 B(관리자) : ADMIN 계정 로그인 → 대시보드 통계 확인 → 특정 사용자 발표 목록 조회 → 테스트 데이터 삭제. ROLE_USER 토큰으로 admin API 호출 시 403이 반환됨을 확인하였다.
시나리오 C(모바일) : Capacitor Android 빌드 → 마이크 권한 허용 → 동일 녹음·업로드 파이프라인 수행. 화면 비율·하단 버튼 터치 영역을 조정하여 사용성을 확보하였다.

위 시나리오를 통해 "업로드부터 피드백 확인까지" end-to-end 흐름이 끊기지 않음을 검증하였다. 일부 슬라이드에서 PPT 폰트가 깨져 미리보기가 흐릿한 경우는 PDF 업로드를 권장하는 안내 문구를 UI에 추가하였다.



Ⅲ. 결    론


1. 결론

가. 발표 자료 업로드·슬라이드별 녹음

PitchLens는 PDF·PPTX·PPT 업로드 후 브라우저·모바일 WebView에서 슬라이드별 녹음을 수행한다. Presigned URL 기반 S3 업로드와 slide_index 단위 Audio_analysis 설계로 대용량 발표 자료를 안정적으로 처리한다. 이전 슬라이드 이동 시 녹음 초기화 규칙으로 슬라이드-오디오 정합성을 유지하였다.

나. 음성 분석(전사·속도·필러)

Whisper로 슬라이드별 전사를 수행하고, 팀이 라벨링한 데이터로 학습한 로지스틱 회귀 모델로 말하기 속도·필러를 분류한다. 결과는 Audio_analysis에 저장되어 GPT 피드백의 객관적 근거가 된다. STT와 ML을 분리함으로써 "측정 가능한 지표"와 "자연어 코멘트"를 동시에 제공한다.

다. AI 피드백

GPT-4o가 슬라이드·전사·음성 지표를 종합하여 슬라이드별 유사도·시각 피드백·종합 개선안을 생성한다. Vision 입력 옵션으로 슬라이드 디자인 피드백을 보강할 수 있다. FeedbackReviewer UI를 통해 학습자는 즉시 개선 포인트를 확인할 수 있다.

라. 마이페이지·관리자 기능

마이페이지에서 발표 이력·상세·PDF보내기가 가능하다. 관리자는 별도 앱으로 회원·발표를 모니터링·관리할 수 있어, 교내 파일럿·운영 시나리오를 검증하였다.

PitchLens는 "발표 자료 + 슬라이드별 음성"이라는 입력만으로 자동 피드백 파이프라인을 완성하였으며, 캡스톤 디자인 목표인 융합 설계·실무 역량·팀 협업을 충족한다.


2. 기대 효과

가. 발표 연습
1) 슬라이드 단위 피드백으로 "이 슬라이드에서 무엇을 고칠지"가 명확해진다.
2) WPM·필러·유사도로 반복 연습 시 개선 여부를 수치로 확인할 수 있다.
3) 강사·동료 피드백 전 1차 자동 점검 도구로 활용할 수 있다.

나. 교육·캡스톤
1) 발표 준비 시간을 단축하고, 캡스톤 중간·최종 발표 대비에 실사용 가능하다.
2) 팀원별 역할(프론트·백엔드·음성·LLM)이 명확한 협업 사례가 된다.

다. 기술·학과 연계
1) JWT·S3 Presigned URL·마이크로서비스·지도학습·LLM을 하나의 제품으로 통합하였다.
2) 컴퓨터정보·보안전공의 웹 개발, 클라우드, AI, 보안 교육 목표와 직접 연계된다.

PitchLens는 발표 자료·슬라이드별 녹음·STT·지도학습·LLM을 하나의 플랫폼으로 통합하여, 자기주도적이고 데이터에 기반한 발표 연습 환경을 제공한다. 향후 LMS 연동·실시간 STT 확장 시 교육 플랫폼으로 발전할 수 있다.


3. 개선 방안

실시간 STT·라이브 코칭 : 녹음 중 즉시 속도·필러 경고를 표시하여 연습 효과를 높인다.
ML 데이터·모델 고도화 : 수집 음성·라벨을 확대하고, 딥러닝·음성 임베딩 기반 분류를 검토한다.
분석 시간 단축 : 슬라이드 병렬 전사, 메시지 큐(Celery·Redis) 비동기 처리를 도입한다.
멀티모달 확장 : 발표 영상·시선·자세 분석 AI를 연동한다.
LMS·과제 연동 : Moodle·학교 포털과 SSO·과제 제출 연동을 지원한다.
보안·개인정보 : 녹음 보존 기간·삭제 API·OWASP 점검 항목을 문서화하고, 동의 UI를 강화한다.


4. 프로젝트 수행 소감 및 팀별 기여

이동재(Frontend & UI/UX)는 Figma로 화면 흐름을 설계하고, PresentationRecorder·FeedbackReviewer·ProgressOverlay를 구현하였다. 슬라이드 전환·녹음 상태·분석 진행률을 한 화면에서 인지할 수 있도록 UX를 단순화하였으며, 피드백 결과를 막대 그래프·배지·카드로 시각화하였다. pitchlens-admin 반응형 레이아웃과 Capacitor Android 빌드·마이크 권한 처리를 담당하였다.

정인성(Backend & DB)는 Spring Boot Auth Server, MSSQL 스키마, JWT·블랙리스트, Presigned URL, Admin API를 구현하였다. Feedback·Audio_analysis·feedback_result 간 조회·삭제 트랜잭션과 S3 키 규칙을 설계하였다.

차범진(AI Algorithm)는 Presentation Feedback API, slide_extractor, GPTService, slides/preview API를 개발하였다. GPT-4o 프롬프트·JSON 파싱·재시도 로직을 완성하였다.

최성열(Speech Recognition)는 DeliveryLearning, Whisper 연동, train_models·predict_models, 필러·토큰화 튜닝, analyze-by-feedback 내부 API를 담당하였다.

지도교수 임승철 교수님께서는 ML 기반 속도·필러 판별과 LLM 피드백의 역할 분리, 마이크로서비스 구조, 보안 요구를 지도해 주셨다. 전기수 SenseVoca 보고서 양식을 참고하여 목차·장 구성을 맞추었으며, 본 문서는 PitchLens 실제 구현 내용을 기준으로 작성하였다.



Ⅳ. 참 고 문 헌

1. OpenAI. Introducing Whisper. https://openai.com/research/whisper
2. OpenAI. GPT-4o API Documentation. https://platform.openai.com/docs
3. FastAPI. Documentation. https://fastapi.tiangolo.com
4. Spring. Spring Security Reference. https://docs.spring.io/spring-security/reference/
5. React. Documentation. https://react.dev
6. Amazon Web Services. Amazon S3 Presigned URLs. https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html
7. WHATWG. MediaStream Recording. https://www.w3.org/TR/mediastream-recording/
8. Capacitor. Documentation. https://capacitorjs.com/docs
9. Pedregosa, F. et al. (2011). Scikit-learn: Machine Learning in Python. JMLR 12.
10. Inflearn. 모두를 위한 대규모 언어 모델 LLM Part 1.
11. AWS. STT란 무엇인가요? https://aws.amazon.com/ko/what-is/speech-to-text/
12. Vaswani, A. et al. (2017). Attention Is All You Need. NeurIPS.
13. 임승철 교수님 캡스톤디자인 지도 및 팀 내부 설계 문서 (2025~2026)
"""

def main():
    out = Path(__file__).resolve().parents[1] / "docs" / "캡스톤디자인_본문_한글붙여넣기용.txt"
    toc_out = Path(__file__).resolve().parents[1] / "docs" / "캡스톤디자인_목차_한글붙여넣기용.txt"
    text = HEADER + TABLE_OF_CONTENTS.strip() + "\n\n" + BODY.strip() + "\n"
    toc_out.write_text(
        "※ 전기수 hwp 「목차」 페이지만 교체할 때 사용\n\n" + TABLE_OF_CONTENTS.strip() + "\n",
        encoding="utf-8",
    )
    out.write_text(text, encoding="utf-8")
    body = BODY.strip()
    print(f"Wrote {out}")
    print(f"body_chars={len(body)} body_lines={body.count(chr(10))+1}")
    print(f"estimated_pages_text_only@1200chars={len(body)/1200:.1f}")
    print(f"with_12_figures_tables@0.7page_each est_total={len(body)/1200+12*0.7:.1f}")

if __name__ == "__main__":
    main()
