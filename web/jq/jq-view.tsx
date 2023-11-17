import {
  type Accessor,
  createSignal,
  onMount,
  Switch,
  Match,
  JSXElement,
  createEffect,
} from "solid-js";
import type { Profiles } from "kpopnet.json";

import type { Cache } from "../../lib/search";
import { type JQ, type JQOptions, initJQ } from "./jq";
import { useRouter } from "../router/router";
import SearchArea from "../input/search-area";
import {
  IconCollapse,
  IconColored,
  IconExpand,
  IconMonochrome,
  IconQuote,
  IconRaw,
  IconRevert,
} from "../icons/icons";
import { showError } from "../../lib/utils";
import Tooltip from "../tooltip/tooltip";
import ToggleIcon, { type ToggleProps } from "../icons/toggle";

export default function JQView(p: {
  focus: Accessor<number>;
  profiles: Profiles;
  cache: Cache;
}) {
  const [view, _] = useRouter();
  const [getJQ, setJQ] = createSignal<JQ>();
  const [loadingErr, setLoadingErr] = createSignal<any>();
  const loading = () => !loadingErr() && !getJQ();
  const [running, setRunning] = createSignal(false);
  const [runningErr, setRunningErr] = createSignal<any>();
  const [output, setOutput] = createSignal("");
  const [options, setOptions] = createSignal<JQOptions>(
    JQOptionsStorage.load()
  );

  function toggleFn(name: string) {
    return () => {
      setOptions((prev: any) => ({ ...prev, [name]: !prev[name] }));
      JQOptionsStorage.save(options());
    };
  }

  onMount(async () => {
    try {
      setJQ(await loadJQ());
    } catch (err) {
      setLoadingErr(err);
    }
  });

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
    try {
      setOutput(await jq.run(q, options()));
    } catch (err) {
      setRunningErr(err);
    } finally {
      setRunning(false);
    }
  }

  async function loadJQ() {
    let jq: JQ;
    if (p.cache.custom.jq) {
      jq = p.cache.custom.jq;
    } else {
      jq = await initJQ(p.profiles);
      p.cache.custom.jq = jq;
    }
    return jq;
  }

  return (
    <>
      <SearchArea
        focus={p.focus}
        loading={loading()}
        loadingErr={!!loadingErr()}
        running={running()}
        onSearch={search}
      />
      <div class="flex my-3 gap-x-3 w-full justify-center">
        <ToggleTooltipIcon
          tooltip="Compact/Full"
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
        <TooltipIcon tooltip="Reset settings">
          <IconRevert
            class="icon_control"
            onClick={() => setOptions(JQOptionsStorage.clear())}
          />
        </TooltipIcon>
      </div>
      <Switch>
        <Match when={loadingErr()}>
          <JQOutput>
            Loading error
            <div class="err-sm">{showError(loadingErr())}</div>
          </JQOutput>
        </Match>
        <Match when={runningErr()}>
          <JQOutput>
            Runtime error
            <div class="err-sm">{showError(runningErr())}</div>
          </JQOutput>
        </Match>
        <Match when={running()}>
          <JQOutput>Running...</JQOutput>
        </Match>
        <Match when={loading() || !view.query()}>
          <JQHelp />
        </Match>
        <Match when={options().monochrome}>
          <JQOutput>
            <div textContent={output()} />
          </JQOutput>
        </Match>
        <Match when>
          <JQOutput>
            <div innerHTML={output()} />
          </JQOutput>
        </Match>
      </Switch>
    </>
  );
}

function JQOutput(p: { children: JSXElement }) {
  return (
    <article
      class="ansi whitespace-pre-wrap
      h-[300px] p-[9px] overflow-y-scroll break-words
      border border-kngray-1"
    >
      {p.children}
    </article>
  );
}

function JQHelp() {
  return (
    <div class="text-center">
      <p>Apply complicated JQ quieries to the profiles data</p>
      <a
        class="link"
        href="https://jqlang.github.io/jq/manual/"
        target="_blank"
        rel="noopener noreferrer"
      >
        JQ Manual
      </a>
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

class JQOptionsStorage {
  static JQ_OPTS_KEY = "KN_JQ_OPTS";
  static JQ_OPTS_DEFAULT: JQOptions = { raw: true };

  static defaults(): JQOptions {
    return structuredClone(this.JQ_OPTS_DEFAULT);
  }

  static load(): JQOptions {
    const defaults = this.defaults();
    try {
      const val = localStorage.getItem(this.JQ_OPTS_KEY);
      if (!val) return defaults;
      return JSON.parse(val);
    } catch (err) {
      console.error(err);
    }
    return defaults;
  }

  static save(opts: JQOptions) {
    try {
      localStorage.setItem(this.JQ_OPTS_KEY, JSON.stringify(opts));
    } catch (err) {
      console.error(err);
    }
  }

  static clear(): JQOptions {
    try {
      localStorage.removeItem(this.JQ_OPTS_KEY);
    } catch (err) {
      console.error(err);
    }
    return this.defaults();
  }
}
