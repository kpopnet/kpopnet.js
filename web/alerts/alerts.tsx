import { For, Show } from "solid-js";
import { createStore } from "solid-js/store";

interface Alert {
  id: number;
  message: string;
  closing: boolean;
  sticky?: boolean;
  title?: string;
}

interface AlertOpts {
  message: string;
  sticky?: boolean;
  title?: string;
}

let idCounter = 0;
// XXX(Kagami): "While it is possible to use global state and computations,
// Context is sometimes a better solution. Additionally, it is important to note
// that global state should not be used in SSR"
const [alerts, setAlerts] = createStore<Alert[]>([]);

export function showAlert(opts: AlertOpts | Error | string | [string, string]) {
  const aopts: AlertOpts = { message: "" };
  if (typeof opts === "string") {
    aopts.message = opts;
  } else if (opts instanceof Error) {
    aopts.message = opts.message;
  } else if (Array.isArray(opts)) {
    aopts.title = opts[0];
    aopts.message = opts[1];
  } else {
    Object.assign(aopts, opts);
  }
  const a = Object.assign(aopts, { id: idCounter++, closing: false });
  setAlerts([a].concat(alerts));
  if (!a.sticky) {
    setTimeout(makeClose(a.id), 4000);
  }
}

function makeClose(id: number) {
  return () => {
    setAlerts(
      (a) => a.id === id,
      "closing",
      () => true
    );
    setTimeout(() => {
      setAlerts(alerts.filter((a) => a.id !== id));
    }, 1000);
  };
}

export default function GlobalAlerts() {
  return (
    <aside class="galerts">
      <For each={alerts}>
        {(a) => (
          <article classList={{ galert: true, galert_closing: a.closing }}>
            <a class="galert__close-control" onClick={makeClose(a.id)}>
              ✖
            </a>
            <Show when={a.title}>
              <header class="galert__title">{a.title}</header>
            </Show>
            <section class="galert__message">{a.message}</section>
          </article>
        )}
      </For>
    </aside>
  );
}
