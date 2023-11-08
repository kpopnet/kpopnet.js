import { Show, onMount, createEffect, onCleanup, on } from "solid-js";
import type { Setter } from "solid-js";

import Spinner from "../spinner/spinner";
import { IconX } from "../icons/icons";
import { useRouter } from "../router/router";

interface SearchProps {
  loading?: boolean;
  disabled?: boolean;
}

export default function SearchInput(p: SearchProps) {
  const [_, query, goto] = useRouter();
  let inputEl: HTMLInputElement;

  function focus() {
    inputEl.focus();
  }

  function handleInputChange() {
    goto(null, inputEl.value, { delay: true });
  }

  function handleClearClick() {
    goto(null, "");
    setTimeout(focus);
  }

  function handleGlobalHotkeys(event: KeyboardEvent) {
    if (event.key == "/") {
      event.preventDefault();
      focus();
      inputEl.select();
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

  createEffect<boolean | undefined>((wasLoading) => {
    if (wasLoading && !p.loading) {
      focus();
    }
    return p.loading;
  }, p.loading);

  return (
    <section class="search">
      <input
        name="search"
        ref={inputEl!}
        class="search__input"
        value={query()}
        placeholder="Search for idol or group"
        disabled={p.loading || p.disabled}
        spellcheck={false}
        onInput={handleInputChange}
      />
      <Show when={query()}>
        <IconX
          class="icon_control search__clear-control"
          onClick={handleClearClick}
        />
      </Show>
      <Show when={p.loading}>
        <Spinner />
      </Show>
    </section>
  );
}
