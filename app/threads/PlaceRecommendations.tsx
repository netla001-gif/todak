import { recommendThreadPlaces, threadsSnapshot } from '@/lib/threads-places.mjs';

export default function PlaceRecommendations() {
  const recommendations = recommendThreadPlaces();
  return <section className="threads-picks" id="threads-picks" aria-labelledby="threads-picks-title">
    <div className="threads-picks-heading">
      <div><p className="eyebrow">Threads에서 장소까지 확인했어요</p><h2 id="threads-picks-title">이번에 골라본 나들이 {recommendations.length}곳</h2></div>
      <a href="#feed">가까운 기존 추천 보기 ↓</a>
    </div>
    <p>강동·송파·광진·하남 후보를 먼저 보여드려요. 서울 다른 지역의 공원·박물관도 함께 골랐고, 직접 방문한 후기와 추천 목록을 구분했어요.</p>
    <div className="threads-places-grid">
    {recommendations.map(venue => <article className="threads-place" key={venue.id}>
      <div className="threads-place-intro">
        <span className="threads-place-region">{venue.region} · {venue.kind}</span>
        <h3>{venue.title}</h3>
        <p>{venue.summary}</p>
        <div className="threads-place-links">
          <a href={venue.source} target="_blank" rel="noreferrer">장소명이 나온 Threads 글 ↗</a>
          <a href={`https://map.naver.com/p/search/${encodeURIComponent(venue.title)}`} target="_blank" rel="noreferrer">지도에서 위치 보기 ↗</a>
        </div>
      </div>
      <details className="threads-place-evidence">
        <summary>추천 이유 · {venue.evidenceType}</summary>
        <p>{venue.fit}</p>
        <div className="thread-reasons">{venue.post.reasons.map(reason => <span key={reason}>{reason}</span>)}</div>
        <p className="threads-place-caveat">{venue.caveat}</p>
        <a href={venue.post.permalink} target="_blank" rel="noreferrer">@{venue.post.username} · {venue.post.timestamp ? new Date(venue.post.timestamp).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }) : '게시일 미확인'} 게시 ↗</a>
      </details>
    </article>)}
    </div>
    <details className="threads-picks-method"><summary>추천에서 제외한 글과 선정 기준</summary>
      <p>Threads에서 지역명과 장소명으로 찾은 글의 본문 발췌를 ‘{threadsSnapshot.query}’ 표현 일치·나들이·이용 정보·최신성으로 정렬했어요. 장소와 지역을 확인한 뒤 인접 지역을 우선하고, 그 안에서 글의 관련성 순서로 보여드려요. 정확한 이동시간이나 장소의 품질 순위는 아니에요. 같은 글에 여러 장소가 나오면 각각 표시하되 같은 장소는 한 번만 남겨요.</p>
      <ul><li>화포천습지과학관: 작성자가 경남 김해로 안내해 이번 서울·하남 후보에서 제외했어요. <a href="https://www.threads.com/@luckybaby.zip/post/DbDnC4XD4bp" target="_blank" rel="noreferrer">장소 확인 ↗</a></li>
      <li>주말 나들이 소개·맛집 추천 요청 글: 특정 방문 장소를 확인할 수 없어 제외했어요.</li></ul>
    </details>
    <p className="threads-picks-date">2026. 9. 6. 원문 확인 · 이번에 확인한 내용을 반영한 추천이며 실시간 자동 수집 결과는 아니에요.</p>
  </section>;
}
