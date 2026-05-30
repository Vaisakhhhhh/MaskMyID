export function pixelateRegion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  if (width <= 0 || height <= 0) return;

  const pixelSize = 12;
  const w = Math.max(1, Math.floor(width / pixelSize));
  const h = Math.max(1, Math.floor(height / pixelSize));

  const offscreen = document.createElement('canvas');
  offscreen.width = w;
  offscreen.height = h;
  const offCtx = offscreen.getContext('2d');
  
  if (!offCtx) return;

  offCtx.drawImage(ctx.canvas, x, y, width, height, 0, 0, w, h);

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(offscreen, 0, 0, w, h, x, y, width, height);
  ctx.imageSmoothingEnabled = true;
}