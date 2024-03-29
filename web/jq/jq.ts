import moduleUrl from "jqw/jq-re.js?url";
import wasmUrl from "jqw/jq-re.wasm?url";
import type { JQ as JQW } from "jqw";
import type { Profiles } from "kpopnet.json";
import type { AnsiUp } from "ansi_up";

import type { Cache } from "../../lib/search";
import { logTimes, withTimeAsync } from "../../lib/utils";

export interface JQOptions {
  compact?: boolean /** pretty by default */;
  height?: number; // XXX(Kagami): not JQ option, but keep it here
}

class JQWrapper {
  private jqw: JQW;
  private AnsiCtor: new () => AnsiUp;

  constructor(jqw: JQW, AnsiCtor: new () => AnsiUp) {
    this.jqw = jqw;
    this.AnsiCtor = AnsiCtor;
  }

  private getCliOpts(q: string, opts: JQOptions): string[] {
    const cli = ["--raw-output", "--color-output"];
    if (opts.compact) cli.push("--compact-output");
    cli.push(q, "kpopnet.json");
    return cli;
  }

  run(q: string, opts: JQOptions = {}): Promise<string> {
    return withTimeAsync("jq1", async () => {
      const cliOpts = this.getCliOpts(q, opts);
      const output = await this.jqw.run(cliOpts);
      return output.slice(0, 50_000); // FIXME: don't show too much in UI
    });
  }

  runBare(q: string): Promise<string> {
    return withTimeAsync("jq2", async () => {
      const cliOpts = ["--monochrome-output", "--compact-output"];
      cliOpts.push(q, "kpopnet.json");
      return await this.jqw.run(cliOpts);
    });
  }

  renderAnsi(output: string): string {
    const ansi_up = new this.AnsiCtor();
    ansi_up.use_classes = true;
    return ansi_up.ansi_to_html(output);
  }
}

export type JQ = JQWrapper;

async function loadJQ(profiles: Profiles): Promise<JQ> {
  /*dev*/ const dev = import.meta.env.DEV;
  /*dev*/ const tStart = dev ? performance.now() : 0;

  const loadJQW = (await import("jqw")).default;
  const AnsiCtor = (await import("ansi_up")).AnsiUp;
  /*dev*/ const tLoad = dev ? performance.now() : 0;

  const data = JSON.stringify(profiles);
  /*dev*/ const tStr = dev ? performance.now() : 0;

  const jqw = await loadJQW({ moduleUrl, wasmUrl, path: "kpopnet.json", data });
  /*dev*/ const tNew = dev ? performance.now() : 0;

  if (dev)
    logTimes(
      "jq-init",
      tStart,
      "loadmod",
      tLoad,
      "stringify",
      tStr,
      "jq",
      tNew
    );

  return new JQWrapper(jqw, AnsiCtor);
}

export async function cachedJQ(profiles: Profiles, cache: Cache): Promise<JQ> {
  if (cache.custom.jq) return cache.custom.jq;
  const jq = await loadJQ(profiles);
  cache.custom.jq = jq;
  return jq;
}
