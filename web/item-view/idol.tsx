import { For, Show, createMemo, createSignal } from "solid-js";
import type { Group, GroupMember, Idol } from "kpopnet.json";

import {
  getSortedIdolGroups,
  getIdolGroupMember,
  type Cache,
} from "../../lib/search";
import { getAge } from "../../lib/utils";
import {
  Preview,
  LinkMenu,
  Searchable,
  SearchableDate,
  ItemLine,
} from "./common";
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
    <article class="flex gap-x-2.5 mb-cnt-next last:mb-0">
      <Preview url={p.idol.thumb_url} id={p.idol.id} />
      <section class="flex-1 pl-5 text-[18px] border-l border-[#d5d5d5]">
        <div class="item__line_name">
          <span class="item__val_name">
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
        <ItemLine name="Name">
          <Searchable k="n">{p.idol.name}</Searchable> (
          <Searchable k="n">{p.idol.name_original}</Searchable>)
        </ItemLine>
        <Show when={!unknownRealName()}>
          <ItemLine name="Real name">
            <Searchable k="n">{p.idol.real_name}</Searchable> (
            <Searchable k="n">{p.idol.real_name_original}</Searchable>)
          </ItemLine>
        </Show>
        <ItemLine name="Birthday">
          <SearchableDate k="d" q={p.idol.birth_date} /> (
          <Searchable k="a">{age()}</Searchable>)
        </ItemLine>
        <IdolGroupsView igroups={igroups()} />
        <Show when={p.idol.debut_date}>
          <ItemLine name="Debut date">
            <SearchableDate k="dd" q={p.idol.debut_date!} /> (
            <Searchable k="da">{ago()}</Searchable> year
            {ago() === 1 ? "" : "s"} ago)
          </ItemLine>
        </Show>
        <Show when={p.idol.height}>
          <ItemLine name="Height">
            <Searchable k="h">{p.idol.height}</Searchable> cm
          </ItemLine>
        </Show>
        <Show when={p.idol.weight}>
          <ItemLine name="Weight">
            <Searchable k="w">{p.idol.weight}</Searchable> kg
          </ItemLine>
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
      <ItemLine name="Groups">
        <Show when={mainGroup()}>
          <IdolGroupView ig={mainGroup()!} />
        </Show>
        <Show when={otherGroups().length}>
          {" ("}
          <For each={otherGroups()}>
            {(ig) => <IdolGroupView ig={ig} other />}
          </For>
          )
        </Show>
      </ItemLine>
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
        "peer peer-[]:before:content-[',_']": p.other,
        "line-through hover:decoration-link-hover": !p.ig.gm.current,
      }}
    >
      <Searchable k="id" id={p.ig.g.id}>
        {p.ig.g.name}
      </Searchable>
      <Tooltip show={showTooltip()}>{p.ig.gm.roles}</Tooltip>
    </span>
  );
}
