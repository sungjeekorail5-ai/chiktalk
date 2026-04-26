<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 칙칙톡톡 프로젝트 운영 원칙

## 앱(Flutter) vs 웹(Next.js) 역할 분리

칙칙톡톡은 **Flutter 앱(`chiktalk_app`)** 과 **Next.js 웹(`chiktalk`)** 두 가지 클라이언트가 있다. 각 플랫폼의 한계를 보완하는 역할로 명확히 분리해서 개발한다.

### 핵심 원칙

**iOS 사용자를 커버하기 위한 외부 도구/콘텐츠는 웹에만 구현한다.**

이유: Android 사용자는 칙칙톡톡 앱 안에서 외부 앱(예: 코레일CBT, korail_3D 등)을 APK로 받을 수 있지만, **iOS 사용자는 받을 방법이 없다.** 따라서 외부 앱의 핵심 기능을 웹(`chiktalk`)에 직접 통합해서 iOS 사용자도 사용할 수 있게 만든다.

### 적용 대상 (현재/앞으로)

- **코레일 CBT** — 기출문제 풀이 → 웹에 `/cbt` 라우트로 통합 (작업 중)
- **korail_3D** (3D 시뮬레이션 등) — 향후 웹화 검토
- **korail_payroll** (급여계산기 등) — 향후 웹화 검토
- 그 외 사내 앱 시리즈 — 동일 원칙 적용

### 운영 규칙

- 외부 앱의 **데이터(JSON, 이미지 등)와 핵심 로직**만 가져와서 React로 다시 구현한다.
- 인증은 칙칙톡톡 기존 세션(STAFF) 그대로 활용 — Google/Kakao 로그인 따로 안 만든다.
- Firestore 컬렉션은 칙칙톡톡 사용자 문서 하위에 통합한다 (예: `users/{userId}/cbtScores`).
- 디자인은 Toss 스타일 디자인 시스템 (모바일/PC 반응형) 일관되게 적용한다.
- Flutter 앱(`chiktalk_app`)에는 이런 외부 기능을 **이중 구현하지 않는다** — 앱 사용자는 어차피 원본 APK 다운로드 가능.
