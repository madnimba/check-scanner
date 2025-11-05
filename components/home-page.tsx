"use client"

import type React from "react"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Upload } from "lucide-react"

interface HomePageProps {
  onStartScan: (file: File) => void
}

export function HomePage({ onStartScan }: HomePageProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const uploadInputRef = useRef<HTMLInputElement>(null)

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onStartScan(file)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onStartScan(file)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-foreground">CheckScan</h1>
          <p className="text-lg text-muted-foreground">Verify bank checks with AI-powered accuracy</p>
        </div>

        {/* Illustration Placeholder */}
        <div className="flex justify-center">
          <div className="w-48 h-48 bg-blue-100 rounded-3xl flex items-center justify-center border-4 border-blue-200">
            <div className="text-6xl">📋</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button
            size="lg"
            className="w-full h-14 text-lg font-semibold gap-2"
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera className="w-5 h-5" />
            Take Photo
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full h-14 text-lg font-semibold gap-2 bg-transparent"
            onClick={() => uploadInputRef.current?.click()}
          >
            <Upload className="w-5 h-5" />
            Upload Image
          </Button>
        </div>

        {/* Hidden Inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCameraCapture}
          className="hidden"
        />
        <input ref={uploadInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-muted-foreground">
          <p>
            Position the entire check in the frame for best results. The system will extract all check details and
            verify the signature.
          </p>
        </div>
      </div>
    </div>
  )
}
