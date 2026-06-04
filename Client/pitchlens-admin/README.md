# PitchLens Admin

PitchLens 관리자 전용 콘솔입니다. 일반 사용자 앱(`pitchlens-frontend`)과 분리되어 **포트 3001**에서 웹으로 실행하거나, **Capacitor**로 Android/iOS 네이티브 앱으로 빌드할 수 있습니다.

## 웹 실행

```bash
cd Client/pitchlens-admin
npm install
npm start
```

실행 시 브라우저가 자동으로 http://localhost:3001 을 엽니다. (`npm run dev` 도 동일)

모바일 브라우저·앱 WebView에서는 768px 이하에서 하단 탭 네비게이션과 카드형 목록 UI가 적용됩니다.

## 모바일 앱 (Android / iOS)

일반 사용자 앱과 동일하게 [Capacitor](https://capacitorjs.com/)로 네이티브 셸에 웹 UI를 패키징합니다.

### 사전 요구

- Node.js 18+
- **Android**: Android Studio, JDK 17
- **iOS** (macOS만): Xcode

### 빌드 및 실행

```bash
cd Client/pitchlens-admin
npm install

# .env 에 API 주소 설정 (아래 참고)
npm run cap:sync          # 웹 빌드 + 네이티브 프로젝트 동기화
npm run cap:open:android  # Android Studio 열기
npm run cap:open:ios      # Xcode 열기 (macOS)
```

Android Studio에서 Run(▶)으로 에뮬레이터 또는 실기기에 설치합니다.

앱 ID: `com.pitchlens.admin` · 앱 이름: **PitchLens Admin**

> HTTP API 서버를 쓰는 경우, `android/app/src/main/res/xml/network_security_config.xml` 에 cleartext 허용이 필요합니다. `cap add android` 직후 frontend 프로젝트와 동일한 설정을 추가하세요.

## 환경 변수

`.env` 파일:

```
VITE_API_URL=http://122.36.99.66:8080
```

Auth 서버(Spring) 주소와 동일하게 맞춥니다. **앱 빌드 전**에 반드시 설정해야 합니다 (`npm run build` 시 번들에 포함됨).

## 관리자 계정 만들기

1. 일반 앱에서 회원가입하거나 DB에 사용자를 만듭니다.
2. DB에서 해당 사용자의 `role`을 `ADMIN`으로 변경합니다.

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-admin@email.com';
```

3. 관리자 콘솔(웹 또는 앱)에서 해당 이메일로 로그인합니다.

## 기능

- **대시보드**: 회원 수, 발표 수 통계
- **회원 관리**: 목록 조회, USER/ADMIN 역할 변경, 계정 삭제
- **발표 관리**: 전체 발표 목록, 피드백 완료 여부, **상세 피드백 조회** (마이페이지와 동일한 종합·슬라이드별 피드백)

## 백엔드 API (Auth 서버 재배포 필요)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/v1/users/me` | 내 정보 (role 포함) |
| GET | `/api/v1/admin/stats` | 통계 |
| GET | `/api/v1/admin/users` | 전체 회원 |
| GET | `/api/v1/admin/presentations` | 전체 발표 |
| GET | `/api/v1/admin/presentations/{id}` | 발표 상세 (피드백·슬라이드 분석) |
| PATCH | `/api/v1/admin/users/{id}/role` | 역할 변경 |
| DELETE | `/api/v1/admin/users/{id}` | 회원 삭제 |

ADMIN 역할이 있는 JWT만 `/api/v1/admin/**` 에 접근할 수 있습니다.
