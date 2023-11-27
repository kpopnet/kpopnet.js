import {
  type JSXElement,
  type Accessor,
  createContext,
  createEffect,
  createSignal,
  on,
  onCleanup,
  onMount,
  useContext,
} from "solid-js";

import {
  type SortType,
  type SortItemType,
  loadSorts,
  deserializeSorts,
  serializeIfChanged,
} from "../../lib/sort";
import {
  type Values,
  serializeFields,
  deserializeFields,
} from "../../lib/plot";
import {
  debounce,
  fixMissedUrlParam,
  getUrlParams,
  setUrlParams,
} from "../../lib/utils";

export type Route =
  | "IdolQueryRoute"
  | "GroupQueryRoute"
  | "JQRoute"
  | "PQRoute"
  | "ItemRoute";
export const IdolQueryRoute: Route = "IdolQueryRoute";
export const GroupQueryRoute: Route = "GroupQueryRoute";
export const JQRoute: Route = "JQRoute";
export const PQRoute: Route = "PQRoute";
export const ItemRoute: Route = "ItemRoute";

// Internal signal value
export interface View {
  route: Route;
  query: string;
  sorts: SortType[];
  fields: Values | null;
  delay: boolean /** set URL search param with delay to avoid cluttering history */;
  popstate: boolean /** handling popstate event */;
  replace: boolean /** replace history instead of adding new entry */;
}
// Accessors for components
export interface GetView {
  route: Accessor<Route>;
  query: Accessor<string>;
  sorts: Accessor<SortType[]>;
  fields: Accessor<Values | null>;
}
// Can set any combination of the view fields
export type SetView = Partial<View>;

type RouterContextValue = [view: GetView, (opts: SetView) => void];
const RouterContext = createContext<RouterContextValue>(
  undefined as unknown as RouterContextValue
);

// Use separated abstraction for sort module because router is specific to web app
export function routeToItemType(route: Route): SortItemType {
  switch (route) {
    case IdolQueryRoute:
      return "idol";
    case GroupQueryRoute:
      return "group";
    default:
      throw new Error(`No sorts for route ${route.toString()}`);
  }
}

export function routeToUrlParam(route: Route): string {
  switch (route) {
    case ItemRoute:
      return "id";
    case IdolQueryRoute:
      return "q";
    case GroupQueryRoute:
      return "gq";
    case JQRoute:
      return "jq";
    case PQRoute:
      return "pq";
    default:
      throw new Error(`Unknown route ${route.toString()}`);
  }
}

export function queryRoute(route: Route): boolean {
  return route === IdolQueryRoute || route === GroupQueryRoute;
}

function loadRouteSorts(route: Route): SortType[] {
  return queryRoute(route) ? loadSorts(routeToItemType(route)) : [];
}

// Infer current view from the URL
function createView(): View {
  // default view
  let [route, query] = [IdolQueryRoute, ""];
  const params = getUrlParams();
  let val: string | null = null;
  if ((val = params.get("id")) != null) {
    [route, query] = [ItemRoute, val];
  } else if ((val = params.get("q")) != null) {
    [route, query] = [IdolQueryRoute, val];
  } else if ((val = params.get("gq")) != null) {
    [route, query] = [GroupQueryRoute, val];
  } else if ((val = params.get("jq")) != null) {
    [route, query] = [JQRoute, val];
  } else if ((val = params.get("pq")) != null) {
    [route, query] = [PQRoute, val];
  }

  let sorts: SortType[] = [];
  if (queryRoute(route)) {
    // sort in URL overwrites localStorage sorts
    if ((val = params.get("s"))) {
      sorts = deserializeSorts(routeToItemType(route), val);
    } else {
      sorts = loadRouteSorts(route);
    }
  }

  let fields = null;
  if (route === PQRoute) {
    if ((val = params.get("f"))) {
      fields = deserializeFields(query, val);
    }
  }

  return {
    route,
    query,
    sorts,
    fields,
    delay: false,
    popstate: false,
    replace: false,
  };
}

function serializeRouteSorts(route: Route, sorts: SortType[]): string {
  if (!queryRoute(route)) return "";
  return serializeIfChanged(routeToItemType(route), sorts);
}

export default function Router(prop: { children: JSXElement }) {
  const [viewSig, setViewSig] = createSignal<View>(createView());
  const getView: GetView = {
    route: () => viewSig().route,
    query: () => viewSig().query,
    sorts: () => viewSig().sorts,
    fields: () => viewSig().fields,
  };
  function setViewDefaults(opts: SetView) {
    const defOpts: SetView = { delay: false, popstate: false, replace: false }; // reset opts
    // Reset sorts on route change
    if (opts.route && viewSig().route !== opts.route && !opts.sorts) {
      defOpts.sorts = loadRouteSorts(opts.route);
    }
    // Reset fields on route change
    if (opts.route && viewSig().route !== opts.route && !opts.fields) {
      defOpts.fields = null;
    }
    setViewSig({ ...viewSig(), ...defOpts, ...opts });
  }
  const context: RouterContextValue = [getView, setViewDefaults];

  const debounceSetUrlParams = debounce(setUrlParams, 400);
  const setFn = (d: boolean) => (d ? debounceSetUrlParams : setUrlParams);
  createEffect(
    on(
      viewSig,
      ({ route, query: q, sorts, fields, delay, popstate, replace }, prev) => {
        if (popstate) return; // don't do anything on "Go Back"
        const sq = serializeRouteSorts(route, sorts);
        if (!prev && sq) fixMissedUrlParam("s", sq); // put sort settings from localStorage to URL
        if (!prev) return; // don't do anything else on start
        if (route === ItemRoute) window.scrollTo(0, 0); // scroll even if same item because user clicked something
        const prevq = prev.query;
        const prevsq = serializeRouteSorts(prev.route, prev.sorts);
        const prevfq = serializeFields(prevq, prev.fields);
        const fq = serializeFields(q, fields);
        // prettier-ignore
        if (route === prev.route && q === prevq && sq === prevsq && fq === prevfq) return; // no duplicated entries
        // prettier-ignore
        setFn(delay)([routeToUrlParam(route), q], ["s", sq], ["f", fq], replace);
      }
    )
  );

  function handleBack(e: PopStateEvent) {
    setViewSig({ ...createView(), popstate: true });
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
