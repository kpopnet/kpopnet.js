import {
  type Component,
  type ComponentProps,
  Show,
  splitProps,
} from "solid-js";

export interface ToggleProps extends ComponentProps<"svg"> {
  active: boolean | undefined;
  on: Component;
  off: Component;
}

export default function ToggleIcon(p: ToggleProps) {
  const [_, other] = splitProps(p, ["active", "on", "off"]);
  return (
    <Show when={p.active} fallback={<p.off {...other} />}>
      <p.on {...other} />
    </Show>
  );
}
