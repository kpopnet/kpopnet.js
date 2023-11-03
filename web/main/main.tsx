/**
 * Application entry point.
 */

import { createSignal, createEffect, on } from "solid-js";

import "./global.less";
import "./main.less";
// import Alerts from "../alerts/alerts";
import SearchInput from "../search-input/search-input";
import ItemList from "../item-list/item-list";
import { getGroupMap } from "../../lib/search";
import profiles from "kpopnet.json";
import { debounce, getUrlQuery, setUrlQuery } from "../../lib/utils";

export default function Main() {
  // TODO(Kagami): Might use later for loading e.g. WASM
  let [loading, _setLoading] = createSignal(false);
  let [loadingErr, _setLoadingErr] = createSignal(false);
  let [query, setQuery] = createSignal(getUrlQuery());

  const debounceSetUrlQuery = debounce(setUrlQuery, 400);
  createEffect(
    on(query, (q) => {
      debounceSetUrlQuery(q);
    })
  );

  // TODO(Kagami): make other caches idol->groups, groups->idol, idolMap
  // Check for reference match and display error if didn't match!
  const groupMap = getGroupMap(profiles);

  return (
    <main class="main">
      <section class="main__inner">
        <SearchInput
          query={query()}
          setQuery={setQuery}
          loading={loading()}
          disabled={loadingErr()}
        />
        <ItemList profiles={profiles} groupMap={groupMap} query={query()} />
      </section>
    </main>
  );
}

/* FIXME: rework footer
<footer class="footer">
  <div class="footer__inner">
    <a class="footer__link" target="_blank" href="https://kpop.re/">
      Kpop.re
    </a>
    <a
      class="footer__link"
      target="_blank"
      href="https://github.com/kpopnet"
    >
      Source code
    </a>
    <a
      class="footer__link"
      target="_blank"
      href="https://github.com/kpopnet/kpopnet.json/issues"
    >
      Feedback
    </a>
  </div>
</footer>*/
