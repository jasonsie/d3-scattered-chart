/**
 * Canvas rendering utilities for data points and polygons
 */

/**
 * Clear entire canvas
 * 
 * @param ctx - Canvas context
 * @param width - Canvas width in CSS pixels
 * @param height - Canvas height in CSS pixels
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.clearRect(0, 0, width, height);
}

/**
 * Clear specific rectangle
 * 
 * @param ctx - Canvas context
 * @param rect - Rectangle to clear
 */
export function clearRect(
  ctx: CanvasRenderingContext2D,
  rect: DOMRect
): void {
  ctx.clearRect(rect.x, rect.y, rect.width, rect.height);
}

/**
 * Render data point with color blending
 * 
 * @param ctx - Canvas context
 * @param point - Point in screen coordinates
 * @param baseColor - Dot color (base layer)
 * @param overlayColors - Polygon fill colors (0.2 opacity each)
 * @param radius - Point radius in pixels (default: 1)
 */
export function renderDataPoint(
  ctx: CanvasRenderingContext2D,
  point: { x: number; y: number },
  baseColor: string,
  overlayColors: string[] = [],
  radius: number = 1
): void {
  // Render base dot
  ctx.fillStyle = baseColor;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  ctx.fill();
  
  // Render polygon overlays (additive blending)
  overlayColors.forEach(color => {
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fill();
  });
  
  ctx.globalAlpha = 1.0; // Reset
}

/**
 * Render polygon fill
 * 
 * @param ctx - Canvas context
 * @param points - Polygon vertices (screen coordinates)
 * @param fillColor - Fill color
 * @param opacity - Fill opacity (default: 0.2)
 */
export function renderPolygonFill(
  ctx: CanvasRenderingContext2D,
  points: Array<{ x: number; y: number }>,
  fillColor: string,
  opacity: number = 0.2
): void {
  ctx.fillStyle = fillColor;
  ctx.globalAlpha = opacity;
  
  ctx.beginPath();
  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
  ctx.fill();
  
  ctx.globalAlpha = 1.0; // Reset
}

/**
 * Render polygon stroke
 * 
 * @param ctx - Canvas context
 * @param points - Polygon vertices (screen coordinates)
 * @param strokeColor - Stroke color
 * @param lineWidth - Stroke width in pixels (default: 2)
 */
export function renderPolygonStroke(
  ctx: CanvasRenderingContext2D,
  points: Array<{ x: number; y: number }>,
  strokeColor: string,
  lineWidth: number = 2
): void {
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;
  
  ctx.beginPath();
  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
  ctx.stroke();
}
