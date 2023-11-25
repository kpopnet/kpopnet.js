import { createSignal, splitProps } from "solid-js";
import type { ComponentProps, JSXElement } from "solid-js";

import { notTouch } from "../../lib/utils";
import { ShowTransition } from "../animation/animation";
import ToggleIcon, { type ToggleProps } from "../icons/toggle";

interface TooltipProps extends ComponentProps<"span"> {
  canShow?: boolean;
  content?: string;
  children: JSXElement;
  top?: number;
  left?: number;
}

function Tooltip(p: TooltipProps) {
  const px = (n: number) => n + "px";
  const [show, setShow] = createSignal(false);
  const [local, other] = splitProps(p, [
    "class",
    "classList",
    "canShow",
    "content",
    "children",
  ]);
  return (
    <span
      onMouseEnter={notTouch(() => setShow((p.canShow ?? true) && !!p.content))}
      onMouseLeave={() => setShow(false)}
      class="relative"
      classList={{ ...local.classList, [local.class || ""]: true }}
      {...other}
    >
      {p.children}
      <ShowTransition when={show}>
        <div
          style={{ top: px((p.top ?? 0) - 40), left: px(p.left ?? 0) }}
          class="
        absolute whitespace-nowrap
        opacity-0 transition-opacity duration-300
        rounded-lg px-3 py-2 text-sm font-medium
        text-white shadow-sm bg-black

        before:block
        before:absolute
        before:-bottom-[8px]
        before:border-transparent
        before:border-x-8
        before:border-t-8
        before:border-t-black"
        >
          <div class="max-w-[200px] overflow-hidden text-ellipsis">
            {p.content}
          </div>
        </div>
      </ShowTransition>
    </span>
  );
}
export default Tooltip;

export function TooltipIcon(p: { tooltip: string; children: JSXElement }) {
  return (
    <Tooltip content={p.tooltip} left={-8} top={-6}>
      {p.children}
    </Tooltip>
  );
}

export function ToggleTooltipIcon(p: ToggleProps & { tooltip: string }) {
  return (
    <TooltipIcon tooltip={p.tooltip}>
      <ToggleIcon class="icon_control" {...p} />
    </TooltipIcon>
  );
}
