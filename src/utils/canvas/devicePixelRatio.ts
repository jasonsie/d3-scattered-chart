/**
 * Device Pixel Ratio utilities for high-DPI displays
 */

/**
 * Setup canvas for high-DPI displays with proper scaling
 * 
 * @param canvas - Canvas element to configure
 * @param cssWidth - Width in CSS pixels
 * @param cssHeight - Height in CSS pixels
 * @returns Configured 2D context with DPR scaling applied
 */
export function setupCanvas(
  canvas: HTMLCanvasElement,
  cssWidth: number,
  cssHeight: number
): CanvasRenderingContext2D {
  const dpr = window.devicePixelRatio || 1;
  
  // Set buffer size to native pixels
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  
  // Set display size to CSS pixels
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  
  const ctx = canvas.getContext('2d')!;
  
  // Scale context to match DPR
  ctx.scale(dpr, dpr);
  
  return ctx;
}

/**
 * Get current device pixel ratio
 * 
 * @returns DPR value (1.0 for standard displays, 2.0+ for Retina)
 */
export function getDevicePixelRatio(): number {
  return window.devicePixelRatio || 1;
}

/**
 * Listen for DPR changes (monitor switching, browser zoom)
 * 
 * @param callback - Function to call when DPR changes
 * @returns Cleanup function to remove listener
 */
export function onDevicePixelRatioChange(
  callback: (newDPR: number) => void
): () => void {
  const initialDPR = getDevicePixelRatio();
  
  const mediaQuery = window.matchMedia(
    `(resolution: ${initialDPR}dppx)`
  );
  
  const handler = () => {
    callback(getDevicePixelRatio());
  };
  
  mediaQuery.addEventListener('change', handler);
  
  return () => mediaQuery.removeEventListener('change', handler);
}
