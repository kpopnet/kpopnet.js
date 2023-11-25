import { Show } from "solid-js";

export default function PlotSelect(p: {
  class?: string;
  value: string;
  setValue: (v: string) => void;
  label: string;
  fields: string[];
  noEmpty?: boolean;
}) {
  const label = (v: string) => v || "−";
  return (
    <div
      class="flex flex-col"
      classList={{
        [p.class ?? ""]: true,
        "text-gray-300": !p.value,
        "text-neutral-600": !!p.value,
      }}
    >
      <label>{p.label}</label>
      <select
        class="block w-full px-1 py-1
          bg-transparent border border-gray-300
          outline-none"
        value={p.value}
        onInput={(e) => p.setValue(e.target.value)}
      >
        <Show when={!p.noEmpty}>
          <option value="" selected={!p.value}>
            {label("")}
          </option>
        </Show>
        {p.fields.map((v) => (
          <option value={v} selected={v === p.value}>
            {label(v)}
          </option>
        ))}
      </select>
    </div>
  );
}
