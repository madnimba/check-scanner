// OCR and image processing utilities
// This file contains helper functions for processing check images

export interface CheckScanResult {
  fields: {
    accountNumber: string
    accountHolderName: string
    checkDate: string
    checkPageNumber: string
    amountTaka: string
    checkCarrierName: string
  }
  signatureImageUrl: string
  signatureMatch: {
    score: number
    orb: number
    ssim: number
    verdict: "VALID" | "REVIEW" | "REJECT"
  }
  ocrConfidence: number
}

// Preprocess image for better OCR accuracy
export async function preprocessImage(imageBuffer: Buffer): Promise<Uint8Array> {
  // Steps:
  // 1. Convert to grayscale
  // 2. Apply deskewing
  // 3. Enhance contrast
  // 4. Remove noise

  // For now, return buffer as-is
  return new Uint8Array(imageBuffer)
}

// Extract text using OCR
export async function extractTextWithOCR(imageBuffer: Buffer): Promise<{
  text: string
  confidence: number
  words: Array<{
    text: string
    confidence: number
    bbox: { x0: number; y0: number; x1: number; y1: number }
  }>
}> {
  // Would use Tesseract.js worker here
  // For production: worker.recognize(imageBuffer, 'eng')

  return {
    text: "",
    confidence: 0,
    words: [],
  }
}

// Detect signature region using edge detection
export async function detectSignature(imageBuffer: Buffer): Promise<{
  image: string // base64
  region: {
    x: number
    y: number
    width: number
    height: number
  }
}> {
  // Would analyze bottom third of image for signature
  return {
    image: "",
    region: {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    },
  }
}

// Compare signatures using feature matching
export async function compareSignatures(
  sig1: Uint8Array,
  sig2: Uint8Array,
): Promise<{
  orbScore: number
  ssimScore: number
  overallScore: number
}> {
  // Would use ORB and SSIM algorithms
  return {
    orbScore: 0,
    ssimScore: 0,
    overallScore: 0,
  }
}
