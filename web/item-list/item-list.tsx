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
      class="item-list"
      classList={{ "item-list_empty": !idols().length }}
    >
      <Switch>
        <Match when={idols().length}>
          <For each={idols()}>
            {(idol) => <IdolView idol={idol} cache={p.cache} />}
          </For>
        </Match>
        <Match when>No results</Match>
      </Switch>
    </section>
  );
}
