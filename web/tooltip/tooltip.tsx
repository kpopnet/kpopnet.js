import { Show, createEffect, createSignal, splitProps } from "solid-js";
import type { ComponentProps, JSXElement } from "solid-js";
import { notTouch } from "../../lib/utils";

interface TooltipProps extends ComponentProps<"span"> {
  canShow: boolean;
  content: string;
  children: JSXElement;
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
  let tooltipEl: HTMLDivElement;
  createEffect(() => {
    if (show()) {
      setTimeout(() => {
        tooltipEl.style.opacity = "1";
      });
    }
  });
  return (
    <span
      onMouseEnter={notTouch(() => setShow(p.canShow))}
      onMouseLeave={() => setShow(false)}
      class="relative"
      classList={{ ...local.classList, [local.class || ""]: true }}
      {...other}
    >
      {p.children}
      <Show when={show()}>
        <div
          ref={tooltipEl!}
          class="
        absolute -top-[40px] left-0 whitespace-nowrap
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
      </Show>
    </span>
  );
}
