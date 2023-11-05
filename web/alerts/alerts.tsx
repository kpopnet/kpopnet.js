import { For, JSXElement, Show, createContext, useContext } from "solid-js";
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

type ShowAlertArg = AlertOpts | Error | string | [string, string];

const AlertsContext = createContext((opts: ShowAlertArg) => {});

export default function GlobalAlerts(p: { children: JSXElement }) {
  const [alerts, setAlerts] = createStore<Alert[]>([]);
  let idCounter = 0;

  function showAlert(opts: ShowAlertArg) {
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

  return (
    <AlertsContext.Provider value={showAlert}>
      {p.children}
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
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  return useContext(AlertsContext);
}
