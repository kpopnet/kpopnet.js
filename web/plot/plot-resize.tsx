import { type JSXElement, children } from "solid-js";

export default function PlotResize(p: {
  height: number;
  setHeight: (v: number) => void;
  children: JSXElement;
}) {
  const resolved = children(() => p.children);

  const legendH = 33 + 5;
  let startH = 0;
  let startY = 0;
  let outputEl: HTMLDivElement;
  let resizing = false;
  function handleMouseDown(e: MouseEvent) {
    if (resizing) return;
    e.preventDefault();
    startY = e.clientY;
    startH = outputEl.getBoundingClientRect().height;
    resizing = true;

    document.body.addEventListener("mousemove", handleGlobalMove);
    document.body.addEventListener(
      "mouseup",
      function handleMouseUp(e: MouseEvent) {
        e.preventDefault();
        resizing = false;
        document.body.removeEventListener("mousemove", handleGlobalMove);
        document.body.removeEventListener("mouseup", handleMouseUp);
      }
    );
  }
  function handleGlobalMove(e: MouseEvent) {
    const newH = startH + e.clientY - startY;
    p.setHeight(newH - legendH);
  }

  return (
    <>
      <div
        ref={outputEl!}
        style={{
          // keep the space occupied while plot is loading
          // FIXME: won't work on mobile with scaled plot because height is smaller there
          height: resolved() ? undefined : `${p.height + legendH}px`,
        }}
      >
        {resolved()}
      </div>
      <div
        class="h-2 border-t-2 border-dotted border-kngray-1 cursor-ns-resize"
        onMouseDown={handleMouseDown}
      />
    </>
  );
}
