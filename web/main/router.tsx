import {
  JSXElement,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  on,
  onCleanup,
  onMount,
  useContext,
} from "solid-js";

import { debounce, getUrlParams, setUrlParam } from "../../lib/utils";

export const QueryRoute: symbol = Symbol("QueryRoute");
export const ItemRoute: symbol = Symbol("ItemRoute");
type Route = typeof QueryRoute | typeof ItemRoute;
interface GotoOpts {
  delay?: boolean /** set URL search param with delay to avoid cluttering history */;
}
type RouteContextValue = [
  () => Route,
  () => string,
  (route: Route | null, query: string, opts?: GotoOpts) => void
];

const RouterContext = createContext<RouteContextValue>([
  () => QueryRoute,
  () => "",
  (route: Route | null, query: string, opts: GotoOpts = {}) => {},
]);

export function routeToUrlParam(route: Route): string {
  // FIXME(Kagami): HMR seems to be breaking Symbol match.
  switch (route.toString()) {
    case "Symbol(ItemRoute)":
      return "id";
    case "Symbol(QueryRoute)":
      return "q";
    default:
      throw new Error(`Unknown route ${route.toString()}`);
  }
}

function getRelevantRoute(): [Route, string] {
  const params = getUrlParams();
  for (const [key, value] of params) {
    if (key === "id") return [ItemRoute, value];
    if (key === "q") return [QueryRoute, value];
  }
  return [QueryRoute, ""];
}

export default function Router(prop: { children: JSXElement }) {
  const [r, q] = getRelevantRoute();
  const [view, setView] = createSignal<[Route, string, GotoOpts]>([r, q, {}]);
  const route = createMemo(() => view()[0]);
  const query = createMemo(() => view()[1]);
  function goto(r: Route | null, q: string, opts: GotoOpts = {}) {
    setView([r || route(), q, opts]);
  }

  const context: RouteContextValue = [route, query, goto];

  const debounceSetUrlParam = debounce(setUrlParam, 400);
  createEffect(
    on(view, ([r, q, o], prev) => {
      // console.log("@@@ route", r, JSON.stringify(q), o, prev);
      if (prev == null) return;
      window.scrollTo(0, 0);
      const fn = o.delay ? debounceSetUrlParam : setUrlParam;
      fn(routeToUrlParam(r), q);
    })
  );

  function handleNavigation(e: PopStateEvent) {
    const [r, q] = getRelevantRoute();
    goto(r, q);
  }

  onMount(() => {
    window.addEventListener("popstate", handleNavigation);
  });

  onCleanup(() => {
    window.removeEventListener("popstate", handleNavigation);
  });

  return (
    <RouterContext.Provider value={context}>
      {prop.children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}
