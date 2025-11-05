import { type NextRequest, NextResponse } from "next/server"

// Check field patterns for validation and extraction
const CHECK_PATTERNS = {
  accountNumber: /(?:account|acct)[\s:]*(\d{6,12})/i,
  accountHolderName: /(?:pay to|name)[\s:]*([a-zA-Z\s]{5,50})/i,
  checkDate: /(?:date)[\s:]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
  amountTaka: /(?:amount|taka|৳)[\s:]*([0-9,.]+)/i,
  checkCarrierName: /(?:bank|branch)[\s:]*([a-zA-Z\s&]{5,50})/i,
}

// Extract key fields from OCR text
function extractFields(text: string): Record<string, string> {
  const fields: Record<string, string> = {
    accountNumber: "",
    accountHolderName: "",
    checkDate: "",
    checkPageNumber: "1",
    amountTaka: "",
    checkCarrierName: "",
  }

  // Extract each field using patterns
  for (const [key, pattern] of Object.entries(CHECK_PATTERNS)) {
    const match = text.match(pattern)
    if (match && match[1]) {
      fields[key] = match[1].trim()
    }
  }

  // Fallback: Extract any numbers as account and amounts
  const numbers = text.match(/\d+/g) || []
  if (!fields.accountNumber && numbers.length > 0) {
    fields.accountNumber = numbers[0]
  }

  return fields
}

// Process image and extract text (mock implementation)
function processImageWithOCR(imageBuffer: Buffer): { text: string; confidence: number } {
  // In production, you would:
  // 1. Send buffer to Tesseract.js worker
  // 2. Extract text and confidence
  // 3. Parse structured data

  // For demo, we simulate OCR results
  const mockOCRResults = [
    {
      text: "Account Number: 1234567890\nAccount Holder: John Doe\nCheck Date: 2025-11-05\nAmount Taka: 5000\nBank: First National Bank",
      confidence: 0.92,
    },
    {
      text: "Account: 9876543210\nName: Jane Smith\nDate: 2025-11-05\nAmount: 15000\nCarrier: Eastern Bank",
      confidence: 0.88,
    },
    {
      text: "Acct 5555666777\nPay to: Ahmed Hassan\nDate: 2025-11-04\nAmount Taka: 25000\nBranch: Central Bank",
      confidence: 0.85,
    },
  ]

  // Select random mock result
  return mockOCRResults[Math.floor(Math.random() * mockOCRResults.length)]
}

// Detect and extract signature region
function detectSignatureRegion(imageBuffer: Buffer): string {
  // In production, this would:
  // 1. Analyze image bottom third for signature
  // 2. Use contour detection
  // 3. Return base64 encoded signature image

  // For now, return a placeholder
  return "/placeholder.svg?key=3lpuy"
}

// Calculate signature match score using ORB and SSIM algorithms
function calculateSignatureMatch(): {
  score: number
  orb: number
  ssim: number
  verdict: "VALID" | "REVIEW" | "REJECT"
} {
  // In production, this would:
  // 1. Extract signature from check image using detectSignatureRegion
  // 2. Load reference signature from database
  // 3. Convert both to ImageData
  // 4. Call matchSignatures() for real feature matching

  // For now, simulate realistic scores
  const orbScore = Math.random() * 0.35 + 0.55 // Typically 0.55-0.9
  const ssimScore = Math.random() * 0.35 + 0.65 // Typically 0.65-1.0
  const score = orbScore * 0.4 + ssimScore * 0.6

  let verdict: "VALID" | "REVIEW" | "REJECT" = "VALID"
  if (score < 0.65) verdict = "REJECT"
  else if (score < 0.8) verdict = "REVIEW"

  return {
    score: Math.min(score, 1),
    orb: orbScore,
    ssim: ssimScore,
    verdict,
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer()
    const imageBuffer = Buffer.from(buffer)

    // Process image with OCR
    const { text, confidence } = processImageWithOCR(imageBuffer)

    // Extract fields from OCR text
    const fields = extractFields(text)

    // Detect and extract signature
    const signatureImageUrl = detectSignatureRegion(imageBuffer)

    // Calculate signature match using ORB and SSIM algorithms
    const signatureMatch = calculateSignatureMatch()

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    return NextResponse.json({
      fields,
      signatureImageUrl,
      signatureMatch,
      ocrConfidence: confidence,
    })
  } catch (error) {
    console.error("Scan error:", error)
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 })
  }
}
