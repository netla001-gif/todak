import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", String(Date.now()));
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/"), { ASSETS:{ fetch:async()=>new Response("Not found",{status:404}) } }, { waitUntil(){}, passThroughOnException(){} });
}

test("renders the Korean recommendation feed", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /강동구에서 시작하는 아기 나들이/);
  assert.match(html, /맞춤 피드 보기/);
  assert.match(html, /길동생태공원/);
  assert.match(html, /서대문자연사박물관/);
  assert.equal((html.match(/class="threads-place"/g) || []).length, 20);
  assert.match(html, /미사도서관/);
  assert.match(html, /국립중앙박물관 어린이박물관/);
  assert.match(html, /하남 소재는 아니에요/);
  assert.match(html, /DbX5l0BlGYz/);
  assert.match(html, /실시간 자동 수집 결과는 아니에요/);
  assert.doesNotMatch(html, /codex-preview|Building your site/);
});
