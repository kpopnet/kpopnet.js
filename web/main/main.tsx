/**
 * Application entry point.
 */

import { Show, createSignal } from "solid-js";
import profiles from "kpopnet.json";

import GlobalAlerts, { useAlerts } from "../alerts/alerts";
import SearchInput from "../search-input/search-input";
import ItemList from "../item-list/item-list";
import { Cache, makeCache } from "../../lib/search";
import Router from "./router";

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
  // TODO(Kagami): Might use later for loading e.g. WASM
  const [loading, _setLoading] = createSignal(false);
  const [loadingErr, _setLoadingErr] = createSignal(false);
  const showAlert = useAlerts();

  let cache: Cache | undefined;
  try {
    cache = makeCache(profiles);
  } catch (e) {
    console.error(e);
    showAlert({ title: "Error", message: "Can't load profiles", sticky: true });
  }

  return (
    <main class="main">
      <section class="main__inner">
        <SearchInput loading={loading()} disabled={loadingErr()} />
        <Show when={cache}>
          <ItemList profiles={profiles} cache={cache!} />
        </Show>
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
