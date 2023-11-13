import { Show, createEffect, type Accessor, on, createMemo } from "solid-js";

import { IconX } from "../icons/icons";
import { IdolQueryRoute, useRouter } from "../router/router";
import { isTouchDevice } from "../../lib/utils";

interface SearchProps {
  focus: Accessor<number>;
  loading?: boolean;
  disabled?: boolean;
}

export default function SearchInput(p: SearchProps) {
  const [view, setView] = useRouter();
  let inputEl: HTMLInputElement;

  function focus() {
    // mobile browsers show keyboard on focus, we don't need that
    if (!isTouchDevice()) {
      inputEl.focus();
      inputEl.selectionStart = inputEl.selectionEnd = inputEl.value.length;
    }
  }

  function handleInputChange() {
    setView({ query: inputEl.value, delay: true });
  }

  function handleClearClick() {
    setView({ query: "" });
    setTimeout(focus);
  }

  createEffect(
    on(view.route, (r, prev) => {
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
    () => `Search for ${view.route() === IdolQueryRoute ? "idol" : "group"}`
  );

  return (
    <section class="relative">
      <input
        name="search"
        ref={inputEl!}
        class="w-full px-[calc(theme(spacing.icon)+8px)]
        text-[20px] sm:text-[30px] h-[38px] sm:h-[50px]
        bg-transparent text-center rounded-none
        border border-kngray-1 focus:border-control-hover outline-none
        placeholder:text-kngray-1 placeholder:opacity-100
        "
        value={view.query()}
        placeholder={placeholder()}
        disabled={p.loading || p.disabled}
        spellcheck={false}
        onInput={handleInputChange}
      />
      <Show when={view.query()}>
        <IconX
          class="icon_control
          absolute bottom-0 right-[8px] top-0 m-auto"
          onClick={handleClearClick}
        />
      </Show>
    </section>
  );
}
