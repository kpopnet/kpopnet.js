import type { PlotRender, Plot, ChannelValue } from "./plot";
import type { Item, Idol, Group } from "../../lib/types";
import {
  getAge,
  getDebutAge,
  getGroupGen,
  getIdolGen,
  getLifespan,
} from "../../lib/date";
import {
  type Values,
  AGE_FIELD,
  DEBUT_AGE_FIELD,
  GEN_FIELD,
  LIFESPAN_FIELD,
} from "../../lib/plot";

export function smartFields(fields: string[]): string[] {
  // actually user might have changed other fields with JQ query but this
  // heuristic should be good enough
  const isGroup = fields.includes("members");
  const isIdol = fields.includes("groups");

  const special = [GEN_FIELD];
  if (isGroup) {
    special.push(LIFESPAN_FIELD);
  } else if (isIdol) {
    special.push(AGE_FIELD, DEBUT_AGE_FIELD);
  }
  return special.concat(fields);
}

// Auto-format some fields values
function smartValue(field: string): ChannelValue {
  if (!field) return null;
  if (field.endsWith("_date")) {
    return (x: any) => x[field] && new Date(x[field]);
  }
  switch (field) {
    case "groups":
      return (i: Idol) => i.groups.length;
    case "members":
      return (g: Group) => g.members.length;
    // TODO: half-gens?
    case GEN_FIELD:
      return (x: any) => {
        const gen = x.members ? getGroupGen(x) : getIdolGen(x);
        return gen == null ? "unknown" : "gen" + gen;
      };
    // TODO: return floats?
    case LIFESPAN_FIELD:
      return (g: Group) => getLifespan(g.debut_date, g.disband_date);
    case AGE_FIELD:
      return (i: Idol) => getAge(i.birth_date);
    case DEBUT_AGE_FIELD:
      return (i: Idol) => getDebutAge(i.birth_date, i.debut_date);
    default:
      return field;
  }
}

// Auto-provide channels
function smartChannels() {
  return {
    "[click to open]": () => "",
    name: "name",
  };
}

function toLabel(field: string) {
  if (!field) return;
  return {
    label: field,
    value: smartValue(field),
  };
}

export function renderPlot(
  Plot: Plot,
  items: Item[],
  values: Values,
  height: number
): PlotRender {
  if (import.meta.env.DEV) console.log("render xy", values.x, values.y);
  const plot = Plot.plot({
    style: {
      background: "transparent",
      userSelect: "none",
    },
    className: "kn-plot",
    width: 780, // viewBox dimensions, will scale on mobile
    height,
    color: {
      label: values.color,
      legend: true,
      // scheme: "Inferno",
    },
    marks: [
      Plot.dot(items, {
        x: toLabel(values.x),
        y: toLabel(values.y),
        r: toLabel(values.size),
        symbol: toLabel(values.symbol),
        fill: smartValue(values.color),
        channels: smartChannels(),
        tip: {
          fill: "#f3f4f6",
          format: {
            fill: false,
          },
        },
      }),
    ],
  });
  const ramp: HTMLElement | null = plot.querySelector(".kn-plot-ramp");
  // we may generate legent with `plot.legend` but it has its own downsides too
  if (ramp) {
    ramp.style.height = "38px"; // same as 33 + 5px margin for swatches
    ramp.style.background = "transparent";
  }
  return plot;
}
