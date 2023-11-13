/**
 * Application entry point.
 */

import { Match, Switch, createSignal, onCleanup, onMount } from "solid-js";
import profiles from "kpopnet.json";

import SearchInput from "../search-input/search-input";
import ItemList from "../item-list/item-list";
import ItemView from "../item-view/item-view";
import { type Cache, makeCache } from "../../lib/search";
import Router, {
  ItemRoute,
  IdolQueryRoute,
  useRouter,
  GroupQueryRoute,
} from "../router/router";
import Navbar from "../nav/nav";
import Tabs from "../tabs/tabs";

export default function MainContext() {
  return (
    <Router>
      <Main />
    </Router>
  );
}

function Main() {
  const [cache, setCache] = createSignal<Cache>();
  const [err, setErr] = createSignal<any>();
  const [focus, setFocus] = createSignal(0);
  const [view, setView] = useRouter();

  new Promise(() => {
    setCache(makeCache(profiles));
  }).catch((e) => {
    console.error(e);
    setErr(e);
  });

  function handleGlobalHotkeys(event: KeyboardEvent) {
    if (event.key == "k" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      if (view.route() === IdolQueryRoute || view.route() === GroupQueryRoute) {
        // XXX(Kagami): need to keep triggering this signal somehow...
        setFocus(focus() + 1);
      } else {
        // input watches for route change itself, don't need to call manually here
        setView({ route: IdolQueryRoute, query: "" });
      }
    }
  }

  onMount(() => {
    document.addEventListener("keydown", handleGlobalHotkeys);
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleGlobalHotkeys);
  });

  return (
    <>
      <Navbar />
      <main
        class="flex flex-col min-h-full pb-cnt-last
        md:w-[800px] px-[10px] mx-auto"
        classList={{
          "pt-cnt-top": view.route() === ItemRoute,
          "justify-center items-center err": !!err(),
        }}
      >
        <Switch>
          <Match when={!cache()}>
            Can't load profile data
            <div class="err-sm">{showError(err())}</div>
          </Match>
          <Match when={view.route() === ItemRoute}>
            <ItemView id={view.query()} cache={cache()!} />
          </Match>
          <Match when>
            <Tabs />
            <SearchInput focus={focus} />
            <ItemList profiles={profiles} cache={cache()!} />
          </Match>
        </Switch>
      </main>
    </>
  );
}

function showError(err: any): string {
  return err?.message || `Unknown error "${err}"`;
}
