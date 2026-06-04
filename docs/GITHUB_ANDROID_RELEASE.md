# PitchLens Android APK — GitHub Actions 자동 배포

사용자 앱(`Client/pitchlens-frontend`) Release APK를 빌드해 **GitHub Releases**에 올립니다.  
발표 시 Releases 링크 하나로 APK 다운로드·설치가 가능합니다.

## 흐름

```
git push (태그) → GitHub Actions → Release APK 빌드 → Releases 업로드
```

## 1. 저장소 준비

프로젝트 루트(`TeamProject`)를 GitHub 저장소에 push합니다.  
`.env`, `node_modules`, `android/**/build`, `*.keystore` 는 커밋하지 않습니다.

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<조직>/<저장소>.git
git push -u origin main
```

## 2. 서명 키 (최초 1회)

PowerShell에서:

```powershell
cd Client\pitchlens-frontend
powershell -ExecutionPolicy Bypass -File scripts\export-android-keystore-secrets.ps1
```

출력된 값을 GitHub → **Settings → Secrets and variables → Actions → Secrets** 에 등록:

| Secret | 설명 |
|--------|------|
| `ANDROID_KEYSTORE_BASE64` | 스크립트가 출력한 Base64 한 줄 |
| `ANDROID_KEYSTORE_PASSWORD` | `pitchlens2026` (스크립트 기본값) |
| `ANDROID_KEY_ALIAS` | `pitchlens` |
| `ANDROID_KEY_PASSWORD` | `pitchlens2026` |

비밀번호는 팀에서 변경해도 되며, 변경 시 keystore와 Secrets를 함께 맞춥니다.

## 3. API URL (선택)

빌드 시 박히는 서버 주소는 **Repository variables** 로 바꿀 수 있습니다.  
미설정 시 워크플로 기본값(`122.36.99.66`)을 사용합니다.

| Variable | 예시 |
|----------|------|
| `REACT_APP_API_URL` | `http://122.36.99.66:8080` |
| `REACT_APP_FEEDBACK_API_URL` | `http://122.36.99.66:8001` |
| `REACT_APP_VOICE_API_URL` | `http://122.36.99.66:8765` |

## 4. APK 배포 실행

### 방법 A — 태그 push (권장)

```bash
git tag pitchlens-v1.0.0
git push origin pitchlens-v1.0.0
```

### 방법 B — 수동 실행

GitHub → **Actions** → **PitchLens Android Release** → **Run workflow** → 버전 입력

## 5. 다운로드 링크

배포가 끝나면:

- 최신: `https://github.com/<조직>/<저장소>/releases/latest`
- 특정 버전: Releases 페이지에서 `PitchLens-1.0.0.apk` 다운로드

**설치:** 설정 → 보안 → 「출처를 알 수 없는 앱」허용 후 APK 설치

## 문제 해결

| 증상 | 확인 |
|------|------|
| Secrets 오류 | 4개 Secret 모두 등록 여부 |
| Gradle 실패 | Actions 로그에서 `assembleRelease` 단계 |
| 앱이 서버에 안 붙음 | Variables/API 주소, 서버 방화벽·포트 |

워크플로 파일: `.github/workflows/pitchlens-android-release.yml`
