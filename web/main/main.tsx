/**
 * Application entry point.
 */

import { Match, Switch, createSignal, onCleanup, onMount } from "solid-js";
import profiles from "kpopnet.json";

import SearchInput from "../search-input/search-input";
import ItemList from "../item-list/item-list";
import ItemView from "../item-view/item-view";
import { type Cache, makeCache } from "../../lib/search";
import Router, { ItemRoute, QueryRoute, useRouter } from "../router/router";
import Navbar from "../nav/nav";

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
  const [route, query, goto] = useRouter();

  new Promise(() => {
    setCache(makeCache(profiles));
  }).catch((e) => {
    console.error(e);
    setErr(e);
  });

  function handleGlobalHotkeys(event: KeyboardEvent) {
    if (event.key == "k" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      if (route() !== QueryRoute) {
        goto(QueryRoute, "");
      }
      // XXX(Kagami): need to keep triggering this signal somehow...
      setFocus(focus() + 1);
    }
  }

  onMount(() => {
    document.addEventListener("keydown", handleGlobalHotkeys);
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleGlobalHotkeys);
  });

  // FIXME(Kagami): mobile screen
  return (
    <>
      <Navbar />
      <main
        class="flex flex-col w-[800px] min-h-full mx-auto pt-cnt-top pb-cnt-last"
        classList={{ "justify-center items-center err": !!err() }}
      >
        <Switch fallback={"Invalid route"}>
          <Match when={!cache()}>
            Can't load profile data
            <div class="err-sm">{showError(err())}</div>
          </Match>
          <Match when={route() === ItemRoute}>
            <ItemView id={query()} cache={cache()!} />
          </Match>
          <Match when={route() === QueryRoute}>
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
