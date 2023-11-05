import { For, Show, createSignal, createMemo } from "solid-js";
import type { Group, GroupMember, Idol } from "kpopnet.json";

import thumbFallbackUrl from "./no-preview.svg?url";
import { IconLink, IconExternalLink } from "../icons/icons";
import {
  getSortedIdolGroups,
  getIdolGroupMember,
  type Cache,
} from "../../lib/search";
import { getAge, getAgo, validDate } from "../../lib/utils";

interface IdolProps {
  idol: Idol;
  cache: Cache;
}

// TODO(Kagami): cache renders, display:none in <For>?
export default function IdolView(p: IdolProps) {
  const [showMenu, setShowMenu] = createSignal(false);

  const thumbUrl = createMemo(() => p.idol.thumb_url || thumbFallbackUrl);
  const age = createMemo(() => getAge(p.idol.birth_date));
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

  function getLinkName(url: string): string {
    if (url.includes("selca.kastden.org")) return "kastden";
    return "other";
  }

  return (
    <article class="idol">
      <img class="idol__preview" src={thumbUrl()} loading="lazy" />
      <div class="idol__info">
        <div class="idol__info-line idol__name-line">
          <span class="idol__info-val">{p.idol.name}</span>
          <div
            class="idol__links dropdown"
            onMouseOver={() => setShowMenu(true)}
            onMouseLeave={() => setShowMenu(false)}
          >
            <IconLink class="icon_control idol__show-menu-control" />
            <Show when={showMenu()}>
              <div class="idol-links-menu dropdown-menu show">
                <For each={urls()}>
                  {(url) => (
                    <a
                      class="idol-links-menu__item dropdown-item"
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {getLinkName(url)}{" "}
                      <IconExternalLink class="idol-links-menu__control" />
                    </a>
                  )}
                </For>
              </div>
            </Show>
          </div>
        </div>
        <p class="idol__info-line">
          <span class="idol__info-key">Name</span>
          <span class="idol__info-val">
            {p.idol.name} ({p.idol.name_original})
          </span>
        </p>
        <p class="idol__info-line">
          <span class="idol__info-key">Real name</span>
          <span class="idol__info-val">
            {p.idol.real_name} ({p.idol.real_name_original})
          </span>
        </p>
        <p class="idol__info-line">
          <span class="idol__info-key">Birthday</span>
          <span class="idol__info-val">
            {p.idol.birth_date} ({age()})
          </span>
        </p>
        <IdolGroupsView igroups={igroups()} />
        <Show when={p.idol.debut_date && validDate(p.idol.debut_date)}>
          <p class="idol__info-line">
            <span class="idol__info-key">Debut date</span>
            <span class="idol__info-val">
              {p.idol.debut_date} ({getAgo(p.idol.debut_date!)})
            </span>
          </p>
        </Show>
        <Show when={p.idol.height}>
          <p class="idol__info-line">
            <span class="idol__info-key">Height</span>
            <span class="idol__info-val">{p.idol.height} cm</span>
          </p>
        </Show>
        <Show when={p.idol.weight}>
          <p class="idol__info-line">
            <span class="idol__info-key">Weight</span>
            <span class="idol__info-val">{p.idol.weight} kg</span>
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
