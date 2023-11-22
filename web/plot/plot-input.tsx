import { Show } from "solid-js";

// TODO(Kagami): use jq-input component?
export default function PlotInput(p: {
  value: string;
  setValue: (v: string) => void;
  error: any;
  loading: boolean;
}) {
  function handleKeyDown(
    e: KeyboardEvent & { currentTarget: HTMLTextAreaElement }
  ) {
    if (e.key === "Enter") {
      e.preventDefault();
      p.setValue(e.currentTarget.value);
    }
  }
  return (
    <section class="col-span-full relative text-neutral-600">
      <label>
        Items filter
        <Show when={p.error}>
          <span class="text-red-500 text-sm">: {p.error.toString()}</span>
        </Show>
      </label>
      <textarea
        name="search"
        // ref={inputEl!}
        class="block w-full
          py-[3px] pl-[9px] pr-[calc(theme(spacing.icon)+9px)]
          text-[20px] h-[38px]
          bg-transparent rounded-none
          border border-gray-300 outline-none
          placeholder:text-gray-300
          resize-none overflow-hidden break-all"
        placeholder={p.loading ? "Loading JQ..." : "JQ filter"}
        value={p.value}
        // disabled={disabled()}
        spellcheck={false}
        onKeyDown={handleKeyDown}
        // onInput={handleInput}
      />
      <div class="absolute top-[7px] sm:top-[13px] right-[9px]">
        {/* <Show when={!disabled()} fallback={<Spinner class="text-kngray-1" />}>
          <Show when={value()}>
            <IconSearch class="icon_control" onClick={search} />
          </Show>
        </Show> */}
      </div>
    </section>
  );
}
