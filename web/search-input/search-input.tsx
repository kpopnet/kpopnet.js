import { Show, onMount, createEffect } from "solid-js";
import type { Setter } from "solid-js";

import "./search-input.less";
import Spinner from "../spinner/spinner";

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

  onMount(() => {
    focus();
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
        onInput={handleInputChange}
      />
      <Show when={p.query}>
        <span class="search__clear-control" onClick={handleClearClick}>
          ✖
        </span>
      </Show>
      <Show when={p.loading}>
        <Spinner />
      </Show>
    </div>
  );
}
