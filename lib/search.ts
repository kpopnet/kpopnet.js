import type { Idol, Group, Profiles, GroupMember } from "kpopnet.json";
import { getAge } from "./utils";

export type IdolMap = Map<string, Idol>;
export type GroupMap = Map<string, Group>;
export type IdolGroupsMap = Map<string, Group[]>;
export type GroupIdolsMap = Map<string, Idol[]>;
export type IdolGroupMemberMap = Map<string, GroupMember>;
export type IdolNamesMap = Map<string, string>;
export type IdolGroupNamesMap = Map<string, string>;
export interface Cache {
  idolMap: IdolMap;
  groupMap: GroupMap;
  idolGroupsMap: IdolGroupsMap;
  groupIdolsMap: GroupIdolsMap;
  idolGroupMemberMap: IdolGroupMemberMap;
  // concatenated normalized names for faster search
  idolNamesMap: IdolNamesMap;
  idolGroupNamesMap: IdolGroupNamesMap;
}

export type Item = Idol | Group;

/** [field, 1=asc/-1=desc] */
export type SortProp = [string, number];

type SearchProp = [string, string];
interface Query {
  words: string[];
  props: SearchProp[];
}

type FilterFn<T> = (query: Query, item: T, cache: Cache) => boolean;

// TODO(Kagami): alt names
function getNormIdolNames(idol: Idol): string {
  return [
    normalizeAll(idol.name),
    normalizeAll(idol.real_name_original),
    normalizeAll(idol.real_name),
    normalizeAll(idol.name_original),
  ].join(" ");
}

// NOTE(Kagami): joined by space because [word1 word2] in query would be
// concatenated into "word1word2" and this shouldn't match "group1group2".
function getNormIdolGroupNames(
  idol: Idol,
  idolGroupsMap: IdolGroupsMap
): string {
  const names: string[] = [];
  idolGroupsMap.get(idol.id)!.forEach((g) => {
    names.push(normalizeAll(g.name));
    names.push(normalizeAll(g.name_original));
  });
  return names.join(" ");
}

// XXX(Kagami): a bit hacky but no tuple keys in Map.
function idolGroupMemberKey(idol: Idol, group: Group): string {
  return idol.id + group.id;
}

// NOTE: Will raise exception if references are invalid! If this function
// completed successfully it's guaranteed that all references are valid so it's
// safe to use `map.get(id)!` later.
// TODO(Kagami): 3ms right now. Should we be worried?
export function makeCache(profiles: Profiles): Cache {
  if (import.meta.env.DEV) console.time("makeCache");

  const idolMap: IdolMap = new Map();
  profiles.idols.forEach((idol) => {
    // TODO: Freeze for safety?
    // Object.freeze(idol);
    idolMap.set(idol.id, idol);
  });

  const groupMap: GroupMap = new Map();
  profiles.groups.forEach((group) => {
    // Object.freeze(group);
    groupMap.set(group.id, group);
  });

  const idolGroupsMap: IdolGroupsMap = new Map();
  profiles.idols.forEach((idol) => {
    const idolGroups: Group[] = [];
    idol.groups.forEach((id) => {
      if (!groupMap.has(id)) throw new Error(`Invalid group ID: ${id}`);
      idolGroups.push(groupMap.get(id)!);
    });
    idolGroupsMap.set(idol.id, idolGroups);
  });

  const groupIdolsMap: GroupIdolsMap = new Map();
  const idolGroupMemberMap: IdolGroupMemberMap = new Map();
  profiles.groups.forEach((group) => {
    const groupIdols: Idol[] = [];
    group.members.forEach((member) => {
      const idol = idolMap.get(member.id);
      if (!idol) throw new Error(`Invalid member ID: ${member.id}`);
      groupIdols.push(idol);
      idolGroupMemberMap.set(idolGroupMemberKey(idol, group), member);
    });
    groupIdolsMap.set(group.id, groupIdols);
  });

  const idolNamesMap: IdolNamesMap = new Map();
  const idolGroupNamesMap: IdolGroupNamesMap = new Map();
  profiles.idols.forEach((idol) => {
    idolNamesMap.set(idol.id, getNormIdolNames(idol));
    idolGroupNamesMap.set(idol.id, getNormIdolGroupNames(idol, idolGroupsMap));
  });

  if (import.meta.env.DEV) console.timeEnd("makeCache");

  return {
    idolMap,
    groupMap,
    idolGroupsMap,
    groupIdolsMap,
    idolGroupMemberMap,
    idolNamesMap,
    idolGroupNamesMap,
  };
}

