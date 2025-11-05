"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Upload, X } from "lucide-react"

interface HomePageProps {
  onStartScan: (file: File) => void
}

export function HomePage({ onStartScan }: HomePageProps) {
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)

  const handleTakePhoto = async () => {
    try {
      setCameraError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        // Play the video immediately when stream is available
        videoRef.current.play().catch((err) => {
          console.log("[v0] Play error:", err)
        })
        setIsCameraOpen(true)
      }
    } catch (error) {
      setCameraError("Unable to access camera. Please check permissions.")
      console.log("[v0] Camera error:", error)
    }
  }

  const handleCapturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d")
      canvasRef.current.width = videoRef.current.videoWidth
      canvasRef.current.height = videoRef.current.videoHeight

      if (context) {
        context.drawImage(videoRef.current, 0, 0)

        // Convert canvas to blob and create File
        canvasRef.current.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], "check-photo.jpg", { type: "image/jpeg" })
              closeCameraAndScan(file)
            }
          },
          "image/jpeg",
          0.95,
        )
      }
    }
  }

  const closeCameraAndScan = (file: File) => {
    // Stop camera stream
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
    }

    setIsCameraOpen(false)
    onStartScan(file)
  }

  const handleCameraClose = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
    }
    setIsCameraOpen(false)
    setCameraError(null)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onStartScan(file)
    }
  }

  if (isCameraOpen) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            onLoadedMetadata={() => {
              if (videoRef.current) {
                videoRef.current.play()
              }
            }}
          />

          <canvas ref={canvasRef} className="hidden" crossOrigin="anonymous" />

          <div className="absolute inset-0 pointer-events-none flex flex-col">
            <div className="flex-1 bg-black/20" />
            <div className="flex-1 flex items-center justify-center">
              <div className="border-2 border-white/50 w-80 h-96 rounded-xl" />
            </div>
            <div className="flex-1 bg-black/20" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-8 pb-8 px-4 flex justify-center gap-6">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full w-16 h-16 p-0 bg-red-500 hover:bg-red-600 border-0"
              onClick={handleCameraClose}
            >
              <X className="w-6 h-6 text-white" />
            </Button>
            <Button
              size="lg"
              className="rounded-full w-20 h-20 p-0 bg-white hover:bg-gray-100 shadow-lg"
              onClick={handleCapturePhoto}
            >
              <div className="w-10 h-10 bg-gray-300 rounded-full" />
            </Button>
          </div>
        </div>
      </div>
    )
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
          <Button size="lg" className="w-full h-14 text-lg font-semibold gap-2" onClick={handleTakePhoto}>
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
        <input ref={uploadInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

        {cameraError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
            <p>{cameraError}</p>
          </div>
        )}

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
