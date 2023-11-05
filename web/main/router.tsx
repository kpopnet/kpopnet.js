import {
  JSXElement,
  Signal,
  createContext,
  createEffect,
  createSignal,
  on,
  useContext,
} from "solid-js";

import { debounce, getUrlParams, setUrlParam } from "../../lib/utils";

export const QueryRoute: symbol = Symbol();
export const ItemRoute: symbol = Symbol();
type Route = typeof QueryRoute | typeof ItemRoute;
type RouteContextValue = [
  () => Route,
  () => string,
  (route: Route | null, query: string) => void
];

const RouterContext = createContext<RouteContextValue>([
  () => QueryRoute,
  () => "",
  (route: Route | null, query: string) => {},
]);

export function routeToUrlParam(route: Route): string {
  switch (route) {
    case ItemRoute:
      return "id";
    case QueryRoute:
      return "q";
    default:
      throw new Error("Unknown route");
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
  const [route, setRoute] = createSignal(r);
  const [query, setQuery] = createSignal(q);

  function goto(route: Route | null, query: string) {
    if (route) setRoute(route);
    setQuery(query);
  }

  const context: RouteContextValue = [route, query, goto];

  const debounceSetUrlParam = debounce(setUrlParam, 400);
  createEffect(
    on([route, query], ([r, q], prev) => {
      if (prev == null) return;
      debounceSetUrlParam(routeToUrlParam(r), q);
    })
  );

  return (
    <RouterContext.Provider value={context}>
      {prop.children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}
