/**
 * Dirty rectangle tracking for partial Canvas updates
 */

/**
 * Calculate bounding box for set of points
 * 
 * @param points - Array of points (screen coordinates)
 * @returns DOMRect encompassing all points
 */
export function calculateBoundingBox(
  points: Array<{ x: number; y: number }>
): DOMRect {
  if (points.length === 0) {
    return new DOMRect(0, 0, 0, 0);
  }
  
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  return new DOMRect(
    minX,
    minY,
    maxX - minX,
    maxY - minY
  );
}

/**
 * Expand rectangle by margin (prevents anti-aliasing artifacts)
 * 
 * @param rect - Original rectangle
 * @param margin - Pixels to expand (default: 2px for stroke width)
 * @returns Expanded rectangle
 */
export function expandRect(rect: DOMRect, margin: number = 2): DOMRect {
  return new DOMRect(
    rect.x - margin,
    rect.y - margin,
    rect.width + margin * 2,
    rect.height + margin * 2
  );
}

/**
 * Check if two rectangles overlap
 * 
 * @param a - First rectangle
 * @param b - Second rectangle
 * @returns True if rectangles overlap
 */
export function rectsOverlap(a: DOMRect, b: DOMRect): boolean {
  return !(
    a.right < b.left ||
    a.left > b.right ||
    a.bottom < b.top ||
    a.top > b.bottom
  );
}

/**
 * Merge two overlapping rectangles into bounding box
 * 
 * @param a - First rectangle
 * @param b - Second rectangle
 * @returns Merged rectangle
 */
export function mergeRects(a: DOMRect, b: DOMRect): DOMRect {
  const minX = Math.min(a.left, b.left);
  const minY = Math.min(a.top, b.top);
  const maxX = Math.max(a.right, b.right);
  const maxY = Math.max(a.bottom, b.bottom);
  
  return new DOMRect(minX, minY, maxX - minX, maxY - minY);
}

/**
 * Merge array of rectangles, combining overlapping regions
 * 
 * @param rects - Array of rectangles to merge
 * @returns Optimized array with overlaps merged
 */
export function mergeOverlappingRects(rects: DOMRect[]): DOMRect[] {
  if (rects.length <= 1) return rects;
  
  const sorted = rects.sort((a, b) => a.x - b.x);
  const merged: DOMRect[] = [];
  
  let current = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    
    if (rectsOverlap(current, next)) {
      current = mergeRects(current, next);
    } else {
      merged.push(current);
      current = next;
    }
  }
  merged.push(current);
  
  return merged;
}

/**
 * Clip canvas to dirty rectangle for optimized rendering
 * 
 * @param ctx - Canvas context
 * @param rect - Dirty rectangle to clip
 * @param renderFn - Render function to execute within clip
 */
export function renderWithClip(
  ctx: CanvasRenderingContext2D,
  rect: DOMRect,
  renderFn: (ctx: CanvasRenderingContext2D) => void
): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.width, rect.height);
  ctx.clip();
  
  renderFn(ctx);
  
  ctx.restore();
}
