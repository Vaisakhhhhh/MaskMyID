export function pixelateRegion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const pixelSize = 12;

  for (
    let py = y;
    py < y + height;
    py += pixelSize
  ) {
    for (
      let px = x;
      px < x + width;
      px += pixelSize
    ) {
      const imageData = ctx.getImageData(
        px,
        py,
        1,
        1,
      );

      const [r, g, b] = imageData.data;

      ctx.fillStyle =
        `rgb(${r},${g},${b})`;

      ctx.fillRect(
        px,
        py,
        pixelSize,
        pixelSize,
      );
    }
  }
}