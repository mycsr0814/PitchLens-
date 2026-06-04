# -*- coding: utf-8 -*-
"""
전기수 HWP 템플릿 → PitchLens 보고서 자동 치환

실행 전: 한글에서 해당 hwp 파일을 모두 닫아 주세요.
실행: python scripts/generate_pitchlens_hwp.py
"""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "docs" / "캡스톤디자인1_보고서.hwp"
OUTPUT_KO = ROOT / "docs" / "캡스톤디자인_PitchLens_보고서.hwp"
OUTPUT_ASCII = ROOT / "docs" / "PitchLens_capstone_report.hwp"
OUTPUT_V2 = ROOT / "docs" / "PitchLens_capstone_report_v2.hwp"
VERIFY_TXT = ROOT / "docs" / "치환확인_PitchLens.txt"


def replace_all(hwp, find: str, repl: str) -> bool:
    if not find or find == repl:
        return False
    hwp.HAction.GetDefault("AllReplace", hwp.HParameterSet.HFindReplace.HSet)
    hset = hwp.HParameterSet.HFindReplace
    hset.FindString = find
    hset.ReplaceString = repl
    hset.ReplaceMode = 1  # 모두 바꾸기
    hset.IgnoreMessage = 1
    return bool(hwp.HAction.Execute("AllReplace", hwp.HParameterSet.HFindReplace.HSet))


def find_in_doc(hwp, text: str) -> bool:
    hwp.HAction.Run("MoveDocBegin")
    hwp.HAction.GetDefault("RepeatFind", hwp.HParameterSet.HFindReplace.HSet)
    hset = hwp.HParameterSet.HFindReplace
    hset.FindString = text
    hset.IgnoreMessage = 1
    return bool(hwp.HAction.Execute("RepeatFind", hwp.HParameterSet.HFindReplace.HSet))


def extract_text(path: Path) -> str:
    from contextlib import closing
    import io

    from hwp5.hwp5txt import TextTransform
    from hwp5.xmlmodel import Hwp5File

    buf = io.BytesIO()
    with closing(Hwp5File(str(path))) as f:
        TextTransform().transform_hwp5_to_text(f, buf)
    return buf.getvalue().decode("utf-8", errors="replace")


