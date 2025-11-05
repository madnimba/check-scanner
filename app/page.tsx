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

  const handleStartScan = (file: File) => {
    setCurrentScreen("processing")
    uploadAndScan(file)
  }

  const uploadAndScan = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/scan-check", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.error) {
        alert(`Error: ${data.error}`)
        setCurrentScreen("home")
        return
      }

      setScanResult(data)
      setCurrentScreen("result")
    } catch (error) {
      console.error("Scan error:", error)
      alert("Failed to scan check. Please try again.")
      setCurrentScreen("home")
    }
  }

  const handleBackToHome = () => {
    setCurrentScreen("home")
    setScanResult(null)
  }

  return (
    <main className="min-h-screen bg-background">
      {currentScreen === "home" && <HomePage onStartScan={handleStartScan} />}
      {currentScreen === "processing" && <ProcessingScreen />}
      {currentScreen === "result" && scanResult && (
        <ResultScreen
          result={scanResult}
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
