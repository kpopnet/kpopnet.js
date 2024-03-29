import { useRouter } from "../router/router";
import { Link } from "../utils/utils";

export default function JQHelp() {
  return (
    <div
      class="mb-cnt-next
        p-3 border border-kngray-1
        transition-opacity opacity-0 duration-300
        flex flex-col gap-y-2"
    >
      <p class="text-center text-[20px] text-zinc-500">
        Apply JQ filter to the profiles data
      </p>
      <p class="flex justify-center gap-x-5">
        <Link
          url="https://github.com/kpopnet/kpopnet.json/wiki#jq"
          text="[Help]"
        />
        <Link url="https://jqlang.github.io/jq/manual/" text="[JQ manual]" />
        <Link
          url="https://github.com/kpopnet/kpopnet.json/blob/master/kpopnet.d.ts"
          text="[JSON schema]"
        />
      </p>
      <p class="text-center text-[20px] text-zinc-500">Try example filters</p>
      <ul class="space-y-1 list-disc ml-[10px]">
        <Query text="First 5 idols" query=".idols[:5]" />
        <Query
          text="Average height"
          query="[.idols[].height | select(. != null)] | add/length"
        />
        <Query
          text="Common names"
          query=".idols | group_by(.real_name_original)[] | select(length>=4)"
        />
        <Query
          text="Long group names"
          query=".groups | sort_by(.name | -length)[:5]"
        />
        <Query
          text="Debuts per year"
          query='.groups | group_by(.debut_date[:4]) | sort_by(-length)[] | "\(.[0].debut_date[:4]): \(length)"'
        />
      </ul>
    </div>
  );
}

function Query(p: { text: string; query: string }) {
  const [_, setView] = useRouter();
  function handleClick(e: MouseEvent) {
    e.preventDefault();
    setView({ query: p.query });
  }
  return (
    <li>
      <div class="flex items-center">
        <span class="flex-[0_80px] sm:flex-[0_140px]">{p.text}</span>
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
