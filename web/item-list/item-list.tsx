/**
 * Filterable item list.
 */

import {
  type JSXElement,
  type Accessor,
  Switch,
  Match,
  For,
  createMemo,
  onMount,
  onCleanup,
  createSignal,
  createComputed,
  Show,
} from "solid-js";
import type { Profiles, Idol, Group } from "kpopnet.json";

import {
  type Cache,
  type Item,
  searchIdols,
  searchGroups,
} from "../../lib/search";
import IdolView from "../item-view/idol";
import GroupView from "../item-view/group";
import { IdolQueryRoute, useRouter } from "../router/router";
import { sortsToProps } from "../../lib/sort";
import ItemSort from "./item-sort";

type ItemViewFn<T> = (item: T) => JSXElement;

// Recreate ItemList on route change to reset all previous state.
export default function SearchItemList(p: {
  profiles: Profiles;
  cache: Cache;
}) {
  const [view, _] = useRouter();
  const searchFn = () =>
    view.route() === IdolQueryRoute ? searchIdols : searchGroups;
  const allItems = createMemo(() =>
    searchFn()(view.query(), sortsToProps(view.sorts()), p.profiles, p.cache)
  );
  return createMemo(() => {
    const itemView =
      view.route() === IdolQueryRoute
        ? makeIdolItemView(p.cache)
        : makeGroupItemView(p.cache);
    return <ItemList allItems={allItems as any} itemView={itemView as any} />;
  }) as unknown as JSXElement;
}

export function MixedItemList(p: { allItems: Accessor<Item[]>; cache: Cache }) {
  const itemView = makeMixedItemView(p.cache);
  return <ItemList allItems={p.allItems} itemView={itemView} noSort />;
}

function ItemList<T>(p: {
  allItems: Accessor<T[]>;
  itemView: ItemViewFn<T>;
  noSort?: boolean;
}) {
  const [view, _] = useRouter();

  const SHOW_PER_PAGE = 15;
  const [showLastX, setShowLastX] = createSignal(SHOW_PER_PAGE);
  const [items, setItems] = createSignal<T[]>([]);

  createComputed((prev) => {
    if (prev && p.allItems() !== prev) {
      setShowLastX(SHOW_PER_PAGE);
    }
    setItems(p.allItems().slice(0, showLastX()));
    return p.allItems();
  });

  function nearBottom() {
    const el = document.documentElement;
    const pixelsToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    return pixelsToBottom <= 100;
  }
  function handleScroll(e: Event) {
    if (nearBottom() && showLastX() < p.allItems().length) {
      setShowLastX((x) => x + SHOW_PER_PAGE);
    }
  }
  onMount(() => document.addEventListener("scroll", handleScroll));
  onCleanup(() => document.removeEventListener("scroll", handleScroll));

  return (
    <Switch>
      <Match when={items().length}>
        <Show when={!p.noSort}>
          <ItemSort>
            {p.allItems().length} result{p.allItems().length > 1 ? "s" : ""}
          </ItemSort>
        </Show>
        <section id="items">
          <For each={items()}>{p.itemView}</For>
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

function makeIdolItemView(cache: Cache) {
  return (item: Idol) => <IdolView idol={item} cache={cache} />;
}

function makeGroupItemView(cache: Cache) {
  return (item: Group) => <GroupView group={item} cache={cache} />;
}

function makeMixedItemView(cache: Cache) {
  // all Idol items are guaranteed to have a groups property
  return (item: Item) =>
    (item as any).groups ? (
      <IdolView idol={item as Idol} cache={cache} />
    ) : (
      <GroupView group={item as Group} cache={cache} />
    );
}
