/**
 * Filterable item list.
 */

import { Switch, Match, For, Show, createMemo } from "solid-js";
import type { Profiles } from "kpopnet.json";

import { searchIdols } from "../../lib/search";
import type { Cache } from "../../lib/search";
import IdolView from "../item-view/idol";
import { useRouter } from "../router/router";

interface ListProps {
  profiles: Profiles;
  cache: Cache;
}

export default function ItemList(p: ListProps) {
  const [_, query, __] = useRouter();
  const idols = createMemo(() => {
    return searchIdols(query(), p.profiles, p.cache).slice(0, 20);
  });
  return (
    <Switch
      fallback={<section class="item-list item-list_empty">No results</section>}
    >
      <Match when={query().length < 2}> </Match>
      <Match when={idols().length}>
        <section class="item-list">
          <For each={idols()}>
            {(idol) => <IdolView idol={idol} cache={p.cache} />}
          </For>
        </section>
      </Match>
    </Switch>
  );
}
