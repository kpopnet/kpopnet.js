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
} from "solid-js";
import { type SetStoreFunction, createStore } from "solid-js/store";
import type { Group, Idol, Profiles } from "kpopnet.json";

import {
  type Cache,
  type SortProp,
  searchIdols,
  searchGroups,
} from "../../lib/search";
import IdolView from "../item-view/idol";
import GroupView from "../item-view/group";
import { IdolQueryRoute, useRouter } from "../router/router";
import {
  IconAllOff,
  IconRevert,
  IconSave,
  IconSort,
  IconSortDown,
  IconSortUp,
} from "../icons/icons";
import { reorderArray } from "../../lib/utils";

export default function ItemList(p: { profiles: Profiles; cache: Cache }) {
  const SHOW_PER_PAGE = 20;
  const [route, query, __] = useRouter();
  const [showLastX, setShowLastX] = createSignal(SHOW_PER_PAGE);

  const defaultSorts = route() === IdolQueryRoute ? IDOL_SORTS : GROUP_SORTS;
  const [sorts, setSorts] = createStore<SortType[]>(defaultSorts);

  const searchFn = route() === IdolQueryRoute ? searchIdols : searchGroups;
  const allItems = createMemo(() =>
    searchFn(query(), toSortProps(sorts), p.profiles, p.cache)
  );
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
        <ItemSort sorts={sorts} setSorts={setSorts}>
          {allItems().length} result{allItems().length > 1 ? "s" : ""}
        </ItemSort>
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

interface SortType {
  id: string;
  name: string;
  enabled: boolean;
  reversed: boolean;
}

function toSortProps(sorts: SortType[]): SortProp[] {
  return sorts.filter((s) => s.enabled).map((s) => [s.id, s.reversed ? -1 : 1]);
}

// NOTE(Kagami): default sorts should be in sync with lib/search.ts and kpopnet.json!
const IDOL_SORTS: SortType[] = [
  { id: "birth_date", name: "Birth date", enabled: true, reversed: true },
  { id: "real_name", name: "Name", enabled: true, reversed: true },
  { id: "debut_date", name: "Debut date", enabled: false, reversed: true },
  { id: "height", name: "Height", enabled: false, reversed: false },
  { id: "weight", name: "Weight", enabled: false, reversed: false },
];
const GROUP_SORTS: SortType[] = [
  { id: "debut_date", name: "Debut date", enabled: true, reversed: true },
  { id: "name", name: "Group", enabled: true, reversed: true },
];

function ItemSort(p: {
  sorts: SortType[];
  setSorts: SetStoreFunction<SortType[]>;
  children: JSXElement;
}) {
  const [show, setShow] = createSignal(true);

  function updateSort(id: string, enabled: boolean, reversed: boolean) {
    const wasEnabled = p.sorts.find((s) => s.id === id)!.enabled;
    p.setSorts((s) => s.id === id, { enabled, reversed });
    // bump new enabled sort to the top
    if (!wasEnabled && enabled) {
      const fromIndex = p.sorts.findIndex((s) => s.id === id);
      p.setSorts(reorderArray(p.sorts, fromIndex, 0));
    }
  }

  function setNewOrder(fromId: string, toId: string) {
    if (fromId === toId) return;
    const fromIndex = p.sorts.findIndex((s) => s.id === fromId);
    const toIndex = p.sorts.findIndex((s) => s.id === toId);
    p.setSorts(reorderArray(p.sorts, fromIndex, toIndex));
  }

  // const handleGlobalClick = () => setShow(false);
  // onMount(() => document.addEventListener("click", handleGlobalClick));
  // onCleanup(() => document.removeEventListener("click", handleGlobalClick));

  return (
    <div
      class="relative text-center mt-2 mb-cnt-next text-kngray-1"
      // onClick={(e) => e.stopImmediatePropagation()}
    >
      <span>{p.children}</span>
      <IconSort
        class="icon inline-block ml-1 hover:text-link-hover
          cursor-pointer align-top"
        onClick={(e) => setShow(!show())}
      />
      <Show when={show()}>
        <div class="absolute z-10 w-full">
          <div class="rounded-lg shadow w-60 mx-auto mt-1 p-2 bg-gray-50 text-gray-700">
            <div class="flex justify-center gap-x-2">
              <IconRevert class="icon_control" />
              <IconAllOff class="icon_control" />
              <IconSave class="icon_control" />
            </div>
            <ul class="space-y-1">
              <For each={p.sorts}>
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
      class="flex items-center gap-x-1 cursor-grab"
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
      <div class="flex-1 text-left p-2 rounded hover:bg-gray-200">
        <label
          class="relative align-middle inline-flex cursor-pointer select-none"
          {...nonDraggable()}
        >
          <input
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
      </div>
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
      <Switch>
        <Match when={!p.sort.reversed}>
          <IconSortDown class="icon" />
        </Match>
        <Match when={p.sort.reversed}>
          <IconSortUp class="icon" />
        </Match>
      </Switch>
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
