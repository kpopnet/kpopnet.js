import {
  type JSXElement,
  type Accessor,
  createContext,
  createEffect,
  createMemo,
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
} from "../../lib/sort";
import { debounce, getUrlParams, setUrlParam } from "../../lib/utils";

// TODO(Kagami): better to use Symbol but issue with HMR
export type Route = "IdolQueryRoute" | "GroupQueryRoute" | "ItemRoute";
export const IdolQueryRoute: Route = "IdolQueryRoute";
export const GroupQueryRoute: Route = "GroupQueryRoute";
export const ItemRoute: Route = "ItemRoute";

// Internal signal value
export interface View {
  route: Route;
  query: string;
  sorts: SortType[];
  delay: boolean /** set URL search param with delay to avoid cluttering history */;
  noPush: boolean /** don't save route in history */;
}
// Accessors for components
export interface GetView {
  route: Accessor<Route>;
  query: Accessor<string>;
  sorts: Accessor<SortType[]>;
}
// Can set any combination of the view fields
export type SetView = Partial<View>;

type RouterContextValue = [view: GetView, (opts: SetView) => void];
const RouterContext = createContext<RouterContextValue>(
  undefined as unknown as RouterContextValue
);

// Use separated abstraction for sort module because router is specific to web app
export function routeToItemType(route: Route): SortItemType {
  return route === IdolQueryRoute ? "idol" : "group";
}

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

// Infer current view from the URL
function createView(): View {
  // default view
  let [route, query] = [IdolQueryRoute, ""];
  let sorts: SortType[] = [];
  const delay = false;
  const noPush = false;

  const params = getUrlParams();
  let val: string | null = null;
  if ((val = params.get("id"))) {
    [route, query] = [ItemRoute, val];
  } else if ((val = params.get("q"))) {
    [route, query] = [IdolQueryRoute, val];
  } else if ((val = params.get("gq"))) {
    [route, query] = [GroupQueryRoute, val];
  }
  // sort in URL overwrites localStorage sorts
  if ((val = params.get("s"))) {
    sorts = deserializeSorts(routeToItemType(route), val);
  } else {
    sorts = loadSorts(routeToItemType(route));
  }
  return { route, query, sorts, delay, noPush };
}

export default function Router(prop: { children: JSXElement }) {
  const [viewSig, setViewSig] = createSignal<View>(createView());
  const getView: GetView = {
    route: createMemo(() => viewSig().route),
    query: createMemo(() => viewSig().query),
    sorts: createMemo(() => viewSig().sorts),
  };
  function setView(opts: SetView) {
    const defOpts: SetView = { delay: false, noPush: false }; // reset opts
    if (opts.route && viewSig().route !== opts.route && !opts.sorts) {
      // reset sorts on route change
      defOpts.sorts = loadSorts(routeToItemType(opts.route));
    }
    setViewSig({ ...viewSig(), ...defOpts, ...opts });
  }
  const context: RouterContextValue = [getView, setView];

  const debounceSetUrlParam = debounce(setUrlParam, 400);
  createEffect(
    on(viewSig, ({ route: r, query: q, sorts: s, delay, noPush }, prev) => {
      // console.log("@@@ route", [r, q, o], prev);
      if (prev == null || noPush) return; // don't do anything on start or "Go Back"
      window.scrollTo(0, 0); // scroll even if same route because user clicked something
      // FIXME: handle sorts without push?
      if (r === prev.route && q === prev.query) return; // no duplicated entries
      if (q === "" && prev.query === "") return; // don't duplicate empty queries
      const fn = delay ? debounceSetUrlParam : setUrlParam;
      fn(routeToUrlParam(r), q);
    })
  );

  function handleBack(e: PopStateEvent) {
    setView({ ...createView(), noPush: true });
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
