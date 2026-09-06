import { extractThreadsPage } from './extract.mjs';
import { normalizeQuery, rankThreads } from './threads.mjs';
const el = id => document.getElementById(id);
let snapshot = null;
const errors = {
  not_search: 'Threads 검색 화면에서 도구를 열어 주세요.',
  loading: '검색 화면이 바뀌는 중입니다. 결과가 뜬 뒤 다시 읽어 주세요.',
  no_visible_posts: '현재 화면에서 읽을 수 있는 글이 없습니다. 로그인·검색 결과 로딩을 확인한 뒤 다시 읽어 주세요.',
};
function render() {
  el('results').replaceChildren();
  if (!snapshot) return;
  const posts = rankThreads(snapshot.posts, snapshot.query, {sort:el('sort').value});
  el('status').textContent = `화면에서 ${snapshot.posts.length}건 읽음 · 검색어에 맞는 ${posts.length}건 표시`;
  el('source').textContent = `검색어: ${snapshot.query} · 읽은 시각: ${new Date(snapshot.fetchedAt).toLocaleString('ko-KR')}`;
  for (const post of posts) {
    const card = document.createElement('article');
    const heading = document.createElement('h2'); heading.textContent = '@'+post.username;
    const meta = document.createElement('p'); meta.className='hint'; meta.textContent = post.timestamp ? new Date(post.timestamp).toLocaleDateString('ko-KR') : '작성일 확인 안 됨';
    const reasons = document.createElement('p'); reasons.className='reasons'; reasons.textContent = [...post.reasons,...(post.promotion?['광고·협찬 문구 포함']:[])].join(' · ');
    const text = document.createElement('p'); text.className='post-text'; text.textContent=post.text;
    const link = document.createElement('a'); link.href=post.permalink; link.target='_blank'; link.rel='noreferrer'; link.textContent='Threads 원문과 댓글 보기 ↗';
    card.append(heading,meta,reasons,text,link); el('results').append(card);
  }
}
async function read() {
  snapshot=null; el('results').replaceChildren(); el('source').textContent=''; el('status').textContent='현재 검색 화면을 읽고 있습니다…'; el('read').disabled=true;
  try {
    const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
    const url = new URL(tab?.url || 'https://invalid.local');
    if (!['www.threads.com','threads.com','www.threads.net','threads.net'].includes(url.hostname) || url.pathname!=='/search') throw Error(errors.not_search);
    const [injected] = await chrome.scripting.executeScript({target:{tabId:tab.id},func:extractThreadsPage});
    const result = injected?.result;
    if (!result || result.error) throw Error(errors[result?.error] || '화면을 읽지 못했습니다. 다시 시도해 주세요.');
    if (!normalizeQuery(result.query)) throw Error('Threads에서 2~60자의 검색어로 검색해 주세요.');
    snapshot=result; el('query').value=result.query; render();
  } catch (error) { el('status').textContent=error instanceof Error ? error.message : '검색 화면을 읽지 못했습니다.'; }
  finally {el('read').disabled=false;}
}
el('search').addEventListener('submit',async event=>{
  event.preventDefault(); const query=normalizeQuery(el('query').value);
  if(!query){el('status').textContent='검색어를 2~60자로 입력해 주세요.';return;}
  try {await chrome.tabs.create({url:'https://www.threads.com/search?'+new URLSearchParams({q:query,serp_type:'default'})});window.close();}
  catch {el('status').textContent='Threads 탭을 열지 못했습니다.';}
});
el('read').addEventListener('click',read); el('sort').addEventListener('change',render);
read();
