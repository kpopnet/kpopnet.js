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
  focus: Accessor<number>;
  reset: Accessor<number>;
  loading: boolean;
  running: boolean;
}

export default function JQInput(p: InputProps) {
  const [view, setView] = useRouter();
  const qStorage = new JQQueryStorage(view.query());
  const [value, setValue] = createSignal(qStorage.last());
  const disabled = () => p.loading || p.running;
  let inputEl: HTMLTextAreaElement;

  function focus() {
    // mobile browsers show keyboard on focus, we don't need that
    if (!isTouchDevice()) {
      inputEl.focus();
      inputEl.selectionStart = inputEl.selectionEnd = inputEl.value.length;
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
    setView({ query, replace: true });
    qStorage.pushLine(value());
  }

  function cursorAtStart() {
    return true; //inputEl.selectionStart === 0;
  }
  function cursorAtEnd() {
    return true; //inputEl.selectionEnd === inputEl.value.length;
  }
  function handleKeyDown(e: KeyboardEvent) {
    const cmdOrCtrl = e.ctrlKey || e.metaKey;
    if (e.key === "Enter" && (cursorAtEnd() || cmdOrCtrl)) {
      e.preventDefault();
      search();
    } else if (e.key === "ArrowUp" && cursorAtStart()) {
      e.preventDefault();
      setFix(qStorage.prevLine());
    } else if (e.key === "ArrowDown" && cursorAtEnd()) {
      e.preventDefault();
      setFix(qStorage.nextLine());
    }
  }
  function handleInput() {
    setFix(inputEl.value);
    // XXX: don't block UI thread, works?
    setTimeout(() => qStorage.setLast(inputEl.value));
  }

  createEffect(() => {
    // track deps when to focus
    view.query();
    if (!p.loading && !p.running) {
      focus();
    }
  });
  createEffect(
    // from hotkey
    on(p.focus, (_, prev) => {
      if (prev == null) return;
      focus();
      window.scrollTo(0, 0);
    })
  );
  createEffect(
    // parent asked to reset our state
    // XXX: has to use additional signal because can't clear empty query. is there better way?
    // XXX: it will also run view.query effect is query isn't empty
    on(p.reset, (_, prev) => {
      if (prev == null) return;
      setFixDelay(view.query());
      qStorage.setLast(view.query());
      focus();
    })
  );
  createEffect(
    // track url change (no initial)
    // note that initial input value is set from URL
    // but then we do the opposite: push from input to URL and storage
    on(view.query, (q, prev) => {
      if (prev == null) return;
      setFixDelay(q);
      qStorage.pushLine(q);
    })
  );

  onMount(() => {
    fixHeight();
  });

  return (
    <section class="relative">
      <textarea
        name="search"
        ref={inputEl!}
        class="block w-full
          py-[3px] sm:py-[9px] pl-[9px] pr-[calc(theme(spacing.icon)+9px)]
          text-[20px] h-[38px] sm:h-[50px]
          bg-transparent rounded-none
          border border-kngray-1 outline-none
          text-neutral-600
          placeholder:text-kngray-1 placeholder:opacity-100
          disabled:text-kngray-1
          resize-none overflow-hidden break-all"
        classList={{
          "text-center": !value(),
        }}
        placeholder={p.loading ? "Loading JQ..." : "JQ filter"}
        value={value()}
        disabled={disabled()}
        spellcheck={false}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
      />
      <div class="absolute top-[7px] sm:top-[13px] right-[9px]">
        <Show when={!disabled()} fallback={<Spinner class="text-kngray-1" />}>
          <Show when={value()}>
            <IconSearch class="icon_control" onClick={search} />
          </Show>
        </Show>
      </div>
    </section>
  );
}
