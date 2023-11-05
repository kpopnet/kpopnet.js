import { For, Show, createSignal } from "solid-js";
import type { Idol } from "kpopnet.json";

import { IconLink, IconExternalLink } from "../icons/icons";
import type { GroupMap } from "../../lib/search";
import { renderIdol } from "../../lib/render";
import previewFallbackUrl from "./no-preview.svg?url";

interface IdolProps {
  idol: Idol;
  groupMap: GroupMap;
}

// XXX: fields never update so we render just once?
// FIXME(Kagami): cache renders? display:none in <For>? or save renderIdol result in Map?
export default function IdolView(p: IdolProps) {
  const [showMenu, setShowMenu] = createSignal(false);

  const lines = renderIdol(p.idol, p.groupMap);
  const nameVal = lines[0][1];

  // TODO(Kagami): remove/rework agency info
  const agency_icon = "";
  const agency_name = ""; //p.groupMap.get(p.idol.group_id)!;

  const previewUrl = p.idol.thumb_url || previewFallbackUrl;

  function getLinkName(url: string): string {
    if (url.includes("net.kpop.re")) return "kpopnet";
    if (url.includes("selca.kastden.org")) return "kastden";
    return "other";
  }

  return (
    <article class="idol">
      <img class="idol__preview" src={previewUrl} loading="lazy" />
      <div class="idol__info">
        <div class="idol__info-line idol__name-line">
          <span class="idol__info-val">{nameVal}</span>
          <div
            class="idol__links dropdown"
            onMouseOver={() => setShowMenu(true)}
            onMouseLeave={() => setShowMenu(false)}
          >
            <IconLink class="icon_control idol__show-menu-control" />
            <Show when={showMenu()}>
              <div class="idol-links-menu dropdown-menu show">
                <For each={p.idol.urls}>
                  {(url) => (
                    <a
                      class="idol-links-menu__item dropdown-item"
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {getLinkName(url)}{" "}
                      <IconExternalLink class="idol-links-menu__control" />
                    </a>
                  )}
                </For>
              </div>
            </Show>
          </div>
          <Show when={agency_icon}>
            <span class="idol__label" title={agency_name}>
              <i class={`label label-${agency_icon}`} />
            </span>
          </Show>
        </div>
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
