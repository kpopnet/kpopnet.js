import type { Idol, Group, Profiles } from "kpopnet.json";

export type GroupMap = Map<string, Group>;

type SearchProp = [string, string];
interface Query {
  name: string;
  props: SearchProp[];
}

export function getGroupMap(profiles: Profiles): GroupMap {
  const groupMap = new Map();
  profiles.groups.forEach((group) => {
    groupMap.set(group.id, group);
  });
  return groupMap;
}

// FIXME(Kagami): cache idol->groups
export function getGroupNames(idol: Idol, groupMap: GroupMap): string[] {
  const groups = idol.groups.map((id) => groupMap.get(id)!);
  return groups.map((g) => g.name);
}

function getOrigGroupNames(idol: Idol, groupMap: GroupMap): string[] {
  const groups = idol.groups.map((id) => groupMap.get(id)!);
  return groups.map((g) => g.name_original);
}

// Remove symbols which doesn't make sense for fuzzy search.
function normalize(s: string): string {
  return s.replace(/[:' .-]/g, "").toLowerCase();
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
        const lastVal = normalize(query.slice(0, spaceIdx));
        if (lastKey) {
          props.push([lastKey, lastVal]);
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
      // prop2:[more words]
      const lastVal = normalize(query);
      if (lastKey) {
        props.push([lastKey, lastVal]);
      } else {
        name = lastVal;
      }
      break;
    }
  }
  return { name, props };
}

// Match all possible names of the idol.
function matchIdolName(idol: Idol, val: string): boolean {
  if (normalize(idol.name).includes(val)) return true;
  if (normalize(idol.real_name_original).includes(val)) return true;
  if (normalize(idol.real_name).includes(val)) return true;
  if (normalize(idol.name_original).includes(val)) return true;
  // TODO(Kagami): alt names
  /*if (
      idol.alt_names &&
      idol.alt_names.some((n) => normalize(n).includes(val))
    ) {
      return true;
    }*/
  return false;
}

// Match all possible group names.
function matchGroupName(
  idol: Idol,
  groupMap: GroupMap,
  val: string,
  withOrig = true
): boolean {
  const gnames = getGroupNames(idol, groupMap);
  if (withOrig) {
    gnames.push(...getOrigGroupNames(idol, groupMap));
  }
  return gnames.some((gname) => normalize(gname).includes(val));
}

/**
 * Find idols matching given query.
 */
// TODO(Kagami): Profile/optimize.
export function searchIdols(
  query: string,
  profiles: Profiles,
  groupMap: GroupMap
): Idol[] {
  if (query.length < 2) return [];
  // console.time("parseQuery");
  const q = parseQuery(query);
  // console.timeEnd("parseQuery");
  if (!q.name && !q.props.length) return [];

  // TODO(Kagam): Sort idols?
  // TODO(Kagami): Limit number of results, pagination?
  // console.time("searchIdols");
  const result = profiles.idols.filter((idol) => {
    // Fuzzy name matching.
    // TODO(Kagami): Allow combinations like "Orange Caramel lizzy"
    if (
      q.name &&
      !matchIdolName(idol, q.name) &&
      !matchGroupName(idol, groupMap, q.name)
    ) {
      return false;
    }
    // Match for exact properties if user requested.
    return q.props.every(([key, val]) => {
      switch (key) {
        case "n":
        case "name":
          if (normalize(idol.name).includes(val)) return true;
          break;
        case "rn":
          if (normalize(idol.real_name).includes(val)) return true;
          break;
        case "g":
        case "group":
          if (matchGroupName(idol, groupMap, val, false)) return true;
          break;
      }
      return false;
    });
  });
  // console.timeEnd("searchIdols");
  return result;
}
