/// <reference path="./jq.d.ts" />
import type { Aioli } from "@biowasm/aioli";
import type { AnsiUp } from "ansi_up";
import type { Profiles } from "kpopnet.json";

import { logTimes } from "../../lib/utils";

export interface JQOptions {
  monochrome?: boolean;
  compact?: boolean;
  raw?: boolean;
}

class JQHandler {
  aioli: Aioli;
  // ansi_up: AnsiUp;
  AnsiCtor: new () => AnsiUp;

  constructor(aioli: Aioli, AnsiCtor: new () => AnsiUp) {
    this.aioli = aioli;
    this.AnsiCtor = AnsiCtor;
    // this.ansi_up = new AnsiCtor();
    // this.ansi_up.use_classes = true;
  }

  getCliOpts(q: string, opts: JQOptions): string[] {
    // options.push("--sort-keys");
    // options.push("--raw-input");
    // options.push("--slurp");
    const cli = [];
    if (opts.monochrome) cli.push("--monochrome-output");
    if (opts.compact) cli.push("--compact-output");
    if (opts.raw) cli.push("--raw-output");
    cli.push(q, "kpopnet.json");
    return cli;
  }

  async run(q: string, opts: JQOptions = {}): Promise<string> {
    /*dev*/ const dev = import.meta.env.DEV;
    /*dev*/ const tStart = dev ? performance.now() : 0;

    const cliOpts = this.getCliOpts(q, opts);
    let output = await this.aioli.exec("jq", cliOpts);
    /*dev*/ const tRun = dev ? performance.now() : 0;

    output = output.slice(0, 50_000); // FIXME: don't show too much in UI
    const ansi_up = new this.AnsiCtor(); // FIXME: breakes output when reusing
    ansi_up.use_classes = true;
    output = opts.monochrome ? output : ansi_up.ansi_to_html(output);
    /*dev*/ const tHtml = dev ? performance.now() : 0;

    if (dev) logTimes("jq", tStart, "run", tRun, "html", tHtml);
    return output;
  }
}
export type JQ = JQHandler;

export async function initJQ(profiles: Profiles): Promise<JQ> {
  /*dev*/ const dev = import.meta.env.DEV;
  /*dev*/ const tStart = dev ? performance.now() : 0;

  const AioliCtor = (await import("@biowasm/aioli")).default;
  const AnsiCtor = (await import("ansi_up")).AnsiUp;
  /*dev*/ const tLoad = dev ? performance.now() : 0;

  const data = JSON.stringify(profiles);
  /*dev*/ const tStr = dev ? performance.now() : 0;

  const urlPrefix = location.origin + "/static/jq/1.6";
  const aioli = await new AioliCtor([{ urlPrefix, tool: "jq" }]);
  /*dev*/ const tNew = dev ? performance.now() : 0;

  await aioli.mount([{ name: "kpopnet.json", data }]);
  /*dev*/ const tMount = dev ? performance.now() : 0;

  if (dev)
    logTimes(
      "jq-init",
      tStart,
      "loadmod",
      tLoad,
      "stringify",
      tStr,
      "aioli",
      tNew,
      "mount",
      tMount
    );

  return new JQHandler(aioli, AnsiCtor);
}
export default initJQ;
