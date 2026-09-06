# vinext-starter

## 현재 토닥 구현

- 홈 상단에 Threads 원문을 확인한 나들이 후보 20곳을 표시한다. 강동·송파·광진·하남 14곳을 우선하며, 나머지 서울 후보도 함께 제공한다.
- `lib/threads-places.mjs`의 검토된 자료를 사용한다. 장소·지역 검증, 중복 제거, 원문 출처, 게시일, 방문 후기/추천 목록 구분을 포함하며 실시간 자동 수집 결과가 아니다.
- 기존 월령·거리·선호 기반 추천은 유지한다.
- 개인용 Chrome 확장 프로그램은 `extensions/threads-reader`에 있다. `npm run build:threads-reader`로 설치용 `work/threads-reader`를 생성하고, 설치와 사용법은 해당 폴더의 소스 README를 참고한다.
- `npm run test:threads-reader`는 확장 프로그램 테스트다. 전체 웹사이트 검증은 `npm test`, `npm run build`, `npm run test:rendered`로 실행한다.
- `.env.local`의 인증키와 생성된 설치용 폴더·빌드 결과는 Git에 포함하지 않는다.

## Threads 나들이 검색

- `/threads`: 지역·장소 검색, 관련성순/최신순, 원문·댓글 링크.
- `/api/threads?q=하남&sort=relevant`: 서버의 `THREADS_ACCESS_TOKEN`으로 공개 검색. 토큰을 클라이언트 환경 변수로 설정하지 않는다.
- 검색 1회에 최근 결과 최대 50건을 요청하고, 검색어가 있는 글을 대상으로 중복·잘못된 출처를 제거한 뒤 최대 30건을 표시한다. 페이지 전체 검색이나 Threads 전체를 대상으로 한 완전한 검색을 보장하지 않는다.
- 관련성 점수는 검색어 일치 비율(40), 나들이 언급(25), 이용 정보 언급(15), 30일 기준으로 감소하는 최신성(최대 20)을 더하고 광고·협찬 문구가 있으면 30을 뺀다. 사용자 평가나 장소 안전도 점수가 아니다.
- 결과·검색어는 DB에 저장하지 않는다. API 실패와 빈 결과를 구분한다. 공개 검색이 0건이면 권한 검증이 완료된 것으로 간주하지 않는다.
- `npm test`: 추천 및 검색 알고리즘/API 클라이언트 테스트. `npm run build` 후 `npm run test:rendered`: 빌드된 화면과 API 경로 검증.
- `node --env-file=.env.local scripts/threads-probe.mjs --app-search`: 실제 토큰으로 빌드된 앱 경로를 검사하되 토큰·게시물 본문은 출력하지 않는다.
- `/privacy`, `/data-deletion`: 현재 구현에 맞춘 개인정보 및 삭제 안내. 운영 문의는 `netla@naver.com`.
- Meta의 공개 검색 접근 승인과 운영 환경 토큰 설정이 별도로 필요하다. 현재 확인 기록은 `scripts/threads-status.md`에 있다.

A clean full-stack starter running on
[vinext](https://github.com/cloudflare/vinext), with optional Cloudflare D1 and
Drizzle support.

## Prerequisites

- Node.js `>=22.13.0`

## Quick Start

```bash
npm install
npm run dev
npm run build
```

This starter does not use `wrangler.jsonc`.

## Included Shape

- edit site code under `app/`
- `.openai/hosting.json` declares optional Sites D1 and R2 bindings
- `vite.config.ts` simulates declared bindings for local development
- `db/schema.ts` starts intentionally empty
- `examples/d1/` contains an optional D1 example surface
- `drizzle.config.ts` supports local migration generation when needed

## Workspace Auth Headers

Signed-in visitors receive both `oai-authenticated-user-id` and `oai-authenticated-user-email`. Private Sites require every visitor to sign in; public Sites may also have anonymous visitors, for whom neither header is present.

The user ID is stable for the same user on the same Site and different across Sites. Email and name are intended for display or contact purposes.

SIWC-authenticated workspace sites may also receive
`oai-authenticated-user-full-name` when the user's SIWC profile has a non-empty
`name` claim. The full-name value is percent-encoded UTF-8 and is accompanied by
`oai-authenticated-user-full-name-encoding: percent-encoded-utf-8`.

Treat the full name as optional and fall back to email when it is absent:

```tsx
import { headers } from "next/headers";

export default async function Home() {
  const requestHeaders = await headers();
  const userId = requestHeaders.get("oai-authenticated-user-id");
  const email = requestHeaders.get("oai-authenticated-user-email");
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName =
    encodedFullName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
      "percent-encoded-utf-8"
      ? decodeURIComponent(encodedFullName)
      : null;

  const displayName = fullName ?? email;
  // ...
}
```

## Optional Dispatch-Owned ChatGPT Sign-In

Import the ready-to-use helpers from `app/chatgpt-auth.ts` when the site needs
optional or required ChatGPT sign-in:

- Use `getChatGPTUser()` for optional signed-in UI.
- Use `requireChatGPTUser(returnTo)` for server-rendered pages that should send
  anonymous visitors through Sign in with ChatGPT.
- Use `chatGPTSignInPath(returnTo)` and `chatGPTSignOutPath(returnTo)` for
  browser links or actions.
- Pass a same-origin relative `returnTo` path for the destination after sign-in
  or sign-out. The helper validates and safely encodes it.
- Mark protected pages with `export const dynamic = "force-dynamic"` because
  they depend on per-request identity headers.

Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`, the
OAuth cookies, and identity header injection. Do not implement app routes for
those reserved paths. Routes that do not import and call the helper remain
anonymous-compatible.

SIWC establishes identity only; it does not prove workspace membership. Use the
Sites hosting platform's access policy controls for workspace-wide restrictions,
or enforce explicit server-side membership or allowlist checks.

Use SIWC for account pages, user-specific dashboards, saved records, and write
actions tied to the current ChatGPT user. Leave public content anonymous.

## Useful Commands

- `npm run dev`: start local development
- `npm run build`: verify the vinext build output
- `npm test`: build the starter and verify its rendered loading skeleton
- `npm run db:generate`: generate Drizzle migrations after schema changes

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)
