import {
  Show,
  createMemo,
  createResource,
  createSignal,
  onMount,
} from "solid-js";

import type { Profiles, Item, Idol } from "../../lib/types";
import type { Cache } from "../../lib/search";
import type { Plot } from "./plot";
import { type JQW, cachedJQW } from "../jq/jq";
import { getIdolGen } from "../../lib/date";
import { savePlot, withTime } from "../../lib/utils";
import PlotInput from "./plot-input";
import FieldSelect from "./plot-select";
import PlotResize from "./plot-resize";
import { IconClear, IconSave } from "../icons/icons";

const GEN_FIELD = "(generation)";

export default function PlotView(p: { profiles: Profiles; cache: Cache }) {
  // const [view, setView] = useRouter();
  const [getPlot, setPlot] = createSignal<Plot>();
  const [getJQ, setJQ] = createSignal<JQW>();
  const [loadingErr, setLoadingErr] = createSignal<any>();
  // const loading = () => !loadingErr() && !getPlot() && !getJQ();
  const [height, setHeight] = createSignal(400);

  // TODO(Kagami): populate from URL
  const [query, setQuery] = createSignal(".idols");
  const [xValue, setXValue] = createSignal("weight");
  const [yValue, setYValue] = createSignal("height");
  const [infoValue, setInfoValue] = createSignal("name");
  const [graphValue, setGraphValue] = createSignal("auto");
  const [sizeValue, setSizeValue] = createSignal("");
  const [colorValue, setColorValue] = createSignal(GEN_FIELD);

  const [itemsUnparsed] = createResource(
    () => getJQ() && ([getJQ()!, query()] as const),
    ([jq, q]) => jq.runBare(q)
  );
  const [itemsParsed] = createResource(
    itemsUnparsed,
    (s) => JSON.parse(s) as Item[]
  );
  const fields = createMemo(() => {
    if (itemsParsed.error) return [];
    const items = itemsParsed();
    if (!items || !items.length) return [];
    return Object.keys(items[0]);
  });
  const graphFields = () => ["auto", "dot"];
  const colorFields = () => [GEN_FIELD].concat(fields());

  const rendered = createMemo(() => {
    const Plot = getPlot();
    if (!Plot || itemsParsed.error) return;
    const items = itemsParsed();
    if (!items) return;
    return withTime("plot", () =>
      Plot.plot({
        color: {
          legend: true,
        },
        style: {
          background: "transparent",
        },
        className: "kn-plot",
        width: 780, // viewBox dimensions, will scale on mobile
        height: height(),
        marks: [
          Plot.dot(items, {
            x: xValue(),
            y: yValue(),
            fill: (i: Idol) => "gen" + getIdolGen(i),
            channels: { [infoValue()]: infoValue() },
            tip: true,
          }),
        ],
      })
    );
  });

  function handleSave() {
    const plot = document.querySelector(".kn-plot-figure");
    if (plot) {
      savePlot(plot as HTMLElement);
    }
  }

  onMount(async () => {
    try {
      setPlot(await cachedPlot());
      setJQ(await cachedJQW(p.profiles, p.cache));
    } catch (err) {
      setLoadingErr(err);
      console.error(err);
    }
  });

  async function cachedPlot() {
    if (p.cache.custom.plot) return p.cache.custom.plot;
    const plot = (await import("./plot")).default;
    p.cache.custom.plot = plot;
    return plot;
  }

  // FIXME(Kagami): loading, loadingERr
  return (
    <>
      <section class="relative">
        <PlotResize height={height()} setHeight={setHeight}>
          {rendered()}
        </PlotResize>
        <Show when={rendered()}>
          <div class="absolute top-0 right-0 flex gap-x-2">
            <IconSave onClick={handleSave} class="icon_control" />
          </div>
        </Show>
      </section>
      <section class="grid grid-cols-3 gap-1">
        <PlotInput
          value={query()}
          setValue={setQuery}
          error={itemsParsed.error}
          loading={itemsParsed.loading}
        />
        <FieldSelect
          value={xValue()}
          setValue={setXValue}
          fields={fields()}
          label="X"
        />
        <FieldSelect
          value={yValue()}
          setValue={setYValue}
          fields={fields()}
          label="Y"
        />
        <FieldSelect
          value={infoValue()}
          setValue={setInfoValue}
          fields={fields()}
          label="Info"
        />
        <FieldSelect
          default="auto"
          value={graphValue()}
          setValue={setGraphValue}
          fields={graphFields()}
          label="Graph"
        />
        <FieldSelect
          value={sizeValue()}
          setValue={setSizeValue}
          fields={fields()}
          label="Size"
        />
        <FieldSelect
          default={GEN_FIELD}
          value={colorValue()}
          setValue={setColorValue}
          fields={colorFields()}
          label="Color"
        />
      </section>
    </>
  );
}
