import type { Idol } from "./types";

const MILLISECONDS_IN_YEAR = 1000 * 365 * 24 * 60 * 60;

export function getAge(date: string): number {
  // Birthday is always in YYYY-MM-DD form and can be parsed as
  // simplified ISO 8601 format.
  const born = new Date(date).getTime();
  if (isNaN(born)) return 0;
  const now = Date.now();
  const years = Math.floor((now - born) / MILLISECONDS_IN_YEAR);
  return Math.max(0, years);
}

// https://namu.wiki/w/한국%20아이돌/역사
// TODO(Kagami): get full gen? 1.5, 2.5, 3.5
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
  const y = debut.getFullYear();
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