// Get idol's group member info.
export function getIdolGroupMember(
  idol: Idol,
  group: Group,
  cache: Cache
): GroupMember | undefined {
  return cache.idolGroupMemberMap.get(idolGroupMemberKey(idol, group));
}

// Because localeCompare is slow.
function strcmp(s1: string, s2: string): number {
  return s1 == s2 ? 0 : s1 > s2 ? 1 : -1;
}

// Main group goes first (if any).
// Otherwise sort by group's debut date.
// If unknown then by group's name.
export function getSortedIdolGroups(idol: Idol, cache: Cache): Group[] {
  const groups = Array.from(cache.idolGroupsMap.get(idol.id)!);
  groups.sort((g1, g2) => {
    const memberOfG1 = +getIdolGroupMember(idol, g1, cache)!.current;
    const memberOfG2 = +getIdolGroupMember(idol, g2, cache)!.current;
    let cmp = memberOfG2 - memberOfG1;
    if (!cmp) cmp = strcmp(g2.debut_date || "0", g1.debut_date || "0");
    if (!cmp) cmp = strcmp(g2.name, g1.name);
    return cmp;
  });
  return groups;
}

// Remove symbols which doesn't make sense for fuzzy search.
function normalizeAll(s: string): string {
  return s.replace(/[^\p{L}\d]/gu, "").toLowerCase();
}

// Normalize separate words of the query.
function normalizeWords(s: string): string[] {
  if (!s) return [];
  s = s.replace(/[^\p{L}\d\s]/gu, "").toLowerCase();
  return s.split(/\s+/);
}

function pushProp(props: SearchProp[], key: string, val: string) {
  // heavily normalize only name prop queries
  if (key === "n" || key === "g" || key === "c") {
    val = normalizeAll(val);
  }
  props.push([key, val]);
}

// Split query into main component and property-tagged parts.
// Example: "name words prop1:prop words prop2:more words"
// TODO(Kagami): Profile/optimize.
function parseQuery(query: string): Query {
  let name = "";
  const props: SearchProp[] = [];
  let lastKey = "";
  while (true) {
    // Search for prop1[:]
    const colonIdx = query.indexOf(":");
    if (colonIdx >= 1) {
      // Search for [ ]prop1:
      const spaceIdx = query.lastIndexOf(" ", colonIdx);
      if (spaceIdx >= 0) {
        // [name words] prop1:
        const lastVal = query.slice(0, spaceIdx).trim();
        if (lastKey) {
          pushProp(props, lastKey, lastVal);
        } else {
          name = lastVal;
        }
        // [prop1]:...
        lastKey = query.slice(spaceIdx + 1, colonIdx);
        // prop1:[name words...]
        query = query.slice(colonIdx + 1);
      } else {
        // prop1:word:prop2
        if (lastKey) break;
        // Allow to start with []prop1:word
        lastKey = query.slice(0, colonIdx);
        // prop1:[name words...]
        query = query.slice(colonIdx + 1);
      }
    } else {
      const lastVal = query.trim();
      if (lastKey) {
        // prop1:[more words]
        pushProp(props, lastKey, lastVal);
      } else {
        // [just query]
        name = lastVal;
      }
      break;
    }
  }
  const words = normalizeWords(name);
  return { words, props };
}

// Match all possible idol names.
function matchIdolName(idol: Idol, cache: Cache, val: string): boolean {
  return cache.idolNamesMap.get(idol.id)!.includes(val);
}

// Match all possible group names.
function matchIdolGroupName(idol: Idol, cache: Cache, val: string): boolean {
  return cache.idolGroupNamesMap.get(idol.id)!.includes(val);
}

