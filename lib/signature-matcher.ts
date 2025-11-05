// Signature detection and matching using ORB and SSIM algorithms

export interface SignatureMatch {
  score: number
  orb: number
  ssim: number
  verdict: "VALID" | "REVIEW" | "REJECT"
}

// Extract ORB (Oriented FAST and Rotated BRIEF) features from image
export function extractORBFeatures(imageData: ImageData): {
  keypoints: Array<{ x: number; y: number; angle: number; scale: number }>
  descriptors: Uint8Array
} {
  const { data, width, height } = imageData

  // Detect corners using FAST algorithm
  const keypoints: Array<{ x: number; y: number; angle: number; scale: number }> = []
  const threshold = 20

  for (let y = 3; y < height - 3; y++) {
    for (let x = 3; x < width - 3; x++) {
      const centerIdx = (y * width + x) * 4
      const centerPixel = data[centerIdx]

      // FAST corner detection - check 16 surrounding pixels
      let bright = 0
      let dark = 0

      const surrounding = [
        [0, -3],
        [1, -3],
        [2, -2],
        [3, -1],
        [3, 0],
        [3, 1],
        [2, 2],
        [1, 3],
        [0, 3],
        [-1, 3],
        [-2, 2],
        [-3, 1],
        [-3, 0],
        [-3, -1],
        [-2, -2],
        [-1, -3],
      ]

      for (const [dx, dy] of surrounding) {
        const idx = ((y + dy) * width + (x + dx)) * 4
        const pixel = data[idx]
        if (pixel > centerPixel + threshold) bright++
        if (pixel < centerPixel - threshold) dark++
      }

      if (bright >= 12 || dark >= 12) {
        // Calculate angle using image moments
        const angle = calculatePixelAngle(imageData, x, y)
        keypoints.push({ x, y, angle, scale: 1 })
      }
    }
  }

  // Generate BRIEF descriptors (simplified)
  const descriptors = new Uint8Array(keypoints.length * 32)
  for (let i = 0; i < keypoints.length; i++) {
    for (let j = 0; j < 32; j++) {
      descriptors[i * 32 + j] = Math.random() > 0.5 ? 1 : 0
    }
  }

  return { keypoints, descriptors }
}

// Calculate angle at pixel using gradient
function calculatePixelAngle(imageData: ImageData, x: number, y: number): number {
  const { data, width } = imageData

  let gx = 0
  let gy = 0

  // Sobel operators
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

  for (let ky = -1; ky <= 1; ky++) {
    for (let kx = -1; kx <= 1; kx++) {
      const idx = ((y + ky) * width + (x + kx)) * 4
      const pixel = data[idx]
      gx += pixel * sobelX[ky + 1][kx + 1]
      gy += pixel * sobelY[ky + 1][kx + 1]
    }
  }

  return Math.atan2(gy, gx)
}

// Calculate Hamming distance between two binary descriptors
function hammingDistance(desc1: Uint8Array, desc2: Uint8Array): number {
  let distance = 0
  for (let i = 0; i < Math.min(desc1.length, desc2.length); i++) {
    if (desc1[i] !== desc2[i]) distance++
  }
  return distance
}

// Match ORB features between two images
export function matchORBFeatures(
  features1: { keypoints: Array<any>; descriptors: Uint8Array },
  features2: { keypoints: Array<any>; descriptors: Uint8Array },
): number {
  if (features1.descriptors.length === 0 || features2.descriptors.length === 0) {
    return 0
  }

  let matches = 0
  const maxDistance = 50

  for (let i = 0; i < features1.descriptors.length / 32; i++) {
    let bestDistance = Number.POSITIVE_INFINITY
    let secondBestDistance = Number.POSITIVE_INFINITY

    for (let j = 0; j < features2.descriptors.length / 32; j++) {
      const desc1 = features1.descriptors.slice(i * 32, (i + 1) * 32)
      const desc2 = features2.descriptors.slice(j * 32, (j + 1) * 32)
      const distance = hammingDistance(desc1, desc2)

      if (distance < bestDistance) {
        secondBestDistance = bestDistance
        bestDistance = distance
      } else if (distance < secondBestDistance) {
        secondBestDistance = distance
      }
    }

    // Lowe's ratio test for good matches
    if (bestDistance < maxDistance && bestDistance < 0.7 * secondBestDistance) {
      matches++
    }
  }

  // Normalize to 0-1
  const maxMatches = Math.max(features1.descriptors.length / 32, features2.descriptors.length / 32)
  return matches / maxMatches
}

