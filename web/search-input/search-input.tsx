import { Show, onMount, createEffect, onCleanup } from "solid-js";
import type { Setter } from "solid-js";

import "./search-input.less";
import Spinner from "../spinner/spinner";
import { IconX } from "../icons/icons";

interface SearchProps {
  query: string;
  setQuery: Setter<string>;
  loading: boolean;
  disabled: boolean;
}

export default function SearchInput(p: SearchProps) {
  let inputEl: HTMLInputElement;

  function focus() {
    inputEl.focus();
  }

  function handleInputChange() {
    p.setQuery(inputEl.value);
  }

  function handleClearClick() {
    p.setQuery("");
    setTimeout(focus);
  }

  function handleGlobalHotkeys(event: KeyboardEvent) {
    if (event.key == "/") {
      event.preventDefault();
      focus();
      window.scrollTo(0, 0);
    }
  }

  onMount(() => {
    focus();
    document.addEventListener("keydown", handleGlobalHotkeys);
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleGlobalHotkeys);
  });

  createEffect<boolean>((wasLoading) => {
    if (wasLoading && !p.loading) {
      focus();
    }
    return p.loading;
  }, p.loading);

  return (
    <div class="search">
      <input
        ref={inputEl!}
        class="search__input"
        value={p.query}
        maxLength={40}
        placeholder="Search for idol or group"
        disabled={p.loading || p.disabled}
        spellcheck={false}
        onInput={handleInputChange}
      />
      <Show when={p.query}>
        <IconX class="search__clear-control" onClick={handleClearClick} />
      </Show>
      <Show when={p.loading}>
        <Spinner />
      </Show>
    </div>
  );
}
