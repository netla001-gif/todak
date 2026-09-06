import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../dist/server/index.js';
const env = { ASSETS: { fetch: async () => new Response('Not found', {status:404}) } };
const ctx = { waitUntil(){}, passThroughOnException(){} };
const request = path => worker.fetch(new Request('http://localhost'+path),env,ctx);

test('built Threads page is public and has search controls and privacy navigation',async()=>{
 const response = await request('/threads'); const html = await response.text();
 assert.equal(response.status,200); assert.match(html,/Threads에서 나들이 찾기/); assert.match(html,/threads-query/); assert.match(html,/href="\/privacy"/);
});
test('built endpoint validates, ranks actual API-shaped responses and never exposes credentials',async()=>{
 const previousToken=process.env.THREADS_ACCESS_TOKEN;
 const originalFetch=globalThis.fetch;
 process.env.THREADS_ACCESS_TOKEN='test-secret-never-expose';
 try {
  globalThis.fetch=async(url,options)=>{
   assert.equal(new URL(url).hostname,'graph.threads.net');
   assert.equal(options.headers.Authorization,'Bearer test-secret-never-expose');
   return Response.json({data:[{id:'1',username:'test',text:'하남 아이랑 유모차 무료 주차',permalink:'https://www.threads.com/@test/post/abc',timestamp:new Date().toISOString()}],paging:{next:'https://example.test/?access_token=test-secret-never-expose'}});
  };
  assert.equal((await request('/api/threads?q=a')).status,400);
  const response=await request('/api/threads?q='+encodeURIComponent('하남'));
  const text=await response.text(); const result=JSON.parse(text);
  assert.equal(response.status,200); assert.equal(response.headers.get('cache-control'),'no-store');
  assert.equal(result.posts.length,1); assert.equal(result.posts[0].username,'test'); assert.ok(!text.includes('test-secret-never-expose'));
  globalThis.fetch=async()=>Response.json({error:{code:190,message:'test-secret-never-expose'}},{status:400});
  const failure=await request('/api/threads?q='+encodeURIComponent('하남'));
  const failureText=await failure.text(); assert.equal(failure.status,503); assert.ok(!failureText.includes('test-secret-never-expose')); assert.equal(JSON.parse(failureText).error,'authentication');
 } finally {globalThis.fetch=originalFetch;if(previousToken===undefined)delete process.env.THREADS_ACCESS_TOKEN;else process.env.THREADS_ACCESS_TOKEN=previousToken;}
});
