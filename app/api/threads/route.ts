import { normalizeQuery, rankThreads, searchThreads, ThreadsError } from "@/lib/threads.mjs";

export const dynamic = "force-dynamic";
const messages: Record<string, string> = {
  invalid_query: "지역명이나 장소명을 2~60자로 입력해 주세요.",
  not_configured: "Threads 연결을 준비 중입니다. 잠시 후 다시 이용해 주세요.",
  authentication: "Threads 연결을 갱신 중입니다. 잠시 후 다시 이용해 주세요.",
  permission: "Threads 공개 검색 권한을 확인 중입니다.",
  rate_limited: "검색 요청이 많습니다. 잠시 후 다시 검색해 주세요.",
  unavailable: "Threads에서 응답을 받지 못했습니다. 잠시 후 다시 검색해 주세요.",
  invalid_response: "Threads 검색 응답을 확인하지 못했습니다. 잠시 후 다시 검색해 주세요.",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = normalizeQuery(url.searchParams.get("q"));
  const sort = url.searchParams.get("sort") === "recent" ? "recent" : "relevant";
  const headers = { "Cache-Control": "no-store" };
  try {
    const result = await searchThreads(query, { token: process.env.THREADS_ACCESS_TOKEN });
    const posts = rankThreads(result.posts, query, { sort });
    return Response.json({ query, posts, fetchedAt: result.fetchedAt, sourceCount: result.posts.length,
      message: posts.length ? null : result.posts.length
        ? "검색어와 일치하는 공개 글을 찾지 못했습니다. 다른 검색어를 입력해 보세요."
        : "Threads가 검색 결과를 반환하지 않았습니다. 다른 검색어를 시도해 주세요. 공개 검색 접근 범위에 따라 결과가 제한될 수 있습니다." }, { headers });
  } catch (error) {
    const code = error instanceof ThreadsError ? error.code : "unavailable";
    const status = error instanceof ThreadsError ? error.status : 502;
    return Response.json({ error: code, message: messages[code] ?? messages.unavailable }, { status, headers });
  }
}
