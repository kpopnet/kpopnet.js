import { createSignal } from "solid-js";
import { ShowTransition } from "../animation/animation";
import { IconHelp } from "../icons/icons";
import { Link } from "../utils/utils";

export default function PlotHelp() {
  const [show, setShow] = createSignal(false);

  return (
    <div
      class="relative"
      onMouseOver={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <IconHelp class="icon_control" />
      <ShowTransition when={show}>
        <div
          class="absolute bg-body-bg border border-kngray-1
          top-0 right-0 p-2 w-max
          flex flex-col items-start
          transition-opacity duration-300 opacity-0"
        >
          <Link
            url="https://github.com/kpopnet/kpopnet.json/wiki#plot"
            text="Help"
          />
          <Link url="https://jqlang.github.io/jq/manual/" text="JQ manual" />
          <Link
            url="https://github.com/kpopnet/kpopnet.json/blob/master/kpopnet.d.ts"
            text="JSON schema"
          />
        </div>
      </ShowTransition>
    </div>
  );
}
