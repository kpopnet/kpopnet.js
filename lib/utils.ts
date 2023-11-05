export function debounce(callback: Function, interval: number) {
  let debounceTimeoutId: number | undefined;

  return function (...args: any[]) {
    clearTimeout(debounceTimeoutId);
    debounceTimeoutId = setTimeout(() => callback(...args), interval);
  };
}

export function getUrlQuery(): string {
  const url = new URL(location.href);
  return url.searchParams.get("q") || "";
}

export function setUrlQuery(query: string) {
  const url = new URL(location.href);
  if (query) {
    url.searchParams.set("q", query);
    // don't escape colon https://stackoverflow.com/q/13713671
    url.search = url.searchParams.toString().replace(/%3A/g, ":");
  } else {
    url.searchParams.delete("q");
  }
  history.replaceState("", "", url);
}

const MILLISECONDS_IN_YEAR = 1000 * 365 * 24 * 60 * 60;

export function validDate(date: string): boolean {
  const d = new Date(date);
  return !isNaN(d.getTime());
}

export function getAge(birthday: string): number {
  const now = Date.now();
  // Birthday is always in YYYY-MM-DD form and can be parsed as
  // simplified ISO 8601 format.
  const born = new Date(birthday).getTime();
  return Math.floor((now - born) / MILLISECONDS_IN_YEAR);
}

export function getAgo(date: string): string | undefined {
  const years = getAge(date);
  const s = years === 1 ? "" : "s";
  return `${years} year${s} ago`;
}
