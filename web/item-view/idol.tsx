import { For, Show, createMemo, createSignal } from "solid-js";
import type { Group, GroupMember, Idol } from "kpopnet.json";

import {
  getSortedIdolGroups,
  getIdolGroupMember,
  type Cache,
} from "../../lib/search";
import { getAge } from "../../lib/utils";
import { Preview, LinkMenu, Searchable, SearchableDate } from "./common";
import Tooltip from "../tooltip/tooltip";

// TODO(Kagami): cache renders, display:none in <For>?
export default function IdolView(p: {
  idol: Idol;
  group?: Group;
  cache: Cache;
}) {
  const age = createMemo(() => getAge(p.idol.birth_date));
  const ago = createMemo(() => getAge(p.idol.debut_date || ""));
  // Normally every idol should have it so it's required key in JSON.
  // But they're few exceptions.
  const unknownRealName = createMemo(
    () =>
      p.idol.real_name.startsWith("unknown_") ||
      p.idol.real_name_original.startsWith("unknown_")
  );
  const igroups = createMemo(() => {
    const sorted = getSortedIdolGroups(p.idol, p.cache);
    return sorted.map((group) => ({
      g: group,
      gm: getIdolGroupMember(p.idol, group, p.cache)!,
    }));
  });
  const gmContext = p.group
    ? getIdolGroupMember(p.idol, p.group, p.cache)
    : null;
  return (
    <article class="item idol">
      <Preview url={p.idol.thumb_url} id={p.idol.id} />
      <section class="item__info">
        <div class="item__line item__line_name">
          <span class="item__val item__val_name">
            <Searchable k="id" id={p.idol.id}>
              {p.idol.name}
            </Searchable>
            <Show when={gmContext?.roles}>
              <span class="text-base text-kngray-1 align-middle">
                {" "}
                ({gmContext!.roles})
              </span>
            </Show>
          </span>
          <LinkMenu urls={p.idol.urls} />
        </div>
        <p class="item__line">
          <span class="item__key">Name</span>
          <span class="item__val">
            <Searchable k="n">{p.idol.name}</Searchable> (
            <Searchable k="n">{p.idol.name_original}</Searchable>)
          </span>
        </p>
        <Show when={!unknownRealName()}>
          <p class="item__line">
            <span class="item__key">Real name</span>
            <span class="item__val">
              <Searchable k="n">{p.idol.real_name}</Searchable> (
              <Searchable k="n">{p.idol.real_name_original}</Searchable>)
            </span>
          </p>
        </Show>
        <p class="item__line">
          <span class="item__key">Birthday</span>
          <span class="item__val">
            <SearchableDate k="d" q={p.idol.birth_date} /> (
            <Searchable k="a">{age()}</Searchable>)
          </span>
        </p>
        <IdolGroupsView igroups={igroups()} />
        <Show when={p.idol.debut_date}>
          <p class="item__line">
            <span class="item__key">Debut date</span>
            <span class="item__val">
              <SearchableDate k="dd" q={p.idol.debut_date!} /> (
              <Searchable k="da">{ago()}</Searchable> year
              {ago() === 1 ? "" : "s"} ago)
            </span>
          </p>
        </Show>
        <Show when={p.idol.height}>
          <p class="item__line">
            <span class="item__key">Height</span>
            <span class="item__val">
              <Searchable k="h">{p.idol.height}</Searchable> cm
            </span>
          </p>
        </Show>
        <Show when={p.idol.weight}>
          <p class="item__line">
            <span class="item__key">Weight</span>
            <span class="item__val">
              <Searchable k="w">{p.idol.weight}</Searchable> kg
            </span>
          </p>
        </Show>
      </section>
    </article>
  );
}

interface IdolGroup {
  g: Group;
  gm: GroupMember;
}

// TODO(Kagami): show roles/current info
function IdolGroupsView(p: { igroups: IdolGroup[] }) {
  const mainGroup = createMemo(() =>
    p.igroups.length && p.igroups[0].gm.current ? p.igroups[0] : null
  );
  const otherGroups = createMemo(() =>
    mainGroup() ? p.igroups.slice(1) : p.igroups
  );
  return (
    <Show when={p.igroups.length}>
      <p class="item__line">
        <span class="item__key">Groups</span>
        <span class="item__val">
          <Show when={mainGroup()}>
            <IdolGroupView ig={mainGroup()!} />
          </Show>
          <Show when={otherGroups().length}>
            <span class="idol__groups-other">
              <For each={otherGroups()}>
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
  const [showTooltip, setShowTooltip] = createSignal(false);
  return (
    <span
      onMouseEnter={() => setShowTooltip(!!p.ig.gm.roles)}
      onMouseLeave={() => setShowTooltip(false)}
      class="relative"
      classList={{
        idol__group: true,
        idol__group_other: p.other,
        idol__group_inactive: !p.ig.gm.current,
      }}
    >
      <Searchable k="id" id={p.ig.g.id}>
        {p.ig.g.name}
      </Searchable>
      <Tooltip show={showTooltip()}>{p.ig.gm.roles}</Tooltip>
    </span>
  );
}
