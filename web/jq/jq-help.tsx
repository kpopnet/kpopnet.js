import { useRouter } from "../router/router";

export default function JQHelp() {
  return (
    <div
      class="mb-cnt-next
        p-3 border border-kngray-1
        transition-opacity opacity-0 duration-300
        flex flex-col gap-y-2"
    >
      <p class="text-center text-[20px] text-zinc-500">
        Apply JQ filters to the profiles data
      </p>
      <p class="flex justify-center gap-x-5">
        <Link
          url="https://github.com/kpopnet/kpopnet.json/wiki#jq"
          text="[Help]"
        />
        <Link
          url="https://jqlang.github.io/jq/manual/#basic-filters"
          text="[JQ manual]"
        />
        <Link
          url="https://github.com/kpopnet/kpopnet.json/blob/master/kpopnet.d.ts"
          text="[JSON schema]"
        />
      </p>
      <p class="text-center text-[20px] text-zinc-500">Try example queries</p>
      <ul class="space-y-1 list-disc ml-[10px]">
        <Query text="First 5 idols" query=".idols[0:5]" />
        <Query
          text="Common names"
          query=".idols | group_by(.real_name_original)[] | select(length>=3) | map({id})"
        />
      </ul>
    </div>
  );
}

function Query(p: { text: string; query: string }) {
  const [_, setView] = useRouter();
  function handleClick(e: MouseEvent) {
    e.preventDefault();
    setView({ query: p.query, replace: true });
  }
  return (
    <li>
      <div class="flex items-center">
        <span class="flex-[0_140px]">{p.text}</span>
        <a
          class="flex-1 bg-neutral-200 px-3 py-0.5 hover:underline decoration-dashed"
          onClick={handleClick}
          href={`?jq=${p.query}`}
        >
          {p.query}
        </a>
      </div>
    </li>
  );
}

function Link(p: { url: string; text: string }) {
  return (
    <a class="link" href={p.url} target="_blank" rel="noopener noreferrer">
      {p.text}
    </a>
  );
}
