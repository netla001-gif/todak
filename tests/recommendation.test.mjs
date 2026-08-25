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

test("hides a place the family disliked after visiting", () => {
  const places = [
    { id:"loved", minMonth:6, maxMonth:24, convenience:1, drive:{강동구청:10} },
    { id:"disliked", minMonth:6, maxMonth:24, convenience:1, drive:{강동구청:10} },
  ];
  const ranked = rankPlaces(places, 18, "강동구청", null, [], { disliked:"disliked" });
  assert.deepEqual(ranked.map((place) => place.id), ["loved"]);
});

test("pushes an already-visited liked place below a fresh equally-fit place", () => {
  const places = [
    { id:"visited", minMonth:6, maxMonth:24, convenience:1, drive:{강동구청:10} },
    { id:"fresh", minMonth:6, maxMonth:24, convenience:1, drive:{강동구청:10} },
  ];
  const ranked = rankPlaces(places, 18, "강동구청", null, [], { visited:"liked" });
  assert.equal(ranked[0].id, "fresh");
  assert.equal(ranked[1].id, "visited");
  assert.equal(ranked[1].visited, "liked");
  assert.match(ranked[1].reason, /다녀온 곳/);
});

test("nudges fresh, unvisited places toward the category the family liked visiting", () => {
  const places = [
    { id:"past-outdoor-1", category:"outdoor", minMonth:6, maxMonth:24, convenience:1, drive:{강동구청:10} },
    { id:"past-outdoor-2", category:"outdoor", minMonth:6, maxMonth:24, convenience:1, drive:{강동구청:10} },
    { id:"fresh-outdoor", category:"outdoor", minMonth:6, maxMonth:24, convenience:1, drive:{강동구청:10} },
    { id:"fresh-indoor", category:"indoor", minMonth:6, maxMonth:24, convenience:1, drive:{강동구청:10} },
  ];
  const feedback = { "past-outdoor-1":"liked", "past-outdoor-2":"liked" };
  const ranked = rankPlaces(places, 18, "강동구청", null, [], feedback);
  const freshOutdoorRank = ranked.findIndex((place) => place.id === "fresh-outdoor");
  const freshIndoorRank = ranked.findIndex((place) => place.id === "fresh-indoor");
  assert.ok(freshOutdoorRank < freshIndoorRank);
});
