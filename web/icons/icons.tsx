import type { Component, ComponentProps } from "solid-js";

import "./icons.less";
import _IconX from "@tabler/icons/icons/x.svg";

type SvgProps = ComponentProps<"svg">;
type SvgComponent = Component<SvgProps>;

function fixProps(svg: SvgComponent): SvgComponent {
  return function (props: SvgProps) {
    let userClass = props["class"] || "";
    if (userClass) userClass = " " + userClass;
    Object.assign(props, { class: `icon${userClass}` });
    return svg(props);
  };
}

export const IconX = fixProps(_IconX);
