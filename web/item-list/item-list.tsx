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
import type { Group, Idol, Profiles } from "kpopnet.json";

import { type Cache, searchIdols, searchGroups } from "../../lib/search";
import IdolView from "../item-view/idol";
import GroupView from "../item-view/group";
import { IdolQueryRoute, useRouter } from "../router/router";

export default function ItemList(p: { profiles: Profiles; cache: Cache }) {
  const SHOW_PER_PAGE = 20;
  const [route, query, __] = useRouter();
  const [showLastX, setShowLastX] = createSignal(SHOW_PER_PAGE);

  const searchFn = createMemo(() =>
    route() === IdolQueryRoute ? searchIdols : searchGroups
  );
  const allItems = createMemo(() => searchFn()(query(), p.profiles, p.cache));
  const items = createMemo(() => allItems().slice(0, showLastX()));

  function nearBottom() {
    const el = document.documentElement;
    const pixelsToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    return pixelsToBottom <= 100;
  }

  function handleScroll(e: Event) {
    if (nearBottom() && showLastX() < allItems().length) {
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
    <Switch>
      <Match when={items().length}>
        <div class="text-center mt-2 mb-cnt-next text-kngray-1 text-sm">
          {allItems().length} result{allItems().length > 1 ? "s" : ""}
        </div>
        <section id="items">
          <For each={items()}>
            {(item) =>
              route() === IdolQueryRoute ? (
                <IdolView idol={item as Idol} cache={p.cache} />
              ) : (
                <GroupView group={item as Group} cache={p.cache} />
              )
            }
          </For>
        </section>
      </Match>
      <Match when>
        <section class="text-center err">
          <div class="mt-cnt-next">No results</div>
        </section>
      </Match>
    </Switch>
  );
}
