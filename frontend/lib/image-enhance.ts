/**
 * Client-side image enhancement using Canvas convolution filters.
 *
 * Applies a sharpening kernel to make images clearer and less blurry.
 * Works entirely in the browser — no server-side libraries needed.
 */

/**
 * Apply an unsharp-mask style sharpening to a canvas context in-place.
 *
 * The 3×3 sharpen kernel boosts edge contrast:
 *   [ 0, -1,  0]
 *   [-1,  5, -1]
 *   [ 0, -1,  0]
 *
 * @param ctx    The 2D rendering context to modify
 * @param width  Canvas width in pixels
 * @param height Canvas height in pixels
 * @param strength Amount of sharpening (0 = none, 1 = full). Default 0.6
 */
export function enhanceImage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  strength: number = 0.6,
) {
  if (width === 0 || height === 0) return

  const imageData = ctx.getImageData(0, 0, width, height)
  const src = imageData.data
  const output = new Uint8ClampedArray(src.length)

  // Sharpen kernel: [ 0, -k,  0 ]
  //                 [-k, 1+4k, -k]
  //                 [ 0, -k,  0 ]
  const k = strength

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4

      // Edge pixels: copy directly (no neighbours to sample)
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        output[idx] = src[idx]
        output[idx + 1] = src[idx + 1]
        output[idx + 2] = src[idx + 2]
        output[idx + 3] = src[idx + 3]
        continue
      }

      // Neighbour indices
      const top = ((y - 1) * width + x) * 4
      const bot = ((y + 1) * width + x) * 4
      const lft = (y * width + (x - 1)) * 4
      const rgt = (y * width + (x + 1)) * 4

      for (let c = 0; c < 3; c++) {
        const center = src[idx + c]
        const neighbours = src[top + c] + src[bot + c] + src[lft + c] + src[rgt + c]

        // Weighted centre value with subtracted neighbour blur
        const val = center + k * (4 * center - neighbours)
        output[idx + c] = val // Uint8ClampedArray auto-clamps 0–255
      }
      output[idx + 3] = src[idx + 3] // preserve alpha
    }
  }

  imageData.data.set(output)
  ctx.putImageData(imageData, 0, 0)

  // Second pass: subtle contrast boost via lighter composite
  ctx.globalCompositeOperation = "overlay"
  ctx.globalAlpha = 0.08
  ctx.fillStyle = "#808080"
  ctx.fillRect(0, 0, width, height)
  ctx.globalCompositeOperation = "source-over"
  ctx.globalAlpha = 1
}
