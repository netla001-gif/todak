const OUTING = /아이랑|아기랑|아이와|아기와|유아|유모차|키즈|놀이터|나들이|체험|생태공원|어린이|육아/iu;
const DETAILS = /주차|예약|입장|요금|무료|수유|기저귀|화장실|유모차|개월|세\b|운영시간/iu;
const PROMOTION = /#?광고|협찬|공동구매|공구오픈|파트너스|체험단|구매링크/iu;
export function normalizeQuery(value) {
  if (typeof value !== 'string') return '';
  const query = value.normalize('NFKC').replace(/\s+/gu, ' ').trim();
  return query.length >= 2 && query.length <= 60 && !/[\p{Cc}\p{Cf}]/u.test(query) ? query : '';
}

function safePermalink(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !['threads.net', 'www.threads.net', 'threads.com', 'www.threads.com'].includes(url.hostname) || url.username || url.password) return null;
    if (!/^\/@[^/]+\/post\/[^/]+\/?$/.test(url.pathname)) return null;
    return `${url.origin}${url.pathname}`;
  } catch { return null; }
}

// Scores describe text relevance, never a verified venue rating or child safety.
export function rankThreads(posts, query, { now = Date.now(), sort = 'relevant' } = {}) {
  const tokens = normalizeQuery(query).toLocaleLowerCase('ko').split(' ').filter(Boolean);
  if (!tokens.length) return [];
  const seenIds = new Set();
  const seenTexts = new Set();
  const results = [];
  for (const post of Array.isArray(posts) ? posts : []) {
    if (!post || typeof post.id !== 'string' || typeof post.text !== 'string' || typeof post.username !== 'string') continue;
    const permalink = safePermalink(post.permalink);
    const text = post.text.trim().slice(0, 10000);
    const lower = text.normalize('NFKC').toLocaleLowerCase('ko');
    const fingerprint = lower.replace(/https?:\/\/\S+/gu, '').replace(/[\p{P}\p{Z}\s]/gu, '');
    const matches = tokens.filter(token => lower.includes(token));
    if (!permalink || !text || !matches.length || seenIds.has(post.id) || seenTexts.has(fingerprint)) continue;
    seenIds.add(post.id); seenTexts.add(fingerprint);
    const parsed = Date.parse(post.timestamp);
    const published = Number.isFinite(parsed) && parsed <= now + 300000 ? parsed : null;
    const days = published === null ? Infinity : Math.max(0, (now - published) / 86400000);
    const outing = OUTING.test(text), details = DETAILS.test(text), promotion = PROMOTION.test(text);
    const score = 40 * matches.length / tokens.length + (outing ? 25 : 0) + (details ? 15 : 0) + 20 * Math.exp(-days / 30) - (promotion ? 30 : 0);
    const reasons = [matches.length === tokens.length ? '검색어 모두 일치' : '검색어 일부 일치'];
    if (outing) reasons.push('아이 나들이 언급');
    if (details) reasons.push('이용 정보 언급');
    results.push({ id: post.id, username: post.username.slice(0, 100), text, permalink,
      timestamp: published === null ? null : new Date(published).toISOString(),
      score: Math.round(score * 10) / 10, reasons, promotion });
  }
  return results.sort((a, b) => {
    const fresh = (Date.parse(b.timestamp) || 0) - (Date.parse(a.timestamp) || 0);
    return (sort === 'recent' ? fresh || b.score - a.score : b.score - a.score || fresh) || a.id.localeCompare(b.id);
  }).slice(0, 30);
}

export class ThreadsError extends Error {
  constructor(code, status = 502) { super(code); this.code = code; this.status = status; }
}

export async function searchThreads(query, { token, fetchImpl = fetch } = {}) {
  const normalized = normalizeQuery(query);
  if (!normalized) throw new ThreadsError('invalid_query', 400);
  if (!token) throw new ThreadsError('not_configured', 503);
  const url = new URL('https://graph.threads.net/keyword_search');
  url.searchParams.set('q', normalized);
  url.searchParams.set('search_type', 'RECENT');
  url.searchParams.set('limit', '50');
  url.searchParams.set('fields', 'id,text,username,permalink,timestamp');
  let response, body;
  try {
    response = await fetchImpl(url, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(12000) });
    body = await response.json();
  } catch { throw new ThreadsError('unavailable'); }
  if (!response.ok || body?.error) {
    const code = body?.error?.code;
    if (response.status === 429 || [4, 17, 32, 613].includes(code)) throw new ThreadsError('rate_limited', 429);
    if ([190, 102].includes(code) || response.status === 401) throw new ThreadsError('authentication', 503);
    if ([10, 200].includes(code) || response.status === 403) throw new ThreadsError('permission', 503);
    throw new ThreadsError('unavailable');
  }
  if (!Array.isArray(body?.data)) throw new ThreadsError('invalid_response');
  // Never forward Meta paging URLs: they may contain access tokens.
  return { posts: body.data.slice(0, 50), fetchedAt: new Date().toISOString() };
}
