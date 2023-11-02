/**
 * Filterable idol list.
 */

import { Switch, Match, For, Show, createMemo } from "solid-js";
import type { Idol, Profiles } from "kpopnet.json";

import "./idol-list.less";
import previewFallbackUrl from "./no-preview.svg";
import { searchIdols, renderIdol } from "./render";
import type { GroupMap } from "./render";
// import "../labels/labels.less";

interface ItemProps {
  idol: Idol;
  groupMap: GroupMap;
}

// XXX: fields never update so we render just once?
// FIXME(Kagami): cache renders? display:none in <For>? or save renderIdol result in Map?
function IdolItem(p: ItemProps) {
  const lines = renderIdol(p.idol, p.groupMap);
  const nameVal = lines[0][1];

  // TODO(Kagami): remove/rework agency info
  const agency_icon = "";
  const agency_name = ""; //p.groupMap.get(p.idol.group_id)!;

  const previewUrl = p.idol.thumb_url || previewFallbackUrl;

  return (
    <article class="idol">
      <img class="idol__preview" src={previewUrl} loading="lazy" />
      <div class="idol__info">
        <p class="idol__info-line idol__name-line">
          <span class="idol__info-val">{nameVal}</span>
          <Show when={agency_icon}>
            <span class="idol__label" title={agency_name}>
              <i class={`label label-${agency_icon}`} />
            </span>
          </Show>
        </p>
        <For each={lines}>
          {([key, val]) => (
            <p class="idol__info-line">
              <span class="idol__info-key">{key}</span>
              <span class="idol__info-val">{val}</span>
            </p>
          )}
        </For>
      </div>
    </article>
  );
}

interface ListProps {
  query: string;
  profiles: Profiles;
  groupMap: GroupMap;
}

export default function IdolList(p: ListProps) {
  const idols = createMemo(() => {
    return searchIdols(p.query, p.profiles, p.groupMap).slice(0, 20);
  });
  return (
    <Switch fallback={<section class="idols idols_empty">No results</section>}>
      <Match when={p.query.length < 2}> </Match>
      <Match when={idols().length}>
        <section class="idols">
          <For each={idols()}>
            {(idol) => <IdolItem idol={idol} groupMap={p.groupMap} />}
          </For>
        </section>
      </Match>
    </Switch>
  );
}
