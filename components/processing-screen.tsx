"use client"

import { useState, useEffect } from "react"

interface ProcessingScreenProps {
  imageUrl?: string | null
  onComplete?: () => void
}

const processingSteps = ["Detecting edges", "Extracting OCR", "Matching signature"]

// Runs each processing step once then calls onComplete
export function ProcessingScreen({ imageUrl, onComplete }: ProcessingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      for (let i = 0; i < processingSteps.length; i++) {
        if (cancelled) return
        setCurrentStep(i)
        // wait 1200ms between steps to show progress
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 1200))
      }

      // small delay before finishing
      if (!cancelled) {
        await new Promise((r) => setTimeout(r, 600))
        onComplete?.()
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [onComplete])

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-background px-4 py-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-1">Processing Check</h1>
          <p className="text-sm text-muted-foreground">Analyzing your check image...</p>
        </div>

        {imageUrl && (
          <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
            <img
              src={imageUrl || "/placeholder.svg"}
              alt="Check being processed"
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Spinner */}
        <div className="flex justify-center pt-4">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin" />
          </div>
        </div>

        {/* Step Indicator */}
        <div className="space-y-4">
          <p className="text-2xl font-semibold text-foreground text-center">{processingSteps[currentStep]}</p>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2">
            {processingSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index <= currentStep ? "w-8 bg-blue-600" : "w-2 bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground text-center">Please wait while we process your check...</p>
      </div>
    </div>
  )
}
