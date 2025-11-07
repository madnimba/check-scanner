"use client"

import { useState } from "react"
import { HomePage } from "@/components/home-page"
import { ProcessingScreen } from "@/components/processing-screen"
import { ResultScreen } from "@/components/result-screen"

type AppScreen = "home" | "processing" | "result"

interface ScanResult {
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

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("home")
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  // Load last captured image from sessionStorage if present (persist across reloads in this session)
  useState(() => {
    try {
      const saved = sessionStorage.getItem("lastCapturedImage")
      if (saved) setImageUrl(saved)
    } catch (e) {
      // ignore (e.g., SSR or storage disabled)
    }
  })

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.onload = () => resolve(String(reader.result))
      reader.readAsDataURL(file)
    })

  const handleStartScan = (file: File) => {
    // Read file to a stable data URL and store it in sessionStorage so the
    // captured photo remains visible even if object URLs are revoked.
    readFileAsDataUrl(file)
      .then((dataUrl) => {
        try {
          sessionStorage.setItem("lastCapturedImage", dataUrl)
        } catch (e) {
          // ignore storage errors
        }
        setImageUrl(dataUrl)
        setCurrentScreen("processing")
      })
      .catch((err) => {
        console.error("Failed to load captured image:", err)
        // fallback to object URL if FileReader fails
        const url = URL.createObjectURL(file)
        setImageUrl(url)
        setCurrentScreen("processing")
      })
  }
  // NOTE: We intentionally do not call any backend or Document AI here.
  // The ProcessingScreen will simulate the steps and call onComplete, which
  // sets a mock scan result and shows the Result screen.

  const handleBackToHome = () => {
    setCurrentScreen("home")
    setScanResult(null)
    // clear temporary stored image
    try {
      sessionStorage.removeItem("lastCapturedImage")
    } catch (e) {
      // ignore
    }
    setImageUrl(null)
  }

  return (
    <main className="min-h-screen bg-background">
      {currentScreen === "home" && <HomePage onStartScan={handleStartScan} />}
      {currentScreen === "processing" && (
        <ProcessingScreen
          imageUrl={imageUrl}
          onComplete={() => {
            // Create a mock scan result (client-side simulation)
            const mock: ScanResult = {
              fields: {
                accountNumber: "",
                accountHolderName: "",
                checkDate: "08/11/2024",
                checkPageNumber: "1",
                amountTaka: "50,00",
                checkCarrierName: "",
              },
              signatureImageUrl: "",
              signatureMatch: {
                score: 0.77,
                orb: 0.5,
                ssim: 0.9,
                verdict: "REVIEW",
              },
              ocrConfidence: 0.88,
            }

            setScanResult(mock)
            setCurrentScreen("result")
          }}
        />
      )}
      {currentScreen === "result" && scanResult && (
        <ResultScreen
          result={scanResult}
          imageUrl={imageUrl}
          onBackToHome={handleBackToHome}
          onEditFields={(editedFields) => {
            if (scanResult) {
              setScanResult({
                ...scanResult,
                fields: editedFields,
              })
            }
          }}
        />
      )}
    </main>
  )
}
