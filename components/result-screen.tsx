"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, AlertCircle, XCircle, Download, Save, Edit2, AlertTriangle } from "lucide-react"
import { EditFieldsDialog } from "./edit-fields-dialog"
import { validateAllFields } from "@/lib/field-validator"

interface ScanResult {
  fields: {
    accountNumber: string
    accountHolderName: string
    checkDate: string
    checkPageNumber: string
    amountTaka: string
    checkCarrierName: string
    payeeName?: string
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

interface ResultScreenProps {
  result: ScanResult
  imageUrl?: string | null
  onBackToHome: () => void
  onEditFields: (fields: ScanResult["fields"]) => void
}

export function ResultScreen({ result, imageUrl, onBackToHome, onEditFields }: ResultScreenProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const fieldValidation = useMemo(() => validateAllFields(result.fields), [result.fields])
  const hasValidationErrors = Object.values(fieldValidation).some((v) => !v.isValid)
  const hasValidationWarnings = Object.values(fieldValidation).some((v) => v.warnings.length > 0)

  // display a random signature match percentage between 81 and 94 (inclusive)
  const displayedScorePercent = useMemo(() => Math.floor(Math.random() * (94 - 81 + 1)) + 81, [])

  // derive verdict from displayed score: 81-87 => VALID, 88-94 => APPROVE
  const displayedVerdict = useMemo(() => (displayedScorePercent <= 87 ? "VALID" : "APPROVE"), [displayedScorePercent])

  const getVerdictBadge = (verdict: string) => {
    const iconClass = "w-5 h-5"

    switch (verdict) {
      case "VALID":
        return (
          <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
            <CheckCircle className={iconClass} />
            VALID
          </div>
        )
      case "APPROVE":
        return (
          <div className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full font-semibold">
            <CheckCircle className={iconClass} />
            APPROVE
          </div>
        )
      case "REVIEW":
        return (
          <div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full font-semibold">
            <AlertCircle className={iconClass} />
            REVIEW
          </div>
        )
      case "REJECT":
        return (
          <div className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full font-semibold">
            <XCircle className={iconClass} />
            REJECT
          </div>
        )
      default:
        return null
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.85) return "bg-green-500"
    if (confidence >= 0.6) return "bg-amber-500"
    return "bg-red-500"
  }

  const downloadJSON = () => {
    const jsonData = JSON.stringify(
      {
        ...result,
        validation: fieldValidation,
        displayedScorePercent,
        displayedVerdict,
      },
      null,
      2,
    )
    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(jsonData))
    element.setAttribute("download", "check-scan-result.json")
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-background px-4 py-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Scan Complete</h1>
          <p className="text-muted-foreground">Review the extracted check details</p>
        </div>

        {/* Scanned Check Image Preview */}
        {imageUrl && (
          <Card className="p-0 overflow-hidden border border-gray-200">
            <img src={imageUrl || "/placeholder.svg"} alt="Scanned check" className="w-full h-40 object-cover" />
          </Card>
        )}

        {/* Verdict Card */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <div className="flex flex-col items-center gap-4">
            {getVerdictBadge(displayedVerdict)}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Signature Match Score</p>
              <p className="text-4xl font-bold text-foreground">{displayedScorePercent}%</p>
            </div>

            {/* Confidence Bar */}
            
          </div>
        </Card>

        

        {/* Extracted Fields (hardcoded for testing) */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Extracted Fields</h2>
            <Button size="sm" variant="ghost" onClick={() => setIsEditDialogOpen(true)} className="gap-1">
              <Edit2 className="w-4 h-4" />
              Edit
            </Button>
          </div>

          <div className="space-y-3">
            {/* Hardcoded editable fields as requested */}
            <div className="py-2">
              <label className="text-sm text-muted-foreground">Pay to</label>
              <input
                className="mt-1 w-full border border-gray-200 rounded px-3 py-2 text-foreground"
                defaultValue="Rodushi Rahman"
                aria-label="Pay to"
              />
            </div>

            <div className="py-2">
              <label className="text-sm text-muted-foreground">Date</label>
              <div className="flex items-center gap-2">
                <input
                  className="mt-1 w-full border border-red-300 bg-red-50 rounded px-3 py-2 text-foreground"
                  defaultValue="25/12/2026"
                  aria-label="Check date"
                />
                <div className="text-red-600 text-sm font-semibold">⚠️</div>
              </div>
              <div className="text-red-600 text-sm mt-2">Warning: Doesn't Match with Today's Date</div>
            </div>

            <div className="py-2">
              <label className="text-sm text-muted-foreground">Amount in Words</label>
              <input
                className="mt-1 w-full border border-gray-200 rounded px-3 py-2 text-foreground"
                defaultValue="Fifty Thousand Taka Only"
                aria-label="Amount in words"
              />
            </div>

            <div className="py-2">
              <label className="text-sm text-muted-foreground">Amount</label>
              <input
                className="mt-1 w-full border border-gray-200 rounded px-3 py-2 text-foreground"
                defaultValue="50,000"
                aria-label="Amount"
              />
            </div>

            {/* Commenting out the rest of the original/auto-extracted fields for now
            <div className="space-y-3">
              <FieldRow
                label="Account Number"
                value={result.fields.accountNumber}
              />
              <FieldRow
                label="Account Holder"
                value={result.fields.accountHolderName}
              />
              <FieldRow label="Check Date" value={result.fields.checkDate} />
              <FieldRow
                label="Page Number"
                value={result.fields.checkPageNumber}
              />
              <FieldRow label="Amount (Taka)" value={result.fields.amountTaka} />
              <FieldRow
                label="Check Carrier"
                value={result.fields.payeeName}
              />
            </div>
            */}
          </div>
        </Card>

       

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button size="lg" className="w-full h-12 gap-2" onClick={downloadJSON}>
            
            Continue to Transaction
          </Button>

          

          <Button size="lg" variant="ghost" className="w-full h-12" onClick={onBackToHome}>
            Try Again
          </Button>

          <Button
            size="lg"
            className="w-full h-12 bg-blue-800 text-white hover:bg-blue-700"
            onClick={() => {
              const url = 'https://v0-scan-swift-ai-demo-website.vercel.app/'
              const w = window.open(url, '_blank')
              if (w) w.opener = null
            }}
          >
            Dashboard
          </Button>
        </div>
      </div>

      <EditFieldsDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        fields={result.fields}
        onSave={(fields: any) => onEditFields(fields)}
      />
    </div>
  )
}

function FieldRow({
  label,
  value,
  validation,
}: {
  label: string
  value: string
  validation?: { isValid: boolean; errors: string[]; warnings: string[] }
}) {
  const isInvalid = validation && !validation.isValid
  const hasWarnings = validation && validation.warnings.length > 0

  return (
    <div className={`py-2 border-b border-gray-100 ${isInvalid ? "bg-red-50 px-2 rounded" : ""}`}>
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{value || "—"}</span>
          {isInvalid && <AlertCircle className="w-4 h-4 text-red-500" />}
          {!isInvalid && hasWarnings && <AlertTriangle className="w-4 h-4 text-amber-500" />}
        </div>
      </div>
    </div>
  )
}
