import { createSignal, splitProps } from "solid-js";
import type { ComponentProps, JSXElement } from "solid-js";

import { notTouch } from "../../lib/utils";
import { ShowTransition } from "../animation/animation";

interface TooltipProps extends ComponentProps<"span"> {
  canShow?: boolean;
  content: string;
  children: JSXElement;
  top?: number;
  left?: number;
}

function px(n: number) {
  return n + "px";
}

export default function Tooltip(p: TooltipProps) {
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
      onMouseEnter={notTouch(() => setShow(p.canShow ?? true))}
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
          {p.content}
        </div>
      </ShowTransition>
    </span>
  );
}
