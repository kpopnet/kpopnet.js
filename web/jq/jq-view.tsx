import {
  type Accessor,
  createSignal,
  onMount,
  Switch,
  Match,
  JSXElement,
  createEffect,
  Show,
  createMemo,
} from "solid-js";

import type { Profiles, Item } from "../../lib/types";
import { type JQW, type JQOptions, cachedJQW } from "./jq";
import JQInput from "./jq-input";
import { JQOptsStorage } from "./jq-storage";
import type { Cache } from "../../lib/search";
import { useRouter } from "../router/router";
import {
  IconClear,
  IconCollapse,
  IconExpand,
  IconHelp,
  IconSection,
} from "../icons/icons";
import { showError } from "../../lib/utils";
import { ShowTransition } from "../animation/animation";
import JQHelp from "./jq-help";
import { MixedItemList } from "../item-list/item-list";
import { ToggleTooltipIcon, TooltipIcon } from "../tooltip/tooltip";

export default function JQView(p: {
  focus: Accessor<number>;
  profiles: Profiles;
  cache: Cache;
}) {
  const [view, setView] = useRouter();
  const [getJQ, setJQ] = createSignal<JQW>();
  const [loadingErr, setLoadingErr] = createSignal<any>();
  const [running, setRunning] = createSignal(false);
  const [runningErr, setRunningErr] = createSignal<any>();
  const [options, setOptions] = createSignal(JQOptsStorage.load());
  const [showHelp, setShowHelp] = createSignal(!view.query());
  const [reset, setReset] = createSignal(0);

  const [output, setOutput] = createSignal("");
  const outputHTML = createMemo(() => getJQ()?.renderAnsi(output()));
  const matchedItems = createMemo(() => matchJQOutput(output(), p.cache));

  const loading = () => !loadingErr() && !getJQ();
  const hasInfo = () => loadingErr() || running() || runningErr() || output();

  function setOption(name: string, value: any) {
    setOptions((prev: JQOptions) => ({ ...prev, [name]: value }));
    JQOptsStorage.save(options());
  }
  function toggleOption(name: string) {
    setOption(name, !(options() as any)[name]);
  }
  function saveHeight(height: number) {
    options().height = height; // don't need to trigger update
    JQOptsStorage.save(options());
  }

  function handleReset() {
    setView({ query: "" });
    setOptions(JQOptsStorage.clear());
    setReset(reset() + 1); // trigger update
  }

  onMount(async () => {
    try {
      setJQ(await cachedJQW(p.profiles, p.cache));
    } catch (err) {
      setLoadingErr(err);
      console.error(err);
    }
  });

  // run after jq load and on query change
  createEffect((prev) => {
    if (!getJQ()) return;
    if (prev !== view.query()) {
      search();
      if (!view.query()) {
        setOutput("");
        setShowHelp(true);
      }
    }
    return view.query();
  });
  // run on option change
  createEffect((prev) => {
    if (prev !== options()) search();
    return options();
  }, options());

  async function search() {
    if (running()) return;
    const jq = getJQ();
    if (!jq) return;
    const q = view.query().trim();
    if (!q) return;
    setRunning(true);
    setShowHelp(false);
    try {
      setOutput(await jq.run(q, options()));
    } catch (err) {
      setRunningErr(err);
      console.error(err);
    } finally {
      setRunning(false);
    }
  }

  return (
    <>
      <JQInput
        focus={p.focus}
        reset={reset}
        loading={loading()}
        running={running()}
      />
      <div class="flex my-3 gap-x-3 justify-center">
        <TooltipIcon tooltip="Help">
          <IconHelp
            class="icon_control"
            onClick={() => setShowHelp(!showHelp())}
          />
        </TooltipIcon>
        <ToggleTooltipIcon
          tooltip="Full/Compact output"
          active={options().compact}
          on={IconExpand}
          off={IconCollapse}
          onClick={() => toggleOption("compact")}
        />
        <TooltipIcon tooltip="Clear">
          <IconClear class="icon_control" onClick={handleReset} />
        </TooltipIcon>
      </div>
      <ShowTransition when={showHelp}>
        <JQHelp />
      </ShowTransition>
      <Show when={hasInfo()}>
        <JQOutput initHeight={options().height} saveHeight={saveHeight}>
          <Switch>
            <Match when={loadingErr()}>
              Loading error: {showError(loadingErr())}
            </Match>
            <Match when={runningErr()}>
              Runtime error: {showError(runningErr())}
            </Match>
            <Match when>
              <div innerHTML={outputHTML()} />
            </Match>
          </Switch>
        </JQOutput>
      </Show>
      <Show when={matchedItems().length}>
        <ItemSection items={matchedItems} cache={p.cache} />
      </Show>
    </>
  );
}

