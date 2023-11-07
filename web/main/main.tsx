/**
 * Application entry point.
 */

import { Match, Show, Switch, createSignal } from "solid-js";
import profiles from "kpopnet.json";

import GlobalAlerts from "../alerts/alerts";
import SearchInput from "../search-input/search-input";
import ItemList from "../item-list/item-list";
import SingleItemView from "../item-view/item";
import { type Cache, makeCache } from "../../lib/search";
import Router, { ItemRoute, QueryRoute, useRouter } from "../router/router";
import Navbar from "../nav/nav";

export default function MainContext() {
  return (
    <Router>
      <GlobalAlerts>
        <Main />
      </GlobalAlerts>
    </Router>
  );
}

function Main() {
  const [cache, setCache] = createSignal<Cache>();
  const [err, setErr] = createSignal<any>();
  const [route, query, _] = useRouter();

  new Promise(() => {
    setCache(makeCache(profiles));
  }).catch((e) => {
    console.error(e);
    setErr(e);
  });

  return (
    <>
      <Navbar />
      <main class="main" classList={{ main_error: !!err() }}>
        <Switch fallback={"Invalid route"}>
          <Match when={!cache()}>
            Can't load profile data
            <div class="main__error-info">
              {err()?.message || "Unknown error"}
            </div>
          </Match>
          <Match when={route() === ItemRoute}>
            <SingleItemView id={query()} cache={cache()!} />
          </Match>
          <Match when={route() === QueryRoute}>
            <SearchInput />
            <ItemList profiles={profiles} cache={cache()!} />
          </Match>
        </Switch>
      </main>
    </>
  );
}
