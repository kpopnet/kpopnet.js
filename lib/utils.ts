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
  [k1, v1]: string[],
  [k2, v2]: string[],
  [k3, v3]: string[],
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
  if (v3) {
    url.searchParams.set(k3, v3);
  }
  // don't escape colon https://stackoverflow.com/q/13713671
  url.search = url.searchParams.toString().replace(/%3A/g, ":");

  if (import.meta.env.DEV)
    console.log("NEW STATE", [k1, v1], [k2, v2], [k3, v3], replace);
  history[replace ? "replaceState" : "pushState"]("", "", url);
}

export function fixMissedUrlParam(k: string, v: string) {
  const url = new URL(location.href);
  if (url.searchParams.has(k)) return;
  url.searchParams.set(k, v);
  url.search = url.searchParams.toString().replace(/%3A/g, ":");
  history.replaceState("", "", url);
}

// https://stackoverflow.com/a/4819886
export function isTouchDevice(): boolean {
  return "ontouchstart" in window;
}

export function notTouch<A extends Function>(fn: A): A {
  return <any>function (...args: any[]) {
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

export function withTime<A>(name: string, fn: () => A): A {
  return (function () {
    /*dev*/ const dev = import.meta.env.DEV;
    /*dev*/ const tStart = dev ? performance.now() : 0;
    const result = fn();
    /*dev*/ const tRun = dev ? performance.now() : 0;
    /*dev*/ if (dev) logTimes(name, tStart, "run", tRun);
    return result;
  })();
}

export async function withTimeAsync<A>(
  name: string,
  fn: () => Promise<A>
): Promise<A> {
  return await (async function () {
    /*dev*/ const dev = import.meta.env.DEV;
    /*dev*/ const tStart = dev ? performance.now() : 0;
    const result = await fn();
    /*dev*/ const tRun = dev ? performance.now() : 0;
    /*dev*/ if (dev) logTimes(name, tStart, "run", tRun);
    return result;
  })();
}
