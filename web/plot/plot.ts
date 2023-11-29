/** Tree-shakable re-export helper */
import type { Plot as ObPlot } from "@observablehq/plot";
import { plot, dot, rectY, binX } from "@observablehq/plot";
export { type ChannelValue } from "@observablehq/plot";

export type PlotRender = (SVGSVGElement | HTMLElement) & ObPlot;

export interface Plot {
  plot: typeof plot;
  dot: typeof dot;
  rectY: typeof rectY;
  binX: typeof binX;
}

export default {
  plot,
  dot,
  rectY,
  binX,
};
