import { type JQOptions } from "./jq";

export class JQQueryStorage {
  FILTERS_KEY = "KN_JQ_FILTERS";
  LAST_FILTER_KEY = "KN_JQ_LAST_FILTER";
  MAX_LINES = 50;

  private lineIdx: number = 0; // arrow up/down index
  private lines: string[] = []; // ["searched last", "searced first"]
  private lastLine: string = ""; // "last typed in input"

  constructor(initQ: string) {
    try {
      this.lastLine = localStorage.getItem(this.LAST_FILTER_KEY) || "";
      const val = localStorage.getItem(this.FILTERS_KEY) || "[]";
      this.lines = JSON.parse(val);
    } catch (err) {
      console.error(err);
    }
    if (!Array.isArray(this.lines)) this.lines = [];

    if (initQ && initQ !== this.lastLine) {
      // ?jq="query from url" ->
      // lines = ["searched last", "searched first", "last typed in input"]
      // lastLine = "query from url"
      if (this.lastLine && this.lastLine !== this.lastSaved) {
        this.lines.push(this.lastLine);
      }
      this.lastLine = initQ;
    }

    this.lineIdx = this.lines.length;
  }

  private get lastSaved(): string | undefined {
    return this.lines.length ? this.lines[this.lines.length - 1] : undefined;
  }

  last(): string {
    return this.lastLine;
  }

  setLast(q: string) {
    this.lastLine = q;
    // scroll to last when changing any line in history
    this.lineIdx = this.lines.length;
    try {
      localStorage.setItem(this.LAST_FILTER_KEY, q);
    } catch (err) {
      console.error(err);
    }
  }

  prevLine(): string {
    if (!this.lines.length) return this.last();
    if (
      this.lineIdx === this.lines.length &&
      this.lastLine === this.lastSaved
    ) {
      // go back twice if last line was sent to jq and saved in lines
      this.lineIdx = Math.max(0, this.lineIdx - 1);
    }
    this.lineIdx = Math.max(0, this.lineIdx - 1);
    return this.lines[this.lineIdx];
  }

  nextLine(): string {
    // lineIdx = length -> show last
    if (this.lineIdx < this.lines.length) this.lineIdx++;
    if (this.lineIdx < this.lines.length) return this.lines[this.lineIdx];
    return this.last();
  }

  pushLine(q: string) {
    // pushed line is last now
    this.setLast(q);
    // no dups or empty
    q = q.trim();
    if (!q || q === this.lastSaved) return;

    this.lines.push(q);
    this.lines = this.lines.slice(-this.MAX_LINES);
    this.lineIdx = this.lines.length; // scroll to last again
    const val = JSON.stringify(this.lines);
    try {
      localStorage.setItem(this.FILTERS_KEY, val);
    } catch (err) {
      console.error(err);
    }
  }
}

export class JQOptsStorage {
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
