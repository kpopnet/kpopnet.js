import { Show } from "solid-js";

export default function FieldSelect(p: {
  value: string;
  setValue: (v: string) => void;
  label: string;
  fields: string[];
  default?: string;
}) {
  const isDefault = () => p.value === (p.default ?? "");
  const label = (v: string) => v || "−";
  return (
    <div
      class="flex flex-col"
      classList={{
        "text-gray-300": isDefault(),
        "text-neutral-600": !isDefault(),
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
        <Show when={!p.default}>
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
