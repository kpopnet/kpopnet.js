import { Match, Switch } from "solid-js";
import type { Cache } from "../../lib/search";
import IdolView from "./idol";
import GroupView from "./group";

/** Show corresponding single item by its id */
export default function ItemView(p: { id: string; cache: Cache }) {
  const foundIdol = p.cache.idolMap.get(p.id);
  const foundGroup = p.cache.groupMap.get(p.id);
  const notFound = !foundIdol && !foundGroup;
  return (
    <section class="item-view" classList={{ "item-view_empty": notFound }}>
      <Switch>
        <Match when={foundIdol}>
          <IdolView idol={foundIdol!} cache={p.cache} />
        </Match>
        <Match when={foundGroup}>
          <GroupView group={foundGroup!} cache={p.cache} />
        </Match>
        <Match when>
          Not found
          <div class="item-view__error-info">No item by id "{p.id}" found</div>
        </Match>
      </Switch>
    </section>
  );
}
