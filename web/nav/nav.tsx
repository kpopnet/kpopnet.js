import { Show, createSignal } from "solid-js";
import { IconGithub, IconHome, IconQuestion, IconWiki } from "../icons/icons";
import { IdolQueryRoute, useRouter } from "../router/router";
import logo from "../main/logo-200.png";
import kastden from "./kastden.png";
import { notTouch } from "../../lib/utils";

export default function Navbar() {
  const [_, __, goto] = useRouter();
  const [showInfo, setShowInfo] = createSignal(false);

  function handleHome(e: Event) {
    e.preventDefault();
    goto(IdolQueryRoute, "");
  }

  return (
    <nav
      class="min-[1000px]:fixed min-[1000px]:top-0 min-[1000px]:right-0 z-50
      md:w-[800px] p-[10px] mx-auto pointer-events-none
      flex justify-end relative"
    >
      <div
        // This 100x100 wrapper is for catching mouseleave event
        class="flex justify-end items-start w-[100px] min-[1000px]:h-[100px] pointer-events-auto"
        onMouseLeave={() => setShowInfo(false)}
      >
        <a onClick={handleHome} class="link">
          <IconHome class="icon_control mobile_icon_large" />
        </a>
        <a
          class="link ml-3"
          onMouseOver={notTouch(() => setShowInfo(true))}
          onTouchStart={() => setShowInfo(!showInfo())}
        >
          <IconQuestion class="icon_control mobile_icon_large" />
        </a>
        <Show when={showInfo()}>
          <Info />
        </Show>
      </div>
    </nav>
  );
}

function Info() {
  return (
    <div
      class="flex items-center gap-x-1 pr-1 absolute
      ml-[10px] right-[10px] top-[calc(theme(spacing.icon)+10px+5px)]
      border border-kngray-1 bg-body-bg"
    >
      <img class="w-[100px] h-[100px]" src={logo} />
      <div>
        <p>
          <b>kpopnet</b> web app for kpop fans
        </p>
        <p>
          Help and tips:{" "}
          <a
            class="link navinfo__link"
            target="_blank"
            href="https://github.com/kpopnet/kpopnet.json/wiki"
          >
            <IconWiki class="icon_small inline-block" /> kpopnet/wiki
          </a>
        </p>
        <p>
          Questions:{" "}
          <a
            class="link navinfo__link"
            target="_blank"
            href="https://github.com/orgs/kpopnet/discussions"
          >
            <IconGithub class="icon_small inline-block" /> kpopnet/discussions
          </a>
        </p>
        <p>
          Data sources:{" "}
          <a
            class="link navinfo__link"
            target="_blank"
            href="https://selca.kastden.org/noona/"
            rel="noreferrer"
          >
            <img class="icon_small inline-block" src={kastden} />
            selca.kastden.org
          </a>
        </p>
      </div>
    </div>
  );
}
