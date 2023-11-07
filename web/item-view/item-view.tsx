import { Match, Switch, createMemo } from "solid-js";

import type { Cache } from "../../lib/search";
import IdolView from "./idol";
import GroupView from "./group";

/** Show corresponding single item by its id */
export default function ItemView(p: { id: string; cache: Cache }) {
  const foundIdol = createMemo(() => p.cache.idolMap.get(p.id));
  const foundGroup = createMemo(() => p.cache.groupMap.get(p.id));
  const notFound = createMemo(() => !foundIdol && !foundGroup);
  return (
    <section class="item-view" classList={{ "item-view_empty": notFound() }}>
      <Switch>
        <Match when={foundIdol()}>
          <IdolView idol={foundIdol()!} cache={p.cache} />
        </Match>
        <Match when={foundGroup()}>
          <GroupView group={foundGroup()!} cache={p.cache} />
        </Match>
        <Match when>
          Not found
          <div class="item-view__error-info">No item by id "{p.id}" found</div>
        </Match>
      </Switch>
    </section>
  );
}
