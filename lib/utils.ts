export function debounce(callback: Function, interval: number) {
  let debounceTimeoutId: number | undefined;

  return function (...args: any[]) {
    clearTimeout(debounceTimeoutId);
    debounceTimeoutId = setTimeout(() => callback(...args), interval);
  };
}

export function getUrlParams(): URLSearchParams {
  const url = new URL(location.href);
  return url.searchParams;
}

export function setUrlParam(key: string, value: string) {
  const url = new URL(location.href);

  for (const key of url.searchParams.keys()) {
    url.searchParams.delete(key);
  }
  if (value) {
    url.searchParams.set(key, value);
  }
  // don't escape colon https://stackoverflow.com/q/13713671
  url.search = url.searchParams.toString().replace(/%3A/g, ":");

  history.pushState("", "", url);
}

const MILLISECONDS_IN_YEAR = 1000 * 365 * 24 * 60 * 60;

function fixZeroedDate(date: string): string {
  // kpopnet.json uses "00" if month or day is unknown.
  return date.replace(/-00/g, "-01");
}

export function getAge(date: string): number {
  // Birthday is always in YYYY-MM-DD form and can be parsed as
  // simplified ISO 8601 format.
  const born = new Date(fixZeroedDate(date)).getTime();
  if (isNaN(born)) return 0;
  const now = Date.now();
  const years = Math.floor((now - born) / MILLISECONDS_IN_YEAR);
  return Math.max(0, years);
}
