import { splitProps, type Component, type ComponentProps } from "solid-js";

import _IconX from "bootstrap-icons/icons/x-lg.svg";
import _IconLink from "bootstrap-icons/icons/link-45deg.svg";
import _IconExternalLink from "bootstrap-icons/icons/box-arrow-up-right.svg";
import _IconHome from "bootstrap-icons/icons/house.svg";
import _IconQuestion from "bootstrap-icons/icons/question-circle.svg";
import _IconGithub from "bootstrap-icons/icons/github.svg";
import _IconWiki from "bootstrap-icons/icons/wikipedia.svg";

type SvgProps = ComponentProps<"svg">;
interface SvgPropsExt extends SvgProps {
  control?: boolean /** control appearance */;
  small?: boolean;
}

function fixProps(svg: Component<SvgProps>): Component<SvgPropsExt> {
  return function (extProps: SvgPropsExt) {
    // TODO(Kagami): no reactivity for control/small props?
    const [{ control, small }, p] = splitProps(extProps, ["control", "small"]);
    p.classList = p.classList || {};
    p.classList.icon = true;
    p.classList.icon_control = control;
    p.classList.icon_small = small;
    return svg(p);
  };
}

export const IconX = fixProps(_IconX);
export const IconLink = fixProps(_IconLink);
export const IconExternalLink = fixProps(_IconExternalLink);
export const IconHome = fixProps(_IconHome);
export const IconQuestion = fixProps(_IconQuestion);
export const IconGithub = fixProps(_IconGithub);
export const IconWiki = fixProps(_IconWiki);
