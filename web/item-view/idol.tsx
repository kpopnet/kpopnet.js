import {
  For,
  Show,
  createSignal,
  createMemo,
  JSXElement,
  createEffect,
  children,
} from "solid-js";
import type { Group, GroupMember, Idol } from "kpopnet.json";

import thumbFallbackUrl from "./no-preview.svg?url";
import { IconLink, IconExternalLink } from "../icons/icons";
import {
  getSortedIdolGroups,
  getIdolGroupMember,
  type Cache,
} from "../../lib/search";
import { getAge } from "../../lib/utils";
import {
  ItemRoute,
  QueryRoute,
  routeToUrlParam,
  useRouter,
} from "../main/router";

interface IdolProps {
  idol: Idol;
  cache: Cache;
}

// TODO(Kagami): cache renders, display:none in <For>?
export default function IdolView(p: IdolProps) {
  const thumbUrl = createMemo(() => p.idol.thumb_url || thumbFallbackUrl);
  const age = createMemo(() => getAge(p.idol.birth_date));
  const ago = createMemo(() => getAge(p.idol.debut_date || ""));
  const urls = createMemo(() =>
    p.idol.urls.filter((url) => !url.includes("net.kpop.re"))
  );
  const igroups = createMemo(() => {
    const sorted = getSortedIdolGroups(p.idol, p.cache);
    return sorted.map((group) => ({
      g: group,
      gm: getIdolGroupMember(p.idol, group, p.cache)!,
    }));
  });
  return (
    <article class="idol">
      <img class="idol__preview" src={thumbUrl()} loading="lazy" />
      <div class="idol__info">
        <div class="idol__info-line idol__name-line">
          <span class="idol__info-val">
            <Searchable k="id" id={p.idol.id}>
              {p.idol.name}
            </Searchable>
          </span>
          <LinkMenu urls={urls()} />
        </div>
        <p class="idol__info-line">
          <span class="idol__info-key">Name</span>
          <span class="idol__info-val">
            <Searchable k="n">{p.idol.name}</Searchable> (
            <Searchable k="n">{p.idol.name_original}</Searchable>)
          </span>
        </p>
        <p class="idol__info-line">
          <span class="idol__info-key">Real name</span>
          <span class="idol__info-val">
            <Searchable k="n">{p.idol.real_name}</Searchable> (
            <Searchable k="n">{p.idol.real_name_original}</Searchable>)
          </span>
        </p>
        <p class="idol__info-line">
          <span class="idol__info-key">Birthday</span>
          <span class="idol__info-val">
            <SearchableDate k="d" q={p.idol.birth_date} /> (
            <Searchable k="a">{age()}</Searchable>)
          </span>
        </p>
        <IdolGroupsView igroups={igroups()} />
        <Show when={p.idol.debut_date}>
          <p class="idol__info-line">
            <span class="idol__info-key">Debut date</span>
            <span class="idol__info-val">
              <SearchableDate k="dd" q={p.idol.debut_date!} /> (
              <Searchable k="da">{ago()}</Searchable> year
              {ago() === 1 ? "" : "s"} ago)
            </span>
          </p>
        </Show>
        <Show when={p.idol.height}>
          <p class="idol__info-line">
            <span class="idol__info-key">Height</span>
            <span class="idol__info-val">
              <Searchable k="h">{p.idol.height}</Searchable> cm
            </span>
          </p>
        </Show>
        <Show when={p.idol.weight}>
          <p class="idol__info-line">
            <span class="idol__info-key">Weight</span>
            <span class="idol__info-val">
              <Searchable k="w">{p.idol.weight}</Searchable> kg
            </span>
          </p>
        </Show>
      </div>
    </article>
  );
}

interface IdolGroup {
  g: Group;
  gm: GroupMember;
}

// TODO(Kagami): show roles/current info
function IdolGroupsView(p: { igroups: IdolGroup[] }) {
  return (
    <Show when={p.igroups.length}>
      <p class="idol__info-line">
        <span class="idol__info-key">Groups</span>
        <span class="idol__info-val">
          <IdolGroupView ig={p.igroups[0]} />
          <Show when={p.igroups.length > 1}>
            <span class="idol__groups-other">
              <For each={p.igroups.slice(1)}>
                {(ig) => <IdolGroupView ig={ig} other />}
              </For>
            </span>
          </Show>
        </span>
      </p>
    </Show>
  );
}

function IdolGroupView(p: { ig: IdolGroup; other?: boolean }) {
  return (
    <span
      classList={{
        idol__group: true,
        "idol__group-other": p.other,
        idol__group_inactive: !p.ig.gm.current,
      }}
    >
      {p.ig.g.name}
    </span>
  );
}

function Searchable(p: {
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
  const url = () => `?${urlParam()}=${newQuery().replace(/ /g, "+")}`;

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
    <a onClick={handleClick} href={url()} class="idol__info-search">
      {resolved()}
    </a>
  );
}

function SearchableDate(p: { k: string; q: string }) {
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

function LinkMenu(p: { urls: string[] }) {
  const [showMenu, setShowMenu] = createSignal(false);
  function getLinkName(url: string): string {
    if (url.includes("selca.kastden.org")) return "kastden";
    return "other";
  }
  return (
    <div
      class="idol__links"
      onMouseOver={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      <IconLink control class="idol__show-menu-control" />
      <Show when={showMenu()}>
        <div class="idol-links-menu">
          <For each={p.urls}>
            {(url) => (
              <a
                class="idol-links-menu__item"
                href={url}
                target="_blank"
                rel="noreferrer"
              >
                {getLinkName(url)}{" "}
                <IconExternalLink control class="idol-links-menu__control" />
              </a>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
