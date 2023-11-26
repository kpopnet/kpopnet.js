import {
  type Accessor,
  createMemo,
  createResource,
  createSignal,
} from "solid-js";

import { ItemRoute, useRouter } from "../router/router";
import type { Profiles, Item } from "../../lib/types";
import type { Cache } from "../../lib/search";
import { cachedJQW } from "../jq/jq";
import type { Plot, PlotRender } from "./plot";
import PlotInput from "./plot-input";
import PlotSelect from "./plot-select";
import PlotResize from "./plot-resize";
import { savePlot } from "./plot-utils";
import { IconPeople, IconPerson, IconSave } from "../icons/icons";
import { type Values, GEN_FIELD, renderPlot, smartFields } from "./plot-render";
import PlotHelp from "./plot-help";
import ToggleIcon from "../icons/toggle";

const DEFAULT_QUERY = ".idols";
const DEFAULT_IDOL_X = "weight";
const DEFAULT_IDOL_Y = "height";
const DEFAULT_GROUP_X = "debut_date";
const DEFAULT_GROUP_Y = "members";

const DEFAULT_VALUES: Values = {
  x: "",
  y: "",
  graph: "dot", // FIXME: default = auto?
  size: "",
  symbol: "",
  color: GEN_FIELD,
};

export default function PlotView(p: {
  focus: Accessor<number>;
  profiles: Profiles;
  cache: Cache;
}) {
  const [view, setView] = useRouter();
  const query = () => view.query() || DEFAULT_QUERY;
  const setQuery = (query: string) => setView({ query });
  const isGroupQuery = () => query().trim().startsWith(".groups");
  const toggleQuery = () => setQuery(isGroupQuery() ? ".idols" : ".groups");

  const [_values, setValues] = createSignal(DEFAULT_VALUES);
  const setValue = (k: string, v: string) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  // account resources which are async or can fail
  // don't need to check for sync/pure functions
  const loading = () => getPlot.loading || getJQ.loading;
  const running = () => itemsUnparsed.loading;
  const error = () =>
    getPlot.error || getJQ.error || itemsUnparsed.error || itemsParsed.error;

  const [getPlot] = createResource(cachedPlot);
  const [getJQ] = createResource(() => cachedJQW(p.profiles, p.cache));
  const [itemsUnparsed] = createResource(
    () => !getJQ.error && getJQ() && ([getJQ()!, query()] as const),
    ([jq, q]) => jq.runBare(q)
  );
  const [itemsParsed] = createResource(
    () => !itemsUnparsed.error && itemsUnparsed(),
    async (s) => {
      const items = JSON.parse(s) as Item[];
      if (!Array.isArray(items)) throw Error("not an array");
      return items;
    }
  );
  const [_fields] = createResource(
    () => !itemsParsed.error && itemsParsed(),
    (items) => (items.length ? Object.keys(items[0]) : [])
  );
  const fields = () => smartFields(_fields() || []);
  const axisFields = () =>
    fields().filter(
      (f) =>
        !["id", "urls", "thumb_url", "parent_id", "agency_name"].includes(f) &&
        !f.startsWith("name") &&
        !f.startsWith("real_name")
    );
  const graphFields = () => ["dot"];

  // Change default fields based on parsed items
  let wasGroup = false;
  let wasIdol = false;
  const mbValue = (f: string[], v: string) => (f.includes(v) ? v : "");
  const values = createMemo<Values>(() => {
    const f = fields();
    const v = _values();
    const isGroup = f.includes("members");
    const isIdol = f.includes("groups");
    const toGroup = !wasGroup && isGroup;
    const toIdol = !wasIdol && isIdol;
    wasGroup = isGroup;
    wasIdol = isIdol;
    if (toGroup || toIdol) {
      // change without triggering update
      v.x = toGroup ? DEFAULT_GROUP_X : DEFAULT_IDOL_X;
      v.y = toGroup ? DEFAULT_GROUP_Y : DEFAULT_IDOL_Y;
    }

    return {
      x: mbValue(f, v.x),
      y: mbValue(f, v.y),
      graph: v.graph,
      size: mbValue(f, v.size),
      symbol: mbValue(f, v.symbol),
      color: mbValue(f, v.color),
    };
  });

  const [height, setHeight] = createSignal(400);
  const rendered = createMemo<PlotRender | undefined>((prev) => {
    if (getPlot.error || itemsParsed.error) return prev;
    const Plot = getPlot();
    const items = itemsParsed();
    if (!Plot || !items) return; // still loading

    const plot = renderPlot(Plot, items, values(), height());
    // go to corresponding item page if clicked inside tip
    plot.addEventListener("click", (e: Event) => {
      const target = e.target as HTMLElement;
      const clickedPlot = target.classList.contains("kn-plot");
      if (plot.value && plot.value.id && !clickedPlot) {
        setView({ route: ItemRoute, query: plot.value.id });
      }
    });
    return plot;
  });

  function handleSave() {
    let plotEl = document.querySelector(".kn-plot-figure");
    if (!plotEl) {
      // plot() returns either <svg class="kn-plot"> or <figure class="kn-plot-figure">
      plotEl = document.querySelector(".kn-plot");
    }
    if (plotEl) {
      savePlot(plotEl as HTMLElement);
    }
  }

  async function cachedPlot(): Promise<Plot> {
    if (p.cache.custom.plot) return p.cache.custom.plot;
    const Plot = (await import("./plot")).default;
    p.cache.custom.plot = Plot;
    return Plot;
  }

  return (
    <>
      <section class="relative">
        <PlotResize height={height()} setHeight={setHeight}>
          {rendered()}
        </PlotResize>
        <div class="absolute top-0 right-0 flex gap-x-3">
          <PlotHelp />
          <ToggleIcon
            class="icon_control"
            active={isGroupQuery()}
            on={IconPerson}
            off={IconPeople}
            onClick={toggleQuery}
          />
          <IconSave onClick={handleSave} class="icon_control" />
        </div>
      </section>
      <section class="grid grid-cols-3 gap-1">
        <PlotInput
          default={DEFAULT_QUERY}
          focus={p.focus}
          class="col-span-full"
          loading={loading()}
          running={running()}
          error={error()}
          unparsed={itemsUnparsed.error == null && itemsUnparsed()}
        />
        <PlotSelect
          value={values().x}
          setValue={(v) => setValue("x", v)}
          fields={axisFields()}
          label="X"
        />
        <PlotSelect
          value={values().y}
          setValue={(v) => setValue("y", v)}
          fields={axisFields()}
          label="Y"
        />
        <PlotSelect
          value={values().graph}
          setValue={(v) => setValue("graph", v)}
          fields={graphFields()}
          label="Graph"
          nonEmpty
        />
        <PlotSelect
          value={values().size}
          setValue={(v) => setValue("size", v)}
          fields={fields()}
          label="Size"
        />
        <PlotSelect
          value={values().symbol}
          setValue={(v) => setValue("symbol", v)}
          fields={fields()}
          label="Shape"
        />
        <PlotSelect
          value={values().color}
          setValue={(v) => setValue("color", v)}
          fields={fields()}
          label="Color"
          nonEmpty
        />
      </section>
    </>
  );
}
