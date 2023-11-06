import { Match, Switch } from "solid-js";
import type { Cache } from "../../lib/search";
import IdolView from "./idol";

/** Show corresponding single item by its id */
export default function ItemView(p: { id: string; cache: Cache }) {
  const foundIdol = p.cache.idolMap.get(p.id);
  const foundGroup = p.cache.groupMap.get(p.id);
  // TODO(Kagami): better style for "not found"
  return (
    <div class="item item_single">
      <Switch fallback={<span>No item by id "{p.id}" found</span>}>
        <Match when={foundIdol}>
          <IdolView idol={foundIdol!} cache={p.cache} />
        </Match>
        <Match when={foundGroup}>
          {/* <GroupView group={foundGroup!} cache={p.cache} /> */}
        </Match>
      </Switch>
    </div>
  );
}