function JQOutput(p: {
  initHeight?: number;
  saveHeight: (height: number) => void;
  children: JSXElement;
}) {
  const [resizing, setResizing] = createSignal(false);
  const [height, setHeight] = createSignal(p.initHeight ?? 200);
  const px = (n: number) => n + "px";
  let outputEl: HTMLElement;
  let startY = 0;
  let startH = 0;
  function handleMouseDown(e: MouseEvent) {
    if (resizing()) return;
    e.preventDefault();
    startY = e.clientY;
    startH = outputEl.getBoundingClientRect().height;
    setResizing(true);

    document.body.addEventListener("mousemove", handleGlobalMove);
    document.body.addEventListener(
      "mouseup",
      function handleMouseUp(e: MouseEvent) {
        e.preventDefault();
        setResizing(false);
        p.saveHeight(height());
        document.body.removeEventListener("mousemove", handleGlobalMove);
        document.body.removeEventListener("mouseup", handleMouseUp);
      }
    );
  }
  function handleGlobalMove(e: MouseEvent) {
    setHeight(startH + e.clientY - startY);
  }
  return (
    <div class="relative">
      <div
        class="absolute z-10 left-0 right-0 -bottom-[5px] h-[10px] cursor-ns-resize"
        onMouseDown={handleMouseDown}
      />
      <article
        ref={outputEl!}
        class="ansi whitespace-pre-wrap break-all
          p-[9px] min-h-[50px] overflow-y-auto
          border border-kngray-1"
        style={{
          height: px(height()),
          "max-height": px(height()),
        }}
      >
        {p.children}
      </article>
    </div>
  );
}

function ItemSection(p: { items: Accessor<Item[]>; cache: Cache }) {
  const [show, setShow] = createSignal(true);
  return (
    <>
      <div class="my-5 text-[20px] text-center">
        <IconSection
          class="icon_text_control w-[30px] h-[30px] inline-block"
          onClick={() => setShow(!show())}
        />{" "}
        <span class="align-middle text-neutral-400 select-none">
          Matched {p.items().length} item{p.items().length > 1 ? "s" : ""}
        </span>
      </div>
      <Show when={show()}>
        <MixedItemList allItems={p.items} cache={p.cache} />
      </Show>
    </>
  );
}

// "id"\e[0m\e[1;39m: \e[0m\e[0;32m"<id>"
const ANSI_RE = "(?:\\x1b\\[[0-9;]*m)*";
const ID_RE = new RegExp(`"id"${ANSI_RE}:\\s*${ANSI_RE}"([^"]+)"`, "g");

function matchJQOutput(output: string, cache: Cache): Item[] {
  const items: Item[] = [];
  if (!output) return items;
  for (const m of output.matchAll(ID_RE)) {
    const id = m[1];
    // TODO(Kagami): itemMap: Map<string, Item>?
    const foundIdol = cache.idolMap.get(id);
    if (foundIdol) {
      items.push(foundIdol);
      continue;
    }
    const foundGroup = cache.groupMap.get(id);
    if (foundGroup) {
      items.push(foundGroup);
    }
  }
  return items;
}
