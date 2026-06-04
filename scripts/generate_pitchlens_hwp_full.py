# -*- coding: utf-8 -*-
"""
전기수 HWP 템플릿 → PitchLens 전체 본문 치환

- 표지·주의사항·양식: 템플릿 유지
- 목차: PitchLens 목차로 교체
- 서론~참고문헌: md 초안 전체 삽입 (기존 SenseVoca 본문 삭제)

실행 전: 한글에서 모든 hwp 닫기
실행: python scripts/generate_pitchlens_hwp_full.py
"""
from __future__ import annotations

import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "docs" / "캡스톤디자인1_보고서.hwp"
MD = ROOT / "docs" / "캡스톤디자인_최종보고서_초안.md"
OUTPUT = ROOT / "docs" / "PitchLens_capstone_FULL.hwp"
VERIFY = ROOT / "docs" / "치환확인_FULL.txt"


def replace_all(hwp, find: str, repl: str) -> None:
    if not find:
        return
    hwp.HAction.GetDefault("AllReplace", hwp.HParameterSet.HFindReplace.HSet)
    hset = hwp.HParameterSet.HFindReplace
    hset.FindString = find
    hset.ReplaceString = repl
    hset.ReplaceMode = 1
    hset.IgnoreMessage = 1
    hwp.HAction.Execute("AllReplace", hwp.HParameterSet.HFindReplace.HSet)


def repeat_find(hwp, text: str) -> bool:
    hwp.HAction.GetDefault("RepeatFind", hwp.HParameterSet.HFindReplace.HSet)
    hset = hwp.HParameterSet.HFindReplace
    hset.FindString = text
    hset.IgnoreMessage = 1
    return bool(hwp.HAction.Execute("RepeatFind", hwp.HParameterSet.HFindReplace.HSet))


def insert_text(hwp, text: str) -> None:
    chunk = 8000
    for i in range(0, len(text), chunk):
        part = text[i : i + chunk]
        hwp.HAction.GetDefault("InsertText", hwp.HParameterSet.HInsertText.HSet)
        ins = hwp.HParameterSet.HInsertText
        ins.Text = part
        hwp.HAction.Execute("InsertText", hwp.HParameterSet.HInsertText.HSet)


def md_body_text(md_path: Path) -> str:
    raw = md_path.read_text(encoding="utf-8")
    lines: list[str] = []
    start = False
    for line in raw.splitlines():
        if line.strip() == "# Ⅰ. 서    론":
            start = True
        if not start:
            continue
        if line.startswith("## 표지") or line.startswith("*참고:"):
            break
        if line.startswith(">"):
            continue
        if line.startswith("```"):
            continue
        if line.strip() == "---":
            lines.append("")
            continue
        if line.startswith("#"):
            lines.append(re.sub(r"^#+\s*", "", line).strip())
            continue
        if re.match(r"^\|[\s\-:|]+\|$", line.strip()):
            continue
        lines.append(line)
    return "\r\n".join(lines)


def toc_line_replaces() -> list[tuple[str, str]]:
    """목차에 남은 SenseVoca 항목을 PitchLens 목차 문구로 치환"""
    return [
        ("나. Transformer", "나. STT(음성 인식)"),
        ("  1) DALL·E란?", "      2) OpenAI Whisper"),
        ("  2) DALL·E의 주요 특징", "      3) 로지스틱 회귀 분류"),
        ("  3) DALL·E의 장점", "      1) Amazon S3"),
        ("  4) DALL·E의 단점", "      2) Presigned URL"),
        ("라. 이미지 생성", "라. AWS 및 클라우드 스토리지"),
        ("  2) 메인 화면", "      2) 발표 자료 업로드"),
        ("  3) 기본 제공 단어장", "      3) 슬라이드별 녹음"),
        ("  4) 단어 학습", "      4) AI 피드백 결과"),
        ("  5) 즐겨찾기", "      5) 마이페이지"),
        ("  6) 발음 교정", "      6) 관리자 콘솔"),
        ("  7) 나만의 단어장 생성", ""),
        ("  1) 연상 예문 생성", "      1) 음성 분석 서버(DeliveryLearning)"),
        ("  2) 이미지 생성", "      2) 피드백 생성 서버(Presentation Feedback API)"),
        ("  3) 발음 교정 기능", ""),
        ("가. 단어 학습 기능", "가. 발표 자료 업로드·슬라이드별 녹음"),
        ("나. 발음 교정 기능", "나. 음성 분석(전사·속도·필러)"),
        ("다. 나만의 단어장 기능", "다. AI 피드백"),
        (" 라. 즐겨찾기 기능", " 라. 마이페이지·관리자 기능"),
        ("2. DALL·E", "2. OpenAI Whisper"),
        ("  3) LLM의 장점", "  3) 본 프로젝트에서의 LLM 활용"),
        ("  4) LLM의 단점", "      2) OpenAI Whisper"),
        ("다. 자연어 처리(NLP)", "다. 지도학습 기반 발화 분석"),
        ("  1) 토큰화(Tokenization)", "      1) 발화 속도(WPM)"),
        ("  2) 자연어 처리 모델의 구조", "      2) 필러(추임새) 분석"),
        ("  3) 어텐션 메커니즘의 필요성", "      3) 로지스틱 회귀 분류"),
        ("  4) LLM 추상화(Abstraction)", ""),
        ("  5) 프롬프트(Prompt)", ""),
        ("  1) 인코더와 디코더 구조", ""),
        ("  2) Transformer의 주요 개념", ""),
        ("  2) STT의 작동 원리", "      2) OpenAI Whisper"),
        ("바. AWS(Amazon Web Services)", "라. AWS 및 클라우드 스토리지"),
    ]


