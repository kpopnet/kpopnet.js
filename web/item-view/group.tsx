import { For, Show, createMemo } from "solid-js";
import type { Group } from "kpopnet.json";

import { type Cache } from "../../lib/search";
import { getAge } from "../../lib/utils";
import {
  LinkMenu,
  Searchable,
  SearchableDate,
  thumbFallbackUrl,
} from "./common";

export default function GroupView(p: { group: Group; cache: Cache }) {
  const thumbUrl = createMemo(() => p.group.thumb_url || thumbFallbackUrl);
  const debutAgo = createMemo(() => getAge(p.group.debut_date || ""));
  const disbandAgo = createMemo(() => getAge(p.group.disband_date || ""));
  return (
    <article class="item group">
      <img class="item__preview" src={thumbUrl()} loading="lazy" />
      <div class="item__info">
        <div class="item__line item__line_name">
          <span class="item__val item__val_name">
            <Searchable k="id" id={p.group.id}>
              {p.group.name}
            </Searchable>
          </span>
          <LinkMenu urls={p.group.urls} />
        </div>
        <p class="item__line">
          <span class="item__key">Name</span>
          <span class="item__val">
            <Searchable k="g">{p.group.name}</Searchable> (
            <Searchable k="g">{p.group.name_original}</Searchable>)
          </span>
        </p>
        <p class="item__line">
          <span class="item__key">Company</span>
          <span class="item__val">
            <CompanyView name={p.group.agency_name} />
          </span>
        </p>
        <Show when={p.group.debut_date}>
          <p class="item__line">
            <span class="item__key">Debut date</span>
            <span class="item__val">
              <SearchableDate k="gdd" q={p.group.debut_date!} /> (
              <Searchable k="gda">{debutAgo()}</Searchable> year
              {debutAgo() === 1 ? "" : "s"} ago)
            </span>
          </p>
        </Show>
        <Show when={p.group.disband_date}>
          <p class="item__line">
            <span class="item__key">Disband date</span>
            <span class="item__val">
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

function CompanyView(p: { name: string }) {
  const companies = () => p.name.split(",").map((c) => c.trim());
  return (
    <For each={companies()}>
      {(c) => (
        <span class="group__company">
          <Searchable k="c">{c}</Searchable>
        </span>
      )}
    </For>
  );
}
