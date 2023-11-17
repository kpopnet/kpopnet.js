import {
  type Accessor,
  createSignal,
  onMount,
  Switch,
  Match,
  JSXElement,
  createEffect,
  Show,
} from "solid-js";
import type { Profiles } from "kpopnet.json";

import { type JQ, type JQOptions, initJQ } from "./jq";
import JQInput from "./jq-input";
import { JQOptsStorage } from "./jq-storage";
import type { Cache } from "../../lib/search";
import { useRouter } from "../router/router";
import {
  IconCollapse,
  IconColored,
  IconExpand,
  IconHelp,
  IconMonochrome,
  IconQuote,
  IconRaw,
  IconRevert,
} from "../icons/icons";
import { showError } from "../../lib/utils";
import Tooltip from "../tooltip/tooltip";
import ToggleIcon, { type ToggleProps } from "../icons/toggle";
import { ShowTransition } from "../animation/animation";
import JQHelp from "./jq-help";

export default function JQView(p: {
  focus: Accessor<number>;
  profiles: Profiles;
  cache: Cache;
}) {
  const [view, setView] = useRouter();
  const [getJQ, setJQ] = createSignal<JQ>();
  const [loadingErr, setLoadingErr] = createSignal<any>();
  const [running, setRunning] = createSignal(false);
  const [runningErr, setRunningErr] = createSignal<any>();
  const [output, setOutput] = createSignal("");
  const [options, setOptions] = createSignal<JQOptions>(JQOptsStorage.load());
  const [showHelp, setShowHelp] = createSignal(!view.query());

  const loading = () => !loadingErr() && !getJQ();
  const empptyOutput = () =>
    !loadingErr() && !running() && !runningErr() && !output();

  function toggleFn(name: string) {
    return () => {
      setOptions((prev: any) => ({ ...prev, [name]: !prev[name] }));
      JQOptsStorage.save(options());
    };
  }

  function handleReset() {
    setView({ query: "", replace: true });
    setOptions(JQOptsStorage.clear());
  }

  onMount(async () => {
    try {
      setJQ(await loadJQ());
    } catch (err) {
      setLoadingErr(err);
    }
  });

  // run after jq load and on query change
  createEffect((prev) => {
    if (!getJQ()) return;
    if (prev !== view.query()) {
      search();
      if (!view.query()) {
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
    const q = view.query();
    if (!q) return setOutput("");
    setRunning(true);
    setShowHelp(false);
    try {
      setOutput(await jq.run(q, options()));
    } catch (err) {
      setRunningErr(err);
    } finally {
      setRunning(false);
    }
  }

  async function loadJQ() {
    if (p.cache.custom.jq) return p.cache.custom.jq;

    const jq = await initJQ(p.profiles);
    p.cache.custom.jq = jq;
    return jq;
  }

  return (
    <>
      <JQInput
        focus={p.focus}
        loading={loading()}
        loadingErr={!!loadingErr()}
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
          tooltip="Full/Compact"
          active={options().compact}
          on={IconCollapse}
          off={IconExpand}
          onClick={toggleFn("compact")}
        />
        <ToggleTooltipIcon
          tooltip="Raw/Quoted"
          active={options().raw}
          on={IconRaw}
          off={IconQuote}
          onClick={toggleFn("raw")}
        />
        <ToggleTooltipIcon
          tooltip="Colored/Monochrome"
          active={options().monochrome}
          on={IconMonochrome}
          off={IconColored}
          onClick={toggleFn("monochrome")}
        />
        <TooltipIcon tooltip="Reset and clear">
          <IconRevert class="icon_control" onClick={handleReset} />
        </TooltipIcon>
      </div>
      <ShowTransition when={showHelp}>
        <JQHelp />
      </ShowTransition>
      <Show when={!empptyOutput()}>
        <JQOutput>
          <Switch>
            <Match when={loadingErr()}>
              Loading error
              <div class="err-sm">{showError(loadingErr())}</div>
            </Match>
            <Match when={runningErr()}>
              Runtime error
              <div class="err-sm">{showError(runningErr())}</div>
            </Match>
            <Match when={running()}>Running...</Match>
            <Match when={options().monochrome}>
              <div textContent={output()} />
            </Match>
            <Match when>
              <div innerHTML={output()} />
            </Match>
          </Switch>
        </JQOutput>
      </Show>
    </>
  );
}

function JQOutput(p: { children: JSXElement }) {
  const [resizing, setResizing] = createSignal(false);
  const [height, setHeight] = createSignal(300);
  const px = (n: number) => n + "px";
  let outputEl: HTMLElement;
  let startY = 0;
  let startH = 0;
  function handleMouseDown(e: MouseEvent) {
    if (resizing()) return;
    startY = e.clientY;
    startH = outputEl.getBoundingClientRect().height;
    setResizing(true);

    document.body.addEventListener("mousemove", handleGlobalMove);
    document.body.addEventListener("mouseup", function handleMouseUp() {
      setResizing(false);
      document.body.removeEventListener("mousemove", handleGlobalMove);
      document.body.removeEventListener("mouseup", handleMouseUp);
    });
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
        class="ansi whitespace-pre-wrap relative
          p-[9px] min-h-[50px] overflow-y-auto
          border border-kngray-1"
        style={{
          "user-select": resizing() ? "none" : undefined,
          height: px(height()),
          "max-height": px(height()),
        }}
      >
        {p.children}
      </article>
    </div>
  );
}

function TooltipIcon(p: { tooltip: string; children: JSXElement }) {
  return (
    <Tooltip content={p.tooltip} left={-8} top={-6}>
      {p.children}
    </Tooltip>
  );
}

function ToggleTooltipIcon(p: ToggleProps & { tooltip: string }) {
  return (
    <TooltipIcon tooltip={p.tooltip}>
      <ToggleIcon class="icon_control" {...p} />
    </TooltipIcon>
  );
}
