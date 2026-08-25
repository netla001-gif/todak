import { durationsFromRoutes } from "@/lib/drive-times.mjs";

const originQueries: Record<string, string> = {
  강동구청:"서울 강동구 강동구청", 천호동:"서울 강동구 천호동", 암사동:"서울 강동구 암사동", 고덕동:"서울 강동구 고덕동", 상일동:"서울 강동구 상일동"
};

async function point(query: string, key: string) {
  const response = await fetch("https://dapi.kakao.com/v2/local/search/keyword.json?size=1&query=" + encodeURIComponent(query), { headers:{ Authorization:"KakaoAK " + key } });
  if (!response.ok) throw new Error("장소 검색 실패");
  const document = (await response.json()).documents?.[0];
  if (!document) throw new Error("장소 좌표 없음");
  return { x:document.x, y:document.y };
}

export async function POST(request: Request) {
  const key = process.env.KAKAO_REST_API_KEY;
  if (!key) return Response.json({ times:{}, live:false }, { status:503 });

  const body = await request.json();
  const places = Array.isArray(body.places) ? body.places.slice(0, 30) : [];
  if (!originQueries[body.origin] || !places.length || places.some((place: unknown) => !place || typeof (place as { id?:unknown }).id !== "string" || typeof (place as { query?:unknown }).query !== "string")) {
    return Response.json({ error:"잘못된 요청" }, { status:400 });
  }

  try {
    // ponytail: 좌표를 요청마다 찾는다. 사용량이 늘면 장소 좌표를 데이터에 저장한다.
    const [origin, ...destinations] = await Promise.all([point(originQueries[body.origin], key), ...places.map((place: { query:string }) => point(place.query.slice(0, 80), key))]);
    const response = await fetch("https://apis-navi.kakaomobility.com/v1/destinations/directions", {
      method:"POST",
      headers:{ Authorization:"KakaoAK " + key, "Content-Type":"application/json" },
      body:JSON.stringify({ origin, destinations:destinations.map((destination, index) => ({ ...destination, key:places[index].id })), radius:10000, priority:"TIME" })
    });
    if (!response.ok) throw new Error("길찾기 실패");
    const times = durationsFromRoutes((await response.json()).routes);
    return Response.json({ times, live:Object.keys(times).length > 0 });
  } catch {
    return Response.json({ times:{}, live:false }, { status:502 });
  }
}
