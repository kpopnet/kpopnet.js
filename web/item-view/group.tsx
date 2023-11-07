import { Show, createMemo } from "solid-js";
import type { Group, GroupMember, Idol } from "kpopnet.json";

import thumbFallbackUrl from "./no-preview.svg?url";
import {
  getSortedIdolGroups,
  getIdolGroupMember,
  type Cache,
} from "../../lib/search";
import { getAge } from "../../lib/utils";
import { LinkMenu, Searchable, SearchableDate } from "./common";

export default function GroupView(p: { group: Group; cache: Cache }) {
  const thumbUrl = createMemo(() => p.group.thumb_url || thumbFallbackUrl);
  const debutAgo = createMemo(() => getAge(p.group.debut_date || ""));
  const disbandAgo = createMemo(() => getAge(p.group.disband_date || ""));
  return (
    <article class="item group">
      <img class="item__preview" src={thumbUrl()} loading="lazy" />
      <div class="item__info">
        <div class="item__info-line item__name-line">
          <span class="item__info-val">
            <Searchable k="id" id={p.group.id}>
              {p.group.name}
            </Searchable>
          </span>
          <LinkMenu urls={p.group.urls} />
        </div>
        <p class="item__info-line">
          <span class="item__info-key">Name</span>
          <span class="item__info-val">
            <Searchable k="g">{p.group.name}</Searchable> (
            <Searchable k="g">{p.group.name_original}</Searchable>)
          </span>
        </p>
        <p class="item__info-line">
          <span class="item__info-key">Company</span>
          <span class="item__info-val">
            <Searchable k="c">{p.group.agency_name}</Searchable>
          </span>
        </p>
        <Show when={p.group.debut_date}>
          <p class="item__info-line">
            <span class="item__info-key">Debut date</span>
            <span class="item__info-val">
              <SearchableDate k="gdd" q={p.group.debut_date!} /> (
              <Searchable k="gda">{debutAgo()}</Searchable> year
              {debutAgo() === 1 ? "" : "s"} ago)
            </span>
          </p>
        </Show>
        <Show when={p.group.disband_date}>
          <p class="item__info-line">
            <span class="item__info-key">Disband date</span>
            <span class="item__info-val">
              <SearchableDate k="gdbd" q={p.group.disband_date!} /> (
              <Searchable k="gdba">{disbandAgo()}</Searchable> year
              {disbandAgo() === 1 ? "" : "s"} ago)
            </span>
          </p>
        </Show>
      </div>
    </article>
  );
}
