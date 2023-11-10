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
  QueryRoute,
  routeToUrlParam,
  useRouter,
} from "../router/router";
import { IconExternalLink, IconLink } from "../icons/icons";
import thumbFallbackUrl from "./no-preview.svg?url";

export function Preview(p: { id: string; url: string | null }) {
  const thumbUrl = createMemo(() => p.url || thumbFallbackUrl);
  return (
    <Searchable k="id" id={p.id}>
      <img
        class="w-[250px] h-[250px] object-contain select-none"
        src={thumbUrl()}
        loading="lazy"
      />
    </Searchable>
  );
}

export function ItemLine(p: { name: string; children: JSXElement }) {
  return (
    <p class="flex">
      <span class="flex-[0_0_120px] text-[#bbb] break-words after:content-[':']">
        {p.name}
      </span>
      <span class="break-words">{p.children}</span>
    </p>
  );
}

export function Searchable(p: {
  k: string;
  id?: string;
  q?: string;
  children: JSXElement;
}) {
  const [_, __, goto] = useRouter();
  const resolved = children(() => p.children);
  const newRoute = () => (p.k === "id" ? ItemRoute : QueryRoute);
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
    goto(newRoute(), newQuery());
  }

  return (
    <a
      onClick={handleClick}
      href={url()}
      class="text-body no-underline hover:cursor-pointer hover:text-link-hover"
    >
      {resolved()}
    </a>
  );
}

export function SearchableDate(p: { k: string; q: string }) {
  const y = createMemo(() => p.q.split("-")[0]);
  const m = createMemo(() => p.q.split("-")[1]);
  const d = createMemo(() => p.q.split("-")[2]);
  return (
    <>
      <Searchable k={p.k} q={y()}>
        {y()}
      </Searchable>
      <Show when={m() !== "00"}>
        -
        <Searchable k={p.k} q={y() + "-" + m()}>
          {m()}
        </Searchable>
        <Show when={d() !== "00"}>
          -
          <Searchable k={p.k} q={p.q}>
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
      <IconLink class="icon_control inline-block align-baseline" />
      <Show when={showMenu()}>
        <div class="absolute bg-body-bg border border-kngray-1 top-0 right-0 py-2.5 px-4">
          <For each={urls()}>
            {(url) => (
              <a
                class="link whitespace-nowrap"
                href={url}
                target="_blank"
                rel="noreferrer"
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
