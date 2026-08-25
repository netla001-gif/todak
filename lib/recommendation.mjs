/**
 * @template {{ minMonth:number, maxMonth:number, convenience:number, drive:Record<string,number>, category?:string, facts?:string[] }} T
 * @param {T[]} places
 * @param {number} month
 * @param {string} origin
 * @returns {(T & {driveMinutes:number,score:number,reason:string})[]}
 */
export function rankPlaces(places, month, origin) {
  return places.map((place) => {
    const driveMinutes = place.drive[origin] ?? place.drive["강동구청"];
    const monthGap = month < place.minMonth ? place.minMonth - month : month > place.maxMonth ? month - place.maxMonth : 0;
    const ageScore = Math.max(0, 100 - monthGap * 8);
    const distanceScore = Math.max(0, 100 - driveMinutes * 2.5);
    const score = Math.round(ageScore * .45 + distanceScore * .35 + place.convenience * 15 + 5);
    const reason = driveMinutes <= 10 ? `${origin}에서 가까워 짧게 다녀오기 좋아요`
      : month < 12 && place.facts?.includes("유모차") ? "유모차로 천천히 둘러보기 편해요"
      : place.category === "indoor" ? `${month}개월 아기가 날씨 걱정 없이 놀기 좋아요`
      : place.facts?.some((fact) => fact === "놀이터" || fact === "잔디광장") ? `${month}개월 아기가 몸을 움직이며 놀기 좋아요`
      : `${month}개월 아기와 천천히 둘러보기 좋아요`;
    return { ...place, driveMinutes, score, reason };
  }).sort((a,b) => b.score - a.score || a.driveMinutes - b.driveMinutes);
}
