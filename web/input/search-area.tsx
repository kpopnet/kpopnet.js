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

interface SearchProps {
  focus: Accessor<number>;
  loading: boolean;
  loadingErr: boolean;
  running: boolean;
  onSearch: () => void;
}

export default function SearchArea(p: SearchProps) {
  const [view, setView] = useRouter();
  const [value, setValue] = createSignal<string>(view.query());
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

  function search() {
    const query = value().trim();
    setView({ query, replace: true });
    // XXX(Kagami): JQView doesn't track Router to be able to run same query
    // multiple times. Not sure if that's necessary.
    p.onSearch();
  }

  function handleKeyDown(e: KeyboardEvent) {
    // TODO(Kagami): arrows
    const cmdOrCtrl = e.ctrlKey || e.metaKey;
    if (e.key === "Enter" && cmdOrCtrl) {
      e.preventDefault();
      search();
    }
  }
  function handleInput() {
    setValue(inputEl.value);
    fixHeight();
  }

  createEffect(() => {
    // track deps when to focus
    view.route();
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

  createEffect((wasLoading) => {
    if (wasLoading && !p.loading) {
      fixHeight();
      if (!p.loadingErr) {
        p.onSearch();
      }
    }
    return p.loading;
  }, p.loading);

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
