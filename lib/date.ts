import type { Idol, Group } from "./types";

function subYears(d1: Date, d2: Date): number {
  let years = d1.getFullYear() - d2.getFullYear();
  if (
    d1.getMonth() < d2.getMonth() ||
    (d1.getMonth() === d2.getMonth() && d1.getDate() < d2.getDate())
  ) {
    // year shift has not yet happened
    years -= 1;
  }
  return Math.max(0, years);
}

export function getAge(date: string): number {
  // Birthday is always in YYYY-MM-DD form and can be parsed as
  // simplified ISO 8601 format.
  const born = new Date(date);
  if (isNaN(+born)) return 0;
  const now = new Date();
  const offset = now.getTimezoneOffset() + 9 * 60; // change local TZ to KST
  now.setTime(now.getTime() + offset * 60 * 1000);
  return subYears(now, born);
}

export function getDebutAge(
  birth_date: string,
  debut_date: string | null
): number | null {
  if (!debut_date) return null;
  const born = new Date(birth_date);
  if (isNaN(+born)) return null;
  const debut = new Date(debut_date);
  if (isNaN(+debut)) return null;
  return subYears(debut, born);
}

export function getLifespan(
  debut_date: string | null,
  disband_date: string | null
): number | null {
  // calculate lifespan only when both fields are exist
  // because disband_date is often missing
  if (!debut_date || !disband_date) return null;
  const debut = new Date(debut_date);
  if (isNaN(+debut)) return null;
  const disband = new Date(disband_date);
  if (isNaN(+disband)) return null;
  return subYears(disband, debut);
}

// https://namu.wiki/w/한국%20아이돌/역사
// TODO(Kagami): get full gen? 1.5, 2.5, 3.5
function getGen(y: number): number {
  switch (true) {
    case y >= 2019:
      return 4;
    case y >= 2014:
      return 3;
    case y >= 2004:
      return 2;
    case y >= 1994:
      return 1;
    default:
      return 0;
  }
}

// TODO(Kagami): theoretically idol can debut in groups of different gens? So we
// want gen in context of the group?
export function getIdolGen(idol: Idol): number {
  let debut: Date;
  if (idol.debut_date) {
    debut = new Date(idol.debut_date);
  } else {
    // guess debut date (optional) from birth date (required)
    debut = new Date(idol.birth_date);
    // currently the average debut age is 18.8 years
    // using 18 as a rough estimate
    debut.setFullYear(debut.getFullYear() + 18);
  }
  return getGen(debut.getFullYear());
}

export function getGroupGen(group: Group): number | null {
  if (group.debut_date) {
    const debut = new Date(group.debut_date);
    return getGen(debut.getFullYear());
  } else if (group.disband_date) {
    const debut = new Date(group.disband_date);
    // currently the average group lifespan is 4.5 years
    // using 4 as a rough estimate
    debut.setFullYear(debut.getFullYear() - 4);
    return getGen(debut.getFullYear());
  } else {
    return null;
  }
}
