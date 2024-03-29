import { type JSXElement, Match, Switch, createMemo } from "solid-js";

import type { Cache } from "../../lib/search";
import IdolView from "./idol";
import { GroupWithIdolsView } from "./group";

/** Show corresponding single item by its id */
function ItemView(p: { id: string; cache: Cache }) {
  const foundIdol = createMemo(() => p.cache.idolMap.get(p.id));
  const foundGroup = createMemo(() => p.cache.groupMap.get(p.id));
  const notFound = createMemo(() => !foundIdol() && !foundGroup());
  return (
    <section id="item" classList={{ "text-center m-auto err": notFound() }}>
      <Switch>
        <Match when={foundIdol()}>
          <IdolView idol={foundIdol()!} cache={p.cache} />
        </Match>
        <Match when={foundGroup()}>
          <GroupWithIdolsView group={foundGroup()!} cache={p.cache} />
        </Match>
        <Match when>
          Not found
          <div class="err-sm">No item by id "{p.id}" found</div>
        </Match>
      </Switch>
    </section>
  );
}
// Recreate ItemView on route change to reset all previous state.
export default function ItemViewWrapper(p: { id: string; cache: Cache }) {
  return createMemo(() => {
    p.id;
    return <ItemView {...p} />;
  }) as unknown as JSXElement;
}
