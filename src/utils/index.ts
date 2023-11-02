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
  } else {
    url.searchParams.delete("q");
  }
  history.replaceState("", "", url);
}
