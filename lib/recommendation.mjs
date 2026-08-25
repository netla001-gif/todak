const VISITED_DEMOTION = 35;
const CATEGORY_BIAS_MAX = 10;
const CATEGORY_BIAS_MIN_SAMPLES = 2;

/**
 * How much a family's liked/disliked visits should tilt category choice.
 * Needs at least a couple of liked visits with a known category before it
 * says anything, so a single early "좋아요" doesn't overfit the whole feed.
 * @param {{id:string, category?:string}[]} places
 * @param {Record<string,"liked"|"disliked">} feedback
 * @returns {Record<string,number>}
 */
function categoryBias(places, feedback) {
  const counts = { indoor:0, outdoor:0 };
  for (const place of places) {
    if (feedback[place.id] === "liked" && (place.category === "indoor" || place.category === "outdoor")) counts[place.category] += 1;
  }
  const total = counts.indoor + counts.outdoor;
  if (total < CATEGORY_BIAS_MIN_SAMPLES) return { indoor:0, outdoor:0 };
  const indoorShare = counts.indoor / total;
  const bias = Math.round((indoorShare - .5) * 2 * CATEGORY_BIAS_MAX);
  return { indoor:bias, outdoor:-bias };
}

/**
 * @template {{ id:string, minMonth:number, maxMonth:number, convenience:number, drive:Record<string,number>, category?:string, facts?:string[], location?:{lat:number,lng:number} }} T
 * @param {T[]} places
 * @param {number|number[]} months one age in months, or one per child — a place must fit every child, so the worst-fitting child sets the age score
 * @param {string} origin
 * @param {{lat:number,lng:number}|null} [currentLocation]
 * @param {string[]} [preferredIds]
 * @param {Record<string,"liked"|"disliked">} [feedback] family visit feedback, shared across both partners
 * @returns {(T & {driveMinutes:number,distanceKm:number|null,score:number,reason:string,visited:"liked"|"disliked"|null})[]}
 */
export function rankPlaces(places, months, origin, currentLocation = null, preferredIds = [], feedback = {}) {
  const chains = new Set();
  const bias = categoryBias(places, feedback);
  const monthList = Array.isArray(months) ? months : [months];
  const youngestMonth = Math.min(...monthList);
  return places
    .filter((place) => feedback[place.id] !== "disliked")
    .map((place) => {
      const driveMinutes = place.drive[origin] ?? place.drive["강동구청"];
      const straightKm = currentLocation && place.location ? distanceKm(currentLocation, place.location) : null;
      const monthGap = Math.max(...monthList.map((month) => month < place.minMonth ? place.minMonth - month : month > place.maxMonth ? month - place.maxMonth : 0));
      const ageScore = Math.max(0, 100 - monthGap * 8);
      const distanceScore = straightKm === null ? Math.max(0, 100 - driveMinutes * 2.5) : Math.max(0, 100 - straightKm * 6.5);
      const score = Math.round(ageScore * .45 + distanceScore * .35 + place.convenience * 15 + 5);
      const preferenceScore = preferredIds.includes(place.id) ? 8 : 0;
      const categoryBiasScore = place.category ? (bias[place.category] ?? 0) : 0;
      const visited = feedback[place.id] === "liked" ? "liked" : null;
      const feedbackAdjustment = visited === "liked" ? -VISITED_DEMOTION : 0;
      const reason = visited === "liked" ? "이미 다녀온 곳이에요. 새로운 곳을 먼저 보여드려요"
        : categoryBiasScore >= 4 ? `그동안 좋아요 누른 ${place.category === "indoor" ? "실내" : "야외"} 장소와 비슷해요`
        : straightKm !== null && straightKm <= 3 ? "현재 위치에서 가까워 짧게 다녀오기 좋아요"
        : driveMinutes <= 10 ? `${origin}에서 가까워 짧게 다녀오기 좋아요`
        : youngestMonth < 12 && place.facts?.includes("유모차") ? "유모차로 천천히 둘러보기 편해요"
        : place.category === "indoor" ? "날씨 걱정 없이 놀기 좋아요"
        : place.facts?.some((fact) => fact === "놀이터" || fact === "잔디광장") ? "몸을 움직이며 놀기 좋아요"
        : "아이와 천천히 둘러보기 좋아요";
      return { ...place, driveMinutes, distanceKm:straightKm, score, preferenceScore, categoryBiasScore, feedbackAdjustment, visited, reason };
    })
    .sort((a,b) => (b.score + b.preferenceScore + b.categoryBiasScore + b.feedbackAdjustment) - (a.score + a.preferenceScore + a.categoryBiasScore + a.feedbackAdjustment) || (a.distanceKm ?? a.driveMinutes) - (b.distanceKm ?? b.driveMinutes))
    .filter((place) => {
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
