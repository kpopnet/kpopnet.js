import type { Idol, Group, Profiles } from "kpopnet.json";

import { getSortedGroupNames } from "./search";
import type { Cache } from "./search";

export type RenderedLine = [string, string];
export type Rendered = RenderedLine[];

type ProfileValue = string | number | string[];
type InfoLine = [string, ProfileValue];

export function renderIdol(idol: Idol, cache: Cache): Rendered {
  const renderLine = renderLineCtx.bind(null, idol);
  const gnames = getSortedGroupNames(idol, cache);
  // Name of the main group goes first.
  // FIXME(Kagami): show orig group names; in title?
  let ginfo = gnames.length ? gnames[0][0] : "";
  if (gnames.length > 1) {
    ginfo += " (";
    ginfo += gnames
      .slice(1)
      .map((a) => a[0])
      .join(", ");
    ginfo += ")";
  }
  const lines = getLines(idol).concat([["_groups", ginfo]]);
  return lines.filter(keepLine).sort(compareLines).map(renderLine);
}

function getLines(idol: Idol): InfoLine[] {
  return Object.entries(idol);
}

const knownKeys = [
  "name",
  "real_name",
  "_groups", // our key
  "birth_date",
  "height",
  "weight",
  "positions",
];
const keyPriority = new Map(knownKeys.map((k, idx) => [k, idx]));

function keepLine([key, val]: InfoLine): boolean {
  return keyPriority.has(key) && !!val;
}

function compareLines(a: InfoLine, b: InfoLine): number {
  const k1 = a[0];
  const k2 = b[0];
  return keyPriority.get(k1)! - keyPriority.get(k2)!;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function denormalizeKey(key: string): string {
  switch (key) {
    case "birth_date":
      return "Birthday";
    case "real_name":
      return "Real name";
    case "_groups":
      return "Groups";
  }
  key = capitalize(key);
  key = key.replace(/_/g, " ");
  return key;
}

function denormalizeVal(key: string, val: ProfileValue, idol: Idol): string {
  switch (key) {
    case "name":
      const hangul = idol.name_original;
      return hangul ? `${val} (${hangul})` : (val as string);
    case "real_name":
      const hangul2 = idol.real_name_original;
      return hangul2 ? `${val} (${hangul2})` : (val as string);
    case "birth_date":
      return `${val} (${getAge(val as string)})`;
    case "height":
      return val + " cm";
    case "weight":
      return val + " kg";
    default:
      return val.toString();
  }
}

function renderLineCtx(idol: Idol, [key, val]: InfoLine): RenderedLine {
  val = denormalizeVal(key, val, idol);
  key = denormalizeKey(key);
  return [key, val];
}

const MILLISECONDS_IN_YEAR = 1000 * 365 * 24 * 60 * 60;

function getAge(birthday: string): number {
  const now = Date.now();
  // Birthday is always in YYYY-MM-DD form and can be parsed as
  // simplified ISO 8601 format.
  const born = new Date(birthday).getTime();
  return Math.floor((now - born) / MILLISECONDS_IN_YEAR);
}
