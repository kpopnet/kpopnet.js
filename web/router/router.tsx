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

// FIXME(Kagami): HMR seems to be breaking Symbol match.
export const IdolQueryRoute = "IdolQueryRoute";
export const GroupQueryRoute = "GroupQueryRoute";
export const ItemRoute = "ItemRoute";
export type Route = string;
interface GotoOpts {
  delay?: boolean /** set URL search param with delay to avoid cluttering history */;
  noPush?: boolean /** don't save route in history */;
}
type RouteContextValue = [
  () => Route,
  () => string,
  (route: Route | null, query: string, opts?: GotoOpts) => void
];

const RouterContext = createContext<RouteContextValue>([
  () => IdolQueryRoute,
  () => "",
  (route: Route | null, query: string, opts: GotoOpts = {}) => {},
]);

export function routeToUrlParam(route: Route): string {
  switch (route) {
    case ItemRoute:
      return "id";
    case IdolQueryRoute:
      return "q";
    case GroupQueryRoute:
      return "gq";
    default:
      throw new Error(`Unknown route ${route.toString()}`);
  }
}

function getRelevantRoute(): [Route, string] {
  const params = getUrlParams();
  for (const [key, value] of params) {
    if (key === "id") return [ItemRoute, value];
    if (key === "q") return [IdolQueryRoute, value];
    if (key === "gq") return [GroupQueryRoute, value];
  }
  return [IdolQueryRoute, ""];
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
      // console.log("@@@ route", [r, q, o], prev);
      if (prev == null || o.noPush) return; // don't do anything on start or "Go Back"
      window.scrollTo(0, 0); // scroll even if same route because user clicked something
      if (r === prev[0] && q === prev[1]) return; // no duplicated entries
      const fn = o.delay ? debounceSetUrlParam : setUrlParam;
      fn(routeToUrlParam(r), q);
    })
  );

  function handleBack(e: PopStateEvent) {
    const [r, q] = getRelevantRoute();
    goto(r, q, { noPush: true });
  }

  onMount(() => {
    window.addEventListener("popstate", handleBack);
  });

  onCleanup(() => {
    window.removeEventListener("popstate", handleBack);
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