// Match group name.
// TODO(Kagami): cache normalized? but there're not so many groups so not bottleneck
function matchGroupName(group: Group, val: string): boolean {
  return normalizeAll(group.name).includes(val);
}

// Match queries like [group name words] [idol name words]
function matchIdolOrGroupName(
  idol: Idol,
  cache: Cache,
  words: string[]
): boolean {
  for (let i = 1; i <= words.length; i++) {
    const chunk1 = words.slice(0, i).join("");
    const chunk2 = words.slice(i).join("");

    if (
      matchIdolName(idol, cache, chunk1) &&
      (chunk2 ? matchIdolGroupName(idol, cache, chunk2) : true)
    )
      return true;

    if (
      matchIdolGroupName(idol, cache, chunk1) &&
      (chunk2 ? matchIdolName(idol, cache, chunk2) : true)
    )
      return true;
  }

  return false;
}

// Match all idols in groups with given company name.
// Company names aren't cached in map because this search isn't important.
// TODO(Kagami): idol should have agency_name field too?
function matchIdolCompanyName(idol: Idol, cache: Cache, val: string): boolean {
  const groups = cache.idolGroupsMap.get(idol.id)!;
  return groups.some((group) => {
    return normalizeAll(group.agency_name).includes(val);
  });
}

function matchCompanyName(group: Group, val: string): boolean {
  return normalizeAll(group.agency_name).includes(val);
}

function matchDate(idate: string | null, qdate: string): boolean {
  if (!idate) return false;
  return idate.startsWith(qdate);
}

function matchYAgo(idate: string | null, qago: string): boolean {
  if (!idate) return false;
  const ago = getAge(idate);
  return ago.toString() === qago;
}

function matchNum(inum: number | null, qnum: string): boolean {
  if (!inum) return false;
  return Math.floor(inum).toString() === qnum;
}

function filterIdol(q: Query, idol: Idol, cache: Cache): boolean {
  // Fuzzy name matching.
  if (q.words.length && !matchIdolOrGroupName(idol, cache, q.words))
    return false;

  // Match for exact properties if user requested.
  return q.props.every(([key, val]) => {
    switch (key) {
      case "n":
        if (matchIdolName(idol, cache, val)) return true;
        break;
      case "g":
        if (matchIdolGroupName(idol, cache, val)) return true;
        break;
      case "c":
        if (matchIdolCompanyName(idol, cache, val)) return true;
        break;
      case "d":
        if (matchDate(idol.birth_date, val)) return true;
        break;
      case "a":
        if (matchYAgo(idol.birth_date, val)) return true;
        break;
      case "dd":
        if (matchDate(idol.debut_date, val)) return true;
        break;
      case "da":
        if (matchYAgo(idol.debut_date, val)) return true;
        break;
      case "h":
        if (matchNum(idol.height, val)) return true;
        break;
      case "w":
        if (matchNum(idol.weight, val)) return true;
        break;
    }
    return false;
  });
}

function filterGroup(q: Query, group: Group, cache: Cache): boolean {
  // Fuzzy name matching.
  if (q.words.length && !matchGroupName(group, q.words.join(""))) return false;

  // Match for exact properties if user requested.
  return q.props.every(([key, val]) => {
    switch (key) {
      case "g":
        if (matchGroupName(group, val)) return true;
        break;
      case "c":
        if (matchCompanyName(group, val)) return true;
        break;
      case "dd":
        if (matchDate(group.debut_date, val)) return true;
        break;
      case "da":
        if (matchYAgo(group.debut_date, val)) return true;
        break;
      case "dbd":
        if (matchDate(group.disband_date, val)) return true;
        break;
      case "dba":
        if (matchYAgo(group.disband_date, val)) return true;
        break;
      case "m":
        if (matchNum(group.members.length, val)) return true;
        break;
    }
    return false;
  });
}

function filterOrCopy<T>(
  arr: T[],
  fn: FilterFn<T>,
  q: Query,
  cache: Cache
): T[] {
  // should be a bit faster for cold run
  if (!q.words.length && !q.props.length) return arr.slice();
  return arr.filter((item) => fn(q, item, cache));
}

