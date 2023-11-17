export function debounce<A extends Function>(callback: A, interval: number): A {
  let debounceTimeoutId: ReturnType<typeof setTimeout> | undefined;
  return <any>function (...args: any[]) {
    clearTimeout(debounceTimeoutId);
    debounceTimeoutId = setTimeout(() => callback(...args), interval);
  };
}

export function getUrlParams(): URLSearchParams {
  const url = new URL(location.href);
  return url.searchParams;
}

export function setUrlParams(
  k1: string,
  v1: string,
  k2: string,
  v2: string,
  replace = false
) {
  const url = new URL(location.href);
  url.search = ""; // clear all previous params
  if (v1 || k1 !== "q") {
    // q=default, otherwise need to save route
    url.searchParams.set(k1, v1);
  }
  if (v2) {
    url.searchParams.set(k2, v2);
  }
  // don't escape colon https://stackoverflow.com/q/13713671
  url.search = url.searchParams.toString().replace(/%3A/g, ":");

  if (import.meta.env.DEV && !replace)
    console.log("PUSH STATE", { k1, v1, k2, v2 });
  history[replace ? "replaceState" : "pushState"]("", "", url);
}

export function fixMissedUrlParam(k: string, v: string) {
  const url = new URL(location.href);
  if (url.searchParams.has(k)) return;
  url.searchParams.set(k, v);
  url.search = url.searchParams.toString().replace(/%3A/g, ":");
  history.replaceState("", "", url);
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

// https://stackoverflow.com/a/4819886
export function isTouchDevice(): boolean {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}

export function notTouch(fn: Function): (...args: any[]) => void {
  return function (...args: any[]) {
    if (!isTouchDevice()) {
      fn(...args);
    }
  };
}

export function reorderArray<T>(
  arr: T[],
  fromIndex: number,
  toIndex: number
): T[] {
  if (fromIndex === toIndex) return arr;
  const minIndex = Math.min(fromIndex, toIndex);
  const maxIndex = Math.max(fromIndex, toIndex);
  const arrBefore = arr.slice(0, minIndex);
  const arrBetween = arr.slice(minIndex + 1, maxIndex);
  const arrAfter = arr.slice(maxIndex + 1);
  const newArr = [];
  if (toIndex < fromIndex) {
    // [before items] to [between items] from [after items]
    // [before items] from to [between items] [after items]
    newArr.push(
      ...arrBefore,
      arr[fromIndex],
      arr[toIndex],
      ...arrBetween,
      ...arrAfter
    );
  } else {
    // [before items] from [between items] to [after items]
    // [before items] [between items] to from [after items]
    newArr.push(
      ...arrBefore,
      ...arrBetween,
      arr[toIndex],
      arr[fromIndex],
      ...arrAfter
    );
  }
  return newArr;
}

export function logTimes(
  info: string,
  startTime: number,
  ...times: (string | number)[]
) {
  const format = (t2: number, t1: number) => (t2 - t1).toFixed(3);
  const arr: string[] = [];
  let prevTime = startTime;
  let time = 0;
  for (let i = 0; i < times.length; i += 2) {
    const name = times[i] as string;
    if (i + 1 < times.length) {
      time = times[i + 1] as number;
      arr.push(`${name}:${format(time, prevTime)}`);
      prevTime = time;
    } else {
      arr.push(name);
    }
  }
  const endTime = time;
  arr.unshift(`total:${format(endTime, startTime)}`);
  console.log(`[${info}] ` + arr.join(" "));
}

export function showError(err: any): string {
  return err?.message || `Unknown error "${err}"`;
}
