import assert from "node:assert/strict";
import test from "node:test";
import { rankPlaces } from "../lib/recommendation.mjs";

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