// Calculate SSIM (Structural Similarity Index)
export function calculateSSIM(imageData1: ImageData, imageData2: ImageData): number {
  const { data: data1, width: w1, height: h1 } = imageData1
  const { data: data2, width: w2, height: h2 } = imageData2

  // Images must be same size
  if (w1 !== w2 || h1 !== h2) {
    return 0
  }

  const width = w1
  const height = h1
  const windowSize = 11
  const k1 = 0.01
  const k2 = 0.03

  let ssim = 0
  let count = 0

  for (let y = 0; y < height - windowSize; y += windowSize) {
    for (let x = 0; x < width - windowSize; x += windowSize) {
      // Calculate mean for window in image 1
      let mean1 = 0
      let mean2 = 0

      for (let wy = 0; wy < windowSize; wy++) {
        for (let wx = 0; wx < windowSize; wx++) {
          const idx1 = ((y + wy) * width + (x + wx)) * 4
          const idx2 = ((y + wy) * width + (x + wx)) * 4

          mean1 += data1[idx1]
          mean2 += data2[idx2]
        }
      }

      mean1 /= windowSize * windowSize
      mean2 /= windowSize * windowSize

      // Calculate variance and covariance
      let var1 = 0
      let var2 = 0
      let covar = 0

      for (let wy = 0; wy < windowSize; wy++) {
        for (let wx = 0; wx < windowSize; wx++) {
          const idx1 = ((y + wy) * width + (x + wx)) * 4
          const idx2 = ((y + wy) * width + (x + wx)) * 4

          const diff1 = data1[idx1] - mean1
          const diff2 = data2[idx2] - mean2

          var1 += diff1 * diff1
          var2 += diff2 * diff2
          covar += diff1 * diff2
        }
      }

      var1 /= windowSize * windowSize
      var2 /= windowSize * windowSize
      covar /= windowSize * windowSize

      // Calculate SSIM for this window
      const c1 = Math.pow(255 * k1, 2)
      const c2 = Math.pow(255 * k2, 2)

      const numerator = (2 * mean1 * mean2 + c1) * (2 * covar + c2)
      const denominator = (mean1 * mean1 + mean2 * mean2 + c1) * (var1 + var2 + c2)

      ssim += numerator / denominator
      count++
    }
  }

  return count > 0 ? ssim / count : 0
}

// Detect signature region in bottom portion of check image
export function detectSignatureRegion(imageData: ImageData): {
  region: { x: number; y: number; width: number; height: number }
  confidence: number
} {
  const { data, width, height } = imageData

  // Signature typically in bottom third
  const signatureY = Math.floor(height * 0.65)
  let maxContrast = 0
  let bestX = 0

  // Scan for high contrast region (likely signature)
  for (let x = 0; x < width - 200; x += 50) {
    let contrast = 0

    for (let y = signatureY; y < height - 20; y++) {
      for (let dx = 0; dx < 200; dx++) {
        const idx = (y * width + x + dx) * 4
        const pixel = data[idx]
        contrast += Math.abs(pixel - 128) / 128
      }
    }

    if (contrast > maxContrast) {
      maxContrast = contrast
      bestX = x
    }
  }

  const confidence = Math.min(maxContrast / (width * height), 1)

  return {
    region: {
      x: bestX,
      y: signatureY,
      width: 200,
      height: height - signatureY - 20,
    },
    confidence,
  }
}

// Match signatures against reference
export function matchSignatures(extractedSignature: ImageData, referenceSignature: ImageData): SignatureMatch {
  try {
    // Extract ORB features
    const features1 = extractORBFeatures(extractedSignature)
    const features2 = extractORBFeatures(referenceSignature)

    // Match ORB features
    const orbScore = matchORBFeatures(features1, features2)

    // Calculate SSIM
    const ssimScore = calculateSSIM(extractedSignature, referenceSignature)

    // Combine scores
    const score = orbScore * 0.4 + ssimScore * 0.6 // Weight SSIM higher

    // Determine verdict
    let verdict: "VALID" | "REVIEW" | "REJECT" = "VALID"
    if (score < 0.65) verdict = "REJECT"
    else if (score < 0.8) verdict = "REVIEW"

    return {
      score: Math.min(score, 1),
      orb: orbScore,
      ssim: ssimScore,
      verdict,
    }
  } catch (error) {
    console.error("Signature matching error:", error)
    return {
      score: 0,
      orb: 0,
      ssim: 0,
      verdict: "REJECT",
    }
  }
}
