import { For, Show, createMemo } from "solid-js";
import type { Group, GroupMember, Idol } from "kpopnet.json";

import { getIdolGroupMember, type Cache } from "../../lib/search";
import { getAge } from "../../lib/utils";
import {
  Preview,
  Searchable,
  SearchableDate,
  ItemLine,
  ItemName,
  NameAliasView,
} from "./common";
import Tooltip from "../tooltip/tooltip";

export default function IdolView(p: {
  idol: Idol;
  member?: GroupMember;
  cache: Cache;
}) {
  return (
    <article class="flex sm:gap-x-2.5 mb-cnt-next last:mb-0">
      <Preview url={p.idol.thumb_url} id={p.idol.id} />
      <IdolInfoView idol={p.idol} member={p.member} cache={p.cache} />
    </article>
  );
}

function IdolInfoView(p: { idol: Idol; member?: GroupMember; cache: Cache }) {
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
    return p.cache.idolGroupsMap.get(p.idol.id)!.map((group) => ({
      g: group,
      gm: getIdolGroupMember(p.idol, group, p.cache)!,
    }));
  });
  return (
    <section
      class="flex-1 min-w-0 border-[#d5d5d5]
        pl-1 sm:pl-5 text-sm sm:text-lg sm:border-l"
    >
      <ItemName id={p.idol.id} name={p.idol.name} urls={p.idol.urls}>
        <Show when={p.member?.roles}>
          <span class="text-base text-kngray-1 align-middle">
            {" "}
            ({p.member!.roles})
          </span>
        </Show>
      </ItemName>
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
      <NameAliasView alias={p.idol.name_alias} />
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
  );
}

interface IdolGroup {
  g: Group;
  gm: GroupMember;
}

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
  return (
    <Tooltip
      canShow={!!p.ig.gm.roles}
      content={p.ig.gm.roles!}
      classList={{
        "peer peer-[]:before:content-[',_']": p.other,
        "line-through hover:decoration-link-hover": !p.ig.gm.current,
      }}
    >
      <Searchable k="id" id={p.ig.g.id}>
        {p.ig.g.name}
      </Searchable>
    </Tooltip>
  );
}
