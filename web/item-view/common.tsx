import {
  For,
  JSXElement,
  Show,
  children,
  createMemo,
  createSignal,
} from "solid-js";

import {
  ItemRoute,
  IdolQueryRoute,
  routeToUrlParam,
  useRouter,
  GroupQueryRoute,
} from "../router/router";
import { IconExternalLink, IconLink } from "../icons/icons";
import thumbFallbackUrl from "./no-preview.svg?url";

export function Preview(p: { id: string; url: string | null }) {
  const thumbUrl = createMemo(() => p.url || thumbFallbackUrl);
  return (
    <Searchable k="id" id={p.id} class="flex-shrink-0">
      <img
        class="w-[150px] h-[150px]
        sm:w-[250px] sm:h-[250px]
        object-contain select-none"
        src={thumbUrl()}
        loading="lazy"
      />
    </Searchable>
  );
}

export function ItemName(p: {
  id: string;
  name: string;
  urls: string[];
  children?: JSXElement;
}) {
  return (
    <div
      class="flex mb-1 sm:mb-3
        border-b-2 sm:border-b-4 border-[#6b6c9a]"
    >
      <span class="flex-1 text-[20px] sm:text-[30px]">
        <Searchable k="id" id={p.id}>
          {p.name}
        </Searchable>
        {p.children}
      </span>
      <LinkMenu urls={p.urls} />
    </div>
  );
}

export function ItemLine(p: { name: string; children: JSXElement }) {
  return (
    <div class="flex">
      <span
        class="text-[#bbb] after:content-[':_'] after:whitespace-pre
        flex-[0_0_80px] sm:flex-[0_0_120px]"
      >
        {p.name}
      </span>
      <span
        // ok to hide on small screen because we won't show tooltip
        class="max-sm:overflow-hidden max-sm:whitespace-nowrap max-sm:text-ellipsis"
      >
        {p.children}
      </span>
    </div>
  );
}

export function Searchable(p: {
  k: string;
  id?: string;
  q?: string;
  gq?: boolean /** indicate group query */;
  class?: string;
  children: JSXElement;
}) {
  const [_, setView] = useRouter();
  const resolved = children(() => p.children);
  const newRoute = () => {
    if (p.k === "id") return ItemRoute;
    return p.gq ? GroupQueryRoute : IdolQueryRoute;
  };
  const newQuery = () => (p.k === "id" ? p.id! : p.k + ":" + normalizeQuery());
  const urlParam = () => routeToUrlParam(newRoute());
  const url = createMemo(
    () => `?${urlParam()}=${newQuery().replace(/ /g, "+")}`
  );

  function normalizeQuery() {
    if (p.q) return p.q;
    let q = resolved()!;
    if (p.k === "w" || p.k === "h") q = Math.floor(+q);
    return q.toString();
  }

  function handleClick(e: MouseEvent) {
    e.preventDefault();
    setView({ route: newRoute(), query: newQuery() });
  }

  return (
    <a
      onClick={handleClick}
      href={url()}
      class="text-body no-underline hover:cursor-pointer hover:text-link-hover"
      classList={{ [p.class ?? ""]: true }}
    >
      {resolved()}
    </a>
  );
}

export function SearchableDate(p: { k: string; q: string; gq?: boolean }) {
  const y = createMemo(() => p.q.split("-")[0]);
  const m = createMemo(() => p.q.split("-")[1]);
  const d = createMemo(() => p.q.split("-")[2]);
  return (
    <>
      <Searchable k={p.k} q={y()} gq={p.gq}>
        {y()}
      </Searchable>
      <Show when={m() !== "00"}>
        -
        <Searchable k={p.k} q={y() + "-" + m()} gq={p.gq}>
          {m()}
        </Searchable>
        <Show when={d() !== "00"}>
          -
          <Searchable k={p.k} q={p.q} gq={p.gq}>
            {d()}
          </Searchable>
        </Show>
      </Show>
    </>
  );
}

export function LinkMenu(p: { urls: string[] }) {
  const [showMenu, setShowMenu] = createSignal(false);
  const urls = createMemo(() =>
    // we already have direct link to item in UI
    p.urls.filter((url) => !url.includes("net.kpop.re"))
  );
  function getLinkName(url: string): string {
    if (url.includes("selca.kastden.org")) return "kastden";
    return "other";
  }
  return (
    <div
      class="self-end relative"
      onMouseOver={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      <IconLink class="icon_control inline-block sm:align-baseline" />
      <Show when={showMenu()}>
        <div class="absolute bg-body-bg border border-kngray-1 top-0 right-0 py-2.5 px-4">
          <For each={urls()}>
            {(url) => (
              <a
                class="link whitespace-nowrap"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {getLinkName(url)}{" "}
                <IconExternalLink class="icon_small inline-block align-baseline" />
              </a>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}

export function NameAliasView(p: { alias: string | null; gq?: boolean }) {
  const names = () => p.alias!.split(",").map((c) => c.trim());
  return (
    <Show when={p.alias}>
      <ItemLine name="Other names">
        <For each={names()}>
          {(name) => (
            <span class="peer peer-[]:before:content-[',_']">
              <Searchable k={p.gq ? "g" : "n"} gq={p.gq}>
                {name}
              </Searchable>
            </span>
          )}
        </For>
      </ItemLine>
    </Show>
  );
}