def build_pairs() -> list[tuple[str, str]]:
    pairs: list[tuple[str, str]] = [
        ("SenseVoca(센스보카)", "PitchLens(피치렌즈)"),
        ("SenseVoca", "PitchLens"),
        ("센스보카", "PitchLens"),
        (
            "감각을 자극하는 센스있는 영어 단어 해마 학습법, SenseVoca(센스보카)",
            "AI 기반 발표 피드백·코칭 플랫폼, PitchLens(피치렌즈)",
        ),
        (
            "감각을 자극하는 센스있는 영어 단어 해마 학습법, PitchLens(피치렌즈)",
            "AI 기반 발표 피드백·코칭 플랫폼, PitchLens(피치렌즈)",
        ),
        ("2025.06.20", "2026.05.30"),
        ("2025학년도 1학기", "2025학년도 2학기"),
        ("sensevoca", "pitchlens"),
    ]

    old_overview = (
        "영어를 학습하고자 할 때 가장 먼저 마주하는 관문은 단어 암기다. 많은 사람들이 읽고 쓰기를 반복해 단어를 외우지만, "
        "이러한 방법은 장기기억으로 이어지기 어렵다. 해마 학습법은 기억할 대상을 시각화하여, 뇌 속의 해마가 이를 장기기억으로 "
        "분류할 수 있도록 유도하는 방식이다. PitchLens는 경선식 영어 단어장에서 활용되던 해마 학습법을 기반으로, 단기간에 많은 "
        "단어를 효율적으로 암기할 수 있도록 돕는다."
    )
    new_overview_start = (
        "대학 강의, 캡스톤 발표, 취업·창업 피칭 등에서 발표 역량은 학습 성과와 직결되는 핵심 역량이다. "
        "PitchLens는 PPT·PDF 발표 자료 업로드와 슬라이드별 웹 녹음, STT·ML·LLM 기반 피드백을 제공하는 통합 플랫폼이다."
    )
    pairs.append((old_overview, new_overview_start))

    # 개요 문단 후반(부분 치환 후 남는 SenseVoca 잔여)
    pairs.extend([
        ("첫째, 영어 단어의 발음을 활용하여 뜻이 연상되는 문장과 이미지를 제공한다.", "첫째, OpenAI Whisper로 슬라이드별 발화를 텍스트로 변환한다."),
        ("특히 사용자의 관심사에 맞춘 문장과 이미지를 제공함으로써 상상력을 자극하고 학습의 몰입도를 높인다.", "둘째, 팀이 수집·라벨링한 음성 데이터로 학습한 로지스틱 회귀 모델이 발화 속도와 필러를 판별한다."),
        ("둘째, 연상 문장을 출력하는 과정에서 부정확해진 발음을 교정할 수 있도록, 발음 교정 기능을 제공한다.", "셋째, GPT-4o가 슬라이드·전사·음성 지표를 바탕으로 슬라이드별·종합 피드백을 생성한다."),
        ("단어 카드에서 제공되는 원어민의 발음을 듣고 따라 하면, 발음에 대한 전체적인 평가와 함께 교정 문구가 제시된다.", "넷째, 관리자 콘솔을 통해 사용자·발표 세션을 운영·모니터링할 수 있다."),
        ("이는 직접 말하며 외우는 방식을 자연스럽게 유도해 기억 효과를 더욱 강화할 수 있다. ", ""),
        ("이러한 기능을 통해 PitchLens는 단어의 장기기억 정착과 학습 흥미 유발을 동시에 실현한다.", "이를 통해 학습자는 객관적 지표와 구체적 개선안을 바탕으로 자기주도적 발표 연습이 가능해진다."),
    ])

    pairs.extend([
        (
            "단어의 발음을 활용하여 뜻이 연상되는 문장과 이미지를 사용자 맞춤형으로 제공하여, 시각적·청각적 연상을 극대화",
            "슬라이드 단위로 발표 자료와 녹음을 동기화하여 슬라이드마다 독립적인 분석·피드백을 제공",
        ),
        (
            "사용자의 발음을 실시간 분석하고 점수와 피드백을 제공하여, 정확한 음성 기반 암기를 유도",
            "속도·필러는 학습된 ML 모델이, 내용·유사도는 LLM이 담당하도록 역할을 분리",
        ),
        (
            "학습 피로도를 줄이고 몰입감을 높이기 위해, 학습 구간당 단어 개수를 최대 10개로 제한",
            "AWS S3 Presigned URL로 대용량 PPT·오디오를 직접 업로드",
        ),
        (
            "애니메이션 효과를 활용한 카드 UI와 일관성 있는 버튼 UI를 통해 직관적인 사용자 경험 제공",
            "JWT·USER/ADMIN 역할·내부 API 시크릿으로 보안을 강화",
        ),
        (
            "해마 학습법 기반 연상 문장과 이미지 제공을 통해, 단기간에 많은 단어를 장기적으로 암기",
            "슬라이드별 유사도·시각·내용 피드백으로 발표 준비 시간을 단축",
        ),
        (
            "LLM, 이미지 생성, 음성 인식 등 최신 AI 기술을 통합한 스마트 학습 도구로, 차세대 영어 학습 환경 제공",
            "STT·ML·LLM·클라우드·웹 보안을 통합한 발표 코칭 플랫폼",
        ),
        ("Android Studio, IntelliJ IDEA, Flutter, Spring Boot, AWS, MySQL, Figma",
         "VS Code, IntelliJ IDEA, Android Studio, Spring Boot, AWS, Microsoft SQL Server"),
        ("Dart, Python, Java", "JavaScript, Java, Python"),
        ("OpenAI GPT 4o mini, DALL·E 3, Azure Speech-to-Text",
         "OpenAI Whisper, GPT-4o, scikit-learn"),
        ("- LLM과 DALL·E를 활용해 단어의 의미를 연상할 수 있는 문장과 이미지 생성",
         "- PPT/PDF 업로드 및 슬라이드별 웹 녹음 기능 구현"),
        ("- 사용자의 관심사에 맞는 연상 문장 제공",
         "- Whisper STT와 지도학습 기반 속도·필러 분석 구현"),
        ("- STT를 통해 발음 교정 기능을 제공함으로써 연상 예문의 단점 보완",
         "- GPT-4o 슬라이드별·종합 발표 피드백 및 Spring Boot·React 구현"),
        (
            "PitchLens는 단어 학습의 집중도와 효율성을 높이기 위해, 단어장을 10개 단위의 구간으로 나누어 제공한다.",
            "PitchLens는 PDF·PPTX·PPT 업로드 후 브라우저에서 슬라이드별 녹음을 수행한다.",
        ),
        (
            "PitchLens는 해마 학습법을 기반으로 시각적·청각적 연상 요소를 결합하고, 최신 AI 기술(GPT, DALL·E, STT)을 접목하여 단어 암기의 효과를 극대화한 영어 학습 앱이다.",
            "PitchLens는 발표 자료·슬라이드별 녹음·STT·지도학습·LLM을 통합하여 자기주도적 발표 연습 환경을 제공한다.",
        ),
        ("가. 단어 학습 기능", "가. 발표 자료 업로드·슬라이드별 녹음"),
        ("나. 발음 교정 기능", "나. 음성 분석(전사·속도·필러)"),
        ("다. 나만의 단어장 기능", "다. AI 피드백"),
        ("라. 즐겨찾기 기능", "라. 마이페이지·관리자 기능"),
    ])
    return pairs