def cover_replaces() -> list[tuple[str, str]]:
    return [
        ("SenseVoca(센스보카)", "PitchLens(피치렌즈)"),
        ("SenseVoca", "PitchLens"),
        ("센스보카", "PitchLens"),
        (
            "감각을 자극하는 센스있는 영어 단어 해마 학습법, SenseVoca(센스보카)",
            "AI 기반 발표 피드백·코칭 플랫폼, PitchLens(피치렌즈)",
        ),
        ("2025.06.20", "2026.05.30"),
        ("2025학년도 1학기", "2025학년도 2학기"),
    ]


def main() -> int:
    if not TEMPLATE.is_file():
        print("템플릿 없음:", TEMPLATE, file=sys.stderr)
        return 1
    if not MD.is_file():
        print("md 없음:", MD, file=sys.stderr)
        return 1

    print("※ 한글에서 모든 보고서 hwp를 닫고 실행하세요.\n")

    shutil.copy2(TEMPLATE, OUTPUT)
    body = md_body_text(MD)
    try:
        import win32com.client
    except ImportError:
        print("pip install pywin32", file=sys.stderr)
        return 1

    hwp = win32com.client.gencache.EnsureDispatch("HWPFrame.HwpObject")
    hwp.RegisterModule("FilePathCheckDLL", "FilePathCheckDLL")
    hwp.XHwpWindows.Item(0).Visible = False
    if not hwp.Open(str(OUTPUT.resolve())):
        print("파일 열기 실패", file=sys.stderr)
        return 1

    print("1) 표지·프로젝트명 치환")
    for a, b in cover_replaces():
        replace_all(hwp, a, b)

    print("2) 목차·결론 목차 항목 치환 (SenseVoca → PitchLens)")
    for a, b in toc_line_replaces():
        replace_all(hwp, a, b)

    print("3) 서론~끝 본문 삭제 후 PitchLens md 삽입")
    hwp.HAction.Run("MoveDocBegin")
    found = False
    for _ in range(30):
        if repeat_find(hwp, "Ⅰ. 서    론"):
            found = True
    if not found:
        print("  ⚠ 'Ⅰ. 서    론' 못 찾음 — '프로젝트 명'으로 재시도")
        hwp.HAction.Run("MoveDocBegin")
        for _ in range(2):
            repeat_find(hwp, "프로젝트 명")

    hwp.HAction.Run("MoveSelDocEnd")
    hwp.HAction.Run("Delete")
    insert_text(hwp, body)

    hwp.Save()
    hwp.Quit()

    # 검증
    from contextlib import closing
    import io
    from hwp5.hwp5txt import TextTransform
    from hwp5.xmlmodel import Hwp5File

    buf = io.BytesIO()
    with closing(Hwp5File(str(OUTPUT))) as f:
        TextTransform().transform_hwp5_to_text(f, buf)
    text = buf.getvalue().decode("utf-8", errors="replace")
    VERIFY.write_text(text, encoding="utf-8")

    print(f"\n4) 완료: {OUTPUT}")
    print(f"   검증: {VERIFY}")
    for key in ("SenseVoca", "센스보카", "단어장", "해마", "PitchLens", "발표 역량", "Whisper", "이동재"):
        print(f"   · {key}: {text.count(key)}회")

    if text.count("SenseVoca") + text.count("센스보카") > 0:
        print("\n⚠ SenseVoca 문자열이 남았습니다.")
        return 2
    if text.count("단어장") > 0 or text.count("DALL") > 0:
        print("\n[경고] 단어장/DALL 문자열이 남았습니다. 스크립트를 다시 실행하세요.")
        return 2
    print("\n[완료] 본문·목차가 PitchLens 내용으로 교체되었습니다.")
    print("  한글에서 열어 표지·목차·서론을 확인한 뒤, [표]/[그림] 자리에 캡처를 넣으세요.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
