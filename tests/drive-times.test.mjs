import test from "node:test";
import assert from "node:assert/strict";
import { durationsFromRoutes } from "../lib/drive-times.mjs";

test("converts successful Kakao route durations to rounded-up minutes", () => {
  assert.deepEqual(durationsFromRoutes([
    { key:"near", result_code:0, summary:{ duration:601 } },
    { key:"failed", result_code:304, summary:{ duration:60 } }
  ]), { near:11 });
});
