// Read-only capability check. Never print the token or API pagination URLs.
const token = process.env.THREADS_ACCESS_TOKEN;
if (!token) throw new Error("THREADS_ACCESS_TOKEN is required");

if (process.argv.includes("--app-search")) {
  const { default: worker } = await import("../dist/server/index.js");
  const response = await worker.fetch(new Request("http://localhost/api/threads?q=" + encodeURIComponent("하남")),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} });
  const body = await response.json();
  console.log(JSON.stringify({ check: "built_app_search", status: response.status,
    sourceCount: body.sourceCount, displayedCount: body.posts?.length,
    error: body.error, realResultsVerified: (body.posts?.length ?? 0) > 0 }));
  process.exit(response.ok ? 0 : 1);
}

function safeMessage(value) {
  return String(value ?? "").replaceAll(token, "[REDACTED]").slice(0, 400);
}

async function get(path, params = {}) {
  const url = new URL(path, "https://graph.threads.net");
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  if (process.argv.includes("--query-auth")) url.searchParams.set("access_token", token);
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(20000),
    });
    const body = await response.json();
    return { status: response.status, body };
  } catch (error) {
    return { status: null, body: { error: {
      code: error.cause?.code ?? error.name,
      message: safeMessage(error.message),
    } } };
  }
}

function summary(result) {
  return {
    status: result.status,
    ...(result.body.error ? { error: {
      code: result.body.error.code,
      subcode: result.body.error.error_subcode,
      message: safeMessage(result.body.error.message),
    } } : {}),
  };
}

const me = await get("/me", { fields: "id,username" });
console.log(JSON.stringify({ check: "identity", ...summary(me), username: me.body.username }));
if (me.status !== 200) process.exit(1);

// Inspect only safe metadata; never log the input token or raw response.
const debug = await get("/debug_token", { input_token: token });
console.log(JSON.stringify({ check: "token_permissions", ...summary(debug),
  valid: debug.body.data?.is_valid, scopes: debug.body.data?.scopes }));

async function search(q, searchType, limit) {
  const params = { q, search_type: searchType, limit };
  const full = await get("/keyword_search", {
    ...params, fields: "id,username,permalink,has_replies",
  });
  if (full.status === 200) return full;
  console.log(JSON.stringify({ check: "search_fields_error", query: q, ...summary(full) }));
  return get("/keyword_search", { ...params, fields: "id,username,permalink" });
}

const results = await Promise.allSettled([
  ...["아이랑", "하남"].map(q => search(q, "RECENT", "10")),
]);
const candidates = [];
for (const [index, result] of results.entries()) {
  if (result.status !== "fulfilled") {
    console.log(JSON.stringify({ check: "request", error: safeMessage(result.reason) }));
    continue;
  }
  const response = result.value;
  const posts = Array.isArray(response.body.data) ? response.body.data : [];
  const otherPosts = posts.filter(post => post.username && post.username !== me.body.username);
  console.log(JSON.stringify({ check: "public_search", query: ["아이랑", "하남"][index],
    ...summary(response), count: posts.length, otherAuthors: otherPosts.length,
    withReplies: otherPosts.filter(post => post.has_replies).length }));
  candidates.push(...otherPosts.filter(post => post.has_replies !== false));
}

if (!candidates.length) {
  const minimal = await search("Threads", "TOP", "5");
  console.log(JSON.stringify({ check: "control_search", query: "Threads", ...summary(minimal),
    count: Array.isArray(minimal.body.data) ? minimal.body.data.length : undefined }));
  if (Array.isArray(minimal.body.data)) candidates.push(...minimal.body.data.filter(post => post.username && post.username !== me.body.username && post.has_replies !== false));
}

const targets = [...new Map(candidates.map(post => [post.id, post])).values()].slice(0, 2);
if (!targets.length) console.log(JSON.stringify({ check: "public_replies", tested: false, reason: "No eligible third-party post found in this bounded search; reply access remains unverified" }));
for (const post of targets) {
  for (const endpoint of ["replies", "conversation"]) {
    const result = await get(`/${post.id}/${endpoint}`, { fields: "id,text", limit: "5" });
    console.log(JSON.stringify({ check: "public_replies", endpoint, postUrl: post.permalink,
      ...summary(result), count: Array.isArray(result.body.data) ? result.body.data.length : undefined }));
  }
}
