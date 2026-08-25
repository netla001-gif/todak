import assert from "node:assert/strict";
import test from "node:test";
import { distanceKm, rankPlaces } from "../lib/recommendation.mjs";

test("ranks an age-fit nearby place first and uses selected origin", () => {
  const places = [
    { id:"near-fit", minMonth:6, maxMonth:24, convenience:1, drive:{강동구청:20,고덕동:5} },
    { id:"far-fit", minMonth:6, maxMonth:24, convenience:1, drive:{강동구청:10,고덕동:25} },
    { id:"near-wrong-age", minMonth:36, maxMonth:48, convenience:1, drive:{강동구청:1,고덕동:1} },
  ];
  const ranked = rankPlaces(places, 18, "고덕동");
  assert.equal(ranked[0].id, "near-fit");
  assert.equal(ranked[0].driveMinutes, 5);
  assert.equal(ranked[0].reason, "고덕동에서 가까워 짧게 다녀오기 좋아요");
  assert.ok(ranked[0].score > ranked[2].score);
});

test("uses current coordinates to rank nearby places without a route API", () => {
  const places = [
    { id:"near", minMonth:6, maxMonth:24, convenience:1, drive:{강동구청:30}, location:{lat:37.51,lng:127.12} },
    { id:"far", minMonth:6, maxMonth:24, convenience:1, drive:{강동구청:5}, location:{lat:37.61,lng:127.12} },
  ];
  const current = { lat:37.50, lng:127.12 };
  const ranked = rankPlaces(places, 18, "강동구청", current);
  assert.equal(ranked[0].id, "near");
  assert.ok(Math.abs(distanceKm(current, places[0].location) - 1.11) < .02);
  assert.ok(ranked[0].distanceKm < ranked[1].distanceKm);
});

test("moves a preferred place above an otherwise equal place", () => {
  const places = [
    { id:"plain", minMonth:6, maxMonth:24, convenience:1, drive:{강동구청:10} },
    { id:"saved", minMonth:6, maxMonth:24, convenience:1, drive:{강동구청:10} },
  ];
  assert.equal(rankPlaces(places, 18, "강동구청", null, ["saved"])[0].id, "saved");
});

test("shows only the best matching iMom Gangdong branch", () => {
  const places = [
    { id:"imom-far", minMonth:6, maxMonth:24, convenience:1, drive:{강동구청:20} },
    { id:"imom-near", minMonth:6, maxMonth:24, convenience:1, drive:{강동구청:5} },
    { id:"park", minMonth:6, maxMonth:24, convenience:1, drive:{강동구청:10} },
  ];
  const ranked = rankPlaces(places, 18, "강동구청");
  assert.equal(ranked.filter((place) => place.id.startsWith("imom-")).length, 1);
  assert.equal(ranked.find((place) => place.id.startsWith("imom-"))?.id, "imom-near");
});
