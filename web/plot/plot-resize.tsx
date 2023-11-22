import { type JSXElement, children } from "solid-js";

export default function PlotResize(p: {
  height: number;
  setHeight: (v: number) => void;
  children: JSXElement;
}) {
  const resolved = children(() => p.children);

  // FIXME(Kagami): won't work on mobile with scaled plot
  const legendH = 33 + 5;
  let startH = p.height + legendH;
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
        // FIXME: p.saveHeight(height()); or just setTimeout to localStorage?
        document.body.removeEventListener("mousemove", handleGlobalMove);
        document.body.removeEventListener("mouseup", handleMouseUp);
      }
    );
  }
  function handleGlobalMove(e: MouseEvent) {
    const newH = startH + e.clientY - startY;
    p.setHeight(newH - legendH);
  }

  // FIXME: loading indicator when no plot?
  return (
    <>
      <div
        ref={outputEl!}
        class="relative"
        style={{
          // keep the space occupied while plot is loading
          height: resolved() ? undefined : startH + "px",
        }}
      >
        {resolved()}
      </div>
      <div
        class="h-2 border-t-2 border-dotted border-kngray-1 cursor-ns-resize"
        onMouseDown={handleMouseDown}
      ></div>
    </>
  );
}
