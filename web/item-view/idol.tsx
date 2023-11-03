import { For, Show } from "solid-js";
import type { Idol } from "kpopnet.json";

import type { GroupMap } from "../../lib/search";
import { renderIdol } from "../../lib/render";
import previewFallbackUrl from "./no-preview.svg?url";
import "./idol.less";

interface IdolProps {
  idol: Idol;
  groupMap: GroupMap;
}

// XXX: fields never update so we render just once?
// FIXME(Kagami): cache renders? display:none in <For>? or save renderIdol result in Map?
export default function IdolView(p: IdolProps) {
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
