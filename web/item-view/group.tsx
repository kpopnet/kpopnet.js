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
} from "./common";
import IdolView from "./idol";

export default function GroupView(p: { group: Group; cache: Cache }) {
  const debutAgo = createMemo(() => getAge(p.group.debut_date || ""));
  const disbandAgo = createMemo(() => getAge(p.group.disband_date || ""));
  const idols = createMemo(() => p.cache.groupIdolsMap.get(p.group.id)!);
  return (
    <article class="grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-2.5 mb-cnt-next last:mb-0">
      <Preview url={p.group.thumb_url} id={p.group.id} />
      <section class="pl-5 text-[18px]">
        <div class="item__line_name">
          <span class="item__val_name">
            <Searchable k="id" id={p.group.id}>
              {p.group.name}
            </Searchable>
          </span>
          <LinkMenu urls={p.group.urls} />
        </div>
        <ItemLine name="Name">
          <Searchable k="g">{p.group.name}</Searchable> (
          <Searchable k="g">{p.group.name_original}</Searchable>)
        </ItemLine>
        <ItemLine name="Company">
          <CompanyView name={p.group.agency_name} />
        </ItemLine>
        <Show when={p.group.debut_date}>
          <ItemLine name="Debut date">
            <SearchableDate k="gdd" q={p.group.debut_date!} /> (
            <Searchable k="gda">{debutAgo()}</Searchable> year
            {debutAgo() === 1 ? "" : "s"} ago)
          </ItemLine>
        </Show>
        <Show when={p.group.disband_date}>
          <ItemLine name="Disband date">
            <SearchableDate k="gdbd" q={p.group.disband_date!} /> (
            <Searchable k="gdba">{disbandAgo()}</Searchable> year
            {disbandAgo() === 1 ? "" : "s"} ago)
          </ItemLine>
        </Show>
      </section>
      <GroupIdolsView idols={idols()} group={p.group} cache={p.cache} />
    </article>
  );
}

function CompanyView(p: { name: string }) {
  const companies = () => p.name.split(",").map((c) => c.trim());
  return (
    <For each={companies()}>
      {(c) => (
        <span class="peer peer-[]:before:content-[',_']">
          <Searchable k="c">{c}</Searchable>
        </span>
      )}
    </For>
  );
}
function GroupIdolsView(p: { idols: Idol[]; group: Group; cache: Cache }) {
  return (
    <section class="col-span-2 col-start-1 border-t border-[#d5d5d5] pt-2.5 pl-12">
      <For each={p.idols}>
        {(idol) => <IdolView idol={idol} group={p.group} cache={p.cache} />}
      </For>
    </section>
  );
}