const defaultIdolSorts: SortProp[] = [["birth_date", -1]];
const defaultGroupSorts: SortProp[] = [["debut_date", -1]];

function sameSorts(arr1: SortProp[], arr2: SortProp[]): boolean {
  if (arr1.length === 0 || arr2.length === 0) return true; // disabled all sorts -> as default
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i][0] !== arr2[i][0] || arr1[i][1] !== arr2[i][1]) return false;
  }
  return true;
}

function makeCompareFn(sorts: SortProp[]) {
  const A_TOTOP = -1;
  const A_TOBOTTOM = 1;
  const B_TOBOTTOM = -1;
  return (ia: Item, ib: Item) => {
    for (const [field, dir] of sorts) {
      const a = (ia as any)[field];
      const b = (ib as any)[field];
      if (a === b) continue;
      // move unknown values to bottom
      if (a === null) return A_TOBOTTOM;
      if (b === null) return B_TOBOTTOM;
      // XXX(Kagami): array of members comparison work because
      // [{}].toString() -> "[object Object]"
      // [{},{}].toString() -> "[object Object],[object Object]"
      // It's better to compare by `.length` property but extra properly lookup might be slower?
      const cmp = a > b ? A_TOBOTTOM : A_TOTOP;
      return cmp * dir;
    }
    return 0;
  };
}

// don't sort if not necessary because might be slow
function sortIfNeeded(
  items: Item[],
  sorts: SortProp[],
  defaultSorts: SortProp[]
) {
  if (sameSorts(sorts, defaultSorts)) return;
  if (import.meta.env.DEV) console.log("!!! need to sort");
  items.sort(makeCompareFn(sorts));
}

/**
 * Find idols matching given query.
 */
// TODO(Kagami): Profile/optimize.
export function searchIdols(
  query: string,
  sorts: SortProp[],
  profiles: Profiles,
  cache: Cache
): Idol[] {
  /*dev*/ const dev = import.meta.env.DEV;
  /*dev*/ const tStart = dev ? performance.now() : 0;
  const q = parseQuery(query);
  /*dev*/ const tQuery = dev ? performance.now() : 0;
  const result = filterOrCopy(profiles.idols, filterIdol, q, cache);
  /*dev*/ const tFilter = dev ? performance.now() : 0;
  sortIfNeeded(result, sorts, defaultIdolSorts);
  /*dev*/ const tSort = dev ? performance.now() : 0;
  /*dev*/ const tEnd = dev ? tSort : 0;

  if (dev) {
    const f = (t2: number, t1: number) => (t2 - t1).toFixed(3);
    console.log(
      `total:${f(tEnd, tStart)}`,
      `query:${f(tQuery, tStart)}`,
      `filter:${f(tFilter, tQuery)}`,
      `sort:${f(tSort, tFilter)}`,
      `q:${query}`
    );
  }
  return result;
}

/**
 * Find groups matching given query.
 */
// TODO(Kagami): Profile/optimize.
export function searchGroups(
  query: string,
  sorts: SortProp[],
  profiles: Profiles,
  cache: Cache
): Group[] {
  /*dev*/ const dev = import.meta.env.DEV;
  /*dev*/ const tStart = dev ? performance.now() : 0;
  const q = parseQuery(query);
  /*dev*/ const tQuery = dev ? performance.now() : 0;
  const result = filterOrCopy(profiles.groups, filterGroup, q, cache);
  /*dev*/ const tFilter = dev ? performance.now() : 0;
  sortIfNeeded(result, sorts, defaultGroupSorts);
  /*dev*/ const tSort = dev ? performance.now() : 0;
  /*dev*/ const tEnd = dev ? tSort : 0;

  if (dev) {
    const f = (t2: number, t1: number) => (t2 - t1).toFixed(3);
    console.log(
      `total:${f(tEnd, tStart)}`,
      `query:${f(tQuery, tStart)}`,
      `filter:${f(tFilter, tQuery)}`,
      `sort:${f(tSort, tFilter)}`,
      `q:${query}`
    );
  }
  return result;
}
