import test from "node:test";
import assert from "node:assert/strict";

import { runWithConcurrencyLimit } from "./embed-limit.js";

test("runWithConcurrencyLimit keeps concurrent tasks under the provided cap", async () => {
  let running = 0;
  let maxRunning = 0;

  const tasks = Array.from({ length: 8 }, (_, index) => index);

  const results = await runWithConcurrencyLimit(
    tasks,
    async (index) => {
      running += 1;
      maxRunning = Math.max(maxRunning, running);

      await new Promise((resolve) => setTimeout(resolve, 20));

      running -= 1;
      return index;
    },
    2,
  );

  assert.deepEqual(results, [0, 1, 2, 3, 4, 5, 6, 7]);
  assert.equal(maxRunning, 2);
});
