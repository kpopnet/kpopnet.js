import moduleUrl from "jqw/jq.js?url";
import wasmUrl from "jqw/jq.wasm?url";
import type { JQ } from "jqw";
import type { Profiles } from "kpopnet.json";
import type { AnsiUp } from "ansi_up";

import { logTimes } from "../../lib/utils";

export interface JQOptions {
  // monochrome?: boolean;
  compact?: boolean;
  // raw?: boolean;
}

class JQWrapper {
  jq: JQ;
  AnsiCtor: new () => AnsiUp;

  constructor(jq: JQ, AnsiCtor: new () => AnsiUp) {
    this.jq = jq;
    this.AnsiCtor = AnsiCtor;
  }

  getCliOpts(q: string, opts: JQOptions): string[] {
    // options.push("--sort-keys");
    // options.push("--raw-input");
    // options.push("--slurp");
    const cli = ["--raw-output", "--color-output"];
    // if (opts.monochrome) cli.push("--monochrome-output");
    if (opts.compact) cli.push("--compact-output");
    // if (opts.raw) cli.push("--raw-output");
    cli.push(q, "kpopnet.json");
    return cli;
  }

  async run(q: string, opts: JQOptions = {}): Promise<string> {
    /*dev*/ const dev = import.meta.env.DEV;
    /*dev*/ const tStart = dev ? performance.now() : 0;

    const cliOpts = this.getCliOpts(q, opts);
    let output = await this.jq.run(cliOpts);
    output = output.slice(0, 50_000); // FIXME: don't show too much in UI
    /*dev*/ const tRun = dev ? performance.now() : 0;

    /*dev*/ if (dev) logTimes("jq", tStart, "run", tRun);
    return output;
  }

  renderAnsi(output: string): string {
    /*dev*/ const dev = import.meta.env.DEV;
    /*dev*/ const tStart = dev ? performance.now() : 0;
    const ansi_up = new this.AnsiCtor();
    ansi_up.use_classes = true;
    const html = ansi_up.ansi_to_html(output);
    /*dev*/ const tRun = dev ? performance.now() : 0;
    /*dev*/ if (dev) logTimes("ansi", tStart, "run", tRun);
    return html;
  }
}

export type JQW = JQWrapper;

export async function loadJQW(profiles: Profiles): Promise<JQW> {
  /*dev*/ const dev = import.meta.env.DEV;
  /*dev*/ const tStart = dev ? performance.now() : 0;

  const loadJQ = (await import("jqw")).default;
  const AnsiCtor = (await import("ansi_up")).AnsiUp;
  /*dev*/ const tLoad = dev ? performance.now() : 0;

  const data = JSON.stringify(profiles);
  /*dev*/ const tStr = dev ? performance.now() : 0;

  const jq = await loadJQ({ moduleUrl, wasmUrl, path: "kpopnet.json", data });
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

  return new JQWrapper(jq, AnsiCtor);
}
