function savePngData(data: string, filename = "plot.png") {
  const a = document.createElement("a");
  a.href = data;
  a.download = filename;
  a.click();
}

export function savePlot(node: HTMLElement, filename = "plot.png") {
  const rect = node.getBoundingClientRect();
  const w = rect.width + 10;
  const h = rect.height + 10;

  const wrapper = document.createElement("div");
  wrapper.style.padding = "5px";
  wrapper.style.background = "white";
  const clone = node.cloneNode(true) as HTMLElement;
  clone.style.margin = "0";
  wrapper.appendChild(clone);
  const svgStr =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    '<foreignObject width="100%" height="100%">' +
    new XMLSerializer().serializeToString(wrapper) +
    "</foreignObject></svg>";
  const svgData = "data:image/svg+xml," + encodeURIComponent(svgStr);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const scale = window.devicePixelRatio;
  canvas.width = w * scale;
  canvas.height = h * scale;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";

  const img = document.createElement("img");
  img.onload = function () {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    savePngData(canvas.toDataURL("image/png"), filename);
  };
  img.onerror = function (err) {
    console.error(err);
  };
  img.src = svgData;
}
