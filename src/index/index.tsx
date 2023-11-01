/**
 * Application entry point.
 */

import { onMount, createSignal } from "solid-js";

import "./global.less";
import "./index.less";
import Alerts, { showAlert } from "../alerts/alerts";
import Search from "../search/search";
import IdolList from "../idol-list/idol-list";
import type { Profiles } from "../idol-list/render";
import { getGroupMap } from "../idol-list/render";
// import "../labels";

export default function Index() {
  // FIXME: get actual profiles
  const profiles: Profiles = {
    groups: [
      {
        agency_name: "Pledis",
        debut_date: "2017-03-21",
        disband_date: "2019-05-24",
        id: "KWGkvTokzv6h",
        name: "Pristin",
      },
    ],
    idols: [
      {
        birth_date: "1997-07-29",
        debut_date: "2017-03-21",
        group_id: "KWGkvTokzv6h",
        height: 172.0,
        id: "G_DuWxfoSlXa",
        name: "Minkyeung",
        name_hangul: "민경",
        birth_name: "Kim Minkyung",
        birth_name_hangul: "김민경",
        weight: 50.0,
      },
    ],
  };
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
    <main class="index">
      <div class="index__inner">
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
