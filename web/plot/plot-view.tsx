import {
  Show,
  createMemo,
  createResource,
  createSignal,
  onMount,
} from "solid-js";

import { ItemRoute, useRouter } from "../router/router";
import type { Profiles, Item, Idol, Group } from "../../lib/types";
import type { Cache } from "../../lib/search";
import { type JQW, cachedJQW } from "../jq/jq";
import { getGroupGen, getIdolGen } from "../../lib/date";
import type { Plot, PlotRender, ChannelValue } from "./plot";
import PlotInput from "./plot-input";
import FieldSelect from "./plot-select";
import PlotResize from "./plot-resize";
import { savePlot } from "./plot-utils";
import { IconPeople, IconPerson, IconSave } from "../icons/icons";
import ToggleIcon from "../icons/toggle";

interface Values {
  x: string;
  y: string;
  graph: string;
  size: string;
  color: string;
}

const DEFAULT_QUERY = ".idols";
const DEFAULT_GRAPH = "dot";
const GEN_FIELD = "(generation)";
const SPECIAL_FIELDS = [GEN_FIELD];

const DEFAULT_IDOL_X = "weight";
const DEFAULT_IDOL_Y = "height";
const DEFAULT_GROUP_X = "debut_date";
const DEFAULT_GROUP_Y = "members";

const DEFAULT_VALUES: Values = {
  x: DEFAULT_IDOL_X,
  y: DEFAULT_IDOL_Y,
  graph: DEFAULT_GRAPH, // FIXME: default = auto?
  size: "",
  color: GEN_FIELD,
};

// Auto-format some fields values
function smartValue(field: string): ChannelValue {
  switch (true) {
    case field.endsWith("_date"):
      return (i: any) => i[field] && new Date(i[field]);
    case field === "groups":
      return (i: Idol) => i.groups.length;
    case field === "members":
      return (i: Group) => i.members.length;
    case field === GEN_FIELD:
      return (i: any) => {
        let gen: number | undefined;
        if (i.members) {
          gen = getGroupGen(i);
        } else if (i.groups && i.birth_date) {
          gen = getIdolGen(i);
        }
        return gen == null ? "unknown" : "gen" + gen;
      };
    default:
      return field;
  }
}

// Auto-provide channels
function smartChannels() {
  return {
    "[click to open]": () => "",
    name: (i: Item) => `${i.name} (${i.name_original})`,
  };
}

export default function PlotView(p: { profiles: Profiles; cache: Cache }) {
  const [_, setView] = useRouter();
  const [getPlot, setPlot] = createSignal<Plot>();
  const [getJQ, setJQ] = createSignal<JQW>();
  const [loadingErr, setLoadingErr] = createSignal<any>();
  // const loading = () => !loadingErr() && !getPlot() && !getJQ();
  const [height, setHeight] = createSignal(400);

  // TODO(Kagami): populate from URL
  const [query, setQuery] = createSignal(DEFAULT_QUERY);
  const isGroupQuery = () => query().trim().startsWith(".groups");
  const toggleQuery = () => setQuery(isGroupQuery() ? ".idols" : ".groups");

  const [_values, setValues] = createSignal<Values>(DEFAULT_VALUES);
  const setValue = (k: string, v: string) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const [itemsUnparsed] = createResource(
    () => getJQ() && ([getJQ()!, query()] as const),
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
  const fields = () => SPECIAL_FIELDS.concat(_fields() || []);
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
  const values = createMemo<Values>((prev) => {
    const f = fields(); // track fields;
    const v = _values();
    if (!prev) return v;

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
      color: mbValue(f, v.color),
    };
  });

  const rendered = createMemo<PlotRender | undefined>((prev) => {
    if (itemsParsed.error) return prev;
    const Plot = getPlot();
    const items = itemsParsed();
    if (!Plot || !items) return;
    console.log("@@@ render xy", values().x, values().y);
    const plot = Plot.plot({
      color: {
        legend: true,
      },
      style: {
        background: "transparent",
        userSelect: "none",
      },
      className: "kn-plot",
      width: 780, // viewBox dimensions, will scale on mobile
      height: height(),
      marks: [
        Plot.dot(items, {
          x: {
            label: values().x,
            value: smartValue(values().x),
          },
          y: {
            label: values().y,
            value: smartValue(values().y),
          },
          r: values().size ? smartValue(values().size) : undefined,
          fill: smartValue(values().color),
          channels: smartChannels(),
          tip: {
            fill: "#f3f4f6",
            format: {
              fill: false,
              r: false,
            },
          },
        }),
      ],
    });
    let tipItem: Item | undefined;
    plot.addEventListener("input", () => {
      tipItem = plot.value;
    });
    plot.addEventListener("click", (e: Event) => {
      const target = e.target as HTMLElement;
      const clickedPlot = target.classList.contains("kn-plot");
      if (tipItem && !clickedPlot) {
        setView({ route: ItemRoute, query: tipItem.id });
      }
    });
    return plot;
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
    const Plot = (await import("./plot")).default;
    p.cache.custom.plot = Plot;
    return Plot;
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
            <ToggleIcon
              class="icon_control"
              active={isGroupQuery()}
              on={IconPeople}
              off={IconPerson}
              onClick={toggleQuery}
            />
            <IconSave onClick={handleSave} class="icon_control" />
          </div>
        </Show>
      </section>
      <section class="grid grid-cols-3 gap-1">
        <PlotInput
          value={query()}
          setValue={setQuery}
          loading={itemsParsed.loading}
          unparsedError={itemsUnparsed.error}
          parsedError={itemsParsed.error}
          unparsed={itemsUnparsed.error == null ? itemsUnparsed() : undefined}
        />
        <FieldSelect
          value={values().x}
          setValue={(v) => setValue("x", v)}
          fields={axisFields()}
          label="X"
        />
        <FieldSelect
          value={values().y}
          setValue={(v) => setValue("y", v)}
          fields={axisFields()}
          label="Y"
        />
        <FieldSelect
          value={values().graph}
          setValue={(v) => setValue("graph", v)}
          fields={graphFields()}
          label="Graph"
          noEmpty
        />
        <FieldSelect
          value={values().size}
          setValue={(v) => setValue("size", v)}
          fields={fields()}
          label="Size"
        />
        <FieldSelect
          value={values().color}
          setValue={(v) => setValue("color", v)}
          fields={fields()}
          label="Color"
          noEmpty
        />
      </section>
    </>
  );
}