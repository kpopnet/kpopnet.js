/**
 * Application entry point.
 */

import { onMount, createSignal } from "solid-js";

import "./global.less";
import "./main.less";
import Alerts, { showAlert } from "../alerts/alerts";
import Search from "../search/search";
import IdolList from "../idol-list/idol-list";
import { getGroupMap } from "../idol-list/render";
import profiles from "kpopnet.json";

export default function Main() {
  const groupMap = getGroupMap(profiles);

  // TODO(Kagami): Might use later for loading e.g. WASM
  let [loading, setLoading] = createSignal(false);
  let [loadingErr, _setLoadingErr] = createSignal(false);
  let [query, setQuery] = createSignal("");

  onMount(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  });

  return (
    <main class="main">
      <div class="main__inner">
        <Alerts />
        <Search
          query={query()}
          setQuery={setQuery}
          loading={loading()}
          disabled={loadingErr()}
        />
        <IdolList profiles={profiles} groupMap={groupMap} query={query()} />
      </div>
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