def main() -> int:
    if not TEMPLATE.is_file():
        print(f"템플릿 없음: {TEMPLATE}", file=sys.stderr)
        return 1

    print("※ 한글(HWP)에서 열려 있는 보고서 파일을 모두 닫은 뒤 실행하세요.\n")

    try:
        shutil.copy2(TEMPLATE, OUTPUT_KO)
        work_path = OUTPUT_KO
        print(f"1) 템플릿 복사 → {OUTPUT_KO.name}")
    except PermissionError:
        shutil.copy2(TEMPLATE, OUTPUT_V2)
        work_path = OUTPUT_V2
        print(f"1) '{OUTPUT_KO.name}' 이(가) 한글에서 열려 있어 새 파일로 생성:")
        print(f"   → {OUTPUT_V2.name}")

    try:
        import win32com.client
    except ImportError:
        print("pywin32 필요: pip install pywin32", file=sys.stderr)
        return 1

    hwp = win32com.client.gencache.EnsureDispatch("HWPFrame.HwpObject")
    hwp.RegisterModule("FilePathCheckDLL", "FilePathCheckDLL")
    hwp.XHwpWindows.Item(0).Visible = False

    path = str(work_path.resolve())
    if not hwp.Open(path):
        print("한글 파일 열기 실패:", path, file=sys.stderr)
        return 1

    for i, (find, repl) in enumerate(build_pairs(), 1):
        replace_all(hwp, find, repl)
        print(f"  · 치환 {i}/{len(build_pairs())}: {find[:40]}…")

    hwp.Save()
    if work_path != OUTPUT_ASCII:
        hwp.SaveAs(str(OUTPUT_ASCII.resolve()))
    print(f"\n2) 저장 완료: {work_path}")
    if work_path == OUTPUT_V2:
        print(f"   (한글에서 기존 파일을 닫은 뒤 v2 내용을 사용하거나, v2 파일을 여세요)")

    has_sv = find_in_doc(hwp, "SenseVoca")
    has_pl = find_in_doc(hwp, "PitchLens")
    hwp.Quit()

    # 파일 검증
    text = extract_text(work_path)
    VERIFY_TXT.write_text(text[:12000], encoding="utf-8")
    sv = text.count("SenseVoca") + text.count("센스보카")
    pl = text.count("PitchLens")
    hm = text.count("해마")
    word = text.count("단어장")

    print(f"\n3) 파일 내 텍스트 검증:")
    print(f"   SenseVoca/센스보카 잔여: {sv}회  (0이면 표지·서론 치환 OK)")
    print(f"   PitchLens: {pl}회")
    print(f"   '해마' 잔여: {hm}회, '단어장' 잔여: {word}회  (본론·결론은 md로 추가 교체 필요)")
    print(f"   확인용 텍스트: {VERIFY_TXT}")

    if sv > 0:
        print("\n⚠ SenseVoca 문자열이 남았습니다. 한글을 닫고 스크립트를 다시 실행하세요.")
        return 2

    if pl < 3:
        print("\n⚠ PitchLens 치환이 거의 없습니다. 잘못된 파일을 열었을 수 있습니다.")
        return 2

    print("\n✓ 표지·서론 치환 완료. 한글에서 위 파일을 연 뒤 1페이지(표지)에 PitchLens가 보이는지 확인하세요.")
    print("  ※ 본론(Ⅱ) 대부분은 여전히 SenseVoca(단어장) 설명입니다 → md 본문으로 절 단위 교체가 필요합니다.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
