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
