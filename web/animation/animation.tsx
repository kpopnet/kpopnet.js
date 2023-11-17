import {
  type JSXElement,
  type Accessor,
  createEffect,
  children,
  onCleanup,
} from "solid-js";

export function ShowTransition(p: {
  when: Accessor<boolean>;
  children: JSXElement;
}) {
  const resolved = children(
    () => p.when() && p.children
  ) as unknown as Accessor<HTMLElement>;
  createEffect(() => {
    if (p.when()) {
      document.body.offsetHeight; // force reflow
      const animationFrameId = requestAnimationFrame(() => {
        resolved().style.opacity = "1";
      });
      onCleanup(() => cancelAnimationFrame(animationFrameId));
    }
  });
  return <>{resolved()}</>;
}
