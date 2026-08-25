import { durationsFromRoutes } from "@/lib/drive-times.mjs";

const originQueries: Record<string, string> = {
  강동구청:"서울 강동구 강동구청", 천호동:"서울 강동구 천호동", 암사동:"서울 강동구 암사동", 고덕동:"서울 강동구 고덕동", 상일동:"서울 강동구 상일동"
};

type Point = { x:number; y:number };

function isPoint(value: unknown): value is Point {
  const item = value as Partial<Point> | null;
  return !!item && Number.isFinite(item.x) && Number.isFinite(item.y) && Math.abs(item.x!) <= 180 && Math.abs(item.y!) <= 90;
}

async function point(query: string, key: string) {
  const response = await fetch("https://dapi.kakao.com/v2/local/search/keyword.json?size=1&query=" + encodeURIComponent(query), { headers:{ Authorization:"KakaoAK " + key } });
  if (!response.ok) console.error("Kakao Local status", response.status);
  if (!response.ok) throw new Error("장소 검색 실패");
  const document = (await response.json()).documents?.[0];
  if (!document) throw new Error("장소 좌표 없음");
  return { x:document.x, y:document.y };
}

export async function POST(request: Request) {
  try {
    const key = process.env.KAKAO_REST_API_KEY;
    if (!key) return Response.json({ times:{}, live:false }, { status:503 });

    const body = await request.json();
    const places = Array.isArray(body.places) ? body.places.slice(0, 30) : [];
    const validOrigin = isPoint(body.origin) || (typeof body.origin === "string" && !!originQueries[body.origin]);
    const validPlaces = places.length && places.every((place: unknown) => {
      const item = place as { id?:unknown; query?:unknown };
      return item && typeof item.id === "string" && item.id.length <= 100 && (isPoint(item) || typeof item.query === "string");
    });
    if (!validOrigin || !validPlaces) return Response.json({ error:"잘못된 요청" }, { status:400 });

    const origin = isPoint(body.origin) ? body.origin : await point(originQueries[body.origin], key);
    const points = await Promise.allSettled(places.map((place: { query?:string; x?:number; y?:number }) => isPoint(place) ? place : point(place.query!.slice(0, 80), key)));
    const destinations = points.flatMap((result, index) => result.status === "fulfilled" ? [{ ...result.value, key:places[index].id }] : []);
    if (!destinations.length) return Response.json({ times:{}, live:false }, { status:422 });

    const response = await fetch("https://apis-navi.kakaomobility.com/v1/destinations/directions", {
      method:"POST",
      headers:{ Authorization:"KakaoAK " + key, "Content-Type":"application/json" },
      body:JSON.stringify({ origin, destinations, radius:10000, priority:"TIME" })
    });
    if (!response.ok) console.error("Kakao Mobility status", response.status);
    if (!response.ok) throw new Error("길찾기 실패");
    const times = durationsFromRoutes((await response.json()).routes);
    return Response.json({ times, live:Object.keys(times).length > 0 });
  } catch (error) {
    console.error("drive-times failed", error instanceof Error ? error.message : String(error));
    return Response.json({ times:{}, live:false }, { status:502 });
  }
}
