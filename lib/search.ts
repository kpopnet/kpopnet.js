import type { Idol, Group, Profiles, GroupMember } from "kpopnet.json";

export type IdolMap = Map<string, Idol>;
export type GroupMap = Map<string, Group>;
export type IdolGroupsMap = Map<string, Group[]>;
export type GroupIdolsMap = Map<string, Idol[]>;
export type IdolGroupMemberMap = Map<string, GroupMember>;
export interface Cache {
  idolMap: IdolMap;
  groupMap: GroupMap;
  idolGroupsMap: IdolGroupsMap;
  groupIdolsMap: GroupIdolsMap;
  idolGroupMemberMap: IdolGroupMemberMap;
}

type SearchProp = [string, string];
interface Query {
  name: string;
  props: SearchProp[];
}

// XXX(Kagami): a bit hacky but no tuple keys in Map.
function idolGroupMemberKey(idol: Idol, group: Group): string {
  return idol.id + group.id;
}

// NOTE: Will raise exception if references are invalid! If this function
// completed successfully it's guaranteed that all references are valid so it's
// safe to use `map.get(id)!` later.
export function makeCache(profiles: Profiles): Cache {
  const idolMap = new Map();
  profiles.idols.forEach((idol) => {
    // TODO: Freeze for safety?
    // Object.freeze(idol);
    idolMap.set(idol.id, idol);
  });

  const groupMap: Map<string, Group> = new Map();
  profiles.groups.forEach((group) => {
    // Object.freeze(group);
    groupMap.set(group.id, group);
  });

  const idolGroupsMap = new Map();
  profiles.idols.forEach((idol) => {
    const idolGroups: Group[] = [];
    idol.groups.forEach((id) => {
      if (!groupMap.has(id)) throw new Error(`Invalid group ID: ${id}`);
      idolGroups.push(groupMap.get(id)!);
    });
    idolGroupsMap.set(idol.id, idolGroups);
  });

  const groupIdolsMap = new Map();
  const idolGroupMemberMap = new Map();
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

  return {
    idolMap,
    groupMap,
    idolGroupsMap,
    groupIdolsMap,
    idolGroupMemberMap,
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

function getGroupNames(idol: Idol, cache: Cache): string[] {
  return cache.idolGroupsMap.get(idol.id)!.map((g) => g.name);
}

function getOrigGroupNames(idol: Idol, cache: Cache): string[] {
  return cache.idolGroupsMap.get(idol.id)!.map((g) => g.name_original);
}

// Main group goes first.
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
function normalize(s: string): string {
  return s.replace(/[^\p{L}\d]/gu, "").toLowerCase();
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
      const lastVal = normalize(query);
      if (lastKey) {
        // prop1:[more words]
        props.push([lastKey, lastVal]);
      } else {
        // [just query]
        name = lastVal;
      }
      break;
    }
  }
  return { name, props };
}

// Match all possible idol names.
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
function matchGroupName(idol: Idol, cache: Cache, val: string): boolean {
  const gnames = getGroupNames(idol, cache).concat(
    getOrigGroupNames(idol, cache)
  );
  return gnames.some((gname) => normalize(gname).includes(val));
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
      !matchGroupName(idol, cache, q.name)
    ) {
      return false;
    }
    // Match for exact properties if user requested.
    return q.props.every(([key, val]) => {
      switch (key) {
        case "n":
          if (matchIdolName(idol, val)) return true;
          break;
        case "g":
          if (matchGroupName(idol, cache, val)) return true;
          break;
      }
      return false;
    });
  });
  // console.timeEnd("searchIdols");
  return result;
}
