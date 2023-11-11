import { JSXElement, Show, createEffect } from "solid-js";

export default function Tooltip(p: { show: boolean; children: JSXElement }) {
  let tooltipEl: HTMLDivElement;
  createEffect(() => {
    if (p.show) {
      setTimeout(() => {
        tooltipEl.style.opacity = "1";
      });
    }
  });
  return (
    <Show when={p.show}>
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
        {p.children}
      </div>
    </Show>
  );
}
