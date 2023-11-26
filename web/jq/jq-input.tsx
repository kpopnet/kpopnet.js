import {
  type Accessor,
  createEffect,
  Show,
  createSignal,
  onMount,
  on,
} from "solid-js";

import Spinner from "../spinner/spinner";
import { useRouter } from "../router/router";
import { isTouchDevice } from "../../lib/utils";
import { IconSearch } from "../icons/icons";
import { JQQueryStorage } from "./jq-storage";

interface InputProps {
  type?: "PQ" | "JQ";
  default?: string;
  focus: Accessor<number>;
  reset?: Accessor<number>;
  loading: boolean;
  running: boolean;
}

export default function JQInput(p: InputProps) {
  const [view, setView] = useRouter();
  // initial value is from URL(1) or pre-defined(2) or localStorage(3)
  const qStorage = new JQQueryStorage(view.query() || p.default || "", p.type);
  const [value, setValue] = createSignal(qStorage.last());
  const disabled = () => p.loading || p.running;
  let inputEl: HTMLTextAreaElement;

  const pqType = () => p.type === "PQ";
  const jqType = () => !pqType();

  function focus() {
    // mobile browsers show keyboard on focus, we don't need that
    if (!isTouchDevice()) {
      inputEl.focus();
      // inputEl.selectionStart = inputEl.selectionEnd = inputEl.value.length;
    }
  }

  function fixHeight() {
    inputEl.style.height = "0";
    const newHeight = inputEl.scrollHeight + 2; // border
    inputEl.style.height = newHeight + "px";
  }
  function setFix(q: string) {
    setValue(q);
    fixHeight();
  }
  function setFixDelay(q: string) {
    setValue(q);
    // we're in untrack() scope so will fix later
    setTimeout(fixHeight);
  }

  function search() {
    const query = value().trim();
    if (!query) return;
    setView({ query });
    qStorage.pushLine(value());
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      search();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFix(qStorage.prevLine());
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFix(qStorage.nextLine());
    }
  }
  function handleInput() {
    setFix(inputEl.value);
    // XXX: don't block UI thread, works?
    setTimeout(() => qStorage.setLast(inputEl.value));
  }

  /* EFFECTS HANDLING */

  // 1) auto-focus on query change, when result is ready
  createEffect(() => {
    view.query();
    if (!p.loading && !p.running) {
      focus();
    }
  });

  // 2) parent asks to focus (on hotkey)
  createEffect(
    on(p.focus, (_, prev) => {
      if (prev == null) return;
      focus();
      window.scrollTo(0, 0);
    })
  );

  // 3) parent asks to reset our state
  if (p.reset) {
    createEffect(
      // XXX: has to use additional signal because can't clear empty query. is there better way?
      // XXX: it will also run view.query effect if query isn't empty
      on(p.reset, (_, prev) => {
        if (prev == null) return;
        setFixDelay(view.query());
        qStorage.setLast(view.query());
        focus();
      })
    );
  }

  // 4) track URL change (except initial)
  createEffect(
    // note that initial input value is set from URL
    // but then we do the opposite: push from input to URL and storage
    on(view.query, (q, prev) => {
      if (prev == null) return;
      setFixDelay(q);
      qStorage.pushLine(q);
    })
  );

  // 5) fix initial input height
  onMount(() => {
    fixHeight();
  });

  return (
    <section class="relative">
      <textarea
        name="search"
        ref={inputEl!}
        class="block w-full
          py-[3px] pl-[9px] pr-[calc(theme(spacing.icon)+9px)]
          text-[20px] h-[38px]
          bg-transparent rounded-none
          border border-kngray-1 outline-none
          text-neutral-600
          resize-none overflow-hidden break-all"
        classList={{
          "text-center": !value() && jqType(),
          "sm:h-[50px] sm:py-[9px] placeholder:text-kngray-1 placeholder:opacity-100":
            jqType(),
          "placeholder:text-gray-300": pqType(),
        }}
        placeholder={p.loading ? "Loading JQ..." : "JQ filter"}
        value={value()}
        disabled={disabled()}
        spellcheck={false}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
      />
      <div
        class="absolute top-[7px] right-[9px]"
        classList={{ "sm:top-[13px]": jqType() }}
      >
        <Show
          when={!disabled()}
          fallback={
            <Spinner class={jqType() ? "text-kngray-1" : "text-gray-300"} />
          }
        >
          <Show when={value()}>
            <IconSearch class="icon_control" onClick={search} />
          </Show>
        </Show>
      </div>
    </section>
  );
}
