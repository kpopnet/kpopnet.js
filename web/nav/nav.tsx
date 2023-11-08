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

  return (
    <nav class="navbar" onMouseLeave={() => setShowInfo(false)}>
      <a onClick={handleHome} class="link navbar__item">
        <IconHome class="icon_control" />
      </a>
      <a onMouseOver={() => setShowInfo(true)} class="link navbar__item">
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
    <div class="navinfo">
      <img class="navinfo__logo" src={logo} />
      <div class="navinfo__text">
        <p class="navinfo__p">
          <b>kpopnet</b> web app for kpop fans
        </p>
        <p class="navinfo__p">
          Help and tips:{" "}
          <a
            class="link navinfo__link"
            target="_blank"
            href="https://github.com/kpopnet/kpopnet.json/wiki"
          >
            <IconWiki class="icon_small navinfo__icon" /> kpopnet/wiki
          </a>
        </p>
        <p class="navinfo__p">
          Questions/issues:{" "}
          <a
            class="link navinfo__link"
            target="_blank"
            href="https://github.com/orgs/kpopnet/discussions"
          >
            <IconGithub class="icon_small navinfo__icon" /> kpopnet/discussions
          </a>
        </p>
        <p class="navinfo__p">
          Data sources:{" "}
          <a
            class="link navinfo__link"
            target="_blank"
            href="https://selca.kastden.org/noona/"
            rel="noreferrer"
          >
            <img class="navinfo__icon" src={kastden} />
            selca.kastden.org
          </a>
        </p>
      </div>
    </div>
  );
}
