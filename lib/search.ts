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

type SearchProp = [string, string];
interface Query {
  words: string[];
  props: SearchProp[];
}

// TODO(Kagami): alt names
function getNormIdolNames(idol: Idol): string {
  return [
    normalizeAll(idol.name),
    normalizeAll(idol.real_name_original),
    normalizeAll(idol.real_name),
    normalizeAll(idol.name_original),
  ].join("");
}

function getNormIdolGroupNames(
  idol: Idol,
  idolGroupsMap: IdolGroupsMap
): string {
  const names: string[] = [];
  idolGroupsMap.get(idol.id)!.forEach((g) => {
    names.push(normalizeAll(g.name));
    names.push(normalizeAll(g.name_original));
  });
  return names.join("");
}

// XXX(Kagami): a bit hacky but no tuple keys in Map.
function idolGroupMemberKey(idol: Idol, group: Group): string {
  return idol.id + group.id;
}

// NOTE: Will raise exception if references are invalid! If this function
// completed successfully it's guaranteed that all references are valid so it's
// safe to use `map.get(id)!` later.
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

// Main group goes first (if any).
// Otherwise sort by group's debut date.
// If unknown then by group's name.
export function getSortedIdolGroups(idol: Idol, cache: Cache): Group[] {
  const groups = Array.from(cache.idolGroupsMap.get(idol.id)!);
  groups.sort((g1, g2) => {
    const memberOfG1 = +getIdolGroupMember(idol, g1, cache)!.current;
    const memberOfG2 = +getIdolGroupMember(idol, g2, cache)!.current;
    let cmp = memberOfG2 - memberOfG1;
    if (!cmp) cmp = (g2.debut_date || "0").localeCompare(g1.debut_date || "0");
    if (!cmp) cmp = g2.name.localeCompare(g1.name);
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
function matchGroupName(idol: Idol, cache: Cache, val: string): boolean {
  return cache.idolGroupNamesMap.get(idol.id)!.includes(val);
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
      (chunk2 ? matchGroupName(idol, cache, chunk2) : true)
    )
      return true;

    if (
      matchGroupName(idol, cache, chunk1) &&
      (chunk2 ? matchIdolName(idol, cache, chunk2) : true)
    )
      return true;
  }

  return false;
}

// Match all idols in groups with given company name.
// Company names aren't cached in map because this search isn't important.
// TODO(Kagami): idol should have agency_name field too?
function matchCompanyName(idol: Idol, cache: Cache, val: string): boolean {
  const groups = cache.idolGroupsMap.get(idol.id)!;
  return groups.some((group) => {
    return normalizeAll(group.agency_name).includes(val);
  });
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
        if (matchGroupName(idol, cache, val)) return true;
        break;
      case "c":
        if (matchCompanyName(idol, cache, val)) return true;
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

// Sorty by debut date by default.
function compareIdols(i1: Idol, i2: Idol): number {
  let cmp = (i2.debut_date || "0").localeCompare(i1.debut_date || "0");
  if (!cmp) cmp = i2.birth_date.localeCompare(i1.birth_date);
  return cmp;
}

/**
 * Find idols matching given query.
 */
// TODO(Kagami): Profile/optimize.
export function searchIdols(
  query: string,
  profiles: Profiles,
  cache: Cache
): Idol[] {
  if (import.meta.env.DEV) console.time("searchIdols");

  const q = parseQuery(query);
  const result = profiles.idols.filter((idol) => filterIdol(q, idol, cache));
  result.sort(compareIdols);

  if (import.meta.env.DEV) console.timeEnd("searchIdols");
  return result;
}
