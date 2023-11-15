import { For, type JSXElement, Show, createMemo, createSignal } from "solid-js";
import type { Group, GroupMember, Idol } from "kpopnet.json";

import { type Cache } from "../../lib/search";
import { getAge } from "../../lib/utils";
import {
  Preview,
  Searchable,
  SearchableDate,
  ItemLine,
  ItemName,
  NameAliasView,
} from "./common";
import IdolView from "./idol";
import { IconSection } from "../icons/icons";

export function GroupWithIdolsView(p: { group: Group; cache: Cache }) {
  return (
    <article class="flex flex-col gap-y-cnt-next">
      <GroupView group={p.group} cache={p.cache} withIdols />
      <GroupUnitsView group={p.group} cache={p.cache} />
      <GroupIdolsView group={p.group} cache={p.cache} />
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
  const numActiveMembers = createMemo(
    () => p.group.members.filter((m) => m.current).length
  );
  const parentName = createMemo(() =>
    p.group.parent_id ? p.cache.groupMap.get(p.group.parent_id)!.name : ""
  );
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
      <Show when={p.group.parent_id}>
        <ItemLine name="Main group">
          <Searchable k="id" id={p.group.parent_id!}>
            {parentName()}
          </Searchable>
        </ItemLine>
      </Show>
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
          </Searchable>
          <Show when={p.group.members.length !== numActiveMembers()}>
            {" "}
            ({numActiveMembers()} active)
          </Show>
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

function GroupUnitsView(p: { group: Group; cache: Cache }) {
  const units = createMemo(() => p.cache.groupUnitsMap.get(p.group.id)!);
  return (
    <Show when={units().length}>
      <GroupSection name={` Subunits (${units().length})`} collapsed>
        <For each={units()}>
          {(group) => <GroupView group={group} cache={p.cache} />}
        </For>
      </GroupSection>
    </Show>
  );
}

function GroupIdolsView(p: { group: Group; cache: Cache }) {
  const mToI = (m: GroupMember) => ({ i: p.cache.idolMap.get(m.id)!, gm: m });
  const activeMembers = createMemo(() =>
    p.group.members.filter((m) => m.current).map(mToI)
  );
  const formerMembers = createMemo(() =>
    p.group.members.filter((m) => !m.current).map(mToI)
  );
  return (
    <>
      <Show when={activeMembers().length}>
        <GroupIdolsSection
          name="Members"
          gidols={activeMembers()}
          cache={p.cache}
        />
      </Show>
      <Show when={formerMembers().length}>
        <GroupIdolsSection
          name="Former members"
          gidols={formerMembers()}
          cache={p.cache}
        />
      </Show>
    </>
  );
}

interface GroupIdol {
  i: Idol;
  gm: GroupMember;
}

function GroupIdolsSection(p: {
  name: string;
  gidols: GroupIdol[];
  cache: Cache;
}) {
  return (
    <GroupSection name={` ${p.name} (${p.gidols.length})`}>
      <For each={p.gidols}>
        {({ i, gm }) => <IdolView idol={i} member={gm} cache={p.cache} />}
      </For>
    </GroupSection>
  );
}

function GroupSection(p: {
  collapsed?: boolean;
  name: string;
  children: JSXElement;
}) {
  const [show, setShow] = createSignal(!p.collapsed);
  return (
    <section class="border-t-2 border-dashed border-[#d5d5d5] ">
      <div class="text-[25px]">
        <IconSection
          class="icon_text_control w-[45px] h-[45px] inline-block"
          onClick={() => setShow(!show())}
        />
        <span class="align-middle text-neutral-400 select-none">{p.name}</span>
      </div>
      <Show when={show()}>
        <div class="sm:ml-12 mt-4">{p.children}</div>
      </Show>
    </section>
  );
}
