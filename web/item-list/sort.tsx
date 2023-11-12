import { IdolQueryRoute, type Route } from "../router/router";
import { type SortProp } from "../../lib/search";

export interface SortType {
  id: string;
  name: string;
  enabled: boolean;
  reversed: boolean;
}

export function toSortProps(sorts: SortType[]): SortProp[] {
  return sorts.filter((s) => s.enabled).map((s) => [s.id, s.reversed ? -1 : 1]);
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

export function getDefaultSorts(route: Route): SortType[] {
  const sorts = route === IdolQueryRoute ? IDOL_SORTS : GROUP_SORTS;
  return structuredClone(sorts);
}

function storageKey(route: Route) {
  return `KN_SORTS_${route}`;
}

export function removeSorts(route: Route) {
  try {
    localStorage.removeItem(storageKey(route));
  } catch (err) {
    console.error(err);
  }
}

export function saveSorts(route: Route, sorts: SortType[]) {
  const data = sorts.map((s) => [s.id, s.enabled, s.reversed]);
  try {
    localStorage.setItem(storageKey(route), JSON.stringify(data));
  } catch (err) {
    console.error(err);
  }
}

export function loadSorts(route: Route): SortType[] {
  const defaultSorts = getDefaultSorts(route);
  try {
    const json = localStorage.getItem(storageKey(route));
    if (!json) return defaultSorts;
    const data = JSON.parse(json);
    const sorts: SortType[] = [];
    const defaultSortsMap = new Map(defaultSorts.map((s) => [s.id, s]));
    for (const [id, enabled, reversed] of data) {
      const defaultSort = defaultSortsMap.get(id);
      if (!defaultSort) throw 1;
      sorts.push({ ...defaultSort, enabled: !!enabled, reversed: !!reversed });
      defaultSortsMap.delete(id);
    }
    if (defaultSortsMap.size) throw 2;
    return sorts;
  } catch (err) {
    console.error(err);
    removeSorts(route); // remove possible broken data
  }
  return defaultSorts;
}
