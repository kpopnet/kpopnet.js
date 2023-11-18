import test from "node:test";
import { deepEqual } from "node:assert/strict";

import { reorderArray } from "../lib/utils";
import { exportedForTesting as searchTesting } from "../lib/search";
import {
  getDefaultSortsCopy,
  serializeSorts,
  deserializeSorts,
} from "../lib/sort";

const { normalizeCommaWords } = searchTesting;

test("reorderArray", () => {
  const arr = [1, 2, 3, 4];
  deepEqual(reorderArray(arr, 0, 1), [2, 1, 3, 4]);
  deepEqual(reorderArray(arr, 1, 0), [2, 1, 3, 4]);
  deepEqual(reorderArray(arr, 0, 2), [2, 3, 1, 4]);
  deepEqual(reorderArray(arr, 2, 0), [3, 1, 2, 4]);
  deepEqual(reorderArray(arr, 1, 2), [1, 3, 2, 4]);
  deepEqual(reorderArray(arr, 2, 1), [1, 3, 2, 4]);
  deepEqual(reorderArray(arr, 1, 3), [1, 3, 4, 2]);
  deepEqual(reorderArray(arr, 3, 1), [1, 4, 2, 3]);
  deepEqual(reorderArray(arr, 2, 3), [1, 2, 4, 3]);
  deepEqual(reorderArray(arr, 3, 2), [1, 2, 4, 3]);
});

test("normalizeCommaWords", () => {
  const norm = normalizeCommaWords;
  deepEqual(norm("Hyeseong, 혜성, Yang Hyeseon, 양혜선, 梁寭善"), [
    "hyeseong",
    "혜성",
    "yanghyeseon",
    "양혜선",
    "梁寭善",
  ]);
});

test("serializeSorts", () => {
  const istr = (v: any) => serializeSorts("idol", v);
  deepEqual(istr([]), "");
  deepEqual(istr(getDefaultSortsCopy("idol")), "d:1");
  deepEqual(
    istr([
      { id: "height", name: "Height", enabled: true, reversed: false },
      { id: "real_name", name: "Name", enabled: true, reversed: true },
      { id: "weight", name: "Weight", enabled: true, reversed: false },
    ]),
    "h:0 n:1 w:0"
  );

  const gstr = (v: any) => serializeSorts("group", v);
  deepEqual(gstr([]), "");
  deepEqual(gstr(getDefaultSortsCopy("group")), "dd:1");
  deepEqual(
    gstr([
      { id: "name", name: "Name", enabled: true, reversed: false },
      { id: "members", name: "Members＃", enabled: true, reversed: true },
    ]),
    "g:0 m:1"
  );
});

test("deserializeSorts", () => {
  const idestr = (v: any) => deserializeSorts("idol", v);
  deepEqual(idestr(""), getDefaultSortsCopy("idol"));
  deepEqual(idestr("kk+nnn:0"), getDefaultSortsCopy("idol"));
  deepEqual(idestr("n:aaa"), getDefaultSortsCopy("idol"));
  deepEqual(idestr("h:0 n:1 w:0"), [
    { id: "height", name: "Height", enabled: true, reversed: false },
    { id: "real_name", name: "Name", enabled: true, reversed: true },
    { id: "weight", name: "Weight", enabled: true, reversed: false },
    { id: "birth_date", name: "Birth date", enabled: false, reversed: true },
    { id: "debut_date", name: "Debut date", enabled: false, reversed: true },
  ]);

  const gdestr = (v: any) => deserializeSorts("group", v);
  deepEqual(gdestr(""), getDefaultSortsCopy("group"));
  deepEqual(gdestr("g:0 m:1"), [
    { id: "name", name: "Name", enabled: true, reversed: false },
    { id: "members", name: "Members＃", enabled: true, reversed: true },
    { id: "debut_date", name: "Debut date", enabled: false, reversed: true },
    {
      id: "disband_date",
      name: "Disband date",
      enabled: false,
      reversed: true,
    },
  ]);
});
