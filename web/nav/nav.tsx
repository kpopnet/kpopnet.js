import { Show, createSignal } from "solid-js";
import { IconGithub, IconHome, IconQuestion, IconWiki } from "../icons/icons";
import { QueryRoute, useRouter } from "../router/router";
import logo from "./logo.png";
import kastden from "./kastden.png";

export default function Navbar() {
  const [_, __, goto] = useRouter();
  const [showInfo, setShowInfo] = createSignal(false);

  function handleHome(e: Event) {
    e.preventDefault();
    goto(QueryRoute, "");
  }

  // FIXME(Kagami): fix for small screens
  return (
    <nav
      class="fixed z-50 top-0 right-0 pt-[10px] pr-[10px]
      flex justify-end items-start min-w-[100px] min-h-[100px]"
      onMouseLeave={() => setShowInfo(false)}
    >
      <a onClick={handleHome} class="link ml-2.5">
        <IconHome class="icon_control" />
      </a>
      <a onMouseOver={() => setShowInfo(true)} class="link ml-2.5">
        <IconQuestion class="icon_control" />
      </a>
      <Show when={showInfo()}>
        <Info />
      </Show>
    </nav>
  );
}

function Info() {
  return (
    <div
      class="flex items-center
      absolute w-[450px] right-[10px] top-[calc(theme(spacing.icon)+10px+5px)]
      border border-kngray-1 bg-body-bg"
    >
      <img class="w-[100px] h-[100px] mr-1" src={logo} />
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
          Questions/issues:{" "}
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
