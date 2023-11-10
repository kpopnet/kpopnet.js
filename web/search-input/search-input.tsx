import { Show, onMount, createEffect, onCleanup, Accessor, on } from "solid-js";

import Spinner from "../spinner/spinner";
import { IconX } from "../icons/icons";
import { useRouter } from "../router/router";

interface SearchProps {
  focus: Accessor<number>;
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
    document.addEventListener("keydown", handleGlobalHotkeys);
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleGlobalHotkeys);
  });

  createEffect(on(p.focus, focus));

  createEffect<boolean | undefined>((wasLoading) => {
    if (wasLoading && !p.loading) {
      focus();
    }
    return p.loading;
  }, p.loading);

  return (
    <section class="relative">
      <input
        name="search"
        ref={inputEl!}
        class="h-[50px] w-full
        border border-kngray-1 bg-transparent pr-[calc(theme(spacing.icon)+0.5rem)] text-center text-[30px]
        outline-none
        placeholder:text-kngray-1 placeholder:opacity-100
        focus:border-control-hover"
        value={query()}
        placeholder="Search for idol or group"
        disabled={p.loading || p.disabled}
        spellcheck={false}
        onInput={handleInputChange}
      />
      <Show when={query()}>
        <IconX
          class="icon_control
          absolute bottom-0 right-2 top-0 m-auto"
          onClick={handleClearClick}
        />
      </Show>
      <Show when={p.loading}>
        <Spinner />
      </Show>
    </section>
  );
}
