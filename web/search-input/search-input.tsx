import { Show, createEffect, type Accessor, on, createMemo } from "solid-js";

import { IconX } from "../icons/icons";
import { IdolQueryRoute, useRouter } from "../router/router";

interface SearchProps {
  focus: Accessor<number>;
  loading?: boolean;
  disabled?: boolean;
}

export default function SearchInput(p: SearchProps) {
  const [route, query, goto] = useRouter();
  let inputEl: HTMLInputElement;

  function focus() {
    inputEl.focus();
    inputEl.selectionStart = inputEl.selectionEnd = inputEl.value.length;
  }

  function handleInputChange() {
    goto(null, inputEl.value, { delay: true });
  }

  function handleClearClick() {
    goto(null, "");
    setTimeout(focus);
  }

  createEffect(
    on(route, (r, prev) => {
      if (r !== prev) {
        focus();
      }
    })
  );
  createEffect(
    // from hotkey
    on(p.focus, () => {
      focus();
      // inputEl.select();
      window.scrollTo(0, 0);
    })
  );

  // createEffect<boolean | undefined>((wasLoading) => {
  //   if (wasLoading && !p.loading) {
  //     focus();
  //   }
  //   return p.loading;
  // }, p.loading);

  const placeholder = createMemo(
    () => `Search for ${route() === IdolQueryRoute ? "idol" : "group"}`
  );

  return (
    <section class="relative">
      <input
        name="search"
        ref={inputEl!}
        class="h-[50px] w-full px-[calc(theme(spacing.icon)+8px)]
        bg-transparent text-center text-[30px]
        border border-kngray-1 focus:border-control-hover outline-none
        placeholder:text-kngray-1 placeholder:opacity-100
        "
        value={query()}
        placeholder={placeholder()}
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
    </section>
  );
}
