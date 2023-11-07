import { For, Show, createMemo } from "solid-js";
import type { Group, GroupMember, Idol } from "kpopnet.json";

import thumbFallbackUrl from "./no-preview.svg?url";
import {
  getSortedIdolGroups,
  getIdolGroupMember,
  type Cache,
} from "../../lib/search";
import { getAge } from "../../lib/utils";
import { LinkMenu, Searchable, SearchableDate } from "./common";

// TODO(Kagami): cache renders, display:none in <For>?
export default function IdolView(p: { idol: Idol; cache: Cache }) {
  const thumbUrl = createMemo(() => p.idol.thumb_url || thumbFallbackUrl);
  const age = createMemo(() => getAge(p.idol.birth_date));
  const ago = createMemo(() => getAge(p.idol.debut_date || ""));
  const igroups = createMemo(() => {
    const sorted = getSortedIdolGroups(p.idol, p.cache);
    return sorted.map((group) => ({
      g: group,
      gm: getIdolGroupMember(p.idol, group, p.cache)!,
    }));
  });
  return (
    <article class="item idol">
      <img class="item__preview" src={thumbUrl()} loading="lazy" />
      <div class="item__info">
        <div class="item__info-line item__name-line">
          <span class="item__info-val">
            <Searchable k="id" id={p.idol.id}>
              {p.idol.name}
            </Searchable>
          </span>
          <LinkMenu urls={p.idol.urls} />
        </div>
        <p class="item__info-line">
          <span class="item__info-key">Name</span>
          <span class="item__info-val">
            <Searchable k="n">{p.idol.name}</Searchable> (
            <Searchable k="n">{p.idol.name_original}</Searchable>)
          </span>
        </p>
        <p class="item__info-line">
          <span class="item__info-key">Real name</span>
          <span class="item__info-val">
            <Searchable k="n">{p.idol.real_name}</Searchable> (
            <Searchable k="n">{p.idol.real_name_original}</Searchable>)
          </span>
        </p>
        <p class="item__info-line">
          <span class="item__info-key">Birthday</span>
          <span class="item__info-val">
            <SearchableDate k="d" q={p.idol.birth_date} /> (
            <Searchable k="a">{age()}</Searchable>)
          </span>
        </p>
        <IdolGroupsView igroups={igroups()} />
        <Show when={p.idol.debut_date}>
          <p class="item__info-line">
            <span class="item__info-key">Debut date</span>
            <span class="item__info-val">
              <SearchableDate k="dd" q={p.idol.debut_date!} /> (
              <Searchable k="da">{ago()}</Searchable> year
              {ago() === 1 ? "" : "s"} ago)
            </span>
          </p>
        </Show>
        <Show when={p.idol.height}>
          <p class="item__info-line">
            <span class="item__info-key">Height</span>
            <span class="item__info-val">
              <Searchable k="h">{p.idol.height}</Searchable> cm
            </span>
          </p>
        </Show>
        <Show when={p.idol.weight}>
          <p class="item__info-line">
            <span class="item__info-key">Weight</span>
            <span class="item__info-val">
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
      <p class="item__info-line">
        <span class="item__info-key">Groups</span>
        <span class="item__info-val">
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
        idol__group_other: p.other,
        idol__group_inactive: !p.ig.gm.current,
      }}
    >
      <Searchable k="id" id={p.ig.g.id}>
        {p.ig.g.name}
      </Searchable>
    </span>
  );
}
