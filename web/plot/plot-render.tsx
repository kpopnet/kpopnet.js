import type { Item, Idol, Group } from "../../lib/types";
import { getGroupGen, getIdolGen } from "../../lib/date";
import type { PlotRender, Plot, ChannelValue } from "./plot";

export interface Values {
  x: string;
  y: string;
  graph: string;
  size: string;
  color: string;
}

export const GEN_FIELD = "(generation)";
export const SPECIAL_FIELDS = [GEN_FIELD];

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

export function renderPlot(
  Plot: Plot,
  items: Item[],
  values: Values,
  height: number
): PlotRender {
  if (import.meta.env.DEV) console.log("render xy", values.x, values.y);
  return Plot.plot({
    color: {
      legend: true,
    },
    style: {
      background: "transparent",
      userSelect: "none",
    },
    className: "kn-plot",
    width: 780, // viewBox dimensions, will scale on mobile
    height,
    marks: [
      Plot.dot(items, {
        x: {
          label: values.x,
          value: smartValue(values.x),
        },
        y: {
          label: values.y,
          value: smartValue(values.y),
        },
        r: values.size ? smartValue(values.size) : undefined,
        fill: smartValue(values.color),
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
}
