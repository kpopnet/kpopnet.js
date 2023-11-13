import { For, Show, createMemo } from "solid-js";
import type { Group, Idol } from "kpopnet.json";

import { type Cache } from "../../lib/search";
import { getAge } from "../../lib/utils";
import {
  Preview,
  LinkMenu,
  Searchable,
  SearchableDate,
  ItemLine,
  ItemName,
  NameAliasView,
} from "./common";
import IdolView from "./idol";

export function GroupWithIdolsView(p: { group: Group; cache: Cache }) {
  const idols = createMemo(() => p.cache.groupIdolsMap.get(p.group.id)!);
  return (
    <article class="flex flex-col gap-y-2.5">
      <GroupView group={p.group} cache={p.cache} withIdols />
      <GroupIdolsView idols={idols()} group={p.group} cache={p.cache} />
    </article>
  );
}

function GroupView(p: { group: Group; cache: Cache; withIdols?: boolean }) {
  return (
    <article
      class="flex gap-x-2.5"
      classList={{ "mb-cnt-next last:mb-0": !p.withIdols }}
    >
      <Preview url={p.group.thumb_url} id={p.group.id} />
      <GroupInfoView group={p.group} cache={p.cache} withIdols={p.withIdols} />
    </article>
  );
}
export default GroupView;

function GroupInfoView(p: { group: Group; cache: Cache; withIdols?: boolean }) {
  const debutAgo = createMemo(() => getAge(p.group.debut_date || ""));
  const disbandAgo = createMemo(() => getAge(p.group.disband_date || ""));
  return (
    <section
      class="flex-1 min-w-0
        pl-1 sm:pl-5 text-sm sm:text-lg"
      classList={{ "sm:border-l border-[#d5d5d5]": !p.withIdols }}
    >
      <ItemName id={p.group.id} name={p.group.name} urls={p.group.urls} />
      <ItemLine name="Group">
        <Searchable k="g" gq>
          {p.group.name}
        </Searchable>{" "}
        (
        <Searchable k="g" gq>
          {p.group.name_original}
        </Searchable>
        )
      </ItemLine>
      <NameAliasView alias={p.group.name_alias} gq />
      <ItemLine name="Company">
        <CompanyView name={p.group.agency_name} />
      </ItemLine>
      <Show when={p.group.debut_date}>
        <ItemLine name="Debut date">
          <SearchableDate k="dd" q={p.group.debut_date!} gq /> (
          <Searchable k="da" gq>
            {debutAgo()}
          </Searchable>{" "}
          year
          {debutAgo() === 1 ? "" : "s"} ago)
        </ItemLine>
      </Show>
      <Show when={p.group.disband_date}>
        <ItemLine name="Disband date">
          <SearchableDate k="dbd" q={p.group.disband_date!} gq /> (
          <Searchable k="dba" gq>
            {disbandAgo()}
          </Searchable>{" "}
          year
          {disbandAgo() === 1 ? "" : "s"} ago)
        </ItemLine>
      </Show>
      <Show when={p.group.members.length}>
        <ItemLine name="Members">
          <Searchable k="m" gq>
            {p.group.members.length}
          </Searchable>{" "}
        </ItemLine>
      </Show>
    </section>
  );
}

function CompanyView(p: { name: string }) {
  const companies = () => p.name.split(",").map((c) => c.trim());
  return (
    <For each={companies()}>
      {(c) => (
        <span class="peer peer-[]:before:content-[',_']">
          <Searchable k="c" gq>
            {c}
          </Searchable>
        </span>
      )}
    </For>
  );
}

function GroupIdolsView(p: { idols: Idol[]; group: Group; cache: Cache }) {
  return (
    <section class="col-span-2 col-start-1 border-t border-[#d5d5d5] pt-2.5 sm:pl-12">
      <For each={p.idols}>
        {(idol) => <IdolView idol={idol} group={p.group} cache={p.cache} />}
      </For>
    </section>
  );
}
