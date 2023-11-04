import type { Component, ComponentProps } from "solid-js";

import "./icons.scss";
import _IconX from "bootstrap-icons/icons/x-lg.svg";
import _IconLink from "bootstrap-icons/icons/link-45deg.svg";

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
export const IconLink = fixProps(_IconLink);
