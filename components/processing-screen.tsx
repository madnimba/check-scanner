"use client"

import { useState, useEffect } from "react"

const processingSteps = ["Detecting edges", "Extracting OCR", "Matching signature"]

export function ProcessingScreen() {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % processingSteps.length)
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Spinner */}
        <div className="flex justify-center">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin" />
          </div>
        </div>

        {/* Step Indicator */}
        <div className="space-y-4">
          <p className="text-2xl font-semibold text-foreground">{processingSteps[currentStep]}</p>

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

        <p className="text-sm text-muted-foreground">Please wait while we process your check...</p>
      </div>
    </div>
  )
}
