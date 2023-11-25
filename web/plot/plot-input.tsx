import { Show, createSignal } from "solid-js";

import { IconCaretDown, IconCaretUp } from "../icons/icons";
import ToggleIcon from "../icons/toggle";

export default function PlotInput(p: {
  value: string;
  setValue: (v: string) => void;
  loading: boolean;
  unparsedError: any;
  parsedError: any;
  unparsed: string | undefined;
}) {
  const error = () => p.unparsedError || p.parsedError;
  const [showOutput, setShowOutput] = createSignal(false);
  const hasOutput = () => !p.unparsedError && !!p.unparsed;

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
        <span class="pr-1">Items filter</span>
        <Show when={hasOutput()}>
          <ToggleIcon
            class="icon_control icon_small inline-block mr-1"
            active={showOutput()}
            on={IconCaretUp}
            off={IconCaretDown}
            onClick={() => setShowOutput(!showOutput())}
          />
        </Show>
        <Show when={error()}>
          <span class="text-red-500 text-sm">{error().toString()}</span>
        </Show>
      </label>
      <textarea
        name="search"
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
      />
      <div class="absolute top-[7px] sm:top-[13px] right-[9px]">
        {/* <Show when={!disabled()} fallback={<Spinner class="text-kngray-1" />}>
          <Show when={value()}>
            <IconSearch class="icon_control" onClick={search} />
          </Show>
        </Show> */}
      </div>
      <Show when={showOutput() && hasOutput()}>
        <article
          class="ansi whitespace-pre-wrap break-all relative
          py-[3px] px-[9px] h-[150px] overflow-y-auto
          border border-t-0 border-gray-300"
        >
          {p.unparsed!.slice(0, 1000)}
        </article>
      </Show>
    </section>
  );
}
