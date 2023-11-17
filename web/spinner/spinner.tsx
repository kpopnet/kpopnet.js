export default function Spinner(p: { class?: string }) {
  return (
    <div
      class="icon animate-spin border-[3px] border-current border-t-transparent rounded-full"
      classList={{ [p.class || ""]: true }}
    />
  );
}
