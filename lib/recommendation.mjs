/**
 * @template {{ minMonth:number, maxMonth:number, convenience:number, drive:Record<string,number>, category?:string, facts?:string[], location?:{lat:number,lng:number} }} T
 * @param {T[]} places
 * @param {number} month
 * @param {string} origin
 * @param {{lat:number,lng:number}|null} [currentLocation]
 * @param {string[]} [preferredIds]
 * @returns {(T & {driveMinutes:number,distanceKm:number|null,score:number,reason:string})[]}
 */
export function rankPlaces(places, month, origin, currentLocation = null, preferredIds = []) {
  const chains = new Set();
  return places.map((place) => {
    const driveMinutes = place.drive[origin] ?? place.drive["강동구청"];
    const straightKm = currentLocation && place.location ? distanceKm(currentLocation, place.location) : null;
    const monthGap = month < place.minMonth ? place.minMonth - month : month > place.maxMonth ? month - place.maxMonth : 0;
    const ageScore = Math.max(0, 100 - monthGap * 8);
    const distanceScore = straightKm === null ? Math.max(0, 100 - driveMinutes * 2.5) : Math.max(0, 100 - straightKm * 6.5);
    const score = Math.round(ageScore * .45 + distanceScore * .35 + place.convenience * 15 + 5);
    const preferenceScore = preferredIds.includes(place.id) ? 8 : 0;
    const reason = straightKm !== null && straightKm <= 3 ? "현재 위치에서 가까워 짧게 다녀오기 좋아요"
      : driveMinutes <= 10 ? `${origin}에서 가까워 짧게 다녀오기 좋아요`
      : month < 12 && place.facts?.includes("유모차") ? "유모차로 천천히 둘러보기 편해요"
      : place.category === "indoor" ? `${month}개월 아기가 날씨 걱정 없이 놀기 좋아요`
      : place.facts?.some((fact) => fact === "놀이터" || fact === "잔디광장") ? `${month}개월 아기가 몸을 움직이며 놀기 좋아요`
      : `${month}개월 아기와 천천히 둘러보기 좋아요`;
    return { ...place, driveMinutes, distanceKm:straightKm, score, preferenceScore, reason };
  }).sort((a,b) => (b.score + b.preferenceScore) - (a.score + a.preferenceScore) || (a.distanceKm ?? a.driveMinutes) - (b.distanceKm ?? b.driveMinutes)).filter((place) => {
    const chain = place.id.startsWith("imom-") ? "imom" : place.id;
    if (chains.has(chain)) return false;
    chains.add(chain);
    return true;
  });
}

export function distanceKm(a, b) {
  const toRadians = (value) => value * Math.PI / 180;
  const latitude = toRadians(b.lat - a.lat);
  const longitude = toRadians(b.lng - a.lng);
  const value = Math.sin(latitude / 2) ** 2 + Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(longitude / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(value));
}
