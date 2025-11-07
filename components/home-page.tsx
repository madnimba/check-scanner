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
    setCameraError(null);

    // Prefer back camera with HD+ resolution
    let constraints: MediaStreamConstraints = {
      video: {
        facingMode: { exact: "environment" },
        width: { ideal: 1920, min: 1280 },
        height: { ideal: 1080, min: 720 },
        frameRate: { ideal: 30, max: 60 },
      },
      audio: false,
    };

    let stream: MediaStream | null = null;

    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      console.warn("[Camera] Environment/back camera unavailable. Using default front camera:", err);
      // fallback to any available camera
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
    }

    if (!stream) throw new Error("Camera stream not available");

    // ✅ Debug actual resolution
    const track = stream.getVideoTracks()[0];
    const settings = track.getSettings();
    console.table({
      label: track.label,
      resolution: `${settings.width}x${settings.height}`,
      frameRate: settings.frameRate,
      facingMode: settings.facingMode,
    });

    // STEP 1️⃣ — Open modal before attaching stream
    setIsCameraOpen(true);

    // STEP 2️⃣ — Wait for modal render then attach stream
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.setAttribute("autoplay", "true");
        videoRef.current.muted = true;
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => console.log("[Camera] Play error:", err));
        console.log("[Camera] Stream attached successfully with", settings.width, "x", settings.height);
      }
    }, 300);

  } catch (err: any) {
    console.error("[Camera] Access error:", err);
    if (err.name === "NotAllowedError") {
      setCameraError("Camera access denied. Please allow camera permission and retry.");
    } else if (window.location.protocol !== "https:") {
      setCameraError("Camera access requires HTTPS or localhost.");
    } else {
      setCameraError("Unable to access camera. Please check browser settings.");
    }
  }
};


  const handleCapturePhoto = async () => {
    if (!videoRef.current) return;

    const stream = videoRef.current.srcObject as MediaStream | null;
    const track = stream?.getVideoTracks?.()[0];
    if (track && "ImageCapture" in window) {
      try {
        // @ts-ignore
        const imageCapture = new ImageCapture(track);
        const blob = await imageCapture.takePhoto(); // often higher than preview res
        const file = new File([blob], "check-photo.jpg", { type: blob.type || "image/jpeg" });
        closeCameraAndScan(file);
        return;
      } catch (e) {
        console.warn("[Camera] takePhoto fell back to canvas:", e);
      }
    }

    // Fallback to canvas at video’s native resolution
    if (canvasRef.current && videoRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      const w = videoRef.current.videoWidth;
      const h = videoRef.current.videoHeight;
      canvasRef.current.width = w;
      canvasRef.current.height = h;
      ctx?.drawImage(videoRef.current, 0, 0, w, h);
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "check-photo.jpg", { type: "image/jpeg" });
          closeCameraAndScan(file);
        }
      }, "image/jpeg", 0.95);
    }
  };


  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };


  const handleCameraClose = () => {
    stopCamera();
    setIsCameraOpen(false);
    setCameraError(null);
  };

  const closeCameraAndScan = (file: File) => {
    stopCamera();
    setIsCameraOpen(false);
    onStartScan(file);
  };


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
            muted
            className="max-w-full max-h-full object-contain bg-black"
            onLoadedMetadata={() => {
              if (videoRef.current) {
                // ensure play after metadata is loaded
                videoRef.current.play().catch((err) => console.log("[v0] Play error on loadedmetadata:", err))
              }
            }}
          />

          <canvas ref={canvasRef} className="hidden" />

          {/* Keep only a subtle framing rectangle to avoid darkening the live preview */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="border-2 border-white/60 w-80 h-96 rounded-xl shadow-lg" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/20 to-transparent pt-8 pb-8 px-4 flex justify-center gap-6">
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
