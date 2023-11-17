import {
  type Accessor,
  createEffect,
  Show,
  createSignal,
  onMount,
} from "solid-js";

import Spinner from "../spinner/spinner";
import { useRouter } from "../router/router";
import { isTouchDevice } from "../../lib/utils";
import { IconSearch } from "../icons/icons";
import { JQQueryStorage } from "./jq-storage";

interface InputProps {
  focus: Accessor<number>;
  loading: boolean;
  loadingErr: boolean;
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
  createEffect(() => {
    // from hotkey
    if (p.focus()) {
      focus();
      window.scrollTo(0, 0);
    }
  });
  createEffect((prev) => {
    // track url change
    if (view.query() !== prev) {
      setFix(view.query());
      qStorage.setLast(view.query());
    }
    return view.query();
  }, view.query());

  onMount(() => {
    fixHeight();
  });

  return (
    <section class="relative">
      <textarea
        name="search"
        ref={inputEl!}
        class="block w-full
          py-[9px] pl-[9px] pr-[calc(theme(spacing.icon)+9px)]
          text-[20px] h-[50px]
          bg-transparent rounded-none
          border border-kngray-1 outline-none
          text-neutral-600
          placeholder:text-kngray-1 placeholder:opacity-100
          disabled:text-kngray-1
          resize-none overflow-hidden"
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
      <div class="absolute top-0 bottom-0 right-[9px] flex items-center">
        <Show when={!disabled()} fallback={<Spinner class="text-kngray-1" />}>
          <Show when={value()}>
            <IconSearch class="icon_control" onClick={search} />
          </Show>
        </Show>
      </div>
    </section>
  );
}
