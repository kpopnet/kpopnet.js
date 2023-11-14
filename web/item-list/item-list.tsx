/**
 * Filterable item list.
 */

import {
  type JSX,
  type JSXElement,
  Switch,
  Match,
  For,
  createMemo,
  onMount,
  onCleanup,
  createSignal,
  Show,
  on,
} from "solid-js";
import type { Group, Idol, Profiles } from "kpopnet.json";

import { type Cache, searchIdols, searchGroups } from "../../lib/search";
import IdolView from "../item-view/idol";
import GroupView from "../item-view/group";
import { IdolQueryRoute, useRouter, routeToItemType } from "../router/router";
import {
  IconOff,
  IconRevert,
  IconSave,
  IconSort,
  IconSortDown,
  IconSortUp,
} from "../icons/icons";
import { reorderArray } from "../../lib/utils";
import {
  type SortType,
  removeSorts,
  saveSorts,
  sortsToProps,
  getDefaultSortsCopy,
  isDefaultSorts,
} from "../../lib/sort";

// Recreate ItemList on route change to reset all previous state.
export default function ItemListWrapper(p: {
  profiles: Profiles;
  cache: Cache;
}) {
  const [view, _] = useRouter();
  return createMemo(
    on(view.route, () => <ItemList profiles={p.profiles} cache={p.cache} />)
  ) as unknown as JSX.Element;
}

function ItemList(p: { profiles: Profiles; cache: Cache }) {
  const SHOW_PER_PAGE = 20;
  const [view, _] = useRouter();
  const [showLastX, setShowLastX] = createSignal(SHOW_PER_PAGE);

  const allItems = createMemo(() => {
    setShowLastX(SHOW_PER_PAGE); // reset on query change
    const searchFn =
      view.route() === IdolQueryRoute ? searchIdols : searchGroups;
    return searchFn(
      view.query(),
      sortsToProps(view.sorts()),
      p.profiles,
      p.cache
    );
  });
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
        <ItemSort>
          {allItems().length} result{allItems().length > 1 ? "s" : ""}
        </ItemSort>
        <section id="items">
          <For each={items()}>
            {(item) =>
              view.route() === IdolQueryRoute ? (
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

function ItemSort(p: { children: JSXElement }) {
  const [view, setView] = useRouter();
  const [show, setShow] = createSignal(false);

  const sortItemType = () => routeToItemType(view.route());
  const nonDefaultSorts = createMemo(
    () => !isDefaultSorts(sortItemType(), view.sorts())
  );

  function updateSort(id: string, enabled: boolean, reversed: boolean) {
    let sorts = view.sorts();
    const fromIndex = sorts.findIndex((s) => s.id === id);
    const wasEnabled = sorts[fromIndex].enabled;
    // TODO(Kagami): use Store for fine-grained updates?
    sorts = sorts.map((s) => (s.id !== id ? s : { ...s, enabled, reversed }));
    if (!wasEnabled && enabled) {
      // bump new enabled sort to the top
      sorts = reorderArray(sorts, fromIndex, 0);
    }
    setView({ sorts });
  }

  function setNewOrder(fromId: string, toId: string) {
    if (fromId === toId) return;
    let sorts = view.sorts();
    const fromIndex = sorts.findIndex((s) => s.id === fromId);
    const toIndex = sorts.findIndex((s) => s.id === toId);
    sorts = reorderArray(sorts, fromIndex, toIndex);
    setView({ sorts });
  }

  function handleReset() {
    const sorts = getDefaultSortsCopy(sortItemType());
    setView({ sorts });
    removeSorts(sortItemType());
  }

  function handleAllOff() {
    let sorts = view.sorts();
    sorts = sorts.map((s) => ({ ...s, enabled: false }));
    setView({ sorts });
  }

  function handleSave() {
    saveSorts(sortItemType(), view.sorts());
  }

  return (
    <div
      class="relative text-center mt-2 text-kngray-1"
      classList={{ "mb-cnt-next": !show(), "mb-4": show() }}
    >
      <span>{p.children}</span>
      <IconSort
        class="icon inline-block ml-1 hover:text-link-hover
          cursor-pointer align-top"
        classList={{ "text-link": nonDefaultSorts() }}
        onClick={(e) => setShow(!show())}
      />
      <Show when={show()}>
        <div class="border border-kngray-1 w-60 mx-auto mt-1 p-2 bg-transparent text-gray-700">
          <div class="flex justify-center gap-x-4 mb-2">
            <IconOff class="icon_control" onClick={handleAllOff} />
            <IconRevert class="icon_control" onClick={handleReset} />
            <IconSave class="icon_control" onClick={handleSave} />
          </div>
          <ul class="space-y-1">
            <For each={view.sorts()}>
              {(sort) => (
                <SortLine
                  sort={sort}
                  updateSort={updateSort}
                  setNewOrder={setNewOrder}
                />
              )}
            </For>
          </ul>
        </div>
      </Show>
    </div>
  );
}

type UpdateSortFn = (id: string, enabled: boolean, reversed: boolean) => void;

function SortLine(p: {
  sort: SortType;
  updateSort: UpdateSortFn;
  setNewOrder: (fromId: string, toId: string) => void;
}) {
  return (
    <li
      class="flex items-center justify-between p-2 rounded hover:bg-gray-200 cursor-grab"
      draggable="true"
      onDragStart={(e) => {
        e.dataTransfer!.setData("text", p.sort.id);
      }}
      onDragOver={(e) => {
        e.preventDefault(); // allow drop
        e.dataTransfer!.dropEffect = "move";
      }}
      onDrop={(e) => {
        const fromId = e.dataTransfer!.getData("text");
        const toId = p.sort.id;
        p.setNewOrder(fromId, toId);
      }}
    >
      <label
        class="relative flex cursor-pointer select-none"
        {...nonDraggable()}
      >
        <input
          name="sort"
          type="checkbox"
          class="hidden peer"
          checked={p.sort.enabled}
          onChange={() =>
            p.updateSort(p.sort.id, !p.sort.enabled, p.sort.reversed)
          }
        />
        <div
          class="w-9 h-5 bg-gray-300 rounded-full peer
            peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:bg-link-hover
            after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white
            after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"
        />
        <span class="ms-3 text-sm font-medium text-gray-900">
          {p.sort.name}
        </span>
      </label>
      <SortDirection sort={p.sort} updateSort={p.updateSort} />
    </li>
  );
}

function SortDirection(p: { sort: SortType; updateSort: UpdateSortFn }) {
  return (
    <a
      class="cursor-pointer hover:text-link-hover"
      onClick={() => p.updateSort(p.sort.id, p.sort.enabled, !p.sort.reversed)}
      {...nonDraggable()}
    >
      <Show when={p.sort.reversed} fallback={<IconSortDown class="icon" />}>
        <IconSortUp class="icon" />
      </Show>
    </a>
  );
}

function nonDraggable<T>(): JSX.HTMLAttributes<T> {
  return {
    draggable: "true",
    onDragStart: (e: DragEvent) => {
      e.preventDefault(); // disable drag
    },
  };
}
