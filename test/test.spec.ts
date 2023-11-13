import test from "node:test";
import { deepStrictEqual } from "node:assert";

import { reorderArray } from "../lib/utils";
import { exportedForTesting } from "../lib/search";

test("reorderArray", () => {
  const arr = [1, 2, 3, 4];
  deepStrictEqual(reorderArray(arr, 0, 1), [2, 1, 3, 4]);
  deepStrictEqual(reorderArray(arr, 1, 0), [2, 1, 3, 4]);
  deepStrictEqual(reorderArray(arr, 0, 2), [2, 3, 1, 4]);
  deepStrictEqual(reorderArray(arr, 2, 0), [3, 1, 2, 4]);
  deepStrictEqual(reorderArray(arr, 1, 2), [1, 3, 2, 4]);
  deepStrictEqual(reorderArray(arr, 2, 1), [1, 3, 2, 4]);
  deepStrictEqual(reorderArray(arr, 1, 3), [1, 3, 4, 2]);
  deepStrictEqual(reorderArray(arr, 3, 1), [1, 4, 2, 3]);
  deepStrictEqual(reorderArray(arr, 2, 3), [1, 2, 4, 3]);
  deepStrictEqual(reorderArray(arr, 3, 2), [1, 2, 4, 3]);
});

test("normalizeCommaWords", () => {
  const norm = exportedForTesting.normalizeCommaWords;
  deepStrictEqual(norm("Hyeseong, 혜성, Yang Hyeseon, 양혜선, 梁寭善"), [
    "hyeseong",
    "혜성",
    "yanghyeseon",
    "양혜선",
    "梁寭善",
  ]);
});
