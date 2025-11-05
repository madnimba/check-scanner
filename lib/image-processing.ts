// Image processing utilities for check scanning

export interface ImageRegion {
  x: number
  y: number
  width: number
  height: number
}

// Create canvas from image buffer for processing
export function createCanvasFromBuffer(buffer: Buffer): {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
} {
  // This would be used in browser context to create image data
  // Returns canvas for further processing
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")!
  return { canvas, ctx }
}

// Detect edges in image using Sobel operator
export function detectEdges(imageData: ImageData): ImageData {
  const { data, width, height } = imageData
  const output = new ImageData(width, height)
  const outData = output.data

  // Sobel edge detection kernel
  const sobelX = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1],
  ]
  const sobelY = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1],
  ]

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0
      let gy = 0

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4
          const pixel = data[idx]

          gx += pixel * sobelX[ky + 1][kx + 1]
          gy += pixel * sobelY[ky + 1][kx + 1]
        }
      }

      const magnitude = Math.sqrt(gx * gx + gy * gy)
      const idx = (y * width + x) * 4

      outData[idx] = magnitude > 100 ? 255 : 0
      outData[idx + 1] = magnitude > 100 ? 255 : 0
      outData[idx + 2] = magnitude > 100 ? 255 : 0
      outData[idx + 3] = 255
    }
  }

  return output
}

// Deskew check image
export function deskewImage(ctx: CanvasRenderingContext2D, angle: number): void {
  const { canvas } = ctx
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2

  ctx.translate(centerX, centerY)
  ctx.rotate((angle * Math.PI) / 180)
  ctx.translate(-centerX, -centerY)
}

// Extract text region from check
export function extractTextRegions(imageData: ImageData): Array<{
  region: ImageRegion
  confidence: number
}> {
  // Find connected components of text in image
  // Would use contour detection in production

  return []
}

// Calculate image contrast for quality check
export function calculateContrast(imageData: ImageData): number {
  const { data } = imageData
  let mean = 0

  // Calculate mean brightness
  for (let i = 0; i < data.length; i += 4) {
    mean += (data[i] + data[i + 1] + data[i + 2]) / 3
  }
  mean /= data.length / 4

  // Calculate standard deviation
  let variance = 0
  for (let i = 0; i < data.length; i += 4) {
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3
    variance += Math.pow(brightness - mean, 2)
  }
  variance /= data.length / 4

  return Math.sqrt(variance) / 255
}
