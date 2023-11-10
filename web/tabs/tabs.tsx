import { For } from "solid-js";

import {
  type Route,
  GroupQueryRoute,
  IdolQueryRoute,
  useRouter,
} from "../router/router";

interface Tab {
  name: string;
  route: Route;
}

function TabView(p: { tab: Tab; active: boolean; onClick: () => void }) {
  return (
    <a
      onClick={p.onClick}
      class="px-4 py-1 transition-[flex] duration-100 text-gray-500"
      classList={{
        "flex-1": p.active,
        "cursor-pointer text-link hover:text-link-hover bg-[#ddd]": !p.active,
      }}
    >
      {p.tab.name}
    </a>
  );
}

export default function TabsView() {
  const [route, query, goto] = useRouter();
  const tabs: Tab[] = [
    { name: "Idols", route: IdolQueryRoute },
    { name: "Groups", route: GroupQueryRoute },
  ];

  function setActive(tab: Tab) {
    // keep current query because it might be useful in other context
    goto(tab.route, query());
  }

  return (
    <section class="flex text-[25px] text-center select-none cursor-default">
      <For each={tabs}>
        {(tab) => (
          <TabView
            tab={tab}
            active={tab.route === route()}
            onClick={() => setActive(tab)}
          />
        )}
      </For>
    </section>
  );
}
