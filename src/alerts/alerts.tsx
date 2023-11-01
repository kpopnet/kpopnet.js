import { For, Show } from "solid-js";
import { createStore } from "solid-js/store";

import "./alerts.less";

interface Alert {
  id: number;
  message: string;
  closing: boolean;
  sticky?: boolean;
  title?: string;
}

let idCounter = 0;
const [alerts, setAlerts] = createStore<Alert[]>([]);

export function showAlert(opts: Error | string | [string, string]) {
  let a: Alert = { id: idCounter++, message: "", closing: false };
  if (typeof opts === "string") {
    a.message = opts;
  } else if (opts instanceof Error) {
    a.message = opts.message;
  } else if (Array.isArray(opts)) {
    a.title = opts[0];
    a.message = opts[1];
  }
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

export default function Alerts() {
  return (
    <aside class="alerts">
      <For each={alerts}>
        {(a) => (
          <article classList={{ alert: true, alert_closing: a.closing }}>
            <a class="alert__close-control" onClick={makeClose(a.id)}>
              ✖
            </a>
            <Show when={a.title}>
              <header class="alert__title">{a.title}</header>
            </Show>
            <section class="alert__message">{a.message}</section>
          </article>
        )}
      </For>
    </aside>
  );
}
