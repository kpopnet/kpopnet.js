/**
 * Filterable item list.
 */

import { Switch, Match, For, Show, createMemo } from "solid-js";
import type { Profiles } from "kpopnet.json";

import "./item-list.less";
import { searchIdols } from "../../lib/search";
import type { GroupMap } from "../../lib/search";
import IdolView from "../item-view/idol";
// import "../labels/labels.less";

interface ListProps {
  query: string;
  profiles: Profiles;
  groupMap: GroupMap;
}

export default function ItemList(p: ListProps) {
  const idols = createMemo(() => {
    return searchIdols(p.query, p.profiles, p.groupMap).slice(0, 20);
  });
  return (
    <Switch
      fallback={<section class="item-list item-list_empty">No results</section>}
    >
      <Match when={p.query.length < 2}> </Match>
      <Match when={idols().length}>
        <section class="idols">
          <For each={idols()}>
            {(idol) => <IdolView idol={idol} groupMap={p.groupMap} />}
          </For>
        </section>
      </Match>
    </Switch>
  );
}
