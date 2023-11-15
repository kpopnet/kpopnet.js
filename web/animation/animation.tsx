import {
  type JSXElement,
  type Accessor,
  createEffect,
  children,
  createMemo,
} from "solid-js";

export function ShowTransition(p: {
  when: Accessor<boolean>;
  children: JSXElement;
}) {
  const resolved = children(() => p.when() && p.children);
  const firstChild = createMemo(() => resolved() as HTMLElement);
  createEffect(() => {
    if (p.when()) {
      setTimeout(() => {
        firstChild().style.opacity = "1";
      });
    }
  });
  return <>{resolved()}</>;
}
