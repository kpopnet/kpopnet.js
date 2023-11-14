export interface SortType {
  id: string;
  name: string;
  enabled: boolean;
  reversed: boolean;
}

/** [field, 1=asc/-1=desc] */
export type SortProp = [string, number];

export type SortItemType = "idol" | "group";

export const defaultIdolProps: SortProp[] = [["birth_date", -1]];
export const defaultGroupProps: SortProp[] = [["debut_date", -1]];

export function sortsToProps(sorts: SortType[]): SortProp[] {
  return sorts.filter((s) => s.enabled).map((s) => [s.id, s.reversed ? -1 : 1]);
}

export function sameSorts(arr1: SortProp[], arr2: SortProp[]): boolean {
  if (arr1.length === 0 || arr2.length === 0) return true; // disabled all sorts -> as default
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i][0] !== arr2[i][0] || arr1[i][1] !== arr2[i][1]) return false;
  }
  return true;
}

// NOTE(Kagami): default sorts should be in sync with lib/search.ts and kpopnet.json!
// NOTE(Kagami): actually kpopnet.json uses 2 keys but the second one is just a
// fallback, so we use just one to avoid UI clutter.
const IDOL_SORTS: SortType[] = [
  { id: "birth_date", name: "Birth date", enabled: true, reversed: true },
  { id: "debut_date", name: "Debut date", enabled: false, reversed: true },
  { id: "real_name", name: "Name", enabled: false, reversed: false },
  { id: "height", name: "Height", enabled: false, reversed: false },
  { id: "weight", name: "Weight", enabled: false, reversed: false },
];
const GROUP_SORTS: SortType[] = [
  { id: "debut_date", name: "Debut date", enabled: true, reversed: true },
  { id: "disband_date", name: "Disband date", enabled: false, reversed: true },
  { id: "members", name: "Members＃", enabled: false, reversed: true },
  { id: "name", name: "Name", enabled: false, reversed: false },
];

// Should normally be the same as in lib/search.ts but not necessary.
// Just for the sake of consistency and manual URL query editing.
const IDOL_FIELDS: [string, string][] = [
  ["birth_date", "d"],
  ["debut_date", "dd"],
  ["real_name", "n"],
  ["height", "h"],
  ["weight", "w"],
];
const GROUP_FIELDS: [string, string][] = [
  ["debut_date", "dd"],
  ["disband_date", "dbd"],
  ["members", "m"],
  ["name", "g"],
];
const idolFieldMaps = {
  f2k: new Map(IDOL_FIELDS),
  k2f: new Map(IDOL_FIELDS.map(([f, k]) => [k, f])),
};
const groupFieldMaps = {
  f2k: new Map(GROUP_FIELDS),
  k2f: new Map(GROUP_FIELDS.map(([f, k]) => [k, f])),
};

export function getDefaultSortsCopy(type: SortItemType): SortType[] {
  const sorts = type === "idol" ? IDOL_SORTS : GROUP_SORTS;
  return structuredClone(sorts);
}

export function isDefaultSorts(type: SortItemType, sorts: SortType[]): boolean {
  const defaultProps = type === "idol" ? defaultIdolProps : defaultGroupProps;
  return sameSorts(defaultProps, sortsToProps(sorts));
}

function getFieldMaps(type: SortItemType) {
  return type === "idol" ? idolFieldMaps : groupFieldMaps;
}

function storageKey(type: SortItemType) {
  return `KN_SORTS_${type}`;
}

export function removeSorts(type: SortItemType) {
  try {
    localStorage.removeItem(storageKey(type));
  } catch (err) {
    console.error(err);
  }
}

export function saveSorts(type: SortItemType, sorts: SortType[]) {
  try {
    localStorage.setItem(storageKey(type), serializeSorts(type, sorts));
  } catch (err) {
    console.error(err);
  }
}

export function loadSorts(type: SortItemType): SortType[] {
  const defaultSorts = getDefaultSortsCopy(type);
  try {
    const json = localStorage.getItem(storageKey(type));
    if (!json) return defaultSorts;
    return deserializeSorts(type, json);
  } catch (err) {
    console.error(err);
    removeSorts(type); // remove possible broken data
  }
  return defaultSorts;
}

export function serializeSorts(type: SortItemType, sorts: SortType[]): string {
  const fMap = getFieldMaps(type).f2k;
  return sorts
    .filter((s) => s.enabled)
    .map((s) => `${fMap.get(s.id)}:${s.reversed ? 1 : 0}`)
    .join(" ");
}

export function serializeIfChanged(
  type: SortItemType,
  sorts: SortType[]
): string {
  if (isDefaultSorts(type, sorts)) return "";
  return serializeSorts(type, sorts);
}

export function deserializeSorts(type: SortItemType, s: string): SortType[] {
  const fMap = getFieldMaps(type).k2f;
  const defaultSorts = getDefaultSortsCopy(type);
  const defaultSortsMap = new Map(defaultSorts.map((s) => [s.id, s]));
  const sorts: SortType[] = [];
  for (const chunk of s.trim().split(/\s+/)) {
    if (!chunk.includes(":")) continue;
    const [id, reversed] = chunk.split(":");
    if (!(reversed === "0" || reversed === "1")) continue;
    const field = fMap.get(id);
    if (!field) continue;
    const defaultSort = defaultSortsMap.get(field);
    if (!defaultSort) continue;
    sorts.push({ ...defaultSort, enabled: true, reversed: reversed === "1" });
    defaultSortsMap.delete(field);
  }
  const validSorts = sorts.length > 0;
  // add remaining default sorts
  for (const sort of defaultSorts) {
    if (defaultSortsMap.has(sort.id)) {
      sorts.push(sort);
      if (validSorts) {
        // disable default sorts if there are any custom sorts
        sort.enabled = false;
      }
    }
  }
  return sorts;
}
