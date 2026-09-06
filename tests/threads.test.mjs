import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeQuery, rankThreads, searchThreads } from '../lib/threads.mjs';
const now = Date.parse('2026-09-06T00:00:00Z');
const post = (id, text, extra = {}) => ({ id, text, username:'test_parent', permalink:`https://www.threads.com/@test_parent/post/${id}`, timestamp:'2026-09-05T00:00:00Z', ...extra });

test('validates and normalizes queries before making a request', async () => {
  assert.equal(normalizeQuery('  하남   키즈카페 '),'하남 키즈카페');
  for (const q of ['', '가', 'x'.repeat(61), '\u200b하남', null]) {
    assert.equal(normalizeQuery(q), '');
    await assert.rejects(searchThreads(q, {token:'test',fetchImpl:()=>assert.fail('must not call API')}), {code:'invalid_query'});
  }
});
test('ranks useful outing information ahead of unrelated and promotional posts', () => {
  const posts = rankThreads([
    post('1','하남 주식 소식'), post('2','하남 아이랑 나들이, 유모차 주차 무료'),
    post('3','하남 아이랑 나들이, 유모차 주차 무료 #광고'), post('4','부산 맛집'),
  ], '하남', {now});
  assert.equal(posts[0].id,'2');
  assert.ok(posts.find(x=>x.id==='3').promotion);
  assert.equal(posts.length,3);
  assert.ok(posts[0].reasons.includes('이용 정보 언급'));
});
test('partial query matches never imply the requested location was verified', () => {
  const results = rankThreads([post('1', '아이랑 과학관 나들이, 유모차 가능'), post('2', '하남 부동산 정보')], '하남 아이랑', {now});
  assert.equal(results[0].id, '1');
  assert.ok(results[0].reasons.includes('검색어 일부 일치'));
  assert.ok(!results[0].reasons.includes('검색어 모두 일치'));
});
test('deduplicates IDs and copied text, rejects unsafe links and malformed data', () => {
  const result=rankThreads([post('1','하남 아이랑 나들이'),post('1','하남 중복 ID'),post('2','하남 아이랑 나들이!'),post('3','하남 스팸',{permalink:'javascript:alert(1)'}),post('4','하남 피싱',{permalink:'https://www.threads.com.evil.test/@a/post/4'}),null,{}], '하남',{now});
  assert.deepEqual(result.map(x=>x.id),['1']);
});
test('recent sort uses valid timestamps; missing and future timestamps are not fresh', () => {
  const result=rankThreads([post('1','하남 아이랑 무료',{timestamp:'2026-08-01T00:00:00Z'}),post('2','하남 소식'),post('3','하남 미래',{timestamp:'2099-01-01'}),post('4','하남 날짜없음',{timestamp:'bad'})], '하남',{now,sort:'recent'});
  assert.equal(result[0].id,'2'); assert.equal(result[1].id,'1');
  assert.equal(result[2].timestamp,null);
});
test('API request is bounded, authenticated server side, and strips paging metadata', async () => {
  const result=await searchThreads('하남',{token:'secret-test',fetchImpl:async (url,options)=>{
    assert.equal(url.origin,'https://graph.threads.net');assert.equal(url.searchParams.get('limit'),'50');
    assert.equal(url.searchParams.get('q'),'하남');assert.equal(options.headers.Authorization,'Bearer secret-test');
    assert.ok(!url.href.includes('secret-test'));
    return Response.json({data:[post('1','하남 아이랑')],paging:{next:'https://example.test/?access_token=secret-test'}});
  }});
  assert.equal(result.posts.length,1); assert.ok(!JSON.stringify(result).includes('secret-test'));
});
test('empty success, missing token, permission, expiration, limit and failure stay distinct', async () => {
  assert.deepEqual((await searchThreads('하남',{token:'test',fetchImpl:async()=>Response.json({data:[]})})).posts,[]);
  await assert.rejects(searchThreads('하남'),{code:'not_configured'});
  for (const [status,code,expected] of [[403,10,'permission'],[400,190,'authentication'],[429,4,'rate_limited'],[500,1,'unavailable']]) {
    await assert.rejects(searchThreads('하남',{token:'test',fetchImpl:async()=>Response.json({error:{code,message:'test'}},{status})}),{code:expected});
  }
  await assert.rejects(searchThreads('하남',{token:'test',fetchImpl:async()=>{throw Error('secret-test')}}),{code:'unavailable'});
  await assert.rejects(searchThreads('하남',{token:'test',fetchImpl:async()=>Response.json({})}),{code:'invalid_response'});
});
