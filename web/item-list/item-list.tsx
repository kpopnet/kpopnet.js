/**
 * Filterable item list.
 */

import {
  Switch,
  Match,
  For,
  createMemo,
  onMount,
  onCleanup,
  createSignal,
} from "solid-js";
import type { Profiles } from "kpopnet.json";

import { type Cache, searchIdols } from "../../lib/search";
import IdolView from "../item-view/idol";
import { useRouter } from "../router/router";

export default function ItemList(p: { profiles: Profiles; cache: Cache }) {
  const SHOW_PER_PAGE = 20;
  const [_, query, __] = useRouter();
  const [showLastX, setShowLastX] = createSignal(SHOW_PER_PAGE);

  const allIdols = createMemo(() => searchIdols(query(), p.profiles, p.cache));
  const idols = createMemo(() => allIdols().slice(0, showLastX()));

  function nearBottom() {
    const el = document.documentElement;
    const pixelsToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    return pixelsToBottom <= 100;
  }

  function handleScroll(e: Event) {
    if (nearBottom() && showLastX() < allIdols().length) {
      setShowLastX((x) => x + SHOW_PER_PAGE);
    }
  }

  onMount(() => {
    document.addEventListener("scroll", handleScroll);
  });

  onCleanup(() => {
    document.removeEventListener("scroll", handleScroll);
  });

  return (
    <section
      classList={{ "text-center text-[30px] text-[#999]": !idols().length }}
    >
      <Switch>
        <Match when={idols().length}>
          <div class="text-center mt-2 mb-cnt-next text-kngray-1 text-sm">
            {allIdols().length} result{allIdols().length > 1 ? "s" : ""}
          </div>
          <For each={idols()}>
            {(idol) => <IdolView idol={idol} cache={p.cache} />}
          </For>
        </Match>
        <Match when>
          <div class="mt-cnt-next">No results</div>
        </Match>
      </Switch>
    </section>
  );
}
