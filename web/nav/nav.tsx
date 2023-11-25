import { createSignal } from "solid-js";
import {
  IconChat,
  IconHome,
  IconQuestion,
  IconWiki,
  IconDiscord,
  IconKastden,
  IconNamu,
} from "../icons/icons";
import logo from "../main/logo-200.png";
import { notTouch } from "../../lib/utils";
import { ShowTransition } from "../animation/animation";

export default function Navbar() {
  const [showInfo, setShowInfo] = createSignal(false);

  return (
    <nav
      class="min-[1000px]:fixed min-[1000px]:top-0 min-[1000px]:right-0 z-50
      md:w-[800px] mx-auto pointer-events-none
      flex justify-end relative"
    >
      <div
        // This 100x100 wrapper is for catching mouseleave event
        class="flex justify-end items-start w-[100px] min-[1000px]:h-[100px] p-[10px] pointer-events-auto"
        onMouseLeave={() => setShowInfo(false)}
      >
        <a href="/" class="link">
          <IconHome class="icon_control mobile_icon_large" />
        </a>
        <a
          class="link ml-3"
          onMouseOver={notTouch(() => setShowInfo(true))}
          onTouchStart={() => setShowInfo(!showInfo())}
        >
          <IconQuestion class="icon_control mobile_icon_large" />
        </a>
        <ShowTransition when={showInfo}>
          <Info />
        </ShowTransition>
      </div>
    </nav>
  );
}

function Info() {
  return (
    <div
      class="flex items-center gap-x-1 pr-1 absolute z-50
      ml-[10px] right-[10px]
      top-[calc(theme(spacing.icon-lg)+10px+5px)]
      sm:top-[calc(theme(spacing.icon)+10px+5px)]
      border border-kngray-1 bg-body-bg
      transition-opacity duration-300 opacity-0"
    >
      <img class="w-[100px] h-[100px]" src={logo} />
      <div>
        <p>
          <b>kpopnet</b> web app for kpop fans
        </p>
        <p>
          Help and tips:{" "}
          <a
            class="link"
            href="https://github.com/kpopnet/kpopnet.json/wiki"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconWiki class="icon_small inline-block" /> kpopnet/wiki
          </a>
        </p>
        <p>
          Discussions:{" "}
          <a
            class="link"
            href="https://github.com/orgs/kpopnet/discussions"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconChat class="icon_small inline-block" /> forum
          </a>{" "}
          <a
            class="link"
            href="https://discord.gg/r54dUMEn6K"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconDiscord class="icon_small inline-block" /> discord
          </a>
        </p>
        <p>
          Data sources:{" "}
          <a
            class="link"
            href="https://selca.kastden.org/noona/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconKastden class="icon_small inline-block" /> kastden
          </a>{" "}
          <a
            class="link"
            href="https://namu.wiki/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconNamu class="icon_small inline-block" /> namu
          </a>
        </p>
      </div>
    </div>
  );
}
