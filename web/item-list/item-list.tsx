/**
 * Filterable item list.
 */

import { Switch, Match, For, Show, createMemo } from "solid-js";
import type { Profiles } from "kpopnet.json";

import { type Cache, searchIdols } from "../../lib/search";
import IdolView from "../item-view/idol";
import { useRouter } from "../router/router";

export default function ItemList(p: { profiles: Profiles; cache: Cache }) {
  const [_, query, __] = useRouter();
  const idols = createMemo(() =>
    searchIdols(query(), p.profiles, p.cache).slice(0, 20)
  );
  const noResults = createMemo(() => !idols().length);
  return (
    <section class="item-list" classList={{ "item-list_empty": noResults() }}>
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
