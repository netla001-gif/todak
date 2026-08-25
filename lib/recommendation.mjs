/**
 * @template {{ minMonth:number, maxMonth:number, convenience:number, drive:Record<string,number> }} T
 * @param {T[]} places
 * @param {number} month
 * @param {string} origin
 * @returns {(T & {driveMinutes:number,score:number})[]}
 */
export function rankPlaces(places, month, origin) {
  return places.map((place) => {
    const driveMinutes = place.drive[origin] ?? place.drive["강동구청"];
    const monthGap = month < place.minMonth ? place.minMonth - month : month > place.maxMonth ? month - place.maxMonth : 0;
    const ageScore = Math.max(0, 100 - monthGap * 8);
    const distanceScore = Math.max(0, 100 - driveMinutes * 2.5);
    const score = Math.round(ageScore * .45 + distanceScore * .35 + place.convenience * 15 + 5);
    return { ...place, driveMinutes, score };
  }).sort((a,b) => b.score - a.score || a.driveMinutes - b.driveMinutes);
}
