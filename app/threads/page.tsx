"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Post = { id: string; username: string; text: string; permalink: string; timestamp: string | null; reasons: string[]; promotion: boolean };
type Result = { query: string; posts: Post[]; fetchedAt: string; message: string | null };

export default function ThreadsPage() {
  const [query, setQuery] = useState("하남");
  const [sort, setSort] = useState("relevant");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => pending.current?.abort(), []);

  async function search(event: FormEvent) {
    event.preventDefault();
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    setLoading(true); setError(""); setResult(null);
    try {
      const response = await fetch(`/api/threads?${new URLSearchParams({ q: query.trim(), sort })}`, { signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "검색하지 못했습니다. 다시 시도해 주세요.");
      if (!controller.signal.aborted) setResult(data);
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : "검색하지 못했습니다.");
    } finally { if (!controller.signal.aborted) setLoading(false); }
  }

  return <main className="policy-page threads-page">
    <a className="policy-home" href="/">← 토닥 홈</a>
    <h1>Threads에서 나들이 찾기</h1>
    <p>지역이나 장소를 검색해 실제 공개 글을 살펴보세요. 아이 나들이와 이용 정보를 언급한 글을 먼저 보여드립니다.</p>
    <form className="threads-search" onSubmit={search}>
      <label htmlFor="threads-query">지역·장소·검색어</label>
      <input id="threads-query" value={query} onChange={event => setQuery(event.target.value)} minLength={2} maxLength={60} required placeholder="예: 하남, 강동, 어린이대공원" />
      <label htmlFor="threads-sort">정렬 기준</label>
      <select id="threads-sort" value={sort} onChange={event => setSort(event.target.value)}><option value="relevant">나들이 관련성순</option><option value="recent">최신순</option></select>
      <button className="primary" disabled={loading} type="submit">{loading ? "검색 중…" : "Threads 검색"}</button>
    </form>
    <p className="threads-explainer">검색어 일치도, 아이 나들이·이용 정보 언급, 작성 시점을 함께 봅니다. 광고·협찬 문구가 있는 글은 관련성순에서 낮추며, 중복 글은 제외합니다. 장소의 안전성이나 실제 방문 여부를 보증하는 순위는 아닙니다.</p>
    <div aria-live="polite" aria-busy={loading}>
      {loading && <p role="status">Threads 공개 글을 확인하고 있습니다.</p>}
      {error && <p role="alert" className="threads-notice">{error}</p>}
      {result && <><h2>‘{result.query}’ 검색 결과 {result.posts.length}건</h2><p className="policy-date">검색 시각: {new Date(result.fetchedAt).toLocaleString("ko-KR")}</p>
        {result.message && <p className="threads-notice">{result.message}</p>}
        {result.posts.map(post => <article className="thread-card" key={post.id}>
          <header><strong>@{post.username}</strong>{post.timestamp && <time dateTime={post.timestamp}>{new Date(post.timestamp).toLocaleDateString("ko-KR")}</time>}</header>
          <div className="thread-reasons">{post.reasons.map(reason => <span key={reason}>{reason}</span>)}{post.promotion && <span>광고·협찬 문구 포함</span>}</div>
          <p className="thread-text">{post.text}</p>
          <a href={post.permalink} target="_blank" rel="noreferrer">Threads 원문과 댓글 보기 ↗</a>
        </article>)}</>}
    </div>
    <p className="threads-explainer">검색어는 Threads에 전달됩니다. 결과는 이 화면에서만 사용하며 토닥 데이터베이스에 저장하지 않습니다. 운영시간·예약·요금은 방문 전 공식 안내에서 확인해 주세요.</p>
  </main>;
}
