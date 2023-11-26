import { type Accessor, Show, createSignal } from "solid-js";

import { IconCaretDown, IconCaretUp } from "../icons/icons";
import ToggleIcon from "../icons/toggle";
import JQInput from "../jq/jq-input";

export default function PlotInput(p: {
  default: string;
  focus: Accessor<number>;
  class?: string;
  loading: boolean;
  running: boolean;
  error: any;
  unparsed: string | undefined | false;
}) {
  const [showOutput, setShowOutput] = createSignal(false);
  const hasOutput = () => !!p.unparsed;

  return (
    <div class={p.class}>
      <label class="text-neutral-600">
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
        <Show when={p.error}>
          <span class="text-red-500 text-sm">{p.error.toString()}</span>
        </Show>
      </label>
      <JQInput
        type="PQ"
        default={p.default}
        focus={p.focus}
        loading={p.loading}
        running={p.running}
      />
      <Show when={showOutput() && hasOutput()}>
        <article
          class="ansi whitespace-pre-wrap break-all
          py-[3px] px-[9px] h-[150px] overflow-y-auto
          border border-t-0 border-gray-300"
        >
          {p.unparsed && p.unparsed.slice(0, 1000)}
        </article>
      </Show>
    </div>
  );
}
