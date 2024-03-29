import { type JQOptions } from "./jq";

export class JQQueryStorage {
  MAX_LINES = 50;

  private filtersKey: string;
  private lastFilterKey: string;

  private lineIdx: number = 0; // arrow up/down index
  private lines: string[] = []; // ["searched last", "searced first"]
  private lastLine: string = ""; // "last typed in input"

  constructor(urlQuery: string, key = "JQ") {
    this.filtersKey = `KN_${key}_FILTERS`;
    this.lastFilterKey = `KN_${key}_LAST_FILTER`;
    try {
      this.lastLine = localStorage.getItem(this.lastFilterKey) || "";
      const val = localStorage.getItem(this.filtersKey) || "[]";
      this.lines = JSON.parse(val);
    } catch (err) {
      console.error(err);
    }
    if (!Array.isArray(this.lines)) this.lines = [];
    this.lineIdx = this.lines.length;

    if (urlQuery) {
      // ?jq="query from url" ->
      //   lines = ["searched last", "last typed in input"]
      //   lastLine = "query from url"
      // Dedup is checked by `pushLine`
      this.pushLine(urlQuery);
    }
  }

  private get lastSaved(): string | undefined {
    return this.lines.length ? this.lines[this.lines.length - 1] : undefined;
  }

  private get prevLastSaved(): string | undefined {
    return this.lines.length > 1
      ? this.lines[this.lines.length - 2]
      : undefined;
  }

  last(): string {
    return this.lastLine;
  }

  setLast(q: string) {
    this.lastLine = q;
    // scroll to last when changing any line in history
    this.lineIdx = this.lines.length;
    try {
      localStorage.setItem(this.lastFilterKey, q);
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

  // push line, preserving the last typed
  pushLine(q: string) {
    this.pushSingleLine(this.lastLine);
    this.pushSingleLine(q);
    // pushed line is last now
    this.setLast(q);
  }

  private pushSingleLine(q: string) {
    // no dups or empty in history
    q = q.trim();
    if (!q || q === this.lastSaved || q === this.prevLastSaved) return;

    this.lines.push(q);
    this.lines = this.lines.slice(-this.MAX_LINES);
    this.lineIdx = this.lines.length; // scroll to last again
    const val = JSON.stringify(this.lines);
    try {
      localStorage.setItem(this.filtersKey, val);
    } catch (err) {
      console.error(err);
    }
  }
}

export class JQOptsStorage {
  static JQ_OPTS_KEY = "KN_JQ_OPTS";
  static JQ_OPTS_DEFAULT: JQOptions = {};

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
