import { For, createMemo, onCleanup, onMount } from "solid-js";

import {
  type Route,
  GroupQueryRoute,
  IdolQueryRoute,
  JQRoute,
  PQRoute,
  useRouter,
  queryRoute,
} from "../router/router";

interface Tab {
  name: string;
  route: Route;
}

function TabView(p: {
  tab: Tab;
  idx: number;
  activeIdx: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <a
      onClick={p.onClick}
      class="px-4 py-1 transition-[flex] duration-100 text-gray-500 border-kngray-1"
      classList={{
        "border-l": p.activeIdx > p.idx || p.activeIdx < p.idx - 1,
        "last:border-r": !p.active,
        "flex-1": p.active,
        "cursor-pointer text-link hover:text-link-hover bg-[#ddd]": !p.active,
      }}
    >
      {p.tab.name}
    </a>
  );
}

export default function TabsView() {
  const [view, setView] = useRouter();
  const tabs: Tab[] = [
    { name: "Idols", route: IdolQueryRoute },
    { name: "Groups", route: GroupQueryRoute },
    { name: "Filter", route: JQRoute },
    { name: "Plot", route: PQRoute },
  ];
  const tabRoutes = tabs.map((tab) => tab.route);
  const activeIdx = createMemo(() => tabRoutes.indexOf(view.route()));

  function setActive({ route }: Tab) {
    const keepQuery = queryRoute(route) && queryRoute(view.route());
    const query = keepQuery ? view.query() : "";
    setView({ route, query });
  }

  function handleGlobalHotkeys(e: KeyboardEvent) {
    if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && e.ctrlKey) {
      e.preventDefault();
      const shift = e.key === "ArrowRight" ? 1 : -1;
      let nextIdx = tabRoutes.indexOf(view.route()) + shift;
      if (nextIdx < 0) {
        nextIdx = tabRoutes.length - 1;
      } else if (nextIdx >= tabRoutes.length) {
        nextIdx = 0;
      }
      setActive(tabs[nextIdx]);
    }
  }

  onMount(() => {
    document.addEventListener("keydown", handleGlobalHotkeys);
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleGlobalHotkeys);
  });

  return (
    <section
      class="flex text-[20px] sm:text-[25px]
      text-center select-none cursor-default"
    >
      <For each={tabs}>
        {(tab, i) => (
          <TabView
            tab={tab}
            idx={i()}
            activeIdx={activeIdx()}
            active={activeIdx() === i()}
            onClick={() => setActive(tab)}
          />
        )}
      </For>
    </section>
  );
}
